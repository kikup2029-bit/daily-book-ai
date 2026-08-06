import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Lock, NotebookPen } from "lucide-react";

import { getSettings, unlockApp } from "@/lib/shop.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, Field, Panel, PanelBody, PanelHeader } from "@/components/ui/kit";

const UNLOCKED_KEY = "simplebooks.unlockedAt";

/**
 * Screen lock for the app.
 *
 * What it does: hides your books behind a PIN when you come back to the app,
 * so someone holding your unlocked phone can't just read them.
 *
 * What it isn't: extra protection on the account itself. Your data is already
 * restricted to your login at the database level. This is a convenience lock
 * on top of that.
 */
export function LockGate({ children }: { children: React.ReactNode }) {
  const fetchSettings = useServerFn(getSettings);
  const runUnlock = useServerFn(unlockApp);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => fetchSettings(),
  });

  const [locked, setLocked] = useState<boolean | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const timeoutMinutes = settings?.lock_timeout_minutes ?? 5;
  const lockEnabled = Boolean(settings?.lock_enabled);

  const markUnlocked = useCallback(() => {
    try {
      sessionStorage.setItem(UNLOCKED_KEY, String(Date.now()));
    } catch {
      // Private browsing can block storage; the lock still works per page load.
    }
    setLocked(false);
  }, []);

  // Decide whether to lock, once we know the settings.
  useEffect(() => {
    if (isLoading) return;
    if (!lockEnabled) {
      setLocked(false);
      return;
    }

    let unlockedAt = 0;
    try {
      unlockedAt = Number(sessionStorage.getItem(UNLOCKED_KEY) ?? 0);
    } catch {
      unlockedAt = 0;
    }

    // A timeout of 0 means "lock every time the app is opened".
    const stillValid =
      timeoutMinutes > 0 && unlockedAt > 0 && Date.now() - unlockedAt < timeoutMinutes * 60_000;

    setLocked(!stillValid);
  }, [isLoading, lockEnabled, timeoutMinutes]);

  // Re-lock after the app has been in the background past the timeout.
  useEffect(() => {
    if (!lockEnabled || timeoutMinutes <= 0) return;

    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      let unlockedAt = 0;
      try {
        unlockedAt = Number(sessionStorage.getItem(UNLOCKED_KEY) ?? 0);
      } catch {
        unlockedAt = 0;
      }
      if (!unlockedAt || Date.now() - unlockedAt >= timeoutMinutes * 60_000) {
        setLocked(true);
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [lockEnabled, timeoutMinutes]);

  useEffect(() => {
    if (locked) inputRef.current?.focus();
  }, [locked]);

  const unlock = useMutation({
    mutationFn: (value: string) => runUnlock({ data: { pin: value } }),
    onSuccess: (result) => {
      if (result.ok) {
        setPin("");
        setError(null);
        setAttempts(0);
        markUnlocked();
      } else {
        setAttempts((n) => n + 1);
        setPin("");
        setError("That PIN didn't match.");
      }
    },
    onError: () => setError("Couldn't check that just now. Try again."),
  });

  if (isLoading || locked === null) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-3 px-4"
        aria-busy="true"
      >
        <span className="skeleton size-11 rounded-[var(--radius-14)]" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Getting your books ready…</p>
      </div>
    );
  }

  if (!locked) return <>{children}</>;

  // Slow down repeated guesses a little after several misses.
  const throttled = attempts >= 5;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-10">
      <div className="rise">
        {/* who you are, and why you're looking at this screen */}
        <div className="mb-6 flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[var(--radius-14)] bg-brand text-brand-foreground shadow-[var(--shadow-sm)]">
            <NotebookPen className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="eyebrow">SimpleBooks AI</p>
            <h1 className="mt-0.5 truncate text-[22px] leading-tight">Locked</h1>
          </div>
        </div>

        <Panel className="shadow-[var(--shadow-md)]">
          <PanelHeader
            title={
              <span className="flex items-center gap-2">
                <Lock className="size-4 text-brand" aria-hidden="true" />
                Enter your PIN
              </span>
            }
            description="Your books stay hidden until you unlock them on this device."
          />

          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!pin || unlock.isPending || throttled) return;
              unlock.mutate(pin);
            }}
          >
            <PanelBody className="space-y-4">
              <Field
                id="unlock-pin"
                label="PIN"
                hint="4 to 8 numbers."
                error={error}
                className="space-y-2"
              >
                <Input
                  ref={inputRef}
                  type="password"
                  inputMode="numeric"
                  autoComplete="off"
                  pattern="\d*"
                  maxLength={8}
                  placeholder="••••"
                  value={pin}
                  invalid={Boolean(error)}
                  onChange={(event) => {
                    setPin(event.target.value.replace(/\D/g, ""));
                    setError(null);
                  }}
                  className="num h-14 text-center text-2xl tracking-[0.45em] md:h-14 md:text-2xl"
                />
              </Field>

              {throttled ? (
                <Alert tone="negative" title="Too many tries">
                  Sign out and back in if you&apos;ve forgotten your PIN.
                </Alert>
              ) : null}

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="h-12 w-full text-base"
                loading={unlock.isPending}
                disabled={pin.length < 4 || unlock.isPending || throttled}
              >
                {unlock.isPending ? "Checking…" : "Unlock"}
              </Button>
            </PanelBody>
          </form>
        </Panel>

        <p className="mt-4 px-1 text-[12px] leading-relaxed text-muted-foreground">
          Forgotten it? Sign out and sign back in with your email and password, then set a new PIN
          under Tools.
        </p>
      </div>
    </main>
  );
}
