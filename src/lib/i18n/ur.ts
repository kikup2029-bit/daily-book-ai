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
    position: "آج آپ کہاں کھڑے ہیں",
    allTime: "شروع سے اب تک",
    safeToSpend: "آج اتنا خرچ کر سکتے ہیں",
    nothingLeft: "آج کے لیے کچھ نہیں بچا",
    quickAdd: "جھٹ پٹ لکھیں",
    quickAddBlurb: "بس لکھ دیں — “spent 20 at costco on groceries” یا “made 300”۔",
    quickAddVoice: "یا مائیک دبا کر بول دیں۔",
    quickAddPlaceholder: "spent 20 on supplies",
    listening: "سن رہے ہیں…",
    startListening: "بول کر لکھوائیں",
    stopListening: "سننا بند کریں",
    savedOnDevice: "اسی فون میں محفوظ ہو گیا — {summary}",
    recentEntries: "حال کی انٹریاں",
    recentBlurb: "نئی سب سے اوپر۔ کسی سطر کے مینو پر ٹیپ کر کے اسے بدلیں یا ہٹائیں۔",
    nothingLogged: "ابھی کچھ نہیں لکھا",
    nothingLoggedBlurb: "جو آیا اور جو گیا لکھ دیں، فوراً یہیں نظر آ جائے گا۔",
    logFirst: "پہلی انٹری لکھیں",
    loadFailed: "آپ کی انٹریاں نہیں کھل سکیں۔ {message}",
    moreEntries: "{count} مزید — سب کچھ دیکھیں",
    billsDueSoon: "جلد دینے والے بل",
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
    moneyMade: "کمائی",
    moneySpent: "خرچ",
    whatFor: "کس چیز کے لیے",
    whatForPlaceholder: "سامان",
    where: "کہاں",
    wherePlaceholder: "Costco",
    paidWith: "کیسے دیا",
    cash: "نقد",
    card: "کارڈ",
    other: "دوسرا",
    receiptPhoto: "رسید کی تصویر",
    whoCanSee: "یہ کون دیکھ سکتا ہے",
    justMe: "صرف میں",
    shareIt: "شیئر",
    splitIt: "بانٹ دیں",
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
