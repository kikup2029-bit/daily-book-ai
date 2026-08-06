import type { PartialDictionary } from "./translate";

/**
 * Gujarati (gu-IN).
 *
 * MACHINE-DRAFTED — A NATIVE GUJARATI SPEAKER MUST REVIEW THIS FILE BEFORE
 * ANYONE RELIES ON THE APP FOR FINANCIAL DECISIONS. A wrong word on a money
 * label is not a cosmetic bug: someone can mark the wrong invoice paid, or
 * read a loss as a profit.
 *
 * Register: everyday shopkeeper Gujarati, polite તમે throughout. Not the
 * Sanskritised register of a tax form — no "અવર્ગીકૃત", "પૂર્વવત્", "વિભાજિત".
 *
 * Trade words preferred over textbook coinages, because Gujarati business
 * families already have their own and have had for generations:
 *   your books        → "ચોપડો"   (the ledger; નામું is the act of keeping it)
 *   money in / out    → "આવક" / "જાવક"  (the standard આવક-જાવક pair)
 *   loss              → "ખોટ"     (not નુકસાન, which is general damage)
 *   settled           → "ચૂકતે"
 *   cash drawer       → "ગલ્લો"    (the shop till — the only word anyone uses)
 *   today's takings   → "આજનો વકરો"  (વકરો = a day's sales)
 *   due / due date    → "મુદત"
 *   qty               → "નંગ"     (how goods are counted over a counter)
 *
 * Loanwords kept in Gujarati script where a shopkeeper genuinely says them:
 *   એન્ટ્રી (entry), ઇન્વોઇસ (invoice), બિલ (bills to pay), રસીદ (receipt),
 *   ડ્રાફ્ટ, બજેટ, ફિલ્ટર, ટૂલ્સ, સેવ કરો.
 *
 * Terms fixed once and used everywhere: entry એન્ટ્રી · invoice ઇન્વોઇસ ·
 * overdue મુદત વીતી · paid પૈસા મળ્યા · draft ડ્રાફ્ટ · receipt રસીદ ·
 * budget બજેટ · category પ્રકાર.
 *
 * Terms a reviewer should look at hardest:
 *  - common.save "સેવ કરો" — chosen over the correct-but-bookish "સાચવો",
 *    which most speakers hear as "look after". Swap back if it grates.
 *  - common.net "ચોખ્ખું" — everyday in "ચોખ્ખો નફો", but check it stands
 *    alone as a column heading.
 *  - "paid" is rendered from the shopkeeper's side as money received
 *    ("પૈસા મળી ગયા"), not from the payer's ("ચૂકવાયું"). Every invoice here
 *    is money owed *to* the user, so this should be right — please confirm
 *    the menu items markPaid / markUnpaid read as recording a fact.
 *  - invoices.overdue / statusOverdue "મુદત વીતી" — confirm it reads as a
 *    status badge and not a half-finished sentence.
 *  - nav.drawer "ગલ્લો" — warm and correct in speech; check it doesn't look
 *    too colloquial written down. Alternative: "કૅશ ગલ્લો".
 *  - nav.margins "વસ્તુ દીઠ નફો" for item margins.
 *  - nav.busyDays "ધમધમતા અને ધીમા દિવસો" — idiomatic, slightly playful.
 *  - dashboard.safeToSpend — "safe to spend" has no tidy Gujarati idiom;
 *    rendered as "આજે આટલું વાપરી શકો".
 *  - entryForm.moneyMade / moneySpent use કમાણી / ખર્ચ rather than આવક /
 *    જાવક, matching English's own switch from "money in" to "money made".
 *  - reminder.notificationTitle "આજનો વકરો" assumes the user sells something
 *    — right for a shop or a stall, slightly off for hourly work.
 *
 * Untranslated on purpose: the quick-add examples ("spent 20 at costco on
 * supplies", "made 300") are literal input the English parser understands, so
 * translating them would teach users a phrase the app can't read. Product
 * should decide whether the parser gains Gujarati before these are localised.
 */
