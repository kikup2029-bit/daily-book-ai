/**
 * Entries logged with no signal.
 *
 * The rule this file exists to guarantee: an entry the owner typed is never
 * silently lost and never sent twice. So nothing leaves the queue until the
 * server confirms it, and an entry the server keeps refusing gets parked and
 * shown to the owner rather than quietly dropped.
 *
 * Storage is behind an interface so the queue logic can be tested without a
 * browser.
 */

export type NewEntryInput = {
  entry_date: string;
  amount_in: number;
  amount_out: number;
  spent_on: string | null;
  merchant?: string | null;
  payment_method?: string | null;
  share?: "private" | "visible" | "split";
};

export type PendingEntry = {
  /** Local id. Only used to identify the item in this queue. */
  id: string;
  queued_at: string;
  attempts: number;
  last_error: string | null;
  /** Set once we've retried enough times that something is clearly wrong. */
  stuck: boolean;
  data: NewEntryInput;
};

export interface QueueStorage {
  read(): PendingEntry[];
  write(items: PendingEntry[]): void;
}

export const QUEUE_KEY_PREFIX = "simplebooks.queue";

/**
 * The queue is keyed by account.
 *
 * Two people can share a device — a shop owner and their partner, say. A single
 * shared queue would post whatever was waiting into whichever account happened
 * to sign in next, which would put one person's takings in the other's books.
 * Keying by user means entries can only ever land in the account that typed
 * them, and signing out doesn't have to destroy anything to stay safe.
 */
export function queueKeyFor(userId: string | null | undefined): string {
  return userId ? `${QUEUE_KEY_PREFIX}.${userId}` : QUEUE_KEY_PREFIX;
}

/** Give up retrying automatically after this many failures and ask the owner. */
export const MAX_ATTEMPTS = 6;

export type FlushResult = {
  sent: number;
  /** Still waiting, and expected to go through later. */
  waiting: number;
  /** Parked because the server keeps refusing them. */
  stuck: number;
};

export function browserQueueStorage(userId: string | null | undefined): QueueStorage {
  const key = queueKeyFor(userId);
  return {
    read() {
      try {
        const raw = localStorage.getItem(key);
        return raw ? parseQueue(raw) : [];
      } catch {
        // Private browsing, full disk, corrupt value — treat as empty rather
        // than breaking the page. Nothing was sent, so nothing is lost that
        // wasn't already gone.
        return [];
      }
    },
    write(items) {
      try {
        localStorage.setItem(key, JSON.stringify(items));
      } catch {
        // Nothing useful to do. The caller still has the entry in the form.
      }
    },
  };
}

/** In-memory storage, for tests. */
export function memoryQueueStorage(initial: PendingEntry[] = []): QueueStorage {
  let items = [...initial];
  return {
    read: () => [...items],
    write: (next) => {
      items = [...next];
    },
  };
}

