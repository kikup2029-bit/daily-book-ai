/**
 * Changing the language.
 *
 * Every option is written in its own script, never translated into English.
 * Someone looking for Gujarati is looking for "ગુજરાતી" — a list that says
 * "Gujarati" in Latin letters is useless to the person who most needs it.
 */

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Languages } from "lucide-react";

import { LOCALES, LOCALE_LIST, useI18n, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={t("common.changeLanguage")}
          title={t("common.changeLanguage")}
          className={cn(
            "flex items-center gap-1.5 rounded-[var(--radius-8)] text-muted-foreground",
            "transition-colors duration-[var(--dur-fast)] hover:bg-accent hover:text-foreground",
            compact ? "size-9 justify-center" : "h-9 px-2.5",
          )}
        >
          <Languages className="size-4 shrink-0" aria-hidden="true" />
          {!compact ? (
            <span className="text-[13px] font-medium">{LOCALES[locale].native}</span>
          ) : null}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="floating pop z-[60] min-w-[12rem] p-1.5"
        >
          <DropdownMenu.Label className="eyebrow px-2.5 pb-1.5 pt-1">
            {t("common.language")}
          </DropdownMenu.Label>

          {LOCALE_LIST.map((code) => {
            const meta = LOCALES[code];
            const selected = code === locale;
            return (
              <DropdownMenu.Item
                key={code}
                onSelect={() => setLocale(code as Locale)}
                // Each row renders in its own script and direction, so the
                // Urdu option reads correctly even while the app is in English.
                lang={code}
                dir={meta.dir}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-[var(--radius-8)]",
                  "px-2.5 py-2 text-[13px] outline-none data-[highlighted]:bg-accent",
                  selected && "bg-brand-soft font-medium",
                )}
              >
                <span className="flex flex-col">
                  <span className="text-[14px] leading-tight">{meta.native}</span>
                  {meta.native !== meta.label ? (
                    <span className="text-[11px] text-muted-foreground" dir="ltr">
                      {meta.label}
                    </span>
                  ) : null}
                </span>
                {selected ? (
                  <Check className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
                ) : null}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
