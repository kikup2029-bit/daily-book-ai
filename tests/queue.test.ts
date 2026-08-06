import {
  memoryQueueStorage,
  enqueue,
  flush,
  counts,
  discard,
  retryStuck,
  parseQueue,
  validateEntry,
  describe as describeItem,
  MAX_ATTEMPTS,
  type NewEntryInput,
} from "../src/lib/offline-queue.ts";

let pass = 0,
  fail = 0;
const ok = (cond: boolean, label: string) => {
  if (cond) {
    pass++;
  } else {
    fail++;
    console.log("FAIL: " + label);
  }
};
const eq = (a: unknown, b: unknown, label: string) => {
  const same = JSON.stringify(a) === JSON.stringify(b);
  if (!same) console.log(`FAIL: ${label} — got ${JSON.stringify(a)}, want ${JSON.stringify(b)}`);
  same ? pass++ : fail++;
};

const entry = (over: Partial<NewEntryInput> = {}): NewEntryInput => ({
  entry_date: "2026-08-04",
  amount_in: 0,
  amount_out: 10,
  spent_on: "Supplies",
  merchant: null,
  payment_method: "cash",
  share: "private",
  ...over,
});

// --- validation ---
ok(validateEntry(entry()) === null, "valid entry accepted");
ok(validateEntry(entry({ amount_in: 0, amount_out: 0 })) !== null, "zero/zero rejected");
ok(validateEntry(entry({ amount_out: -5 })) !== null, "negative rejected");
ok(validateEntry(entry({ entry_date: "04/08/2026" })) !== null, "bad date rejected");
ok(validateEntry(entry({ amount_out: NaN })) !== null, "NaN rejected");

// --- enqueue ---
{
  const s = memoryQueueStorage();
  enqueue(s, entry({ amount_out: 1 }));
  enqueue(s, entry({ amount_out: 2 }));
  eq(s.read().length, 2, "two items queued");
  eq(
    s.read().map((i) => i.data.amount_out),
    [1, 2],
    "order preserved oldest first",
  );
  ok(s.read()[0].id !== s.read()[1].id, "ids unique");
  let threw = false;
  try {
    enqueue(s, entry({ amount_in: 0, amount_out: 0 }));
  } catch {
    threw = true;
  }
  ok(threw, "invalid entry refused rather than queued");
  eq(s.read().length, 2, "queue unchanged after refusal");
}

// --- happy path flush ---
{
  const s = memoryQueueStorage();
  enqueue(s, entry({ amount_out: 1 }));
  enqueue(s, entry({ amount_out: 2 }));
  enqueue(s, entry({ amount_out: 3 }));
  const seen: number[] = [];
  const r = await flush(s, async (d) => {
    seen.push(d.amount_out);
  });
  eq(r, { sent: 3, waiting: 0, stuck: 0 }, "all three sent");
  eq(seen, [1, 2, 3], "sent in the order they were logged");
  eq(s.read().length, 0, "queue emptied only after success");
}

// --- network failure keeps order and loses nothing ---
{
  const s = memoryQueueStorage();
  enqueue(s, entry({ amount_out: 1 }));
  enqueue(s, entry({ amount_out: 2 }));
  enqueue(s, entry({ amount_out: 3 }));
  let calls = 0;
  const r = await flush(s, async () => {
    calls++;
    if (calls === 2) throw new Error("offline");
  });
  eq(r.sent, 1, "one sent before the failure");
  eq(calls, 2, "stopped at the failure instead of racing on");
  eq(
    s.read().map((i) => i.data.amount_out),
    [2, 3],
    "failed item and the rest stay, in order",
  );
  eq(s.read()[0].attempts, 1, "attempt counted");
  ok(s.read()[0].last_error === "offline", "error message kept for the owner");
  ok(
    s.read().every((i) => !i.stuck),
    "nothing parked after one failure",
  );

  // Next flush, network back: everything goes through.
  const r2 = await flush(s, async () => {});
  eq(r2, { sent: 2, waiting: 0, stuck: 0 }, "rest sent on reconnect");
  eq(s.read().length, 0, "queue drained");
}

// --- a poison entry gets parked, not dropped, and stops blocking the rest ---
{
  const s = memoryQueueStorage();
  enqueue(s, entry({ amount_out: 1 })); // always fails
  enqueue(s, entry({ amount_out: 2 })); // fine
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    await flush(s, async (d) => {
      if (d.amount_out === 1) throw new Error("rejected");
    });
  }
  const items = s.read();
  eq(items.length, 1, "the good entry got through");
  ok(items[0].data.amount_out === 1, "the bad entry is the one left");
  ok(items[0].stuck, "bad entry parked after MAX_ATTEMPTS");
  eq(counts(s), { waiting: 0, stuck: 1 }, "counts report it as stuck, not waiting");

  // Parked items are skipped, so later entries still flow.
  enqueue(s, entry({ amount_out: 9 }));
  const r = await flush(s, async (d) => {
    if (d.amount_out === 1) throw new Error("rejected");
  });
  eq(r.sent, 1, "new entry sent past the parked one");
  eq(s.read().length, 1, "parked one still held, not lost");

  retryStuck(s);
  eq(counts(s), { waiting: 1, stuck: 0 }, "retry un-parks it");
  discard(s, s.read()[0].id);
  eq(s.read().length, 0, "owner can discard it deliberately");
}

// --- corrupt storage ---
{
  eq(parseQueue("not json"), [], "garbage parses to empty");
  eq(parseQueue('{"a":1}'), [], "non-array parses to empty");
  const good = JSON.stringify([
    {
      id: "a",
      queued_at: "x",
      attempts: 0,
      stuck: false,
      data: { entry_date: "2026-08-01", amount_in: 5, amount_out: 0, spent_on: null },
    },
    { id: "b", data: { entry_date: "nope" } },
    null,
    "hello",
  ]);
  const parsed = parseQueue(good);
  eq(parsed.length, 1, "one bad record doesn't take the queue with it");
  eq(parsed[0].data.amount_in, 5, "good record survived intact");
  eq(parsed[0].data.share, "private", "missing share defaults to private, not shared");
}

// --- share must never be upgraded by accident ---
{
  const parsed = parseQueue(
    JSON.stringify([
      { id: "a", data: { entry_date: "2026-08-01", amount_in: 0, amount_out: 3, share: "wat" } },
    ]),
  );
  eq(parsed[0].data.share, "private", "unknown share value falls back to private");
}

// --- description ---
{
  const s = memoryQueueStorage();
  const item = enqueue(s, entry({ amount_out: 42.5, merchant: "Costco", spent_on: "Groceries" }));
  const text = describeItem(item);
  ok(
    text.includes("42.50") && text.includes("Costco") && text.includes("Groceries"),
    "describe reads well: " + text,
  );
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail === 0 ? 0 : 1);
