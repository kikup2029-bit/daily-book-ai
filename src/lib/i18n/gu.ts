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
 *
 * Billing terms fixed in this pass (the `billing` section), keeping the same
 * shopkeeper register as the rest of the file:
 *   billing            → "બિલિંગ"
 *   plan               → "પ્લાન"  (Free / Pro stay as the product's own names)
 *   card               → "કાર્ડ"
 *   charged            → "કપાશે" / "પૈસા લેવાશે", the way money leaving a
 *                        card is actually described — not "શુલ્ક લેવાશે"
 *   free trial         → "મફત અજમાયશ"
 *   your books         → "ચોપડો", as everywhere else in this file
 *   receipt (payment)  → "રસીદ", same word as the invoice section
 *
 * Billing keys a reviewer should look at hardest:
 *  - billing.trialDisclosure_one/_other — legally load-bearing. It must keep
 *    all three facts: the price, the exact date of the first charge, and that
 *    cancelling before then costs nothing. Do not shorten or soften it.
 *  - billing.genericError "તમારા પૈસા કપાયા નથી" and billing.cancelledBody
 *    "તમે કંઈ ચૂકવ્યું નથી" — both must be unmistakable that no money moved.
 *  - billing.statusTrialing / trialEndsToday use "અજમાયશ" for trial. Some
 *    speakers would just say "ટ્રાયલ"; pick one and use it in both places.
 *  - billing.renewsLabel "ફરી ચાલુ થશે" and proEndsLabel "પ્રો પૂરું થશે" are
 *    metric labels sitting above a date — check they don't wrap awkwardly.
 *  - billing.statusPastDue "ચૂકવણી બાકી" is money the user owes us, while
 *    invoices.overdue "મુદત વીતી" is money a customer owes them. Confirm the
 *    two don't blur together.
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
    send: "મોકલો",
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
    blurb: "અત્યાર સુધી તમે જે લખ્યું છે એ બધું, અને જેના પર નજર નાખવા જેવી છે.",
    position: "આજે તમે ક્યાં છો",
    todaysNet: "આજનું ચોખ્ખું",
    nothingToday: "આજે હજી કંઈ લખ્યું નથી.",
    aheadToday: "આજે તમે નફામાં છો.",
    behindToday: "આજે તમે ખોટમાં છો.",
    evenToday: "આજે અત્યાર સુધી ન નફો, ન ખોટ.",
    allTime: "શરૂઆતથી અત્યાર સુધી",
    allTimeIn: "{amount} આવક",
    allTimeOut: "{amount} જાવક",
    allTimeNet: "{amount} ચોખ્ખું",
    safeToSpend: "આજે આટલું વાપરી શકો",
    nothingLeft: "આજ માટે કંઈ બચ્યું નથી",
    quickAdd: "ઝટપટ લખો",
    quickAddBlurb: "બસ લખી દો — “spent 20 at costco on groceries” કે “made 300”.",
    quickAddVoice: "અથવા માઇક દબાવીને બોલી દો.",
    quickAddPlaceholder: "spent 20 on supplies",
    quickAddInputLabel: "ઝટપટ એન્ટ્રી લખો",
    listening: "સાંભળીએ છીએ…",
    // The example stays in English: it is what the parser understands.
    listeningHint: "સાંભળીએ છીએ — કંઈક આવું બોલો: “spent twenty dollars on lunch”.",
    startListening: "બોલીને લખાવો",
    stopListening: "સાંભળવાનું બંધ કરો",
    readingThatAs: "આનો અર્થ આ સમજ્યા",
    noCategory: "પ્રકાર વગરનું",
    atMerchant: "{merchant} માં",
    onDate: "{date} ના રોજ",
    addIt: "ઉમેરી દો",
    savedOnDevice: "આ ફોનમાં સચવાઈ ગયું — {summary}",
    recentEntries: "તાજી એન્ટ્રી",
    recentBlurb: "નવી સૌથી ઉપર. કોઈ પણ લીટીના મેનુ પર ટૅપ કરીને એને બદલો કે કાઢી નાખો.",
    nothingLogged: "હજી કંઈ લખ્યું નથી",
    nothingLoggedBlurb: "જે આવ્યું અને જે ગયું તે લખી દો, તરત જ અહીં દેખાશે.",
    logFirst: "તમારી પહેલી એન્ટ્રી લખો",
    loadFailed: "તમારી એન્ટ્રી ખૂલી શકી નહીં. {message}",
    moreEntries: "બીજી {count} — બધું જુઓ",
    billsDueSoon_one: "એક બિલ જલદી ભરવાનું છે",
    billsDueSoon_other: "{count} બિલ જલદી ભરવાનાં છે",
    billsDueSoonBlurb: "મુદત આવે એ પહેલાં ભરી દેવું સારું.",
    streakLogging: "લખવાનો સિલસિલો",
    streakProfitable: "સળંગ નફાના દિવસો",
    streakNoSpend: "ખર્ચ વગરના દિવસો",
    streakDays_one: "{count} દિવસ",
    streakDays_other: "{count} દિવસ",
    streakBest: "સૌથી સારું: {count}",
    streakYourBest: "તમારું અત્યાર સુધીનું સૌથી સારું",
    streakNice_one: "વાહ — {count} દિવસથી તમારો ચોપડો પૂરો છે.",
    streakNice_other: "વાહ — સળંગ {count} દિવસથી તમારો ચોપડો પૂરો છે.",
    streakStart: "રોજ કંઈક ને કંઈક લખો, સિલસિલો બનવા લાગશે.",
    aheadDaysThisMonth:
      "આ મહિને તમે જે {active} દિવસ લખ્યા, એમાંથી {profitable} દિવસ નફામાં રહ્યા.",
    askBlurb: "તમારા આંકડા વિશે સાદી ભાષામાં પૂછો — હિસાબી ભાષાની જરૂર નથી.",
    askPlaceholder: "કંઈક પૂછો…",
    askThinking: "તમારો ચોપડો જોઈએ છીએ…",
    askFailed: "માફ કરજો, કંઈક ગડબડ થઈ: {message}",
    askFailedUnknown: "માફ કરજો, કંઈક ગડબડ થઈ. ફરી પ્રયત્ન કરો.",
    askMostSpent: "સૌથી વધારે ખર્ચ શેમાં થયો?",
    askThisWeek: "આ અઠવાડિયે કેવું ચાલે છે?",
    askMakingMoney: "હું કમાઉં છું કે નહીં?",
    askCanIAfford: "$200 નો ખર્ચ પોસાય?",
    askHowMuchSpent: "મેં કેટલો ખર્ચ કર્યો છે?",
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
    fullEntry: "આખી એન્ટ્રી",
    fullEntryBlurb: "જ્યારે તારીખ, રસીદ કે કોની સાથે શેર કરેલું છે — એ બધું જોઈએ.",
    moneyMade: "કમાણી",
    moneySpent: "ખર્ચ",
    whatFor: "શેના માટે",
    whatForPlaceholder: "સામાન",
    whatForExamples: "સામાન, ભાડું, માલ…",
    where: "ક્યાં",
    wherePlaceholder: "Costco",
    whereExamples: "Costco, પેટ્રોલ પંપ, હાર્ડવેરની દુકાન…",
    paidWith: "કઈ રીતે ચૂકવ્યું",
    cash: "રોકડ",
    card: "કાર્ડ",
    other: "બીજું",
    receiptPhoto: "રસીદનો ફોટો",
    receiptPrivateHint: "મરજી હોય તો — તે ફક્ત તમે જ જોઈ શકો.",
    receiptAttaching: "“{name}” જોડાય છે — તે ફક્ત તમે જ જોઈ શકો.",
    receiptReading: "તમારી રસીદ વાંચીએ છીએ…",
    whoCanSee: "આ કોણ જોઈ શકે",
    justMe: "ફક્ત હું",
    shareIt: "શેર",
    splitIt: "વહેંચો",
    shareNoneBlurb: "આ ફક્ત તમે જ જોશો.",
    shareVisibleBlurb: "{household} આ જોઈ શકશે, પણ કોઈએ કોઈને પૈસા આપવાના નથી.",
    shareSplitBlurb: "{household} આ જોઈ શકશે અને એ સરખા ભાગે વહેંચાશે.",
    staysPrivate: "તમારા ચોપડામાંથી કંઈ બહાર જતું નથી.",
    saveEntry: "એન્ટ્રી સેવ કરો",
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

  month: {
    previous: "પાછલો મહિનો",
    next: "પછીનો મહિનો",
    profitThisMonth: "આ મહિનાનો નફો",
    lossThisMonth: "આ મહિનાની ખોટ",
    breakEvenThisMonth: "આ મહિને ન નફો, ન ખોટ",
    budgetOver: "{category} બજેટથી વધી ગયું",
    budgetAtPercent: "{category} બજેટના {percent}% પર છે",
    nothingSpent: "આ મહિને હજી કોઈ ખર્ચ નથી",
    nothingSpentBlurb:
      "તમે ખર્ચ લખશો એટલે અહીં દેખાશે કે પૈસા કયા પ્રકારમાં ગયા — સૌથી મોટો પહેલો.",
    whereMoneyWentBlurb: "આ મહિનાનો દરેક ખર્ચ, સૌથી મોટો પહેલો.",
    dayByDayBlurb:
      "દરેક પટ્ટી એ દિવસનું ચોખ્ખું છે. લીટીની ઉપરની પટ્ટીઓ એ દિવસો છે જ્યારે નફો રહ્યો, નીચેની એ દિવસો જ્યારે નહીં.",
    dayNumber: "તારીખ {day}",

    weekTitle: "તમારું અઠવાડિયું સાદી ભાષામાં",
    weekRange: "{from} થી {to}",
    loadingWeek: "તમારું અઠવાડિયું વાંચીએ છીએ…",

    outlookTitle: "જે આવવાનું છે એ પહોંચી વળશો?",
    outlookBlurb_one:
      "આવતા {days} દિવસ — તમારા છેલ્લા {count} દિવસ અને તમે નક્કી કરેલાં બિલ પ્રમાણે.",
    outlookBlurb_other:
      "આવતા {days} દિવસ — તમારા છેલ્લા {count} દિવસ અને તમે નક્કી કરેલાં બિલ પ્રમાણે.",
    loadingOutlook: "આગળનો હિસાબ ગણીએ છીએ…",
    whereYouAre: "અત્યારે ક્યાં છો",
    inDays_one: "{count} દિવસમાં",
    inDays_other: "{count} દિવસમાં",
    shortfallTitle: "ધ્યાન રાખજો — {date} આસપાસ પૈસા ખૂટી શકે.",
    staysPositive: "આખો વખત તમે નફામાં રહો છો.",
    lowestPoint: "સૌથી નીચું {date} ના રોજ {amount} રહેશે.",
    typicalDay: "સામાન્ય દિવસ: {moneyIn} આવક, {moneyOut} જાવક.",
    billsComingUp: "આવનારાં બિલ",
    roughGuess_one:
      "આ આશરે અંદાજ છે — તમે હજી ફક્ત {count} દિવસ લખ્યો છે. જેમ લખતા જશો તેમ વધારે સાચું થતું જશે.",
    roughGuess_other:
      "આ આશરે અંદાજ છે — તમે હજી ફક્ત {count} દિવસ લખ્યા છે. જેમ લખતા જશો તેમ વધારે સાચું થતું જશે.",

    taxNoRateTools:
      "ટૂલ્સ ટૅબમાં ટકા નક્કી કરી દો, પછી ટૅક્સ માટે કેટલું બાજુ પર રાખવું એનો હિસાબ હું રાખીશ.",
    taxNoRateBelow:
      "નીચે ટકા નક્કી કરી દો, પછી ટૅક્સ માટે કેટલું બાજુ પર રાખવું એનો હિસાબ હું રાખીશ.",
    taxHoldingBack: "{period} માં તમને જે {amount} મળ્યા એના {percent}% બાજુ પર રખાય છે.",
    shouldSetAside: "આટલું બાજુ પર રાખવું જોઈએ",
    alreadyPaid: "ભરાઈ ગયું",
    stillToSetAside: "હજી બાજુ પર રાખવાનું",
    taxHint:
      "ટૅક્સના પૈસા ભરો ત્યારે પ્રકારમાં “ટૅક્સ” લખજો, એ અહીં ગણાઈ જશે. આ ટૅક્સ સલાહ નથી — તમારો દર હિસાબનીસ પાસે પાકો કરી લેજો.",
    loadingTax: "ટૅક્સ માટે બાજુ પર રાખેલું ગણીએ છીએ…",

    busyDaysBlurb: "અઠવાડિયાના દરેક દિવસે સરેરાશ કેટલી આવક.",
    busyDaysNotEnough:
      "થોડાં અઠવાડિયાં હજી લખતા રહો, પછી બતાવીશ કે અઠવાડિયાના કયા દિવસો ધમધમતા છે અને કયા ધીમા.",
    loadingBusyDays: "તમારું અઠવાડિયું જોઈએ છીએ…",
    bestAndQuiet: "{best} તમારો સૌથી સારો દિવસ છે, અને {worst} સૌથી ધીમો.",
    bestAndQuietBoth:
      "{best} તમારો સૌથી સારો દિવસ છે (સરેરાશ કરતાં {bestPercent}% વધારે), અને {worst} સૌથી ધીમો ({worstPercent}% ઓછો).",
    bestAndQuietBestOnly:
      "{best} તમારો સૌથી સારો દિવસ છે (સરેરાશ કરતાં {bestPercent}% વધારે), અને {worst} સૌથી ધીમો.",
    bestAndQuietWorstOnly:
      "{best} તમારો સૌથી સારો દિવસ છે, અને {worst} સૌથી ધીમો ({worstPercent}% ઓછો).",

    whatsDue: "શું ભરવાનું છે",
    loadingBills: "તમારાં બિલ ખૂલે છે",
    billsTotal: "આવતા 45 દિવસમાં {amount} નાં બિલ.",
    thisWeek: "આ અઠવાડિયે",
    nextThreeWeeks: "આવતાં 3 અઠવાડિયાં",
    later: "પછી",
    dueToday: "આજે",
    dueTomorrow: "કાલે",
    dueInDays_one: "{count} દિવસમાં",
    dueInDays_other: "{count} દિવસમાં",

    detectedTitle: "આ દર વખતે આવતું બિલ લાગે છે",
    detectedBlurb:
      "તમારી એન્ટ્રીમાં આ વારંવાર દેખાયું. એને નોંધી લો તો આગળના હિસાબમાં અને બિલની યાદ અપાવવામાં દેખાશે.",
    maybe: "કદાચ",
    weekly: "દર અઠવાડિયે",
    monthly: "દર મહિને",
    detectedDetail_one: "{amount} {frequency} · {count} વાર દેખાયું · આવતું {date} આસપાસ",
    detectedDetail_other: "{amount} {frequency} · {count} વાર દેખાયું · આવતું {date} આસપાસ",
    dismissDetected: "{name} કાઢી નાખો",
    trackBill: "આ બિલ નોંધી લો",

    goalsBlurb: "જેના માટે તમે પૈસા બાજુ પર મૂકો છો — કેટલા નજીક છો એ જુઓ.",
    reached: "પૂરું",
    goalToGo: "{amount} બાકી",
    goalReached: "લક્ષ્ય પૂરું થયું",
    goalByDate: "{date} સુધીમાં",
    removeGoal: "{name} લક્ષ્ય કાઢી નાખો",
    noGoals: "હજી કોઈ લક્ષ્ય નથી.",
    goalNamePlaceholder: "નવો ચૂલો",
    goalTarget: "લક્ષ્યની રકમ",
    goalSaved: "અત્યાર સુધી ભેગું કરેલું",
    goalTargetDate: "લક્ષ્યની તારીખ (મરજી હોય તો)",
    saveGoal: "લક્ષ્ય સેવ કરો",

    budgetsTitle: "બજેટની હદ",
    budgetsBlurb: "દરેક પ્રકાર માટે મહિનાની હદ નક્કી કરો અને પટ્ટીઓ પર નજર રાખો.",
    over: "વટી ગયું",
    nearLimit: "નજીક",
    removeBudget: "{name} નું બજેટ કાઢી નાખો",
    noBudgets: "હજી કોઈ બજેટ નક્કી નથી.",
    monthlyLimit: "મહિનાની હદ",
    saveBudget: "બજેટ સેવ કરો",

    recurringTitle: "દર વખતે આવતા ખર્ચ",
    recurringBlurb: "જે બિલ દર વખતે આવે છે એ જાતે લખાઈ જાય છે.",
    cancelled: "બંધ કરેલું",
    recurringDetail: "{amount} · {frequency} · {date} થી",
    editRule: "{name} બદલો",
    cancelRule: "{name} બંધ કરો",
    deleteRule: "{name} કાઢી નાખો",
    noRecurring: "હજી કંઈ દર વખતે આવતું નથી.",
    recurringPlaceholder: "ભાડું",
    howOften: "કેટલી વાર?",
    everyWeek: "દર અઠવાડિયે",
    everyMonth: "દર મહિને",
    starting: "ક્યારથી",
    updateRecurring: "દર વખતે આવતો ખર્ચ બદલો",
    addRecurring: "દર વખતે આવતો ખર્ચ ઉમેરો",
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

  billing: {
    eyebrow: "બિલિંગ",
    title: "તમારો પ્લાન",
    blurb: "તમે શેના પૈસા આપો છો, અને એમાં તમે શું શું બદલી શકો છો.",
    loadingPlan: "તમારો પ્લાન ખૂલે છે.",
    loadFailed: "તમારો પ્લાન ખૂલી શક્યો નહીં",
    portalFailed: "બિલિંગ ખૂલી શક્યું નહીં",
    checkoutFailed: "ચેકઆઉટ શરૂ થઈ શક્યું નહીં",
    genericError: "અમારી બાજુ કંઈક ગડબડ થઈ. તમારા પૈસા કપાયા નથી.",
    paymentFailed: "એક ચૂકવણી થઈ શકી નહીં",
    paymentFailedBody:
      "તમારી છેલ્લી ચૂકવણી નકારાઈ ગઈ. કંઈ બંધ કરાયું નથી — Stripe થોડા દિવસ સુધી ફરી ફરી પ્રયત્ન કરશે, અને ત્યાં સુધી તમે જેના પૈસા આપો છો તે બધું ચાલુ જ રહેશે.",
    paymentFailedFix:
      "કાર્ડ બદલી નાખવાથી મોટે ભાગે વાત પતી જાય છે, અને પછીના પ્રયત્નમાં પૈસા કપાઈ જાય છે.",
    updateCard: "તમારું કાર્ડ બદલો",
    statusActive: "ચાલુ",
    statusTrialing: "અજમાયશ",
    statusPastDue: "ચૂકવણી બાકી",
    statusCanceled: "રદ કરેલું",
    statusIncomplete: "અધૂરું",
    statusExpired: "મુદત પૂરી",
    statusUnpaid: "પૈસા ભર્યા નથી",
    statusPaused: "થોભાવેલું",
    proPanelTitle: "SimpleBooks પ્રો",
    proUnlocked: "આ ખાતામાં એપનું બધું ખૂલી ગયું છે.",
    planLabel: "તમારો પ્લાન",
    pricePerMonth: "મહિને {price}",
    renewsLabel: "ફરી ચાલુ થશે",
    proEndsLabel: "પ્રો પૂરું થશે",
    chargedAgainHint: "આ તારીખે તમારી પાસેથી ફરી પૈસા લેવાશે.",
    lastPaidDayHint: "તમે જે મહિનાના પૈસા આપ્યા છે તેનો છેલ્લો દિવસ.",
    noRenewalDate: "Stripe તરફથી હજી કોઈ તારીખ આવી નથી.",
    manageBilling: "બિલિંગ સંભાળો",
    manageBillingHint: "કાર્ડ બદલો, રસીદ જુઓ, કે રદ કરો.",
    proEndingTitle: "પ્રો પૂરું થવાનું છે",
    proEndsOn:
      "પ્રો {date} સુધી ચાલુ રહેશે. પછી આ ખાતું ફ્રી પ્લાન પર પાછું જશે અને તમારી પાસેથી ફરી પૈસા લેવાશે નહીં. તમે લખેલું કંઈ પણ ભૂંસાતું નથી.",
    proEndsAfterPaidMonth:
      "તમે જે મહિનાના પૈસા આપ્યા છે તે મહિનો પૂરો થાય ત્યાં સુધી પ્રો ચાલુ રહેશે. પછી આ ખાતું ફ્રી પ્લાન પર પાછું જશે અને તમારી પાસેથી ફરી પૈસા લેવાશે નહીં. તમે લખેલું કંઈ પણ ભૂંસાતું નથી.",
    changedYourMind: "વિચાર બદલાયો? બિલિંગ સંભાળોમાં જઈને એને ફરી ચાલુ કરી શકો છો.",
    comparePlans: "પ્લાન સરખાવો",
    currentPlanBadge: "તમારો પ્લાન",
    everything: "બધું",
    openingStripe: "Stripe ખૂલે છે…",
    onThisPlan: "આજે તમે આના પર જ છો.",
    stripeNote:
      "ચૂકવણી Stripe પોતાના પાના પર સંભાળે છે — કાર્ડની વિગત SimpleBooks સુધી કદી પહોંચતી નથી. તમે અહીંથી ગમે ત્યારે રદ કરી શકો છો, અને જે મહિનાના પૈસા આપી દીધા છે તે પૂરો થાય ત્યાં સુધી પ્રો ચાલુ રહેશે.",
    successTitle: "તમે પ્રો પર છો",
    successBody:
      "પૈસા ભરાઈ ગયા અને આ ખાતામાં બધું ખૂલી ગયું છે. Stripe તરફથી રસીદ તમારા ઈમેલ પર આવી રહી છે.",
    goToBooks: "તમારા ચોપડામાં જાઓ",
    seeYourPlan: "તમારો પ્લાન જુઓ",
    confirming: "ખાતરી થાય છે",
    confirmingTitle: "તમારી ચૂકવણીની ખાતરી થાય છે",
    confirmingBody:
      "તમે Stripe પરથી પાછા આવ્યા છો. અહીં પાછા આવવાને જ પુરાવો માની લેવાને બદલે, ખાતું પ્રો કરતાં પહેલાં અમે Stripe પાસેથી જ ચૂકવણીની ખાતરીની રાહ જોઈએ છીએ — સામાન્ય રીતે થોડી સેકંડ લાગે છે.",
    canLeavePage: "તમે આ પાનું બંધ કરી શકો છો. એ ખુલ્લું રહે એના પર કંઈ આધાર રાખતું નથી.",
    notConfirmedTitle: "આની ખાતરી હજી થઈ રહી છે",
    notConfirmedBody:
      "તમારી ચૂકવણી કદાચ હજી ચાલુ હશે. ખાતરી થતાં સામાન્ય રીતે થોડી સેકંડ લાગે છે, પણ એકાદ-બે મિનિટ પણ લાગી શકે, અને આ પાનું ખુલ્લું હોય કે ન હોય, કામ પૂરું થઈ જ જશે.",
    notConfirmedReassure:
      "બેમાંથી કોઈ પણ રીતે કંઈ ખોવાતું નથી: ચૂકવણી થઈ ગઈ હશે તો પ્રો જાતે ચાલુ થઈ જશે. ખરેખર શું સ્થિતિ છે તે તમારું બિલિંગ પાનું હંમેશાં બતાવે છે.",
    checkFailed: "છેલ્લી તપાસનો જવાબ મળ્યો નહીં",
    checkAgain: "ફરી તપાસો",
    goToBilling: "બિલિંગ પર જાઓ",
    contactSupport:
      "થોડી મિનિટ પછી પણ પ્રો ન દેખાય, તો સપોર્ટને લખો અને નીચે આપેલો સંદર્ભ નંબર જણાવો.",
    reference: "સંદર્ભ: {reference}",
    cancelledTitle: "ચેકઆઉટ બંધ થયું",
    cancelledBody:
      "તમે કંઈ ચૂકવ્યું નથી અને કંઈ બદલાયું નથી. તમારો ચોપડો જ્યાં હતો ત્યાં જ છે, અને ફ્રી પ્લાન પહેલાંની જેમ ચાલુ છે.",
    cancelledReassure:
      "પ્રો જ્યારે જોઈએ ત્યારે લઈ શકાય — ઉતાવળ પણ નથી અને પાનું બંધ કરવાની કોઈ સજા પણ નથી.",
    seePlansAgain: "પ્લાન ફરી જુઓ",
    backToBooks: "તમારા ચોપડામાં પાછા",
    checkingPlan: "તમારો પ્લાન તપાસાય છે.",
    featureIsPro: "{feature} પ્રોમાં આવે છે",
    trialUsed:
      "તમારા મફત દિવસો વપરાઈ ગયા છે. પ્રો મહિને {price}નું છે અને તમે ગમે ત્યારે રદ કરી શકો છો.",
    tryFree_one: "પ્રોની બાકીની બધી વસ્તુ સાથે આને {count} દિવસ મફત વાપરી જુઓ.",
    tryFree_other: "પ્રોની બાકીની બધી વસ્તુ સાથે આને {count} દિવસ મફત વાપરી જુઓ.",
    startTrial_one: "મારો {count} મફત દિવસ શરૂ કરો",
    startTrial_other: "મારા {count} મફત દિવસ શરૂ કરો",
    getPro: "પ્રો લો — મહિને {price}",
    trialDisclosure_one:
      "{count} દિવસ મફત. {date}ના રોજ તમારા કાર્ડમાંથી {price} કપાશે, પછી દર મહિને {price}. એ પહેલાં ગમે ત્યારે રદ કરી દો તો તમારે એક પૈસો પણ આપવાનો નથી.",
    trialDisclosure_other:
      "{count} દિવસ મફત. {date}ના રોજ તમારા કાર્ડમાંથી {price} કપાશે, પછી દર મહિને {price}. એ પહેલાં ગમે ત્યારે રદ કરી દો તો તમારે એક પૈસો પણ આપવાનો નથી.",
    recordsStay: "તમે પહેલાં લખેલું બધું જ્યાં છે ત્યાં જ રહેશે, ગમે તે પ્લાન હોય.",
    exportsAlwaysWork: "એક્સપોર્ટ હંમેશાં ચાલે છે.",
    trialEndsToday: "તમારી મફત અજમાયશ આજે પૂરી થાય છે",
    trialLastDay: "તમારી મફત અજમાયશનો છેલ્લો દિવસ",
    trialDaysLeft_one: "તમારી મફત અજમાયશનો {count} દિવસ બાકી",
    trialDaysLeft_other: "તમારી મફત અજમાયશના {count} દિવસ બાકી",
    cardChargedOn: "{date}ના રોજ તમારા કાર્ડમાંથી {price} કપાશે.",
    thenPricePerMonth: "પછી મહિને {price}.",
    manageOrCancel: "સંભાળો કે રદ કરો",
    hideUntilTomorrow: "કાલ સુધી છુપાવો",
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