/** Tolerant parse — one bad record shouldn't take the whole queue with it. */
export function parseQueue(raw: string): PendingEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  const items: PendingEntry[] = [];
  for (const candidate of parsed) {
    if (!candidate || typeof candidate !== "object") continue;
    const item = candidate as Partial<PendingEntry>;
    const data = item.data;
    if (!data || typeof data !== "object") continue;
    if (typeof data.entry_date !== "string") continue;
    if (typeof data.amount_in !== "number" || typeof data.amount_out !== "number") continue;
    items.push({
      id: typeof item.id === "string" ? item.id : newId(),
      queued_at: typeof item.queued_at === "string" ? item.queued_at : new Date().toISOString(),
      attempts: typeof item.attempts === "number" ? item.attempts : 0,
      last_error: typeof item.last_error === "string" ? item.last_error : null,
      stuck: item.stuck === true,
      data: {
        entry_date: data.entry_date,
        amount_in: data.amount_in,
        amount_out: data.amount_out,
        spent_on: typeof data.spent_on === "string" ? data.spent_on : null,
        merchant: typeof data.merchant === "string" ? data.merchant : null,
        payment_method: typeof data.payment_method === "string" ? data.payment_method : null,
        share:
          data.share === "visible" || data.share === "split" || data.share === "private"
            ? data.share
            : "private",
      },
    });
  }
  return items;
}

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `q-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Rejects entries that couldn't be saved anyway, so they can't clog the queue. */
export function validateEntry(data: NewEntryInput): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.entry_date)) return "That date doesn't look right.";
  if (!Number.isFinite(data.amount_in) || !Number.isFinite(data.amount_out)) {
    return "Those amounts don't look right.";
  }
  if (data.amount_in < 0 || data.amount_out < 0) return "Amounts can't be negative.";
  if (data.amount_in === 0 && data.amount_out === 0) return "Enter an amount first.";
  return null;
}

export function enqueue(
  storage: QueueStorage,
  data: NewEntryInput,
  now: Date = new Date(),
): PendingEntry {
  const problem = validateEntry(data);
  if (problem) throw new Error(problem);

  const item: PendingEntry = {
    id: newId(),
    queued_at: now.toISOString(),
    attempts: 0,
    last_error: null,
    stuck: false,
    data,
  };
  storage.write([...storage.read(), item]);
  return item;
}

export function pending(storage: QueueStorage): PendingEntry[] {
  return storage.read();
}

export function counts(storage: QueueStorage): { waiting: number; stuck: number } {
  const items = storage.read();
  return {
    waiting: items.filter((item) => !item.stuck).length,
    stuck: items.filter((item) => item.stuck).length,
  };
}

/** Throw away one item. Only ever called because the owner asked. */
export function discard(storage: QueueStorage, id: string): void {
  storage.write(storage.read().filter((item) => item.id !== id));
}

/** Un-park everything so the next flush tries again. */
export function retryStuck(storage: QueueStorage): void {
  storage.write(
    storage.read().map((item) => (item.stuck ? { ...item, stuck: false, attempts: 0 } : item)),
  );
}

/**
 * Try to send everything waiting, oldest first.
 *
 * A network failure stops the run and keeps the rest queued in order, so
 * entries reach the server in the order they were logged. An item that has
 * failed MAX_ATTEMPTS times is parked instead and the run continues, so one
 * bad entry can't hold up every entry behind it.
 */
export async function flush(
  storage: QueueStorage,
  send: (data: NewEntryInput) => Promise<unknown>,
): Promise<FlushResult> {
  const items = storage.read();
  const keep: PendingEntry[] = [];
  let sent = 0;
  let stopped = false;

  for (const item of items) {
    if (stopped) {
      keep.push(item);
      continue;
    }
    if (item.stuck) {
      keep.push(item);
      continue;
    }

    try {
      await send(item.data);
      sent += 1;
    } catch (error) {
      const attempts = item.attempts + 1;
      const message = error instanceof Error ? error.message : "Couldn't save it.";
      const nowStuck = attempts >= MAX_ATTEMPTS;
      keep.push({ ...item, attempts, last_error: message, stuck: nowStuck });
      // Keep going past a parked item; otherwise stop so order is preserved.
      if (!nowStuck) stopped = true;
    }
  }

  storage.write(keep);
  return {
    sent,
    waiting: keep.filter((item) => !item.stuck).length,
    stuck: keep.filter((item) => item.stuck).length,
  };
}

/** A short human description, for the pending list. */
export function describe(item: PendingEntry): string {
  const { data } = item;
  const money = (value: number) =>
    value.toLocaleString(undefined, { style: "currency", currency: "USD" });
  const direction =
    data.amount_in > 0 ? `${money(data.amount_in)} in` : `${money(data.amount_out)} out`;
  const where = data.merchant ? ` at ${data.merchant}` : "";
  const what = data.spent_on ? ` · ${data.spent_on}` : "";
  return `${direction}${where}${what} · ${data.entry_date}`;
}
