/**
 * Works out who has paid more than their fair share of shared costs, and the
 * smallest set of payments that squares everyone up.
 *
 * Pure functions — no database, no AI.
 */

export type SharedEntry = {
  user_id: string;
  amount_out: number;
  household_id?: string | null;
};

export type Member = {
  user_id: string;
  display_name: string | null;
};

export type MemberBalance = {
  user_id: string;
  name: string;
  /** What this person actually paid out. */
  paid: number;
  /** What they should have paid, if split evenly. */
  fairShare: number;
  /** Positive = they're owed money. Negative = they owe. */
  balance: number;
};

export type Transfer = {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
};

export type Settlement = {
  totalShared: number;
  perPerson: number;
  balances: MemberBalance[];
  transfers: Transfer[];
  /** True when everyone is within a cent of square. */
  settled: boolean;
};

const CENT = 0.005;

const nameFor = (member: Member) =>
  member.display_name?.trim() || `Member ${member.user_id.slice(0, 4)}`;

/**
 * Splits shared spending evenly across household members.
 *
 * Only expenses count (money in is income, not a shared cost). Members who
 * paid nothing still owe their share.
 */
export function settleShared(entries: SharedEntry[], members: Member[]): Settlement {
  if (members.length === 0) {
    return { totalShared: 0, perPerson: 0, balances: [], transfers: [], settled: true };
  }

  const paidBy = new Map<string, number>();
  for (const member of members) paidBy.set(member.user_id, 0);

  let totalShared = 0;
  for (const entry of entries) {
    if (entry.amount_out <= 0) continue;
    // Only count spending by people currently in the household.
    if (!paidBy.has(entry.user_id)) continue;
    paidBy.set(entry.user_id, (paidBy.get(entry.user_id) ?? 0) + entry.amount_out);
    totalShared += entry.amount_out;
  }

  const perPerson = totalShared / members.length;

  const balances: MemberBalance[] = members.map((member) => {
    const paid = paidBy.get(member.user_id) ?? 0;
    return {
      user_id: member.user_id,
      name: nameFor(member),
      paid,
      fairShare: perPerson,
      balance: paid - perPerson,
    };
  });

  // Greedy settle-up: repeatedly match the biggest debtor to the biggest
  // creditor. For small households this gives the minimum number of payments.
  const debtors = balances
    .filter((b) => b.balance < -CENT)
    .map((b) => ({ ...b, remaining: -b.balance }))
    .sort((a, b) => b.remaining - a.remaining);
  const creditors = balances
    .filter((b) => b.balance > CENT)
    .map((b) => ({ ...b, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining);

  const transfers: Transfer[] = [];
  let di = 0;
  let ci = 0;
  let guard = 0;

  while (di < debtors.length && ci < creditors.length && guard < 1000) {
    guard += 1;
    const debtor = debtors[di];
    const creditor = creditors[ci];
    const amount = Math.min(debtor.remaining, creditor.remaining);

    if (amount > CENT) {
      transfers.push({
        fromUserId: debtor.user_id,
        fromName: debtor.name,
        toUserId: creditor.user_id,
        toName: creditor.name,
        amount: Math.round(amount * 100) / 100,
      });
    }

    debtor.remaining -= amount;
    creditor.remaining -= amount;
    if (debtor.remaining <= CENT) di += 1;
    if (creditor.remaining <= CENT) ci += 1;
  }

  return {
    totalShared,
    perPerson,
    balances,
    transfers,
    settled: transfers.length === 0,
  };
}
