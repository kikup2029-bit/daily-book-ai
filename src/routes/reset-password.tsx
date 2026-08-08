/**
 * Where the "forgot password" email lands.
 *
 * HOW THIS ACTUALLY WORKS, because it isn't obvious:
 *
 * The link in the email carries a one-time token. Supabase's client picks it
 * up out of the URL and exchanges it for a real, signed-in session before this
 * component ever renders. So by the time someone is looking at this form they
 * are already authenticated — the only thing left to do is set a new password
 * on the session that already exists.
 *
 * That has one consequence worth stating plainly: reaching this page IS the
 * proof of identity. Anyone holding that emailed link can change the password.
 * It's why the link expires, why it's single-use, and why we don't ask for the
 * old password here — the person using this page is, by definition, someone
 * who couldn't remember it.
 *
 * The failure worth designing for is arriving WITHOUT a valid session: an
 * expired link, a link opened twice, or a link opened in a different browser
 * than the one that requested it. That has to say so plainly and offer a way
 * to get a fresh one, because otherwise it looks like the password change
 * silently failed.
 */

import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, KeyRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Field, Panel, PanelBody } from "@/components/ui/kit";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  // Client-only: the recovery token lives in the URL fragment, which never
  // reaches the server, so there is nothing to render on the server anyway.
  ssr: false,
  head: () => ({
    meta: [{ title: "Set a new password — SimpleBooks" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

/** Matches the sign-up rule, so a reset can't set a weaker password than signup allows. */
const MIN_LENGTH = 6;

function ResetPasswordPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  /** null while we're still finding out whether the link was any good. */
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  /*
   * Supabase parses the recovery token from the URL asynchronously, so the
   * session may not exist on the first tick. Listening for PASSWORD_RECOVERY
   * as well as reading the current session covers both orderings — checking
   * once on mount would race the parse and report a good link as expired.
   */
  useEffect(() => {
    let cancelled = false;

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || session) setHasSession(true);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      if (data.session) setHasSession(true);
      // Give the token parse a moment before calling the link dead.
      else setTimeout(() => !cancelled && setHasSession((current) => current ?? false), 1200);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    if (password.length < MIN_LENGTH) {
      setFieldError("auth.errPasswordShort");
      return;
    }
    if (password !== confirm) {
      setFieldError("auth.errPasswordMismatch");
      return;
    }

    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setDone(true);
      // Straight in. They've just proved they own the address and set a
      // password — making them type it again immediately would be pointless.
      setTimeout(() => navigate({ to: "/dashboard" }), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.errGeneric"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="screen-y relative flex min-h-screen items-center justify-center px-5 sm:px-8">
      <div className="top-corner-safe absolute end-3 sm:end-5">
        <LanguageSwitcher />
      </div>

      <div className="rise w-full max-w-[380px]">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark size={38} />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            SimpleBooks
          </span>
        </div>

        <Panel>
          <PanelBody className="space-y-5 pt-5">
            <div>
              <span
                aria-hidden="true"
                className="mb-4 flex size-11 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
              >
                <KeyRound className="size-5" />
              </span>
              <h1 className="font-display text-[22px] leading-tight tracking-[-0.01em]">
                {t("auth.newPasswordTitle")}
              </h1>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                {t("auth.newPasswordBlurb")}
              </p>
            </div>

            {hasSession === false ? (
              <>
                <Alert tone="negative" title={t("auth.linkExpiredTitle")}>
                  {t("auth.linkExpiredBody")}
                </Alert>
                <Button asChild variant="brand" size="lg" className="w-full">
                  <Link to="/auth">{t("auth.backToSignIn")}</Link>
                </Button>
              </>
            ) : null}

            {hasSession === null ? (
              <span className="skeleton block h-10 w-full" aria-hidden="true" />
            ) : null}

            {hasSession === true && !done ? (
              <form onSubmit={submit} className="space-y-4" noValidate>
                <Field
                  id="new-password"
                  label={t("auth.newPassword")}
                  hint={t("auth.passwordHint")}
                  error={fieldError ? t(fieldError) : undefined}
                >
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      autoFocus
                      className="pr-11"
                      value={password}
                      invalid={Boolean(fieldError)}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setFieldError(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                      aria-pressed={showPassword}
                      className="absolute right-1 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-[var(--radius-8)] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>

                {/* Typed twice, because a typo here locks you out of your own
                    books with no way back except doing all of this again. */}
                <Field id="confirm-password" label={t("auth.confirmPassword")}>
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirm}
                    invalid={Boolean(fieldError)}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      setFieldError(null);
                    }}
                  />
                </Field>

                {error ? <Alert tone="negative">{error}</Alert> : null}

                <Button type="submit" variant="brand" size="lg" className="w-full" loading={busy}>
                  {busy ? t("auth.savingPassword") : t("auth.savePassword")}
                </Button>
              </form>
            ) : null}

            {done ? <Alert tone="positive">{t("auth.passwordChanged")}</Alert> : null}
          </PanelBody>
        </Panel>
      </div>
    </main>
  );
}
