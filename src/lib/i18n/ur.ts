import type { PartialDictionary } from "./translate";

/**
 * Urdu (ur-PK).
 *
 * MACHINE-DRAFTED — A NATIVE URDU SPEAKER MUST REVIEW THIS FILE BEFORE ANYONE
 * RELIES ON THE APP FOR FINANCIAL DECISIONS. Wrong wording on a money label is
 * not a cosmetic bug: someone can mark the wrong invoice paid, or read a loss
 * as a profit.
 *
 * Register: everyday shopkeeper Urdu, polite آپ form throughout. Not the
 * formal Persianate register you'd find in a bank form.
 *
 * Loanwords deliberately preferred over formal coinages, because they are what
 * a Pakistani shopkeeper actually says:
 *  - "انٹری" for entry (not اندراج)
 *  - "انوائس" for invoice (not بیجک/چالان)
 *  - "ڈرافٹ" for draft, "بجٹ" for budget, "فلٹر" for filter, "ٹولز" for tools
 *  - "نیٹ" for net (خالص reads like an accountant's word)
 *  - "رسید" kept native for receipt — it is the ordinary word, no loan needed
 *
 * Terms a reviewer should look at hardest:
 *  - nav.drawer "گلّہ" — the shop till. Correct and warm in Pakistan, but check
 *    it doesn't read as slang in a written UI. Alternative: "کیش گلّہ".
 *  - common.net "نیٹ" — is a plain-Urdu word better here?
 *  - invoices.overdue / statusOverdue "تاریخ گزر گئی" — chosen over the formal
 *    "واجب الادا". Confirm it reads as a status badge, not a sentence.
 *  - invoices.markPaid "ادائیگی ہو گئی" — phrased as recording a fact rather
 *    than "mark as paid", which is clumsy in Urdu. Check the menu reads right.
 *  - entryForm.whatFor "کس چیز کے لیے" is used for income entries too.
 *  - nav.margins "چیزوں کا نفع" for "item margins" — check against how a shop
 *    owner would say per-item margin.
 *  - dashboard.safeToSpend — "safe to spend" has no tidy Urdu idiom.
 *
 * Untranslated on purpose: the quick-add examples ("spent 20 at costco on
 * supplies", "made 300") are literal input the English parser understands, so
 * translating them would teach users a phrase the app can't read. Product
 * should decide whether the parser gains Urdu before these are localised.
 *
 * No RLM/LRM control characters here — the document sets dir="rtl" and the
 * browser's bidi algorithm places the Latin {placeholders} correctly.
 *
 * Billing terms fixed in this pass (the `billing` section), same shopkeeper
 * register as the rest of the file:
 *   billing     → "بلنگ"        plan → "پلان" (Free / Pro keep their English
 *   names, they are what the product calls its tiers)
 *   card        → "کارڈ"        checkout → "چیک آؤٹ"
 *   charged     → "پیسے لیے جائیں گے" / "پیسے کٹ جاتے ہیں", not the formal
 *                 "چارج کیا جائے گا"
 *   free trial  → "مفت آزمائش"  receipt → "رسید", as in the invoice section
 *   your books  → "حساب", as everywhere else in this file
 *
 * Billing keys a reviewer should check hardest:
 *  - billing.trialDisclosure_one/_other — legally load-bearing. It must keep
 *    all three facts: the price, the exact date of the first charge, and that
 *    cancelling before then costs nothing. Do not shorten or soften it.
 *  - billing.genericError "آپ سے کوئی پیسہ نہیں لیا گیا" and
 *    billing.cancelledBody "آپ نے کچھ نہیں دیا" — both must be unmistakable
 *    that no money moved.
 *  - billing.statusPastDue "ادائیگی باقی" is money the user owes us, while
 *    invoices.overdue "تاریخ گزر گئی" is money a customer owes them. Confirm
 *    the two read as different things.
 *  - billing.renewsLabel "دوبارہ چالو ہوگا" is long for a metric label above a
 *    date; a shorter phrasing may be better if it wraps.
 *  - The {price} and {date} values are Latin script inside Urdu sentences.
 *    Please check on a real device that the bidi algorithm places them where
 *    the sentence expects, especially in cardChargedOn and trialDisclosure.
 *
 * Month/dashboard/entry-form terms fixed in this pass (the `month` section in
 * full, plus the gaps in `dashboard` and `entryForm`), same shopkeeper register:
 *   budget         → "بجٹ" (loanword, as in nav.budgets); its cap is "حد"
 *   goal           → "ہدف" (nav.goals already says "بچت کے ہدف")
 *   recurring rule → "ہر بار آنے والا خرچ" — described, not coined. "ریکرنگ"
 *                    is not a word a shopkeeper says.
 *   set aside      → "الگ رکھنا", never "بچانا" (which reads as saving up)
 *   outlook        → "آگے کا حساب"; the section title reuses nav.canYouCover
 *   shortfall      → "پیسے کم پڑ سکتے ہیں", a plain warning not a noun
 *   streak         → "سلسلہ"       track (a bill) → "ٹریک کریں" (loanword)
 *   net            → "نیٹ", as in common.net    plain English → "سیدھی سادی بات"
 *   your books     → "حساب", as everywhere else in this file
 *
 * Deliberate choices worth knowing before you re-word anything:
 *  - month.taxHint keeps the category keyword “tax” in Latin script. The code
 *    that counts tax payments matches /tax|taxes|irs|hmrc|cra/ in English only,
 *    so telling an Urdu reader to type "ٹیکس" would silently stop their
 *    payments counting — they would think money was set aside when it wasn't.
 *    Translate this word only when the matcher learns Urdu.
 *  - dashboard.listeningHint keeps its spoken example in English for the same
 *    reason as quickAddBlurb: the mic feeds the English quick-add parser.
 *  - entryForm.whereExamples swaps Shell/Home Depot for "پیٹرول پمپ" and
 *    "ہارڈویئر کی دکان" — they are illustrations, not parser input, and the US
 *    chains mean nothing in a Pakistani shop.
 *
 * New keys a reviewer should check hardest:
 *  - month.staysPositive "آپ کے پیسے پورے رہتے ہیں" — English is "in the black",
 *    i.e. the balance never goes negative. It is NOT a claim of profit. If this
 *    reads as "you are making a profit", it must be re-worded.
 *  - month.over "حد سے آگے" (budget exceeded) vs month.nearLimit "حد کے قریب"
 *    (nearly there, not yet exceeded). These sit next to each other as badges
 *    and must be unmistakably different at a glance.
 *  - month.reached "پورا ہو گیا" is a savings goal met — a good thing — while
 *    month.over is a budget blown. Confirm the tone reads right for each.
 *  - month.alreadyPaid "پہلے ادا ہو چکا" is tax the user has already paid, not
 *    an invoice a customer paid (invoices.statusPaid "ادا ہو گیا").
 *  - month.dueTomorrow "کل" — Urdu کل is both yesterday and tomorrow. Only the
 *    due-date context makes it future. Check it can't be read as "overdue".
 *  - month.cancelled "بند" for a stopped recurring rule, chosen over "منسوخ"
 *    (used for invoices/billing) so a paused rule doesn't read as voided.
 *  - month.goalNamePlaceholder "نیا اوون" — a placeholder example only. Swap it
 *    for whatever a Pakistani shopkeeper would actually save up for.
 *  - dashboard.aheadDaysThisMonth carries two counts, {profitable} of {active}.
 *    The order is flipped from English to suit Urdu; confirm it still says the
 *    profitable days are the subset.
 */
