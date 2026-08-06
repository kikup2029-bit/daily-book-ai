import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Search, SearchX, X } from "lucide-react";

import { searchHelp } from "@/lib/help-content";
import { Input } from "@/components/ui/input";
import { Alert, PageHeader } from "@/components/ui/kit";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({
    meta: [
      { title: "Help — SimpleBooks AI" },
      {
        name: "description",
        content: "How every part of SimpleBooks AI works, with steps for each feature.",
      },
    ],
  }),
  // The nav's Help sub-items land here with ?group=… or ?topic=…
  validateSearch: (search: Record<string, unknown>) => ({
    group: typeof search.group === "string" ? search.group : undefined,
    topic: typeof search.topic === "string" ? search.topic : undefined,
  }),
  component: HelpPage,
});

function HelpPage() {
  const { group, topic } = useSearch({ from: "/_authenticated/help" });
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string[]>(topic ? [topic] : []);
  const topicRef = useRef<HTMLDivElement | null>(null);

  const groups = useMemo(() => {
    const found = searchHelp(query);
    // A ?group=… link narrows to that section, unless you're searching.
    if (!query && group) return found.filter((g) => g.id === group);
    return found;
  }, [query, group]);

  // Open and scroll to a topic that was linked directly.
  useEffect(() => {
    if (!topic) return;
    setOpen((current) => (current.includes(topic) ? current : [...current, topic]));
    const timer = window.setTimeout(() => {
      topicRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [topic]);

  // While searching, show everything expanded — hunting through collapsed
  // results defeats the point of searching.
  const searching = query.trim().length > 0;
  const isOpen = (id: string) => searching || open.includes(id);
  const toggle = (id: string) =>
    setOpen((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );

  const total = groups.reduce((sum, g) => sum + g.topics.length, 0);

  return (
    <div className="rise mx-auto w-full max-w-3xl">
      <section className="pb-6">
        <PageHeader
          eyebrow="Help"
          title="How everything works"
          description="Every feature, what it's for, and how to use it. Search, or pick a section from the Help menu."
        />

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help — try “receipt”, “split”, “tax”…"
            className="h-12 rounded-[var(--radius-12)] pl-10 pr-11 md:h-12 md:text-base"
            aria-label="Search help"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-[var(--radius-10)] text-muted-foreground transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent hover:text-foreground"
              aria-label="Clear help search"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {searching && total > 0 ? (
          <p className="mt-3 text-[13px] text-muted-foreground">
            <span className="num font-medium text-foreground">{total}</span>{" "}
            {total === 1 ? "topic matches" : "topics match"} “{query}”.
          </p>
        ) : null}

        {group && !searching ? (
          <div className="mt-4">
            <Alert
              title="Showing one section"
              action={
                <Link
                  to="/help"
                  className="inline-flex h-10 items-center rounded-[var(--radius-10)] px-3 text-[13px] font-semibold text-brand transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent"
                >
                  Show everything
                </Link>
              }
            >
              You followed a link to one part of the guide.
            </Alert>
          </div>
        ) : null}
      </section>

      {searching && total === 0 ? (
        <div className="panel flex flex-col items-center px-5 py-12 text-center">
          <span
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-muted-foreground"
          >
            <SearchX className="size-5" />
          </span>
          <p className="mt-4 text-[15px] font-semibold">Nothing matches “{query}”</p>
          <p className="mt-1.5 max-w-xs text-balance text-[13px] leading-relaxed text-muted-foreground">
            Try a simpler word — “tax”, “receipt”, “export”.
          </p>
        </div>
      ) : null}

      <div className="space-y-6">
        {groups.map((helpGroup) => (
          <section key={helpGroup.id}>
            <div className="flex items-center gap-3 pb-2">
              <p className="eyebrow shrink-0">{helpGroup.label}</p>
              <span aria-hidden="true" className="h-px flex-1 bg-border" />
            </div>

            <div className="panel divide-hairline overflow-hidden">
              {helpGroup.topics.map((helpTopic) => {
                const expanded = isOpen(helpTopic.id);
                return (
                  <div
                    key={helpTopic.id}
                    ref={helpTopic.id === topic ? topicRef : undefined}
                    className={expanded ? "bg-surface-2/40" : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(helpTopic.id)}
                      aria-expanded={expanded}
                      className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent sm:px-5"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] font-semibold leading-snug">
                          {helpTopic.title}
                        </span>
                        <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">
                          {helpTopic.summary}
                        </span>
                      </span>
                      <ChevronDown
                        aria-hidden="true"
                        className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-[var(--dur-fast)] ease-[var(--ease)] ${
                          expanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expanded ? (
                      <div className="border-t border-border px-4 py-5 sm:px-5">
                        <p className="eyebrow">Where to find it</p>
                        <p className="mt-1.5 text-sm leading-relaxed">{helpTopic.where}</p>

                        {helpTopic.steps ? (
                          <>
                            <p className="eyebrow mt-6">How to use it</p>
                            <ol className="mt-2.5 space-y-2.5 text-sm leading-relaxed">
                              {helpTopic.steps.map((step, index) => (
                                <li key={index} className="flex gap-3">
                                  <span
                                    aria-hidden="true"
                                    className="num mt-px flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[11px] font-semibold text-foreground"
                                  >
                                    {index + 1}
                                  </span>
                                  <span className="min-w-0">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </>
                        ) : null}

                        {helpTopic.notes ? (
                          <>
                            <p className="eyebrow mt-6">Worth knowing</p>
                            <ul className="mt-2.5 space-y-2.5 text-sm leading-relaxed">
                              {helpTopic.notes.map((note, index) => (
                                <li key={index} className="flex gap-3">
                                  <span
                                    aria-hidden="true"
                                    className="mt-2 size-1.5 shrink-0 rounded-full bg-border-strong"
                                  />
                                  <span className="min-w-0 text-muted-foreground">{note}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}

                        {helpTopic.to ? (
                          <Link
                            to={helpTopic.to}
                            className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-[var(--radius-10)] border border-border-strong px-3.5 text-[13px] font-semibold transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:bg-accent"
                          >
                            Open it <ExternalLink className="size-3.5" aria-hidden="true" />
                          </Link>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-10 border-t pt-8">
        <p className="eyebrow">Still stuck?</p>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Try asking in your own words on{" "}
          <Link
            to="/ask"
            className="font-medium text-brand underline underline-offset-4 transition-colors duration-[var(--dur-fast)] ease-[var(--ease)] hover:text-brand-hover"
          >
            Ask about your money
          </Link>{" "}
          — it answers questions about your own figures. For anything about tax or legal matters,
          check with an accountant rather than relying on the app.
        </p>
      </section>
    </div>
  );
}