export const gu: PartialDictionary = {
  common: {
    save: "સેવ કરો",
    saving: "સેવ થાય છે…",
    cancel: "રદ કરો",
    delete: "કાઢી નાખો",
    deleting: "કાઢી રહ્યા છીએ…",
    edit: "બદલો",
    close: "બંધ કરો",
    back: "પાછા",
    add: "ઉમેરો",
    today: "આજે",
    yesterday: "ગઈકાલ",
    loading: "ખૂલે છે…",
    search: "શોધો…",
    searchLong: "શોધો અથવા કોઈ પાના પર જાઓ",
    viewAll: "બધું જુઓ",
    showEverything: "બધું બતાવો",
    noMatch: "એવું કંઈ મળ્યું નહીં.",
    tryAgain: "ફરી પ્રયત્ન કરો",
    optional: "જરૂરી નથી",
    date: "તારીખ",
    amount: "રકમ",
    category: "પ્રકાર",
    moneyIn: "આવક",
    moneyOut: "જાવક",
    net: "ચોખ્ખું",
    profit: "નફો",
    loss: "ખોટ",
    signOut: "સાઇન આઉટ",
    keepIt: "રહેવા દો",
    moreActions: "બીજા વિકલ્પો",
    language: "ભાષા",
    changeLanguage: "ભાષા બદલો",
  },

  nav: {
    today: "આજે",
    thisMonth: "આ મહિનો",
    invoices: "ઇન્વોઇસ",
    tools: "ટૂલ્સ",
    export: "એક્સપોર્ટ",
    help: "મદદ",
    overview: "ઝલક",
    addEntry: "નવી એન્ટ્રી",
    findEntry: "એન્ટ્રી શોધો",
    streaks: "તમારા સળંગ દિવસો",
    ask: "પૈસા વિશે પૂછો",
    whereMoneyWent: "પૈસા ક્યાં ગયા",
    dayByDay: "રોજેરોજ",
    yourWeek: "તમારું અઠવાડિયું",
    canYouCover: "પૈસા પૂરા થશે?",
    busyDays: "ધમધમતા અને ધીમા દિવસો",
    budgets: "બજેટ",
    goals: "બચતના લક્ષ્ય",
    bills: "બિલ",
    allInvoices: "બધા ઇન્વોઇસ",
    newInvoice: "નવું ઇન્વોઇસ",
    household: "ઘરના",
    margins: "વસ્તુ દીઠ નફો",
    drawer: "ગલ્લો",
    tax: "ટેક્સ માટે અલગ",
    reminder: "રોજની યાદ",
    lock: "એપ લોક કરો",
    billing: "બિલિંગ",
    yourPlan: "તમારો પ્લાન",
    pickDates: "તારીખ પસંદ કરો",
    downloadCsv: "CSV ડાઉનલોડ કરો",
    downloadPdf: "PDF ડાઉનલોડ કરો",
    allTopics: "બધા વિષય",
    openMenu: "મેનુ ખોલો",
    closeMenu: "મેનુ બંધ કરો",
    goTo: "{section} પર જાઓ",
    switchToDark: "ડાર્ક મોડ",
    switchToLight: "લાઇટ મોડ",
    home: "SimpleBooks હોમ",
  },

  auth: {
    welcomeBack: "ફરી આવકાર",
    createAccount: "તમારું ખાતું બનાવો",
    signInBlurb: "સાઇન ઇન કરો અને જ્યાં છોડ્યું હતું ત્યાંથી શરૂ કરો.",
    signUpBlurb: "વીસેક સેકન્ડનું કામ છે. તમારો ચોપડો ફક્ત તમારો જ રહેશે.",
    email: "ઈમેલ",
    emailPlaceholder: "you@yourbusiness.com",
    password: "પાસવર્ડ",
    passwordPlaceholderNew: "એક પાસવર્ડ પસંદ કરો",
    passwordPlaceholderExisting: "તમારો પાસવર્ડ",
    passwordHint: "ઓછામાં ઓછા 6 અક્ષર.",
    showPassword: "પાસવર્ડ બતાવો",
    hidePassword: "પાસવર્ડ છુપાવો",
    signIn: "સાઇન ઇન",
    signingIn: "સાઇન ઇન થાય છે…",
    creating: "ખાતું બને છે…",
    newHere: "SimpleBooks પર નવા છો?",
    haveAccount: "પહેલેથી ખાતું છે?",
    createOne: "ખાતું બનાવો",
    privateNote: "તમારી એન્ટ્રી ફક્ત તમારા ખાતામાં જ રહે છે.",
    freeNote: "7 દિવસ મફત. શરૂ કરવા કાર્ડ જોઈશે, એ પહેલાં ગમે ત્યારે રદ કરી શકો.",
    heroTitle: "એક ગ્રાહકને પતાવતાં જેટલી વાર લાગે, એટલામાં તમારો ચોપડો તૈયાર.",
    sellingFast: "સેકન્ડોમાં લખી લો",
    sellingFastBody: "લખો “spent 20 at costco on supplies” અને બાકીનું જાતે ભરાઈ જાય.",
    sellingOffline: "સિગ્નલ વગર પણ ચાલે",
    sellingOfflineBody: "ભોંયરામાં હો કે બજારમાં, લખતા રહો. સિગ્નલ આવે એટલે જાતે મોકલાઈ જાય.",
    sellingPrivate: "ફક્ત તમારા માટે",
    sellingPrivateBody: "રોકટોક ડેટાબેઝમાં જ ગોઠવેલી છે, ફક્ત એપમાં નહીં.",
    errEmailMissing: "તમારું ઈમેલ સરનામું લખો.",
    errEmailInvalid: "આ ઈમેલ સરનામું હોય એવું લાગતું નથી.",
    errPasswordMissing: "તમારો પાસવર્ડ લખો.",
    errPasswordShort: "ઓછામાં ઓછા 6 અક્ષર વાપરો.",
    errGeneric: "કંઈક ગડબડ થઈ. ફરી પ્રયત્ન કરો.",
    confirmEmail: "બસ થોડું બાકી — તમારા ઈમેલમાં જઈને ખાતું પાકું કરો, પછી સાઇન ઇન કરો.",
  },

  dashboard: {
    eyebrow: "આજે",
    position: "આજે તમે ક્યાં છો",
    allTime: "શરૂઆતથી અત્યાર સુધી",
    safeToSpend: "આજે આટલું વાપરી શકો",
    nothingLeft: "આજ માટે કંઈ બચ્યું નથી",
    quickAdd: "ઝટપટ લખો",
    quickAddBlurb: "બસ લખી દો — “spent 20 at costco on groceries” કે “made 300”.",
    quickAddVoice: "અથવા માઇક દબાવીને બોલી દો.",
    quickAddPlaceholder: "spent 20 on supplies",
    listening: "સાંભળીએ છીએ…",
    startListening: "બોલીને લખાવો",
    stopListening: "સાંભળવાનું બંધ કરો",
    savedOnDevice: "આ ફોનમાં સચવાઈ ગયું — {summary}",
    recentEntries: "તાજી એન્ટ્રી",
    recentBlurb: "નવી સૌથી ઉપર. કોઈ પણ લીટીના મેનુ પર ટૅપ કરીને એને બદલો કે કાઢી નાખો.",
    nothingLogged: "હજી કંઈ લખ્યું નથી",
    nothingLoggedBlurb: "જે આવ્યું અને જે ગયું તે લખી દો, તરત જ અહીં દેખાશે.",
    logFirst: "તમારી પહેલી એન્ટ્રી લખો",
    loadFailed: "તમારી એન્ટ્રી ખૂલી શકી નહીં. {message}",
    moreEntries: "બીજી {count} — બધું જુઓ",
    billsDueSoon: "જલદી ભરવાનાં બિલ",
    uncategorised: "પ્રકાર વગરનું",
    hasReceipt: "રસીદ છે",
    viewReceipt: "રસીદ જુઓ",
    addReceipt: "રસીદ ઉમેરો",
    shareWithHousehold: "ઘરના સાથે શેર કરો",
    makePrivate: "ફરી ફક્ત મારા માટે",
    splitEvenly: "આને સરખા ભાગે વહેંચો",
    deleteEntry: "એન્ટ્રી કાઢી નાખો",
    deleteConfirm: "આ એન્ટ્રી કાઢી નાખવી છે? પછી પાછી નહીં આવે.",
    actionsFor: "{name} માટેનાં કામ",
    shared: "શેર કરેલું",
    split: "વહેંચેલું",
  },

  entryForm: {
    title: "આજની એન્ટ્રી",
    blurb: "જે આવ્યું અને જે ગયું તે લખી લો.",
    moneyMade: "કમાણી",
    moneySpent: "ખર્ચ",
    whatFor: "શેના માટે",
    whatForPlaceholder: "સામાન",
    where: "ક્યાં",
    wherePlaceholder: "Costco",
    paidWith: "કઈ રીતે ચૂકવ્યું",
    cash: "રોકડ",
    card: "કાર્ડ",
    other: "બીજું",
    receiptPhoto: "રસીદનો ફોટો",
    whoCanSee: "આ કોણ જોઈ શકે",
    justMe: "ફક્ત હું",
    shareIt: "શેર",
    splitIt: "વહેંચો",
    saved: "સચવાઈ ગયું.",
    errAmounts: "સાચી રકમ લખો.",
    errEmpty: "સેવ કરતાં પહેલાં કમાણી કે ખર્ચ લખો.",
    receiptFilled: "તમારી રસીદ પરથી ભરી દીધું — સેવ કરતાં પહેલાં એક વાર જોઈ લો.",
    receiptUnreadable: "એ રસીદમાંથી વિગત વંચાઈ નહીં — વાંધો નહીં, જાતે લખી દો.",
    receiptOffline:
      "આ ફોનમાં સચવાઈ ગયું. કનેક્શન વગર ફોટો જોડાઈ શક્યો નહીં — ઓનલાઇન આવો એટલે એન્ટ્રીમાંથી જોડી દેજો.",
  },

  entries: {
    eyebrow: "તમારી એન્ટ્રી",
    title: "એન્ટ્રી શોધો",
    blurb: "તમે લખેલું બધું શોધો, પછી કોઈ એક પર ટૅપ કરીને સુધારી લો.",
    searchPlaceholder: "લખી જુઓ “કોસ્ટકો”, “ભાડું”, કે 42.50",
    searchLabel: "તમારી એન્ટ્રીમાં શોધો",
    clearSearch: "શોધ ભૂંસો",
    everything: "બધું",
    moreFilters: "વધુ ફિલ્ટર",
    fewerFilters: "ઓછા ફિલ્ટર",
    narrowDown: "ગાળીને ઓછું કરો",
    allOptional: "દરેક ફિલ્ટર જરૂરી નથી.",
    clearAll: "બધું ભૂંસો",
    anyCategory: "કોઈ પણ પ્રકાર",
    anyWay: "કોઈ પણ રીત",
    fromDate: "આ તારીખથી",
    toDate: "આ તારીખ સુધી",
    amountAtLeast: "ઓછામાં ઓછી રકમ",
    amountAtMost: "વધુમાં વધુ રકમ",
    any: "કોઈ પણ",
    order: "ક્રમ",
    newestFirst: "નવી પહેલાં",
    oldestFirst: "જૂની પહેલાં",
    biggestFirst: "મોટી રકમ પહેલાં",
    smallestFirst: "નાની રકમ પહેલાં",
    editing: "આ એન્ટ્રી બદલી રહ્યા છો",
    saveChanges: "ફેરફાર સેવ કરો",
    errNeedsAmount: "એન્ટ્રીમાં આવક કે જાવક હોવી જરૂરી છે. કાઢી નાખવી હોય તો કાઢી નાખો વાપરો.",
    count_one: "{count} એન્ટ્રી",
    count_other: "{count} એન્ટ્રી",
  },

  invoices: {
    eyebrow: "ઇન્વોઇસ",
    title: "તમારે લેવાના પૈસા",
    blurb:
      "ગ્રાહકને ઇન્વોઇસ મોકલો, અને પૈસા આવે ત્યારે નિશાની કરી દો — ત્યારે જ એ તમારા ચોપડામાં ચઢે છે.",
    newInvoice: "નવું ઇન્વોઇસ",
    outstanding: "બાકી",
    overdue: "મુદત વીતી",
    paidThisMonth: "આ મહિને મળ્યા",
    awaitingPayment_one: "{count} ઇન્વોઇસના પૈસા બાકી",
    awaitingPayment_other: "{count} ઇન્વોઇસના પૈસા બાકી",
    pastDue: "{count}ની મુદત વીતી ગઈ",
    settled: "{count} ચૂકતે થયા",
    all: "બધા",
    drafts: "ડ્રાફ્ટ",
    paid: "પૈસા મળ્યા",
    searchPlaceholder: "ગ્રાહક કે નંબર",
    searchLabel: "ઇન્વોઇસમાં શોધો",
    invoice: "ઇન્વોઇસ",
    customer: "ગ્રાહક",
    due: "મુદત",
    status: "સ્થિતિ",
    daysLate_one: "{count} દિવસ મોડું",
    daysLate_other: "{count} દિવસ મોડું",
    pastDueBy_one: "મુદત વીત્યે {count} દિવસ થયો",
    pastDueBy_other: "મુદત વીત્યે {count} દિવસ થયા",
    none: "હજી એકેય ઇન્વોઇસ નથી",
    noneBlurb:
      "ગ્રાહક માટે એક બનાવો, મોકલો, અને પૈસા આવે ત્યારે નિશાની કરી દો. ત્યારે જ એ આવકમાં ગણાય છે.",
    createFirst: "તમારું પહેલું ઇન્વોઇસ બનાવો",
    notAvailable: "ઇન્વોઇસ હજી ચાલુ થયા નથી",
    statusDraft: "ડ્રાફ્ટ",
    statusSent: "પૈસાની રાહ",
    statusOverdue: "મુદત વીતી",
    statusPaid: "પૈસા મળી ગયા",
    statusVoid: "રદ કરેલું",
    markSent: "મોકલી દીધું",
    markPaid: "પૈસા મળી ગયા",
    markUnpaid: "પૈસા મળ્યા નથી",
    recordPayment: "પૈસા મળ્યાનું લખો",
    moneyArrivedOn: "પૈસા કઈ તારીખે આવ્યા",
    cancelInvoice: "ઇન્વોઇસ રદ કરો",
    deleteDraft: "ડ્રાફ્ટ કાઢી નાખો",
    printOrPdf: "પ્રિન્ટ કરો કે PDF સેવ કરો",
    paidOn: "{date}ના રોજ મળ્યા",
    willRecord:
      "પૈસા મળ્યાની નિશાની કરતાં જ {amount} તમે પસંદ કરેલી તારીખે તમારા ચોપડામાં આવક તરીકે ચઢી જશે. ત્યાં સુધી એ તમારા સરવાળામાં આવતું નથી.",
    confirmUnpaid:
      "આના પૈસા મળ્યા નથી એમ કરવું છે? એમાંથી બનેલી આવકની એન્ટ્રી તમારા ચોપડામાંથી નીકળી જશે.",
    confirmVoid: "આ ઇન્વોઇસ રદ કરવું છે? રેકોર્ડમાં તો રહેશે, પણ રદ થયેલું લખાશે.",
    confirmDeleteDraft: "આ ડ્રાફ્ટ કાઢી નાખવો છે? પછી પાછો નહીં આવે.",
    notFound: "એ ઇન્વોઇસ અહીં નથી",
    notFoundBlurb: "કદાચ કાઢી નાખ્યું હશે.",
    backToInvoices: "ઇન્વોઇસ પર પાછા",
    allInvoices: "બધા ઇન્વોઇસ",
    createTitle: "ઇન્વોઇસ બનાવો",
    editTitle: "આ ઇન્વોઇસ બદલો",
    createBlurb: "શરૂઆતમાં એ ડ્રાફ્ટ રહે છે, એટલે મોકલો ત્યાં સુધી કંઈ પાકું નથી.",
    editBlurb:
      "ફેરફાર ફક્ત ઇન્વોઇસમાં જ સચવાય છે. પૈસા મળ્યાની નિશાની ન થાય ત્યાં સુધી કંઈ તમારા ચોપડામાં જતું નથી.",
    whoFor: "કોના માટે છે",
    customerName: "ગ્રાહકનું નામ",
    customerNamePlaceholder: "એક્મી કૅફે",
    customerEmail: "ઈમેલ",
    customerEmailHint: "જરૂરી નથી — ફક્ત તમારા પોતાના રેકોર્ડ માટે.",
    customerEmailPlaceholder: "billing@acme.com",
    issueDate: "બનાવ્યાની તારીખ",
    dueDate: "ચૂકવણીની તારીખ",
    dueDateHint: "સામાન્ય રીતે બે અઠવાડિયાં રખાય છે.",
    whatCharging: "શેના પૈસા લો છો",
    whatChargingBlurb: "એક વસ્તુ એક લીટીમાં. સરવાળો જાતે થઈ જશે.",
    description: "વિગત",
    descriptionPlaceholder: "ડિઝાઇનના કામના છ કલાક",
    quantity: "નંગ",
    priceEach: "એકનો ભાવ",
    lineTotal: "લીટીનો સરવાળો {amount}",
    addLine: "બીજી લીટી ઉમેરો",
    removeLine: "લીટી {number} કાઢો",
    total: "કુલ",
    notes: "નોંધ",
    notesBlurb: "ઇન્વોઇસ પર દેખાય છે. ચૂકવણીની શરત, આભારના બે શબ્દ.",
    notesPlaceholder: "ચૂકવણી 14 દિવસમાં બૅન્ક ટ્રાન્સફરથી. આભાર!",
    createButton: "ઇન્વોઇસ બનાવો",
    billedTo: "કોના નામે",
    dates: "તારીખ",
    issued: "{date}ના રોજ બન્યું",
    dueOn: "{date} સુધીમાં",
    amountDue: "ચૂકવવાની રકમ",
    errCustomer: "આ ઇન્વોઇસ કોના માટે છે?",
    errNameLong: "આ નામ બહુ લાંબું છે.",
    errEmail: "આ ઈમેલ સરનામું હોય એવું લાગતું નથી.",
    errDate: "એક તારીખ પસંદ કરો.",
    errDueBeforeIssue: "ચૂકવણીની તારીખ બનાવ્યાની તારીખ પહેલાંની ન હોઈ શકે.",
    errNoLines: "ઓછામાં ઓછી એક વસ્તુ ઉમેરો.",
    errLineDescription: "આ શેના માટે છે તે લખો.",
    errLineQuantity: "નંગ શૂન્યથી વધારે હોવા જોઈએ.",
    errLinePrice: "ભાવ શૂન્યથી ઓછો ન હોઈ શકે.",
  },

  reminder: {
    eyebrow: "ટૂલ્સ",
    title: "રોજની યાદ",
    pageBlurb:
      "આ એપનો દરેક આંકડો તમે લખેલી એન્ટ્રીમાંથી જ બને છે. સાચા વખતે મળતી નાનકડી ટકોર જ ટેવ અને સારા ઇરાદા વચ્ચેનો ફેર છે.",
    cardBlurb: "દિવસનો હિસાબ લખવાની ટકોર, જેથી ટેવ પડી જાય.",
    onAt: "{time} વાગ્યે ચાલુ",
    off: "બંધ",
    howItWorks:
      "તમે પસંદ કરેલો સમય વીતી ગયા પછી, એપ પછીની વાર ખૂલે કે પાછળ ચાલતી હોય ત્યારે નોટિફિકેશન બતાવે છે. જે ફોનમાં આખો દિવસ એપ ખૂલી જ ન હોય ત્યાં એ નહીં આવે — આ મોકલવા માટે કોઈ સર્વર નથી, એટલે જ એનો કંઈ ખર્ચ નથી અને તમારો ડેટા બીજા કોઈને દેખાતો નથી.",
    remindMeAt: "મને આ વખતે યાદ કરાવો",
    turnOn: "યાદ ચાલુ કરો",
    turnOff: "બંધ કરો",
    saveTime: "સમય સેવ કરો",
    sendTest: "અત્યારે એક ટેસ્ટ નોટિફિકેશન મોકલો",
    installFirst: "પહેલાં એને હોમ સ્ક્રીન પર મૂકો",
    installFirstBody:
      "આઇફોન ફક્ત હોમ સ્ક્રીન પર મૂકેલી એપને જ નોટિફિકેશન આપવા દે છે. Share દબાવો, પછી Add to Home Screen, નવા આઇકનથી ખોલો, અને અહીં પાછા આવો.",
    blocked: "નોટિફિકેશન રોકેલાં છે",
    blockedBody:
      "તમારું બ્રાઉઝર આ સાઇટનાં નોટિફિકેશન રોકે છે. આ ચાલે તે પહેલાં તમારે બ્રાઉઝરની સેટિંગમાં એને છૂટ આપવી પડશે.",
    unsupported: "આ બ્રાઉઝર નોટિફિકેશન બતાવી શકતું નથી",
    unsupportedBody: "બાકી બધું ચાલતું રહેશે — બસ અહીં ટકોર નહીં મળે.",
    errPickTime: "પહેલાં સમય પસંદ કરો.",
    errDenied:
      "તમારું બ્રાઉઝર આ સાઇટનાં નોટિફિકેશન રોકે છે. બ્રાઉઝરની સેટિંગમાં એને છૂટ આપો, પછી ફરી પ્રયત્ન કરો.",
    errNotAllowed: "નોટિફિકેશનની છૂટ ન મળી, એટલે યાદ બતાવી શકાતી નથી.",
    notificationTitle: "આજનો વકરો",
    notificationBody: "અત્યારે એક મિનિટ કાઢો, સાંજ બચી જશે. જે આવ્યું અને જે ગયું તે લખી દો.",
  },

  offline: {
    noConnection: "કનેક્શન નથી",
    keepLogging: "તમે લખતા રહી શકો છો — એન્ટ્રી આ ફોનમાં જ સચવાય છે.",
    sending: "{count} મોકલાય છે",
    waitingToSend: "{count} મોકલવાની બાકી",
    waiting_one: "{count} એન્ટ્રી રાહ જુએ છે",
    waiting_other: "{count} એન્ટ્રી રાહ જુએ છે",
    wouldntSave_one: "{count} એન્ટ્રી સચવાઈ નહીં",
    wouldntSave_other: "{count} એન્ટ્રી સચવાઈ નહીં",
    showThem: "બતાવો",
    hideThem: "છુપાવો",
    sendNow: "અત્યારે મોકલો",
    tryTheseAgain: "આ ફરી મોકલી જુઓ",
    discardEntry: "આ એન્ટ્રી જવા દો",
    refusedTimes:
      "આ {count} વાર સ્વીકારાઈ નથી. મોટે ભાગે એનો અર્થ એ કે એપ અપડેટ થઈ ગઈ કે તમે સાઇન આઉટ થઈ ગયા — ફરી પ્રયત્ન કરો, અને કોઈ એન્ટ્રી ત્યારે જ જવા દો જ્યારે તમે એને બીજી રીતે લખી ચૂક્યા હો.",
    installTitle: "SimpleBooks ને તમારી હોમ સ્ક્રીન પર મૂકો",
    installBody: "પોતાના આઇકનથી આખી સ્ક્રીન પર ખૂલે છે, અને સિગ્નલ ન હોય ત્યારે પણ ચાલતી રહે છે.",
    installIos: "Safari માં Share બટન દબાવો, પછી Add to Home Screen.",
    install: "ઇન્સ્ટોલ કરો",
    dismiss: "અત્યારે નહીં",
    signOutPending:
      "{count} એન્ટ્રી હજી મોકલાઈ નથી. એ આ ફોનમાં જ રહેશે અને તમે આ ફોન પર ફરી સાઇન ઇન કરશો ત્યારે જતી રહેશે. તોય સાઇન આઉટ કરવું છે?",
  },

  palette: {
    placeholder: "ગમે ત્યાં જાઓ, અથવા એન્ટ્રી લખી દો જેમ કે “spent 20 on supplies”",
    inputLabel: "શોધો અથવા એન્ટ્રી લખો",
    logThis: "આ એન્ટ્રી લખી દો",
    logging: "લખાય છે…",
    logged: "લખાઈ ગઈ: {summary}",
    queued: "આ ફોનમાં સચવાઈ, પછી મોકલાશે: {summary}",
    moveHint: "ફરવા માટે ↑↓",
    pickHint: "પસંદ કરવા ↵",
    typeHint: "તરત લખવા માટે રકમ ટાઇપ કરો",
    close: "કમાન્ડ પેલેટ બંધ કરો",
  },
};