export const ur: PartialDictionary = {
  common: {
    save: "محفوظ کریں",
    saving: "محفوظ ہو رہا ہے…",
    cancel: "منسوخ",
    delete: "مٹا دیں",
    deleting: "مٹ رہا ہے…",
    edit: "بدلیں",
    close: "بند کریں",
    back: "واپس",
    add: "شامل کریں",
    today: "آج",
    yesterday: "کل",
    loading: "کھل رہا ہے…",
    search: "تلاش…",
    searchLong: "تلاش کریں یا کسی صفحے پر جائیں",
    viewAll: "سب دیکھیں",
    showEverything: "سب کچھ دکھائیں",
    noMatch: "اس سے کچھ نہیں ملا۔",
    tryAgain: "دوبارہ کوشش کریں",
    optional: "ضروری نہیں",
    date: "تاریخ",
    amount: "رقم",
    category: "قسم",
    moneyIn: "آمدنی",
    moneyOut: "خرچ",
    net: "نیٹ",
    profit: "نفع",
    loss: "نقصان",
    signOut: "سائن آؤٹ",
    keepIt: "رہنے دیں",
    moreActions: "مزید کام",
    send: "بھیجیں",
    language: "زبان",
    changeLanguage: "زبان بدلیں",
  },

  nav: {
    today: "آج",
    thisMonth: "اس مہینے",
    invoices: "انوائس",
    tools: "ٹولز",
    export: "ایکسپورٹ",
    help: "مدد",
    overview: "خلاصہ",
    addEntry: "نئی انٹری",
    findEntry: "انٹری ڈھونڈیں",
    streaks: "آپ کے لگاتار دن",
    ask: "پیسوں کے بارے میں پوچھیں",
    whereMoneyWent: "پیسہ کہاں گیا",
    dayByDay: "دن بدن",
    yourWeek: "آپ کا ہفتہ",
    canYouCover: "پیسے پورے ہوں گے؟",
    busyDays: "مصروف اور سست دن",
    budgets: "بجٹ",
    goals: "بچت کے ہدف",
    bills: "بل",
    allInvoices: "سارے انوائس",
    newInvoice: "نیا انوائس",
    household: "گھر والے",
    margins: "چیزوں کا نفع",
    drawer: "گلّہ",
    tax: "ٹیکس کی رقم",
    reminder: "روزانہ یاد دہانی",
    lock: "ایپ لاک کریں",
    billing: "بلنگ",
    yourPlan: "آپ کا پلان",
    pickDates: "تاریخیں چنیں",
    downloadCsv: "CSV ڈاؤن لوڈ کریں",
    downloadPdf: "PDF ڈاؤن لوڈ کریں",
    allTopics: "سارے موضوع",
    openMenu: "مینو کھولیں",
    closeMenu: "مینو بند کریں",
    goTo: "{section} پر جائیں",
    switchToDark: "ڈارک موڈ",
    switchToLight: "لائٹ موڈ",
    home: "SimpleBooks کا ہوم",
  },

  auth: {
    welcomeBack: "خوش آمدید",
    createAccount: "اپنا اکاؤنٹ بنائیں",
    signInBlurb: "سائن اِن کریں اور جہاں چھوڑا تھا وہیں سے شروع کریں۔",
    signUpBlurb: "بیس سیکنڈ کا کام ہے۔ آپ کا حساب صرف آپ کا رہے گا۔",
    email: "ای میل",
    emailPlaceholder: "you@yourbusiness.com",
    password: "پاس ورڈ",
    passwordPlaceholderNew: "ایک پاس ورڈ چنیں",
    passwordPlaceholderExisting: "آپ کا پاس ورڈ",
    passwordHint: "کم از کم 6 حرف۔",
    showPassword: "پاس ورڈ دکھائیں",
    hidePassword: "پاس ورڈ چھپائیں",
    signIn: "سائن اِن",
    signingIn: "سائن اِن ہو رہا ہے…",
    creating: "اکاؤنٹ بن رہا ہے…",
    newHere: "SimpleBooks پر نئے ہیں؟",
    haveAccount: "پہلے سے اکاؤنٹ ہے؟",
    createOne: "اکاؤنٹ بنائیں",
    privateNote: "آپ کی انٹریاں صرف آپ کے اکاؤنٹ میں رہتی ہیں۔",
    freeNote: "7 دن مفت۔ شروع کرنے کے لیے کارڈ چاہیے، اُس سے پہلے کبھی بھی منسوخ کریں۔",
    heroTitle: "ایک گاہک کو نپٹانے میں جتنا وقت لگتا ہے، اُتنے میں آپ کا حساب تیار۔",
    sellingFast: "سیکنڈوں میں لکھ لیں",
    sellingFastBody: "لکھیں “spent 20 at costco on supplies” اور باقی خود بھر جاتا ہے۔",
    sellingOffline: "سگنل نہ ہو تو بھی چلتی ہے",
    sellingOfflineBody:
      "تہہ خانے میں ہوں یا بازار میں، لکھتے رہیں۔ سگنل واپس آتے ہی خود بھیج دیتی ہے۔",
    sellingPrivate: "صرف آپ کے لیے",
    sellingPrivateBody: "رسائی ڈیٹابیس سے روکی جاتی ہے، صرف ایپ سے نہیں۔",
    errEmailMissing: "اپنا ای میل لکھیں۔",
    errEmailInvalid: "یہ ای میل ایڈریس نہیں لگتا۔",
    errPasswordMissing: "اپنا پاس ورڈ لکھیں۔",
    errPasswordShort: "کم از کم 6 حرف استعمال کریں۔",
    errGeneric: "کچھ گڑبڑ ہو گئی۔ دوبارہ کوشش کریں۔",
    confirmEmail:
      "بس تھوڑا رہ گیا — اپنے ای میل میں جا کر اکاؤنٹ کی تصدیق کریں، پھر سائن اِن کریں۔",
  },

  dashboard: {
    eyebrow: "آج",
    blurb: "اب تک آپ نے جو کچھ لکھا ہے، اور جس پر ایک نظر ڈالنی چاہیے۔",
    position: "آج آپ کہاں کھڑے ہیں",
    todaysNet: "آج کا نیٹ",
    nothingToday: "آج ابھی تک کچھ نہیں لکھا۔",
    aheadToday: "آج آپ فائدے میں ہیں۔",
    behindToday: "آج آپ نقصان میں ہیں۔",
    evenToday: "آج ابھی تک نہ نفع نہ نقصان۔",
    allTime: "شروع سے اب تک",
    allTimeIn: "{amount} آئے",
    allTimeOut: "{amount} گئے",
    allTimeNet: "{amount} نیٹ",
    safeToSpend: "آج اتنا خرچ کر سکتے ہیں",
    nothingLeft: "آج کے لیے کچھ نہیں بچا",
    quickAdd: "جھٹ پٹ لکھیں",
    quickAddBlurb: "بس لکھ دیں — “spent 20 at costco on groceries” یا “made 300”۔",
    quickAddVoice: "یا مائیک دبا کر بول دیں۔",
    quickAddPlaceholder: "spent 20 on supplies",
    quickAddInputLabel: "جھٹ پٹ انٹری لکھیں",
    listening: "سن رہے ہیں…",
    listeningHint: "سن رہے ہیں — کچھ ایسے بولیں جیسے “spent twenty dollars on lunch”۔",
    startListening: "بول کر لکھوائیں",
    stopListening: "سننا بند کریں",
    readingThatAs: "اسے یوں پڑھا جا رہا ہے",
    noCategory: "کوئی قسم نہیں",
    atMerchant: "{merchant} پر",
    onDate: "{date} کو",
    addIt: "شامل کر دیں",
    savedOnDevice: "اسی فون میں محفوظ ہو گیا — {summary}",
    recentEntries: "حال کی انٹریاں",
    recentBlurb: "نئی سب سے اوپر۔ کسی سطر کے مینو پر ٹیپ کر کے اسے بدلیں یا ہٹائیں۔",
    nothingLogged: "ابھی کچھ نہیں لکھا",
    nothingLoggedBlurb: "جو آیا اور جو گیا لکھ دیں، فوراً یہیں نظر آ جائے گا۔",
    logFirst: "پہلی انٹری لکھیں",
    loadFailed: "آپ کی انٹریاں نہیں کھل سکیں۔ {message}",
    moreEntries: "{count} مزید — سب کچھ دیکھیں",
    billsDueSoon_one: "ایک بل جلد دینا ہے",
    billsDueSoon_other: "{count} بل جلد دینے ہیں",
    billsDueSoonBlurb: "وقت سے پہلے نپٹا لیں، ورنہ بعد میں بھاری پڑ سکتا ہے۔",
    streakLogging: "لکھنے کا سلسلہ",
    streakProfitable: "نفع کا سلسلہ",
    streakNoSpend: "بغیر خرچ کے دن",
    streakDays_one: "{count} دن",
    streakDays_other: "{count} دن",
    streakBest: "سب سے بہتر: {count}",
    streakYourBest: "اب تک کا آپ کا بہترین",
    streakNice_one: "زبردست — {count} دن سے آپ کا حساب پورا ہے۔",
    streakNice_other: "زبردست — لگاتار {count} دن سے آپ کا حساب پورا ہے۔",
    streakStart: "ہر روز کچھ نہ کچھ لکھیں، آپ کا سلسلہ بننا شروع ہو جائے گا۔",
    aheadDaysThisMonth:
      "اس مہینے آپ نے جو {active} دن لکھے، اُن میں سے {profitable} دن آپ فائدے میں رہے۔",
    askBlurb: "اپنے حساب کے بارے میں سیدھی سادی بات میں پوچھیں — کوئی اکاؤنٹنگ کی اصطلاح نہیں۔",
    askPlaceholder: "کوئی سوال پوچھیں…",
    askThinking: "آپ کا حساب دیکھا جا رہا ہے…",
    askFailed: "معاف کیجیے، کچھ گڑبڑ ہو گئی: {message}",
    askFailedUnknown: "معاف کیجیے، کچھ گڑبڑ ہو گئی۔ دوبارہ کوشش کریں۔",
    askMostSpent: "میں نے سب سے زیادہ کس چیز پر خرچ کیا؟",
    askThisWeek: "اس ہفتے میرا کیسا چل رہا ہے؟",
    askMakingMoney: "کیا میں کما رہا ہوں؟",
    askCanIAfford: "کیا میں $200 خرچ کر سکتا ہوں؟",
    askHowMuchSpent: "میں نے کتنا خرچ کیا ہے؟",
    uncategorised: "بغیر قسم",
    hasReceipt: "رسید لگی ہے",
    viewReceipt: "رسید دیکھیں",
    addReceipt: "رسید لگائیں",
    shareWithHousehold: "گھر والوں کو دکھائیں",
    makePrivate: "دوبارہ صرف اپنے لیے",
    splitEvenly: "اسے برابر بانٹ دیں",
    deleteEntry: "انٹری مٹا دیں",
    deleteConfirm: "یہ انٹری مٹا دیں؟ یہ واپس نہیں آئے گی۔",
    actionsFor: "{name} کے لیے کام",
    shared: "شیئر",
    split: "بانٹی ہوئی",
  },

  entryForm: {
    title: "آج کی انٹری",
    blurb: "لکھ لیں جو آیا اور جو گیا۔",
    fullEntry: "پوری انٹری",
    fullEntryBlurb: "جب تاریخ، رسید یا یہ بتانا ہو کہ کس کے ساتھ شیئر ہے۔",
    moneyMade: "کمائی",
    moneySpent: "خرچ",
    whatFor: "کس چیز کے لیے",
    whatForPlaceholder: "سامان",
    whatForExamples: "سامان، کرایہ، مال…",
    where: "کہاں",
    wherePlaceholder: "Costco",
    whereExamples: "Costco، پیٹرول پمپ، ہارڈویئر کی دکان…",
    paidWith: "کیسے دیا",
    cash: "نقد",
    card: "کارڈ",
    other: "دوسرا",
    receiptPhoto: "رسید کی تصویر",
    receiptPrivateHint: "ضروری نہیں — یہ صرف آپ دیکھ سکتے ہیں۔",
    receiptAttaching: "“{name}” لگ رہی ہے — یہ صرف آپ دیکھ سکتے ہیں۔",
    receiptReading: "آپ کی رسید پڑھی جا رہی ہے…",
    whoCanSee: "یہ کون دیکھ سکتا ہے",
    justMe: "صرف میں",
    shareIt: "شیئر",
    splitIt: "بانٹ دیں",
    shareNoneBlurb: "یہ صرف آپ دیکھیں گے۔",
    shareVisibleBlurb: "{household} اسے دیکھ سکتے ہیں، مگر کسی پر کسی کا کچھ باقی نہیں رہتا۔",
    shareSplitBlurb: "{household} اسے دیکھ سکتے ہیں اور یہ برابر بٹ جاتا ہے۔",
    staysPrivate: "آپ کے حساب سے کچھ باہر نہیں جاتا۔",
    saveEntry: "انٹری محفوظ کریں",
    saved: "محفوظ ہو گیا۔",
    errAmounts: "درست رقم لکھیں۔",
    errEmpty: "محفوظ کرنے سے پہلے کمائی یا خرچ لکھ دیں۔",
    receiptFilled: "آپ کی رسید سے بھر دیا ہے — محفوظ کرنے سے پہلے ایک نظر دیکھ لیں۔",
    receiptUnreadable: "اُس رسید سے تفصیل نہیں پڑھی جا سکی — کوئی بات نہیں، خود لکھ دیں۔",
    receiptOffline:
      "اسی فون میں محفوظ ہو گیا۔ کنکشن کے بغیر تصویر نہیں لگ سکی — آن لائن آتے ہی انٹری میں سے لگا دیں۔",
  },

  entries: {
    eyebrow: "آپ کی انٹریاں",
    title: "انٹری ڈھونڈیں",
    blurb: "جو کچھ لکھا ہے سب میں تلاش کریں، پھر ٹیپ کر کے ٹھیک کر لیں۔",
    searchPlaceholder: "لکھ کر دیکھیں “کاسٹکو”، “کرایہ”، یا 42.50",
    searchLabel: "اپنی انٹریوں میں تلاش کریں",
    clearSearch: "تلاش صاف کریں",
    everything: "سب کچھ",
    moreFilters: "مزید فلٹر",
    fewerFilters: "کم فلٹر",
    narrowDown: "چھان کر کم کریں",
    allOptional: "ہر فلٹر ضروری نہیں۔",
    clearAll: "سب صاف کریں",
    anyCategory: "کوئی بھی قسم",
    anyWay: "کوئی بھی طریقہ",
    fromDate: "اس تاریخ سے",
    toDate: "اس تاریخ تک",
    amountAtLeast: "کم از کم رقم",
    amountAtMost: "زیادہ سے زیادہ رقم",
    any: "کوئی بھی",
    order: "ترتیب",
    newestFirst: "نئی پہلے",
    oldestFirst: "پرانی پہلے",
    biggestFirst: "بڑی رقم پہلے",
    smallestFirst: "چھوٹی رقم پہلے",
    editing: "یہ انٹری بدل رہے ہیں",
    saveChanges: "تبدیلیاں محفوظ کریں",
    errNeedsAmount: "انٹری میں آمدنی یا خرچ ہونا ضروری ہے۔ ہٹانا ہو تو مٹا دیں استعمال کریں۔",
    count_one: "{count} انٹری",
    count_other: "{count} انٹریاں",
  },

  month: {
    previous: "پچھلا مہینہ",
    next: "اگلا مہینہ",
    profitThisMonth: "اس مہینے کا نفع",
    lossThisMonth: "اس مہینے کا نقصان",
    breakEvenThisMonth: "اس مہینے نہ نفع نہ نقصان",
    budgetOver: "{category} بجٹ سے آگے نکل گئی",
    budgetAtPercent: "{category} بجٹ کے {percent}% پر ہے",
    nothingSpent: "اس مہینے ابھی کوئی خرچ نہیں",
    nothingSpentBlurb:
      "جیسے ہی آپ خرچ لکھنا شروع کریں گے، یہاں نظر آئے گا کہ آپ کا پیسہ کن قسموں میں گیا — سب سے بڑی پہلے۔",
    whereMoneyWentBlurb: "اس مہینے کا ہر خرچ، سب سے بڑا پہلے۔",
    dayByDayBlurb:
      "ہر پٹی اُس دن کا نیٹ ہے۔ لکیر سے اوپر والی پٹیاں وہ دن ہیں جب آپ فائدے میں رہے، نیچے والی وہ دن جب نہیں۔",
    dayNumber: "دن {day}",

    weekTitle: "آپ کا ہفتہ سیدھی سادی بات میں",
    weekRange: "{from} سے {to} تک",
    loadingWeek: "آپ کا ہفتہ پڑھا جا رہا ہے…",

    outlookTitle: "جو آگے آ رہا ہے، اُس کے پیسے پورے ہوں گے؟",
    outlookBlurb_one:
      "اگلے {days} دن — آپ کے پچھلے {count} دن اور آپ کے لگائے ہوئے بلوں کے حساب سے۔",
    outlookBlurb_other:
      "اگلے {days} دن — آپ کے پچھلے {count} دنوں اور آپ کے لگائے ہوئے بلوں کے حساب سے۔",
    loadingOutlook: "آگے کا حساب لگایا جا رہا ہے…",
    whereYouAre: "ابھی آپ کہاں ہیں",
    inDays_one: "{count} دن میں",
    inDays_other: "{count} دنوں میں",
    shortfallTitle: "خیال رکھیں — {date} کے آس پاس پیسے کم پڑ سکتے ہیں۔",
    staysPositive: "پورے عرصے آپ کے پیسے پورے رہتے ہیں۔",
    lowestPoint: "سب سے کم رقم {date} کو {amount} رہے گی۔",
    typicalDay: "عام دن: {moneyIn} آتے ہیں، {moneyOut} جاتے ہیں۔",
    billsComingUp: "آگے آنے والے بل",
    roughGuess_one:
      "یہ موٹا اندازہ ہے — آپ نے ابھی صرف {count} دن لکھا ہے۔ جیسے جیسے آپ لکھتے جائیں گے، یہ اور درست ہوتا جائے گا۔",
    roughGuess_other:
      "یہ موٹا اندازہ ہے — آپ نے ابھی صرف {count} دن لکھے ہیں۔ جیسے جیسے آپ لکھتے جائیں گے، یہ اور درست ہوتا جائے گا۔",

    taxNoRateTools:
      "ٹولز والے صفحے پر ایک فیصد لگا دیں، پھر میں حساب رکھتا رہوں گا کہ ٹیکس کے لیے کتنا الگ رکھنا ہے۔",
    taxNoRateBelow:
      "نیچے ایک فیصد لگا دیں، پھر میں حساب رکھتا رہوں گا کہ ٹیکس کے لیے کتنا الگ رکھنا ہے۔",
    taxHoldingBack: "{period} میں جو {amount} آئے، اُن کا {percent}% الگ رکھا جا رہا ہے۔",
    shouldSetAside: "اتنا الگ رکھنا چاہیے",
    alreadyPaid: "پہلے ادا ہو چکا",
    stillToSetAside: "ابھی الگ رکھنا باقی",
    taxHint:
      "ٹیکس کی ادائیگی لکھتے وقت قسم میں “tax” لکھ دیں، تب ہی وہ یہاں گنی جائے گی۔ یہ ٹیکس کا مشورہ نہیں — اپنی شرح کسی اکاؤنٹنٹ سے پکی کر لیں۔",
    loadingTax: "ٹیکس کے لیے الگ رکھی رقم جوڑی جا رہی ہے…",

    busyDaysBlurb: "ہفتے کے ہر دن اوسطاً کتنی آمدنی ہوئی۔",
    busyDaysNotEnough:
      "کچھ ہفتے اور لکھتے رہیں، پھر میں بتاؤں گا کہ ہفتے کے کون سے دن آپ کے سب سے اچھے ہیں اور کون سے سب سے سست۔",
    loadingBusyDays: "آپ کا ہفتہ دیکھا جا رہا ہے…",
    bestAndQuiet: "{best} آپ کا سب سے اچھا دن ہے، اور {worst} سب سے سست۔",
    bestAndQuietBoth:
      "{best} آپ کا سب سے اچھا دن ہے (اوسط سے {bestPercent}% اوپر)، اور {worst} سب سے سست ({worstPercent}% نیچے)۔",
    bestAndQuietBestOnly:
      "{best} آپ کا سب سے اچھا دن ہے (اوسط سے {bestPercent}% اوپر)، اور {worst} سب سے سست۔",
    bestAndQuietWorstOnly:
      "{best} آپ کا سب سے اچھا دن ہے، اور {worst} سب سے سست ({worstPercent}% نیچے)۔",

    whatsDue: "کیا دینا ہے",
    loadingBills: "آپ کے بل کھل رہے ہیں",
    billsTotal: "اگلے 45 دنوں میں {amount} کے بل ہیں۔",
    thisWeek: "اس ہفتے",
    nextThreeWeeks: "اگلے 3 ہفتے",
    later: "اُس کے بعد",
    dueToday: "آج",
    dueTomorrow: "کل",
    dueInDays_one: "{count} دن میں",
    dueInDays_other: "{count} دنوں میں",

    detectedTitle: "یہ ہر بار آنے والا بل لگتا ہے",
    detectedBlurb:
      "یہ آپ کی انٹریوں میں بار بار نظر آئے۔ انہیں ٹریک کریں تو یہ آگے کے حساب اور بل کی یاد دہانی میں بھی آنے لگیں گے۔",
    maybe: "شاید",
    weekly: "ہر ہفتے",
    monthly: "ہر مہینے",
    detectedDetail_one: "{amount} {frequency} · {count} بار نظر آیا · اگلا {date} کے آس پاس",
    detectedDetail_other: "{amount} {frequency} · {count} بار نظر آیا · اگلا {date} کے آس پاس",
    dismissDetected: "{name} ہٹا دیں",
    trackBill: "اس بل کو ٹریک کریں",

    goalsBlurb: "کوئی چیز جس کے لیے آپ پیسے جوڑ رہے ہیں — دیکھیں آپ کتنے قریب پہنچے۔",
    reached: "پورا ہو گیا",
    goalToGo: "{amount} اور باقی",
    goalReached: "ہدف پورا ہو گیا",
    goalByDate: "{date} تک",
    removeGoal: "{name} کا ہدف ہٹا دیں",
    noGoals: "ابھی کوئی ہدف نہیں۔",
    goalNamePlaceholder: "نیا اوون",
    goalTarget: "ہدف کی رقم",
    goalSaved: "اب تک جوڑے",
    goalTargetDate: "ہدف کی تاریخ (ضروری نہیں)",
    saveGoal: "ہدف محفوظ کریں",

    budgetsTitle: "بجٹ کی حد",
    budgetsBlurb: "ہر قسم کے لیے مہینے کی حد لگائیں اور پٹیوں پر نظر رکھیں۔",
    over: "حد سے آگے",
    nearLimit: "حد کے قریب",
    removeBudget: "{name} کا بجٹ ہٹا دیں",
    noBudgets: "ابھی کوئی بجٹ نہیں لگایا۔",
    monthlyLimit: "مہینے کی حد",
    saveBudget: "بجٹ محفوظ کریں",

    recurringTitle: "ہر بار آنے والے خرچ",
    recurringBlurb: "جو بل ہر بار آتے ہیں، وہ خود بخود لکھ دیے جاتے ہیں۔",
    cancelled: "بند",
    recurringDetail: "{amount} · {frequency} · {date} سے",
    editRule: "{name} بدلیں",
    cancelRule: "{name} بند کریں",
    deleteRule: "{name} مٹا دیں",
    noRecurring: "ابھی کوئی ہر بار آنے والا خرچ نہیں۔",
    recurringPlaceholder: "کرایہ",
    howOften: "کتنی بار؟",
    everyWeek: "ہر ہفتے",
    everyMonth: "ہر مہینے",
    starting: "کب سے",
    updateRecurring: "ہر بار آنے والا خرچ بدلیں",
    addRecurring: "ہر بار آنے والا خرچ شامل کریں",
  },

  invoices: {
    eyebrow: "انوائس",
    title: "جو پیسے آپ کو ملنے ہیں",
    blurb:
      "گاہک کو انوائس بھیجیں، پھر جب پیسے آ جائیں تو ادائیگی کا نشان لگا دیں — تب ہی یہ آپ کے حساب میں آتا ہے۔",
    newInvoice: "نیا انوائس",
    outstanding: "باقی",
    overdue: "تاریخ گزر گئی",
    paidThisMonth: "اس مہینے ملے",
    awaitingPayment_one: "{count} انوائس کی ادائیگی باقی",
    awaitingPayment_other: "{count} انوائسز کی ادائیگی باقی",
    pastDue: "{count} کی تاریخ گزر چکی",
    settled: "{count} نپٹ گئے",
    all: "سب",
    drafts: "ڈرافٹ",
    paid: "ادا شدہ",
    searchPlaceholder: "گاہک یا نمبر",
    searchLabel: "انوائس میں تلاش کریں",
    invoice: "انوائس",
    customer: "گاہک",
    due: "آخری تاریخ",
    status: "حالت",
    daysLate_one: "{count} دن دیر",
    daysLate_other: "{count} دن دیر",
    pastDueBy_one: "تاریخ گزرے {count} دن ہو گیا",
    pastDueBy_other: "تاریخ گزرے {count} دن ہو گئے",
    none: "ابھی کوئی انوائس نہیں",
    noneBlurb:
      "گاہک کے لیے ایک بنائیں، بھیجیں، اور جب پیسے آ جائیں تو ادائیگی کا نشان لگا دیں۔ تب ہی یہ آمدنی میں گنا جاتا ہے۔",
    createFirst: "اپنا پہلا انوائس بنائیں",
    notAvailable: "انوائس ابھی دستیاب نہیں",
    statusDraft: "ڈرافٹ",
    statusSent: "ادائیگی کا انتظار",
    statusOverdue: "تاریخ گزر گئی",
    statusPaid: "ادا ہو گیا",
    statusVoid: "منسوخ",
    markSent: "بھیج دیا",
    markPaid: "ادائیگی ہو گئی",
    markUnpaid: "ادائیگی نہیں ہوئی",
    recordPayment: "ادائیگی لکھیں",
    moneyArrivedOn: "پیسے کس تاریخ کو آئے",
    cancelInvoice: "انوائس منسوخ کریں",
    deleteDraft: "ڈرافٹ مٹا دیں",
    printOrPdf: "پرنٹ کریں یا PDF محفوظ کریں",
    paidOn: "{date} کو ادا ہوا",
    willRecord:
      "ادائیگی کا نشان لگاتے ہی {amount} آپ کے حساب میں اُس تاریخ کی آمدنی بن جائے گی جو آپ چنیں گے۔ اُس سے پہلے یہ آپ کے کل میں شامل نہیں ہوتا۔",
    confirmUnpaid: "اسے غیر ادا شدہ کر دیں؟ اس سے بنی آمدنی کی انٹری آپ کے حساب سے ہٹا دی جائے گی۔",
    confirmVoid: "یہ انوائس منسوخ کر دیں؟ ریکارڈ میں رہے گا مگر منسوخ لکھا جائے گا۔",
    confirmDeleteDraft: "یہ ڈرافٹ مٹا دیں؟ یہ واپس نہیں آئے گا۔",
    notFound: "وہ انوائس یہاں نہیں ہے",
    notFoundBlurb: "ہو سکتا ہے مٹا دیا گیا ہو۔",
    backToInvoices: "انوائس پر واپس",
    allInvoices: "سارے انوائس",
    createTitle: "انوائس بنائیں",
    editTitle: "یہ انوائس بدلیں",
    createBlurb: "شروع میں یہ ڈرافٹ رہتا ہے، تو بھیجنے تک کچھ بھی پکا نہیں۔",
    editBlurb:
      "تبدیلیاں صرف انوائس میں محفوظ ہوتی ہیں۔ ادائیگی کا نشان لگنے تک کچھ بھی آپ کے حساب میں نہیں جاتا۔",
    whoFor: "کس کے لیے ہے",
    customerName: "گاہک کا نام",
    customerNamePlaceholder: "ایکمی کیفے",
    customerEmail: "ای میل",
    customerEmailHint: "ضروری نہیں — صرف آپ کے اپنے ریکارڈ کے لیے۔",
    customerEmailPlaceholder: "billing@acme.com",
    issueDate: "بنانے کی تاریخ",
    dueDate: "ادائیگی کی تاریخ",
    dueDateHint: "عام طور پر دو ہفتے رکھے جاتے ہیں۔",
    whatCharging: "کس چیز کے پیسے لے رہے ہیں",
    whatChargingBlurb: "ہر چیز الگ سطر میں۔ کل خود بن جاتا ہے۔",
    description: "تفصیل",
    descriptionPlaceholder: "ڈیزائن کے کام کے چھ گھنٹے",
    quantity: "تعداد",
    priceEach: "فی چیز قیمت",
    lineTotal: "سطر کا کل {amount}",
    addLine: "ایک اور سطر شامل کریں",
    removeLine: "سطر {number} ہٹائیں",
    total: "کل",
    notes: "نوٹ",
    notesBlurb: "انوائس پر دکھائی دیتا ہے۔ ادائیگی کی شرط، ایک شکریہ۔",
    notesPlaceholder: "ادائیگی 14 دن کے اندر بینک ٹرانسفر سے۔ شکریہ!",
    createButton: "انوائس بنائیں",
    billedTo: "کس کے نام",
    dates: "تاریخیں",
    issued: "{date} کو بنا",
    dueOn: "{date} تک دینا ہے",
    amountDue: "ادائیگی کی رقم",
    errCustomer: "یہ انوائس کس کے لیے ہے؟",
    errNameLong: "یہ نام بہت لمبا ہے۔",
    errEmail: "یہ ای میل ایڈریس نہیں لگتا۔",
    errDate: "ایک تاریخ چنیں۔",
    errDueBeforeIssue: "ادائیگی کی تاریخ بنانے کی تاریخ سے پہلے نہیں ہو سکتی۔",
    errNoLines: "کم از کم ایک چیز شامل کریں۔",
    errLineDescription: "بتائیں یہ کس چیز کے لیے ہے۔",
    errLineQuantity: "تعداد صفر سے زیادہ ہونی چاہیے۔",
    errLinePrice: "قیمت منفی نہیں ہو سکتی۔",
  },

  billing: {
    eyebrow: "بلنگ",
    title: "آپ کا پلان",
    blurb: "آپ کس چیز کے پیسے دے رہے ہیں، اور اس میں کیا کیا بدل سکتے ہیں۔",
    loadingPlan: "آپ کا پلان کھل رہا ہے۔",
    loadFailed: "آپ کا پلان نہیں کھل سکا",
    portalFailed: "بلنگ نہیں کھل سکی",
    checkoutFailed: "چیک آؤٹ شروع نہیں ہو سکا",
    genericError: "ہماری طرف سے کچھ گڑبڑ ہو گئی۔ آپ سے کوئی پیسہ نہیں لیا گیا۔",
    paymentFailed: "ایک ادائیگی نہیں ہو سکی",
    paymentFailedBody:
      "آپ کی پچھلی ادائیگی رد ہو گئی۔ کچھ بھی بند نہیں کیا گیا — Stripe کچھ دن تک کوشش کرتا رہے گا، اور تب تک وہ سب کچھ چلتا رہے گا جس کے آپ پیسے دیتے ہیں۔",
    paymentFailedFix:
      "کارڈ بدل دینے سے عام طور پر بات بن جاتی ہے، اور اگلی کوشش میں پیسے کٹ جاتے ہیں۔",
    updateCard: "اپنا کارڈ بدلیں",
    statusActive: "چالو",
    statusTrialing: "آزمائش",
    statusPastDue: "ادائیگی باقی",
    statusCanceled: "منسوخ",
    statusIncomplete: "ادھورا",
    statusExpired: "مدت ختم",
    statusUnpaid: "بغیر ادائیگی",
    statusPaused: "روکا ہوا",
    proPanelTitle: "SimpleBooks پرو",
    proUnlocked: "اس اکاؤنٹ پر ایپ کی ہر چیز کھلی ہوئی ہے۔",
    planLabel: "آپ کا پلان",
    pricePerMonth: "{price} ماہانہ",
    renewsLabel: "دوبارہ چالو ہوگا",
    proEndsLabel: "پرو ختم ہوگا",
    chargedAgainHint: "اسی تاریخ کو آپ سے دوبارہ پیسے لیے جائیں گے۔",
    lastPaidDayHint: "جس مہینے کے آپ پیسے دے چکے ہیں اس کا آخری دن۔",
    noRenewalDate: "Stripe کی طرف سے ابھی کوئی تاریخ نہیں آئی۔",
    manageBilling: "بلنگ سنبھالیں",
    manageBillingHint: "کارڈ بدلیں، رسیدیں دیکھیں، یا منسوخ کریں۔",
    proEndingTitle: "پرو ختم ہونے والا ہے",
    proEndsOn:
      "پرو {date} تک چالو رہے گا۔ اس کے بعد یہ اکاؤنٹ فری پلان پر واپس چلا جائے گا اور آپ سے دوبارہ پیسے نہیں لیے جائیں گے۔ آپ کا لکھا ہوا کچھ بھی نہیں مٹتا۔",
    proEndsAfterPaidMonth:
      "جس مہینے کے آپ پیسے دے چکے ہیں، پرو اس کے آخر تک چالو رہے گا۔ اس کے بعد یہ اکاؤنٹ فری پلان پر واپس چلا جائے گا اور آپ سے دوبارہ پیسے نہیں لیے جائیں گے۔ آپ کا لکھا ہوا کچھ بھی نہیں مٹتا۔",
    changedYourMind: "ارادہ بدل گیا؟ بلنگ سنبھالیں میں جا کر اسے دوبارہ چالو کر سکتے ہیں۔",
    comparePlans: "پلان کا موازنہ کریں",
    currentPlanBadge: "آپ کا پلان",
    everything: "سب کچھ",
    openingStripe: "Stripe کھل رہا ہے…",
    onThisPlan: "آج آپ اسی پر ہیں۔",
    stripeNote:
      "ادائیگی Stripe اپنے صفحے پر سنبھالتا ہے — کارڈ کی تفصیل کبھی SimpleBooks تک نہیں پہنچتی۔ آپ یہیں سے جب چاہیں منسوخ کر سکتے ہیں، اور جس مہینے کے پیسے دے چکے ہیں اس کے ختم ہونے تک پرو چلتا رہے گا۔",
    successTitle: "آپ پرو پر ہیں",
    successBody:
      "ادائیگی ہو گئی اور اس اکاؤنٹ پر سب کچھ کھل گیا ہے۔ Stripe کی طرف سے رسید آپ کے ای میل پر آ رہی ہے۔",
    goToBooks: "اپنے حساب پر جائیں",
    seeYourPlan: "اپنا پلان دیکھیں",
    confirming: "تصدیق ہو رہی ہے",
    confirmingTitle: "آپ کی ادائیگی کی تصدیق ہو رہی ہے",
    confirmingBody:
      "آپ Stripe سے واپس آ گئے ہیں۔ یہاں واپس آ جانے کو ہی ثبوت ماننے کے بجائے، اکاؤنٹ کو پرو کرنے سے پہلے ہم Stripe سے ہی ادائیگی کی تصدیق کا انتظار کرتے ہیں — عام طور پر چند سیکنڈ لگتے ہیں۔",
    canLeavePage: "آپ یہ صفحہ بند کر سکتے ہیں۔ اس کے کھلے رہنے پر کچھ منحصر نہیں۔",
    notConfirmedTitle: "اس کی تصدیق ابھی باقی ہے",
    notConfirmedBody:
      "ہو سکتا ہے آپ کی ادائیگی ابھی چل رہی ہو۔ تصدیق میں عام طور پر چند سیکنڈ لگتے ہیں، مگر ایک دو منٹ بھی لگ سکتے ہیں، اور یہ صفحہ کھلا ہو یا نہ ہو، کام مکمل ہو جائے گا۔",
    notConfirmedReassure:
      "دونوں صورتوں میں کچھ ضائع نہیں ہوتا: اگر ادائیگی ہو گئی تو پرو خود بخود چالو ہو جائے گا۔ اصل صورتحال ہمیشہ آپ کے بلنگ صفحے پر نظر آتی ہے۔",
    checkFailed: "پچھلی جانچ کا کوئی جواب نہیں ملا",
    checkAgain: "دوبارہ جانچیں",
    goToBilling: "بلنگ پر جائیں",
    contactSupport:
      "اگر چند منٹ بعد بھی پرو نظر نہ آئے تو سپورٹ سے رابطہ کریں اور نیچے دیا حوالہ نمبر بتائیں۔",
    reference: "حوالہ: {reference}",
    cancelledTitle: "چیک آؤٹ بند ہو گیا",
    cancelledBody:
      "آپ نے کچھ نہیں دیا اور کچھ نہیں بدلا۔ آپ کا حساب جہاں تھا وہیں ہے، اور فری پلان پہلے کی طرح چل رہا ہے۔",
    cancelledReassure: "پرو جب چاہیں لے سکتے ہیں — نہ کوئی جلدی ہے، نہ صفحہ بند کرنے کی کوئی سزا۔",
    seePlansAgain: "پلان دوبارہ دیکھیں",
    backToBooks: "اپنے حساب پر واپس",
    checkingPlan: "آپ کا پلان دیکھا جا رہا ہے۔",
    featureIsPro: "{feature} پرو کا حصہ ہے",
    trialUsed:
      "آپ کے مفت دن ختم ہو چکے ہیں۔ پرو {price} ماہانہ ہے اور آپ جب چاہیں منسوخ کر سکتے ہیں۔",
    tryFree_one: "پرو کی باقی ہر چیز کے ساتھ اسے {count} دن مفت آزمائیں۔",
    tryFree_other: "پرو کی باقی ہر چیز کے ساتھ اسے {count} دن مفت آزمائیں۔",
    startTrial_one: "میرا {count} مفت دن شروع کریں",
    startTrial_other: "میرے {count} مفت دن شروع کریں",
    getPro: "پرو لیں — {price} ماہانہ",
    trialDisclosure_one:
      "{count} دن مفت۔ {date} کو آپ کے کارڈ سے {price} لیے جائیں گے، پھر ہر مہینے {price}۔ اس سے پہلے جب چاہیں منسوخ کر دیں، آپ کو کچھ نہیں دینا پڑے گا۔",
    trialDisclosure_other:
      "{count} دن مفت۔ {date} کو آپ کے کارڈ سے {price} لیے جائیں گے، پھر ہر مہینے {price}۔ اس سے پہلے جب چاہیں منسوخ کر دیں، آپ کو کچھ نہیں دینا پڑے گا۔",
    recordsStay: "آپ کا پہلے کا لکھا ہوا جہاں ہے وہیں رہے گا، چاہے کوئی بھی پلان ہو۔",
    exportsAlwaysWork: "ایکسپورٹ ہمیشہ چلتا ہے۔",
    trialEndsToday: "آپ کی مفت آزمائش آج ختم ہو رہی ہے",
    trialLastDay: "آپ کی مفت آزمائش کا آخری دن",
    trialDaysLeft_one: "آپ کی مفت آزمائش کا {count} دن باقی",
    trialDaysLeft_other: "آپ کی مفت آزمائش کے {count} دن باقی",
    cardChargedOn: "{date} کو آپ کے کارڈ سے {price} لیے جائیں گے۔",
    thenPricePerMonth: "پھر {price} ماہانہ۔",
    manageOrCancel: "سنبھالیں یا منسوخ کریں",
    hideUntilTomorrow: "کل تک چھپائیں",
  },

  reminder: {
    eyebrow: "ٹولز",
    title: "روزانہ یاد دہانی",
    pageBlurb:
      "اس ایپ کا ہر ہندسہ آپ کی لکھی ہوئی انٹریوں سے بنتا ہے۔ صحیح وقت پر ایک چھوٹی سی یاد دہانی ہی عادت اور نیک ارادے کا فرق ہے۔",
    cardBlurb: "دن کا حساب لکھنے کی یاد دہانی، تاکہ عادت پکی ہو جائے۔",
    onAt: "{time} پر چالو",
    off: "بند",
    howItWorks:
      "آپ کا چنا ہوا وقت گزر جانے کے بعد، ایپ اگلی بار کھلنے پر یا پیچھے چلتے ہوئے اطلاع دکھا دیتی ہے۔ جس فون میں سارا دن ایپ کھلی ہی نہ ہو، وہاں یہ نہیں آئے گی — انہیں کوئی سرور نہیں بھیجتا، اسی لیے ان کا کوئی خرچ نہیں اور آپ کا ڈیٹا کسی اور کو نظر نہیں آتا۔",
    remindMeAt: "مجھے اس وقت یاد دلائیں",
    turnOn: "یاد دہانی چالو کریں",
    turnOff: "بند کریں",
    saveTime: "وقت محفوظ کریں",
    sendTest: "ابھی ایک ٹیسٹ اطلاع بھیجیں",
    installFirst: "پہلے اسے ہوم اسکرین پر لگائیں",
    installFirstBody:
      "آئی فون صرف اُن ایپس کو اطلاع دینے دیتا ہے جو ہوم اسکرین پر لگی ہوں۔ Share دبائیں، پھر Add to Home Screen، نئے آئیکن سے کھولیں، اور یہاں واپس آ جائیں۔",
    blocked: "اطلاعات روکی ہوئی ہیں",
    blockedBody:
      "آپ کا براؤزر اس سائٹ کی اطلاعات روک رہا ہے۔ یہ چلنے سے پہلے آپ کو براؤزر کی سیٹنگز میں انہیں اجازت دینی ہو گی۔",
    unsupported: "یہ براؤزر اطلاعات نہیں دکھا سکتا",
    unsupportedBody: "باقی سب کچھ چلتا رہے گا — بس یہاں یاد دہانی نہیں ملے گی۔",
    errPickTime: "پہلے وقت چنیں۔",
    errDenied:
      "آپ کا براؤزر اس سائٹ کی اطلاعات روک رہا ہے۔ براؤزر کی سیٹنگز میں انہیں اجازت دیں، پھر دوبارہ کوشش کریں۔",
    errNotAllowed: "اطلاعات کی اجازت نہیں ملی، اس لیے یاد دہانی نہیں دکھائی جا سکتی۔",
    notificationTitle: "آج کی کمائی",
    notificationBody: "ابھی ایک منٹ لگا لیں، شام بچ جائے گی۔ لکھ دیں جو آیا اور جو گیا۔",
  },

  offline: {
    noConnection: "کنکشن نہیں",
    keepLogging: "آپ لکھتے رہ سکتے ہیں — انٹریاں اسی فون میں محفوظ ہو رہی ہیں۔",
    sending: "{count} بھیجی جا رہی ہیں",
    waitingToSend: "{count} بھیجنے کے لیے تیار",
    waiting_one: "{count} انٹری انتظار میں",
    waiting_other: "{count} انٹریاں انتظار میں",
    wouldntSave_one: "{count} انٹری محفوظ نہیں ہوئی",
    wouldntSave_other: "{count} انٹریاں محفوظ نہیں ہوئیں",
    showThem: "دکھائیں",
    hideThem: "چھپائیں",
    sendNow: "ابھی بھیجیں",
    tryTheseAgain: "انہیں دوبارہ آزمائیں",
    discardEntry: "یہ انٹری چھوڑ دیں",
    refusedTimes:
      "یہ {count} بار قبول نہیں ہوئیں۔ عام طور پر اس کا مطلب ہے کہ ایپ اپ ڈیٹ ہو گئی یا آپ سائن آؤٹ ہو گئے — دوبارہ کوشش کریں، اور کوئی انٹری صرف تب چھوڑیں جب آپ اسے کسی اور طرح لکھ چکے ہوں۔",
    installTitle: "SimpleBooks کو اپنی ہوم اسکرین پر لگائیں",
    installBody: "اپنے آئیکن سے پوری اسکرین پر کھلتی ہے، اور سگنل نہ ہو تو بھی چلتی رہتی ہے۔",
    installIos: "Safari میں Share کا بٹن دبائیں، پھر Add to Home Screen۔",
    install: "انسٹال کریں",
    dismiss: "ہٹا دیں",
    signOutPending:
      "{count} انٹریاں ابھی بھیجی نہیں گئیں۔ وہ اسی فون میں رہیں گی اور اگلی بار اسی فون پر سائن اِن کرنے پر چلی جائیں گی۔ پھر بھی سائن آؤٹ کریں؟",
  },

  palette: {
    placeholder: "کہیں بھی جائیں، یا انٹری لکھ دیں جیسے “spent 20 on supplies”",
    inputLabel: "تلاش کریں یا انٹری لکھیں",
    logThis: "یہ انٹری لکھ دیں",
    logging: "لکھی جا رہی ہے…",
    logged: "لکھ دی: {summary}",
    queued: "اسی فون میں محفوظ، بعد میں بھیج دی جائے گی: {summary}",
    moveHint: "چلنے کے لیے ↑↓",
    pickHint: "چننے کے لیے ↵",
    typeHint: "فوراً لکھنے کے لیے رقم ٹائپ کریں",
    close: "کمانڈ پیلیٹ بند کریں",
  },
};
