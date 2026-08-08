/**
 * The English source text. Every other language is a translation of this file.
 *
 * Conventions that keep translation sane:
 *
 *  - Keys describe the *meaning*, not the words, so "nav.thisMonth" survives a
 *    rewording of the label.
 *  - {placeholders} are substituted at render time. Their order can move freely
 *    in a translation — that matters a lot for languages whose word order
 *    differs from English.
 *  - Anything with a count has `_one` and `_other` forms. Some languages need
 *    more forms than English; the plural helper handles that per language
 *    rather than assuming English's two.
 *  - Never build a sentence by joining fragments in a component. Word order
 *    differs per language, so the whole sentence must live here as one string.
 */

export const en = {
  common: {
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    delete: "Delete",
    deleting: "Deleting…",
    edit: "Edit",
    close: "Close",
    back: "Back",
    add: "Add",
    today: "Today",
    yesterday: "Yesterday",
    loading: "Loading…",
    search: "Search…",
    searchLong: "Search or jump to a page",
    viewAll: "View all",
    showEverything: "Show everything",
    noMatch: "Nothing matches that.",
    tryAgain: "Try again",
    optional: "Optional",
    date: "Date",
    amount: "Amount",
    category: "Category",
    moneyIn: "Money in",
    moneyOut: "Money out",
    net: "Net",
    profit: "Profit",
    loss: "Loss",
    signOut: "Sign out",
    keepIt: "Keep it",
    moreActions: "More actions",
    send: "Send",
    language: "Language",
    changeLanguage: "Change language",
  },

  nav: {
    today: "Today",
    thisMonth: "This month",
    invoices: "Invoices",
    tools: "Tools",
    export: "Export",
    help: "Help",
    overview: "Overview",
    addEntry: "Add an entry",
    findEntry: "Find an entry",
    streaks: "Your streaks",
    ask: "Ask about your money",
    whereMoneyWent: "Where money went",
    dayByDay: "Day by day",
    yourWeek: "Your week",
    canYouCover: "Can you cover it",
    busyDays: "Busy and quiet days",
    budgets: "Budgets",
    goals: "Savings goals",
    bills: "Bills",
    allInvoices: "All invoices",
    newInvoice: "New invoice",
    household: "Household",
    margins: "Item margins",
    drawer: "Cash drawer",
    tax: "Tax set-aside",
    reminder: "Daily reminder",
    lock: "Lock this app",
    billing: "Billing",
    yourPlan: "Your plan",
    pickDates: "Pick dates",
    downloadCsv: "Download CSV",
    downloadPdf: "Download PDF",
    allTopics: "All topics",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    goTo: "Go to {section}",
    switchToDark: "Switch to dark",
    switchToLight: "Switch to light",
    home: "SimpleBooks home",
  },

  auth: {
    welcomeBack: "Welcome back",
    createAccount: "Create your account",
    signInBlurb: "Sign in to pick up where you left off.",
    signUpBlurb: "Takes about twenty seconds. Your books stay private to you.",
    email: "Email",
    emailPlaceholder: "you@yourbusiness.com",
    password: "Password",
    passwordPlaceholderNew: "Choose a password",
    passwordPlaceholderExisting: "Your password",
    passwordHint: "At least 6 characters.",
    showPassword: "Show password",
    hidePassword: "Hide password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    creating: "Creating account…",
    newHere: "New to SimpleBooks?",
    haveAccount: "Already have an account?",
    createOne: "Create an account",
    privateNote: "Your entries are private to your account.",
    freeNote: "Free for 7 days. Card needed to start, cancel any time before then.",
    heroTitle: "Your books, done in the time it takes to serve one customer.",
    sellingFast: "Log it in seconds",
    sellingFastBody: "Type “spent 20 at costco on supplies” and it fills itself in.",
    sellingOffline: "Works with no signal",
    sellingOfflineBody: "Keep logging in a basement or a market. It syncs when you're back.",
    sellingPrivate: "Private to you",
    sellingPrivateBody: "Access is enforced by the database, not just the app.",
    errEmailMissing: "Enter your email address.",
    errEmailInvalid: "That doesn't look like an email address.",
    errPasswordMissing: "Enter your password.",
    errPasswordShort: "Use at least 6 characters.",
    errGeneric: "Something went wrong. Please try again.",
    confirmEmail: "Almost there — check your email to confirm your account, then sign in.",
  },

  dashboard: {
    eyebrow: "Today",
    blurb: "Everything you've logged so far, and what's worth a look.",
    position: "Where you stand today",
    todaysNet: "Today's net",
    nothingToday: "Nothing logged today yet.",
    aheadToday: "You're ahead on the day.",
    behindToday: "You're behind on the day.",
    evenToday: "Break even so far today.",
    allTime: "All time",
    // Each of these is a whole phrase: the amount and the word that says which
    // direction it went can't be joined in the component.
    allTimeIn: "{amount} in",
    allTimeOut: "{amount} out",
    allTimeNet: "{amount} net",
    safeToSpend: "Safe to spend today",
    nothingLeft: "Nothing left for today",
    quickAdd: "Quick add",
    quickAddBlurb: "Just type it — “spent 20 at costco on groceries” or “made 300”.",
    quickAddVoice: "Or tap the mic and say it.",
    quickAddPlaceholder: "spent 20 on supplies",
    quickAddInputLabel: "Quick add entry",
    listening: "Listening…",
    listeningHint: "Listening — say something like “spent twenty dollars on lunch”.",
    startListening: "Add by voice",
    stopListening: "Stop listening",
    readingThatAs: "Reading that as",
    noCategory: "No category",
    atMerchant: "at {merchant}",
    onDate: "on {date}",
    addIt: "Add it",
    savedOnDevice: "Saved on this device — {summary}",
    recentEntries: "Recent entries",
    recentBlurb: "Newest first. Tap the menu on a row to change or remove it.",
    nothingLogged: "Nothing logged yet",
    nothingLoggedBlurb: "Add what came in and what went out, and it appears here straight away.",
    logFirst: "Log your first entry",
    loadFailed: "Couldn't load your entries. {message}",
    moreEntries: "{count} more — see everything",
    billsDueSoon_one: "A bill is due soon",
    billsDueSoon_other: "{count} bills due soon",
    billsDueSoonBlurb: "Worth covering before it catches you out.",
    streakLogging: "Logging streak",
    streakProfitable: "Profitable run",
    streakNoSpend: "No-spend run",
    streakDays_one: "{count} day",
    streakDays_other: "{count} days",
    streakBest: "Best: {count}",
    streakYourBest: "Your best yet",
    streakNice_one: "Nice — {count} day in a row of keeping your books up to date.",
    streakNice_other: "Nice — {count} days in a row of keeping your books up to date.",
    streakStart: "Log something every day and your streak starts building.",
    aheadDaysThisMonth:
      "This month you came out ahead on {profitable} of {active} days you logged.",
    askBlurb: "Ask about your numbers in plain English — no accounting talk.",
    askPlaceholder: "Ask a question…",
    askThinking: "Looking at your books…",
    askFailed: "Sorry, something went wrong: {message}",
    askFailedUnknown: "Sorry, something went wrong. Please try again.",
    askMostSpent: "What did I spend the most on?",
    askThisWeek: "How am I doing this week?",
    askMakingMoney: "Am I making money?",
    askCanIAfford: "Can I afford $200?",
    askHowMuchSpent: "How much have I spent?",
    uncategorised: "Uncategorised",
    hasReceipt: "Has a receipt",
    viewReceipt: "View receipt",
    addReceipt: "Add a receipt",
    shareWithHousehold: "Share with household",
    makePrivate: "Make private again",
    splitEvenly: "Split this one evenly",
    deleteEntry: "Delete entry",
    deleteConfirm: "Delete this entry? This can't be undone.",
    actionsFor: "Actions for {name}",
    shared: "Shared",
    split: "Split",
  },

  entryForm: {
    title: "Today's entry",
    blurb: "Jot down what came in and what went out.",
    fullEntry: "The full entry",
    fullEntryBlurb: "When you need the date, a receipt or who it's shared with.",
    moneyMade: "Money made",
    moneySpent: "Money spent",
    whatFor: "What for",
    whatForPlaceholder: "Supplies",
    whatForExamples: "Supplies, Rent, Inventory…",
    where: "Where",
    wherePlaceholder: "Costco",
    whereExamples: "Costco, Shell, Home Depot…",
    paidWith: "Paid with",
    cash: "Cash",
    card: "Card",
    other: "Other",
    receiptPhoto: "Receipt photo",
    receiptPrivateHint: "Optional — only you can see it.",
    receiptAttaching: "Attaching “{name}” — only you can see it.",
    receiptReading: "Reading your receipt…",
    whoCanSee: "Who can see this",
    justMe: "Just me",
    shareIt: "Share",
    splitIt: "Split it",
    shareNoneBlurb: "Only you will see this.",
    shareVisibleBlurb: "{household} can see it, but nobody owes anybody.",
    shareSplitBlurb: "{household} can see it and it gets divided evenly.",
    staysPrivate: "Nothing leaves your books.",
    saveEntry: "Save entry",
    saved: "Saved.",
    errAmounts: "Please enter valid amounts.",
    errEmpty: "Add money made or money spent before saving.",
    receiptFilled: "Filled in from your receipt — please double check before saving.",
    receiptUnreadable:
      "Couldn't read details off that receipt — no worries, just fill it in yourself.",
    receiptOffline:
      "Saved on this device. The photo couldn't be attached without a connection — add it from the entry once you're back online.",
  },

  entries: {
    eyebrow: "Your entries",
    title: "Find an entry",
    blurb: "Search everything you've logged, then tap one to fix it.",
    searchPlaceholder: "Try “costco”, “rent”, or 42.50",
    searchLabel: "Search your entries",
    clearSearch: "Clear search",
    everything: "Everything",
    moreFilters: "More filters",
    fewerFilters: "Fewer filters",
    narrowDown: "Narrow it down",
    allOptional: "Every filter is optional.",
    clearAll: "Clear all",
    anyCategory: "Any category",
    anyWay: "Any way",
    fromDate: "From date",
    toDate: "To date",
    amountAtLeast: "Amount at least",
    amountAtMost: "Amount at most",
    any: "any",
    order: "Order",
    newestFirst: "Newest first",
    oldestFirst: "Oldest first",
    biggestFirst: "Biggest amount first",
    smallestFirst: "Smallest amount first",
    editing: "Editing this entry",
    saveChanges: "Save changes",
    errNeedsAmount: "An entry needs money in or money out. Use Delete to remove it.",
    count_one: "{count} entry",
    count_other: "{count} entries",
    // Accessible name for the all / money in / money out segmented control.
    directionLabel: "Direction",
    nothingLoggedBlurb:
      "Once you start logging, everything you've entered shows up here to search and correct.",
    noMatchHint: "Try fewer words, a wider date range, or start again with everything.",
  },

  month: {
    previous: "Previous month",
    next: "Next month",
    profitThisMonth: "Profit this month",
    lossThisMonth: "Loss this month",
    breakEvenThisMonth: "Break even this month",
    budgetOver: "{category} is over budget",
    budgetAtPercent: "{category} is at {percent}% of budget",
    nothingSpent: "Nothing spent this month yet",
    nothingSpentBlurb:
      "Once you log expenses, this shows exactly which categories your money went to, biggest first.",
    whereMoneyWentBlurb: "Every expense this month, biggest first.",
    dayByDayBlurb:
      "Each bar is that day's net. Bars above the line are days you came out ahead, below the line are days you didn't.",
    dayNumber: "Day {day}",

    weekTitle: "Your week in plain English",
    weekRange: "{from} to {to}",
    loadingWeek: "Reading your week…",

    outlookTitle: "Can you cover what's coming?",
    // Two numbers in one sentence: the plural form follows the days logged,
    // which is the one that can legitimately be 1.
    outlookBlurb_one:
      "Next {days} days, based on your last {count} day and the bills you've set up.",
    outlookBlurb_other:
      "Next {days} days, based on your last {count} days and the bills you've set up.",
    loadingOutlook: "Working out your outlook…",
    whereYouAre: "Where you are",
    inDays_one: "In {count} day",
    inDays_other: "In {count} days",
    shortfallTitle: "Heads up — you could run short around {date}.",
    staysPositive: "You stay in the black the whole time.",
    lowestPoint: "Lowest point is {amount} on {date}.",
    typicalDay: "Typical day: {moneyIn} in, {moneyOut} out.",
    billsComingUp: "Bills coming up",
    roughGuess_one:
      "This is a rough guess — you've only got {count} day logged. It gets more accurate as you keep going.",
    roughGuess_other:
      "This is a rough guess — you've only got {count} days logged. It gets more accurate as you keep going.",

    taxNoRateTools:
      "Set a percentage on the Tools tab and I'll keep a running total of what to hold back for tax.",
    taxNoRateBelow:
      "Set a percentage below and I'll keep a running total of what to hold back for tax.",
    taxHoldingBack: "Holding back {percent}% of the {amount} you've taken in {period}.",
    shouldSetAside: "Should set aside",
    alreadyPaid: "Already paid",
    stillToSetAside: "Still to put aside",
    taxHint:
      "Log tax payments with “tax” in the category and they’ll count here. Not tax advice — confirm your rate with an accountant.",
    loadingTax: "Adding up your tax set-aside…",

    busyDaysBlurb: "Average money in per day of the week.",
    busyDaysNotEnough:
      "Keep logging for a few more weeks and I'll show which days of the week are your best and quietest.",
    loadingBusyDays: "Looking at your week…",
    // One sentence, four ways — the percentages only appear when they're worth
    // mentioning, and a sentence can't be assembled from pieces per language.
    bestAndQuiet: "{best} is your best day, and {worst} is your quietest.",
    bestAndQuietBoth:
      "{best} is your best day ({bestPercent}% above your average), and {worst} is your quietest ({worstPercent}% below).",
    bestAndQuietBestOnly:
      "{best} is your best day ({bestPercent}% above your average), and {worst} is your quietest.",
    bestAndQuietWorstOnly:
      "{best} is your best day, and {worst} is your quietest ({worstPercent}% below).",

    whatsDue: "What's due",
    loadingBills: "Loading your bills",
    billsTotal: "{amount} of bills over the next 45 days.",
    thisWeek: "This week",
    nextThreeWeeks: "Next 3 weeks",
    later: "Later",
    dueToday: "today",
    dueTomorrow: "tomorrow",
    dueInDays_one: "in {count} day",
    dueInDays_other: "in {count} days",

    detectedTitle: "Looks like a regular bill",
    detectedBlurb:
      "I spotted these repeating in your entries. Track them and they'll show up in your outlook and bill reminders.",
    maybe: "maybe",
    weekly: "weekly",
    monthly: "monthly",
    detectedDetail_one: "{amount} {frequency} · seen {count} time · next around {date}",
    detectedDetail_other: "{amount} {frequency} · seen {count} times · next around {date}",
    dismissDetected: "Dismiss {name}",
    trackBill: "Track this bill",

    goalsBlurb: "Something you're putting money aside for — track how close you are.",
    reached: "Reached",
    goalToGo: "{amount} to go",
    goalReached: "Goal reached",
    goalByDate: "by {date}",
    removeGoal: "Remove the {name} goal",
    noGoals: "No goals yet.",
    goalNamePlaceholder: "New oven",
    goalTarget: "Target amount",
    goalSaved: "Saved so far",
    goalTargetDate: "Target date (optional)",
    saveGoal: "Save goal",

    budgetsTitle: "Budget limits",
    budgetsBlurb: "Set a monthly cap per category and watch the bars.",
    over: "Over",
    // "Close" as in nearly at the limit — never common.close, which shuts things.
    nearLimit: "Close",
    removeBudget: "Remove the {name} budget",
    noBudgets: "No budgets set yet.",
    monthlyLimit: "Monthly limit",
    saveBudget: "Save budget",

    recurringTitle: "Recurring expenses",
    recurringBlurb: "Bills that repeat get logged for you automatically.",
    cancelled: "Cancelled",
    recurringDetail: "{amount} · {frequency} · from {date}",
    editRule: "Edit {name}",
    cancelRule: "Cancel {name}",
    deleteRule: "Delete {name}",
    noRecurring: "Nothing recurring yet.",
    recurringPlaceholder: "Rent",
    howOften: "How often?",
    everyWeek: "Every week",
    everyMonth: "Every month",
    starting: "Starting",
    updateRecurring: "Update recurring expense",
    addRecurring: "Add recurring expense",
  },

  invoices: {
    eyebrow: "Invoices",
    title: "Money you're owed",
    blurb:
      "Bill a customer, then mark it paid when the money lands — that's when it reaches your books.",
    newInvoice: "New invoice",
    outstanding: "Outstanding",
    overdue: "Overdue",
    paidThisMonth: "Paid this month",
    awaitingPayment_one: "{count} invoice awaiting payment",
    awaitingPayment_other: "{count} invoices awaiting payment",
    pastDue: "{count} past the due date",
    settled: "{count} settled",
    all: "All",
    drafts: "Drafts",
    paid: "Paid",
    searchPlaceholder: "Customer or number",
    searchLabel: "Search invoices",
    invoice: "Invoice",
    customer: "Customer",
    due: "Due",
    status: "Status",
    daysLate_one: "{count} day late",
    daysLate_other: "{count} days late",
    pastDueBy_one: "{count} day past the due date",
    pastDueBy_other: "{count} days past the due date",
    none: "No invoices yet",
    noneBlurb:
      "Create one for a customer, send it, and mark it paid when the money arrives. Only then does it count as income.",
    createFirst: "Create your first invoice",
    notAvailable: "Invoices aren't available yet",
    statusDraft: "Draft",
    statusSent: "Awaiting payment",
    statusOverdue: "Overdue",
    statusPaid: "Paid",
    statusVoid: "Cancelled",
    markSent: "Mark as sent",
    markPaid: "Mark as paid",
    markUnpaid: "Mark as unpaid",
    recordPayment: "Record payment",
    moneyArrivedOn: "Date the money arrived",
    cancelInvoice: "Cancel invoice",
    deleteDraft: "Delete draft",
    printOrPdf: "Print or save as PDF",
    paidOn: "Paid {date}",
    willRecord:
      "Marking this paid adds {amount} to your books as income on the date you choose. Until then it stays out of your totals.",
    confirmUnpaid: "Mark this unpaid? The income entry it created will be removed from your books.",
    confirmVoid: "Cancel this invoice? It stays on record but is marked void.",
    confirmDeleteDraft: "Delete this draft? This can't be undone.",
    notFound: "That invoice isn't here",
    notFoundBlurb: "It may have been deleted.",
    backToInvoices: "Back to invoices",
    allInvoices: "All invoices",
    createTitle: "Create an invoice",
    editTitle: "Edit this invoice",
    createBlurb: "It starts as a draft, so nothing is final until you send it.",
    editBlurb:
      "Changes are saved to the invoice only. Nothing reaches your books until it's marked paid.",
    whoFor: "Who it's for",
    customerName: "Customer name",
    customerNamePlaceholder: "Acme Cafe",
    customerEmail: "Email",
    customerEmailHint: "Optional — for your own records.",
    customerEmailPlaceholder: "billing@acme.com",
    issueDate: "Issue date",
    dueDate: "Due date",
    dueDateHint: "Two weeks is a common default.",
    whatCharging: "What you're charging for",
    whatChargingBlurb: "One line per item. The total works itself out.",
    description: "Description",
    descriptionPlaceholder: "Six hours of design work",
    quantity: "Qty",
    priceEach: "Price each",
    lineTotal: "Line total {amount}",
    addLine: "Add another line",
    removeLine: "Remove line {number}",
    total: "Total",
    notes: "Notes",
    notesBlurb: "Shown on the invoice. Payment terms, a thank you.",
    notesPlaceholder: "Payment by bank transfer within 14 days. Thank you!",
    createButton: "Create invoice",
    billedTo: "Billed to",
    dates: "Dates",
    issued: "Issued {date}",
    dueOn: "Due {date}",
    amountDue: "Amount due",
    errCustomer: "Who is this invoice for?",
    errNameLong: "That name is too long.",
    errEmail: "That doesn't look like an email address.",
    errDate: "Pick a date.",
    errDueBeforeIssue: "Due date can't be before the issue date.",
    errNoLines: "Add at least one item.",
    errLineDescription: "Describe what this is for.",
    errLineQuantity: "Quantity must be more than zero.",
    errLinePrice: "Price can't be negative.",
  },

  billing: {
    eyebrow: "Billing",
    title: "Your plan",
    blurb: "What you are paying for, and everything you can change about it.",
    loadingPlan: "Loading your plan.",
    loadFailed: "Your plan couldn't be loaded",
    portalFailed: "Billing couldn't be opened",
    checkoutFailed: "Checkout couldn't be started",
    genericError: "Something went wrong on our end. Nothing was charged.",
    paymentFailed: "A payment didn't go through",
    paymentFailedBody:
      "Your last payment was declined. Nothing has been switched off — Stripe will keep trying for a few days, and everything you pay for carries on working while it does.",
    paymentFailedFix:
      "Updating the card usually fixes it, and the charge goes through on the next attempt.",
    updateCard: "Update your card",
    statusActive: "Active",
    statusTrialing: "Trial",
    statusPastDue: "Payment overdue",
    statusCanceled: "Cancelled",
    statusIncomplete: "Not finished",
    statusExpired: "Expired",
    statusUnpaid: "Unpaid",
    statusPaused: "Paused",
    proPanelTitle: "SimpleBooks Pro",
    proUnlocked: "Everything in the app is unlocked on this account.",
    planLabel: "Your plan",
    pricePerMonth: "{price} per month",
    renewsLabel: "Renews",
    proEndsLabel: "Pro ends",
    chargedAgainHint: "You'll be charged again on this date.",
    lastPaidDayHint: "The last day of the month you've paid for.",
    noRenewalDate: "No renewal date has come back from Stripe yet.",
    manageBilling: "Manage billing",
    manageBillingHint: "Change your card, see receipts, or cancel.",
    proEndingTitle: "Pro is set to end",
    proEndsOn:
      "Pro stays on until {date}. After that this account goes back to the Free plan and you won't be charged again. Nothing you've recorded is deleted.",
    proEndsAfterPaidMonth:
      "Pro stays on until the end of the month you've paid for. After that this account goes back to the Free plan and you won't be charged again. Nothing you've recorded is deleted.",
    changedYourMind: "Changed your mind? Manage billing to start it up again.",
    comparePlans: "Compare the plans",
    currentPlanBadge: "Your plan",
    everything: "Everything",
    openingStripe: "Opening Stripe…",
    onThisPlan: "This is what you're on today.",
    stripeNote:
      "Payment is handled by Stripe on their own page — card details never reach SimpleBooks. You can cancel from here at any time, and keep Pro until the month you have paid for runs out.",
    successTitle: "You're on Pro",
    successBody:
      "The payment came through and everything is unlocked on this account. A receipt is on its way to your email from Stripe.",
    goToBooks: "Go to your books",
    seeYourPlan: "See your plan",
    confirming: "Confirming",
    confirmingTitle: "Confirming your payment",
    confirmingBody:
      "You're back from Stripe. We wait for Stripe itself to confirm the payment before switching this account to Pro, rather than taking the trip back here as proof — it normally takes a few seconds.",
    canLeavePage: "You can leave this page. Nothing depends on it staying open.",
    notConfirmedTitle: "This is still being confirmed",
    notConfirmedBody:
      "Your payment may still be going through. Confirmation usually takes seconds but can take a minute or two, and it will finish whether or not this page is open.",
    notConfirmedReassure:
      "Nothing is lost either way: if the payment succeeded, Pro switches on by itself. Your billing page always shows where things actually stand.",
    checkFailed: "The last check didn't get an answer",
    checkAgain: "Check again",
    goToBilling: "Go to billing",
    contactSupport:
      "If Pro still isn't showing in a few minutes, contact support and quote the reference below.",
    reference: "Reference: {reference}",
    cancelledTitle: "Checkout closed",
    cancelledBody:
      "You didn't pay anything and nothing has changed. Your books are exactly where you left them, and the Free plan carries on as before.",
    cancelledReassure:
      "Pro is there whenever you want it — there's no rush and no penalty for closing the page.",
    seePlansAgain: "Look at the plans again",
    backToBooks: "Back to your books",
    checkingPlan: "Checking your plan.",
    featureIsPro: "{feature} is part of Pro",
    trialUsed:
      "You've already had your free days. Pro is {price} a month and you can cancel whenever you like.",
    tryFree_one: "Try it free for {count} day along with everything else in Pro.",
    tryFree_other: "Try it free for {count} days along with everything else in Pro.",
    startTrial_one: "Start my {count} free day",
    startTrial_other: "Start my {count} free days",
    getPro: "Get Pro — {price} a month",
    // The legally load-bearing sentence for a card-up-front trial. Every
    // language must keep all three facts: the price, the exact date of the
    // first charge, and that cancelling before then costs nothing.
    trialDisclosure_one:
      "Free for {count} day. On {date} your card is charged {price}, then {price} every month. Cancel any time before then and you pay nothing.",
    trialDisclosure_other:
      "Free for {count} days. On {date} your card is charged {price}, then {price} every month. Cancel any time before then and you pay nothing.",
    recordsStay: "Your existing records stay where they are, on any plan.",
    exportsAlwaysWork: "Exports always work.",
    trialEndsToday: "Your free trial ends today",
    trialLastDay: "Last day of your free trial",
    trialDaysLeft_one: "{count} day left of your free trial",
    trialDaysLeft_other: "{count} days left of your free trial",
    cardChargedOn: "Your card is charged {price} on {date}.",
    thenPricePerMonth: "Then {price} a month.",
    manageOrCancel: "Manage or cancel",
    hideUntilTomorrow: "Hide until tomorrow",

    // --- the one-time trial offer shown after sign-up (/welcome)
    //
    // The number of days and the price are placeholders on purpose: they are
    // read from src/lib/pricing.ts at render time, so a change there can never
    // leave a stale "7" or "$9.99" behind on this screen.
    //
    // welcomeContinueFree is not optional decoration. It is the visible,
    // full-size way past this screen without handing over a card, and it must
    // survive every future edit and every translation.
    welcomeTitle: "Want to try everything?",
    welcomeBody_one:
      "Try SimpleBooks Pro free for {count} day. Get AI insights, receipt scanning, unlimited invoices, budgets, exports, offline syncing, and every supported language.",
    welcomeBody_other:
      "Try SimpleBooks Pro free for {count} days. Get AI insights, receipt scanning, unlimited invoices, budgets, exports, offline syncing, and every supported language.",
    welcomeFinePrint_one: "Free for {count} day, then {price}/month. Cancel anytime.",
    welcomeFinePrint_other: "Free for {count} days, then {price}/month. Cancel anytime.",
    // No plural variants: "{count}-day" is attributive and doesn't inflect in
    // English. Languages that do inflect it may add _one/_other themselves.
    welcomeStartTrial: "Start my {count}-day Pro trial",
    welcomeContinueFree: "No thanks, continue with Free",
  },

  reminder: {
    eyebrow: "Tools",
    title: "Daily reminder",
    pageBlurb:
      "Every number in this app comes from entries you log. A small nudge at the right time is the difference between a habit and a good intention.",
    cardBlurb: "A nudge to log the day, so the habit sticks.",
    onAt: "On at {time}",
    off: "Off",
    howItWorks:
      "Once the time you pick has passed, the app shows a notification the next time it's open or running in the background. It won't fire on a phone that hasn't opened the app all day — there's no server sending these, which is also why they cost nothing and no one else sees your data.",
    remindMeAt: "Remind me at",
    turnOn: "Turn on reminders",
    turnOff: "Turn off",
    saveTime: "Save time",
    sendTest: "Send a test notification now",
    installFirst: "Add it to your home screen first",
    installFirstBody:
      "iPhone only allows notifications for apps added to the home screen. Tap Share, then Add to Home Screen, open it from the new icon, and come back here.",
    blocked: "Notifications are blocked",
    blockedBody:
      "Your browser is blocking notifications for this site. You'll need to allow them in your browser settings before this can work.",
    unsupported: "This browser can't show notifications",
    unsupportedBody: "Everything else still works — you just won't get the nudge here.",
    errPickTime: "Pick a time first.",
    errDenied:
      "Your browser is blocking notifications for this site. Allow them in your browser settings, then try again.",
    errNotAllowed: "Notifications weren't allowed, so the reminder can't be shown.",
    notificationTitle: "Today's takings",
    notificationBody: "A minute now saves an evening later. Log what came in and went out.",
  },

  offline: {
    noConnection: "No connection",
    keepLogging: "You can keep logging — entries are saved on this device.",
    sending: "Sending {count}",
    waitingToSend: "Waiting to send {count}",
    waiting_one: "{count} entry waiting",
    waiting_other: "{count} entries waiting",
    wouldntSave_one: "{count} entry wouldn't save",
    wouldntSave_other: "{count} entries wouldn't save",
    showThem: "Show them",
    hideThem: "Hide them",
    sendNow: "Send now",
    tryTheseAgain: "Try these again",
    discardEntry: "Discard this entry",
    refusedTimes:
      "These were refused {count} times. Usually that means the app was updated or you were signed out — try again, and only discard one if you've already entered it another way.",
    installTitle: "Put SimpleBooks on your home screen",
    installBody:
      "Opens full screen with its own icon, and keeps working when you've got no signal.",
    installIos: "Tap the Share button in Safari, then Add to Home Screen.",
    install: "Install",
    dismiss: "Dismiss",
    signOutPending:
      "{count} entries haven't been sent yet. They'll stay on this device and go through next time you sign in on it. Sign out anyway?",
  },

  palette: {
    placeholder: "Go anywhere, or type an entry like “spent 20 on supplies”",
    inputLabel: "Search or log an entry",
    logThis: "Log this entry",
    logging: "Logging…",
    logged: "Logged: {summary}",
    queued: "Saved on this device, will send later: {summary}",
    moveHint: "↑↓ to move",
    pickHint: "↵ to pick",
    typeHint: "Type an amount to log it straight away",
    close: "Close command palette",
    dialogLabel: "Command palette",
    pageExportRecords: "Export records",
    pageHelp: "Help — how everything works",
    pageHelpLogging: "Help: logging money",
    pageHelpMonth: "Help: this month",
    pageHelpTools: "Help: tools",
    pageHelpExport: "Help: export",
  },
  tools: {
    // --- shared across the tools pages
    eyebrow: "Tools",
    didntWork: "That didn't work",
    copy: "Copy",
    copied: "Copied",
    square: "square",
    // Each is a whole phrase: the amount and the word saying which direction it
    // went can't be joined in the component.
    amountIn: "{amount} in",
    amountOut: "{amount} out",

    // --- household sharing: before you're in one
    householdTitle: "Share with someone",
    householdBlurb:
      "Share the entries you choose with a partner or housemate, and split costs fairly. Anything you don't share stays private to you.",
    householdStartHere: "Start here",
    householdStartHereBlurb: "Tell the other person who they're sharing with.",
    householdYourName: "Your name",
    householdYourNameHint: "Shown next to anything you share, so everyone knows who's who.",
    householdYourNamePlaceholder: "Alex",
    householdCreateTitle: "Start a new one",
    householdCreateBlurb: "You'll get a code to pass on.",
    householdNameIt: "Name it",
    householdNamePlaceholder: "Our place",
    householdCreating: "Creating…",
    householdCreate: "Create household",
    householdJoinTitle: "Or join with a code",
    householdJoinBlurb: "Ask them for the code under Tools.",
    householdInviteCode: "Invite code",
    householdCodePlaceholder: "ABC123",
    householdJoining: "Joining…",
    householdJoin: "Join household",

    // --- household sharing: once you're in one
    householdEyebrow: "Household",
    householdJustYou: "Just you so far — share the code below to add someone.",
    householdPeopleSharing_one: "{count} person sharing.",
    householdPeopleSharing_other: "{count} people sharing.",
    householdInviteCodeBlurb: "They sign up, then enter this under Tools.",
    householdWhosIn: "Who's in",
    householdMemberFallback: "Member {id}",
    householdOwner: "owner",
    householdYourNameTitle: "Your name in this household",
    householdShownNextTo: "Shown next to what you share",
    householdSaveName: "Save name",

    householdEveryoneShared: "What everyone has shared",
    // Two counts in one sentence. The plural follows the shared count; the
    // "none" case is its own sentence rather than a fragment swapped in.
    householdSharedWithSplit_one: "{count} shared entry, {split} marked to split.",
    householdSharedWithSplit_other: "{count} shared entries, {split} marked to split.",
    householdSharedNoSplit_one: "{count} shared entry, none marked to split.",
    householdSharedNoSplit_other: "{count} shared entries, none marked to split.",

    householdSplittingTitle: "Bills you're splitting",
    householdSplittingBlurb: "Only entries marked to split.",
    householdEachShare: "Each person's share",
    householdTotalToSplit: "Total to split",
    householdPaid: "paid {amount}",
    householdOwed: "owed {amount}",
    householdOwes: "owes {amount}",
    householdToSquareUp: "To square up",
    householdTransfer: "{from} pays {to} {amount}",
    householdAllSquare: "Everyone's square — nothing owed.",
    householdNothingToSettle: "Nothing to settle up",
    householdNothingToSettleBody:
      "Nothing is marked to split, so nobody owes anybody. Choose “Split it” when logging if you want an expense divided evenly.",
    householdNothingShared: "Nothing shared yet",
    householdNothingSharedBody:
      "When you log something, choose “Share” so the household can see it, or “Split it” to divide it evenly.",
    householdLeaveConfirm:
      "Leave this household? Anything you shared becomes private to you again.",
    householdLeaving: "Leaving…",
    householdLeave: "Leave household",

    // --- what you actually keep (product margins)
    marginsTitle: "What you actually keep",
    marginsBlurb:
      "Put in what an item costs you and what you sell it for, and see the real profit on every sale.",
    marginsYourItems: "Your items",
    marginsOverhead: "Your usual monthly costs run about {amount}.",
    marginsNoItems: "No items yet — add your first one below.",
    marginsCostSell: "Costs {cost} · sells for {price}",
    marginsRemoveItem: "Remove {name}",
    marginsYouKeep: "You keep, each",
    marginsMargin: "Margin",
    marginsPercent: "{percent}%",
    marginsLosing: "You're selling this for less than it costs you.",
    marginsUnitsToCover_one: "Sell about {count} a month to cover your usual {amount} of costs.",
    marginsUnitsToCover_other: "Sell about {count} a month to cover your usual {amount} of costs.",
    marginsAddItem: "Add an item",
    marginsItem: "Item",
    marginsItemPlaceholder: "Candle",
    marginsCostsYou: "Costs you",
    marginsSellFor: "You sell it for",
    marginsSaveItem: "Save item",

    // --- cash drawer check
    drawerTitle: "Cash drawer check",
    drawerBlurb: "Count the till at the end of the day and see whether it matches what you logged.",
    drawerTonightsCount: "Tonight's count",
    drawerDay: "Day",
    drawerStartingFloat: "Starting float",
    drawerCounted: "Counted in the drawer",
    drawerShouldBe: "Should be in the drawer",
    // One sum, so it stays one string — the order of the three amounts and the
    // words around them must be free to move.
    drawerBreakdown: "{float} float + {moneyIn} in − {moneyOut} out",
    drawerBalanced: "Balanced — nice.",
    drawerBalancedBody: "What you counted matches what you logged.",
    drawerOver: "More than expected",
    drawerOverBody: "There's {amount} more in the drawer than your entries account for.",
    drawerShort: "Short",
    drawerShortBody: "The drawer is {amount} short of what you logged.",
    drawerSaveCount: "Save count",
    drawerRecentCounts: "Recent counts",
    drawerRecentBlurb: "Your last seven days of counting up.",
    drawerCountedExpected: "{counted} counted · {expected} expected",
    drawerRemoveCount: "Remove count for {date}",

    // --- tax rate + default float
    settingsTitle: "Settings",
    settingsBlurb:
      "Set what share of income to hold back for tax, and how much cash you normally start the day with.",
    settingsTaxRate: "Hold back for tax (%)",
    settingsUsualFloat: "Usual starting float",
    settingsTaxNote:
      "Not tax advice — it just holds back a share of what you log so the bill isn't a surprise. Check the rate with your accountant.",
    settingsSave: "Save settings",

    // --- app lock
    lockTitle: "Lock this app",
    lockBlurb:
      "Hide your books behind a PIN, so someone holding your unlocked phone can't read them.",
    lockOnMessage: "Lock is on. You'll be asked for this PIN when you come back.",
    lockOffMessage: "Lock turned off.",
    lockOn: "On",
    lockOff: "Off",
    lockEveryTime: "Asks for your PIN every time you open the app.",
    lockAsksAfter_one: "Asks again after {count} minute away.",
    lockAsksAfter_other: "Asks again after {count} minutes away.",
    lockTurningOff: "Turning off…",
    lockTurnOff: "Turn off lock",
    lockChoosePin: "Choose a PIN",
    lockChoosePinBlurb: "Four to eight numbers. You'll type it when you come back to the app.",
    lockPinMismatch: "Those two PINs don't match.",
    lockNewPin: "New PIN",
    lockPinHint: "4 to 8 numbers.",
    lockConfirmPin: "Type it again",
    lockAskAgainAfter: "Ask again after",
    lockTimeoutAlways: "Every time I open it",
    lockTimeoutMinutes_one: "{count} minute away",
    lockTimeoutMinutes_other: "{count} minutes away",
    lockTimeoutHours_one: "{count} hour away",
    lockTimeoutHours_other: "{count} hours away",
    lockTurnOn: "Turn on lock",
    lockFootnote:
      "This hides the app on your device. Your account is already protected by your password, and only you can read your data — the PIN is a convenience lock on top of that, not a replacement for it. Forgotten it? Sign out and back in, then set a new one.",
  },

  help: {
    // --- the page itself
    title: "How everything works",
    blurb:
      "Every feature, what it's for, and how to use it. Search, or pick a section from the Help menu.",
    searchPlaceholder: "Search help — try “receipt”, “split”, “tax”…",
    searchLabel: "Search help",
    clearSearch: "Clear help search",
    matchCount_one: "{count} topic matches “{query}”.",
    matchCount_other: "{count} topics match “{query}”.",
    oneSectionTitle: "Showing one section",
    oneSectionBody: "You followed a link to one part of the guide.",
    noMatch: "Nothing matches “{query}”",
    noMatchHint: "Try a simpler word — “tax”, “receipt”, “export”.",
    whereToFind: "Where to find it",
    howToUse: "How to use it",
    worthKnowing: "Worth knowing",
    openIt: "Open it",
    stillStuck: "Still stuck?",
    // {link} is where the link to Ask about your money goes. Move it to wherever
    // the sentence needs it — the page splits the string there — but it must
    // appear exactly once, or the link disappears.
    stillStuckBody:
      "Try asking in your own words on {link} — it answers questions about your own figures. For anything about tax or legal matters, check with an accountant rather than relying on the app.",

    // --- section headings
    groupStart: "Getting started",
    groupLogging: "Logging money",
    groupDay: "Your day",
    groupMonth: "This month",
    groupInvoices: "Invoices",
    groupTools: "Tools",
    groupExport: "Export",
    groupOffline: "Phone and no signal",
    groupPrivacy: "Privacy and your data",

    // --- getting started
    firstRunTitle: "Setting up for the first time",
    firstRunWhere: "Today",
    firstRunSummary: "Two steps get the rest of the app working: one entry and a tax percentage.",
    firstRunKeywords: "onboarding setup new account begin",
    firstRunStep1: "On Today, type what you made into the setup box and save it.",
    firstRunStep2:
      "Set the share of income you want held back for tax — 25% is a common starting point.",
    firstRunStep3:
      "The setup panel disappears once both are done. There's a Skip link if you'd rather not.",
    firstRunNote1:
      "Nothing here is permanent — you can change the tax rate any time under Tools, and delete any entry.",

    paletteTitle: "Jump anywhere with ⌘K",
    paletteWhere: "Anywhere",
    paletteSummary:
      "One shortcut to reach any page, or log an entry without leaving what you're doing.",
    paletteKeywords: "command palette search shortcut ctrl k keyboard",
    paletteStep1: "Press ⌘K (Ctrl+K on Windows), or click Search in the top bar.",
    paletteStep2: "Type part of a page name — initials work too, so “wmw” finds Where money went.",
    paletteStep3: "Or type an entry like “spent 20 on supplies” and pick Log this entry.",
    paletteStep4: "Arrow keys move, Enter picks, Escape closes.",

    themeTitle: "Dark or light",
    themeWhere: "Top bar",
    themeSummary: "The app is dark by default; switch to light for bright places.",
    themeKeywords: "theme dark light mode sun moon outdoors",
    themeStep1: "Click the sun or moon icon in the top bar. Your choice is remembered.",
    themeNote1: "Light mode is worth using outdoors — dark screens are hard to read in sunlight.",

    // --- logging money
    quickAddTitle: "Quick add — just type it",
    quickAddWhere: "Today → Add an entry",
    quickAddSummary: "Write it how you'd say it and the fields fill themselves in.",
    quickAddKeywords: "quick type parse fast entry natural language",
    quickAddStep1: "Type something like “spent 42.50 at costco on groceries” or “made 300”.",
    quickAddStep2: "Check the preview line underneath — it shows exactly what it understood.",
    quickAddStep3: "Press Add.",
    quickAddNote1:
      "It learns from you: categorise Costco as Groceries once and it fills that in automatically next time.",
    quickAddNote2: "“yesterday” and dates like 2026-08-01 both work.",

    voiceTitle: "Add by voice",
    voiceWhere: "Today → Add an entry",
    voiceSummary: "Say the entry instead of typing it.",
    voiceKeywords: "voice speech microphone dictate talk say",
    voiceStep1: "Tap the microphone next to the quick add box.",
    voiceStep2: "Say something like “spent twenty dollars on lunch”.",
    voiceStep3: "It fills the box in — check it, then press Add.",
    voiceNote1:
      "Works in Chrome and Safari. In Firefox the microphone button doesn't appear, since the browser can't do it.",
    voiceNote2: "Amounts in words are handled: “three hundred and fifty” becomes 350.",
    voiceNote3: "Your browser needs microphone permission the first time.",

    fullFormTitle: "The full entry form",
    fullFormWhere: "Today → Add an entry",
    fullFormSummary: "For when you want to set everything by hand.",
    fullFormKeywords: "form manual date money made spent category cash card",
    fullFormStep1: "Set the date, then money made and/or money spent.",
    fullFormStep2: "Add what it was spent on, and where (the shop name) if you want.",
    fullFormStep3: "Choose Cash, Card or Other — this is what makes the cash drawer check work.",
    fullFormStep4: "Attach a receipt photo if you have one.",

    receiptsTitle: "Receipt photos that fill themselves in",
    receiptsWhere: "Today → Add an entry",
    receiptsSummary: "Photograph a receipt and it reads the total, category, date and shop.",
    receiptsKeywords: "receipt photo scan ocr camera picture",
    receiptsStep1: "Choose or take a photo in the Receipt photo field.",
    receiptsStep2: "Wait a moment — it reads the receipt and fills in what it found.",
    receiptsStep3: "Check the figures before saving. The photo stays attached to the entry.",
    receiptsNote1:
      "Reading receipts needs an AI key configured. Without one, everything else still works and you just type the details yourself.",
    receiptsNote2:
      "Receipt photos are private to you and stored securely, even if the entry is shared.",

    editingTitle: "Fixing or removing entries",
    editingWhere: "Today",
    editingSummary: "Delete an entry, attach a receipt later, or change who can see it.",
    editingKeywords: "delete remove edit mistake wrong receipt share",
    editingStep1: "Find the entry in the list on Today.",
    editingStep2: "The camera icon attaches or replaces a receipt photo.",
    editingStep3: "The people icon changes who can see it (only if you're in a household).",
    editingStep4: "The bin icon deletes it — it asks first, and this can't be undone.",
    editingNote1: "To change the figures themselves, use Find an entry — see below.",

    findEntryTitle: "Find an entry, and correct it",
    findEntryWhere: "Today → Find an entry",
    findEntrySummary: "Search everything you've logged, then tap one to change it.",
    findEntryKeywords:
      "search find filter edit correct fix change typo mistake history look up amount date wrong",
    findEntryStep1: "Type anything you remember — a shop, a category, a date, even the amount.",
    findEntryStep2:
      "Narrow further with More filters: category, cash or card, a date range, or an amount range.",
    findEntryStep3: "Tap a result to open it, change what's wrong, and Save changes.",
    findEntryNote1:
      "Every word you type has to match, so “costco groceries” narrows the list rather than widening it.",
    findEntryNote2:
      "The totals line adds up whatever is on screen, so a search doubles as a quick report — filter to one category and you have that category's total.",
    findEntryNote3:
      "In a household, anyone can correct a shared entry, but only whoever logged it can delete it.",
    findEntryNote4: "Searching happens on your device, so it's instant and works offline.",

    // --- your day
    safeToSpendTitle: "Safe to spend today",
    safeToSpendWhere: "Today",
    safeToSpendSummary:
      "One number: what you can spend now without causing a problem later this month.",
    safeToSpendKeywords: "safe spend daily allowance budget left",
    safeToSpendNote1:
      "If you've set budgets, it's what's left of them spread over the days remaining.",
    safeToSpendNote2:
      "If you haven't, it's cash in hand minus bills still due this month, spread over the days left.",
    // The app keeps amounts in USD in every language, so the figure stays $0.00 —
    // only the digit grouping follows the reader's locale.
    safeToSpendNote3:
      "It shows $0.00 and turns red when you're behind, rather than pretending there's room.",

    dueSoonTitle: "Bills due soon",
    dueSoonWhere: "Today",
    dueSoonSummary: "A warning at the top when something's due within five days.",
    dueSoonKeywords: "due reminder alert bills warning soon",
    dueSoonNote1: "It only appears when you have recurring bills set up and one is close.",
    dueSoonNote2: "Set bills up under This month → Bills.",

    streaksTitle: "Streaks",
    streaksWhere: "Today → Your streaks",
    streaksSummary: "How many days in a row you've logged, been profitable, or not spent.",
    streaksKeywords: "streak habit run profitable no spend record",
    streaksNote1:
      "A no-spend day only counts on days you actually logged something — forgetting to use the app doesn't earn you a streak.",
    streaksNote2:
      "Streaks don't break just because you haven't logged today yet; they count from yesterday.",

    askTitle: "Asking questions about your money",
    askWhere: "Today → Ask about your money",
    askSummary: "Plain-English questions about your own numbers.",
    askKeywords: "chat ai ask question help advice",
    askStep1: "Type a question like “what did I spend the most on?” or “can I afford $200?”",
    askStep2: "Tap one of the suggested questions to see the kind of thing it handles.",
    askNote1: "It answers from your own entries and never invents figures about your business.",
    askNote2:
      "It handles spending, categories, comparisons, budgets, bills, stores, goals, outlook, tax and margins.",
    askNote3: "It doesn't know your bank balance, debts or paydays — only what you've logged here.",

    // --- this month
    monthOverviewTitle: "Month overview",
    monthOverviewWhere: "This month → Overview",
    monthOverviewSummary: "Money in, money out and profit for any month.",
    monthOverviewKeywords: "monthly totals profit loss overview",
    monthOverviewStep1: "Use the arrows either side of the month name to move between months.",
    monthOverviewNote1:
      "The month you pick is remembered as you move between the other month pages.",

    categoriesTitle: "Where money went",
    categoriesWhere: "This month → Where money went",
    categoriesSummary: "Your spending split by category, biggest first.",
    categoriesKeywords: "categories breakdown pie chart spending",

    daybydayTitle: "Day by day",
    daybydayWhere: "This month → Day by day",
    daybydaySummary: "Each day of the month as a bar — green for up, red for down.",
    daybydayKeywords: "daily chart bars days",

    weekTitle: "Your week in plain English",
    weekWhere: "This month → Your week",
    weekSummary: "A short written recap of the last seven days.",
    weekKeywords: "digest weekly recap summary plain english",
    weekNote1: "Written from your numbers, including how the week compares with the one before.",

    outlookTitle: "Can you cover what's coming",
    outlookWhere: "This month → Can you cover it",
    outlookSummary: "A 30-day look ahead: will your money cover the bills due?",
    outlookKeywords: "forecast outlook runway rent future shortfall predict",
    outlookNote1:
      "Built from your typical day over recent history, plus each recurring bill on the day it falls.",
    outlookNote2: "It warns you with a date if it thinks you'll run short.",
    outlookNote3:
      "With only a few days logged it says so plainly instead of pretending to be precise.",

    busydaysTitle: "Busy and quiet days",
    busydaysWhere: "This month → Busy and quiet days",
    busydaysSummary: "Which days of the week actually bring money in.",
    busydaysKeywords: "slow quiet busy weekday pattern best day",
    busydaysNote1:
      "Needs about three weeks of entries before it means anything, and it'll tell you so.",

    budgetsTitle: "Budgets",
    budgetsWhere: "This month → Budgets",
    budgetsSummary: "A monthly cap per category, with a warning before you blow it.",
    budgetsKeywords: "budget limit cap category alert overspend",
    budgetsStep1: "Enter a category and a monthly limit, then Save budget.",
    budgetsStep2: "Watch the bars — they turn red at 80% and are marked Over past 100%.",
    budgetsNote1: "Budgets also drive the “safe to spend today” number on Today.",

    goalsTitle: "Savings goals",
    goalsWhere: "This month → Savings goals",
    goalsSummary: "Something you're putting money aside for, and how close you are.",
    goalsKeywords: "goal saving target save up",
    goalsStep1: "Add a name, a target amount, how much you've saved so far, and optionally a date.",
    goalsNote1:
      "With a target date it works out what to save each week; without one it estimates from your recent pace.",

    billsTitle: "Bills, subscriptions and recurring costs",
    billsWhere: "This month → Bills",
    billsSummary: "What's due, what looks like a subscription, and your recurring rules.",
    billsKeywords: "bills recurring subscription due calendar rent detect",
    billsStep1:
      "Add a recurring bill with an amount, category, weekly or monthly, and a start date.",
    billsStep2: "It then creates those expense entries for you automatically as the dates pass.",
    billsNote1:
      "It also spots repeating charges in your history and offers them as bills to track in one tap.",
    billsNote2:
      "Detection is deliberately cautious: it needs three or more sightings, similar amounts and steady gaps, so it won't flag random shopping trips.",

    // --- invoices
    invoiceCreateTitle: "Billing a customer",
    invoiceCreateWhere: "Invoices → New invoice",
    invoiceCreateSummary: "Make an invoice, then send it and chase it from one list.",
    invoiceCreateKeywords: "invoice bill customer client charge create send draft number",
    invoiceCreateStep1:
      "Enter who it's for, the dates, and one line per thing you're charging for.",
    invoiceCreateStep2: "The total works itself out as you type.",
    invoiceCreateStep3: "Create it — it starts as a draft, so nothing is final.",
    invoiceCreateStep4:
      "When you've actually sent it to the customer, open it and tap Mark as sent.",
    invoiceCreateNote1:
      "Numbers run in sequence and are never reused, even if you cancel one. Gaps are normal; two invoices sharing a number would not be.",
    invoiceCreateNote2:
      "A draft can be edited or deleted. Once sent, it can be edited or cancelled but not deleted, so the numbering trail stays intact.",
    invoiceCreateNote3:
      "Print or save as PDF gives you a clean copy with none of the app around it.",

    invoicePaidTitle: "Getting paid, and what it does to your books",
    invoicePaidWhere: "Invoices → open one",
    invoicePaidSummary: "Marking an invoice paid is what turns it into income.",
    invoicePaidKeywords: "paid payment mark unpaid income books entry outstanding overdue owed",
    invoicePaidStep1: "Open the invoice and tap Mark as paid.",
    invoicePaidStep2:
      "Choose the date the money actually arrived — not today, if they're different.",
    invoicePaidNote1:
      "This creates a normal income entry in your books on that date, so it flows into your totals, your month, your tax set-aside and your export like any other money in.",
    invoicePaidNote2:
      "Until it's marked paid it stays out of your figures completely. An unpaid invoice isn't income, and counting it would inflate your profit and your tax.",
    invoicePaidNote3: "Changed your mind? Mark as unpaid removes that entry again.",
    invoicePaidNote4:
      "Anything past its due date shows as overdue automatically — that's worked out from the date, so it's never stale.",

    // --- tools
    householdTitle: "Sharing with someone",
    householdWhere: "Tools → Household",
    householdSummary: "Share chosen entries with a partner or housemate, and split bills fairly.",
    householdKeywords: "household share partner housemate split settle invite code",
    householdStep1: "Create a household and you get a six-character invite code.",
    householdStep2: "The other person signs up, opens Tools → Household, and enters that code.",
    householdStep3: "When you log something, choose Just me, Share, or Split it.",
    householdNote1:
      "Everything stays private unless you choose otherwise — joining a household doesn't expose anything you've already logged.",
    householdNote2:
      "Share means they can see it. Split it means it's also divided evenly and appears in the who-pays-who summary.",
    householdNote3:
      "Anyone in the household can fix a shared entry, but only whoever logged it can delete it.",
    householdNote4: "Leaving a household turns your shared entries private again.",

    marginsTitle: "What you actually keep per item",
    marginsWhere: "Tools → Item margins",
    marginsSummary: "Enter cost and selling price, see the real profit per sale.",
    marginsKeywords: "margin markup profit per item price product pricing",
    marginsNote1:
      "It also tells you roughly how many you need to sell each month to cover your usual costs.",
    marginsNote2: "If you're selling something at a loss it says so outright.",

    drawerTitle: "Cash drawer check",
    drawerWhere: "Tools → Cash drawer",
    drawerSummary: "Count the till and see whether it matches what you logged.",
    drawerKeywords: "cash drawer till count reconcile short over float",
    drawerStep1: "Enter the day, your starting float, and what you actually counted.",
    drawerStep2: "It shows what the drawer should hold and the gap, before you save.",
    drawerNote1:
      "Only entries marked Cash count toward the expected figure. If you've never marked any, everything is treated as cash.",
    drawerNote2:
      "The expected amount is worked out on the server from your entries, so it can't drift.",

    taxTitle: "Tax set-aside",
    taxWhere: "Tools → Tax set-aside",
    taxSummary: "Hold back a share of income so the tax bill isn't a shock.",
    taxKeywords: "tax set aside percentage hold back quarterly",
    taxStep1: "Set a percentage. The running total updates as you log income.",
    // The quoted word is the one the category matcher looks for, and the matcher
    // is still English-only — see the note at the top of zh.ts and ur.ts. Leave
    // “tax” in English inside the quotes until the matcher learns the language.
    taxNote1: "Log tax payments with “tax” in the category and they count against the total.",
    taxNote2: "This isn't tax advice — confirm the right percentage with an accountant.",

    reminderTitle: "Daily reminder",
    reminderWhere: "Tools → Daily reminder",
    reminderSummary: "A nudge at a time you pick, so logging becomes a habit.",
    reminderKeywords: "reminder notification nudge daily alert time habit notify",
    reminderStep1: "Pick the time that suits your day — after closing usually works.",
    reminderStep2: "Tap Turn on reminders and allow notifications when your browser asks.",
    reminderNote1:
      "Worth being clear about how it works: the app shows the reminder when it notices the time has passed. It isn't an alarm clock sent from a server, so it won't fire on a phone that hasn't opened the app all day.",
    reminderNote2:
      "On iPhone you have to add the app to your home screen first — Apple doesn't allow notifications otherwise.",
    reminderNote3:
      "It stays quiet if you've already logged something that day. The point is the habit, not the notification.",
    reminderNote4: "It only ever appears once a day, even if you open the app several times.",
    reminderNote5:
      "If you've blocked notifications for the site, the app will say so rather than pretending it's on.",

    lockTitle: "Locking the app",
    lockWhere: "Tools → Lock this app",
    lockSummary: "A PIN so someone holding your unlocked phone can't read your books.",
    lockKeywords: "lock pin privacy security passcode biometric",
    lockStep1: "Choose a 4–8 digit PIN, type it twice, and pick when it should ask again.",
    lockStep2: "Use Turn off lock to remove it.",
    lockNote1:
      "Your PIN is stored scrambled and checked on the server — it's never kept as plain numbers.",
    lockNote2:
      "This hides the app on your device. Your account is already protected by your password, so the PIN is convenience on top of that, not a replacement.",
    lockNote3:
      "Forgotten it? Sign out, sign back in with your email and password, then set a new one.",

    // --- export
    exportTitle: "Sending records to your accountant",
    exportWhere: "Export",
    exportSummary: "Download your entries as a spreadsheet or a tidy PDF.",
    exportKeywords: "export csv pdf accountant download spreadsheet records",
    exportStep1: "Pick a date range, or use This month / Last month / Everything.",
    exportStep2: "Check the preview — it's exactly what ends up in the file.",
    exportStep3: "Choose Download CSV or Download PDF.",
    exportNote1:
      "Both include date, money in, money out, category, where, and a note, plus a totals row.",
    exportNote2:
      "Export → Download CSV and Download PDF in the menu skip straight to the download using your current range.",

    // --- phone and no signal
    installTitle: "Put it on your phone",
    installWhere: "Today, or your browser menu",
    installSummary: "Install it so it opens like an app, full screen, with its own icon.",
    installKeywords: "install app home screen pwa download icon standalone phone",
    installStep1: "On Android or Chrome, tap Install when the app offers it on Today.",
    installStep2: "On iPhone, tap the Share button in Safari, then Add to Home Screen.",
    installNote1:
      "Installing is what makes offline logging and daily reminders work properly, especially on iPhone.",
    installNote2: "It's the same app and the same account — nothing to set up again.",

    offlineLoggingTitle: "Logging with no signal",
    offlineLoggingWhere: "Anywhere",
    offlineLoggingSummary: "Keep logging in a basement, a market, or a dead spot. Nothing is lost.",
    offlineLoggingKeywords: "offline no signal no internet connection sync queue market basement",
    offlineLoggingNote1:
      "A bar appears at the top when there's no connection. Carry on logging as normal.",
    offlineLoggingNote2:
      "Entries are held on your device and sent automatically the moment you're back online, in the order you logged them.",
    // “Show them” is a button in the offline bar — match offline.showThem so the
    // instruction names the button the reader actually sees.
    offlineLoggingNote3: "Tap “Show them” in that bar to see exactly what's still waiting.",
    offlineLoggingNote4:
      "Pages you've already opened still work offline, and your figures are readable from the last time they loaded.",
    offlineLoggingNote5:
      "One thing that can't work offline: attaching a receipt photo needs a connection. The entry saves and you add the photo later.",
    offlineLoggingNote6:
      "If an entry is refused several times the app parks it and tells you, rather than dropping it quietly. You can retry or discard it yourself.",
    offlineLoggingNote7:
      "Signing out won't delete anything still waiting — it warns you and keeps it for the next time you sign in on that device.",

    // --- privacy and your data
    privacyTitle: "Who can see your numbers",
    privacyWhere: "Everywhere",
    privacySummary: "Your entries are yours. Nothing is shared unless you choose to share it.",
    privacyKeywords: "privacy security data who can see safe encryption",
    privacyNote1:
      "Access is enforced by the database itself, not just the app, so another account can't read your entries even in principle.",
    privacyNote2:
      "The offline copy of your figures is wiped when you sign out, so it can't be read by whoever uses the device next.",
    privacyNote3: "Household sharing is per entry and always a deliberate choice.",
    privacyNote4: "Receipt photos sit in private storage that only you can open.",
    privacyNote5: "You can export everything you've logged at any time, and delete any entry.",
  },

  onboarding: {
    title: "Let's set up your books",
    blurb: "Two quick things and the rest of the app starts working properly.",
    stepsDone_one: "{count} of {total} done",
    stepsDone_other: "{count} of {total} done",
    progressLabel: "Setup progress",
    entryStepTitle: "Log what you made today",
    entryStepDone: "First entry logged",
    entryStepDoneBlurb: "Nice — your totals and charts are live now.",
    amountLabel: "Money made today",
    taxStepTitle: "Decide what to hold back for tax",
    taxStepDone: "Holding back {rate}% for tax",
    taxStepDoneBlurb: "You can change this any time under {section}.",
    rateLabel: "Percentage of income",
    setRate: "Set",
    taxHint:
      "A rough guess is fine — 25% is a common starting point. Check the real figure with an accountant; this just stops the bill being a surprise.",
    skip: "Skip this",
  },

  empty: {
    logFirstEntry: "Log your first entry",
    samplePreview: "Here's what this will look like",
  },

  export: {
    eyebrow: "Export",
    title: "Export your records",
    blurb:
      "Pick the dates you need, then download a spreadsheet or a tidy PDF for your accountant.",

    dateRange: "Date range",
    dateRangeHint: "Leave both blank to export everything.",
    from: "From",
    to: "To",
    thisMonth: "This month",
    lastMonth: "Last month",
    everything: "Everything",

    entryCount_one: "{count} entry",
    entryCount_other: "{count} entries",
    labelIn: "in",
    labelOut: "out",
    labelNet: "net",

    columnDate: "Date",
    columnCategory: "Category",
    columnIn: "In",
    columnOut: "Out",
    totalsRow: "Totals",
    totalsNet: "({amount} net)",

    previewTitle: "Preview — this is what you'll get",
    previewNote:
      "This is exactly what goes into the CSV and PDF below — the PDF also adds your business name and the date range as a header.",

    sampleBadge: "Sample",
    sampleTitle: "What your export will look like",
    sampleBlurb:
      "You don't have entries in this date range yet, so here's a made-up example with fake numbers — just to show you what the CSV and PDF export will include once you start logging your daily money in and out.",
    sampleNote:
      "Every entry becomes a row with its date, category, and amounts, plus a totals row at the bottom. The real download buttons below only turn on once you have actual entries in range.",
    sampleCategorySupplies: "Supplies",
    sampleCategoryRent: "Rent",

    nothingToDownload: "Nothing to download for these dates yet",
    nothingToDownloadBody: "Pick a wider range above, then try again.",

    downloadCsv: "Download CSV",
    downloadPdf: "Download PDF",
  },

  landing: {
    // --- shared across the header, hero and closing call to action
    startFree: "Start free",
    signIn: "Sign in",

    // --- landing-header.tsx
    homeLabel: "SimpleBooks — home",
    navLabel: "Site",

    // --- hero.tsx
    heroTitle: "Know where your business stands, today",
    heroBody:
      "Write down the money coming in and going out as it happens. SimpleBooks adds it up for you, so at any point in the day you can see whether you’re ahead — without a spreadsheet, and without knowing the first thing about bookkeeping.",
    heroSeeHowItWorks: "See how it works",
    heroReassuranceSpeed: "About ten seconds an entry",
    heroReassuranceOffline: "Keeps working with no signal",
    // {count} is TRIAL_DAYS, read from pricing.ts. Never write the number here.
    heroReassuranceTrial_one: "Free for {count} day, cancel any time",
    heroReassuranceTrial_other: "Free for {count} days, cancel any time",

    // --- product-preview.tsx (an invented market stall; none of it is real data)
    previewToday: "Today",
    previewExampleBadge: "Example screen",
    previewNetLabel: "Today's net",
    previewNetHint: "You're ahead on the day.",
    previewMoneyIn: "Money in",
    previewMoneyOut: "Money out",
    previewAllTime: "All time",
    // {amount} is the formatted figure, rendered as a component. Put it wherever
    // the sentence needs it — the page splits the string there — but keep it.
    previewAllTimeIn: "{amount} in",
    previewAllTimeOut: "{amount} out",
    // {number} is the bill count, rendered in its own span so the digits keep
    // their figure styling. It must appear exactly once.
    previewBillsDue_one: "{number} bill due soon",
    previewBillsDue_other: "{number} bills due soon",
    previewBillsHint: "Worth covering before it catches you out.",
    previewBillRent: "Pitch rent",
    previewBillPhone: "Phone",
    previewBillDueTomorrow: "due tomorrow",
    previewBillDueInDays_one: "due in {count} day",
    previewBillDueInDays_other: "due in {count} days",
    previewRecentEntries: "Recent entries",
    previewDateMonday: "Mon 4",
    previewDateSunday: "Sun 3",
    previewEntryTakings: "Stall takings — morning",
    previewEntryWholesaler: "Wholesaler — vegetables",
    previewEntryInvoicePaid: "Invoice #{number} paid",
    previewEntryDiesel: "Van diesel",
    previewMethodCash: "Cash",
    previewMethodCard: "Card",
    previewMethodBankTransfer: "Bank transfer",
    previewCaption:
      "An example of the daily screen. Every figure above is made up for illustration — it isn’t a real business and it isn’t anyone’s data.",

    // --- benefits.tsx
    benefitsEyebrow: "What it does",
    benefitsTitle: "Everything a one-person business needs, and nothing it doesn't",
    benefitsDescription:
      "No chart of accounts, no double entry, no jargon. Just the things you do every day.",
    benefitLoggingTitle: "Logging takes seconds",
    benefitLoggingBody:
      "Type or say what came in or went out and it's saved before the next customer.",
    benefitAskTitle: "Ask about your own figures",
    benefitAskBody:
      "Ask something like “how was last week?” and get an answer in the same plain words.",
    benefitReceiptTitle: "Photograph a receipt",
    benefitReceiptBody:
      "Take a picture and the shop, date and amount fill themselves in for you to check.",
    benefitInvoiceTitle: "Send an invoice",
    benefitInvoiceBody:
      "Make one in a minute, send it, and see at a glance which ones are still unpaid.",
    benefitBudgetsTitle: "Budgets, bills and goals",
    benefitBudgetsBody:
      "Set what you mean to spend, when bills land, and what you're putting money aside for.",
    benefitOfflineTitle: "Works with no signal",
    benefitOfflineBody:
      "Keep logging in a market hall or a basement; it catches up when you're back online.",
    benefitPrivacyTitle: "Your figures stay yours",
    benefitPrivacyBody:
      "Your books are private to your account and only shared with someone you invite.",

    // --- how-it-works.tsx
    howItWorksEyebrow: "How it works",
    howItWorksTitle: "Three steps, and you're keeping books",
    howItWorksDescription:
      "You can do the first one this afternoon and stop there. The rest is waiting when you want it.",
    // Screen-reader only, read immediately before the step's title. The colon is
    // part of the string because it is written differently in some scripts.
    stepNumber: "Step {number}:",
    stepLogTitle: "Write the money down",
    stepLogBody:
      "Cash in the tin, a card payment, a bag of stock — add it as it happens. One line, a few seconds.",
    stepSeeTitle: "See where you stand",
    stepSeeBody:
      "Today, this week and this month are worked out for you. No formulas, no waiting until the end of the month.",
    stepAskTitle: "Ask, send and plan",
    stepAskBody:
      "Ask a question about your own numbers, send an invoice, and set the budgets, bills and savings goals you want to keep to.",

    // --- languages.tsx
    languagesEyebrow: "Languages",
    languagesTitle: "In your language, not translated at you",
    languagesDescription:
      "The whole app — buttons, help, dates and amounts — speaks all {count}. Change it any time from the language button at the top.",
    languagesRtlNote:
      "Urdu reads right to left, and the layout mirrors with it rather than leaving the text stranded in a left-to-right shell.",

    // --- testimonials.tsx (deliberately fake, and the section says so)
    testimonialsEyebrow: "Customer stories",
    testimonialsTitle: "We haven't got any of these yet",
    testimonialsDescription:
      "Nobody below is a real person and none of these are real quotes. They are placeholders showing where customer stories will sit once real SimpleBooks users have used it and agreed to be quoted by name.",
    testimonialExampleBadge: "Example",
    testimonialNamePending: "Name to be added",
    testimonialTraderQuote:
      "This is a placeholder. A real quote from a market trader about their daily takings will go here.",
    testimonialTraderTrade: "Market trader",
    testimonialCafeQuote:
      "This is a placeholder. A real quote from a café owner about receipts and suppliers will go here.",
    testimonialCafeTrade: "Café owner",
    testimonialCleanerQuote:
      "This is a placeholder. A real quote from a self-employed cleaner about invoices will go here.",
    testimonialCleanerTrade: "Self-employed cleaner",

    // --- pricing.tsx
    pricingEyebrow: "Pricing",
    // {count} and {day} both come from TRIAL_DAYS in pricing.ts. Never type the
    // number into the translation — a price or trial change must move it here.
    pricingTitle_one: "Try everything free for {count} day",
    pricingTitle_other: "Try everything free for {count} days",
    pricingDescription:
      "We ask for a card so the trial can roll straight into a subscription. Cancel any time before day {day} and nothing is charged.",
    pricingMostPopular: "Most popular",
    pricingNote:
      "Both buttons take you to sign-up first — an account has to exist before there’s anything to bill. Prices are in US dollars.",
    // What a zero price reads as. Every other price is a formatted number.
    priceFree: "Free",

    planFreeName: "Free",
    planFreeCadence: "forever",
    planFreeTagline: "Your books stay yours, and you can still keep a daily record.",
    planFreeCta: "Continue on Free",
    planFreeBulletLog: "Log money in and money out by hand",
    planFreeBulletTotals: "Today's totals, and this month's",
    planFreeBulletExports: "CSV and PDF exports — always",
    planFreeBulletLanguages: "All {count} languages",

    planProName: "Pro",
    planProCadence: "per month",
    planProTagline_one: "Free for {count} day. Cancel any time before it ends.",
    planProTagline_other: "Free for {count} days. Cancel any time before it ends.",
    planProCta_one: "Start my {count} free day",
    planProCta_other: "Start my {count} free days",
    planProBulletSearch: "Search and correct every entry you've logged",
    planProBulletInsights: "Streaks, your week, busy days and where money went",
    planProBulletCashTools: "Item margins, cash drawer and tax set-aside",
    planProBulletBills: "Bills calendar, plus subscriptions it spots for you",
    planProBulletAsk: "Ask questions about your own numbers",
    planProBulletReceipts: "Snap a receipt and it fills itself in",
    planProBulletInvoices: "Unlimited invoices, budgets and savings goals",
    planProBulletReminder: "A daily reminder to write the day down",
    planProBulletSharing: "Share with a partner or housemate",
    planProBulletOffline: "Keeps working with no signal, syncs later",
    planProBulletExports: "CSV and PDF exports for your accountant",
    planProBulletLanguages: "All {count} languages",

    // --- faq.tsx
    faqEyebrow: "Questions",
    faqTitle: "Before you sign up",
    faqAccountingQuestion: "Do I need to know anything about accounting?",
    faqAccountingAnswer:
      "No. If you can write down “sold $40 of veg” you can use SimpleBooks. There are no debits, credits, journals or double entry anywhere in it — you record money in and money out, and it does the adding up. It's a record of your trading, not a substitute for an accountant at tax time.",
    faqCancelQuestion: "Can I cancel?",
    faqCancelAnswer:
      "Yes, any time, in one click from the Billing page — no phone call, no notice period, no one trying to talk you out of it. Cancel during the free week and you are never charged. Cancel later and you keep Pro until the month you have paid for runs out, then drop to the free plan. Your entries stay exactly where they are, and exports keep working whatever plan you are on.",
    faqPrivacyQuestion: "Who can see my figures?",
    faqPrivacyAnswer:
      "You, and anyone you deliberately invite to share a book with you. Your entries aren't sold, and they aren't shown to other SimpleBooks users. You can export everything to CSV or PDF whenever you like, and deleting your account deletes your books.",
    faqLanguagesQuestion: "Which languages does it speak?",
    // {languages} is where the list of language names goes — the page splits the
    // string there and renders them emphasised. Move it wherever the sentence
    // needs it, but it must appear exactly once or the list disappears.
    faqLanguagesAnswer:
      "{count}, and all of them cover the whole app rather than just the front page: {languages}. You can switch at any time from the language button in the top bar.",
    faqBillingQuestion: "How does billing work?",
    // {count} is TRIAL_DAYS from pricing.ts.
    faqBillingAnswer_one:
      "Pro is free for the first {count} day. We ask for your card at the start so the trial can turn into a subscription without you doing anything — and we tell you, in the app and by the countdown at the top of every page, exactly when the first charge lands and what it will be. Cancel before then and nothing is taken. Payments are handled by Stripe, which holds the card details; they never pass through SimpleBooks.",
    faqBillingAnswer_other:
      "Pro is free for the first {count} days. We ask for your card at the start so the trial can turn into a subscription without you doing anything — and we tell you, in the app and by the countdown at the top of every page, exactly when the first charge lands and what it will be. Cancel before then and nothing is taken. Payments are handled by Stripe, which holds the card details; they never pass through SimpleBooks.",

    // --- closing-cta.tsx
    closingTitle: "Start with today’s takings",
    // {count} is TRIAL_DAYS from pricing.ts.
    closingBody_one:
      "One entry is enough to begin. Everything is free for {count} day — cancel before it is up and you pay nothing at all.",
    closingBody_other:
      "One entry is enough to begin. Everything is free for {count} days — cancel before the week is up and you pay nothing at all.",

    // --- landing-footer.tsx
    footerNavLabel: "Footer",
    footerPrivacy: "Privacy",
    footerTerms: "Terms",
    footerContact: "Contact",
    footerPricing: "Pricing",
    footerDisclaimer:
      "SimpleBooks is a record-keeping tool, not an accountant. It won’t file your tax return or tell you what you owe.",
  },

  lock: {
    // --- the lock screen itself
    preparing: "Getting your books ready…",
    locked: "Locked",
    enterPin: "Enter your PIN",
    blurb: "Your books stay hidden until you unlock them on this device.",
    pinLabel: "PIN",
    pinHint: "4 to 8 numbers.",
    checking: "Checking…",
    unlock: "Unlock",
    pinWrong: "That PIN didn't match.",
    checkFailed: "Couldn't check that just now. Try again.",
    tooManyTries: "Too many tries",
    tooManyTriesBody: "Sign out and back in if you've forgotten your PIN.",
    forgotten:
      "Forgotten it? Sign out and sign back in with your email and password, then set a new PIN under Tools.",

    // --- why a PIN was rejected (pin.ts → pinProblemKey())
    pinLength: "Use 4 to 8 numbers.",
    pinRepetitive: "That's too easy to guess — try something less repetitive.",
    pinCommon: "That's one of the most common PINs — pick another.",
  },

  receipt: {
    photoAlt: "Receipt photo",
    add: "Add receipt photo",
    replace: "Replace receipt photo",
    remove: "Remove receipt photo",
  },

  errors: {
    notFoundCode: "404",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you're looking for doesn't exist or has been moved.",
    goHome: "Go home",
    failedTitle: "This page didn't load",
    failedBody: "Something went wrong on our end. You can try refreshing or head back home.",
    tryAgain: "Try again",
  },
} as const;

export type Dictionary = typeof en;
