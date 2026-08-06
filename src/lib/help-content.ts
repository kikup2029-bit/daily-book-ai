/**
 * Every feature, written for the person using the app rather than the person
 * who built it. Kept as data so the Help page can search it and the nav can
 * deep-link into it.
 */

export type HelpTopic = {
  id: string;
  title: string;
  /** Where to find it in the app. */
  where: string;
  /** One line on what it's for. */
  summary: string;
  /** How to actually use it. */
  steps?: string[];
  /** Things worth knowing, including what it can't do. */
  notes?: string[];
  /** Link straight to the feature. */
  to?: string;
  /** Extra words to match when searching. */
  keywords?: string;
};

export type HelpGroup = { id: string; label: string; topics: HelpTopic[] };

export const HELP: HelpGroup[] = [
  {
    id: "start",
    label: "Getting started",
    topics: [
      {
        id: "first-run",
        title: "Setting up for the first time",
        where: "Today",
        summary: "Two steps get the rest of the app working: one entry and a tax percentage.",
        to: "/dashboard",
        keywords: "onboarding setup new account begin",
        steps: [
          "On Today, type what you made into the setup box and save it.",
          "Set the share of income you want held back for tax — 25% is a common starting point.",
          "The setup panel disappears once both are done. There's a Skip link if you'd rather not.",
        ],
        notes: [
          "Nothing here is permanent — you can change the tax rate any time under Tools, and delete any entry.",
        ],
      },
      {
        id: "palette",
        title: "Jump anywhere with ⌘K",
        where: "Anywhere",
        summary:
          "One shortcut to reach any page, or log an entry without leaving what you're doing.",
        keywords: "command palette search shortcut ctrl k keyboard",
        steps: [
          "Press ⌘K (Ctrl+K on Windows), or click Search in the top bar.",
          "Type part of a page name — initials work too, so “wmw” finds Where money went.",
          "Or type an entry like “spent 20 on supplies” and pick Log this entry.",
          "Arrow keys move, Enter picks, Escape closes.",
        ],
      },
      {
        id: "theme",
        title: "Dark or light",
        where: "Top bar",
        summary: "The app is dark by default; switch to light for bright places.",
        keywords: "theme dark light mode sun moon outdoors",
        steps: ["Click the sun or moon icon in the top bar. Your choice is remembered."],
        notes: ["Light mode is worth using outdoors — dark screens are hard to read in sunlight."],
      },
    ],
  },

  {
    id: "logging",
    label: "Logging money",
    topics: [
      {
        id: "quick-add",
        title: "Quick add — just type it",
        where: "Today → Add an entry",
        summary: "Write it how you'd say it and the fields fill themselves in.",
        to: "/add",
        keywords: "quick type parse fast entry natural language",
        steps: [
          "Type something like “spent 42.50 at costco on groceries” or “made 300”.",
          "Check the preview line underneath — it shows exactly what it understood.",
          "Press Add.",
        ],
        notes: [
          "It learns from you: categorise Costco as Groceries once and it fills that in automatically next time.",
          "“yesterday” and dates like 2026-08-01 both work.",
        ],
      },
      {
        id: "voice",
        title: "Add by voice",
        where: "Today → Add an entry",
        summary: "Say the entry instead of typing it.",
        to: "/add",
        keywords: "voice speech microphone dictate talk say",
        steps: [
          "Tap the microphone next to the quick add box.",
          "Say something like “spent twenty dollars on lunch”.",
          "It fills the box in — check it, then press Add.",
        ],
        notes: [
          "Works in Chrome and Safari. In Firefox the microphone button doesn't appear, since the browser can't do it.",
          "Amounts in words are handled: “three hundred and fifty” becomes 350.",
          "Your browser needs microphone permission the first time.",
        ],
      },
      {
        id: "full-form",
        title: "The full entry form",
        where: "Today → Add an entry",
        summary: "For when you want to set everything by hand.",
        to: "/add",
        keywords: "form manual date money made spent category cash card",
        steps: [
          "Set the date, then money made and/or money spent.",
          "Add what it was spent on, and where (the shop name) if you want.",
          "Choose Cash, Card or Other — this is what makes the cash drawer check work.",
          "Attach a receipt photo if you have one.",
        ],
      },
      {
        id: "receipts",
        title: "Receipt photos that fill themselves in",
        where: "Today → Add an entry",
        summary: "Photograph a receipt and it reads the total, category, date and shop.",
        to: "/add",
        keywords: "receipt photo scan ocr camera picture",
        steps: [
          "Choose or take a photo in the Receipt photo field.",
          "Wait a moment — it reads the receipt and fills in what it found.",
          "Check the figures before saving. The photo stays attached to the entry.",
        ],
        notes: [
          "Reading receipts needs an AI key configured. Without one, everything else still works and you just type the details yourself.",
          "Receipt photos are private to you and stored securely, even if the entry is shared.",
        ],
      },
      {
        id: "editing",
        title: "Fixing or removing entries",
        where: "Today",
        summary: "Delete an entry, attach a receipt later, or change who can see it.",
        to: "/dashboard",
        keywords: "delete remove edit mistake wrong receipt share",
        steps: [
          "Find the entry in the list on Today.",
          "The camera icon attaches or replaces a receipt photo.",
          "The people icon changes who can see it (only if you're in a household).",
          "The bin icon deletes it — it asks first, and this can't be undone.",
        ],
        notes: ["To change the figures themselves, use Find an entry — see below."],
      },
      {
        id: "find-entry",
        title: "Find an entry, and correct it",
        where: "Today → Find an entry",
        summary: "Search everything you've logged, then tap one to change it.",
        to: "/entries",
        keywords:
          "search find filter edit correct fix change typo mistake history look up amount date wrong",
        steps: [
          "Type anything you remember — a shop, a category, a date, even the amount.",
          "Narrow further with More filters: category, cash or card, a date range, or an amount range.",
          "Tap a result to open it, change what's wrong, and Save changes.",
        ],
        notes: [
          "Every word you type has to match, so “costco groceries” narrows the list rather than widening it.",
          "The totals line adds up whatever is on screen, so a search doubles as a quick report — filter to one category and you have that category's total.",
          "In a household, anyone can correct a shared entry, but only whoever logged it can delete it.",
          "Searching happens on your device, so it's instant and works offline.",
        ],
      },
    ],
  },

  {
    id: "day",
    label: "Your day",
    topics: [
      {
        id: "safe-to-spend",
        title: "Safe to spend today",
        where: "Today",
        summary: "One number: what you can spend now without causing a problem later this month.",
        to: "/dashboard",
        keywords: "safe spend daily allowance budget left",
        notes: [
          "If you've set budgets, it's what's left of them spread over the days remaining.",
          "If you haven't, it's cash in hand minus bills still due this month, spread over the days left.",
          "It shows $0.00 and turns red when you're behind, rather than pretending there's room.",
        ],
      },
      {
        id: "due-soon",
        title: "Bills due soon",
        where: "Today",
        summary: "A warning at the top when something's due within five days.",
        to: "/dashboard",
        keywords: "due reminder alert bills warning soon",
        notes: [
          "It only appears when you have recurring bills set up and one is close.",
          "Set bills up under This month → Bills.",
        ],
      },
      {
        id: "streaks",
        title: "Streaks",
        where: "Today → Your streaks",
        summary: "How many days in a row you've logged, been profitable, or not spent.",
        to: "/streaks",
        keywords: "streak habit run profitable no spend record",
        notes: [
          "A no-spend day only counts on days you actually logged something — forgetting to use the app doesn't earn you a streak.",
          "Streaks don't break just because you haven't logged today yet; they count from yesterday.",
        ],
      },
      {
        id: "ask",
        title: "Asking questions about your money",
        where: "Today → Ask about your money",
        summary: "Plain-English questions about your own numbers.",
        to: "/ask",
        keywords: "chat ai ask question help advice",
        steps: [
          "Type a question like “what did I spend the most on?” or “can I afford $200?”",
          "Tap one of the suggested questions to see the kind of thing it handles.",
        ],
        notes: [
          "It answers from your own entries and never invents figures about your business.",
          "It handles spending, categories, comparisons, budgets, bills, stores, goals, outlook, tax and margins.",
          "It doesn't know your bank balance, debts or paydays — only what you've logged here.",
        ],
      },
    ],
  },

  {
    id: "month",
    label: "This month",
    topics: [
      {
        id: "month-overview",
        title: "Month overview",
        where: "This month → Overview",
        summary: "Money in, money out and profit for any month.",
        to: "/monthly",
        keywords: "monthly totals profit loss overview",
        steps: ["Use the arrows either side of the month name to move between months."],
        notes: ["The month you pick is remembered as you move between the other month pages."],
      },
      {
        id: "categories",
        title: "Where money went",
        where: "This month → Where money went",
        summary: "Your spending split by category, biggest first.",
        to: "/categories",
        keywords: "categories breakdown pie chart spending",
      },
      {
        id: "daybyday",
        title: "Day by day",
        where: "This month → Day by day",
        summary: "Each day of the month as a bar — green for up, red for down.",
        to: "/daybyday",
        keywords: "daily chart bars days",
      },
      {
        id: "week",
        title: "Your week in plain English",
        where: "This month → Your week",
        summary: "A short written recap of the last seven days.",
        to: "/week",
        keywords: "digest weekly recap summary plain english",
        notes: ["Written from your numbers, including how the week compares with the one before."],
      },
      {
        id: "outlook",
        title: "Can you cover what's coming",
        where: "This month → Can you cover it",
        summary: "A 30-day look ahead: will your money cover the bills due?",
        to: "/outlook",
        keywords: "forecast outlook runway rent future shortfall predict",
        notes: [
          "Built from your typical day over recent history, plus each recurring bill on the day it falls.",
          "It warns you with a date if it thinks you'll run short.",
          "With only a few days logged it says so plainly instead of pretending to be precise.",
        ],
      },
      {
        id: "busydays",
        title: "Busy and quiet days",
        where: "This month → Busy and quiet days",
        summary: "Which days of the week actually bring money in.",
        to: "/busydays",
        keywords: "slow quiet busy weekday pattern best day",
        notes: [
          "Needs about three weeks of entries before it means anything, and it'll tell you so.",
        ],
      },
      {
        id: "budgets",
        title: "Budgets",
        where: "This month → Budgets",
        summary: "A monthly cap per category, with a warning before you blow it.",
        to: "/budgets",
        keywords: "budget limit cap category alert overspend",
        steps: [
          "Enter a category and a monthly limit, then Save budget.",
          "Watch the bars — they turn red at 80% and are marked Over past 100%.",
        ],
        notes: ["Budgets also drive the “safe to spend today” number on Today."],
      },
      {
        id: "goals",
        title: "Savings goals",
        where: "This month → Savings goals",
        summary: "Something you're putting money aside for, and how close you are.",
        to: "/goals",
        keywords: "goal saving target save up",
        steps: [
          "Add a name, a target amount, how much you've saved so far, and optionally a date.",
        ],
        notes: [
          "With a target date it works out what to save each week; without one it estimates from your recent pace.",
        ],
      },
      {
        id: "bills",
        title: "Bills, subscriptions and recurring costs",
        where: "This month → Bills",
        summary: "What's due, what looks like a subscription, and your recurring rules.",
        to: "/bills",
        keywords: "bills recurring subscription due calendar rent detect",
        steps: [
          "Add a recurring bill with an amount, category, weekly or monthly, and a start date.",
          "It then creates those expense entries for you automatically as the dates pass.",
        ],
        notes: [
          "It also spots repeating charges in your history and offers them as bills to track in one tap.",
          "Detection is deliberately cautious: it needs three or more sightings, similar amounts and steady gaps, so it won't flag random shopping trips.",
        ],
      },
    ],
  },

  {
    id: "invoices",
    label: "Invoices",
    topics: [
      {
        id: "invoice-create",
        title: "Billing a customer",
        where: "Invoices → New invoice",
        summary: "Make an invoice, then send it and chase it from one list.",
        to: "/invoice-new",
        keywords: "invoice bill customer client charge create send draft number",
        steps: [
          "Enter who it's for, the dates, and one line per thing you're charging for.",
          "The total works itself out as you type.",
          "Create it — it starts as a draft, so nothing is final.",
          "When you've actually sent it to the customer, open it and tap Mark as sent.",
        ],
        notes: [
          "Numbers run in sequence and are never reused, even if you cancel one. Gaps are normal; two invoices sharing a number would not be.",
          "A draft can be edited or deleted. Once sent, it can be edited or cancelled but not deleted, so the numbering trail stays intact.",
          "Print or save as PDF gives you a clean copy with none of the app around it.",
        ],
      },
      {
        id: "invoice-paid",
        title: "Getting paid, and what it does to your books",
        where: "Invoices → open one",
        summary: "Marking an invoice paid is what turns it into income.",
        to: "/invoices",
        keywords: "paid payment mark unpaid income books entry outstanding overdue owed",
        steps: [
          "Open the invoice and tap Mark as paid.",
          "Choose the date the money actually arrived — not today, if they're different.",
        ],
        notes: [
          "This creates a normal income entry in your books on that date, so it flows into your totals, your month, your tax set-aside and your export like any other money in.",
          "Until it's marked paid it stays out of your figures completely. An unpaid invoice isn't income, and counting it would inflate your profit and your tax.",
          "Changed your mind? Mark as unpaid removes that entry again.",
          "Anything past its due date shows as overdue automatically — that's worked out from the date, so it's never stale.",
        ],
      },
    ],
  },

  {
    id: "tools",
    label: "Tools",
    topics: [
      {
        id: "household",
        title: "Sharing with someone",
        where: "Tools → Household",
        summary: "Share chosen entries with a partner or housemate, and split bills fairly.",
        to: "/household",
        keywords: "household share partner housemate split settle invite code",
        steps: [
          "Create a household and you get a six-character invite code.",
          "The other person signs up, opens Tools → Household, and enters that code.",
          "When you log something, choose Just me, Share, or Split it.",
        ],
        notes: [
          "Everything stays private unless you choose otherwise — joining a household doesn't expose anything you've already logged.",
          "Share means they can see it. Split it means it's also divided evenly and appears in the who-pays-who summary.",
          "Anyone in the household can fix a shared entry, but only whoever logged it can delete it.",
          "Leaving a household turns your shared entries private again.",
        ],
      },
      {
        id: "margins",
        title: "What you actually keep per item",
        where: "Tools → Item margins",
        summary: "Enter cost and selling price, see the real profit per sale.",
        to: "/margins",
        keywords: "margin markup profit per item price product pricing",
        notes: [
          "It also tells you roughly how many you need to sell each month to cover your usual costs.",
          "If you're selling something at a loss it says so outright.",
        ],
      },
      {
        id: "drawer",
        title: "Cash drawer check",
        where: "Tools → Cash drawer",
        summary: "Count the till and see whether it matches what you logged.",
        to: "/drawer",
        keywords: "cash drawer till count reconcile short over float",
        steps: [
          "Enter the day, your starting float, and what you actually counted.",
          "It shows what the drawer should hold and the gap, before you save.",
        ],
        notes: [
          "Only entries marked Cash count toward the expected figure. If you've never marked any, everything is treated as cash.",
          "The expected amount is worked out on the server from your entries, so it can't drift.",
        ],
      },
      {
        id: "tax",
        title: "Tax set-aside",
        where: "Tools → Tax set-aside",
        summary: "Hold back a share of income so the tax bill isn't a shock.",
        to: "/tax",
        keywords: "tax set aside percentage hold back quarterly",
        steps: ["Set a percentage. The running total updates as you log income."],
        notes: [
          "Log tax payments with “tax” in the category and they count against the total.",
          "This isn't tax advice — confirm the right percentage with an accountant.",
        ],
      },
      {
        id: "reminder",
        title: "Daily reminder",
        where: "Tools → Daily reminder",
        summary: "A nudge at a time you pick, so logging becomes a habit.",
        to: "/reminders",
        keywords: "reminder notification nudge daily alert time habit notify",
        steps: [
          "Pick the time that suits your day — after closing usually works.",
          "Tap Turn on reminders and allow notifications when your browser asks.",
        ],
        notes: [
          "Worth being clear about how it works: the app shows the reminder when it notices the time has passed. It isn't an alarm clock sent from a server, so it won't fire on a phone that hasn't opened the app all day.",
          "On iPhone you have to add the app to your home screen first — Apple doesn't allow notifications otherwise.",
          "It stays quiet if you've already logged something that day. The point is the habit, not the notification.",
          "It only ever appears once a day, even if you open the app several times.",
          "If you've blocked notifications for the site, the app will say so rather than pretending it's on.",
        ],
      },
      {
        id: "lock",
        title: "Locking the app",
        where: "Tools → Lock this app",
        summary: "A PIN so someone holding your unlocked phone can't read your books.",
        to: "/lock",
        keywords: "lock pin privacy security passcode biometric",
        steps: [
          "Choose a 4–8 digit PIN, type it twice, and pick when it should ask again.",
          "Use Turn off lock to remove it.",
        ],
        notes: [
          "Your PIN is stored scrambled and checked on the server — it's never kept as plain numbers.",
          "This hides the app on your device. Your account is already protected by your password, so the PIN is convenience on top of that, not a replacement.",
          "Forgotten it? Sign out, sign back in with your email and password, then set a new one.",
        ],
      },
    ],
  },

  {
    id: "export",
    label: "Export",
    topics: [
      {
        id: "export",
        title: "Sending records to your accountant",
        where: "Export",
        summary: "Download your entries as a spreadsheet or a tidy PDF.",
        to: "/export",
        keywords: "export csv pdf accountant download spreadsheet records",
        steps: [
          "Pick a date range, or use This month / Last month / Everything.",
          "Check the preview — it's exactly what ends up in the file.",
          "Choose Download CSV or Download PDF.",
        ],
        notes: [
          "Both include date, money in, money out, category, where, and a note, plus a totals row.",
          "Export → Download CSV and Download PDF in the menu skip straight to the download using your current range.",
        ],
      },
    ],
  },

  {
    id: "offline",
    label: "Phone and no signal",
    topics: [
      {
        id: "install",
        title: "Put it on your phone",
        where: "Today, or your browser menu",
        summary: "Install it so it opens like an app, full screen, with its own icon.",
        keywords: "install app home screen pwa download icon standalone phone",
        steps: [
          "On Android or Chrome, tap Install when the app offers it on Today.",
          "On iPhone, tap the Share button in Safari, then Add to Home Screen.",
        ],
        notes: [
          "Installing is what makes offline logging and daily reminders work properly, especially on iPhone.",
          "It's the same app and the same account — nothing to set up again.",
        ],
      },
      {
        id: "offline-logging",
        title: "Logging with no signal",
        where: "Anywhere",
        summary: "Keep logging in a basement, a market, or a dead spot. Nothing is lost.",
        keywords: "offline no signal no internet connection sync queue market basement",
        notes: [
          "A bar appears at the top when there's no connection. Carry on logging as normal.",
          "Entries are held on your device and sent automatically the moment you're back online, in the order you logged them.",
          "Tap “Show them” in that bar to see exactly what's still waiting.",
          "Pages you've already opened still work offline, and your figures are readable from the last time they loaded.",
          "One thing that can't work offline: attaching a receipt photo needs a connection. The entry saves and you add the photo later.",
          "If an entry is refused several times the app parks it and tells you, rather than dropping it quietly. You can retry or discard it yourself.",
          "Signing out won't delete anything still waiting — it warns you and keeps it for the next time you sign in on that device.",
        ],
      },
    ],
  },

  {
    id: "privacy",
    label: "Privacy and your data",
    topics: [
      {
        id: "privacy",
        title: "Who can see your numbers",
        where: "Everywhere",
        summary: "Your entries are yours. Nothing is shared unless you choose to share it.",
        keywords: "privacy security data who can see safe encryption",
        notes: [
          "Access is enforced by the database itself, not just the app, so another account can't read your entries even in principle.",
          "The offline copy of your figures is wiped when you sign out, so it can't be read by whoever uses the device next.",
          "Household sharing is per entry and always a deliberate choice.",
          "Receipt photos sit in private storage that only you can open.",
          "You can export everything you've logged at any time, and delete any entry.",
        ],
      },
    ],
  },
];

/** Nav sub-items, built from the same content so they can't drift apart. */
export const HELP_NAV = HELP.map((group) => ({
  to: `/help?group=${group.id}`,
  label: group.label,
}));

/** Loose search across titles, summaries, steps, notes and keywords. */
export function searchHelp(query: string): HelpGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return HELP;

  const hit = (topic: HelpTopic) =>
    [
      topic.title,
      topic.summary,
      topic.where,
      topic.keywords ?? "",
      ...(topic.steps ?? []),
      ...(topic.notes ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(q);

  return HELP.map((group) => ({ ...group, topics: group.topics.filter(hit) })).filter(
    (group) => group.topics.length > 0,
  );
}
