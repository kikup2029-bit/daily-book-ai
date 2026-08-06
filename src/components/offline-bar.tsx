import { useEffect, useState } from "react";
import { CloudOff, Download, RefreshCw, Trash2, TriangleAlert, X } from "lucide-react";

import { describe } from "@/lib/offline-queue";
import { useOfflineEntries } from "@/lib/use-offline";

/**
 * The one place the app admits it's offline.
 *
 * It stays quiet when there's nothing to say: no bar when you're online with an
 * empty queue.
 */
export function OfflineBar({ userId }: { userId: string | null | undefined }) {
  const { online, waiting, stuck, items, syncing, sync, discard, retryAll } =
    useOfflineEntries(userId);
  const [showList, setShowList] = useState(false);

  const nothingToSay = online && waiting === 0 && stuck === 0;
  if (nothingToSay) return null;

  const waitingItems = items.filter((item) => !item.stuck);
  const stuckItems = items.filter((item) => item.stuck);

  // A calm strip, not an alarm: amber while there's no signal, plain surface
  // while things are on their way out, and red only for entries that failed.
  const stripTone = stuck > 0 ? "bg-danger-soft" : !online ? "bg-warning-soft" : "bg-surface-2";

  const linkClass =
    "inline-flex h-8 shrink-0 items-center rounded-[var(--radius-8)] px-2 text-[12px] font-medium " +
    "transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-foreground/10";

  return (
    <div className={`border-b ${stripTone}`}>
      <div className="mx-auto w-full max-w-4xl px-4 py-2 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px]">
          {!online ? (
            <>
              <CloudOff className="size-4 shrink-0 text-warning" aria-hidden="true" />
              <span className="font-semibold">No connection</span>
              <span className="min-w-0 text-muted-foreground">
                You can keep logging — entries are saved on this device.
              </span>
            </>
          ) : null}

          {online && waiting > 0 ? (
            <>
              <RefreshCw
                className={`size-4 shrink-0 text-muted-foreground ${syncing ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span className="font-semibold">
                {syncing ? "Sending" : "Waiting to send"} <span className="num">{waiting}</span>{" "}
                {waiting === 1 ? "entry" : "entries"}
              </span>
            </>
          ) : null}

          {!online && waiting > 0 ? (
            <span className="text-muted-foreground">
              · <span className="num">{waiting}</span> {waiting === 1 ? "entry" : "entries"} waiting
            </span>
          ) : null}

          {stuck > 0 ? (
            <span className="flex items-center gap-1.5 text-danger">
              <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
              <span className="font-semibold">
                <span className="num">{stuck}</span> {stuck === 1 ? "entry" : "entries"}{" "}
                wouldn&apos;t save
              </span>
            </span>
          ) : null}

          {items.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowList((current) => !current)}
              aria-expanded={showList}
              className={`${linkClass} ml-auto text-muted-foreground hover:text-foreground`}
            >
              {showList ? "Hide" : "Show"} them
            </button>
          ) : null}

          {online && waiting > 0 && !syncing ? (
            <button
              type="button"
              onClick={() => void sync()}
              className={`${linkClass} font-semibold text-brand`}
            >
              Send now
            </button>
          ) : null}
        </div>

        {showList && items.length > 0 ? (
          <div className="pop mt-2 space-y-1.5 border-t border-border pt-2.5">
            {waitingItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 text-[12px]">
                <span className="min-w-0 flex-1 text-muted-foreground">{describe(item)}</span>
                <span className="shrink-0 text-muted-foreground">waiting</span>
              </div>
            ))}

            {stuckItems.length > 0 ? (
              <div className="mt-2 rounded-[var(--radius-10)] bg-danger-soft px-3 py-2.5">
                <p className="text-[12px] leading-relaxed text-danger">
                  These were refused <span className="num">{stuckItems[0].attempts}</span> times.
                  Usually that means the app was updated or you were signed out — try again, and
                  only discard one if you&apos;ve already entered it another way.
                </p>
                {stuckItems.map((item) => (
                  <div key={item.id} className="mt-2 flex items-start gap-2 text-[12px]">
                    <span className="min-w-0 flex-1">
                      {describe(item)}
                      {item.last_error ? (
                        <span className="block text-muted-foreground">{item.last_error}</span>
                      ) : null}
                    </span>
                    <button
                      type="button"
                      onClick={() => discard(item.id)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-8)] text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-foreground/10 hover:text-danger"
                      aria-label="Discard this entry"
                      title="Discard this entry"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={retryAll}
                  className={`${linkClass} mt-1.5 -ml-2 font-semibold text-danger`}
                >
                  Try these again
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

type InstallEvent = Event & { prompt: () => Promise<void> };

const DISMISSED_KEY = "simplebooks.install-dismissed";

/**
 * Offers to install the app. Chrome and Android give us a real prompt; iOS
 * doesn't, so there we explain the two taps instead of pretending.
 */
export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISSED_KEY) === "1") return;
    } catch {
      // Can't read the choice — better to stay quiet than nag.
      return;
    }

    // Already installed: nothing to offer.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    setDismissed(false);

    const onPrompt = (browserEvent: Event) => {
      browserEvent.preventDefault();
      setEvent(browserEvent as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    // iPhone and iPad never fire that event, so detect and explain manually.
    const ua = navigator.userAgent;
    const isIos =
      /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (isIos && /Safari/.test(ua)) setIosHint(true);

    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const hide = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Not remembering means it may ask again. Acceptable.
    }
    setDismissed(true);
  };

  if (dismissed) return null;
  if (!event && !iosHint) return null;

  return (
    <section className="panel mb-8 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-soft text-brand"
        >
          <Download className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Put SimpleBooks on your home screen</p>
          {event ? (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Opens full screen with its own icon, and keeps working when you&apos;ve got no signal.
            </p>
          ) : (
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              Tap the Share button in Safari, then{" "}
              <span className="font-semibold text-foreground">Add to Home Screen</span>. It then
              opens full screen and keeps working with no signal.
            </p>
          )}
          {event ? (
            <button
              type="button"
              onClick={async () => {
                await event.prompt();
                hide();
              }}
              className="mt-4 inline-flex h-10 items-center rounded-[var(--radius-10)] bg-brand px-4 text-sm font-medium text-brand-foreground shadow-[var(--shadow-sm)] transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-brand-hover"
            >
              Install
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={hide}
          className="-mr-1 -mt-1 flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-10)] text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
