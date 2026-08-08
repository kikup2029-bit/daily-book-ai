import type { PartialDictionary } from "./translate";

/**
 * Hindi translation.
 * NEEDS REVIEW BY A NATIVE SPEAKER before anyone relies on it for financial decisions.
 * Machine-assisted first pass; uncertain terminology: Everyday polite आप register. Loanwords chosen for invoice (इनवॉइस), receipt (रसीद), budget (बजट), cash (कैश), draft (ड्राफ्ट), and entry (एंट्री).
 *
 * Billing terms fixed in this pass (the `billing` section): billing → बिलिंग,
 * plan → प्लान, Pro → प्रो, card → कार्ड, charge (verb) → "पैसे लिए जाएँगे" /
 * "पैसा कटा", free trial → "मुफ़्त ट्रायल", checkout → चेकआउट, receipt → रसीद.
 * Free and Pro stay in English/Latin where they name the product's own tiers.
 *
 * Billing keys a native reviewer should check hardest:
 *  - billing.trialDisclosure_one/_other — legally load-bearing. It must keep
 *    all three facts: the price, the exact date of the first charge, and that
 *    cancelling before then costs nothing. Do not shorten it.
 *  - billing.genericError and billing.cancelledBody both promise no money
 *    moved ("कोई पैसा नहीं कटा", "आपने कुछ भी नहीं दिया"). If either can be
 *    read as "we might have charged you", it is wrong.
 *  - "पैसे लिए जाएँगे" is used for a card being charged, rather than the
 *    banking-form "शुल्क लिया जाएगा". Confirm it sounds plain, not vague.
 *  - billing.renewsLabel "रिन्यू होगा" is a loanword used as a metric label;
 *    "नवीनीकरण" is the formal alternative if the loan reads badly.
 *
 * Terms fixed in the tools / help / landing / export / onboarding / lock pass:
 *   tools            → टूल्स (as nav.tools)     household → परिवार (as nav.household)
 *   your books       → हिसाब                    entry → एंट्री
 *   cash drawer      → कैश ड्रॉअर (as nav.drawer); to balance → "हिसाब बराबर",
 *                      and tools.square is the badge "बराबर" on both the drawer
 *                      count and a household member who owes nothing
 *   starting float   → शुरुआती नकद              item / product → चीज़
 *   money in / out   → "पैसे आए" / "पैसे गए" (as common.moneyIn/moneyOut)
 *   bills            → बिल                      streak → सिलसिला
 *   app lock         → लॉक; PIN stays "PIN" in Latin script throughout
 *   Free / Pro       → left in English, they are the plan's own names
 *
 * English deliberately left in place, and why:
 *   - help.taxNote1 keeps “tax” in Latin script inside the quotes. The category
 *     matcher (insights.ts, TAX_CATEGORY_PATTERN) only recognises the English
 *     word, so translating it would document a category that silently fails.
 *     Same reasoning as the note at the top of zh.ts and ur.ts.
 *   - help.quickAddStep1 / quickAddNote2 / voiceStep2 / voiceNote2 /
 *     paletteStep3 keep their quoted example inputs in English. The quick-add
 *     parser (quick-entry.ts) only understands English direction words, so a
 *     Hindi example would teach syntax the app can't read.
 *   - help.paletteStep2's initials demo IS in Hindi: the palette does a loose
 *     subsequence match on the translated label, and “पकग” genuinely finds
 *     nav.whereMoneyWent “पैसा कहां गया”. Checked against command-palette.tsx.
 *
 * One deliberate inconsistency a reviewer should settle: dashboard.recentEntries
 * is "नूतन एंट्री" from an earlier pass, but landing.previewRecentEntries uses
 * the plainer "हाल की एंट्रीयाँ". "नूतन" reads as "new", not "recent", and is
 * more Sanskritised than the rest of the file. Either both should move to
 * "हाल की एंट्रीयाँ" or the divergence should be closed the other way.
 */
