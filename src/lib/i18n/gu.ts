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
    // બધું / આવક / જાવક વાળા બટનનું નામ, સ્ક્રીન રીડર માટે. "દિશા" અહીં કંઈ
    // કહેતું નથી, એટલે એ બે શબ્દો જ વાપર્યા છે જે બટન પર દેખાય છે.
    directionLabel: "આવક કે જાવક",
    nothingLoggedBlurb:
      "તમે લખવાનું શરૂ કરશો એટલે તમે લખેલું બધું અહીં દેખાશે — શોધવા અને સુધારવા માટે.",
    noMatchHint: "ઓછા શબ્દો વાપરો, તારીખનો ગાળો પહોળો કરો, અથવા “બધું” થી ફરી શરૂ કરો.",
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
    welcomeTitle: "બધું અજમાવી જોવું છે?",
    welcomeBody_one:
      "SimpleBooks પ્રો {count} દિવસ મફત વાપરી જુઓ. તેમાં AI પાસેથી તમારા ચોપડા વિશે જવાબ, રસીદનું સ્કેન, ગમે તેટલા ઇન્વોઇસ, બજેટ, એક્સપોર્ટ, નેટ વગર પણ સિંક અને બધી ભાષાઓ મળે છે.",
    welcomeBody_other:
      "SimpleBooks પ્રો {count} દિવસ મફત વાપરી જુઓ. તેમાં AI પાસેથી તમારા ચોપડા વિશે જવાબ, રસીદનું સ્કેન, ગમે તેટલા ઇન્વોઇસ, બજેટ, એક્સપોર્ટ, નેટ વગર પણ સિંક અને બધી ભાષાઓ મળે છે.",
    welcomeFinePrint_one: "{count} દિવસ મફત, પછી મહિને {price}. ગમે ત્યારે રદ કરી શકો છો.",
    welcomeFinePrint_other: "{count} દિવસ મફત, પછી મહિને {price}. ગમે ત્યારે રદ કરી શકો છો.",
    welcomeStartTrial: "મારી {count} દિવસની પ્રો અજમાયશ શરૂ કરો",
    welcomeContinueFree: "ના, આભાર — ફ્રી પ્લાનમાં જ આગળ વધો",
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
    dialogLabel: "કમાન્ડ પેલેટ",
    pageExportRecords: "હિસાબ એક્સપોર્ટ કરો",
    pageHelp: "મદદ — બધું કેવી રીતે ચાલે છે",
    pageHelpLogging: "મદદ: પૈસા લખવા",
    pageHelpMonth: "મદદ: આ મહિનો",
    pageHelpTools: "મદદ: ટૂલ્સ",
    pageHelpExport: "મદદ: એક્સપોર્ટ",
  },
  help: {
    title: "બધું કેવી રીતે ચાલે છે",
    blurb:
      "એપની દરેક વસ્તુ — શેના માટે છે અને કેમ વાપરવી. શોધો, અથવા મદદના મેનુમાંથી કોઈ વિષય પસંદ કરો.",
    searchPlaceholder: "મદદમાં શોધો — “રસીદ”, “વહેંચો”, “ટૅક્સ” લખી જુઓ…",
    searchLabel: "મદદમાં શોધો",
    clearSearch: "મદદની શોધ ભૂંસો",
    matchCount_one: "“{query}” સાથે {count} વિષય મળે છે.",
    matchCount_other: "“{query}” સાથે {count} વિષય મળે છે.",
    oneSectionTitle: "ફક્ત એક જ ભાગ બતાવ્યો છે",
    oneSectionBody: "તમે માર્ગદર્શિકાના એક ભાગની લિંક પરથી અહીં આવ્યા છો.",
    noMatch: "“{query}” જેવું કંઈ મળ્યું નહીં",
    noMatchHint: "કોઈ સાદો શબ્દ વાપરી જુઓ — “ટૅક્સ”, “રસીદ”, “એક્સપોર્ટ”.",
    whereToFind: "ક્યાં મળશે",
    howToUse: "કેમ વાપરવું",
    worthKnowing: "જાણવા જેવું",
    openIt: "ખોલો",
    stillStuck: "હજી ગૂંચ પડે છે?",
    // {link} = "પૈસા વિશે પૂછો" પાનાની લિંક. વાક્યમાં જ્યાં બંધ બેસે ત્યાં મૂકી
    // શકાય, પણ એક જ વાર આવવી જોઈએ.
    stillStuckBody:
      "{link} પર તમારા પોતાના શબ્દોમાં પૂછી જુઓ — એ તમારા પોતાના આંકડા પરથી જવાબ આપે છે. ટૅક્સ કે કાયદાની કોઈ પણ વાત માટે એપ પર આધાર રાખવાને બદલે હિસાબનીસને પૂછી લેજો.",

    groupStart: "શરૂઆત",
    groupLogging: "પૈસા લખવા",
    groupDay: "તમારો દિવસ",
    groupMonth: "આ મહિનો",
    groupInvoices: "ઇન્વોઇસ",
    groupTools: "ટૂલ્સ",
    groupExport: "એક્સપોર્ટ",
    groupOffline: "ફોન અને સિગ્નલ વગર",
    groupPrivacy: "ખાનગીપણું અને તમારો ડેટા",

    firstRunTitle: "પહેલી વાર ગોઠવણી",
    firstRunWhere: "આજે",
    firstRunSummary:
      "બે જ પગલાં — એક એન્ટ્રી અને ટૅક્સના ટકા — પછી બાકીની આખી એપ કામ કરવા લાગે છે.",
    firstRunKeywords: "ગોઠવણી શરૂઆત નવું ખાતું પહેલી વાર onboarding setup begin",
    firstRunStep1: "આજે પાના પર ગોઠવણીના ખાનામાં તમે જે કમાયા તે લખો અને સેવ કરો.",
    firstRunStep2:
      "તમારી કમાણીમાંથી ટૅક્સ માટે કેટલા ટકા બાજુ પર રાખવા છે તે નક્કી કરો — મોટા ભાગના લોકો 25% થી શરૂ કરે છે.",
    firstRunStep3:
      "બંને પતે એટલે ગોઠવણીનું ખાનું જાતે જ જતું રહે છે. અત્યારે ન કરવું હોય તો “છોડી દો” એવી લિંક પણ છે.",
    firstRunNote1:
      "અહીં કંઈ કાયમી નથી — ટૂલ્સમાં જઈને ટૅક્સના ટકા ગમે ત્યારે બદલી શકો, અને કોઈ પણ એન્ટ્રી કાઢી નાખી શકો.",

    paletteTitle: "⌘K થી ગમે ત્યાં પહોંચો",
    paletteWhere: "ગમે ત્યાં",
    paletteSummary:
      "એક જ શૉર્ટકટ — કોઈ પણ પાના પર જાઓ, અથવા જે કામ ચાલુ છે તે છોડ્યા વગર એન્ટ્રી લખી દો.",
    paletteKeywords:
      "કમાન્ડ પેલેટ શોધ શૉર્ટકટ કીબોર્ડ command palette search shortcut ctrl k keyboard",
    paletteStep1: "⌘K દબાવો (Windows પર Ctrl+K), અથવા ઉપરની પટ્ટીમાં શોધો પર ક્લિક કરો.",
    // પહેલા અક્ષરોવાળું ઉદાહરણ ગુજરાતીમાં જ રાખ્યું છે: command-palette.tsx નું
    // matches() કોડ-પોઇન્ટ પર ચાલે છે, એટલે “પકગ” ખરેખર “પૈસા ક્યાં ગયા” જ શોધે
    // છે — તપાસી જોયું છે, બીજું કોઈ પાનું એમાં આવતું નથી.
    paletteStep2:
      "પાનાના નામનો થોડો ભાગ લખો — પહેલા અક્ષરો પણ ચાલે, જેમ કે “પકગ” લખતાં પૈસા ક્યાં ગયા મળી જશે.",
    paletteStep3: "અથવા “spent 20 on supplies” જેવી એન્ટ્રી લખો અને “આ એન્ટ્રી લખી દો” પસંદ કરો.",
    paletteStep4: "તીરની ચાવીઓથી ફરો, Enter થી પસંદ કરો, Escape થી બંધ કરો.",

    themeTitle: "ડાર્ક કે લાઇટ",
    themeWhere: "ઉપરની પટ્ટી",
    themeSummary: "એપ શરૂઆતમાં ડાર્ક હોય છે; ઉજાસવાળી જગ્યાએ લાઇટ કરી લો.",
    themeKeywords: "થીમ ડાર્ક લાઇટ મોડ સૂરજ ચંદ્ર તડકો બહાર theme dark light mode",
    themeStep1:
      "ઉપરની પટ્ટીમાં સૂરજ કે ચંદ્રના ચિહ્ન પર ક્લિક કરો. તમે જે પસંદ કરો તે યાદ રહી જાય છે.",
    themeNote1: "બહાર તડકામાં લાઇટ મોડ કામનો છે — ડાર્ક સ્ક્રીન તડકામાં વંચાતી નથી.",

    quickAddTitle: "ઝટપટ લખો — બસ ટાઇપ કરી દો",
    quickAddWhere: "આજે → નવી એન્ટ્રી",
    quickAddSummary: "તમે જેમ બોલો એમ લખી દો, ખાનાં જાતે ભરાઈ જશે.",
    quickAddKeywords:
      "ઝટપટ ટાઇપ ઝડપી એન્ટ્રી સાદી ભાષા quick type parse fast entry natural language",
    quickAddStep1: "આવું કંઈક લખો: “spent 42.50 at costco on groceries” કે “made 300”.",
    quickAddStep2: "નીચે દેખાતી ઝલકની લીટી જોઈ લો — એણે શું સમજ્યું તે એમાં જ દેખાય છે.",
    quickAddStep3: "ઉમેરો દબાવો.",
    quickAddNote1:
      "એ તમારી પાસેથી શીખે છે: Costco ને એક વાર કરિયાણામાં મૂકી દો, પછીની વાર એ પ્રકાર જાતે જ ભરાઈ જશે.",
    quickAddNote2: "“yesterday” અને 2026-08-01 જેવી તારીખ — બંને ચાલે છે.",

    voiceTitle: "બોલીને લખાવો",
    voiceWhere: "આજે → નવી એન્ટ્રી",
    voiceSummary: "ટાઇપ કરવાને બદલે એન્ટ્રી બોલી દો.",
    voiceKeywords: "અવાજ બોલીને માઇક બોલવું voice speech microphone dictate talk say",
    voiceStep1: "ઝટપટ લખવાના ખાનાની બાજુમાં આવેલા માઇક પર ટૅપ કરો.",
    voiceStep2: "આવું કંઈક બોલો: “spent twenty dollars on lunch”.",
    voiceStep3: "એ ખાનું ભરી દેશે — એક વાર જોઈ લો, પછી ઉમેરો દબાવો.",
    voiceNote1:
      "Chrome અને Safari માં ચાલે છે. Firefox માં માઇકનું બટન દેખાતું જ નથી, કારણ કે એ બ્રાઉઝર આ કરી શકતું નથી.",
    voiceNote2: "શબ્દોમાં બોલેલી રકમ પણ સમજાય છે: “three hundred and fifty” બોલો એટલે 350 થાય.",
    voiceNote3: "પહેલી વાર તમારું બ્રાઉઝર માઇક વાપરવાની છૂટ માગશે.",

    fullFormTitle: "આખી એન્ટ્રીનું ફોર્મ",
    fullFormWhere: "આજે → નવી એન્ટ્રી",
    fullFormSummary: "જ્યારે બધું જાતે ભરવું હોય ત્યારે.",
    fullFormKeywords: "ફોર્મ જાતે તારીખ કમાણી ખર્ચ પ્રકાર રોકડ કાર્ડ form manual date cash card",
    fullFormStep1: "તારીખ નક્કી કરો, પછી કમાણી અને/અથવા ખર્ચ લખો.",
    fullFormStep2: "શેના પર ખર્ચ થયો, અને ક્યાં (દુકાનનું નામ) — મરજી હોય તો એ પણ લખો.",
    fullFormStep3: "રોકડ, કાર્ડ કે બીજું પસંદ કરો — ગલ્લાનો મેળ આના પરથી જ મળે છે.",
    fullFormStep4: "રસીદનો ફોટો હોય તો જોડી દો.",

    receiptsTitle: "રસીદનો ફોટો, જે જાતે ભરાઈ જાય",
    receiptsWhere: "આજે → નવી એન્ટ્રી",
    receiptsSummary: "રસીદનો ફોટો પાડો, એ કુલ રકમ, પ્રકાર, તારીખ અને દુકાન વાંચી લે છે.",
    receiptsKeywords: "રસીદ ફોટો સ્કેન કૅમેરા receipt photo scan ocr camera picture",
    receiptsStep1: "રસીદનો ફોટો ખાનામાં ફોટો પસંદ કરો, કે નવો પાડો.",
    receiptsStep2: "એક ઘડી થોભો — એ રસીદ વાંચીને જે મળ્યું તે ભરી દેશે.",
    receiptsStep3: "સેવ કરતાં પહેલાં આંકડા જોઈ લો. ફોટો એન્ટ્રી સાથે જોડાયેલો રહે છે.",
    receiptsNote1:
      "રસીદ વાંચવા માટે AI ની ચાવી ગોઠવેલી હોવી જોઈએ. એ ન હોય તોય બાકી બધું ચાલે છે — બસ વિગત તમારે જાતે લખવી પડે.",
    receiptsNote2:
      "રસીદના ફોટા ફક્ત તમારા માટે જ છે અને સલામત જગ્યાએ સચવાય છે — એન્ટ્રી શેર કરેલી હોય તોય.",

    editingTitle: "એન્ટ્રી સુધારવી કે કાઢી નાખવી",
    editingWhere: "આજે",
    editingSummary: "એન્ટ્રી કાઢી નાખો, પછીથી રસીદ જોડો, કે એ કોણ જોઈ શકે તે બદલો.",
    editingKeywords: "કાઢી નાખો ભૂલ સુધારો બદલો રસીદ શેર delete remove edit mistake receipt share",
    editingStep1: "આજે પાના પરની યાદીમાં એ એન્ટ્રી શોધો.",
    editingStep2: "કૅમેરાનું ચિહ્ન રસીદનો ફોટો જોડે છે કે બદલે છે.",
    editingStep3: "માણસોનું ચિહ્ન એ બદલે છે કે એને કોણ જોઈ શકે (ફક્ત તમે ઘરના જૂથમાં હો તો જ).",
    editingStep4:
      "કચરાપેટીનું ચિહ્ન એને કાઢી નાખે છે — પહેલાં એક વાર પૂછે છે, અને પછી એ પાછી નહીં આવે.",
    editingNote1: "આંકડા પોતે બદલવા હોય તો એન્ટ્રી શોધો વાપરો — નીચે જુઓ.",

    findEntryTitle: "એન્ટ્રી શોધો, અને સુધારો",
    findEntryWhere: "આજે → એન્ટ્રી શોધો",
    findEntrySummary: "તમે લખેલું બધું શોધો, પછી કોઈ એક પર ટૅપ કરીને એને બદલો.",
    findEntryKeywords:
      "શોધો ફિલ્ટર સુધારો બદલો ભૂલ ખોટું રકમ તારીખ જૂનું search find filter edit correct fix change typo mistake history amount date",
    findEntryStep1: "તમને જે યાદ હોય તે લખો — દુકાન, પ્રકાર, તારીખ, કે રકમ પણ.",
    findEntryStep2: "વધુ ફિલ્ટર થી હજી ગાળો: પ્રકાર, રોકડ કે કાર્ડ, તારીખનો ગાળો, કે રકમનો ગાળો.",
    findEntryStep3: "કોઈ પરિણામ પર ટૅપ કરીને ખોલો, જે ખોટું હોય તે બદલો, અને ફેરફાર સેવ કરો.",
    findEntryNote1:
      "તમે લખેલો દરેક શબ્દ મળવો જોઈએ, એટલે “કોસ્ટકો કરિયાણું” લખવાથી યાદી પહોળી નહીં, સાંકડી થાય છે.",
    findEntryNote2:
      "સરવાળાની લીટી સ્ક્રીન પર જે દેખાય એટલાનો જ સરવાળો કરે છે, એટલે શોધ પોતે જ એક ઝટપટ રિપોર્ટ બની જાય છે — એક જ પ્રકાર પર ફિલ્ટર કરો, અને એ પ્રકારનો કુલ સરવાળો હાજર.",
    findEntryNote3:
      "ઘરના જૂથમાં શેર કરેલી એન્ટ્રી કોઈ પણ સુધારી શકે છે, પણ કાઢી નાખવાનું ફક્ત જેણે લખી હોય એના જ હાથમાં છે.",
    findEntryNote4: "શોધ તમારા ફોનમાં જ થાય છે, એટલે તરત થાય છે અને નેટ વગર પણ ચાલે છે.",

    safeToSpendTitle: "આજે આટલું વાપરી શકો",
    safeToSpendWhere: "આજે",
    safeToSpendSummary:
      "એક જ આંકડો: આગળ જતાં આ મહિનામાં તકલીફ ન પડે એ રીતે અત્યારે તમે કેટલું વાપરી શકો.",
    safeToSpendKeywords: "વાપરવા બચ્યું રોજનું ભથ્થું બજેટ safe spend daily allowance budget left",
    safeToSpendNote1:
      "તમે બજેટ નક્કી કર્યાં હોય, તો એમાંથી જે બચ્યું છે તે મહિનાના બાકીના દિવસોમાં વહેંચેલું.",
    safeToSpendNote2:
      "ન કર્યાં હોય, તો હાથ પરની રોકડમાંથી આ મહિને હજી ભરવાનાં બિલ બાદ કરીને, બાકીના દિવસોમાં વહેંચેલું.",
    safeToSpendNote3:
      "તમે પાછળ પડ્યા હો ત્યારે જગ્યા હોવાનો ડોળ કરવાને બદલે એ $0.00 બતાવે છે અને લાલ થઈ જાય છે.",

    dueSoonTitle: "જલદી ભરવાનાં બિલ",
    dueSoonWhere: "આજે",
    dueSoonSummary: "પાંચ દિવસમાં કંઈ ભરવાનું હોય તો ઉપર ચેતવણી દેખાય છે.",
    dueSoonKeywords: "મુદત યાદ બિલ ચેતવણી જલદી due reminder alert bills warning soon",
    dueSoonNote1:
      "તમે દર વખતે આવતાં બિલ નોંધ્યાં હોય અને એમાંનું કોઈ નજીક હોય, ત્યારે જ એ દેખાય છે.",
    dueSoonNote2: "બિલ નોંધવા માટે આ મહિનો → બિલ પર જાઓ.",

    streaksTitle: "સળંગ દિવસો",
    streaksWhere: "આજે → તમારા સળંગ દિવસો",
    streaksSummary: "તમે સળંગ કેટલા દિવસ લખ્યું, નફામાં રહ્યા, કે ખર્ચ વગર રહ્યા.",
    streaksKeywords: "સળંગ સિલસિલો ટેવ નફો ખર્ચ વગર streak habit run profitable no spend record",
    streaksNote1:
      "ખર્ચ વગરનો દિવસ ત્યારે જ ગણાય જ્યારે તમે એ દિવસે ખરેખર કંઈક લખ્યું હોય — એપ વાપરવાનું ભૂલી જવાથી સિલસિલો બનતો નથી.",
    streaksNote2: "આજે હજી લખ્યું નથી એટલા માટે સિલસિલો તૂટતો નથી; ગણતરી ગઈકાલથી થાય છે.",

    askTitle: "તમારા પૈસા વિશે સવાલ પૂછવા",
    askWhere: "આજે → પૈસા વિશે પૂછો",
    askSummary: "તમારા પોતાના આંકડા વિશે સાદી ભાષામાં સવાલ.",
    askKeywords: "પૂછો સવાલ સલાહ ચેટ ask question chat ai help advice",
    askStep1: "આવો સવાલ લખો: “સૌથી વધારે ખર્ચ શેમાં થયો?” કે “$200 નો ખર્ચ પોસાય?”",
    askStep2: "સૂચવેલા સવાલોમાંથી કોઈ એક પર ટૅપ કરીને જુઓ કે એ કેવી વાતોના જવાબ આપે છે.",
    askNote1:
      "એ તમારી પોતાની એન્ટ્રી પરથી જ જવાબ આપે છે, અને તમારા ધંધા વિશે આંકડા કદી ઉપજાવી કાઢતું નથી.",
    askNote2:
      "ખર્ચ, પ્રકાર, સરખામણી, બજેટ, બિલ, દુકાનો, લક્ષ્ય, આગળનો હિસાબ, ટૅક્સ અને વસ્તુ દીઠ નફો — આ બધું એ સંભાળે છે.",
    askNote3:
      "તમારી બૅન્કમાં કેટલા છે, દેવું કેટલું છે કે પગાર ક્યારે આવે છે — એ એને ખબર નથી. તમે અહીં જે લખ્યું હોય એટલું જ.",

    monthOverviewTitle: "મહિનાની ઝલક",
    monthOverviewWhere: "આ મહિનો → ઝલક",
    monthOverviewSummary: "કોઈ પણ મહિનાની આવક, જાવક અને નફો.",
    monthOverviewKeywords: "મહિનો સરવાળો નફો ખોટ ઝલક monthly totals profit loss overview",
    monthOverviewStep1: "મહિનાના નામની બંને બાજુનાં તીર વાપરીને એક મહિનેથી બીજા મહિને જાઓ.",
    monthOverviewNote1:
      "તમે જે મહિનો પસંદ કરો તે યાદ રહે છે, એટલે મહિનાનાં બીજાં પાનાં પર જાઓ ત્યાં પણ એ જ મહિનો ખૂલે છે.",

    categoriesTitle: "પૈસા ક્યાં ગયા",
    categoriesWhere: "આ મહિનો → પૈસા ક્યાં ગયા",
    categoriesSummary: "તમારો ખર્ચ પ્રકાર પ્રમાણે વહેંચેલો, સૌથી મોટો પહેલો.",
    categoriesKeywords: "પ્રકાર ખર્ચ ભાગલા ચાર્ટ categories breakdown pie chart spending",

    daybydayTitle: "રોજેરોજ",
    daybydayWhere: "આ મહિનો → રોજેરોજ",
    daybydaySummary: "મહિનાનો દરેક દિવસ એક પટ્ટી — ઉપર જાય તો લીલી, નીચે જાય તો લાલ.",
    daybydayKeywords: "રોજનું ચાર્ટ પટ્ટી દિવસ daily chart bars days",

    weekTitle: "તમારું અઠવાડિયું સાદી ભાષામાં",
    weekWhere: "આ મહિનો → તમારું અઠવાડિયું",
    weekSummary: "છેલ્લા સાત દિવસનો ટૂંકો લખેલો સાર.",
    weekKeywords: "અઠવાડિયું સાર સારાંશ સાદી ભાષા digest weekly recap summary",
    weekNote1: "તમારા પોતાના આંકડા પરથી લખાય છે, અને આગલા અઠવાડિયા સાથે સરખામણી પણ કરી આપે છે.",

    outlookTitle: "જે આવવાનું છે એ પહોંચી વળશો?",
    outlookWhere: "આ મહિનો → પૈસા પૂરા થશે?",
    outlookSummary: "આગળના 30 દિવસની નજર: આવનારાં બિલ માટે તમારા પૈસા પૂરા થશે?",
    outlookKeywords:
      "આગાહી આગળનો હિસાબ ભાડું ખૂટવું અંદાજ forecast outlook runway rent future shortfall predict",
    outlookNote1:
      "તમારા હમણાંના દિવસો પરથી નીકળતા સામાન્ય દિવસ પરથી બને છે, અને દર વખતે આવતું દરેક બિલ જે દિવસે આવે તે દિવસે એમાં ઉમેરાય છે.",
    outlookNote2: "એને લાગે કે પૈસા ખૂટશે, તો તારીખ સાથે ચેતવણી આપી દે છે.",
    outlookNote3: "થોડા જ દિવસ લખ્યા હોય તો ચોકસાઈનો ડોળ કરવાને બદલે એ સાફ કહી દે છે.",

    busydaysTitle: "ધમધમતા અને ધીમા દિવસો",
    busydaysWhere: "આ મહિનો → ધમધમતા અને ધીમા દિવસો",
    busydaysSummary: "અઠવાડિયાના કયા દિવસે ખરેખર પૈસા આવે છે.",
    busydaysKeywords: "ધીમા ધમધમતા વાર દિવસ સૌથી સારો slow quiet busy weekday pattern best day",
    busydaysNote1:
      "એનો કંઈ અર્થ નીકળે એ પહેલાં આશરે ત્રણ અઠવાડિયાંની એન્ટ્રી જોઈએ — એટલી ન હોય તો એ તમને કહી દેશે.",

    budgetsTitle: "બજેટ",
    budgetsWhere: "આ મહિનો → બજેટ",
    budgetsSummary: "દરેક પ્રકાર માટે મહિનાની હદ, અને હદ વટે એ પહેલાં ચેતવણી.",
    budgetsKeywords: "બજેટ હદ પ્રકાર ચેતવણી વધુ ખર્ચ budget limit cap category alert overspend",
    budgetsStep1: "એક પ્રકાર અને મહિનાની હદ લખો, પછી બજેટ સેવ કરો.",
    budgetsStep2:
      "પટ્ટીઓ પર નજર રાખો — 80% પર એ લાલ થાય છે, અને 100% વટ્યા પછી “વટી ગયું” લખાય છે.",
    budgetsNote1: "આજે પાના પરનો “આજે આટલું વાપરી શકો” આંકડો પણ બજેટ પરથી જ નીકળે છે.",

    goalsTitle: "બચતના લક્ષ્ય",
    goalsWhere: "આ મહિનો → બચતના લક્ષ્ય",
    goalsSummary: "જેના માટે તમે પૈસા બાજુ પર મૂકો છો, અને તમે એનાથી કેટલા નજીક છો.",
    goalsKeywords: "લક્ષ્ય બચત ભેગું કરવું બાજુ પર goal saving target save up",
    goalsStep1: "નામ, લક્ષ્યની રકમ, અત્યાર સુધી ભેગું કરેલું, અને મરજી હોય તો એક તારીખ ઉમેરો.",
    goalsNote1:
      "તારીખ આપી હોય તો એ ગણી આપે છે કે દર અઠવાડિયે કેટલું બચાવવું પડશે; ન આપી હોય તો તમારી હમણાંની ઝડપ પરથી અંદાજ કાઢે છે.",

    billsTitle: "બિલ, સબસ્ક્રિપ્શન અને દર વખતે આવતા ખર્ચ",
    billsWhere: "આ મહિનો → બિલ",
    billsSummary: "શું ભરવાનું છે, શું સબસ્ક્રિપ્શન લાગે છે, અને તમે નક્કી કરેલા દર વખતના ખર્ચ.",
    billsKeywords:
      "બિલ સબસ્ક્રિપ્શન મુદત ભાડું દર મહિને bills recurring subscription due calendar rent detect",
    billsStep1: "દર વખતે આવતું બિલ ઉમેરો — રકમ, પ્રકાર, દર અઠવાડિયે કે દર મહિને, અને ક્યારથી શરૂ.",
    billsStep2: "પછી તારીખ આવતી જાય તેમ એ ખર્ચની એન્ટ્રી જાતે જ બનતી જાય છે.",
    billsNote1:
      "તમારા જૂના હિસાબમાં વારંવાર દેખાતા ખર્ચ પણ એ પકડી પાડે છે, અને એક ટૅપમાં એને બિલ તરીકે નોંધી લેવાનું સૂચવે છે.",
    billsNote2:
      "આ પકડ જાણી જોઈને સાચવીને રખાઈ છે: ત્રણ કે વધારે વાર દેખાવું જોઈએ, રકમ સરખી હોવી જોઈએ અને વચ્ચેનો ગાળો પણ સરખો — એટલે આડીઅવળી ખરીદી પર એ નિશાની નહીં કરે.",

    invoiceCreateTitle: "ગ્રાહકને ઇન્વોઇસ મોકલવું",
    invoiceCreateWhere: "ઇન્વોઇસ → નવું ઇન્વોઇસ",
    invoiceCreateSummary: "ઇન્વોઇસ બનાવો, પછી એક જ યાદીમાંથી મોકલો અને ઉઘરાણી કરો.",
    invoiceCreateKeywords:
      "ઇન્વોઇસ બિલ ગ્રાહક ડ્રાફ્ટ નંબર મોકલો ઉઘરાણી invoice bill customer client charge create send draft number",
    invoiceCreateStep1:
      "કોના માટે છે, તારીખ, અને જેના પૈસા લેવાના છે તે એક વસ્તુ એક લીટીમાં — આટલું ભરો.",
    invoiceCreateStep2: "તમે લખતા જાઓ તેમ કુલ સરવાળો જાતે થતો જાય છે.",
    invoiceCreateStep3: "બનાવી દો — શરૂઆતમાં એ ડ્રાફ્ટ રહે છે, એટલે કંઈ પાકું નથી.",
    invoiceCreateStep4: "ખરેખર ગ્રાહકને મોકલી દો, પછી એને ખોલીને “મોકલી દીધું” પર ટૅપ કરો.",
    invoiceCreateNote1:
      "નંબર ક્રમમાં ચાલે છે અને કદી ફરી વપરાતા નથી — તમે કોઈ ઇન્વોઇસ રદ કરો તોય નહીં. વચ્ચે નંબર ખૂટે એ સામાન્ય છે; બે ઇન્વોઇસ પર એક જ નંબર હોય એ સામાન્ય નથી.",
    invoiceCreateNote2:
      "ડ્રાફ્ટ બદલી પણ શકાય અને કાઢી પણ નાખી શકાય. એક વાર મોકલી દીધા પછી બદલી શકાય કે રદ કરી શકાય, પણ કાઢી ન શકાય — જેથી નંબરની સાંકળ તૂટે નહીં.",
    invoiceCreateNote3:
      "પ્રિન્ટ કરો કે PDF સેવ કરો — એની આજુબાજુ એપની કોઈ વસ્તુ વગરની ચોખ્ખી નકલ મળે છે.",

    invoicePaidTitle: "પૈસા મળે ત્યારે, અને એની તમારા ચોપડા પર શું અસર થાય",
    invoicePaidWhere: "ઇન્વોઇસ → કોઈ એક ખોલો",
    invoicePaidSummary: "ઇન્વોઇસના પૈસા મળ્યાની નિશાની કરો — ત્યારે જ એ આવક બને છે.",
    invoicePaidKeywords:
      "પૈસા મળ્યા ચૂકવણી આવક ચોપડો બાકી મુદત વીતી paid payment mark unpaid income books entry outstanding overdue owed",
    invoicePaidStep1: "ઇન્વોઇસ ખોલો અને “પૈસા મળી ગયા” પર ટૅપ કરો.",
    invoicePaidStep2: "પૈસા ખરેખર જે તારીખે આવ્યા તે તારીખ પસંદ કરો — બંને જુદી હોય તો આજની નહીં.",
    invoicePaidNote1:
      "આનાથી એ તારીખે તમારા ચોપડામાં આવકની સામાન્ય એન્ટ્રી બની જાય છે, એટલે બીજી કોઈ પણ આવકની જેમ એ તમારા સરવાળામાં, તમારા મહિનામાં, ટૅક્સ માટે બાજુ પર રાખેલામાં અને એક્સપોર્ટમાં — બધે ચઢી જાય છે.",
    invoicePaidNote2:
      "પૈસા મળ્યાની નિશાની ન થાય ત્યાં સુધી એ તમારા આંકડામાં આવતું જ નથી. જેના પૈસા હજી મળ્યા નથી એ આવક નથી, અને એને ગણી લેવાથી તમારો નફો અને તમારો ટૅક્સ બંને ફુલાવેલા દેખાય.",
    invoicePaidNote3: "વિચાર બદલાયો? “પૈસા મળ્યા નથી” કરી દો, એટલે એ એન્ટ્રી પાછી નીકળી જશે.",
    invoicePaidNote4:
      "જેની મુદત વીતી ગઈ હોય એ બધું જાતે જ “મુદત વીતી” બતાવે છે — એ તારીખ પરથી જ ગણાય છે, એટલે એ કદી વાસી થતું નથી.",

    householdTitle: "કોઈની સાથે વહેંચીને ચલાવવું",
    householdWhere: "ટૂલ્સ → ઘરના",
    householdSummary:
      "પસંદ કરેલી એન્ટ્રી જીવનસાથી કે સાથે રહેનાર સાથે શેર કરો, અને બિલ સરખા ભાગે વહેંચો.",
    householdKeywords:
      "ઘરના શેર વહેંચો ભાગીદાર આમંત્રણ કોડ ચૂકતે household share partner housemate split settle invite code",
    householdStep1: "ઘરનું જૂથ બનાવો, એટલે તમને છ અક્ષરનો આમંત્રણ કોડ મળશે.",
    householdStep2: "સામેની વ્યક્તિ ખાતું બનાવે, ટૂલ્સ → ઘરના ખોલે, અને એ કોડ લખે.",
    householdStep3: "તમે કંઈ લખો ત્યારે ફક્ત હું, શેર, કે વહેંચો — એમાંથી પસંદ કરો.",
    householdNote1:
      "તમે જાતે ન કહો ત્યાં સુધી બધું ખાનગી જ રહે છે — ઘરના જૂથમાં જોડાવાથી તમે પહેલાં લખેલું કંઈ પણ સામે દેખાતું નથી.",
    householdNote2:
      "શેર એટલે એ જોઈ શકે. વહેંચો એટલે એ સરખા ભાગે વહેંચાય પણ છે, અને કોણે કોને કેટલા આપવાના એ સરવાળામાં દેખાય છે.",
    householdNote3:
      "ઘરના જૂથમાં શેર કરેલી એન્ટ્રી કોઈ પણ સુધારી શકે છે, પણ કાઢી નાખવાનું ફક્ત જેણે લખી હોય એના જ હાથમાં છે.",
    householdNote4: "ઘરનું જૂથ છોડી દો, એટલે તમારી શેર કરેલી એન્ટ્રી ફરી ફક્ત તમારી થઈ જાય છે.",

    marginsTitle: "એક વસ્તુ પાછળ ખરેખર શું બચે છે",
    marginsWhere: "ટૂલ્સ → વસ્તુ દીઠ નફો",
    marginsSummary: "પડતર અને વેચાણનો ભાવ લખો, દરેક વેચાણ પાછળનો સાચો નફો જુઓ.",
    marginsKeywords: "નફો પડતર ભાવ વસ્તુ દીઠ margin markup profit per item price product pricing",
    marginsNote1:
      "તમારો રોજિંદો ખર્ચ નીકળે એટલા માટે મહિને આશરે કેટલાં નંગ વેચવાં પડે, એ પણ એ કહી દે છે.",
    marginsNote2: "તમે કંઈ ખોટ ખાઈને વેચતા હો, તો એ મોઢામોઢ કહી દે છે.",

    drawerTitle: "ગલ્લાનો મેળ",
    drawerWhere: "ટૂલ્સ → ગલ્લો",
    drawerSummary: "ગલ્લો ગણી લો અને જુઓ કે તમે લખેલા હિસાબ સાથે મેળ બેસે છે કે નહીં.",
    drawerKeywords:
      "ગલ્લો રોકડ ગણતરી મેળ ઘટ વધ છૂટા cash drawer till count reconcile short over float",
    drawerStep1: "દિવસ, શરૂઆતના છૂટા પૈસા, અને તમે ખરેખર જે ગણ્યા તે લખો.",
    drawerStep2:
      "સેવ કરો એ પહેલાં જ એ બતાવી દે છે કે ગલ્લામાં કેટલા હોવા જોઈએ, અને કેટલો ફેર પડે છે.",
    drawerNote1:
      "જે એન્ટ્રી પર રોકડ લખેલું હોય એ જ આ ગણતરીમાં આવે છે. તમે કદી કંઈ પર રોકડ ન લખ્યું હોય, તો બધું જ રોકડ ગણી લેવાય છે.",
    drawerNote2:
      "ગલ્લામાં કેટલા હોવા જોઈએ એ સરવાળો તમારી એન્ટ્રી પરથી સર્વર પર જ થાય છે, એટલે એમાં ગોટાળો થઈ શકતો નથી.",

    taxTitle: "ટૅક્સ માટે અલગ",
    taxWhere: "ટૂલ્સ → ટૅક્સ માટે અલગ",
    taxSummary: "કમાણીમાંથી થોડું બાજુ પર રાખો, જેથી ટૅક્સનું બિલ આવે ત્યારે આંચકો ન લાગે.",
    taxKeywords: "ટૅક્સ બાજુ પર અલગ ટકા tax set aside percentage hold back quarterly",
    taxStep1: "ટકા નક્કી કરો. તમે આવક લખતા જાઓ તેમ સરવાળો પોતે વધતો જાય છે.",
    // “tax” અંગ્રેજીમાં જ રહેવું જોઈએ: src/lib/insights.ts પ્રકારના લખાણમાં આ જ
    // શબ્દ શોધે છે (/\btax(es)?\b/i), એટલે ગુજરાતીમાં લખેલું “ટૅક્સ” ગણાશે નહીં.
    taxNote1: "ટૅક્સ ભરો ત્યારે એની એન્ટ્રીના પ્રકારમાં “tax” લખજો, એટલે એ સરવાળામાં ગણાઈ જશે.",
    taxNote2: "આ ટૅક્સની સલાહ નથી — સાચા ટકા હિસાબનીસ પાસે પાકા કરી લેજો.",

    reminderTitle: "રોજની યાદ",
    reminderWhere: "ટૂલ્સ → રોજની યાદ",
    reminderSummary: "તમે નક્કી કરેલા સમયે એક ટકોર, જેથી લખવાની ટેવ પડી જાય.",
    reminderKeywords:
      "યાદ ટકોર નોટિફિકેશન રોજ સમય ટેવ reminder notification nudge daily alert time habit notify",
    reminderStep1:
      "તમારા દિવસને બંધ બેસે એવો સમય પસંદ કરો — દુકાન વધાવ્યા પછીનો સમય મોટે ભાગે બરાબર રહે છે.",
    reminderStep2: "યાદ ચાલુ કરો પર ટૅપ કરો, અને બ્રાઉઝર પૂછે ત્યારે નોટિફિકેશનની છૂટ આપો.",
    reminderNote1:
      "આ કેમ ચાલે છે એ ચોખ્ખું સમજી લેવા જેવું છે: સમય વીતી ગયો છે એ એપના ધ્યાનમાં આવે ત્યારે એ યાદ બતાવે છે. આ સર્વર પરથી મોકલાતું અલાર્મ નથી, એટલે જે ફોનમાં આખો દિવસ એપ ખૂલી જ ન હોય ત્યાં એ નહીં વાગે.",
    reminderNote2:
      "આઇફોન પર પહેલાં એપને હોમ સ્ક્રીન પર મૂકવી પડે છે — Apple બીજી કોઈ રીતે નોટિફિકેશન આપવા દેતું નથી.",
    reminderNote3:
      "તમે એ દિવસે કંઈક લખી ચૂક્યા હો તો એ ચૂપ રહે છે. વાત ટેવની છે, નોટિફિકેશનની નહીં.",
    reminderNote4: "તમે એપ દિવસમાં દસ વાર ખોલો તોય એ દિવસમાં એક જ વાર દેખાય છે.",
    reminderNote5:
      "તમે આ સાઇટ માટે નોટિફિકેશન રોકી દીધાં હોય, તો ચાલુ હોવાનો ડોળ કરવાને બદલે એપ તમને એ કહી દેશે.",

    lockTitle: "એપને તાળું",
    lockWhere: "ટૂલ્સ → એપ લોક કરો",
    lockSummary: "એક PIN, જેથી તમારો ખુલ્લો ફોન કોઈના હાથમાં આવે તોય એ તમારો ચોપડો વાંચી ન શકે.",
    lockKeywords: "લોક તાળું પિન ખાનગી સલામતી lock pin privacy security passcode biometric",
    lockStep1: "4 થી 8 આંકડાનો PIN પસંદ કરો, બે વાર લખો, અને ફરી ક્યારે પૂછવો એ નક્કી કરો.",
    lockStep2: "કાઢી નાખવો હોય તો લોક બંધ કરો વાપરો.",
    lockNote1:
      "તમારો PIN ગૂંચવેલા રૂપે સચવાય છે અને સર્વર પર તપાસાય છે — સાદા આંકડા તરીકે એ કદી રખાતો નથી.",
    lockNote2:
      "આ તમારા ફોન પર એપને છુપાવે છે. તમારું ખાતું તો પહેલેથી જ તમારા પાસવર્ડથી સચવાયેલું છે, એટલે PIN એની ઉપરની સગવડ છે — એની જગ્યા લેનારો નથી.",
    lockNote3:
      "ભૂલી ગયા? સાઇન આઉટ કરો, તમારા ઈમેલ અને પાસવર્ડથી ફરી સાઇન ઇન કરો, પછી નવો નક્કી કરી લો.",

    exportTitle: "હિસાબનીસને હિસાબ મોકલવો",
    exportWhere: "એક્સપોર્ટ",
    exportSummary: "તમારી એન્ટ્રી સ્પ્રેડશીટ તરીકે કે સુઘડ PDF તરીકે ડાઉનલોડ કરો.",
    exportKeywords:
      "એક્સપોર્ટ હિસાબનીસ ડાઉનલોડ સ્પ્રેડશીટ હિસાબ export csv pdf accountant download spreadsheet records",
    exportStep1: "તારીખનો ગાળો પસંદ કરો, અથવા આ મહિનો / ગયો મહિનો / બધું વાપરો.",
    exportStep2: "ઝલક જોઈ લો — ફાઇલમાં બરાબર આ જ જવાનું છે.",
    exportStep3: "CSV ડાઉનલોડ કરો કે PDF ડાઉનલોડ કરો — બેમાંથી એક પસંદ કરો.",
    exportNote1:
      "બંનેમાં તારીખ, આવક, જાવક, પ્રકાર, ક્યાં અને નોંધ આવે છે, અને છેલ્લે સરવાળાની લીટી પણ.",
    exportNote2:
      "મેનુમાં આવેલા એક્સપોર્ટ → CSV ડાઉનલોડ કરો અને PDF ડાઉનલોડ કરો, તમે અત્યારે પસંદ કરેલા ગાળા પ્રમાણે સીધા ડાઉનલોડ પર જ લઈ જાય છે.",

    installTitle: "એને તમારા ફોનમાં મૂકી દો",
    installWhere: "આજે, અથવા તમારા બ્રાઉઝરનું મેનુ",
    installSummary: "ઇન્સ્ટોલ કરી લો, એટલે એ પોતાના આઇકનથી, આખી સ્ક્રીન પર, એપની જેમ ખૂલે.",
    installKeywords:
      "ઇન્સ્ટોલ એપ હોમ સ્ક્રીન આઇકન ફોન install app home screen pwa download icon standalone phone",
    installStep1: "Android કે Chrome પર, આજે પાના પર એપ પોતે પૂછે ત્યારે ઇન્સ્ટોલ કરો પર ટૅપ કરો.",
    installStep2: "આઇફોન પર, Safari માં Share બટન દબાવો, પછી Add to Home Screen.",
    installNote1:
      "નેટ વગર લખવાનું અને રોજની યાદ બરાબર ચાલે એ માટે ઇન્સ્ટોલ કરવું જ પડે — ખાસ કરીને આઇફોન પર.",
    installNote2: "એ એની એ જ એપ છે અને એનું એ જ ખાતું — ફરી કંઈ ગોઠવવાનું નથી.",

    offlineLoggingTitle: "સિગ્નલ વગર લખવું",
    offlineLoggingWhere: "ગમે ત્યાં",
    offlineLoggingSummary:
      "ભોંયરામાં હો, બજારમાં હો, કે સિગ્નલ જ ન પકડાતું હોય — લખતા રહો. કંઈ ખોવાતું નથી.",
    offlineLoggingKeywords:
      "નેટ વગર સિગ્નલ ઇન્ટરનેટ કનેક્શન સિંક બજાર ભોંયરું offline no signal no internet connection sync queue market basement",
    offlineLoggingNote1: "કનેક્શન ન હોય ત્યારે ઉપર એક પટ્ટી દેખાય છે. તમે રોજની જેમ લખતા રહો.",
    offlineLoggingNote2:
      "એન્ટ્રી તમારા ફોનમાં જ સચવાય છે, અને તમે પાછા ઓનલાઇન થાઓ કે તરત, જે ક્રમમાં લખી હોય એ જ ક્રમમાં જાતે મોકલાઈ જાય છે.",
    offlineLoggingNote3: "એ પટ્ટીમાં “બતાવો” પર ટૅપ કરો, એટલે હજી શું બાકી છે એ આખું દેખાશે.",
    offlineLoggingNote4:
      "તમે પહેલાં ખોલેલાં પાનાં નેટ વગર પણ ચાલે છે, અને છેલ્લી વાર ખૂલ્યાં ત્યારના તમારા આંકડા વાંચી શકાય છે.",
    offlineLoggingNote5:
      "એક વસ્તુ નેટ વગર થતી નથી: રસીદનો ફોટો જોડવા માટે કનેક્શન જોઈએ. એન્ટ્રી તો સચવાઈ જ જાય છે, ફોટો પછીથી ઉમેરી દેજો.",
    offlineLoggingNote6:
      "કોઈ એન્ટ્રી વારંવાર સ્વીકારાય નહીં, તો એપ એને ચૂપચાપ ફેંકી દેવાને બદલે બાજુ પર મૂકીને તમને કહી દે છે. પછી તમે જાતે ફરી મોકલી શકો, કે જવા દઈ શકો.",
    offlineLoggingNote7:
      "સાઇન આઉટ કરવાથી બાકી રહેલું કંઈ ભૂંસાતું નથી — એ તમને ચેતવે છે અને એ ફોન પર તમે ફરી સાઇન ઇન કરો ત્યાં સુધી સાચવી રાખે છે.",

    privacyTitle: "તમારા આંકડા કોણ જોઈ શકે",
    privacyWhere: "બધે",
    privacySummary: "તમારી એન્ટ્રી તમારી જ છે. તમે જાતે શેર ન કરો ત્યાં સુધી કંઈ શેર થતું નથી.",
    privacyKeywords: "ખાનગીપણું સલામતી ડેટા કોણ જોઈ શકે privacy security data safe encryption",
    privacyNote1:
      "કોને શું જોવા મળે એ ફક્ત એપ નહીં, ડેટાબેઝ પોતે નક્કી કરે છે — એટલે બીજું કોઈ ખાતું તમારી એન્ટ્રી સિદ્ધાંતથી પણ વાંચી શકે નહીં.",
    privacyNote2:
      "તમે સાઇન આઉટ કરો એટલે ફોનમાં પડેલી તમારા આંકડાની નકલ ભૂંસાઈ જાય છે, જેથી પછી એ ફોન વાપરનાર એને વાંચી ન શકે.",
    privacyNote3:
      "ઘરના જૂથમાં શેર કરવાનું દરેક એન્ટ્રી પૂરતું અલગ છે, અને હંમેશાં તમારી પોતાની પસંદગી છે.",
    privacyNote4: "રસીદના ફોટા એવી ખાનગી જગ્યાએ પડ્યા રહે છે જે ફક્ત તમે જ ખોલી શકો.",
    privacyNote5:
      "તમે લખેલું બધું ગમે ત્યારે એક્સપોર્ટ કરી શકો છો, અને કોઈ પણ એન્ટ્રી કાઢી નાખી શકો છો.",
  },

  tools: {
    eyebrow: "ટૂલ્સ",
    didntWork: "એ થઈ શક્યું નહીં",
    copy: "કૉપી કરો",
    copied: "કૉપી થયું",
    square: "બરાબર",
    amountIn: "{amount} આવક",
    amountOut: "{amount} જાવક",

    householdTitle: "કોઈની સાથે શેર કરો",
    householdBlurb:
      "તમે પસંદ કરો એ એન્ટ્રી જીવનસાથી કે સાથે રહેનાર સાથે શેર કરો, અને ખર્ચ સરખા ભાગે વહેંચો. જે શેર ન કરો તે ફક્ત તમારું જ રહે છે.",
    householdStartHere: "અહીંથી શરૂ કરો",
    householdStartHereBlurb: "સામેવાળાને ખબર પડવી જોઈએ કે એ કોની સાથે શેર કરે છે.",
    householdYourName: "તમારું નામ",
    householdYourNameHint: "તમે જે શેર કરો એની બાજુમાં દેખાશે, જેથી કોણ કોણ છે એ બધાને ખબર રહે.",
    householdYourNamePlaceholder: "અમન",
    householdCreateTitle: "નવું ઘર બનાવો",
    householdCreateBlurb: "તમને એક કોડ મળશે, એ સામેવાળાને આપી દેજો.",
    householdNameIt: "એને નામ આપો",
    householdNamePlaceholder: "આપણું ઘર",
    householdCreating: "બને છે…",
    householdCreate: "ઘર બનાવો",
    householdJoinTitle: "અથવા કોડ નાખીને જોડાઓ",
    householdJoinBlurb: "એમને ટૂલ્સમાં જઈને કોડ જોવાનું કહો.",
    householdInviteCode: "જોડાવાનો કોડ",
    householdCodePlaceholder: "ABC123",
    householdJoining: "જોડાઈએ છીએ…",
    householdJoin: "ઘરમાં જોડાઓ",
    householdEyebrow: "ઘરના",
    householdJustYou: "હજી ફક્ત તમે જ છો — નીચેનો કોડ આપીને કોઈને ઉમેરો.",
    householdPeopleSharing_one: "{count} જણ શેર કરે છે.",
    householdPeopleSharing_other: "{count} જણ શેર કરે છે.",
    householdInviteCodeBlurb: "એ સાઇન અપ કરે, પછી ટૂલ્સમાં જઈને આ કોડ નાખે.",
    householdWhosIn: "કોણ કોણ છે",
    householdMemberFallback: "સભ્ય {id}",
    householdOwner: "માલિક",
    householdYourNameTitle: "આ ઘરમાં તમારું નામ",
    householdShownNextTo: "તમે જે શેર કરો એની બાજુમાં દેખાશે",
    householdSaveName: "નામ સેવ કરો",
    householdEveryoneShared: "બધાએ શું શું શેર કર્યું",
    householdSharedWithSplit_one: "{count} એન્ટ્રી શેર કરેલી, એમાંથી {split} વહેંચવાની છે.",
    householdSharedWithSplit_other: "{count} એન્ટ્રી શેર કરેલી, એમાંથી {split} વહેંચવાની છે.",
    householdSharedNoSplit_one: "{count} એન્ટ્રી શેર કરેલી, એકેય વહેંચવાની નથી.",
    householdSharedNoSplit_other: "{count} એન્ટ્રી શેર કરેલી, એકેય વહેંચવાની નથી.",
    householdSplittingTitle: "તમે વહેંચો છો એ ખર્ચ",
    householdSplittingBlurb: "ફક્ત વહેંચવાની નિશાની કરેલી એન્ટ્રી.",
    householdEachShare: "દરેકના ભાગે",
    householdTotalToSplit: "વહેંચવાની કુલ રકમ",
    householdPaid: "{amount} ચૂકવ્યા",
    householdOwed: "{amount} લેવાના",
    householdOwes: "{amount} આપવાના",
    householdToSquareUp: "હિસાબ ચૂકતે કરવા",
    householdTransfer: "{from} એ {to} ને {amount} આપવાના",
    householdAllSquare: "બધાનો હિસાબ ચૂકતે — કોઈનું કંઈ બાકી નથી.",
    householdNothingToSettle: "ચૂકતે કરવા જેવું કંઈ નથી",
    householdNothingToSettleBody:
      "કોઈ એન્ટ્રી પર વહેંચવાની નિશાની નથી, એટલે કોઈનું કોઈની પાસે કંઈ બાકી નથી. કોઈ ખર્ચ સરખા ભાગે વહેંચવો હોય તો એન્ટ્રી લખતી વખતે “વહેંચો” પસંદ કરજો.",
    householdNothingShared: "હજી કંઈ શેર કર્યું નથી",
    householdNothingSharedBody:
      "કંઈ લખો ત્યારે “શેર” પસંદ કરો એટલે ઘરના જોઈ શકે, અથવા સરખા ભાગે વહેંચવું હોય તો “વહેંચો” પસંદ કરો.",
    householdLeaveConfirm:
      "આ ઘરમાંથી નીકળી જવું છે? તમે જે શેર કર્યું હતું તે બધું ફરી ફક્ત તમારું જ થઈ જશે.",
    householdLeaving: "નીકળી રહ્યા છીએ…",
    householdLeave: "ઘરમાંથી નીકળી જાઓ",

    marginsTitle: "ખરેખર તમારા હાથમાં શું રહે છે",
    marginsBlurb:
      "કઈ વસ્તુ તમને કેટલામાં પડે છે અને તમે કેટલામાં વેચો છો એ લખો, પછી દરેક વેચાણ પર ખરેખરો નફો કેટલો રહે છે તે જુઓ.",
    marginsYourItems: "તમારી વસ્તુઓ",
    marginsOverhead: "તમારો મહિનાનો સામાન્ય ખર્ચ આશરે {amount} જેટલો છે.",
    marginsNoItems: "હજી કોઈ વસ્તુ નથી — નીચે તમારી પહેલી વસ્તુ ઉમેરો.",
    marginsCostSell: "પડતર {cost} · વેચાણ {price}",
    marginsRemoveItem: "{name} કાઢી નાખો",
    marginsYouKeep: "એક નંગ પર તમને બચે",
    marginsMargin: "માર્જિન",
    marginsPercent: "{percent}%",
    marginsLosing: "આ તમને જેમાં પડે છે એના કરતાં ઓછામાં વેચો છો.",
    marginsUnitsToCover_one:
      "તમારો મહિનાનો {amount} ખર્ચ નીકળે એ માટે મહિને આશરે {count} નંગ વેચવા પડે.",
    marginsUnitsToCover_other:
      "તમારો મહિનાનો {amount} ખર્ચ નીકળે એ માટે મહિને આશરે {count} નંગ વેચવા પડે.",
    marginsAddItem: "વસ્તુ ઉમેરો",
    marginsItem: "વસ્તુ",
    marginsItemPlaceholder: "મીણબત્તી",
    marginsCostsYou: "તમને પડે છે",
    marginsSellFor: "તમે વેચો છો",
    marginsSaveItem: "વસ્તુ સેવ કરો",

    drawerTitle: "ગલ્લાનો મેળ",
    drawerBlurb: "દિવસને અંતે ગલ્લો ગણી લો અને જુઓ કે તમે લખેલા હિસાબ સાથે મેળ બેસે છે કે નહીં.",
    drawerTonightsCount: "આજની ગણતરી",
    drawerDay: "દિવસ",
    drawerStartingFloat: "શરૂઆતની રોકડ",
    drawerCounted: "ગલ્લામાં ગણેલા",
    drawerShouldBe: "ગલ્લામાં હોવા જોઈએ",
    drawerBreakdown: "{float} શરૂઆતની રોકડ + {moneyIn} આવક − {moneyOut} જાવક",
    drawerBalanced: "હિસાબ મળી ગયો — વાહ.",
    drawerBalancedBody: "તમે ગણ્યા એટલા જ પૈસા તમારા હિસાબમાં પણ છે.",
    drawerOver: "હિસાબ કરતાં વધારે",
    drawerOverBody: "તમારી એન્ટ્રી પ્રમાણે જેટલા હોવા જોઈએ એના કરતાં ગલ્લામાં {amount} વધારે છે.",
    drawerShort: "ઘટે છે",
    drawerShortBody: "તમે લખેલા હિસાબ કરતાં ગલ્લામાં {amount} ઓછા છે.",
    drawerSaveCount: "ગણતરી સેવ કરો",
    drawerRecentCounts: "તાજી ગણતરીઓ",
    drawerRecentBlurb: "તમે છેલ્લા સાત દિવસમાં કરેલી ગણતરી.",
    drawerCountedExpected: "{counted} ગણ્યા · {expected} હોવા જોઈએ",
    drawerRemoveCount: "{date} ની ગણતરી કાઢી નાખો",

    settingsTitle: "સેટિંગ",
    settingsBlurb:
      "આવકમાંથી ટૅક્સ માટે કેટલા ટકા બાજુ પર રાખવા, અને દિવસની શરૂઆતમાં ગલ્લામાં સામાન્ય રીતે કેટલી રોકડ હોય છે — એ નક્કી કરો.",
    settingsTaxRate: "ટૅક્સ માટે બાજુ પર (%)",
    settingsUsualFloat: "સામાન્ય શરૂઆતની રોકડ",
    settingsTaxNote:
      "આ ટૅક્સ સલાહ નથી — તમે જે લખો છો એમાંથી થોડો ભાગ બાજુ પર રખાય છે, જેથી ટૅક્સનું બિલ આવે ત્યારે આંચકો ન લાગે. ટકા તમારા હિસાબનીસ પાસે પાકા કરી લેજો.",
    settingsSave: "સેટિંગ સેવ કરો",

    lockTitle: "એપ લોક કરો",
    lockBlurb:
      "તમારો ચોપડો PIN પાછળ સંતાડી દો, જેથી તમારો ખુલ્લો ફોન કોઈના હાથમાં આવે તોય એ વાંચી ન શકે.",
    lockOnMessage: "લોક ચાલુ છે. તમે પાછા આવશો ત્યારે આ PIN પુછાશે.",
    lockOffMessage: "લોક બંધ કરી દીધું.",
    lockOn: "ચાલુ",
    lockOff: "બંધ",
    lockEveryTime: "તમે એપ ખોલો એ દર વખતે PIN પુછાશે.",
    lockAsksAfter_one: "તમે {count} મિનિટ દૂર રહો પછી ફરી પુછાશે.",
    lockAsksAfter_other: "તમે {count} મિનિટ દૂર રહો પછી ફરી પુછાશે.",
    lockTurningOff: "બંધ થાય છે…",
    lockTurnOff: "લોક બંધ કરો",
    lockChoosePin: "એક PIN પસંદ કરો",
    lockChoosePinBlurb: "ચારથી આઠ આંકડા. તમે એપમાં પાછા આવો ત્યારે એ ટાઇપ કરવાનો રહેશે.",
    lockPinMismatch: "બંને PIN સરખા નથી.",
    lockNewPin: "નવો PIN",
    lockPinHint: "4 થી 8 આંકડા.",
    lockConfirmPin: "ફરી ટાઇપ કરો",
    lockAskAgainAfter: "કેટલી વાર પછી ફરી પૂછવું",
    lockTimeoutAlways: "હું ખોલું એ દર વખતે",
    lockTimeoutMinutes_one: "{count} મિનિટ દૂર રહ્યા પછી",
    lockTimeoutMinutes_other: "{count} મિનિટ દૂર રહ્યા પછી",
    lockTimeoutHours_one: "{count} કલાક દૂર રહ્યા પછી",
    lockTimeoutHours_other: "{count} કલાક દૂર રહ્યા પછી",
    lockTurnOn: "લોક ચાલુ કરો",
    lockFootnote:
      "આ ફક્ત તમારા ફોનમાં એપને સંતાડે છે. તમારું ખાતું તો પાસવર્ડથી પહેલેથી સચવાયેલું છે અને તમારો ડેટા તમારા સિવાય કોઈ વાંચી શકતું નથી — PIN એ ઉપરથી મૂકેલું સહેલું તાળું છે, પાસવર્ડની જગ્યાએ નહીં. ભૂલી ગયા? સાઇન આઉટ કરીને ફરી સાઇન ઇન કરો, પછી નવો PIN નક્કી કરો.",
  },

  onboarding: {
    title: "ચાલો, તમારો ચોપડો ગોઠવી દઈએ",
    blurb: "બે નાનાં કામ, અને પછી આખી એપ બરાબર ચાલવા લાગશે.",
    stepsDone_one: "{total} માંથી {count} થઈ ગયું",
    stepsDone_other: "{total} માંથી {count} થઈ ગયાં",
    progressLabel: "ગોઠવણ ક્યાં પહોંચી",
    entryStepTitle: "આજે કેટલી કમાણી થઈ તે લખો",
    entryStepDone: "પહેલી એન્ટ્રી લખાઈ ગઈ",
    entryStepDoneBlurb: "વાહ — હવે તમારા સરવાળા અને આલેખ ચાલુ થઈ ગયા.",
    amountLabel: "આજની કમાણી",
    taxStepTitle: "ટૅક્સ માટે કેટલું બાજુ પર રાખવું તે નક્કી કરો",
    taxStepDone: "ટૅક્સ માટે {rate}% બાજુ પર રખાય છે",
    taxStepDoneBlurb: "{section} માં જઈને આ ગમે ત્યારે બદલી શકો છો.",
    rateLabel: "આવકના ટકા",
    setRate: "નક્કી કરો",
    taxHint:
      "આશરે અંદાજ ચાલશે — મોટા ભાગના લોકો 25% થી શરૂ કરે છે. સાચો આંકડો હિસાબનીસ પાસે પાકો કરી લેજો; આ તો ફક્ત એટલા માટે છે કે ટૅક્સનું બિલ આવે ત્યારે આંચકો ન લાગે.",
    skip: "અત્યારે રહેવા દો",
  },

  empty: {
    logFirstEntry: "તમારી પહેલી એન્ટ્રી લખો",
    samplePreview: "આ કેવું દેખાશે તે જુઓ",
  },

  export: {
    eyebrow: "એક્સપોર્ટ",
    title: "તમારો હિસાબ એક્સપોર્ટ કરો",
    blurb: "તમને જોઈએ એ તારીખો પસંદ કરો, પછી સ્પ્રેડશીટ ઉતારો — કે હિસાબનીસને આપવા માટે સુઘડ PDF.",
    dateRange: "તારીખનો ગાળો",
    dateRangeHint: "બંને ખાલી છોડો તો બધું જ એક્સપોર્ટ થશે.",
    from: "થી",
    to: "સુધી",
    thisMonth: "આ મહિનો",
    lastMonth: "ગયો મહિનો",
    everything: "બધું",
    entryCount_one: "{count} એન્ટ્રી",
    entryCount_other: "{count} એન્ટ્રી",
    labelIn: "આવક",
    labelOut: "જાવક",
    labelNet: "ચોખ્ખું",
    columnDate: "તારીખ",
    columnCategory: "પ્રકાર",
    columnIn: "આવક",
    columnOut: "જાવક",
    totalsRow: "કુલ",
    totalsNet: "({amount} ચોખ્ખું)",
    previewTitle: "ઝલક — તમને આવું મળશે",
    previewNote:
      "નીચેની CSV અને PDF માં આ જ ઊતરે છે — PDF માં ઉપર તમારા ધંધાનું નામ અને તારીખનો ગાળો પણ છપાય છે.",
    sampleBadge: "નમૂનો",
    sampleTitle: "તમારું એક્સપોર્ટ કેવું દેખાશે",
    sampleBlurb:
      "આ તારીખના ગાળામાં તમારી હજી કોઈ એન્ટ્રી નથી, એટલે અહીં બનાવટી આંકડાનો એક નમૂનો મૂક્યો છે — ફક્ત એટલું બતાવવા કે તમે રોજની આવક-જાવક લખવા માંડશો પછી CSV અને PDF એક્સપોર્ટમાં શું શું આવશે.",
    sampleNote:
      "દરેક એન્ટ્રી એક લીટી બને છે — તારીખ, પ્રકાર અને રકમ સાથે — અને છેક નીચે કુલનો સરવાળો. નીચેનાં સાચાં ડાઉનલોડ બટન ત્યારે જ ચાલુ થાય છે જ્યારે આ ગાળામાં ખરેખર એન્ટ્રી હોય.",
    sampleCategorySupplies: "સામાન",
    sampleCategoryRent: "ભાડું",
    nothingToDownload: "આ તારીખો માટે હજી ઉતારવા જેવું કંઈ નથી",
    nothingToDownloadBody: "ઉપરથી થોડો પહોળો ગાળો પસંદ કરો, પછી ફરી પ્રયત્ન કરો.",
    downloadCsv: "CSV ડાઉનલોડ કરો",
    downloadPdf: "PDF ડાઉનલોડ કરો",
  },

  lock: {
    preparing: "તમારો ચોપડો તૈયાર થાય છે…",
    locked: "લોક કરેલું",
    enterPin: "તમારો PIN નાખો",
    blurb: "તમે આ ફોન પર તાળું ખોલો ત્યાં સુધી તમારો ચોપડો સંતાયેલો રહે છે.",
    pinLabel: "PIN",
    pinHint: "4 થી 8 આંકડા.",
    checking: "તપાસીએ છીએ…",
    unlock: "ખોલો",
    pinWrong: "આ PIN બંધબેસતો નથી.",
    checkFailed: "અત્યારે તપાસી શકાયું નહીં. ફરી પ્રયત્ન કરો.",
    tooManyTries: "બહુ વાર પ્રયત્ન થઈ ગયા",
    tooManyTriesBody: "PIN ભૂલી ગયા હો તો સાઇન આઉટ કરીને ફરી સાઇન ઇન કરો.",
    forgotten:
      "ભૂલી ગયા? સાઇન આઉટ કરીને તમારા ઈમેલ અને પાસવર્ડથી ફરી સાઇન ઇન કરો, પછી ટૂલ્સમાં જઈને નવો PIN નક્કી કરો.",
    pinLength: "4 થી 8 આંકડા વાપરો.",
    pinRepetitive: "આ તો કોઈ પણ ધારી લે એવો છે — એકના એક આંકડા ન વાપરો.",
    pinCommon: "આ તો સૌથી વધારે વપરાતા PIN માંનો એક છે — બીજો કોઈ પસંદ કરો.",
  },

  receipt: {
    photoAlt: "રસીદનો ફોટો",
    add: "રસીદનો ફોટો ઉમેરો",
    replace: "રસીદનો ફોટો બદલો",
    remove: "રસીદનો ફોટો કાઢી નાખો",
  },

  errors: {
    notFoundCode: "404",
    notFoundTitle: "આ પાનું મળ્યું નહીં",
    notFoundBody: "તમે જે પાનું શોધો છો તે છે જ નહીં, અથવા ખસેડાઈ ગયું છે.",
    goHome: "હોમ પર જાઓ",
    failedTitle: "આ પાનું ખૂલી શક્યું નહીં",
    failedBody: "અમારી બાજુ કંઈક ગડબડ થઈ. પાનું ફરી લોડ કરી જુઓ, અથવા હોમ પર પાછા જાઓ.",
    tryAgain: "ફરી પ્રયત્ન કરો",
  },
  landing: {
    startFree: "મફતમાં શરૂ કરો",
    signIn: "સાઇન ઇન",
    homeLabel: "SimpleBooks — હોમ",
    navLabel: "સાઇટ",

    heroTitle: "તમારો ધંધો આજે ક્યાં ઊભો છે, એ અત્યારે જ ખબર પડે",
    heroBody:
      "પૈસા આવે ને જાય, તેમ તેમ લખતા જાઓ. સરવાળા SimpleBooks કરી લેશે, એટલે દિવસમાં ગમે તે ઘડીએ તમને ખબર પડે કે આજે નફામાં છો કે નહીં — સ્પ્રેડશીટ વગર, અને નામાની કશી જ સમજણ વગર.",
    heroSeeHowItWorks: "એ કેવી રીતે ચાલે છે તે જુઓ",
    heroReassuranceSpeed: "એક એન્ટ્રી લખતાં દસેક સેકન્ડ",
    heroReassuranceOffline: "સિગ્નલ ન હોય તોય ચાલે",
    heroReassuranceTrial_one: "{count} દિવસ મફત, ગમે ત્યારે રદ કરી શકો",
    heroReassuranceTrial_other: "{count} દિવસ મફત, ગમે ત્યારે રદ કરી શકો",

    previewToday: "આજે",
    previewExampleBadge: "નમૂનાની સ્ક્રીન",
    previewNetLabel: "આજનું ચોખ્ખું",
    previewNetHint: "આજનો દિવસ નફામાં છે.",
    previewMoneyIn: "આવક",
    previewMoneyOut: "જાવક",
    previewAllTime: "શરૂઆતથી અત્યાર સુધી",
    previewAllTimeIn: "{amount} આવક",
    previewAllTimeOut: "{amount} જાવક",
    previewBillsDue_one: "{number} બિલની મુદત નજીક છે",
    previewBillsDue_other: "{number} બિલની મુદત નજીક છે",
    previewBillsHint: "અચાનક માથે આવી પડે એ પહેલાં ભરી દેવા જેવાં.",
    previewBillRent: "જગ્યાનું ભાડું",
    previewBillPhone: "ફોન",
    previewBillDueTomorrow: "કાલે મુદત",
    previewBillDueInDays_one: "{count} દિવસમાં મુદત",
    previewBillDueInDays_other: "{count} દિવસમાં મુદત",
    previewRecentEntries: "તાજી એન્ટ્રી",
    previewDateMonday: "સોમ 4",
    previewDateSunday: "રવિ 3",
    previewEntryTakings: "લારીનો વકરો — સવારનો",
    previewEntryWholesaler: "જથ્થાબંધ વેપારી — શાકભાજી",
    previewEntryInvoicePaid: "ઇન્વોઇસ #{number} ના પૈસા મળ્યા",
    previewEntryDiesel: "ગાડીનું ડીઝલ",
    previewMethodCash: "રોકડ",
    previewMethodCard: "કાર્ડ",
    previewMethodBankTransfer: "બૅન્ક ટ્રાન્સફર",
    previewCaption:
      "રોજની સ્ક્રીનનો એક નમૂનો. ઉપરના બધા આંકડા ફક્ત સમજાવવા માટે બનાવેલા છે — આ કોઈ સાચો ધંધો નથી અને કોઈનો ડેટા પણ નથી.",

    benefitsEyebrow: "એ શું કરે છે",
    benefitsTitle: "એકલા હાથે ધંધો કરનારને જે જોઈએ એ બધું, અને નકામું કંઈ નહીં",
    benefitsDescription:
      "ખાતાવહી નહીં, બેવડું નામું નહીં, ભારેખમ શબ્દો નહીં. ફક્ત તમે રોજેરોજ જે કરો છો એ.",
    benefitLoggingTitle: "લખવામાં સેકન્ડો લાગે",
    benefitLoggingBody:
      "શું આવ્યું કે શું ગયું એ ટાઇપ કરો કે બોલો — બીજો ગ્રાહક આવે એ પહેલાં તો સેવ થઈ ગયું હોય.",
    benefitAskTitle: "તમારા પોતાના આંકડા વિશે પૂછો",
    benefitAskBody: "“ગયું અઠવાડિયું કેવું ગયું?” એવું પૂછો, અને એટલા જ સાદા શબ્દોમાં જવાબ મળે.",
    benefitReceiptTitle: "રસીદનો ફોટો પાડો",
    benefitReceiptBody:
      "ફોટો પાડો એટલે દુકાનનું નામ, તારીખ અને રકમ જાતે ભરાઈ જાય — તમારે ફક્ત નજર ફેરવી લેવાની.",
    benefitInvoiceTitle: "ઇન્વોઇસ મોકલો",
    benefitInvoiceBody:
      "એક મિનિટમાં બનાવો, મોકલો, અને એક નજરે જુઓ કે કયા ઇન્વોઇસના પૈસા હજી બાકી છે.",
    benefitBudgetsTitle: "બજેટ, બિલ અને લક્ષ્ય",
    benefitBudgetsBody:
      "કેટલું વાપરવાનું ધાર્યું છે, બિલ ક્યારે માથે આવે છે, અને શેના માટે પૈસા બાજુ પર મૂકો છો — બધું નક્કી કરો.",
    benefitOfflineTitle: "સિગ્નલ વગર પણ ચાલે",
    benefitOfflineBody:
      "બજારના હૉલમાં હો કે ભોંયરામાં, લખતા રહો; નેટ પાછું આવે એટલે જાતે મેળ પડી જાય.",
    benefitPrivacyTitle: "તમારા આંકડા તમારા જ રહે",
    benefitPrivacyBody:
      "તમારો ચોપડો ફક્ત તમારા ખાતામાં જ રહે છે, અને તમે જેને જાતે બોલાવો એની સાથે જ શેર થાય છે.",

    howItWorksEyebrow: "એ કેવી રીતે ચાલે છે",
    howItWorksTitle: "ત્રણ પગલાં, અને તમારો ચોપડો ચાલુ",
    howItWorksDescription:
      "પહેલું પગલું તો આજે બપોરે જ થઈ જાય — અને ત્યાં જ અટકી જાઓ તોય ચાલે. બાકીનું જ્યારે મન થાય ત્યારે, રાહ જુએ છે.",
    stepNumber: "પગલું {number}:",
    stepLogTitle: "પૈસા લખી લો",
    stepLogBody:
      "ગલ્લામાં પડેલી રોકડ, કાર્ડની એક ચૂકવણી, માલની એક થેલી — જેમ થાય તેમ ઉમેરતા જાઓ. એક લીટી, થોડી સેકન્ડ.",
    stepSeeTitle: "તમે ક્યાં ઊભા છો એ જુઓ",
    stepSeeBody:
      "આજનું, આ અઠવાડિયાનું અને આ મહિનાનું ગણાઈને તૈયાર મળે. કોઈ ફૉર્મ્યુલા નહીં, મહિનો પૂરો થવાની રાહ પણ નહીં.",
    stepAskTitle: "પૂછો, મોકલો અને ગોઠવો",
    stepAskBody:
      "તમારા પોતાના આંકડા વિશે સવાલ પૂછો, ઇન્વોઇસ મોકલો, અને જે બજેટ, બિલ અને બચતના લક્ષ્ય પાળવાં હોય એ નક્કી કરો.",

    languagesEyebrow: "ભાષા",
    languagesTitle: "તમારી પોતાની ભાષામાં — ઉપરથી ચોંટાડેલા ભાષાંતરમાં નહીં",
    languagesDescription:
      "આખી એપ — બટન, મદદ, તારીખ અને રકમ — બધી જ {count} ભાષામાં બોલે છે. ઉપર આપેલા ભાષાના બટનથી ગમે ત્યારે બદલી શકો છો.",
    languagesRtlNote:
      "ઉર્દૂ જમણેથી ડાબે વંચાય છે, અને એની સાથે આખી ગોઠવણ પણ ફરી જાય છે — લખાણને ડાબે-થી-જમણેના ખોખામાં અટવાતું છોડી દેવાતું નથી.",

    testimonialsEyebrow: "ગ્રાહકોના અનુભવ",
    testimonialsTitle: "આ હજી અમારી પાસે એકેય નથી",
    testimonialsDescription:
      "નીચે કોઈ સાચી વ્યક્તિ નથી અને આમાંનું એકેય વાક્ય કોઈએ ખરેખર કહેલું નથી. આ તો ફક્ત જગ્યા રોકી રાખી છે — SimpleBooks ના સાચા વાપરનારા એ વાપરે અને પોતાના નામે છપાવવાની હા પાડે, પછી એમના અનુભવ અહીં આવશે.",
    testimonialExampleBadge: "નમૂનો",
    testimonialNamePending: "નામ પછી ઉમેરાશે",
    testimonialTraderQuote:
      "આ જગ્યા રોકી રાખવા મૂકેલું લખાણ છે. અહીં બજારના કોઈ વેપારીનું, પોતાના રોજના વકરા વિશેનું સાચું વાક્ય આવશે.",
    testimonialTraderTrade: "બજારના વેપારી",
    testimonialCafeQuote:
      "આ જગ્યા રોકી રાખવા મૂકેલું લખાણ છે. અહીં કૅફેના કોઈ માલિકનું, રસીદ અને માલ પૂરો પાડનારા વિશેનું સાચું વાક્ય આવશે.",
    testimonialCafeTrade: "કૅફેના માલિક",
    testimonialCleanerQuote:
      "આ જગ્યા રોકી રાખવા મૂકેલું લખાણ છે. અહીં સફાઈનું કામ કરતા કોઈ સ્વતંત્ર કારીગરનું, ઇન્વોઇસ વિશેનું સાચું વાક્ય આવશે.",
    testimonialCleanerTrade: "સ્વતંત્ર સફાઈકામ કરનાર",

    pricingEyebrow: "ભાવ",
    pricingTitle_one: "{count} દિવસ બધું જ મફત વાપરી જુઓ",
    pricingTitle_other: "{count} દિવસ બધું જ મફત વાપરી જુઓ",
    pricingDescription:
      "કાર્ડ એટલા માટે માગીએ છીએ કે અજમાયશ પૂરી થતાં જ સીધું સબસ્ક્રિપ્શન ચાલુ થઈ જાય. {day}મા દિવસ પહેલાં ગમે ત્યારે રદ કરી દો, તો એક પણ પૈસો કપાશે નહીં.",
    pricingMostPopular: "સૌથી વધુ લેવાય છે",
    pricingNote:
      "બંને બટન પહેલાં સાઇન-અપ પર લઈ જાય છે — બિલ બનાવવા માટે ખાતું હોવું તો પડે જ. ભાવ અમેરિકન ડૉલરમાં છે.",
    priceFree: "Free",

    planFreeName: "Free",
    planFreeCadence: "કાયમ માટે",
    planFreeTagline: "ચોપડો તમારો જ રહે છે, અને રોજેરોજની નોંધ પણ રાખતા રહી શકો છો.",
    planFreeCta: "Free પર જ ચાલુ રાખો",
    planFreeBulletLog: "આવક અને જાવક હાથે લખો",
    planFreeBulletTotals: "આજના સરવાળા, અને આ મહિનાના",
    planFreeBulletExports: "CSV અને PDF એક્સપોર્ટ — હંમેશાં",
    planFreeBulletLanguages: "બધી જ {count} ભાષા",

    planProName: "Pro",
    planProCadence: "મહિને",
    planProTagline_one: "{count} દિવસ મફત. પૂરો થાય એ પહેલાં ગમે ત્યારે રદ કરી શકો.",
    planProTagline_other: "{count} દિવસ મફત. પૂરા થાય એ પહેલાં ગમે ત્યારે રદ કરી શકો.",
    planProCta_one: "મારો {count} મફત દિવસ ચાલુ કરો",
    planProCta_other: "મારા {count} મફત દિવસ ચાલુ કરો",
    planProBulletSearch: "તમે લખેલી દરેક એન્ટ્રી શોધો અને સુધારો",
    planProBulletInsights: "સળંગ દિવસો, તમારું અઠવાડિયું, ધમધમતા દિવસો અને પૈસા ક્યાં ગયા",
    planProBulletCashTools: "એક નંગ પર બચે કેટલું, ગલ્લાનો મેળ અને ટૅક્સ માટે બાજુ પર",
    planProBulletBills: "બિલનું કૅલેન્ડર, અને જાતે પકડી પાડેલાં સબસ્ક્રિપ્શન",
    planProBulletAsk: "તમારા પોતાના આંકડા વિશે સવાલ પૂછો",
    planProBulletReceipts: "રસીદનો ફોટો પાડો, બાકીનું જાતે ભરાઈ જાય",
    planProBulletInvoices: "ગમે તેટલા ઇન્વોઇસ, બજેટ અને બચતના લક્ષ્ય",
    planProBulletReminder: "દિવસનો હિસાબ લખવાની રોજ એક યાદ",
    planProBulletSharing: "જીવનસાથી કે સાથે રહેનાર સાથે શેર કરો",
    planProBulletOffline: "સિગ્નલ વગર પણ ચાલે, પછી જાતે મેળ પડી જાય",
    planProBulletExports: "તમારા હિસાબનીસ માટે CSV અને PDF એક્સપોર્ટ",
    planProBulletLanguages: "બધી જ {count} ભાષા",

    faqEyebrow: "સવાલ",
    faqTitle: "સાઇન અપ કરતાં પહેલાં",
    faqAccountingQuestion: "નામાની કંઈ સમજણ હોવી જરૂરી છે?",
    faqAccountingAnswer:
      "ના. “$40 નાં શાકભાજી વેચ્યાં” એટલું લખી શકતા હો તો SimpleBooks તમને ફાવી જશે. એમાં ક્યાંય ઉધાર-જમા, ખાતાવહી કે બેવડું નામું નથી — તમે ફક્ત આવક અને જાવક લખો છો, સરવાળા એ કરી લે છે. આ તમારા ધંધાની નોંધ છે; ટૅક્સ વખતે હિસાબનીસનું કામ એ કરી આપતું નથી.",
    faqCancelQuestion: "રદ કરી શકાય?",
    faqCancelAnswer:
      "હા, ગમે ત્યારે, બિલિંગના પાના પરથી એક જ ક્લિકમાં — ફોન કરવાનો નહીં, અગાઉથી જાણ કરવાની નહીં, અને કોઈ તમને મનાવવા બેસશે નહીં. મફત અઠવાડિયામાં જ રદ કરી દો તો એક પણ પૈસો કપાતો નથી. પછી રદ કરો તો જે મહિનાના પૈસા ભર્યા છે એ પૂરો થાય ત્યાં સુધી Pro ચાલુ રહે, અને પછી મફત પ્લાન પર આવી જાઓ. તમારી એન્ટ્રી જ્યાં છે ત્યાં જ રહે છે, અને તમે ગમે તે પ્લાન પર હો, એક્સપોર્ટ તો ચાલુ જ રહે છે.",
    faqPrivacyQuestion: "મારા આંકડા કોણ જોઈ શકે?",
    faqPrivacyAnswer:
      "તમે, અને તમે જાતે જેને ચોપડો શેર કરવા બોલાવ્યા હોય એ. તમારી એન્ટ્રી કોઈને વેચાતી નથી, અને SimpleBooks વાપરતા બીજા લોકોને દેખાડાતી પણ નથી. ગમે ત્યારે બધું CSV કે PDF માં ઉતારી શકો છો, અને ખાતું કાઢી નાખો એટલે તમારો ચોપડો પણ ભૂંસાઈ જાય છે.",
    faqLanguagesQuestion: "એ કઈ કઈ ભાષા બોલે છે?",
    faqLanguagesAnswer:
      "{count}, અને એ બધી ફક્ત પહેલા પાના પૂરતી નહીં, આખી એપમાં ચાલે છે: {languages}. ઉપરની પટ્ટીમાં આપેલા ભાષાના બટનથી ગમે ત્યારે બદલી શકો છો.",
    faqBillingQuestion: "પૈસા કેવી રીતે કપાય છે?",
    faqBillingAnswer_one:
      "Pro પહેલો {count} દિવસ મફત છે. શરૂઆતમાં જ કાર્ડ એટલા માટે માગીએ છીએ કે તમારે કંઈ કર્યા વગર અજમાયશ સીધી સબસ્ક્રિપ્શનમાં ફેરવાઈ જાય — અને પહેલી વાર પૈસા ક્યારે કપાશે ને કેટલા કપાશે એ એપમાં તેમજ દરેક પાનાની ઉપર ચાલતી ગણતરીમાં ચોખ્ખું લખેલું હોય છે. એ પહેલાં રદ કરી દો તો એક પણ પૈસો લેવાતો નથી. ચૂકવણી Stripe સંભાળે છે અને કાર્ડની વિગત એની પાસે જ રહે છે; એ કદી SimpleBooks માંથી પસાર થતી નથી.",
    faqBillingAnswer_other:
      "Pro પહેલા {count} દિવસ મફત છે. શરૂઆતમાં જ કાર્ડ એટલા માટે માગીએ છીએ કે તમારે કંઈ કર્યા વગર અજમાયશ સીધી સબસ્ક્રિપ્શનમાં ફેરવાઈ જાય — અને પહેલી વાર પૈસા ક્યારે કપાશે ને કેટલા કપાશે એ એપમાં તેમજ દરેક પાનાની ઉપર ચાલતી ગણતરીમાં ચોખ્ખું લખેલું હોય છે. એ પહેલાં રદ કરી દો તો એક પણ પૈસો લેવાતો નથી. ચૂકવણી Stripe સંભાળે છે અને કાર્ડની વિગત એની પાસે જ રહે છે; એ કદી SimpleBooks માંથી પસાર થતી નથી.",

    closingTitle: "આજના વકરાથી શરૂઆત કરો",
    closingBody_one:
      "શરૂ કરવા માટે એક એન્ટ્રી બસ છે. {count} દિવસ બધું જ મફત — પૂરો થાય એ પહેલાં રદ કરી દો તો એક પણ પૈસો ભરવાનો નહીં.",
    closingBody_other:
      "શરૂ કરવા માટે એક એન્ટ્રી બસ છે. {count} દિવસ બધું જ મફત — અઠવાડિયું પૂરું થાય એ પહેલાં રદ કરી દો તો એક પણ પૈસો ભરવાનો નહીં.",

    footerNavLabel: "નીચેની પટ્ટી",
    footerPrivacy: "ખાનગીપણું",
    footerTerms: "શરતો",
    footerContact: "સંપર્ક",
    footerPricing: "ભાવ",
    footerDisclaimer:
      "SimpleBooks એ હિસાબ રાખવાનું સાધન છે, હિસાબનીસ નહીં. એ તમારું ટૅક્સ રિટર્ન નહીં ભરે, કે તમારે કેટલું ભરવાનું થાય એ પણ નહીં કહે.",
  },
};
