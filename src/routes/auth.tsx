import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Eye, EyeOff, Lock, ShieldCheck, Wifi } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Field } from "@/components/ui/kit";
import { BrandMark } from "@/components/brand-mark";
import { confirmNewSignup } from "@/lib/auth.functions";

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

/** Caught before the request goes out, so the reply is instant. */
function checkForm(email: string, password: string, mode: "signin" | "signup") {
  const problems: { email?: string; password?: string } = {};
  if (!email.trim()) problems.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    problems.email = "That doesn't look like an email address.";

  if (!password) problems.password = "Enter your password.";
  else if (mode === "signup" && password.length < 6)
    problems.password = "Use at least 6 characters.";

  return problems;
}

function AuthPage() {
  const navigate = useNavigate();
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
            setNotice("Almost there — check your email to confirm your account, then sign in.");
          }
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
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
          <h2 className="text-[34px] leading-[1.15] tracking-[-0.025em]">
            Your books, done in the time it takes to serve one customer.
          </h2>
          <ul className="mt-8 space-y-4">
            {[
              {
                icon: <Check className="size-4" />,
                title: "Log it in seconds",
                body: "Type “spent 20 at costco on supplies” and it fills itself in.",
              },
              {
                icon: <Wifi className="size-4" />,
                title: "Works with no signal",
                body: "Keep logging in a basement or a market. It syncs when you're back.",
              },
              {
                icon: <ShieldCheck className="size-4" />,
                title: "Private to you",
                body: "Access is enforced by the database, not just the app.",
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

        <p className="relative text-[13px] text-muted-foreground">
          Free to use. No card, no trial, no ads.
        </p>
      </aside>

      {/* ---------- the form ---------- */}
      <main className="flex items-center justify-center px-5 py-12 sm:px-8">
        <div className="rise w-full max-w-[380px]">
          {/* The mark repeats here on small screens, where the panel is hidden. */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <BrandMark size={38} />
            <span className="font-display text-[17px] font-semibold tracking-[-0.02em]">
              SimpleBooks
            </span>
          </div>

          <h1 className="text-[26px] leading-tight">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in to pick up where you left off."
              : "Takes about twenty seconds. Your books stay private to you."}
          </p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4" noValidate>
            <Field id="email" label="Email" error={fieldErrors.email}>
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                autoFocus
                placeholder="you@yourbusiness.com"
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
              label="Password"
              error={fieldErrors.password}
              hint={mode === "signup" ? "At least 6 characters." : undefined}
            >
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  placeholder={mode === "signup" ? "Choose a password" : "Your password"}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                  ? "Signing in…"
                  : "Creating account…"
                : mode === "signin"
                  ? "Sign in"
                  : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to SimpleBooks?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={switchMode}
              className="font-semibold text-brand underline-offset-4 hover:underline"
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>

          <p className="mt-8 flex items-center justify-center gap-1.5 text-[12px] text-muted-foreground">
            <Lock className="size-3" aria-hidden="true" />
            Your entries are private to your account.
          </p>
        </div>
      </main>
    </div>
  );
}