export const hi: PartialDictionary = {
  common: {
    save: "सहेजें",
    saving: "सहेजा जा रहा है...",
    cancel: "रद्द करें",
    delete: "हटाएँ",
    deleting: "हटाया जा रहा है...",
    edit: "बदलें",
    close: "बंद करना",
    back: "वापस",
    add: "जोड़ें",
    today: "आज",
    yesterday: "कल",
    loading: "लोड हो रहा है...",
    search: "खोजना…",
    searchLong: "खोजें या किसी पृष्ठ पर जाएं",
    viewAll: "सभी को देखें",
    showEverything: "सब कुछ दिखाओ",
    noMatch: "उससे कुछ भी मेल नहीं खाता.",
    tryAgain: "पुनः प्रयास करें",
    optional: "वैकल्पिक",
    date: "तारीख",
    amount: "रकम",
    category: "श्रेणी",
    moneyIn: "पैसे आए",
    moneyOut: "पैसे गए",
    net: "शुद्ध रकम",
    profit: "लाभ",
    loss: "नुकसान",
    signOut: "साइन आउट",
    keepIt: "इसे रखें",
    moreActions: "अधिक क्रियाएं",
    send: "भेजें",
    language: "भाषा",
    changeLanguage: "भाषा बदलें",
  },
  nav: {
    today: "आज",
    thisMonth: "इस महीने",
    invoices: "इनवॉइस",
    tools: "टूल्स",
    export: "एक्सपोर्ट",
    help: "मदद",
    overview: "सारांश",
    addEntry: "एंट्री जोड़ें",
    findEntry: "एंट्री खोजें",
    streaks: "आपकी लगातार एंट्री",
    ask: "अपने पैसे के बारे में पूछें",
    whereMoneyWent: "पैसा कहां गया",
    dayByDay: "दिन ब दिन",
    yourWeek: "आपका सप्ताह",
    canYouCover: "क्या आप इसे कवर कर सकते हैं?",
    busyDays: "व्यस्त और शांत दिन",
    budgets: "बजट",
    goals: "बचत लक्ष्य",
    bills: "बिल",
    allInvoices: "सभी इनवॉइस",
    newInvoice: "नया इनवॉइस",
    household: "परिवार",
    margins: "आइटम मार्जिन",
    drawer: "कैश ड्रॉअर",
    tax: "टैक्स के लिए बचत",
    reminder: "दैनिक अनुस्मारक",
    lock: "इस ऐप को लॉक करें",
    billing: "बिलिंग",
    yourPlan: "आपका प्लान",
    pickDates: "तारीखें चुनें",
    downloadCsv: "सीएसवी डाउनलोड करें",
    downloadPdf: "पीडीएफ डाउनलोड करें",
    allTopics: "सभी विषय",
    openMenu: "मेनू खोलें",
    closeMenu: "मेनू बंद करें",
    goTo: "{section} पर जाएँ",
    switchToDark: "अंधेरे पर स्विच करें",
    switchToLight: "प्रकाश पर स्विच करें",
    home: "SimpleBooks होम",
  },
  auth: {
    welcomeBack: "वापसी पर स्वागत है",
    createAccount: "अपना खाता बनाएं",
    signInBlurb: "जहाँ आपने छोड़ा था वहीं से शुरू करने के लिए साइन इन करें।",
    signUpBlurb: "लगभग बीस सेकंड लगते हैं. आपका हिसाब आपके लिए निजी रहती हैं।",
    email: "ईमेल",
    emailPlaceholder: "you@yourbusiness.com",
    password: "पासवर्ड",
    passwordPlaceholderNew: "एक पासवर्ड चुनें",
    passwordPlaceholderExisting: "आपका पासवर्ड",
    passwordHint: "कम से कम 6 वर्ण।",
    showPassword: "पासवर्ड दिखाए",
    hidePassword: "पासवर्ड छिपाएं",
    signIn: "साइन इन करें",
    signingIn: "इन कर रहे हैं…",
    creating: "खाता बनाया जा रहा है...",
    newHere: "SimpleBooks में नये हैं?",
    haveAccount: "क्या आपके पास पहले से एक खाता मौजूद है?",
    createOne: "खाता बनाएं",
    privateNote: "आपकी एंट्रीयाँ आपके खाते में निजी हैं।",
    freeNote: "7 दिन मुफ़्त। शुरू करने के लिए कार्ड चाहिए, उससे पहले कभी भी रद्द करें।",
    heroTitle: "आपकी किताबें, एक ग्राहक को सेवा देने में लगने वाले समय में तैयार हो जाती हैं।",
    sellingFast: "सेकंडों में दर्ज करें",
    sellingFastBody: '"आपूर्ति पर कॉस्टको पर 20 खर्च किए गए" टाइप करें और यह अपने आप भर जाता है।',
    sellingOffline: "बिना सिग्नल के काम करता है",
    sellingOfflineBody:
      "किसी बेसमेंट या बाज़ार में लॉग इन करते रहें। जब आप वापस आते हैं तो यह सिंक हो जाता है।",
    sellingPrivate: "आपके लिए निजी",
    sellingPrivateBody: "एक्सेस डेटाबेस द्वारा लागू किया जाता है, न कि केवल ऐप द्वारा।",
    errEmailMissing: "अपना ईमेल पता दर्ज करें।",
    errEmailInvalid: "वह ईमेल पता जैसा नहीं लगता.",
    errPasswordMissing: "अपना कूटशब्द भरें।",
    errPasswordShort: "कम से कम 6 अक्षरों का प्रयोग करें.",
    errGeneric: "कुछ गलत हो गया। कृपया पुन: प्रयास करें।",
    confirmEmail: "लगभग वहाँ - अपने खाते की पुष्टि करने के लिए अपना ईमेल जांचें, फिर साइन इन करें।",
  },
  dashboard: {
    eyebrow: "आज",
    blurb: "अब तक आपने जो कुछ लिखा है, और जिस पर नज़र डालनी चाहिए।",
    position: "आज आप कहां खड़े हैं",
    todaysNet: "आज की शुद्ध रकम",
    nothingToday: "आज अभी तक कुछ नहीं लिखा।",
    aheadToday: "आज आप फ़ायदे में हैं।",
    behindToday: "आज आप घाटे में हैं।",
    evenToday: "आज अभी तक न फ़ायदा, न नुकसान।",
    allTime: "पूरे समय",
    allTimeIn: "{amount} आए",
    allTimeOut: "{amount} गए",
    allTimeNet: "{amount} शुद्ध",
    safeToSpend: "आज का दिन बिताना सुरक्षित है",
    nothingLeft: "आज के लिए कुछ नहीं बचा",
    quickAdd: "शीघ्र जोड़ें",
    quickAddBlurb: 'बस इसे टाइप करें - "किराने के सामान पर कॉस्टको में 20 खर्च किए" या "300 बनाए"।',
    quickAddVoice: "या माइक टैप करें और कहें।",
    quickAddPlaceholder: "आपूर्ति पर 20 खर्च किये",
    quickAddInputLabel: "शीघ्र एंट्री जोड़ें",
    listening: "सुनना…",
    listeningHint: "सुन रहे हैं — कुछ ऐसा बोलिए जैसे “लंच पर बीस डॉलर खर्च किए”।",
    startListening: "आवाज से जोड़ें",
    stopListening: "सुनना बंद करो",
    readingThatAs: "इसे ऐसे पढ़ा जा रहा है",
    noCategory: "कोई श्रेणी नहीं",
    atMerchant: "{merchant} पर",
    onDate: "{date} को",
    addIt: "जोड़ दें",
    savedOnDevice: "इस डिवाइस पर सहेजा गया - {summary}",
    recentEntries: "नूतन एंट्री",
    recentBlurb: "सबसे पहले नवीनतम. किसी पंक्ति को बदलने या हटाने के लिए उस पर मेनू टैप करें।",
    nothingLogged: "अभी तक कुछ भी लॉग नहीं किया गया",
    nothingLoggedBlurb: "जो आया और जो गया उसे जोड़ें, और यह सीधे यहां दिखाई देता है।",
    logFirst: "अपनी पहली एंट्री लॉग करें",
    loadFailed: "आपकी एंट्रीयाँ लोड नहीं की जा सकीं. {message}",
    moreEntries: "{count} और अधिक - सब कुछ देखें",
    billsDueSoon_one: "एक बिल जल्दी देना है",
    billsDueSoon_other: "{count} बिल जल्दी देने हैं",
    billsDueSoonBlurb: "इसे पहले ही निपटा लें, वरना बाद में भारी पड़ सकता है।",
    streakLogging: "लिखने का सिलसिला",
    streakProfitable: "फ़ायदे का सिलसिला",
    streakNoSpend: "बिना खर्च के दिन",
    streakDays_one: "{count} दिन",
    streakDays_other: "{count} दिन",
    streakBest: "सबसे बढ़िया: {count}",
    streakYourBest: "आपका अब तक का सबसे बढ़िया",
    streakNice_one: "बढ़िया — {count} दिन से आपका हिसाब पूरा है।",
    streakNice_other: "बढ़िया — लगातार {count} दिन से आपका हिसाब पूरा है।",
    streakStart: "हर दिन कुछ न कुछ लिखें और आपका सिलसिला बनने लगेगा।",
    aheadDaysThisMonth:
      "इस महीने आपने जो {active} दिन लिखे, उनमें से {profitable} दिन आप फ़ायदे में रहे।",
    askBlurb: "अपने हिसाब के बारे में आसान भाषा में पूछें — कोई अकाउंटिंग की भाषा नहीं।",
    askPlaceholder: "कोई सवाल पूछें…",
    askThinking: "आपका हिसाब देखा जा रहा है…",
    askFailed: "माफ़ करें, कुछ गड़बड़ हो गई: {message}",
    askFailedUnknown: "माफ़ करें, कुछ गड़बड़ हो गई। फिर से कोशिश करें।",
    askMostSpent: "मैंने सबसे ज़्यादा किस पर खर्च किया?",
    askThisWeek: "इस हफ़्ते मेरा कैसा चल रहा है?",
    askMakingMoney: "क्या मैं कमा रहा हूँ?",
    askCanIAfford: "क्या मैं $200 खर्च कर सकता हूँ?",
    askHowMuchSpent: "मैंने कितना खर्च किया है?",
    uncategorised: "अवर्गीकृत",
    hasReceipt: "रसीद है",
    viewReceipt: "रसीद देखें",
    addReceipt: "एक रसीद जोड़ें",
    shareWithHousehold: "परिवार के साथ साझा करें",
    makePrivate: "फिर से निजी बनाएं",
    splitEvenly: "इसे समान रूप से विभाजित करें",
    deleteEntry: "एंट्री हटाएँ",
    deleteConfirm: "यह एंट्री हटाएं? इसे पूर्ववत नहीं किया जा सकता.",
    actionsFor: "{name} के लिए क्रियाएँ",
    shared: "साझा",
    split: "विभाजित करना",
  },
  entryForm: {
    title: "आज की एंट्री",
    blurb: "क्या आया और क्या गया इसे लिख लें।",
    fullEntry: "पूरी एंट्री",
    fullEntryBlurb: "जब तारीख, रसीद या किसके साथ साझा है — यह सब चाहिए हो।",
    moneyMade: "पैसा कमाया",
    moneySpent: "पैसा खर्च हुआ",
    whatFor: "किसलिए?",
    whatForPlaceholder: "आपूर्ति",
    whatForExamples: "आपूर्ति, किराया, माल…",
    where: "कहाँ",
    wherePlaceholder: "कॉस्टको",
    whereExamples: "कॉस्टको, पेट्रोल पंप, हार्डवेयर की दुकान…",
    paidWith: "के साथ भुगतान किया गया",
    cash: "नकद",
    card: "कार्ड",
    other: "अन्य",
    receiptPhoto: "रसीद फ़ोटो",
    receiptPrivateHint: "वैकल्पिक — इसे सिर्फ़ आप देख सकते हैं।",
    receiptAttaching: "“{name}” जोड़ी जा रही है — इसे सिर्फ़ आप देख सकते हैं।",
    receiptReading: "आपकी रसीद पढ़ी जा रही है…",
    whoCanSee: "इसे कौन देख सकता है",
    justMe: "केवल मैं",
    shareIt: "शेयर करना",
    splitIt: "इसे विभाजित करें",
    shareNoneBlurb: "इसे सिर्फ़ आप देखेंगे।",
    shareVisibleBlurb: "{household} इसे देख सकते हैं, पर किसी पर किसी का कुछ बकाया नहीं होगा।",
    shareSplitBlurb: "{household} इसे देख सकते हैं और यह बराबर बँट जाएगा।",
    staysPrivate: "आपका हिसाब कहीं बाहर नहीं जाता।",
    saveEntry: "एंट्री सहेजें",
    saved: "सहेजा गया.",
    errAmounts: "कृपया वैध मात्राएँ दर्ज करें।",
    errEmpty: "बचत करने से पहले कमाए गए पैसे या खर्च किए गए पैसे जोड़ें।",
    receiptFilled: "आपकी रसीद से भरा गया - कृपया सहेजने से पहले दोबारा जांच लें।",
    receiptUnreadable: "उस रसीद का विवरण नहीं पढ़ सका - कोई चिंता नहीं, बस इसे स्वयं भरें।",
    receiptOffline:
      "इस डिवाइस पर सहेजा गया. बिना कनेक्शन के फोटो संलग्न नहीं किया जा सकता - ऑनलाइन वापस आने पर इसे एंट्री से जोड़ें।",
  },
  entries: {
    eyebrow: "आपकी एंट्रीयाँ",
    title: "एक एंट्री खोजें",
    blurb: "आपने जो कुछ भी लॉग किया है उसे खोजें, फिर उसे ठीक करने के लिए किसी एक पर टैप करें।",
    searchPlaceholder: '"कॉस्टको", "किराया", या 42.50 आज़माएँ',
    searchLabel: "अपनी एंट्रीयाँ खोजें",
    clearSearch: "स्पष्ट खोज",
    everything: "सब कुछ",
    moreFilters: "अधिक फ़िल्टर",
    fewerFilters: "कम फ़िल्टर",
    narrowDown: "इसे संक्षिप्त करें",
    allOptional: "प्रत्येक फ़िल्टर वैकल्पिक है.",
    clearAll: "सभी साफ करें",
    anyCategory: "कोई भी श्रेणी",
    anyWay: "फिर भी",
    fromDate: "की तिथि से",
    toDate: "तारीख तक",
    amountAtLeast: "कम से कम राशि",
    amountAtMost: "अधिकतम राशि",
    any: "कोई",
    order: "आदेश",
    newestFirst: "सबसे पहले नवीनतम",
    oldestFirst: "सबसे पुराना पहले",
    biggestFirst: "सबसे बड़ी रकम पहले",
    smallestFirst: "सबसे पहले सबसे छोटी राशि",
    editing: "इस एंट्री का संपादन",
    saveChanges: "परिवर्तनों को सुरक्षित करें",
    errNeedsAmount:
      "किसी एंट्री के लिए पैसे अंदर या बाहर की आवश्यकता होती है। इसे हटाने के लिए डिलीट का उपयोग करें।",
    count_one: "{count} एंट्री",
    count_other: "{count} एंट्रीयाँ",
    // सब / पैसे आए / पैसे गए वाले बटनों का नाम, स्क्रीन रीडर के लिए।
    directionLabel: "पैसा किस तरफ़ गया",
    nothingLoggedBlurb:
      "जैसे ही आप लिखना शुरू करेंगे, आपकी हर एंट्री यहाँ आ जाएगी — खोजने और ठीक करने के लिए।",
    noMatchHint: "कम शब्द लिखकर देखें, तारीखों का दायरा बढ़ाएँ, या “सब कुछ” से फिर शुरू करें।",
  },
  month: {
    previous: "पिछला महीना",
    next: "अगला महीना",
    profitThisMonth: "इस महीने का लाभ",
    lossThisMonth: "इस महीने का नुकसान",
    breakEvenThisMonth: "इस महीने न लाभ, न नुकसान",
    budgetOver: "{category} बजट से ऊपर चला गया",
    budgetAtPercent: "{category} बजट के {percent}% पर है",
    nothingSpent: "इस महीने अभी तक कोई खर्च नहीं",
    nothingSpentBlurb:
      "जैसे ही आप खर्च लिखेंगे, यहाँ दिखेगा कि आपका पैसा किन श्रेणियों में गया — सबसे बड़ी पहले।",
    whereMoneyWentBlurb: "इस महीने का हर खर्च, सबसे बड़ा पहले।",
    dayByDayBlurb:
      "हर पट्टी उस दिन की शुद्ध रकम है। लकीर के ऊपर की पट्टियाँ वे दिन हैं जब आप फ़ायदे में रहे, नीचे की वे जब नहीं।",
    dayNumber: "दिन {day}",

    weekTitle: "आपका हफ़्ता आसान भाषा में",
    weekRange: "{from} से {to}",
    loadingWeek: "आपका हफ़्ता पढ़ा जा रहा है…",

    outlookTitle: "जो आ रहा है, उसे संभाल पाएँगे?",
    outlookBlurb_one: "अगले {days} दिन — आपके पिछले {count} दिन और आपके तय बिलों के हिसाब से।",
    outlookBlurb_other: "अगले {days} दिन — आपके पिछले {count} दिनों और आपके तय बिलों के हिसाब से।",
    loadingOutlook: "आगे का हिसाब लगाया जा रहा है…",
    whereYouAre: "अभी कहाँ हैं",
    inDays_one: "{count} दिन में",
    inDays_other: "{count} दिनों में",
    shortfallTitle: "ध्यान दें — {date} के आसपास पैसे कम पड़ सकते हैं।",
    staysPositive: "पूरे समय आप फ़ायदे में बने रहते हैं।",
    lowestPoint: "सबसे नीचे का स्तर {date} को {amount} रहेगा।",
    typicalDay: "आम दिन: {moneyIn} आते हैं, {moneyOut} जाते हैं।",
    billsComingUp: "आगे आने वाले बिल",
    roughGuess_one:
      "यह मोटा अंदाज़ा है — आपने अभी सिर्फ़ {count} दिन लिखा है। जैसे-जैसे आप लिखते जाएँगे, यह और सही होता जाएगा।",
    roughGuess_other:
      "यह मोटा अंदाज़ा है — आपने अभी सिर्फ़ {count} दिन लिखे हैं। जैसे-जैसे आप लिखते जाएँगे, यह और सही होता जाएगा।",

    taxNoRateTools:
      "टूल्स टैब में एक प्रतिशत तय कर दें, फिर मैं हिसाब रखूँगा कि टैक्स के लिए कितना अलग रखना है।",
    taxNoRateBelow:
      "नीचे एक प्रतिशत तय कर दें, फिर मैं हिसाब रखूँगा कि टैक्स के लिए कितना अलग रखना है।",
    taxHoldingBack: "{period} में आपने जो {amount} कमाए, उसका {percent}% अलग रखा जा रहा है।",
    shouldSetAside: "इतना अलग रखना चाहिए",
    alreadyPaid: "पहले ही चुकाया",
    stillToSetAside: "अब भी अलग रखना है",
    taxHint:
      "टैक्स के भुगतान श्रेणी में “टैक्स” लिखकर दर्ज करें, वे यहाँ गिने जाएँगे। यह टैक्स सलाह नहीं है — अपनी दर किसी अकाउंटेंट से पक्की कर लें।",
    loadingTax: "टैक्स के लिए अलग रखी रकम जोड़ी जा रही है…",

    busyDaysBlurb: "हफ़्ते के हर दिन औसतन कितना पैसा आया।",
    busyDaysNotEnough:
      "कुछ हफ़्ते और लिखते रहिए, फिर मैं बताऊँगा कि हफ़्ते के कौन से दिन आपके सबसे अच्छे और कौन से सबसे सुस्त हैं।",
    loadingBusyDays: "आपका हफ़्ता देखा जा रहा है…",
    bestAndQuiet: "{best} आपका सबसे अच्छा दिन है, और {worst} सबसे सुस्त।",
    bestAndQuietBoth:
      "{best} आपका सबसे अच्छा दिन है (औसत से {bestPercent}% ऊपर), और {worst} सबसे सुस्त ({worstPercent}% नीचे)।",
    bestAndQuietBestOnly:
      "{best} आपका सबसे अच्छा दिन है (औसत से {bestPercent}% ऊपर), और {worst} सबसे सुस्त।",
    bestAndQuietWorstOnly:
      "{best} आपका सबसे अच्छा दिन है, और {worst} सबसे सुस्त ({worstPercent}% नीचे)।",

    whatsDue: "क्या देना है",
    loadingBills: "आपके बिल लोड हो रहे हैं",
    billsTotal: "अगले 45 दिनों में {amount} के बिल।",
    thisWeek: "इस हफ़्ते",
    nextThreeWeeks: "अगले 3 हफ़्ते",
    later: "उसके बाद",
    dueToday: "आज",
    dueTomorrow: "कल",
    dueInDays_one: "{count} दिन में",
    dueInDays_other: "{count} दिनों में",

    detectedTitle: "यह हर बार आने वाला बिल लगता है",
    detectedBlurb:
      "आपकी एंट्रीयों में ये बार-बार दिखे। इन्हें ट्रैक करें तो ये आगे के हिसाब में और बिल की याद दिलाने में दिखेंगे।",
    maybe: "शायद",
    weekly: "हर हफ़्ते",
    monthly: "हर महीने",
    detectedDetail_one: "{amount} {frequency} · {count} बार दिखा · अगला {date} के आसपास",
    detectedDetail_other: "{amount} {frequency} · {count} बार दिखा · अगला {date} के आसपास",
    dismissDetected: "{name} हटाएँ",
    trackBill: "इस बिल को ट्रैक करें",

    goalsBlurb: "कोई चीज़ जिसके लिए आप पैसे जोड़ रहे हैं — देखिए आप कितने पास हैं।",
    reached: "पूरा",
    goalToGo: "{amount} और चाहिए",
    goalReached: "लक्ष्य पूरा हुआ",
    goalByDate: "{date} तक",
    removeGoal: "{name} लक्ष्य हटाएँ",
    noGoals: "अभी कोई लक्ष्य नहीं।",
    goalNamePlaceholder: "नया चूल्हा",
    goalTarget: "लक्ष्य रकम",
    goalSaved: "अब तक जोड़ा",
    goalTargetDate: "लक्ष्य की तारीख (वैकल्पिक)",
    saveGoal: "लक्ष्य सहेजें",

    budgetsTitle: "बजट की सीमा",
    budgetsBlurb: "हर श्रेणी के लिए महीने की सीमा तय करें और पट्टियों पर नज़र रखें।",
    over: "पार",
    nearLimit: "पास",
    removeBudget: "{name} का बजट हटाएँ",
    noBudgets: "अभी कोई बजट तय नहीं।",
    monthlyLimit: "महीने की सीमा",
    saveBudget: "बजट सहेजें",

    recurringTitle: "हर बार आने वाले खर्च",
    recurringBlurb: "जो बिल हर बार आते हैं, वे अपने आप लिख दिए जाते हैं।",
    cancelled: "बंद",
    recurringDetail: "{amount} · {frequency} · {date} से",
    editRule: "{name} बदलें",
    cancelRule: "{name} बंद करें",
    deleteRule: "{name} हटाएँ",
    noRecurring: "अभी कुछ भी बार-बार आने वाला नहीं।",
    recurringPlaceholder: "किराया",
    howOften: "कितनी बार?",
    everyWeek: "हर हफ़्ते",
    everyMonth: "हर महीने",
    starting: "कब से",
    updateRecurring: "हर बार आने वाला खर्च बदलें",
    addRecurring: "हर बार आने वाला खर्च जोड़ें",
  },
  invoices: {
    eyebrow: "इनवॉइस",
    title: "आपका पैसा बकाया है",
    blurb:
      "किसी ग्राहक को बिल दें, फिर पैसा आने पर उसे भुगतान कर दिया गया चिह्नित करें - तभी वह आपकी हिसाब तक पहुंचेगा।",
    newInvoice: "नया इनवॉइस",
    outstanding: "असाधारण",
    overdue: "अतिदेय",
    paidThisMonth: "इसी महीने भुगतान किया गया",
    awaitingPayment_one: "{count} इनवॉइस भुगतान की प्रतीक्षा में है",
    awaitingPayment_other: "{count} इनवॉइस भुगतान की प्रतीक्षा में हैं",
    pastDue: "{count} नियत तिथि से आगे निकल गया",
    settled: "{count} बसे",
    all: "सभी",
    drafts: "ड्राफ्ट",
    paid: "चुकाया गया",
    searchPlaceholder: "ग्राहक या संख्या",
    searchLabel: "इनवॉइस खोजें",
    invoice: "इनवॉइस",
    customer: "ग्राहक",
    due: "देय",
    status: "स्थिति",
    daysLate_one: "{count} दिन देर से",
    daysLate_other: "{count} दिन देर से",
    pastDueBy_one: "{count} नियत तारीख से एक दिन पहले",
    pastDueBy_other: "नियत तिथि से {count} दिन बीत गए",
    none: "अभी तक कोई इनवॉइस नहीं",
    noneBlurb:
      "ग्राहक के लिए एक बनाएं, इसे भेजें, और पैसा आने पर इसे भुगतान कर दिया गया चिह्नित करें। तभी इसे आय के रूप में गिना जाता है।",
    createFirst: "अपना पहला इनवॉइस बनाएं",
    notAvailable: "इनवॉइस अभी उपलब्ध नहीं हैं",
    statusDraft: "मसौदा",
    statusSent: "भुगतान की प्रतीक्षा",
    statusOverdue: "अतिदेय",
    statusPaid: "चुकाया गया",
    statusVoid: "रद्द कर दिया गया",
    markSent: "भेजे गए के रूप में चिह्नित करें",
    markPaid: "भुगतान के रूप में चिह्नित करें",
    markUnpaid: "अवैतनिक के रूप में चिह्नित करें",
    recordPayment: "भुगतान रिकॉर्ड करें",
    moneyArrivedOn: "पैसा आने की तारीख",
    cancelInvoice: "इनवॉइस रद्द करें",
    deleteDraft: "ड्राफ्ट हटाएं",
    printOrPdf: "पीडीएफ के रूप में प्रिंट करें या सेव करें",
    paidOn: "{date} का भुगतान किया गया",
    willRecord:
      "इस भुगतान को चिह्नित करने से आपके द्वारा चुनी गई तारीख पर आपकी हिसाब में आय के रूप में {amount} जुड़ जाता है। तब तक यह आपके कुल योग से बाहर रहता है।",
    confirmUnpaid:
      "इसे अवैतनिक चिह्नित करें? इसके द्वारा बनाई गई आय एंट्री आपकी हिसाब से हटा दी जाएगी।",
    confirmVoid:
      "यह इनवॉइस रद्द करें? यह रिकॉर्ड पर रहता है लेकिन शून्य के रूप में चिह्नित किया जाता है।",
    confirmDeleteDraft: "यह ड्राफ़्ट हटाएं? इसे पूर्ववत नहीं किया जा सकता.",
    notFound: "वह इनवॉइस यहां नहीं है",
    notFoundBlurb: "हो सकता है कि इसे हटा दिया गया हो.",
    backToInvoices: "इनवॉइस पर वापस जाएँ",
    allInvoices: "सभी इनवॉइस",
    createTitle: "एक इनवॉइस बनाएं",
    editTitle: "इस इनवॉइस को संपादित करें",
    createBlurb:
      "यह एक मसौदे के रूप में शुरू होता है, इसलिए जब तक आप इसे नहीं भेजते तब तक कुछ भी अंतिम नहीं होता।",
    editBlurb:
      "परिवर्तन केवल इनवॉइस में सहेजे जाते हैं। आपकी हिसाब तक कोई भी चीज़ तब तक नहीं पहुंचती जब तक उस पर भुगतान अंकित न हो जाए।",
    whoFor: "यह किसके लिए है",
    customerName: "ग्राहक का नाम",
    customerNamePlaceholder: "एक्मे कैफे",
    customerEmail: "ईमेल",
    customerEmailHint: "वैकल्पिक - आपके अपने रिकॉर्ड के लिए।",
    customerEmailPlaceholder: "billing@acme.com",
    issueDate: "जारी करने की तारीख",
    dueDate: "नियत तारीख",
    dueDateHint: "दो सप्ताह एक सामान्य डिफ़ॉल्ट है.",
    whatCharging: "आप किसके लिए शुल्क ले रहे हैं",
    whatChargingBlurb: "प्रति आइटम एक पंक्ति. कुल मिलाकर काम अपने आप हो जाता है।",
    description: "विवरण",
    descriptionPlaceholder: "छह घंटे का डिज़ाइन कार्य",
    quantity: "मात्रा",
    priceEach: "प्रत्येक की कीमत",
    lineTotal: "लाइन कुल {amount}",
    addLine: "एक और पंक्ति जोड़ें",
    removeLine: "लाइन {number} हटाएं",
    total: "कुल",
    notes: "टिप्पणियाँ",
    notesBlurb: "इनवॉइस पर दिखाया गया. भुगतान शर्तें, धन्यवाद.",
    notesPlaceholder: "14 दिनों के भीतर बैंक हस्तांतरण द्वारा भुगतान। धन्यवाद!",
    createButton: "इनवॉइस बनाएं",
    billedTo: "को बिल दिया गया",
    dates: "खजूर",
    issued: "{date} जारी किया गया",
    dueOn: "देय {date}",
    amountDue: "देय राशि",
    errCustomer: "यह इनवॉइस किसके लिए है?",
    errNameLong: "वह नाम बहुत लंबा है.",
    errEmail: "वह ईमेल पता जैसा नहीं लगता.",
    errDate: "एक तारीख चुनें.",
    errDueBeforeIssue: "नियत तारीख जारी करने की तारीख से पहले नहीं हो सकती.",
    errNoLines: "कम से कम एक आइटम जोड़ें.",
    errLineDescription: "वर्णन करें कि यह किस लिए है।",
    errLineQuantity: "मात्रा शून्य से अधिक होनी चाहिए.",
    errLinePrice: "कीमत नकारात्मक नहीं हो सकती.",
  },
  billing: {
    eyebrow: "बिलिंग",
    title: "आपका प्लान",
    blurb: "आप किस चीज़ के पैसे दे रहे हैं, और उसमें आप क्या-क्या बदल सकते हैं।",
    loadingPlan: "आपका प्लान लोड हो रहा है।",
    loadFailed: "आपका प्लान लोड नहीं हो सका",
    portalFailed: "बिलिंग नहीं खुल सकी",
    checkoutFailed: "चेकआउट शुरू नहीं हो सका",
    genericError: "हमारी तरफ़ से कुछ गड़बड़ हो गई। कोई पैसा नहीं कटा।",
    paymentFailed: "एक भुगतान नहीं हो पाया",
    paymentFailedBody:
      "आपका पिछला भुगतान अस्वीकार हो गया। कुछ भी बंद नहीं किया गया है — Stripe कुछ दिन तक कोशिश करता रहेगा, और तब तक वह सब चलता रहेगा जिसके आप पैसे देते हैं।",
    paymentFailedFix:
      "कार्ड बदल देने से आम तौर पर बात बन जाती है, और अगली कोशिश में पैसा कट जाता है।",
    updateCard: "अपना कार्ड बदलें",
    statusActive: "चालू",
    statusTrialing: "ट्रायल",
    statusPastDue: "भुगतान बाकी",
    statusCanceled: "रद्द",
    statusIncomplete: "अधूरा",
    statusExpired: "समाप्त",
    statusUnpaid: "बिना भुगतान",
    statusPaused: "रोका हुआ",
    proPanelTitle: "SimpleBooks प्रो",
    proUnlocked: "इस खाते पर ऐप की हर चीज़ खुली हुई है।",
    planLabel: "आपका प्लान",
    pricePerMonth: "{price} हर महीने",
    renewsLabel: "रिन्यू होगा",
    proEndsLabel: "प्रो खत्म होगा",
    chargedAgainHint: "इसी तारीख को आपसे फिर पैसे लिए जाएँगे।",
    lastPaidDayHint: "जिस महीने के आपने पैसे दिए हैं उसका आखिरी दिन।",
    noRenewalDate: "Stripe से अभी तक कोई तारीख नहीं आई है।",
    manageBilling: "बिलिंग संभालें",
    manageBillingHint: "कार्ड बदलें, रसीदें देखें, या रद्द करें।",
    proEndingTitle: "प्रो खत्म होने वाला है",
    proEndsOn:
      "प्रो {date} तक चालू रहेगा। उसके बाद यह खाता फ्री प्लान पर लौट जाएगा और आपसे फिर पैसे नहीं लिए जाएँगे। आपका लिखा हुआ कुछ भी नहीं मिटता।",
    proEndsAfterPaidMonth:
      "जिस महीने के आपने पैसे दिए हैं, प्रो उसके आखिर तक चालू रहेगा। उसके बाद यह खाता फ्री प्लान पर लौट जाएगा और आपसे फिर पैसे नहीं लिए जाएँगे। आपका लिखा हुआ कुछ भी नहीं मिटता।",
    changedYourMind: "मन बदल गया? बिलिंग संभालें में जाकर इसे फिर से चालू कर सकते हैं।",
    comparePlans: "प्लान की तुलना करें",
    currentPlanBadge: "आपका प्लान",
    everything: "सब कुछ",
    openingStripe: "Stripe खुल रहा है…",
    onThisPlan: "आज आप इसी पर हैं।",
    stripeNote:
      "भुगतान Stripe अपने पेज पर संभालता है — कार्ड की जानकारी SimpleBooks तक कभी नहीं पहुँचती। आप यहीं से कभी भी रद्द कर सकते हैं, और जिस महीने के पैसे दे चुके हैं वह खत्म होने तक प्रो चलता रहेगा।",
    successTitle: "आप प्रो पर हैं",
    successBody:
      "भुगतान हो गया और इस खाते पर सब कुछ खुल गया है। Stripe की तरफ से रसीद आपके ईमेल पर आ रही है।",
    goToBooks: "अपने हिसाब पर जाएँ",
    seeYourPlan: "अपना प्लान देखें",
    confirming: "पुष्टि हो रही है",
    confirmingTitle: "आपके भुगतान की पुष्टि हो रही है",
    confirmingBody:
      "आप Stripe से लौट आए हैं। इस पेज पर वापस आ जाने को ही सबूत मानने के बजाय, खाते को प्रो करने से पहले हम Stripe से ही भुगतान की पुष्टि का इंतज़ार करते हैं — इसमें आम तौर पर कुछ सेकंड लगते हैं।",
    canLeavePage: "आप यह पेज बंद कर सकते हैं। इसके खुले रहने पर कुछ भी निर्भर नहीं है।",
    notConfirmedTitle: "इसकी पुष्टि अभी बाकी है",
    notConfirmedBody:
      "हो सकता है आपका भुगतान अभी चल रहा हो। पुष्टि में आम तौर पर कुछ सेकंड लगते हैं, पर कभी-कभी एक-दो मिनट भी लग सकते हैं, और यह पेज खुला हो या न हो, काम पूरा हो जाएगा।",
    notConfirmedReassure:
      "दोनों ही हाल में कुछ नहीं जाता: अगर भुगतान हो गया होगा तो प्रो अपने आप चालू हो जाएगा। असल में क्या स्थिति है, यह आपका बिलिंग पेज हमेशा दिखाता है।",
    checkFailed: "पिछली जाँच का कोई जवाब नहीं मिला",
    checkAgain: "फिर से जाँचें",
    goToBilling: "बिलिंग पर जाएँ",
    contactSupport:
      "अगर कुछ मिनट बाद भी प्रो न दिखे, तो सपोर्ट से संपर्क करें और नीचे दिया रेफरेंस बताएँ।",
    reference: "रेफरेंस: {reference}",
    cancelledTitle: "चेकआउट बंद हो गया",
    cancelledBody:
      "आपने कुछ भी नहीं दिया और कुछ भी नहीं बदला। आपका हिसाब जहाँ था वहीं है, और फ्री प्लान पहले की तरह चलता रहेगा।",
    cancelledReassure: "प्रो जब चाहें तब ले सकते हैं — न कोई जल्दी है, न पेज बंद करने की कोई सज़ा।",
    seePlansAgain: "प्लान फिर से देखें",
    backToBooks: "अपने हिसाब पर वापस",
    checkingPlan: "आपका प्लान जाँचा जा रहा है।",
    featureIsPro: "{feature} प्रो का हिस्सा है",
    trialUsed:
      "आपके मुफ़्त दिन खत्म हो चुके हैं। प्रो {price} हर महीने का है और आप जब चाहें रद्द कर सकते हैं।",
    tryFree_one: "प्रो की बाकी हर चीज़ के साथ इसे {count} दिन मुफ़्त आज़माएँ।",
    tryFree_other: "प्रो की बाकी हर चीज़ के साथ इसे {count} दिन मुफ़्त आज़माएँ।",
    startTrial_one: "मेरा {count} मुफ़्त दिन शुरू करें",
    startTrial_other: "मेरे {count} मुफ़्त दिन शुरू करें",
    getPro: "प्रो लें — {price} हर महीने",
    trialDisclosure_one:
      "{count} दिन मुफ़्त। {date} को आपके कार्ड से {price} लिए जाएँगे, उसके बाद हर महीने {price}। उससे पहले कभी भी रद्द कर दें तो आपको कुछ भी नहीं देना पड़ेगा।",
    trialDisclosure_other:
      "{count} दिन मुफ़्त। {date} को आपके कार्ड से {price} लिए जाएँगे, उसके बाद हर महीने {price}। उससे पहले कभी भी रद्द कर दें तो आपको कुछ भी नहीं देना पड़ेगा।",
    recordsStay: "आपका पहले का लिखा हुआ जहाँ है वहीं रहेगा, चाहे कोई भी प्लान हो।",
    exportsAlwaysWork: "एक्सपोर्ट हमेशा चलते हैं।",
    trialEndsToday: "आपका मुफ़्त ट्रायल आज खत्म हो रहा है",
    trialLastDay: "आपके मुफ़्त ट्रायल का आखिरी दिन",
    trialDaysLeft_one: "आपके मुफ़्त ट्रायल का {count} दिन बाकी",
    trialDaysLeft_other: "आपके मुफ़्त ट्रायल के {count} दिन बाकी",
    cardChargedOn: "{date} को आपके कार्ड से {price} लिए जाएँगे।",
    thenPricePerMonth: "उसके बाद {price} हर महीने।",
    manageOrCancel: "संभालें या रद्द करें",
    hideUntilTomorrow: "कल तक छुपाएँ",
    welcomeTitle: "सब कुछ आज़माकर देखना है?",
    welcomeBody_one:
      "SimpleBooks प्रो {count} दिन मुफ़्त आज़माएँ। इसमें AI से अपने आंकड़ों के जवाब, रसीद स्कैन, बिना किसी हद के इनवॉइस, बजट, एक्सपोर्ट, बिना नेट के सिंक और सारी भाषाएँ मिलती हैं।",
    welcomeBody_other:
      "SimpleBooks प्रो {count} दिन मुफ़्त आज़माएँ। इसमें AI से अपने आंकड़ों के जवाब, रसीद स्कैन, बिना किसी हद के इनवॉइस, बजट, एक्सपोर्ट, बिना नेट के सिंक और सारी भाषाएँ मिलती हैं।",
    welcomeFinePrint_one: "{count} दिन मुफ़्त, उसके बाद {price} हर महीने। जब चाहें रद्द कर दें।",
    welcomeFinePrint_other: "{count} दिन मुफ़्त, उसके बाद {price} हर महीने। जब चाहें रद्द कर दें।",
    welcomeStartTrial: "मेरा {count} दिन का प्रो ट्रायल शुरू करें",
    welcomeContinueFree: "नहीं, फ्री प्लान पर ही चलते हैं",
  },
  reminder: {
    eyebrow: "औजार",
    title: "दैनिक अनुस्मारक",
    pageBlurb:
      "इस ऐप में प्रत्येक नंबर आपके द्वारा लॉग की गई एंट्रीयों से आता है। सही समय पर एक छोटा सा इशारा आदत और अच्छे इरादे के बीच का अंतर है।",
    cardBlurb: "दिन भर लॉग इन करने के लिए उकसाना, ताकि आदत बनी रहे।",
    onAt: "{time} पर",
    off: "बंद",
    howItWorks:
      "एक बार आपके द्वारा चुने जाने का समय बीत जाने के बाद, ऐप अगली बार खुलने या पृष्ठभूमि में चलने पर एक अधिसूचना दिखाता है। यह उस फ़ोन पर सक्रिय नहीं होगा जिसने पूरे दिन ऐप नहीं खोला है - इन्हें भेजने वाला कोई सर्वर नहीं है, यही कारण है कि इनकी कोई लागत नहीं है और कोई भी आपका डेटा नहीं देखता है।",
    remindMeAt: "मुझे यहां याद दिलाएं",
    turnOn: "अनुस्मारक चालू करें",
    turnOff: "बंद करें",
    saveTime: "समय की बचत",
    sendTest: "अभी एक परीक्षण अधिसूचना भेजें",
    installFirst: "इसे पहले अपनी होम स्क्रीन पर जोड़ें",
    installFirstBody:
      "iPhone केवल होम स्क्रीन पर जोड़े गए ऐप्स के लिए सूचनाओं की अनुमति देता है। शेयर पर टैप करें, फिर होम स्क्रीन पर जोड़ें, इसे नए आइकन से खोलें और यहां वापस आएं।",
    blocked: "सूचनाएं अवरुद्ध हैं",
    blockedBody:
      "आपका ब्राउज़र इस साइट के लिए सूचनाओं को अवरुद्ध कर रहा है. इससे पहले कि यह काम कर सके, आपको अपनी ब्राउज़र सेटिंग्स में उन्हें अनुमति देनी होगी।",
    unsupported: "यह ब्राउज़र सूचनाएं नहीं दिखा सकता",
    unsupportedBody: "बाकी सब कुछ अभी भी काम करता है - आपको यहां कोई संकेत नहीं मिलेगा।",
    errPickTime: "पहले एक समय चुनें.",
    errDenied:
      "आपका ब्राउज़र इस साइट के लिए सूचनाओं को अवरुद्ध कर रहा है. उन्हें अपनी ब्राउज़र सेटिंग में अनुमति दें, फिर पुनः प्रयास करें।",
    errNotAllowed: "सूचनाओं की अनुमति नहीं थी, इसलिए अनुस्मारक नहीं दिखाया जा सकता.",
    notificationTitle: "आज की कार्यवाही",
    notificationBody: "अब एक मिनट बाद की एक शाम बचाता है। लॉग इन करें कि क्या आया और क्या गया।",
  },
  offline: {
    noConnection: "कोई कनेक्शन नहीं",
    keepLogging: "आप लॉगिंग जारी रख सकते हैं - एंट्रीयाँ इस डिवाइस पर सहेजी जाती हैं।",
    sending: "{count} भेजा जा रहा है",
    waitingToSend: "{count} भेजने की प्रतीक्षा की जा रही है",
    waiting_one: "{count} प्रवेश प्रतीक्षारत है",
    waiting_other: "{count} एंट्रीयाँ प्रतीक्षारत हैं",
    wouldntSave_one: "{count} एंट्री सहेजी नहीं जाएगी",
    wouldntSave_other: "{count} एंट्रीयाँ सहेजी नहीं जाएंगी",
    showThem: "उन्हें दिखाओ",
    hideThem: "उन्हें छिपाओ",
    sendNow: "अब भेजें",
    tryTheseAgain: "इन्हें दोबारा आज़माएं",
    discardEntry: "इस एंट्री को त्यागें",
    refusedTimes:
      "इन्हें {count} बार अस्वीकार कर दिया गया। आमतौर पर इसका मतलब है कि ऐप अपडेट हो गया था या आप साइन आउट हो गए थे - पुनः प्रयास करें, और केवल एक को हटा दें यदि आपने इसे पहले से ही किसी अन्य तरीके से दर्ज किया है।",
    installTitle: "SimpleBooks को अपनी होम स्क्रीन पर रखें",
    installBody:
      "अपने स्वयं के आइकन के साथ पूर्ण स्क्रीन खोलता है, और जब आपको कोई सिग्नल नहीं मिलता है तो काम करता रहता है।",
    installIos: "सफ़ारी में शेयर बटन पर टैप करें, फिर होम स्क्रीन पर जोड़ें।",
    install: "स्थापित करना",
    dismiss: "नकार देना",
    signOutPending:
      "{count} एंट्रीयाँ अभी तक नहीं भेजी गई हैं। वे इस डिवाइस पर बने रहेंगे और अगली बार जब आप इस पर साइन इन करेंगे तो वे वहां पहुंच जाएंगे। फिर भी साइन आउट करें?",
  },
  palette: {
    placeholder: 'कहीं भी जाएं, या "आपूर्ति पर 20 खर्च किए" जैसी एंट्री टाइप करें',
    inputLabel: "कोई एंट्री खोजें या लॉग करें",
    logThis: "इस एंट्री को लॉग करें",
    logging: "लॉगिंग...",
    logged: "लॉग किया गया: {summary}",
    queued: "इस डिवाइस पर सहेजा गया, बाद में भेजा जाएगा: {summary}",
    moveHint: "↑↓ स्थानांतरित करना",
    pickHint: "↵ चुनना",
    typeHint: "इसे तुरंत लॉग करने के लिए एक राशि टाइप करें",
    close: "कमांड पैलेट बंद करें",
    dialogLabel: "कमांड पैलेट",
    pageExportRecords: "हिसाब एक्सपोर्ट करें",
    pageHelp: "मदद — सब कुछ कैसे चलता है",
    pageHelpLogging: "मदद: पैसा लिखना",
    pageHelpMonth: "मदद: इस महीने",
    pageHelpTools: "मदद: टूल्स",
    pageHelpExport: "मदद: एक्सपोर्ट",
  },
  tools: {
    // --- टूल्स के सभी पेजों पर साझा
    eyebrow: "टूल्स",
    didntWork: "यह नहीं हो पाया",
    copy: "कॉपी करें",
    copied: "कॉपी हो गया",
    square: "बराबर",
    // पूरा वाक्य: रकम और वह किस तरफ़ गई, दोनों को कंपोनेंट में जोड़ा नहीं जा सकता।
    amountIn: "{amount} आए",
    amountOut: "{amount} गए",

    // --- परिवार के साथ साझा करना: जुड़ने से पहले
    householdTitle: "किसी के साथ साझा करें",
    householdBlurb:
      "जो एंट्रीयाँ आप चुनें, वे अपने साथी या साथ रहने वाले के साथ साझा करें और खर्च बराबर बाँटें। जो आप साझा नहीं करेंगे वह सिर्फ़ आपका रहेगा।",
    householdStartHere: "यहाँ से शुरू करें",
    householdStartHereBlurb: "सामने वाले को पता चले कि वह किसके साथ साझा कर रहा है।",
    householdYourName: "आपका नाम",
    householdYourNameHint:
      "आप जो कुछ साझा करेंगे उसके साथ यही नाम दिखेगा, ताकि सबको पता रहे कौन कौन है।",
    householdYourNamePlaceholder: "अमन",
    householdCreateTitle: "नया शुरू करें",
    householdCreateBlurb: "आपको एक कोड मिलेगा, वही आगे दे दीजिए।",
    householdNameIt: "इसे नाम दें",
    householdNamePlaceholder: "हमारा घर",
    householdCreating: "बनाया जा रहा है…",
    householdCreate: "परिवार बनाएँ",
    householdJoinTitle: "या कोड डालकर जुड़ें",
    householdJoinBlurb: "उनसे वह कोड माँग लें जो उन्हें टूल्स में दिखता है।",
    householdInviteCode: "जुड़ने का कोड",
    householdCodePlaceholder: "ABC123",
    householdJoining: "जुड़ा जा रहा है…",
    householdJoin: "परिवार में जुड़ें",

    // --- परिवार के साथ साझा करना: जुड़ने के बाद
    householdEyebrow: "परिवार",
    householdJustYou: "अभी तक सिर्फ़ आप हैं — किसी को जोड़ने के लिए नीचे वाला कोड भेज दें।",
    householdPeopleSharing_one: "{count} व्यक्ति साझा कर रहा है।",
    householdPeopleSharing_other: "{count} लोग साझा कर रहे हैं।",
    householdInviteCodeBlurb: "वे साइन अप करें, फिर टूल्स में जाकर यह कोड डालें।",
    householdWhosIn: "कौन-कौन है",
    householdMemberFallback: "सदस्य {id}",
    householdOwner: "मुखिया",
    householdYourNameTitle: "इस परिवार में आपका नाम",
    householdShownNextTo: "आप जो साझा करेंगे उसके साथ दिखेगा",
    householdSaveName: "नाम सहेजें",

    householdEveryoneShared: "सबने क्या-क्या साझा किया",
    // एक ही वाक्य में दो गिनतियाँ। बहुवचन साझा एंट्रीयों की गिनती से चलता है;
    // “कुछ नहीं” वाली बात अलग वाक्य है, बीच में डाला गया टुकड़ा नहीं।
    householdSharedWithSplit_one: "{count} साझा एंट्री, {split} बाँटने के लिए चुनी गई।",
    householdSharedWithSplit_other: "{count} साझा एंट्रीयाँ, {split} बाँटने के लिए चुनी गईं।",
    householdSharedNoSplit_one: "{count} साझा एंट्री, बाँटने के लिए कोई नहीं चुनी गई।",
    householdSharedNoSplit_other: "{count} साझा एंट्रीयाँ, बाँटने के लिए कोई नहीं चुनी गई।",

    householdSplittingTitle: "जो खर्च आप बाँट रहे हैं",
    householdSplittingBlurb: "सिर्फ़ वही एंट्रीयाँ जो बाँटने के लिए चुनी गई हैं।",
    householdEachShare: "हर एक का हिस्सा",
    householdTotalToSplit: "बाँटने के लिए कुल",
    householdPaid: "{amount} दिए",
    householdOwed: "{amount} मिलने हैं",
    householdOwes: "{amount} देने हैं",
    householdToSquareUp: "हिसाब बराबर करने के लिए",
    householdTransfer: "{from} {to} को {amount} दे",
    householdAllSquare: "सबका हिसाब बराबर है — किसी पर कुछ बाकी नहीं।",
    householdNothingToSettle: "हिसाब करने को कुछ नहीं",
    householdNothingToSettleBody:
      "बाँटने के लिए कुछ चुना ही नहीं गया, इसलिए किसी पर किसी का कुछ बाकी नहीं। कोई खर्च बराबर बाँटना हो तो लिखते समय “इसे विभाजित करें” चुन लें।",
    householdNothingShared: "अभी कुछ भी साझा नहीं",
    householdNothingSharedBody:
      "कुछ लिखते समय “शेयर करना” चुनें ताकि परिवार उसे देख सके, या “इसे विभाजित करें” चुनें ताकि वह बराबर बँट जाए।",
    householdLeaveConfirm:
      "यह परिवार छोड़ दें? आपने जो कुछ साझा किया था वह फिर से सिर्फ़ आपका हो जाएगा।",
    householdLeaving: "छोड़ा जा रहा है…",
    householdLeave: "परिवार छोड़ें",

    // --- असल में आपके पास क्या बचता है (आइटम मार्जिन)
    marginsTitle: "असल में आपके पास क्या बचता है",
    marginsBlurb:
      "कोई चीज़ आपको कितने की पड़ती है और आप उसे कितने में बेचते हैं, यह डालिए — फिर हर बिक्री पर असली मुनाफ़ा देखिए।",
    marginsYourItems: "आपकी चीज़ें",
    marginsOverhead: "आपका हर महीने का आम खर्च करीब {amount} रहता है।",
    marginsNoItems: "अभी कोई चीज़ नहीं — नीचे पहली जोड़ लीजिए।",
    marginsCostSell: "लागत {cost} · बिकती है {price} में",
    marginsRemoveItem: "{name} हटाएँ",
    marginsYouKeep: "हर एक पर आपको बचता है",
    marginsMargin: "मार्जिन",
    marginsPercent: "{percent}%",
    marginsLosing: "आप इसे लागत से भी कम कीमत पर बेच रहे हैं।",
    marginsUnitsToCover_one:
      "अपने आम {amount} के खर्च निकालने के लिए महीने में करीब {count} बेचिए।",
    marginsUnitsToCover_other:
      "अपने आम {amount} के खर्च निकालने के लिए महीने में करीब {count} बेचिए।",
    marginsAddItem: "कोई चीज़ जोड़ें",
    marginsItem: "चीज़",
    marginsItemPlaceholder: "मोमबत्ती",
    marginsCostsYou: "आपको पड़ती है",
    marginsSellFor: "आप इसे बेचते हैं",
    marginsSaveItem: "चीज़ सहेजें",

    // --- कैश ड्रॉअर की जाँच
    drawerTitle: "कैश ड्रॉअर की जाँच",
    drawerBlurb:
      "दिन के आखिर में गल्ला गिन लीजिए और देखिए कि वह आपके लिखे हिसाब से मिलता है या नहीं।",
    drawerTonightsCount: "आज रात की गिनती",
    drawerDay: "दिन",
    drawerStartingFloat: "शुरुआती नकद",
    drawerCounted: "ड्रॉअर में गिना हुआ",
    drawerShouldBe: "ड्रॉअर में होना चाहिए",
    // यह एक ही जोड़ है, इसलिए एक ही स्ट्रिंग रहती है — तीनों रकमों और उनके
    // आसपास के शब्दों का क्रम बदलने के लिए खुला रहना चाहिए।
    drawerBreakdown: "{float} शुरुआती + {moneyIn} आए − {moneyOut} गए",
    drawerBalanced: "हिसाब बराबर — बढ़िया।",
    drawerBalancedBody: "आपने जो गिना, वह आपके लिखे हिसाब से मिल रहा है।",
    drawerOver: "जितना होना चाहिए, उससे ज़्यादा",
    drawerOverBody: "आपकी एंट्रीयों के हिसाब से ड्रॉअर में {amount} ज़्यादा हैं।",
    drawerShort: "कम है",
    drawerShortBody: "आपके लिखे हिसाब से ड्रॉअर में {amount} कम हैं।",
    drawerSaveCount: "गिनती सहेजें",
    drawerRecentCounts: "पिछली गिनतियाँ",
    drawerRecentBlurb: "आपके पिछले सात दिनों की गिनती।",
    drawerCountedExpected: "{counted} गिने · {expected} होने चाहिए",
    drawerRemoveCount: "{date} की गिनती हटाएँ",

    // --- टैक्स की दर + आम शुरुआती नकद
    settingsTitle: "सेटिंग्स",
    settingsBlurb:
      "तय करें कि कमाई का कितना हिस्सा टैक्स के लिए रोकना है, और दिन की शुरुआत में आम तौर पर कितना नकद रहता है।",
    settingsTaxRate: "टैक्स के लिए रोकें (%)",
    settingsUsualFloat: "आम शुरुआती नकद",
    settingsTaxNote:
      "यह टैक्स सलाह नहीं है — यह बस आपके लिखे हुए का एक हिस्सा अलग रख देता है ताकि बिल अचानक भारी न लगे। सही दर अपने अकाउंटेंट से पक्की कर लें।",
    settingsSave: "सेटिंग्स सहेजें",

    // --- ऐप लॉक
    lockTitle: "इस ऐप को लॉक करें",
    lockBlurb:
      "अपना हिसाब PIN के पीछे छिपा दें, ताकि आपका खुला फ़ोन हाथ में लेकर कोई उसे पढ़ न सके।",
    lockOnMessage: "लॉक चालू है। वापस आने पर आपसे यही PIN पूछा जाएगा।",
    lockOffMessage: "लॉक बंद कर दिया गया।",
    lockOn: "चालू",
    lockOff: "बंद",
    lockEveryTime: "जब भी आप ऐप खोलेंगे, आपसे PIN पूछा जाएगा।",
    lockAsksAfter_one: "{count} मिनट दूर रहने के बाद फिर पूछेगा।",
    lockAsksAfter_other: "{count} मिनट दूर रहने के बाद फिर पूछेगा।",
    lockTurningOff: "बंद किया जा रहा है…",
    lockTurnOff: "लॉक बंद करें",
    lockChoosePin: "एक PIN चुनें",
    lockChoosePinBlurb: "चार से आठ अंक। ऐप पर वापस आने पर आप यही डालेंगे।",
    lockPinMismatch: "ये दोनों PIN एक जैसे नहीं हैं।",
    lockNewPin: "नया PIN",
    lockPinHint: "4 से 8 अंक।",
    lockConfirmPin: "इसे फिर से डालें",
    lockAskAgainAfter: "फिर पूछे, इतनी देर बाद",
    lockTimeoutAlways: "जब भी मैं इसे खोलूँ",
    lockTimeoutMinutes_one: "{count} मिनट दूर",
    lockTimeoutMinutes_other: "{count} मिनट दूर",
    lockTimeoutHours_one: "{count} घंटा दूर",
    lockTimeoutHours_other: "{count} घंटे दूर",
    lockTurnOn: "लॉक चालू करें",
    lockFootnote:
      "यह ऐप को आपके फ़ोन पर छिपाता है। आपका खाता तो पहले से आपके पासवर्ड से सुरक्षित है, और आपका डेटा सिर्फ़ आप ही पढ़ सकते हैं — PIN उसके ऊपर बस एक सुविधा है, उसकी जगह नहीं। भूल गए? साइन आउट करके फिर साइन इन करें, और नया तय कर लें।",
  },

  help: {
    // --- पेज खुद
    title: "सब कुछ कैसे चलता है",
    blurb:
      "हर सुविधा, वह किसलिए है, और उसे कैसे इस्तेमाल करना है। खोजिए, या मदद मेनू से कोई हिस्सा चुनिए।",
    searchPlaceholder: "मदद में खोजें — “रसीद”, “बाँटना”, “टैक्स” आज़माएँ…",
    searchLabel: "मदद में खोजें",
    clearSearch: "मदद की खोज साफ़ करें",
    matchCount_one: "“{query}” से {count} विषय मिलता है।",
    matchCount_other: "“{query}” से {count} विषय मिलते हैं।",
    oneSectionTitle: "सिर्फ़ एक हिस्सा दिख रहा है",
    oneSectionBody: "आप गाइड के एक हिस्से के लिंक से यहाँ आए हैं।",
    noMatch: "“{query}” से कुछ नहीं मिला",
    noMatchHint: "कोई आसान शब्द आज़माएँ — “टैक्स”, “रसीद”, “एक्सपोर्ट”।",
    whereToFind: "यह कहाँ मिलेगा",
    howToUse: "कैसे इस्तेमाल करें",
    worthKnowing: "जानने लायक बातें",
    openIt: "इसे खोलें",
    stillStuck: "फिर भी अटक गए?",
    // {link} वहाँ है जहाँ “अपने पैसे के बारे में पूछें” का लिंक लगेगा। वाक्य को
    // जहाँ ज़रूरत हो वहाँ ले जाइए — पेज स्ट्रिंग को वहीं से काटता है — पर यह
    // ठीक एक बार आना चाहिए, वरना लिंक गायब हो जाएगा।
    stillStuckBody:
      "{link} पर अपने शब्दों में पूछकर देखिए — वह आपके अपने आंकड़ों के सवालों के जवाब देता है। टैक्स या कानून से जुड़ी किसी भी बात के लिए ऐप पर भरोसा करने के बजाय अकाउंटेंट से पूछ लें।",

    // --- हिस्सों के नाम
    groupStart: "शुरुआत करना",
    groupLogging: "पैसा लिखना",
    groupDay: "आपका दिन",
    groupMonth: "इस महीने",
    groupInvoices: "इनवॉइस",
    groupTools: "टूल्स",
    groupExport: "एक्सपोर्ट",
    groupOffline: "फ़ोन और बिना सिग्नल",
    groupPrivacy: "निजता और आपका डेटा",

    // --- शुरुआत करना
    firstRunTitle: "पहली बार सेट करना",
    firstRunWhere: "आज",
    firstRunSummary: "दो कदम और बाकी पूरा ऐप चलने लगता है: एक एंट्री और टैक्स का प्रतिशत।",
    firstRunKeywords: "शुरुआत सेटअप नया खाता पहली बार onboarding setup",
    firstRunStep1: "“आज” पर, आपने जो कमाया वह सेटअप वाले खाने में लिखें और सहेज दें।",
    firstRunStep2:
      "तय करें कि कमाई का कितना हिस्सा टैक्स के लिए रोकना है — 25% से शुरू करना आम बात है।",
    firstRunStep3:
      "दोनों काम हो जाने पर सेटअप वाला हिस्सा अपने आप हट जाता है। न करना हो तो “इसे छोड़ दें” का लिंक भी है।",
    firstRunNote1:
      "यहाँ कुछ भी पक्का नहीं है — टैक्स की दर आप टूल्स में कभी भी बदल सकते हैं, और कोई भी एंट्री हटा सकते हैं।",

    paletteTitle: "⌘K से कहीं भी पहुँचें",
    paletteWhere: "कहीं भी",
    paletteSummary:
      "एक ही शॉर्टकट से किसी भी पेज पर जाइए, या जो कर रहे हैं उसे छोड़े बिना एंट्री लिख दीजिए।",
    paletteKeywords: "कमांड पैलेट खोज शॉर्टकट कीबोर्ड ctrl k",
    paletteStep1: "⌘K दबाएँ (विंडोज़ पर Ctrl+K), या ऊपर की पट्टी में “खोजना” पर क्लिक करें।",
    // शुरुआती अक्षरों वाला डेमो हिंदी में लिखा गया है: पैलेट अनुक्रम से मिलान
    // करता है, और “पकग” सचमुच nav.whereMoneyWent “पैसा कहां गया” को ढूँढ़ लेता है।
    paletteStep2:
      "पेज के नाम का कोई हिस्सा लिखें — पहले अक्षर भी चलते हैं, जैसे “पकग” लिखने पर “पैसा कहां गया” मिल जाता है।",
    paletteStep3:
      "या “spent 20 on supplies” जैसी कोई एंट्री लिखकर “इस एंट्री को लॉग करें” चुन लें।",
    paletteStep4: "तीर की कुंजियाँ ऊपर-नीचे ले जाती हैं, Enter चुनता है, Escape बंद कर देता है।",

    themeTitle: "अँधेरा या उजाला",
    themeWhere: "ऊपर की पट्टी",
    themeSummary: "ऐप अपने आप अँधेरे में रहता है; तेज़ रोशनी वाली जगहों के लिए उजाला कर लीजिए।",
    themeKeywords: "थीम अँधेरा उजाला डार्क लाइट सूरज चाँद बाहर",
    themeStep1: "ऊपर की पट्टी में सूरज या चाँद के निशान पर क्लिक करें। आपकी पसंद याद रहती है।",
    themeNote1: "बाहर धूप में उजाला मोड काम आता है — तेज़ धूप में काली स्क्रीन पढ़ना मुश्किल है।",

    // --- पैसा लिखना
    quickAddTitle: "शीघ्र जोड़ें — बस लिख दीजिए",
    quickAddWhere: "आज → एंट्री जोड़ें",
    quickAddSummary: "जैसे आप बोलते हैं वैसे लिख दीजिए, खाने अपने आप भर जाते हैं।",
    quickAddKeywords: "जल्दी टाइप तेज़ एंट्री आम भाषा quick",
    quickAddStep1: "कुछ ऐसा लिखें: “spent 42.50 at costco on groceries” या “made 300”।",
    quickAddStep2: "नीचे दिखने वाली झलक देख लें — उसमें साफ़ लिखा रहता है कि क्या समझा गया।",
    quickAddStep3: "“जोड़ दें” दबाएँ।",
    quickAddNote1:
      "यह आपसे सीखता है: कॉस्टको को एक बार किराने की श्रेणी में डाल दीजिए, अगली बार वह अपने आप भर जाएगा।",
    quickAddNote2: "“yesterday” और 2026-08-01 जैसी तारीखें, दोनों चल जाती हैं।",

    voiceTitle: "बोलकर जोड़ें",
    voiceWhere: "आज → एंट्री जोड़ें",
    voiceSummary: "एंट्री लिखने के बजाय बोल दीजिए।",
    voiceKeywords: "आवाज़ बोलना माइक बोलकर लिखवाना voice",
    voiceStep1: "शीघ्र जोड़ें वाले खाने के बगल में माइक पर टैप करें।",
    voiceStep2: "कुछ ऐसा बोलें: “spent twenty dollars on lunch”।",
    voiceStep3: "खाना अपने आप भर जाता है — जाँच लीजिए, फिर “जोड़ दें” दबाइए।",
    voiceNote1:
      "Chrome और Safari में चलता है। Firefox में माइक का बटन दिखता ही नहीं, क्योंकि वह ब्राउज़र यह कर नहीं पाता।",
    voiceNote2: "शब्दों में कही रकम भी संभल जाती है: “three hundred and fifty” का मतलब 350।",
    voiceNote3: "पहली बार आपके ब्राउज़र को माइक की इजाज़त चाहिए होगी।",

    fullFormTitle: "पूरी एंट्री वाला फ़ॉर्म",
    fullFormWhere: "आज → एंट्री जोड़ें",
    fullFormSummary: "जब आप हर चीज़ खुद अपने हाथ से भरना चाहें।",
    fullFormKeywords: "फ़ॉर्म हाथ से तारीख कमाया खर्च श्रेणी नकद कार्ड",
    fullFormStep1: "तारीख डालें, फिर कमाया हुआ पैसा और/या खर्च हुआ पैसा।",
    fullFormStep2: "चाहें तो लिख दें कि किस पर खर्च हुआ, और कहाँ (दुकान का नाम)।",
    fullFormStep3: "नकद, कार्ड या अन्य चुनें — कैश ड्रॉअर की जाँच इसी से चलती है।",
    fullFormStep4: "रसीद हो तो उसकी फ़ोटो लगा दें।",

    receiptsTitle: "रसीद की फ़ोटो, जो खुद ही भर जाती है",
    receiptsWhere: "आज → एंट्री जोड़ें",
    receiptsSummary: "रसीद की फ़ोटो लीजिए और यह कुल रकम, श्रेणी, तारीख और दुकान पढ़ लेता है।",
    receiptsKeywords: "रसीद फ़ोटो स्कैन कैमरा तस्वीर ocr",
    receiptsStep1: "“रसीद फ़ोटो” वाले खाने में फ़ोटो चुनें या वहीं खींच लें।",
    receiptsStep2: "थोड़ा रुकिए — यह रसीद पढ़कर जो मिला वह भर देता है।",
    receiptsStep3: "सहेजने से पहले आंकड़े जाँच लीजिए। फ़ोटो एंट्री के साथ लगी रहती है।",
    receiptsNote1:
      "रसीद पढ़ने के लिए एक AI key सेट होनी चाहिए। वह न हो तो भी बाकी सब चलता रहता है, बस ब्योरा आपको खुद लिखना पड़ता है।",
    receiptsNote2:
      "रसीद की फ़ोटो सिर्फ़ आपकी रहती है और सुरक्षित जगह रखी जाती है, चाहे एंट्री साझा ही क्यों न हो।",

    editingTitle: "एंट्री ठीक करना या हटाना",
    editingWhere: "आज",
    editingSummary: "एंट्री हटाएँ, बाद में रसीद लगाएँ, या बदलें कि उसे कौन देख सकता है।",
    editingKeywords: "हटाना मिटाना बदलना गलती रसीद साझा",
    editingStep1: "“आज” की सूची में वह एंट्री ढूँढ़ लीजिए।",
    editingStep2: "कैमरे का निशान रसीद की फ़ोटो लगाता या बदलता है।",
    editingStep3:
      "लोगों वाला निशान बदलता है कि उसे कौन देख सकता है (सिर्फ़ तब, जब आप किसी परिवार में हों)।",
    editingStep4: "कूड़ेदान का निशान उसे हटा देता है — पहले पूछता है, और यह वापस नहीं आती।",
    editingNote1: "आंकड़े खुद बदलने हों तो “एंट्री खोजें” का इस्तेमाल करें — नीचे देखिए।",

    findEntryTitle: "एंट्री खोजें, और ठीक करें",
    findEntryWhere: "आज → एंट्री खोजें",
    findEntrySummary: "आपने जो कुछ लिखा है उसे खोजिए, फिर बदलने के लिए किसी एक पर टैप कीजिए।",
    findEntryKeywords: "खोज ढूँढ़ना फ़िल्टर बदलना ठीक करना गलती तारीख रकम इतिहास पुरानी एंट्री",
    findEntryStep1: "जो याद हो वही लिख दीजिए — दुकान, श्रेणी, तारीख, यहाँ तक कि रकम भी।",
    findEntryStep2:
      "“अधिक फ़िल्टर” से और छाँटिए: श्रेणी, नकद या कार्ड, तारीखों का दायरा, या रकम का दायरा।",
    findEntryStep3:
      "किसी नतीजे पर टैप करके उसे खोलिए, जो गलत है वह बदलिए, और “परिवर्तनों को सुरक्षित करें” दबा दीजिए।",
    findEntryNote1:
      "आपका लिखा हर शब्द मिलना ज़रूरी है, इसलिए “कॉस्टको किराना” लिखने से सूची छोटी होती है, बड़ी नहीं।",
    findEntryNote2:
      "कुल वाली पंक्ति वही जोड़ती है जो स्क्रीन पर दिख रहा है, इसलिए खोज खुद एक छोटी रिपोर्ट बन जाती है — एक श्रेणी छाँट लीजिए और उस श्रेणी का कुल सामने है।",
    findEntryNote3:
      "परिवार में साझा एंट्री कोई भी ठीक कर सकता है, पर हटा सिर्फ़ वही सकता है जिसने उसे लिखा था।",
    findEntryNote4: "खोज आपके ही फ़ोन पर होती है, इसलिए तुरंत होती है और बिना नेट के भी चलती है।",

    // --- आपका दिन
    safeToSpendTitle: "आज खर्च करना सुरक्षित",
    safeToSpendWhere: "आज",
    safeToSpendSummary:
      "एक ही आंकड़ा: आप अभी कितना खर्च कर सकते हैं कि इस महीने बाद में दिक्कत न हो।",
    safeToSpendKeywords: "सुरक्षित खर्च रोज़ का बजट बचा हुआ",
    safeToSpendNote1:
      "अगर आपने बजट तय किए हैं, तो यह उनमें बचा हुआ पैसा है, बाकी बचे दिनों में बाँटकर।",
    safeToSpendNote2:
      "अगर नहीं तय किए, तो यह हाथ में मौजूद पैसा घटा इस महीने के बाकी बिल है, बचे दिनों में बाँटकर।",
    // ऐप हर भाषा में रकम USD में ही रखता है, इसलिए आंकड़ा $0.00 ही रहता है —
    // सिर्फ़ अंकों का समूहीकरण पढ़ने वाले की भाषा के हिसाब से चलता है।
    safeToSpendNote3:
      "जब आप घाटे में हों तो यह जगह होने का दिखावा करने के बजाय $0.00 दिखाता है और लाल हो जाता है।",

    dueSoonTitle: "जल्दी देने वाले बिल",
    dueSoonWhere: "आज",
    dueSoonSummary: "पाँच दिन के अंदर कुछ देना हो तो ऊपर एक चेतावनी दिख जाती है।",
    dueSoonKeywords: "देना है याद दिलाना चेतावनी बिल जल्दी",
    dueSoonNote1:
      "यह तभी दिखता है जब आपने हर बार आने वाले बिल तय कर रखे हों और उनमें से कोई पास आ गया हो।",
    dueSoonNote2: "बिल “इस महीने → बिल” में तय करें।",

    streaksTitle: "सिलसिला",
    streaksWhere: "आज → आपकी लगातार एंट्री",
    streaksSummary:
      "आपने लगातार कितने दिन लिखा, कितने दिन फ़ायदे में रहे, या कितने दिन कुछ खर्च नहीं किया।",
    streaksKeywords: "सिलसिला आदत लगातार फ़ायदा बिना खर्च रिकॉर्ड",
    streaksNote1:
      "बिना खर्च वाला दिन तभी गिना जाता है जब आपने उस दिन कुछ लिखा हो — ऐप खोलना भूल जाने से सिलसिला नहीं बनता।",
    streaksNote2: "आज अभी तक न लिखा हो, सिर्फ़ इससे सिलसिला नहीं टूटता; गिनती कल से चलती है।",

    askTitle: "अपने पैसे के बारे में सवाल पूछना",
    askWhere: "आज → अपने पैसे के बारे में पूछें",
    askSummary: "अपने ही आंकड़ों पर आसान भाषा में सवाल।",
    askKeywords: "बातचीत सवाल पूछना मदद सलाह ai",
    askStep1:
      "कोई सवाल लिखें, जैसे “मैंने सबसे ज़्यादा किस पर खर्च किया?” या “क्या मैं $200 खर्च कर सकता हूँ?”",
    askStep2: "सुझाए गए सवालों में से किसी एक पर टैप करके देखिए कि यह किस तरह की बातें संभालता है।",
    askNote1: "यह आपकी अपनी एंट्रीयों से जवाब देता है और आपके काम के आंकड़े कभी गढ़ता नहीं।",
    askNote2:
      "यह खर्च, श्रेणियाँ, तुलना, बजट, बिल, दुकानें, लक्ष्य, आगे का अंदाज़ा, टैक्स और मार्जिन संभालता है।",
    askNote3:
      "इसे आपका बैंक बैलेंस, कर्ज़ या तनख़्वाह का दिन नहीं पता — सिर्फ़ वही पता है जो आपने यहाँ लिखा है।",

    // --- इस महीने
    monthOverviewTitle: "महीने का सारांश",
    monthOverviewWhere: "इस महीने → सारांश",
    monthOverviewSummary: "किसी भी महीने के लिए पैसे आए, पैसे गए और लाभ।",
    monthOverviewKeywords: "महीना कुल लाभ नुकसान सारांश",
    monthOverviewStep1: "महीने के नाम के दोनों तरफ़ बने तीरों से एक महीने से दूसरे पर जाइए।",
    monthOverviewNote1:
      "आप जो महीना चुनते हैं, वह महीने के बाकी पेजों पर जाने पर भी वही बना रहता है।",

    categoriesTitle: "पैसा कहां गया",
    categoriesWhere: "इस महीने → पैसा कहां गया",
    categoriesSummary: "आपका खर्च श्रेणी के हिसाब से बँटा हुआ, सबसे बड़ा पहले।",
    categoriesKeywords: "श्रेणी बँटवारा चार्ट खर्च",

    daybydayTitle: "दिन ब दिन",
    daybydayWhere: "इस महीने → दिन ब दिन",
    daybydaySummary: "महीने का हर दिन एक पट्टी की तरह — ऊपर वाली हरी, नीचे वाली लाल।",
    daybydayKeywords: "रोज़ाना चार्ट पट्टियाँ दिन",

    weekTitle: "आपका हफ़्ता आसान भाषा में",
    weekWhere: "इस महीने → आपका सप्ताह",
    weekSummary: "पिछले सात दिनों का छोटा-सा लिखा हुआ ब्योरा।",
    weekKeywords: "हफ़्ता सारांश ब्योरा आसान भाषा",
    weekNote1:
      "यह आपके ही आंकड़ों से लिखा जाता है, और इसमें यह भी रहता है कि यह हफ़्ता पिछले हफ़्ते के मुकाबले कैसा रहा।",

    outlookTitle: "जो आ रहा है, उसे संभाल पाएँगे",
    outlookWhere: "इस महीने → क्या आप इसे कवर कर सकते हैं?",
    outlookSummary: "अगले 30 दिन की झलक: क्या आपका पैसा आने वाले बिल पूरे कर पाएगा?",
    outlookKeywords: "अंदाज़ा आगे का हिसाब किराया कमी भविष्य",
    outlookNote1:
      "यह आपके हाल के आम दिन से बनता है, और उसमें हर बार आने वाला बिल उसकी अपनी तारीख पर रखा जाता है।",
    outlookNote2: "अगर इसे लगे कि पैसा कम पड़ेगा, तो यह तारीख के साथ आगाह कर देता है।",
    outlookNote3:
      "सिर्फ़ कुछ ही दिन लिखे हों तो यह सटीक होने का दिखावा करने के बजाय साफ़ कह देता है।",

    busydaysTitle: "व्यस्त और शांत दिन",
    busydaysWhere: "इस महीने → व्यस्त और शांत दिन",
    busydaysSummary: "हफ़्ते के किन दिनों में असल में पैसा आता है।",
    busydaysKeywords: "सुस्त शांत व्यस्त दिन सबसे अच्छा दिन",
    busydaysNote1:
      "कुछ मतलब निकलने से पहले करीब तीन हफ़्ते की एंट्रीयाँ चाहिए, और यह आपको बता भी देगा।",

    budgetsTitle: "बजट",
    budgetsWhere: "इस महीने → बजट",
    budgetsSummary: "हर श्रेणी के लिए महीने की एक सीमा, और सीमा पार होने से पहले चेतावनी।",
    budgetsKeywords: "बजट सीमा श्रेणी चेतावनी ज़्यादा खर्च",
    budgetsStep1: "एक श्रेणी और महीने की सीमा भरें, फिर “बजट सहेजें” दबाएँ।",
    budgetsStep2:
      "पट्टियों पर नज़र रखें — 80% पर वे लाल हो जाती हैं और 100% पार होते ही उन पर “पार” लिखा आ जाता है।",
    budgetsNote1: "“आज का दिन बिताना सुरक्षित है” वाला आंकड़ा भी बजटों से ही बनता है।",

    goalsTitle: "बचत लक्ष्य",
    goalsWhere: "इस महीने → बचत लक्ष्य",
    goalsSummary: "कोई चीज़ जिसके लिए आप पैसे जोड़ रहे हैं, और आप उससे कितने पास हैं।",
    goalsKeywords: "लक्ष्य बचत जोड़ना निशाना",
    goalsStep1: "नाम, लक्ष्य रकम, अब तक जोड़ा हुआ पैसा, और चाहें तो एक तारीख भी डालिए।",
    goalsNote1:
      "तारीख दे दें तो यह निकाल देता है कि हर हफ़्ते कितना जोड़ना है; न दें तो आपकी हाल की रफ़्तार से अंदाज़ा लगा लेता है।",

    billsTitle: "बिल, सब्सक्रिप्शन और हर बार आने वाले खर्च",
    billsWhere: "इस महीने → बिल",
    billsSummary: "क्या देना है, क्या सब्सक्रिप्शन लगता है, और आपके तय किए हुए नियम।",
    billsKeywords: "बिल हर बार सब्सक्रिप्शन देना है किराया पकड़ना",
    billsStep1:
      "हर बार आने वाला बिल जोड़ें — रकम, श्रेणी, हर हफ़्ते या हर महीने, और शुरू होने की तारीख।",
    billsStep2: "फिर जैसे-जैसे तारीखें आती हैं, यह वे खर्च वाली एंट्रीयाँ अपने आप बना देता है।",
    billsNote1:
      "यह आपके पुराने हिसाब में बार-बार आने वाले खर्च भी पकड़ लेता है और एक टैप में उन्हें बिल बनाकर ट्रैक करने को कह देता है।",
    billsNote2:
      "पकड़ने में यह जानबूझकर सावधान रहता है: तीन या उससे ज़्यादा बार दिखना, मिलती-जुलती रकम और बराबर का अंतर चाहिए, ताकि यूँ ही की गई खरीदारी पर निशान न लग जाए।",

    // --- इनवॉइस
    invoiceCreateTitle: "ग्राहक को बिल देना",
    invoiceCreateWhere: "इनवॉइस → नया इनवॉइस",
    invoiceCreateSummary: "इनवॉइस बनाइए, फिर एक ही सूची से उसे भेजिए और उसका पीछा कीजिए।",
    invoiceCreateKeywords: "इनवॉइस बिल ग्राहक बनाना भेजना ड्राफ्ट नंबर",
    invoiceCreateStep1:
      "किसके लिए है, तारीखें, और जिस-जिस चीज़ के पैसे ले रहे हैं उसकी एक-एक पंक्ति भरिए।",
    invoiceCreateStep2: "लिखते-लिखते कुल अपने आप बनता जाता है।",
    invoiceCreateStep3: "इसे बना दीजिए — यह ड्राफ्ट से शुरू होता है, इसलिए कुछ भी पक्का नहीं होता।",
    invoiceCreateStep4:
      "जब आप इसे सचमुच ग्राहक को भेज दें, तब इसे खोलकर “भेजे गए के रूप में चिह्नित करें” दबा दें।",
    invoiceCreateNote1:
      "नंबर एक के बाद एक चलते हैं और कभी दोबारा इस्तेमाल नहीं होते, चाहे आपने कोई रद्द ही क्यों न किया हो। बीच में नंबर छूटना आम बात है; एक ही नंबर पर दो इनवॉइस होना नहीं।",
    invoiceCreateNote2:
      "ड्राफ्ट को बदला या हटाया जा सकता है। एक बार भेज देने के बाद उसे बदला या रद्द तो किया जा सकता है, हटाया नहीं — ताकि नंबरों का सिलसिला बना रहे।",
    invoiceCreateNote3:
      "प्रिंट करने या पीडीएफ के रूप में सहेजने पर आपको साफ़-सुथरी कॉपी मिलती है, उसके आसपास ऐप का कुछ नहीं होता।",

    invoicePaidTitle: "पैसा मिलना, और उससे आपके हिसाब पर क्या असर पड़ता है",
    invoicePaidWhere: "इनवॉइस → कोई एक खोलें",
    invoicePaidSummary: "इनवॉइस को भुगतान हुआ चिह्नित करने से ही वह आय बनती है।",
    invoicePaidKeywords: "भुगतान चुकाया आय हिसाब बकाया अतिदेय",
    invoicePaidStep1: "इनवॉइस खोलें और “भुगतान के रूप में चिह्नित करें” दबाएँ।",
    invoicePaidStep2:
      "वही तारीख चुनें जिस दिन पैसा असल में आया — अगर वह आज नहीं है, तो आज मत चुनिए।",
    invoicePaidNote1:
      "इससे उसी तारीख पर आपके हिसाब में एक आम आय एंट्री बन जाती है, तो वह आपके कुल योग, आपके महीने, टैक्स के लिए अलग रखी रकम और आपके एक्सपोर्ट में बाकी हर आमदनी की तरह गिनी जाती है।",
    invoicePaidNote2:
      "जब तक भुगतान चिह्नित नहीं होता, वह आपके आंकड़ों से पूरी तरह बाहर रहता है। बिना चुकाया इनवॉइस आय नहीं है, और उसे गिनने से आपका लाभ और आपका टैक्स दोनों बढ़े-चढ़े दिखेंगे।",
    invoicePaidNote3:
      "मन बदल गया? “अवैतनिक के रूप में चिह्नित करें” उस एंट्री को फिर से हटा देता है।",
    invoicePaidNote4:
      "जिसकी नियत तारीख निकल गई हो, वह अपने आप अतिदेय दिखने लगता है — यह तारीख से निकलता है, इसलिए कभी पुराना नहीं पड़ता।",

    // --- टूल्स
    householdTitle: "किसी के साथ साझा करना",
    householdWhere: "टूल्स → परिवार",
    householdSummary:
      "चुनी हुई एंट्रीयाँ अपने साथी या साथ रहने वाले के साथ साझा कीजिए, और बिल बराबर बाँटिए।",
    householdKeywords: "परिवार साझा साथी बाँटना हिसाब बराबर कोड",
    householdStep1: "परिवार बनाइए और आपको छह अक्षरों का जुड़ने वाला कोड मिल जाएगा।",
    householdStep2: "सामने वाला साइन अप करे, टूल्स → परिवार खोले, और वह कोड डाल दे।",
    householdStep3: "कुछ लिखते समय “केवल मैं”, “शेयर करना” या “इसे विभाजित करें” चुनें।",
    householdNote1:
      "जब तक आप खुद न चाहें, सब कुछ निजी ही रहता है — परिवार में जुड़ने भर से आपका पहले लिखा हुआ किसी को नहीं दिखने लगता।",
    householdNote2:
      "“शेयर करना” का मतलब है वे इसे देख सकते हैं। “इसे विभाजित करें” का मतलब है यह बराबर भी बँटता है और कौन किसे कितना दे, उस हिसाब में भी आता है।",
    householdNote3:
      "परिवार का कोई भी सदस्य साझा एंट्री ठीक कर सकता है, पर हटा सिर्फ़ वही सकता है जिसने उसे लिखा था।",
    householdNote4: "परिवार छोड़ने पर आपकी साझा एंट्रीयाँ फिर से निजी हो जाती हैं।",

    marginsTitle: "हर चीज़ पर असल में क्या बचता है",
    marginsWhere: "टूल्स → आइटम मार्जिन",
    marginsSummary: "लागत और बिक्री की कीमत डालिए, हर बिक्री पर असली मुनाफ़ा देखिए।",
    marginsKeywords: "मार्जिन मुनाफ़ा प्रति चीज़ कीमत सामान",
    marginsNote1:
      "यह मोटे तौर पर यह भी बता देता है कि अपने आम खर्च निकालने के लिए महीने में कितनी बेचनी पड़ेंगी।",
    marginsNote2: "अगर आप कोई चीज़ घाटे में बेच रहे हैं तो यह साफ़-साफ़ कह देता है।",

    drawerTitle: "कैश ड्रॉअर की जाँच",
    drawerWhere: "टूल्स → कैश ड्रॉअर",
    drawerSummary: "गल्ला गिनिए और देखिए कि वह आपके लिखे हिसाब से मिलता है या नहीं।",
    drawerKeywords: "कैश ड्रॉअर गल्ला गिनती कम ज़्यादा शुरुआती नकद",
    drawerStep1: "दिन, अपना शुरुआती नकद, और आपने असल में जितना गिना — यह सब भरिए।",
    drawerStep2:
      "सहेजने से पहले यह दिखा देता है कि ड्रॉअर में कितना होना चाहिए और कितने का फ़र्क है।",
    drawerNote1:
      "जितना होना चाहिए, उसमें सिर्फ़ वही एंट्रीयाँ गिनी जाती हैं जिन पर “नकद” लिखा है। अगर आपने कभी कुछ चिह्नित ही नहीं किया, तो सब नकद मान लिया जाता है।",
    drawerNote2:
      "जितना होना चाहिए, वह आपकी एंट्रीयों से सर्वर पर निकाला जाता है, इसलिए वह इधर-उधर नहीं खिसक सकता।",

    taxTitle: "टैक्स के लिए बचत",
    taxWhere: "टूल्स → टैक्स के लिए बचत",
    taxSummary: "कमाई का एक हिस्सा रोक लीजिए, ताकि टैक्स का बिल झटका न दे।",
    taxKeywords: "टैक्स अलग रखना प्रतिशत रोकना तिमाही",
    taxStep1: "एक प्रतिशत तय कर दीजिए। जैसे-जैसे आप कमाई लिखेंगे, कुल अपने आप बदलता जाएगा।",
    // कोट के अंदर का शब्द वही है जिसे श्रेणी पहचानने वाला कोड ढूँढ़ता है, और वह
    // अब भी सिर्फ़ अंग्रेज़ी समझता है — zh.ts और ur.ts के ऊपर लिखा नोट देखें।
    // जब तक वह हिंदी न सीख ले, कोट के अंदर “tax” अंग्रेज़ी में ही रहेगा।
    taxNote1: "टैक्स के भुगतान लिखते समय श्रेणी में “tax” लिख दें, वे कुल में से घट जाएँगे।",
    taxNote2: "यह टैक्स सलाह नहीं है — सही प्रतिशत अपने अकाउंटेंट से पक्का कर लें।",

    reminderTitle: "दैनिक अनुस्मारक",
    reminderWhere: "टूल्स → दैनिक अनुस्मारक",
    reminderSummary: "आपके चुने हुए समय पर एक इशारा, ताकि लिखना आदत बन जाए।",
    reminderKeywords: "अनुस्मारक सूचना याद दिलाना रोज़ समय आदत",
    reminderStep1: "अपने दिन के हिसाब से समय चुनें — दुकान बंद करने के बाद आम तौर पर ठीक रहता है।",
    reminderStep2: "“अनुस्मारक चालू करें” दबाएँ और ब्राउज़र पूछे तो सूचनाओं की इजाज़त दे दें।",
    reminderNote1:
      "यह साफ़ बता देना ठीक रहेगा कि यह चलता कैसे है: ऐप अनुस्मारक तब दिखाता है जब उसे पता चलता है कि वह समय बीत चुका है। यह किसी सर्वर से भेजा जाने वाला अलार्म नहीं है, इसलिए जिस फ़ोन पर दिन भर ऐप खोला ही नहीं गया, उस पर यह नहीं बजेगा।",
    reminderNote2:
      "iPhone पर पहले ऐप को होम स्क्रीन पर जोड़ना पड़ता है — Apple उसके बिना सूचनाएँ आने ही नहीं देता।",
    reminderNote3: "उस दिन आपने कुछ लिख दिया हो तो यह चुप रहता है। बात आदत की है, सूचना की नहीं।",
    reminderNote4: "आप ऐप कई बार खोलें, तब भी यह दिन में एक ही बार दिखता है।",
    reminderNote5:
      "अगर आपने इस साइट की सूचनाएँ रोक रखी हैं, तो ऐप चालू होने का दिखावा करने के बजाय यह बात बता देगा।",

    lockTitle: "ऐप को लॉक करना",
    lockWhere: "टूल्स → इस ऐप को लॉक करें",
    lockSummary: "एक PIN, ताकि आपका खुला फ़ोन हाथ में लेकर कोई आपका हिसाब न पढ़ सके।",
    lockKeywords: "लॉक pin निजता सुरक्षा पासकोड",
    lockStep1: "4–8 अंकों का PIN चुनें, उसे दो बार लिखें, और तय करें कि यह फिर कब पूछे।",
    lockStep2: "हटाना हो तो “लॉक बंद करें” का इस्तेमाल करें।",
    lockNote1:
      "आपका PIN उलझी हुई शक्ल में रखा जाता है और सर्वर पर जाँचा जाता है — वह कभी सादे अंकों में नहीं रखा जाता।",
    lockNote2:
      "यह ऐप को आपके फ़ोन पर छिपाता है। आपका खाता तो पहले से आपके पासवर्ड से सुरक्षित है, इसलिए PIN उसके ऊपर बस एक सुविधा है, उसकी जगह नहीं।",
    lockNote3: "भूल गए? साइन आउट करें, अपने ईमेल और पासवर्ड से फिर साइन इन करें, और नया तय कर लें।",

    // --- एक्सपोर्ट
    exportTitle: "अपने अकाउंटेंट को हिसाब भेजना",
    exportWhere: "एक्सपोर्ट",
    exportSummary: "अपनी एंट्रीयाँ स्प्रेडशीट या साफ़-सुथरी पीडीएफ के रूप में डाउनलोड कीजिए।",
    exportKeywords: "एक्सपोर्ट csv pdf अकाउंटेंट डाउनलोड स्प्रेडशीट हिसाब",
    exportStep1: "तारीखों का दायरा चुनें, या “इस महीने / पिछला महीना / सब कुछ” का इस्तेमाल करें।",
    exportStep2: "झलक देख लीजिए — फ़ाइल में बिल्कुल यही जाता है।",
    exportStep3: "“सीएसवी डाउनलोड करें” या “पीडीएफ डाउनलोड करें” चुनें।",
    exportNote1:
      "दोनों में तारीख, पैसे आए, पैसे गए, श्रेणी, कहाँ, और एक टिप्पणी रहती है, साथ में कुल वाली पंक्ति।",
    exportNote2:
      "मेनू में “एक्सपोर्ट → सीएसवी डाउनलोड करें” और “पीडीएफ डाउनलोड करें” आपके मौजूदा दायरे के साथ सीधे डाउनलोड पर ले जाते हैं।",

    // --- फ़ोन और बिना सिग्नल
    installTitle: "इसे अपने फ़ोन पर रख लीजिए",
    installWhere: "आज, या आपके ब्राउज़र का मेनू",
    installSummary:
      "इसे इंस्टॉल कर लीजिए, ताकि यह अपने आइकन के साथ, पूरी स्क्रीन पर, ऐप की तरह खुले।",
    installKeywords: "इंस्टॉल ऐप होम स्क्रीन आइकन फ़ोन pwa",
    installStep1: "Android या Chrome पर, “आज” पेज पर ऐप जब कहे तब “स्थापित करना” दबा दें।",
    installStep2: "iPhone पर, Safari में शेयर बटन दबाएँ, फिर “होम स्क्रीन पर जोड़ें”।",
    installNote1:
      "बिना नेट के लिखना और रोज़ की याद दिलाने वाली सूचनाएँ इंस्टॉल करने पर ही ठीक से चलती हैं, खासकर iPhone पर।",
    installNote2: "यह वही ऐप और वही खाता है — दोबारा कुछ सेट नहीं करना पड़ता।",

    offlineLoggingTitle: "बिना सिग्नल के लिखना",
    offlineLoggingWhere: "कहीं भी",
    offlineLoggingSummary:
      "बेसमेंट में, बाज़ार में, या जहाँ नेटवर्क न आए — लिखते रहिए। कुछ नहीं खोता।",
    offlineLoggingKeywords: "ऑफ़लाइन बिना सिग्नल बिना इंटरनेट सिंक कतार बाज़ार बेसमेंट",
    offlineLoggingNote1:
      "कनेक्शन न होने पर ऊपर एक पट्टी दिख जाती है। आप आम दिनों की तरह लिखते रहिए।",
    offlineLoggingNote2:
      "एंट्रीयाँ आपके फ़ोन पर रुकी रहती हैं और नेट लौटते ही, उसी क्रम में जिसमें आपने लिखी थीं, अपने आप भेज दी जाती हैं।",
    // “उन्हें दिखाओ” ऑफ़लाइन पट्टी का बटन है — offline.showThem से मिलता रखें,
    // ताकि निर्देश उसी बटन का नाम ले जो पढ़ने वाले को स्क्रीन पर दिखता है।
    offlineLoggingNote3:
      "क्या-क्या अब भी रुका पड़ा है, यह ठीक-ठीक देखने के लिए उस पट्टी में “उन्हें दिखाओ” पर टैप करें।",
    offlineLoggingNote4:
      "जो पेज आप पहले खोल चुके हैं वे बिना नेट के भी चलते हैं, और आपके आंकड़े उसी हाल में पढ़े जा सकते हैं जिस हाल में वे आखिरी बार लोड हुए थे।",
    offlineLoggingNote5:
      "एक चीज़ बिना नेट के नहीं हो सकती: रसीद की फ़ोटो लगाने के लिए कनेक्शन चाहिए। एंट्री सहेज लीजिए और फ़ोटो बाद में जोड़ दीजिए।",
    offlineLoggingNote6:
      "कोई एंट्री कई बार अस्वीकार हो जाए तो ऐप उसे चुपचाप गिराने के बजाय एक तरफ़ रख देता है और आपको बता देता है। आप खुद उसे फिर भेज सकते हैं या हटा सकते हैं।",
    offlineLoggingNote7:
      "जो अभी भेजा जाना बाकी है, साइन आउट करने से वह मिटता नहीं — यह आपको बता देता है और उसे अगली बार उसी डिवाइस पर साइन इन करने तक रखे रहता है।",

    // --- निजता और आपका डेटा
    privacyTitle: "आपके आंकड़े कौन देख सकता है",
    privacyWhere: "हर जगह",
    privacySummary: "आपकी एंट्रीयाँ आपकी हैं। जब तक आप खुद न चाहें, कुछ भी साझा नहीं होता।",
    privacyKeywords: "निजता सुरक्षा डेटा कौन देख सकता है सुरक्षित",
    privacyNote1:
      "किसे क्या दिखेगा, यह डेटाबेस खुद तय करता है, सिर्फ़ ऐप नहीं — इसलिए कोई दूसरा खाता आपकी एंट्रीयाँ सिद्धांत रूप में भी नहीं पढ़ सकता।",
    privacyNote2:
      "साइन आउट करते ही आपके आंकड़ों की ऑफ़लाइन कॉपी मिटा दी जाती है, ताकि उस डिवाइस को अगली बार इस्तेमाल करने वाला उसे पढ़ न सके।",
    privacyNote3:
      "परिवार के साथ साझा करना हर एंट्री के लिए अलग से होता है, और हमेशा आपकी अपनी चुनी हुई बात होती है।",
    privacyNote4: "रसीद की फ़ोटो ऐसी निजी जगह रहती हैं जिसे सिर्फ़ आप खोल सकते हैं।",
    privacyNote5:
      "आपने जो कुछ लिखा है वह आप कभी भी एक्सपोर्ट कर सकते हैं, और कोई भी एंट्री हटा सकते हैं।",
  },

  onboarding: {
    title: "चलिए आपका हिसाब सेट कर देते हैं",
    blurb: "दो छोटे काम, और बाकी पूरा ऐप ठीक से चलने लगेगा।",
    stepsDone_one: "{total} में से {count} हो गया",
    stepsDone_other: "{total} में से {count} हो गए",
    progressLabel: "सेटअप कहाँ तक पहुँचा",
    entryStepTitle: "आज आपने जो कमाया वह लिख दीजिए",
    entryStepDone: "पहली एंट्री लिख दी गई",
    entryStepDoneBlurb: "बढ़िया — अब आपके कुल और चार्ट चालू हो गए।",
    amountLabel: "आज कमाया हुआ पैसा",
    taxStepTitle: "तय करें कि टैक्स के लिए कितना रोकना है",
    taxStepDone: "टैक्स के लिए {rate}% रोका जा रहा है",
    taxStepDoneBlurb: "इसे आप {section} में कभी भी बदल सकते हैं।",
    rateLabel: "कमाई का प्रतिशत",
    setRate: "तय करें",
    taxHint:
      "मोटा अंदाज़ा भी चलेगा — 25% से शुरू करना आम बात है। असली आंकड़ा अकाउंटेंट से पक्का कर लें; यह बस इतना करता है कि बिल अचानक भारी न लगे।",
    skip: "इसे छोड़ दें",
  },

  empty: {
    logFirstEntry: "अपनी पहली एंट्री लिखें",
    samplePreview: "यह कुछ ऐसा दिखेगा",
  },

  export: {
    eyebrow: "एक्सपोर्ट",
    title: "अपना हिसाब एक्सपोर्ट करें",
    blurb:
      "जो तारीखें चाहिए वे चुन लीजिए, फिर अपने अकाउंटेंट के लिए स्प्रेडशीट या साफ़-सुथरी पीडीएफ डाउनलोड कर लीजिए।",

    dateRange: "तारीखों का दायरा",
    dateRangeHint: "सब कुछ एक्सपोर्ट करना हो तो दोनों खाली छोड़ दें।",
    from: "से",
    to: "तक",
    thisMonth: "इस महीने",
    lastMonth: "पिछला महीना",
    everything: "सब कुछ",

    entryCount_one: "{count} एंट्री",
    entryCount_other: "{count} एंट्रीयाँ",
    labelIn: "आए",
    labelOut: "गए",
    labelNet: "शुद्ध",

    columnDate: "तारीख",
    columnCategory: "श्रेणी",
    columnIn: "आए",
    columnOut: "गए",
    totalsRow: "कुल",
    totalsNet: "({amount} शुद्ध)",

    previewTitle: "झलक — आपको यही मिलेगा",
    previewNote:
      "नीचे बनने वाली सीएसवी और पीडीएफ में बिल्कुल यही जाता है — पीडीएफ में ऊपर आपके काम का नाम और तारीखों का दायरा भी जुड़ जाता है।",

    sampleBadge: "नमूना",
    sampleTitle: "आपका एक्सपोर्ट कैसा दिखेगा",
    sampleBlurb:
      "इन तारीखों में अभी आपकी कोई एंट्री नहीं है, इसलिए यहाँ नकली आंकड़ों वाला एक बनाया हुआ नमूना है — बस यह दिखाने के लिए कि रोज़ का आना-जाना लिखना शुरू करने पर सीएसवी और पीडीएफ में क्या-क्या आएगा।",
    sampleNote:
      "हर एंट्री अपनी तारीख, श्रेणी और रकमों के साथ एक पंक्ति बन जाती है, और सबसे नीचे कुल वाली पंक्ति रहती है। नीचे दिए असली डाउनलोड बटन तभी चालू होते हैं जब इस दायरे में आपकी सचमुच एंट्रीयाँ हों।",
    sampleCategorySupplies: "आपूर्ति",
    sampleCategoryRent: "किराया",

    nothingToDownload: "इन तारीखों के लिए अभी डाउनलोड करने को कुछ नहीं",
    nothingToDownloadBody: "ऊपर से बड़ा दायरा चुनें, फिर कोशिश करें।",

    downloadCsv: "सीएसवी डाउनलोड करें",
    downloadPdf: "पीडीएफ डाउनलोड करें",
  },

  landing: {
    // --- हेडर, हीरो और आखिरी बुलावे में साझा
    startFree: "मुफ़्त शुरू करें",
    signIn: "साइन इन करें",

    // --- landing-header.tsx
    homeLabel: "SimpleBooks — होम",
    navLabel: "साइट",

    // --- hero.tsx
    heroTitle: "आज ही जानिए कि आपका काम कहाँ खड़ा है",
    heroBody:
      "जो पैसा आता-जाता है उसे उसी वक्त लिख दीजिए। SimpleBooks उसे आपके लिए जोड़ता रहता है, तो दिन में जब चाहें देख सकते हैं कि आप फ़ायदे में हैं या नहीं — बिना किसी स्प्रेडशीट के, और बहीखाते की एबीसी जाने बिना।",
    heroSeeHowItWorks: "देखिए यह कैसे चलता है",
    heroReassuranceSpeed: "एक एंट्री में करीब दस सेकंड",
    heroReassuranceOffline: "बिना सिग्नल के भी चलता रहता है",
    // {count} TRIAL_DAYS है, जो pricing.ts से आता है। संख्या यहाँ कभी न लिखें।
    heroReassuranceTrial_one: "{count} दिन मुफ़्त, जब चाहें रद्द करें",
    heroReassuranceTrial_other: "{count} दिन मुफ़्त, जब चाहें रद्द करें",

    // --- product-preview.tsx (एक बनाया हुआ ठेला; इसमें कुछ भी असली नहीं है)
    previewToday: "आज",
    previewExampleBadge: "नमूना स्क्रीन",
    previewNetLabel: "आज की शुद्ध रकम",
    previewNetHint: "आज आप फ़ायदे में हैं।",
    previewMoneyIn: "पैसे आए",
    previewMoneyOut: "पैसे गए",
    previewAllTime: "पूरे समय",
    // {amount} बना-बनाया आंकड़ा है, जो एक कंपोनेंट की तरह दिखाया जाता है। इसे वहाँ
    // रखिए जहाँ वाक्य को ज़रूरत हो — पेज स्ट्रिंग को वहीं से काटता है — पर रखिए ज़रूर।
    previewAllTimeIn: "{amount} आए",
    previewAllTimeOut: "{amount} गए",
    // {number} बिलों की गिनती है, जो अपने अलग span में दिखती है ताकि अंकों की
    // सजावट बनी रहे। यह ठीक एक बार आना चाहिए।
    previewBillsDue_one: "{number} बिल जल्दी देना है",
    previewBillsDue_other: "{number} बिल जल्दी देने हैं",
    previewBillsHint: "बाद में भारी पड़े, उससे पहले निपटा लेना ठीक रहेगा।",
    previewBillRent: "ठेले का किराया",
    previewBillPhone: "फ़ोन",
    previewBillDueTomorrow: "कल देना है",
    previewBillDueInDays_one: "{count} दिन में देना है",
    previewBillDueInDays_other: "{count} दिनों में देना है",
    previewRecentEntries: "हाल की एंट्रीयाँ",
    previewDateMonday: "सोम 4",
    previewDateSunday: "रवि 3",
    previewEntryTakings: "ठेले की बिक्री — सुबह",
    previewEntryWholesaler: "थोक वाला — सब्ज़ी",
    previewEntryInvoicePaid: "इनवॉइस #{number} का भुगतान हुआ",
    previewEntryDiesel: "गाड़ी का डीज़ल",
    previewMethodCash: "नकद",
    previewMethodCard: "कार्ड",
    previewMethodBankTransfer: "बैंक ट्रांसफ़र",
    previewCaption:
      "रोज़ वाली स्क्रीन का एक नमूना। ऊपर का हर आंकड़ा सिर्फ़ दिखाने के लिए बनाया गया है — न यह कोई असली कारोबार है, न किसी का डेटा।",

    // --- benefits.tsx
    benefitsEyebrow: "यह करता क्या है",
    benefitsTitle: "अकेले चलने वाले काम को जो चाहिए बस वही, और कुछ नहीं",
    benefitsDescription:
      "न खातों की लंबी सूची, न डबल एंट्री, न भारी-भरकम शब्द। बस वही चीज़ें जो आप रोज़ करते हैं।",
    benefitLoggingTitle: "लिखने में सेकंड लगते हैं",
    benefitLoggingBody:
      "जो आया या गया वह लिख या बोल दीजिए — अगला ग्राहक आने से पहले वह सहेजा जा चुका होगा।",
    benefitAskTitle: "अपने ही आंकड़ों के बारे में पूछिए",
    benefitAskBody: "“पिछला हफ़्ता कैसा रहा?” जैसा कुछ पूछिए और उसी आसान भाषा में जवाब पाइए।",
    benefitReceiptTitle: "रसीद की फ़ोटो खींचिए",
    benefitReceiptBody:
      "एक तस्वीर लीजिए और दुकान, तारीख और रकम अपने आप भर जाते हैं — आप बस जाँच लीजिए।",
    benefitInvoiceTitle: "इनवॉइस भेजिए",
    benefitInvoiceBody:
      "एक मिनट में बनाइए, भेजिए, और एक नज़र में देखिए कि किन-किन का पैसा अब भी बाकी है।",
    benefitBudgetsTitle: "बजट, बिल और लक्ष्य",
    benefitBudgetsBody:
      "तय कीजिए कि कितना खर्च करना है, बिल कब आते हैं, और आप किस चीज़ के लिए पैसे जोड़ रहे हैं।",
    benefitOfflineTitle: "बिना सिग्नल के चलता है",
    benefitOfflineBody:
      "बाज़ार की गली में या बेसमेंट में भी लिखते रहिए; नेट लौटते ही यह सब भेज देता है।",
    benefitPrivacyTitle: "आपके आंकड़े आपके ही रहते हैं",
    benefitPrivacyBody:
      "आपका हिसाब आपके खाते तक सीमित रहता है, और सिर्फ़ उसी के साथ साझा होता है जिसे आप खुद बुलाएँ।",

    // --- how-it-works.tsx
    howItWorksEyebrow: "यह कैसे चलता है",
    howItWorksTitle: "तीन कदम, और आपका हिसाब बनने लगा",
    howItWorksDescription:
      "पहला काम आप आज दोपहर ही कर सकते हैं और वहीं रुक भी सकते हैं। बाकी जब मन हो तब के लिए रखा है।",
    // सिर्फ़ स्क्रीन रीडर के लिए, कदम के नाम से ठीक पहले पढ़ा जाता है। कोलन भी
    // स्ट्रिंग का हिस्सा है, क्योंकि कुछ लिपियों में वह अलग तरह से लिखा जाता है।
    stepNumber: "कदम {number}:",
    stepLogTitle: "पैसा लिख लीजिए",
    stepLogBody:
      "गल्ले में आया नकद, कार्ड से मिला पैसा, माल का एक बोरा — जैसे ही हो, लिख दीजिए। एक पंक्ति, कुछ सेकंड।",
    stepSeeTitle: "देखिए आप कहाँ खड़े हैं",
    stepSeeBody:
      "आज, यह हफ़्ता और यह महीना आपके लिए जोड़ दिए जाते हैं। न कोई फ़ॉर्मूला, न महीने के आखिर तक इंतज़ार।",
    stepAskTitle: "पूछिए, भेजिए और आगे की सोचिए",
    stepAskBody:
      "अपने ही आंकड़ों के बारे में सवाल पूछिए, इनवॉइस भेजिए, और जो बजट, बिल और बचत के लक्ष्य आप निभाना चाहते हैं वे तय कर लीजिए।",

    // --- languages.tsx
    languagesEyebrow: "भाषाएँ",
    languagesTitle: "आपकी भाषा में, आप पर थोपा हुआ अनुवाद नहीं",
    languagesDescription:
      "पूरा ऐप — बटन, मदद, तारीखें और रकम — सभी {count} भाषाएँ बोलता है। ऊपर बने भाषा वाले बटन से इसे जब चाहें बदल लीजिए।",
    languagesRtlNote:
      "उर्दू दाएँ से बाएँ पढ़ी जाती है, और पूरा पन्ना भी उसी के साथ पलट जाता है — बजाय इसके कि लिखावट बाएँ-से-दाएँ ढाँचे में अटकी रह जाए।",

    // --- testimonials.tsx (जानबूझकर नकली, और यह बात यहीं लिखी भी है)
    testimonialsEyebrow: "ग्राहकों की बातें",
    testimonialsTitle: "अभी हमारे पास इनमें से कुछ भी नहीं है",
    testimonialsDescription:
      "नीचे कोई भी असली इंसान नहीं है और इनमें से कोई बात असली नहीं है। ये बस यह दिखाने के लिए रखी हैं कि जब SimpleBooks चलाने वाले असली लोग नाम के साथ छपने की इजाज़त देंगे, तब उनकी बातें यहाँ आएँगी।",
    testimonialExampleBadge: "नमूना",
    testimonialNamePending: "नाम बाद में जोड़ा जाएगा",
    testimonialTraderQuote:
      "यह जगह भरने के लिए रखा गया है। यहाँ बाज़ार में ठेला लगाने वाले किसी इंसान की, उसकी रोज़ की बिक्री के बारे में असली बात आएगी।",
    testimonialTraderTrade: "बाज़ार में ठेला लगाने वाले",
    testimonialCafeQuote:
      "यह जगह भरने के लिए रखा गया है। यहाँ किसी कैफ़े मालिक की, रसीदों और माल देने वालों के बारे में असली बात आएगी।",
    testimonialCafeTrade: "कैफ़े के मालिक",
    testimonialCleanerQuote:
      "यह जगह भरने के लिए रखा गया है। यहाँ सफ़ाई का अपना काम करने वाले किसी इंसान की, इनवॉइस के बारे में असली बात आएगी।",
    testimonialCleanerTrade: "सफ़ाई का अपना काम करने वाली",

    // --- pricing.tsx
    pricingEyebrow: "कीमत",
    // {count} और {day} दोनों pricing.ts के TRIAL_DAYS से आते हैं। संख्या अनुवाद में
    // कभी न लिखें — कीमत या ट्रायल बदले तो वह वहीं से बदलना चाहिए।
    pricingTitle_one: "{count} दिन सब कुछ मुफ़्त आज़माइए",
    pricingTitle_other: "{count} दिन सब कुछ मुफ़्त आज़माइए",
    pricingDescription:
      "हम कार्ड इसलिए माँगते हैं कि ट्रायल सीधे सब्सक्रिप्शन में बदल सके। {day}वें दिन से पहले कभी भी रद्द कर दें, तो कुछ भी नहीं कटेगा।",
    pricingMostPopular: "सबसे ज़्यादा लिया जाने वाला",
    pricingNote:
      "दोनों बटन पहले साइन अप पर ले जाते हैं — बिल बनाने के लिए खाता होना ज़रूरी है। कीमतें अमेरिकी डॉलर में हैं।",
    // शून्य कीमत को क्या पढ़ा जाए। बाकी हर कीमत बना-बनाया आंकड़ा है।
    priceFree: "Free",

    planFreeName: "Free",
    planFreeCadence: "हमेशा के लिए",
    planFreeTagline: "आपका हिसाब आपका ही रहता है, और आप रोज़ का रिकॉर्ड फिर भी रख सकते हैं।",
    planFreeCta: "Free पर ही चलते रहें",
    planFreeBulletLog: "पैसे आए और पैसे गए, हाथ से लिखें",
    planFreeBulletTotals: "आज के कुल, और इस महीने के",
    planFreeBulletExports: "सीएसवी और पीडीएफ एक्सपोर्ट — हमेशा",
    planFreeBulletLanguages: "सभी {count} भाषाएँ",

    planProName: "Pro",
    planProCadence: "हर महीने",
    planProTagline_one: "{count} दिन मुफ़्त। खत्म होने से पहले जब चाहें रद्द कर दें।",
    planProTagline_other: "{count} दिन मुफ़्त। खत्म होने से पहले जब चाहें रद्द कर दें।",
    planProCta_one: "मेरा {count} मुफ़्त दिन शुरू करें",
    planProCta_other: "मेरे {count} मुफ़्त दिन शुरू करें",
    planProBulletSearch: "अपनी लिखी हर एंट्री खोजें और ठीक करें",
    planProBulletInsights: "सिलसिला, आपका हफ़्ता, व्यस्त दिन और पैसा कहां गया",
    planProBulletCashTools: "आइटम मार्जिन, कैश ड्रॉअर और टैक्स के लिए बचत",
    planProBulletBills: "बिलों का कैलेंडर, और वे सब्सक्रिप्शन जो यह खुद पकड़ लेता है",
    planProBulletAsk: "अपने ही आंकड़ों के बारे में सवाल पूछें",
    planProBulletReceipts: "रसीद की फ़ोटो खींचिए, बाकी खुद भर जाता है",
    planProBulletInvoices: "बिना किसी हद के इनवॉइस, बजट और बचत लक्ष्य",
    planProBulletReminder: "दिन का हिसाब लिखने की रोज़ की एक याद",
    planProBulletSharing: "साथी या साथ रहने वाले के साथ साझा करें",
    planProBulletOffline: "बिना सिग्नल के चलता है, बाद में सिंक कर देता है",
    planProBulletExports: "अकाउंटेंट के लिए सीएसवी और पीडीएफ एक्सपोर्ट",
    planProBulletLanguages: "सभी {count} भाषाएँ",

    // --- faq.tsx
    faqEyebrow: "सवाल",
    faqTitle: "साइन अप करने से पहले",
    faqAccountingQuestion: "क्या मुझे अकाउंटिंग की कुछ जानकारी होनी चाहिए?",
    faqAccountingAnswer:
      "नहीं। अगर आप “$40 की सब्ज़ी बेची” लिख सकते हैं, तो आप SimpleBooks चला सकते हैं। इसमें कहीं कोई डेबिट, क्रेडिट, जर्नल या डबल एंट्री नहीं है — आप बस लिखते हैं कि पैसा कितना आया और कितना गया, जोड़ना यह खुद कर लेता है। यह आपके कारोबार का रिकॉर्ड है, टैक्स के वक्त अकाउंटेंट की जगह नहीं।",
    faqCancelQuestion: "क्या मैं रद्द कर सकता हूँ?",
    faqCancelAnswer:
      "हाँ, कभी भी, बिलिंग पेज से एक ही क्लिक में — न फ़ोन करना है, न कोई नोटिस देना है, न कोई आपको रोकने की कोशिश करेगा। मुफ़्त हफ़्ते के दौरान रद्द कर दें तो आपसे कभी कुछ नहीं लिया जाएगा। बाद में रद्द करें तो जिस महीने के आपने पैसे दिए हैं वह खत्म होने तक प्रो चलता रहेगा, फिर फ्री प्लान पर आ जाएगा। आपकी एंट्रीयाँ जहाँ हैं वहीं रहती हैं, और आप किसी भी प्लान पर हों, एक्सपोर्ट हमेशा चलते हैं।",
    faqPrivacyQuestion: "मेरे आंकड़े कौन देख सकता है?",
    faqPrivacyAnswer:
      "आप, और वे लोग जिन्हें आप खुद अपना हिसाब साझा करने के लिए बुलाते हैं। आपकी एंट्रीयाँ न बेची जाती हैं, न SimpleBooks चलाने वाले दूसरे लोगों को दिखाई जाती हैं। आप जब चाहें सब कुछ सीएसवी या पीडीएफ में एक्सपोर्ट कर सकते हैं, और खाता हटाने पर आपका हिसाब भी हट जाता है।",
    faqLanguagesQuestion: "यह कौन-कौन सी भाषाएँ बोलता है?",
    // {languages} वहाँ है जहाँ भाषाओं के नामों की सूची आएगी — पेज स्ट्रिंग को वहीं
    // से काटकर उन्हें उभारकर दिखाता है। इसे वाक्य में जहाँ ज़रूरत हो वहाँ ले जाइए,
    // पर यह ठीक एक बार आना चाहिए, वरना सूची गायब हो जाएगी।
    faqLanguagesAnswer:
      "{count}, और वे सब सिर्फ़ पहले पन्ने पर नहीं बल्कि पूरे ऐप में चलती हैं: {languages}। ऊपर की पट्टी में भाषा वाले बटन से आप जब चाहें बदल सकते हैं।",
    faqBillingQuestion: "बिलिंग कैसे चलती है?",
    // {count} pricing.ts का TRIAL_DAYS है।
    faqBillingAnswer_one:
      "प्रो पहले {count} दिन मुफ़्त है। हम शुरू में ही आपका कार्ड इसलिए माँगते हैं कि ट्रायल आपके कुछ किए बिना सब्सक्रिप्शन में बदल जाए — और हम आपको ऐप में, और हर पेज के ऊपर चलती गिनती में, साफ़ बता देते हैं कि पहली बार पैसे कब कटेंगे और कितने कटेंगे। उससे पहले रद्द कर दें तो कुछ भी नहीं लिया जाता। भुगतान Stripe संभालता है, कार्ड की जानकारी उसी के पास रहती है; वह कभी SimpleBooks से होकर नहीं गुज़रती।",
    faqBillingAnswer_other:
      "प्रो पहले {count} दिन मुफ़्त है। हम शुरू में ही आपका कार्ड इसलिए माँगते हैं कि ट्रायल आपके कुछ किए बिना सब्सक्रिप्शन में बदल जाए — और हम आपको ऐप में, और हर पेज के ऊपर चलती गिनती में, साफ़ बता देते हैं कि पहली बार पैसे कब कटेंगे और कितने कटेंगे। उससे पहले रद्द कर दें तो कुछ भी नहीं लिया जाता। भुगतान Stripe संभालता है, कार्ड की जानकारी उसी के पास रहती है; वह कभी SimpleBooks से होकर नहीं गुज़रती।",

    // --- closing-cta.tsx
    closingTitle: "आज की बिक्री से शुरू कीजिए",
    // {count} pricing.ts का TRIAL_DAYS है।
    closingBody_one:
      "शुरू करने के लिए एक एंट्री काफ़ी है। {count} दिन सब कुछ मुफ़्त है — खत्म होने से पहले रद्द कर दें तो आपको कुछ भी नहीं देना पड़ेगा।",
    closingBody_other:
      "शुरू करने के लिए एक एंट्री काफ़ी है। {count} दिन सब कुछ मुफ़्त है — हफ़्ता पूरा होने से पहले रद्द कर दें तो आपको कुछ भी नहीं देना पड़ेगा।",

    // --- landing-footer.tsx
    footerNavLabel: "नीचे की पट्टी",
    footerPrivacy: "निजता",
    footerTerms: "शर्तें",
    footerContact: "संपर्क",
    footerPricing: "कीमत",
    footerDisclaimer:
      "SimpleBooks हिसाब रखने का एक औज़ार है, अकाउंटेंट नहीं। यह न आपका टैक्स रिटर्न भरेगा, न बताएगा कि आप पर कितना बकाया है।",
  },

  lock: {
    // --- लॉक स्क्रीन खुद
    preparing: "आपका हिसाब तैयार किया जा रहा है…",
    locked: "लॉक है",
    enterPin: "अपना PIN डालें",
    blurb: "जब तक आप इस डिवाइस पर लॉक नहीं खोलते, आपका हिसाब छिपा रहता है।",
    pinLabel: "PIN",
    pinHint: "4 से 8 अंक।",
    checking: "जाँचा जा रहा है…",
    unlock: "लॉक खोलें",
    pinWrong: "यह PIN मेल नहीं खाया।",
    checkFailed: "अभी इसे जाँचा नहीं जा सका। फिर कोशिश करें।",
    tooManyTries: "बहुत बार कोशिश हो गई",
    tooManyTriesBody: "PIN भूल गए हों तो साइन आउट करके फिर साइन इन करें।",
    forgotten:
      "भूल गए? साइन आउट करें, अपने ईमेल और पासवर्ड से फिर साइन इन करें, और टूल्स में नया PIN तय कर लें।",

    // --- PIN क्यों नहीं माना गया (pin.ts → pinProblemKey())
    pinLength: "4 से 8 अंक इस्तेमाल करें।",
    pinRepetitive: "यह ताड़ना बहुत आसान है — कुछ ऐसा चुनें जिसमें अंक बार-बार न दोहराएँ।",
    pinCommon: "यह सबसे ज़्यादा चलने वाले PIN में से एक है — कोई दूसरा चुनें।",
  },

  receipt: {
    photoAlt: "रसीद की फ़ोटो",
    add: "रसीद की फ़ोटो जोड़ें",
    replace: "रसीद की फ़ोटो बदलें",
    remove: "रसीद की फ़ोटो हटाएँ",
  },

  errors: {
    notFoundCode: "404",
    notFoundTitle: "पन्ना नहीं मिला",
    notFoundBody: "आप जो पन्ना खोज रहे हैं वह है ही नहीं, या उसे कहीं और भेज दिया गया है।",
    goHome: "होम पर जाएँ",
    failedTitle: "यह पन्ना लोड नहीं हुआ",
    failedBody:
      "हमारी तरफ़ से कुछ गड़बड़ हो गई। आप पन्ना दोबारा लोड करके देख सकते हैं, या होम पर लौट सकते हैं।",
    tryAgain: "फिर कोशिश करें",
  },
};
