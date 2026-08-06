import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Lock, ShieldCheck, Wifi } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Field } from "@/components/ui/kit";
import { BrandMark } from "@/components/brand-mark";
import { LanguageSwitcher } from "@/components/language-switcher";
import { confirmNewSignup } from "@/lib/auth.functions";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — SimpleBooks" },
      {
        name: "description",
        content:
          "Sign in or create a free SimpleBooks account to keep your daily bookkeeping private.",
      },
      { property: "og:title", content: "Sign in — SimpleBooks" },
      {
        property: "og:description",
        content: "Sign in to log your daily money in and out, and keep your books private.",
      },
    ],
  }),
  component: AuthPage,
});

/**
 * Caught before the request goes out, so the reply is instant.
 *
 * It hands back translation keys rather than sentences: the message is looked
 * up at render time, so switching language while an error is on screen
 * re-reads it in the new language instead of leaving English behind.
 */
function checkForm(email: string, password: string, mode: "signin" | "signup") {
  const problems: { email?: string; password?: string } = {};
  if (!email.trim()) problems.email = "auth.errEmailMissing";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    problems.email = "auth.errEmailInvalid";

  if (!password) problems.password = "auth.errPasswordMissing";
  else if (mode === "signup" && password.length < 6) problems.password = "auth.errPasswordShort";

  return problems;
}

function AuthPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const problems = checkForm(email, password, mode);
    setFieldErrors(problems);
    if (Object.keys(problems).length > 0) return;

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (signUpError) throw signUpError;

        if (!data.session && data.user) {
          // Project may still require email confirmation. Try a best-effort
          // auto-confirm (only works once SUPABASE_SERVICE_ROLE_KEY is set
          // server-side); if that's not configured, fall back to the normal
          // "check your email" flow.
          const result = await confirmNewSignup({ data: { userId: data.user.id } });
          if (result.confirmed) {
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (signInError) throw signInError;
          } else {
            setNotice(t("auth.confirmEmail"));
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      // Supabase's own message is passed through as it arrives — it's the only
      // thing that says *what* failed, and it isn't ours to translate.
      setError(err instanceof Error ? err.message : t("auth.errGeneric"));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError(null);
    setNotice(null);
    setFieldErrors({});
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
      {/* ---------- product panel, wide screens only ---------- */}
      <aside className="relative hidden overflow-hidden border-r bg-surface-1 p-12 lg:flex lg:flex-col lg:justify-between">
        {/* A single soft wash of brand colour. Enough to feel considered,
            not so much that it becomes the generic AI gradient. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 -top-32 size-[520px] rounded-full opacity-[0.18] blur-3xl"
          style={{ background: "radial-gradient(circle, var(--brand), transparent 68%)" }}
        />

        <div className="relative flex items-center gap-3">
          <BrandMark size={38} />
          <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
            SimpleBooks
          </span>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[34px] leading-[1.15] tracking-[-0.025em]">{t("auth.heroTitle")}</h2>
          <ul className="mt-8 space-y-4">
            {[
              {
                icon: <Check className="size-4" />,
                title: t("auth.sellingFast"),
                // The example inside this blurb stays English wherever it's
                // translated: the parser only understands English input.
                body: t("auth.sellingFastBody"),
              },
              {
                icon: <Wifi className="size-4" />,
                title: t("auth.sellingOffline"),
                body: t("auth.sellingOfflineBody"),
              },
              {
                icon: <ShieldCheck className="size-4" />,
                title: t("auth.sellingPrivate"),
                body: t("auth.sellingPrivateBody"),
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-8)] bg-brand-soft text-brand">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-[13px] text-muted-foreground">
                    {item.body}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[13px] text-muted-foreground">{t("auth.freeNote")}</p>
      </aside>

      {/* ---------- the form ---------- */}
      <main className="relative flex items-center justify-center px-5 py-12 sm:px-8">
        {/*
          The one screen where the language picker has to exist outside the app
          shell: someone who can't read English needs to change it *before* they
          have an account to sign into. Tucked into the corner so it's findable
          without competing with the form.
        */}
        <div className="absolute end-3 top-3 sm:end-5 sm:top-5">
          <LanguageSwitcher />
        </div>

        <div className="rise w-full max-w-[380px]">
          {/* The mark repeats here on small screens, where the panel is hidden. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark size={38} />
            <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
              SimpleBooks
            </span>
          </div>

          <h1 className="text-[26px] leading-tight">
            {mode === "signin" ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin" ? t("auth.signInBlurb") : t("auth.signUpBlurb")}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <Field
              id="email"
              label={t("auth.email")}
              error={fieldErrors.email ? t(fieldErrors.email) : undefined}
            >
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder={t("auth.emailPlaceholder")}
                value={email}
                invalid={Boolean(fieldErrors.email)}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                }}
              />
            </Field>

            <Field
              id="password"
              label={t("auth.password")}
              error={fieldErrors.password ? t(fieldErrors.password) : undefined}
              hint={mode === "signup" ? t("auth.passwordHint") : undefined}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder={
                    mode === "signup"
                      ? t("auth.passwordPlaceholderNew")
                      : t("auth.passwordPlaceholderExisting")
                  }
                  className="pr-11"
                  value={password}
                  invalid={Boolean(fieldErrors.password)}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (fieldErrors.password)
                      setFieldErrors((f) => ({ ...f, password: undefined }));
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

            {error ? <Alert tone="negative">{error}</Alert> : null}
            {notice ? <Alert tone="positive">{notice}</Alert> : null}

            <Button type="submit" variant="brand" size="lg" className="w-full" loading={busy}>
              {busy
                ? mode === "signin"
                  ? t("auth.signingIn")
                  : t("auth.creating")
                : mode === "signin"
                  ? t("auth.signIn")
                  : t("auth.createOne")}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? t("auth.newHere") : t("auth.haveAccount")}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              {mode === "signin" ? t("auth.createOne") : t("auth.signIn")}
            </button>
          </p>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            {t("auth.privateNote")}
          </p>
        </div>
      </main>
    </div>
  );
}
