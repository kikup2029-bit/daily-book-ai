import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, Search } from "lucide-react";

import { searchHelp } from "@/lib/help-content";
import { Input } from "@/components/ui/input";

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
      <section className="pb-8">
        <p className="eyebrow">Help</p>
        <h1 className="mt-3 text-3xl">How everything works</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Every feature, what it&apos;s for, and how to use it. Search, or pick a section from the
          Help menu.
        </p>

        <div className="mt-6 flex items-center gap-3 border-b pb-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help — try “receipt”, “split”, “tax”…"
            className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
            aria-label="Search help"
          />
        </div>

        {searching ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {total === 0
              ? "Nothing matches that. Try a simpler word."
              : `${total} ${total === 1 ? "topic" : "topics"} match “${query}”.`}
          </p>
        ) : null}

        {group && !searching ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Showing one section.{" "}
            <Link to="/help" className="underline underline-offset-4">
              Show everything
            </Link>
          </p>
        ) : null}
      </section>

      {groups.map((helpGroup) => (
        <section key={helpGroup.id} className="border-t py-8">
          <p className="eyebrow">{helpGroup.label}</p>

          <div className="mt-4 divide-y">
            {helpGroup.topics.map((helpTopic) => {
              const expanded = isOpen(helpTopic.id);
              return (
                <div
                  key={helpTopic.id}
                  ref={helpTopic.id === topic ? topicRef : undefined}
                  className="py-4"
                >
                  <button
                    type="button"
                    onClick={() => toggle(helpTopic.id)}
                    aria-expanded={expanded}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{helpTopic.title}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {helpTopic.summary}
                      </span>
                    </span>
                    <ChevronDown
                      className={`mt-1 size-4 shrink-0 text-muted-foreground transition-transform ${
                        expanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {expanded ? (
                    <div className="mt-4 pl-0">
                      <p className="eyebrow">Where to find it</p>
                      <p className="mt-1 text-sm">{helpTopic.where}</p>

                      {helpTopic.steps ? (
                        <>
                          <p className="eyebrow mt-5">How to use it</p>
                          <ol className="mt-2 space-y-2 text-sm">
                            {helpTopic.steps.map((step, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="shrink-0 tabular-nums text-muted-foreground">
                                  {index + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </>
                      ) : null}

                      {helpTopic.notes ? (
                        <>
                          <p className="eyebrow mt-5">Worth knowing</p>
                          <ul className="mt-2 space-y-2 text-sm">
                            {helpTopic.notes.map((note, index) => (
                              <li key={index} className="flex gap-3">
                                <span className="shrink-0 text-muted-foreground">•</span>
                                <span className="text-muted-foreground">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : null}

                      {helpTopic.to ? (
                        <Link
                          to={helpTopic.to}
                          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                        >
                          Open it <ExternalLink className="size-3.5" />
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

      <section className="border-t py-8">
        <p className="eyebrow">Still stuck?</p>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Try asking in your own words on{" "}
          <Link to="/ask" className="underline underline-offset-4">
            Ask about your money
          </Link>{" "}
          — it answers questions about your own figures. For anything about tax or legal matters,
          check with an accountant rather than relying on the app.
        </p>
      </section>
    </div>
  );
}
