import type { PartialDictionary } from "./translate";

/**
 * Spanish (neutral Latin American). Informal "tú" throughout.
 *
 * NEEDS REVIEW BY A NATIVE SPEAKER before anyone relies on it for financial
 * decisions. Machine-assisted first pass — the wording is idiomatic but the
 * financial terms in particular deserve a second pair of eyes.
 *
 * Terms fixed here, so they stay consistent if someone edits one screen:
 *   money in / money out → "dinero que entra" / "dinero que sale"
 *   income → "ingreso"        expense / spend → "gasto" / "gastar"
 *   entry → "registro"        invoice → "factura"
 *   overdue → "vencida"       draft → "borrador"
 *   receipt → "recibo"        budget → "presupuesto"
 *   cash drawer → "caja"      tax set-aside → "apartar impuestos"
 *
 * Keys I was genuinely unsure about:
 *   - common.moneyIn / common.moneyOut — "dinero que entra/sale" is plain and
 *     unambiguous but long for a table column. "Entradas"/"Salidas" is the
 *     shorter alternative if the layout complains.
 *   - nav.bills — "Pagos" to keep the top bar tight. Fuller and clearer would
 *     be "Cuentas por pagar", but "cuentas" already means "books" all over this
 *     app, so it would read as the wrong thing.
 *   - nav.busyDays — "Días fuertes y flojos" is idiomatic for busy/quiet trade
 *     but the register is casual; check it reads right for a US Latino audience.
 *   - nav.tax / reminder page — "apartar impuestos" for "tax set-aside"; there
 *     is no settled everyday Spanish phrase for this, worth a second opinion.
 *   - auth.signIn — used "Iniciar sesión" to pair with common.signOut
 *     ("Cerrar sesión"), even though "Entrar" would be shorter.
 *   - offline.dismiss — "Ahora no" (soft decline) rather than a literal
 *     "Descartar", which sounded harsh on an install prompt.
 *   - entries.searchPlaceholder — used "alquiler" for rent rather than the
 *     Mexican "renta", to stay country-neutral.
 *   - reminder.notificationTitle — "Today's takings" → "Las ventas de hoy",
 *     which assumes the user sells something. Fine for market traders and
 *     cafés, slightly off for a cleaner billing by the hour.
 *
 * Billing terms fixed in this pass (the `billing` section):
 *   billing → "facturación"      plan → "plan" (Free / Pro left in English,
 *   they are the product's own names)      checkout → "pago"
 *   card → "tarjeta"             charge (verb) → "cobrar"
 *   free trial → "prueba gratis" receipt (payment) → "recibo"
 *   your books → "tus cuentas" (matches the rest of the file)
 *
 * Billing keys a reviewer should check hardest:
 *   - billing.trialDisclosure_one/_other — the legally load-bearing sentence.
 *     It must keep all three facts: the price, the exact date of the first
 *     charge, and that cancelling before then costs nothing. Do not shorten.
 *   - billing.genericError / billing.cancelledBody — both promise that no
 *     money moved ("No se cobró nada", "No pagaste nada"). If either reads as
 *     ambiguous about whether a charge happened, it is wrong.
 *   - billing.statusPastDue "Pago vencido" vs invoices.overdue "Vencidas" —
 *     one is money the user owes us, the other money a customer owes them.
 *     Confirm the two don't read as the same thing.
 *   - billing.renewsLabel "Se renueva" as a two-word metric label; check it
 *     doesn't wrap badly next to a long date.
 *
 * Terms fixed in the tools / help / landing / export / onboarding / lock pass:
 *   tools            → "Herramientas"      household → "hogar"
 *   cash drawer      → "caja" (as nav.drawer); to balance → "cuadrar", and
 *                      tools.square is the badge "Cuadra" on both the drawer
 *                      count and a household member who owes nothing
 *   starting float   → "fondo inicial"     item / product → "producto"
 *   settle up        → "quedar a mano" / "saldar"
 *   bills            → "pagos" (as nav.bills), recurring bill → "gasto que se
 *                      repite" (as month.recurringTitle)
 *   app lock         → "bloqueo"; PIN stays "PIN"
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
 *     Spanish example would teach syntax the app can't read.
 *
 * Worth a reviewer's eye in this pass:
 *   - dashboard.quickAddBlurb and dashboard.quickAddPlaceholder were translated
 *     in an earlier pass ("gasté 20 en insumos"), which contradicts the English
 *     examples kept in `help` above. One of the two is wrong — most likely the
 *     dashboard ones, since the parser can't read them. Left as found rather
 *     than changed silently.
 *   - month.taxHint has the same problem: it says “impuestos” where the matcher
 *     wants “tax”. help.taxNote1 now says “tax”; the two should agree.
 *   - help.paletteStep2 uses “efd” as the initials example for "En qué se fue
 *     el dinero" — the palette does a loose subsequence match, so it works, but
 *     it is worth someone typing it once to confirm.
 *   - tools.householdOwner "dueño" is a lower-case badge next to a name; check
 *     it doesn't read as ownership of the money rather than of the household.
 *   - landing.previewBillRent "Alquiler del puesto" — a market stall pitch fee.
 *     "alquiler" over "renta" to stay country-neutral, as elsewhere in the file.
 */
export const es: PartialDictionary = {
  common: {
    save: "Guardar",
    saving: "Guardando…",
    cancel: "Cancelar",
    delete: "Eliminar",
    deleting: "Eliminando…",
    edit: "Editar",
    close: "Cerrar",
    back: "Atrás",
    add: "Agregar",
    today: "Hoy",
    yesterday: "Ayer",
    loading: "Cargando…",
    search: "Buscar…",
    searchLong: "Busca o ve a una página",
    viewAll: "Ver todo",
    showEverything: "Mostrar todo",
    noMatch: "No hay nada que coincida.",
    tryAgain: "Intenta de nuevo",
    optional: "Opcional",
    date: "Fecha",
    amount: "Monto",
    category: "Categoría",
    moneyIn: "Dinero que entra",
    moneyOut: "Dinero que sale",
    net: "Neto",
    profit: "Ganancia",
    loss: "Pérdida",
    signOut: "Cerrar sesión",
    keepIt: "Conservar",
    moreActions: "Más acciones",
    send: "Enviar",
    language: "Idioma",
    changeLanguage: "Cambiar idioma",
  },

  nav: {
    today: "Hoy",
    thisMonth: "Este mes",
    invoices: "Facturas",
    tools: "Herramientas",
    export: "Exportar",
    help: "Ayuda",
    overview: "Resumen",
    addEntry: "Nuevo registro",
    findEntry: "Buscar registro",
    streaks: "Tus rachas",
    ask: "Pregunta sobre tu dinero",
    whereMoneyWent: "En qué se fue el dinero",
    dayByDay: "Día por día",
    yourWeek: "Tu semana",
    canYouCover: "¿Te alcanza?",
    busyDays: "Días fuertes y flojos",
    budgets: "Presupuestos",
    goals: "Metas de ahorro",
    bills: "Pagos",
    allInvoices: "Todas las facturas",
    newInvoice: "Nueva factura",
    household: "Hogar",
    margins: "Margen por producto",
    drawer: "Caja",
    tax: "Apartar impuestos",
    reminder: "Recordatorio",
    lock: "Bloquear app",
    billing: "Facturación",
    yourPlan: "Tu plan",
    pickDates: "Elegir fechas",
    downloadCsv: "Descargar CSV",
    downloadPdf: "Descargar PDF",
    allTopics: "Todos los temas",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    goTo: "Ir a {section}",
    switchToDark: "Modo oscuro",
    switchToLight: "Modo claro",
    home: "Inicio de SimpleBooks",
  },

  auth: {
    welcomeBack: "Qué bueno verte de nuevo",
    createAccount: "Crea tu cuenta",
    signInBlurb: "Inicia sesión y sigue donde te quedaste.",
    signUpBlurb: "Toma unos veinte segundos. Tus cuentas quedan privadas, solo para ti.",
    email: "Correo",
    emailPlaceholder: "tu@tunegocio.com",
    password: "Contraseña",
    passwordPlaceholderNew: "Elige una contraseña",
    passwordPlaceholderExisting: "Tu contraseña",
    passwordHint: "Al menos 6 caracteres.",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión…",
    creating: "Creando tu cuenta…",
    newHere: "¿Primera vez en SimpleBooks?",
    haveAccount: "¿Ya tienes cuenta?",
    createOne: "Crear una cuenta",
    privateNote: "Tus registros son privados, solo de tu cuenta.",
    freeNote: "Gratis 7 días. Se pide tarjeta al empezar; cancela antes y no pagas nada.",
    heroTitle: "Tus cuentas al día en lo que atiendes a un cliente.",
    sellingFast: "Anótalo en segundos",
    sellingFastBody: "Escribe “gasté 20 en costco en insumos” y se llena solo.",
    sellingOffline: "Funciona sin señal",
    sellingOfflineBody:
      "Sigue anotando en un sótano o en el mercado. Se sincroniza cuando vuelves a tener señal.",
    sellingPrivate: "Privado, solo tuyo",
    sellingPrivateBody: "El acceso lo controla la base de datos, no solo la app.",
    errEmailMissing: "Escribe tu correo.",
    errEmailInvalid: "Eso no parece un correo.",
    errPasswordMissing: "Escribe tu contraseña.",
    errPasswordShort: "Usa al menos 6 caracteres.",
    errGeneric: "Algo salió mal. Vuelve a intentarlo.",
    confirmEmail: "Ya casi — revisa tu correo para confirmar la cuenta y luego inicia sesión.",
  },

  dashboard: {
    eyebrow: "Hoy",
    blurb: "Todo lo que has anotado hasta ahora, y lo que vale la pena mirar.",
    position: "Cómo vas hoy",
    todaysNet: "Neto de hoy",
    nothingToday: "Hoy todavía no has anotado nada.",
    aheadToday: "Vas ganando en el día.",
    behindToday: "Vas perdiendo en el día.",
    evenToday: "Por ahora hoy no ganas ni pierdes.",
    allTime: "Desde el inicio",
    allTimeIn: "{amount} entró",
    allTimeOut: "{amount} salió",
    allTimeNet: "{amount} neto",
    safeToSpend: "Puedes gastar hoy",
    nothingLeft: "Hoy no queda nada para gastar",
    quickAdd: "Anotar rápido",
    quickAddBlurb: "Solo escríbelo — “gasté 20 en costco en comida” o “gané 300”.",
    quickAddVoice: "O toca el micrófono y dilo.",
    quickAddPlaceholder: "gasté 20 en insumos",
    quickAddInputLabel: "Anotar un registro rápido",
    listening: "Escuchando…",
    listeningHint: "Escuchando — di algo como “gasté veinte dólares en el almuerzo”.",
    startListening: "Agregar por voz",
    stopListening: "Dejar de escuchar",
    readingThatAs: "Lo estoy leyendo así",
    noCategory: "Sin categoría",
    atMerchant: "en {merchant}",
    onDate: "el {date}",
    addIt: "Agregar",
    savedOnDevice: "Guardado en este dispositivo — {summary}",
    recentEntries: "Registros recientes",
    recentBlurb: "Los más nuevos primero. Toca el menú de una fila para cambiarla o quitarla.",
    nothingLogged: "Todavía no hay nada anotado",
    nothingLoggedBlurb: "Anota lo que entró y lo que salió, y aparece aquí al instante.",
    logFirst: "Anota tu primer registro",
    loadFailed: "No se pudieron cargar tus registros. {message}",
    moreEntries: "{count} más — ver todo",
    billsDueSoon_one: "Un pago vence pronto",
    billsDueSoon_other: "{count} pagos vencen pronto",
    billsDueSoonBlurb: "Conviene cubrirlo antes de que te agarre desprevenido.",
    streakLogging: "Racha de anotar",
    streakProfitable: "Racha con ganancia",
    streakNoSpend: "Racha sin gastar",
    streakDays_one: "{count} día",
    streakDays_other: "{count} días",
    streakBest: "Mejor: {count}",
    streakYourBest: "Tu mejor marca",
    streakNice_one: "Bien — {count} día seguido con tus cuentas al día.",
    streakNice_other: "Bien — {count} días seguidos con tus cuentas al día.",
    streakStart: "Anota algo cada día y tu racha empieza a crecer.",
    aheadDaysThisMonth:
      "Este mes saliste ganando en {profitable} de los {active} días que anotaste.",
    askBlurb: "Pregunta por tus números en palabras simples — nada de lenguaje contable.",
    askPlaceholder: "Haz una pregunta…",
    askThinking: "Revisando tus cuentas…",
    askFailed: "Perdón, algo salió mal: {message}",
    askFailedUnknown: "Perdón, algo salió mal. Inténtalo de nuevo.",
    askMostSpent: "¿En qué gasté más?",
    askThisWeek: "¿Cómo me fue esta semana?",
    askMakingMoney: "¿Estoy ganando dinero?",
    askCanIAfford: "¿Me alcanza para $200?",
    askHowMuchSpent: "¿Cuánto he gastado?",
    uncategorised: "Sin categoría",
    hasReceipt: "Tiene recibo",
    viewReceipt: "Ver recibo",
    addReceipt: "Agregar un recibo",
    shareWithHousehold: "Compartir con el hogar",
    makePrivate: "Volver a hacerlo privado",
    splitEvenly: "Dividir este en partes iguales",
    deleteEntry: "Eliminar registro",
    deleteConfirm: "¿Eliminar este registro? No se puede deshacer.",
    actionsFor: "Acciones para {name}",
    shared: "Compartido",
    split: "Dividido",
  },

  entryForm: {
    title: "Registro de hoy",
    blurb: "Anota lo que entró y lo que salió.",
    fullEntry: "El registro completo",
    fullEntryBlurb: "Cuando necesitas la fecha, un recibo o con quién se comparte.",
    moneyMade: "Dinero que ganaste",
    moneySpent: "Dinero que gastaste",
    whatFor: "Para qué fue",
    whatForPlaceholder: "Insumos",
    whatForExamples: "Insumos, Alquiler, Mercadería…",
    where: "Dónde",
    wherePlaceholder: "Costco",
    whereExamples: "Costco, la gasolinera, la ferretería…",
    paidWith: "Cómo pagaste",
    cash: "Efectivo",
    card: "Tarjeta",
    other: "Otro",
    receiptPhoto: "Foto del recibo",
    receiptPrivateHint: "Opcional — solo tú puedes verlo.",
    receiptAttaching: "Adjuntando “{name}” — solo tú puedes verlo.",
    receiptReading: "Leyendo tu recibo…",
    whoCanSee: "Quién puede verlo",
    justMe: "Solo yo",
    shareIt: "Compartir",
    splitIt: "Dividir",
    shareNoneBlurb: "Solo tú vas a verlo.",
    shareVisibleBlurb: "{household} puede verlo, pero nadie le debe nada a nadie.",
    shareSplitBlurb: "{household} puede verlo y se divide en partes iguales.",
    staysPrivate: "Nada sale de tus cuentas.",
    saveEntry: "Guardar registro",
    saved: "Guardado.",
    errAmounts: "Escribe montos válidos.",
    errEmpty: "Agrega dinero ganado o dinero gastado antes de guardar.",
    receiptFilled: "Lo llenamos con los datos de tu recibo — revísalo bien antes de guardar.",
    receiptUnreadable:
      "No se pudieron leer los datos de ese recibo — no importa, llénalo tú mismo.",
    receiptOffline:
      "Guardado en este dispositivo. La foto no se pudo adjuntar sin conexión — agrégala desde el registro cuando vuelvas a estar en línea.",
  },

  entries: {
    eyebrow: "Tus registros",
    title: "Buscar un registro",
    blurb: "Busca en todo lo que has anotado y toca uno para corregirlo.",
    searchPlaceholder: "Prueba “costco”, “alquiler” o 42.50",
    searchLabel: "Busca en tus registros",
    clearSearch: "Borrar la búsqueda",
    everything: "Todo",
    moreFilters: "Más filtros",
    fewerFilters: "Menos filtros",
    narrowDown: "Acota la búsqueda",
    allOptional: "Todos los filtros son opcionales.",
    clearAll: "Limpiar todo",
    anyCategory: "Cualquier categoría",
    anyWay: "Cualquier forma de pago",
    fromDate: "Desde",
    toDate: "Hasta",
    amountAtLeast: "Monto mínimo",
    amountAtMost: "Monto máximo",
    any: "cualquiera",
    order: "Orden",
    newestFirst: "Los más nuevos primero",
    oldestFirst: "Los más viejos primero",
    biggestFirst: "El monto más alto primero",
    smallestFirst: "El monto más bajo primero",
    editing: "Editando este registro",
    saveChanges: "Guardar cambios",
    errNeedsAmount:
      "Un registro necesita dinero que entra o dinero que sale. Usa Eliminar para quitarlo.",
    count_one: "{count} registro",
    count_other: "{count} registros",
    directionLabel: "Tipo de movimiento",
    nothingLoggedBlurb:
      "En cuanto empieces a anotar, todo lo que registres aparece aquí para buscarlo y corregirlo.",
    noMatchHint:
      "Prueba con menos palabras, con un rango de fechas más amplio, o empieza de nuevo mostrando todo.",
  },

  month: {
    previous: "Mes anterior",
    next: "Mes siguiente",
    profitThisMonth: "Ganancia de este mes",
    lossThisMonth: "Pérdida de este mes",
    breakEvenThisMonth: "Este mes ni ganas ni pierdes",
    budgetOver: "{category} pasó el presupuesto",
    budgetAtPercent: "{category} va en el {percent}% del presupuesto",
    nothingSpent: "Todavía no hay gastos este mes",
    nothingSpentBlurb:
      "Cuando anotes gastos, aquí ves exactamente a qué categorías se fue tu dinero, de mayor a menor.",
    whereMoneyWentBlurb: "Todos los gastos de este mes, de mayor a menor.",
    dayByDayBlurb:
      "Cada barra es el neto de ese día. Las barras sobre la línea son días en que saliste ganando; las de abajo, días en que no.",
    dayNumber: "Día {day}",

    weekTitle: "Tu semana en palabras simples",
    weekRange: "{from} a {to}",
    loadingWeek: "Leyendo tu semana…",

    outlookTitle: "¿Te alcanza para lo que viene?",
    outlookBlurb_one:
      "Próximos {days} días, según el {count} día que llevas anotado y los pagos que tienes cargados.",
    outlookBlurb_other:
      "Próximos {days} días, según los últimos {count} días que llevas anotados y los pagos que tienes cargados.",
    loadingOutlook: "Calculando lo que viene…",
    whereYouAre: "Dónde estás",
    inDays_one: "En {count} día",
    inDays_other: "En {count} días",
    shortfallTitle: "Ojo — podrías quedarte corto cerca del {date}.",
    staysPositive: "Te mantienes en verde todo el tiempo.",
    lowestPoint: "El punto más bajo es {amount} el {date}.",
    typicalDay: "Día típico: entran {moneyIn}, salen {moneyOut}.",
    billsComingUp: "Pagos que vienen",
    roughGuess_one:
      "Esto es un cálculo aproximado — solo llevas {count} día anotado. Se vuelve más exacto a medida que sigues.",
    roughGuess_other:
      "Esto es un cálculo aproximado — solo llevas {count} días anotados. Se vuelve más exacto a medida que sigues.",

    taxNoRateTools:
      "Pon un porcentaje en la pestaña Herramientas y llevo la cuenta de lo que conviene apartar para impuestos.",
    taxNoRateBelow:
      "Pon un porcentaje aquí abajo y llevo la cuenta de lo que conviene apartar para impuestos.",
    taxHoldingBack: "Apartando el {percent}% de los {amount} que recibiste en {period}.",
    shouldSetAside: "Deberías apartar",
    alreadyPaid: "Ya pagado",
    stillToSetAside: "Falta apartar",
    taxHint:
      "Anota los pagos de impuestos con “impuestos” en la categoría y se cuentan aquí. No es asesoría fiscal — confirma tu tasa con un contador.",
    loadingTax: "Sumando lo que apartas para impuestos…",

    busyDaysBlurb: "Promedio de dinero que entra por día de la semana.",
    busyDaysNotEnough:
      "Sigue anotando unas semanas más y te muestro qué días de la semana son los más fuertes y los más flojos.",
    loadingBusyDays: "Mirando tu semana…",
    bestAndQuiet: "{best} es tu mejor día, y {worst} el más flojo.",
    bestAndQuietBoth:
      "{best} es tu mejor día ({bestPercent}% por encima de tu promedio), y {worst} el más flojo ({worstPercent}% por debajo).",
    bestAndQuietBestOnly:
      "{best} es tu mejor día ({bestPercent}% por encima de tu promedio), y {worst} el más flojo.",
    bestAndQuietWorstOnly:
      "{best} es tu mejor día, y {worst} el más flojo ({worstPercent}% por debajo).",

    whatsDue: "Qué hay que pagar",
    loadingBills: "Cargando tus pagos",
    billsTotal: "{amount} en pagos durante los próximos 45 días.",
    thisWeek: "Esta semana",
    nextThreeWeeks: "Próximas 3 semanas",
    later: "Más adelante",
    dueToday: "hoy",
    dueTomorrow: "mañana",
    dueInDays_one: "en {count} día",
    dueInDays_other: "en {count} días",

    detectedTitle: "Parece un pago fijo",
    detectedBlurb:
      "Vi que estos se repiten en tus registros. Márcalos y aparecen en lo que viene y en los avisos de pago.",
    maybe: "quizá",
    weekly: "cada semana",
    monthly: "cada mes",
    detectedDetail_one: "{amount} {frequency} · visto {count} vez · el próximo cerca del {date}",
    detectedDetail_other:
      "{amount} {frequency} · visto {count} veces · el próximo cerca del {date}",
    dismissDetected: "Descartar {name}",
    trackBill: "Seguir este pago",

    goalsBlurb: "Algo para lo que estás juntando dinero — mira qué tan cerca estás.",
    reached: "Cumplida",
    goalToGo: "faltan {amount}",
    goalReached: "Meta cumplida",
    goalByDate: "para el {date}",
    removeGoal: "Quitar la meta {name}",
    noGoals: "Todavía no hay metas.",
    goalNamePlaceholder: "Horno nuevo",
    goalTarget: "Monto de la meta",
    goalSaved: "Juntado hasta ahora",
    goalTargetDate: "Fecha límite (opcional)",
    saveGoal: "Guardar meta",

    budgetsTitle: "Límites de presupuesto",
    budgetsBlurb: "Pon un tope mensual por categoría y mira las barras.",
    over: "Pasado",
    nearLimit: "Cerca",
    removeBudget: "Quitar el presupuesto de {name}",
    noBudgets: "Todavía no hay presupuestos.",
    monthlyLimit: "Tope mensual",
    saveBudget: "Guardar presupuesto",

    recurringTitle: "Gastos que se repiten",
    recurringBlurb: "Los pagos que se repiten se anotan solos.",
    cancelled: "Cancelado",
    recurringDetail: "{amount} · {frequency} · desde el {date}",
    editRule: "Editar {name}",
    cancelRule: "Cancelar {name}",
    deleteRule: "Eliminar {name}",
    noRecurring: "Todavía no hay nada que se repita.",
    recurringPlaceholder: "Alquiler",
    howOften: "¿Cada cuánto?",
    everyWeek: "Cada semana",
    everyMonth: "Cada mes",
    starting: "Desde",
    updateRecurring: "Actualizar el gasto que se repite",
    addRecurring: "Agregar un gasto que se repite",
  },

  invoices: {
    eyebrow: "Facturas",
    title: "Dinero que te deben",
    blurb:
      "Factúrale a un cliente y márcala pagada cuando llegue el dinero — ahí es cuando entra a tus cuentas.",
    newInvoice: "Nueva factura",
    outstanding: "Por cobrar",
    overdue: "Vencidas",
    paidThisMonth: "Pagadas este mes",
    awaitingPayment_one: "{count} factura esperando pago",
    awaitingPayment_other: "{count} facturas esperando pago",
    pastDue: "{count} ya vencidas",
    settled: "{count} ya pagadas",
    all: "Todas",
    drafts: "Borradores",
    paid: "Pagadas",
    searchPlaceholder: "Cliente o número",
    searchLabel: "Buscar facturas",
    invoice: "Factura",
    customer: "Cliente",
    due: "Vence",
    status: "Estado",
    daysLate_one: "{count} día de retraso",
    daysLate_other: "{count} días de retraso",
    pastDueBy_one: "{count} día pasado de la fecha de pago",
    pastDueBy_other: "{count} días pasados de la fecha de pago",
    none: "Todavía no hay facturas",
    noneBlurb:
      "Crea una para un cliente, mándasela y márcala pagada cuando llegue el dinero. Solo entonces cuenta como ingreso.",
    createFirst: "Crea tu primera factura",
    notAvailable: "Las facturas todavía no están disponibles",
    statusDraft: "Borrador",
    statusSent: "Esperando pago",
    statusOverdue: "Vencida",
    statusPaid: "Pagada",
    statusVoid: "Cancelada",
    markSent: "Marcar como enviada",
    markPaid: "Marcar como pagada",
    markUnpaid: "Marcar como no pagada",
    recordPayment: "Registrar el pago",
    moneyArrivedOn: "Fecha en que llegó el dinero",
    cancelInvoice: "Cancelar factura",
    deleteDraft: "Eliminar borrador",
    printOrPdf: "Imprimir o guardar como PDF",
    paidOn: "Pagada el {date}",
    willRecord:
      "Al marcarla pagada, {amount} entra a tus cuentas como ingreso en la fecha que elijas. Hasta entonces no cuenta en tus totales.",
    confirmUnpaid:
      "¿Marcarla como no pagada? Se quitará de tus cuentas el ingreso que había creado.",
    confirmVoid: "¿Cancelar esta factura? Queda en el historial, pero marcada como anulada.",
    confirmDeleteDraft: "¿Eliminar este borrador? No se puede deshacer.",
    notFound: "Esa factura no está aquí",
    notFoundBlurb: "Puede que la hayan eliminado.",
    backToInvoices: "Volver a facturas",
    allInvoices: "Todas las facturas",
    createTitle: "Crear una factura",
    editTitle: "Editar esta factura",
    createBlurb: "Empieza como borrador, así que nada es definitivo hasta que la mandes.",
    editBlurb:
      "Los cambios se guardan solo en la factura. Nada entra a tus cuentas hasta que la marques pagada.",
    whoFor: "Para quién es",
    customerName: "Nombre del cliente",
    customerNamePlaceholder: "Café Acme",
    customerEmail: "Correo",
    customerEmailHint: "Opcional — para tus propios registros.",
    customerEmailPlaceholder: "facturacion@acme.com",
    issueDate: "Fecha de emisión",
    dueDate: "Fecha de pago",
    dueDateHint: "Dos semanas es lo más común.",
    whatCharging: "Qué vas a cobrar",
    whatChargingBlurb: "Una línea por cosa. El total se calcula solo.",
    description: "Descripción",
    descriptionPlaceholder: "Seis horas de trabajo de diseño",
    quantity: "Cant.",
    priceEach: "Precio por unidad",
    lineTotal: "Total de la línea {amount}",
    addLine: "Agregar otra línea",
    removeLine: "Quitar la línea {number}",
    total: "Total",
    notes: "Notas",
    notesBlurb: "Se ven en la factura. Formas de pago, un agradecimiento.",
    notesPlaceholder: "Pago por transferencia dentro de 14 días. ¡Gracias!",
    createButton: "Crear factura",
    billedTo: "Facturado a",
    dates: "Fechas",
    issued: "Emitida el {date}",
    dueOn: "Vence el {date}",
    amountDue: "Monto a pagar",
    errCustomer: "¿Para quién es esta factura?",
    errNameLong: "Ese nombre es demasiado largo.",
    errEmail: "Eso no parece un correo.",
    errDate: "Elige una fecha.",
    errDueBeforeIssue: "La fecha de pago no puede ser antes de la de emisión.",
    errNoLines: "Agrega al menos un artículo.",
    errLineDescription: "Describe para qué es esto.",
    errLineQuantity: "La cantidad tiene que ser mayor que cero.",
    errLinePrice: "El precio no puede ser negativo.",
  },

  billing: {
    eyebrow: "Facturación",
    title: "Tu plan",
    blurb: "Por lo que estás pagando y todo lo que le puedes cambiar.",
    loadingPlan: "Cargando tu plan.",
    loadFailed: "No se pudo cargar tu plan",
    portalFailed: "No se pudo abrir la facturación",
    checkoutFailed: "No se pudo iniciar el pago",
    genericError: "Algo falló de nuestro lado. No se cobró nada.",
    paymentFailed: "Un pago no se pudo cobrar",
    paymentFailedBody:
      "Tu último pago fue rechazado. No se apagó nada — Stripe va a seguir intentando por unos días, y todo lo que pagas sigue funcionando mientras tanto.",
    paymentFailedFix:
      "Actualizar la tarjeta casi siempre lo arregla, y el cobro pasa en el siguiente intento.",
    updateCard: "Actualiza tu tarjeta",
    statusActive: "Activo",
    statusTrialing: "Prueba",
    statusPastDue: "Pago vencido",
    statusCanceled: "Cancelado",
    statusIncomplete: "Sin terminar",
    statusExpired: "Vencido",
    statusUnpaid: "Sin pagar",
    statusPaused: "En pausa",
    proPanelTitle: "Plan SimpleBooks Pro",
    proUnlocked: "En esta cuenta está desbloqueado todo lo de la app.",
    planLabel: "Tu plan",
    pricePerMonth: "{price} al mes",
    renewsLabel: "Se renueva",
    proEndsLabel: "Pro termina",
    chargedAgainHint: "Se te va a cobrar de nuevo en esta fecha.",
    lastPaidDayHint: "El último día del mes que ya pagaste.",
    noRenewalDate: "Stripe todavía no ha devuelto una fecha de renovación.",
    manageBilling: "Administrar facturación",
    manageBillingHint: "Cambia tu tarjeta, mira recibos o cancela.",
    proEndingTitle: "Pro está por terminar",
    proEndsOn:
      "Pro sigue activo hasta el {date}. Después, esta cuenta vuelve al plan Free y no se te vuelve a cobrar. Nada de lo que anotaste se borra.",
    proEndsAfterPaidMonth:
      "Pro sigue activo hasta que se acabe el mes que ya pagaste. Después, esta cuenta vuelve al plan Free y no se te vuelve a cobrar. Nada de lo que anotaste se borra.",
    changedYourMind: "¿Cambiaste de opinión? Entra a administrar facturación y vuelve a activarlo.",
    comparePlans: "Compara los planes",
    currentPlanBadge: "Tu plan",
    everything: "Todo",
    openingStripe: "Abriendo Stripe…",
    onThisPlan: "Esto es lo que tienes hoy.",
    stripeNote:
      "El pago lo maneja Stripe en su propia página — los datos de tu tarjeta nunca llegan a SimpleBooks. Puedes cancelar desde aquí cuando quieras y te queda Pro hasta que se acabe el mes que ya pagaste.",
    successTitle: "Ya tienes Pro",
    successBody:
      "El pago se realizó y en esta cuenta está desbloqueado todo. Stripe te va a mandar un recibo a tu correo.",
    goToBooks: "Ir a tus cuentas",
    seeYourPlan: "Ver tu plan",
    confirming: "Confirmando",
    confirmingTitle: "Confirmando tu pago",
    confirmingBody:
      "Ya volviste de Stripe. En vez de tomar ese regreso como prueba, esperamos a que Stripe mismo confirme el pago antes de pasar esta cuenta a Pro — normalmente tarda unos segundos.",
    canLeavePage: "Puedes salir de esta página. Nada depende de que siga abierta.",
    notConfirmedTitle: "Esto todavía se está confirmando",
    notConfirmedBody:
      "Puede que tu pago siga en proceso. La confirmación suele tardar segundos, pero puede tardar un minuto o dos, y va a terminar tengas o no esta página abierta.",
    notConfirmedReassure:
      "De cualquier forma no se pierde nada: si el pago salió bien, Pro se activa solo. Tu página de facturación siempre muestra cómo están las cosas de verdad.",
    checkFailed: "La última revisión no obtuvo respuesta",
    checkAgain: "Revisar de nuevo",
    goToBilling: "Ir a facturación",
    contactSupport:
      "Si Pro sigue sin aparecer en unos minutos, escríbele a soporte y menciona la referencia de abajo.",
    reference: "Referencia: {reference}",
    cancelledTitle: "Cerraste el pago",
    cancelledBody:
      "No pagaste nada y nada cambió. Tus cuentas están tal como las dejaste, y el plan Free sigue igual que antes.",
    cancelledReassure:
      "Pro está ahí cuando lo quieras — no hay prisa ni castigo por cerrar la página.",
    seePlansAgain: "Ver los planes otra vez",
    backToBooks: "Volver a tus cuentas",
    checkingPlan: "Revisando tu plan.",
    featureIsPro: "{feature} es parte de Pro",
    trialUsed:
      "Ya usaste tus días gratis. Pro cuesta {price} al mes y puedes cancelar cuando quieras.",
    tryFree_one: "Pruébalo gratis {count} día junto con todo lo demás de Pro.",
    tryFree_other: "Pruébalo gratis {count} días junto con todo lo demás de Pro.",
    startTrial_one: "Empezar mi {count} día gratis",
    startTrial_other: "Empezar mis {count} días gratis",
    getPro: "Obtener Pro — {price} al mes",
    trialDisclosure_one:
      "Gratis por {count} día. El {date} se cobran {price} a tu tarjeta, y después {price} cada mes. Cancela en cualquier momento antes de esa fecha y no pagas nada.",
    trialDisclosure_other:
      "Gratis por {count} días. El {date} se cobran {price} a tu tarjeta, y después {price} cada mes. Cancela en cualquier momento antes de esa fecha y no pagas nada.",
    recordsStay: "Lo que ya anotaste se queda donde está, en cualquier plan.",
    exportsAlwaysWork: "Las exportaciones siempre funcionan.",
    trialEndsToday: "Tu prueba gratis termina hoy",
    trialLastDay: "Último día de tu prueba gratis",
    trialDaysLeft_one: "Te queda {count} día de prueba gratis",
    trialDaysLeft_other: "Te quedan {count} días de prueba gratis",
    cardChargedOn: "El {date} se cobran {price} a tu tarjeta.",
    thenPricePerMonth: "Después, {price} al mes.",
    manageOrCancel: "Administrar o cancelar",
    hideUntilTomorrow: "Ocultar hasta mañana",
    welcomeTitle: "¿Quieres probarlo todo?",
    welcomeBody_one:
      "Prueba SimpleBooks Pro gratis por {count} día. Tienes respuestas con IA sobre tus números, escaneo de recibos, facturas sin límite, presupuestos, exportaciones, sincronización sin conexión y todos los idiomas.",
    welcomeBody_other:
      "Prueba SimpleBooks Pro gratis por {count} días. Tienes respuestas con IA sobre tus números, escaneo de recibos, facturas sin límite, presupuestos, exportaciones, sincronización sin conexión y todos los idiomas.",
    welcomeFinePrint_one:
      "Gratis por {count} día, y después {price} al mes. Cancela cuando quieras.",
    welcomeFinePrint_other:
      "Gratis por {count} días, y después {price} al mes. Cancela cuando quieras.",
    welcomeStartTrial: "Empezar mi prueba de Pro de {count} días",
    welcomeContinueFree: "No, gracias, seguir con Free",
  },

  reminder: {
    eyebrow: "Herramientas",
    title: "Recordatorio diario",
    pageBlurb:
      "Cada número de esta app sale de los registros que anotas. Un empujoncito a la hora correcta es la diferencia entre un hábito y una buena intención.",
    cardBlurb: "Un empujoncito para anotar el día y que el hábito se te quede.",
    onAt: "Activo a las {time}",
    off: "Apagado",
    howItWorks:
      "Una vez que pasa la hora que elijas, la app muestra una notificación la próxima vez que esté abierta o corriendo en segundo plano. No va a sonar en un teléfono que no abrió la app en todo el día — no hay ningún servidor mandándolas, que es también la razón por la que no cuestan nada y nadie más ve tus datos.",
    remindMeAt: "Recuérdame a las",
    turnOn: "Activar recordatorios",
    turnOff: "Apagar",
    saveTime: "Guardar la hora",
    sendTest: "Mandar una notificación de prueba ahora",
    installFirst: "Primero agrégala a tu pantalla de inicio",
    installFirstBody:
      "El iPhone solo permite notificaciones en apps agregadas a la pantalla de inicio. Toca Compartir, luego Agregar a inicio, ábrela desde el nuevo icono y regresa aquí.",
    blocked: "Las notificaciones están bloqueadas",
    blockedBody:
      "Tu navegador está bloqueando las notificaciones de este sitio. Vas a tener que permitirlas en la configuración del navegador para que esto funcione.",
    unsupported: "Este navegador no puede mostrar notificaciones",
    unsupportedBody:
      "Todo lo demás sigue funcionando — solo que aquí no te va a llegar el recordatorio.",
    errPickTime: "Primero elige una hora.",
    errDenied:
      "Tu navegador está bloqueando las notificaciones de este sitio. Permítelas en la configuración del navegador y vuelve a intentarlo.",
    errNotAllowed:
      "No se permitieron las notificaciones, así que el recordatorio no se puede mostrar.",
    notificationTitle: "Las ventas de hoy",
    notificationBody:
      "Un minuto ahora te ahorra una noche después. Anota lo que entró y lo que salió.",
  },

  offline: {
    noConnection: "Sin conexión",
    keepLogging: "Puedes seguir anotando — los registros se guardan en este dispositivo.",
    sending: "Enviando {count}",
    waitingToSend: "Esperando para enviar {count}",
    waiting_one: "{count} registro en espera",
    waiting_other: "{count} registros en espera",
    wouldntSave_one: "{count} registro no se pudo guardar",
    wouldntSave_other: "{count} registros no se pudieron guardar",
    showThem: "Mostrarlos",
    hideThem: "Ocultarlos",
    sendNow: "Enviar ahora",
    tryTheseAgain: "Volver a intentar con estos",
    discardEntry: "Descartar este registro",
    refusedTimes:
      "Estos se rechazaron {count} veces. Normalmente eso quiere decir que la app se actualizó o que se cerró tu sesión — vuelve a intentarlo, y descarta uno solo si ya lo anotaste de otra forma.",
    installTitle: "Pon SimpleBooks en tu pantalla de inicio",
    installBody:
      "Se abre a pantalla completa con su propio icono y sigue funcionando cuando no tienes señal.",
    installIos: "Toca el botón Compartir en Safari y luego Agregar a inicio.",
    install: "Instalar",
    dismiss: "Ahora no",
    signOutPending:
      "Todavía no se han enviado {count} registros. Se quedan en este dispositivo y se van a enviar la próxima vez que inicies sesión aquí. ¿Cerrar sesión de todos modos?",
  },

  palette: {
    placeholder: "Ve a donde quieras o escribe un registro como “gasté 20 en insumos”",
    inputLabel: "Buscar o anotar un registro",
    logThis: "Anotar este registro",
    logging: "Anotando…",
    logged: "Anotado: {summary}",
    queued: "Guardado en este dispositivo, se enviará después: {summary}",
    moveHint: "↑↓ para moverte",
    pickHint: "↵ para elegir",
    typeHint: "Escribe un monto para anotarlo al instante",
    close: "Cerrar la paleta de comandos",
    dialogLabel: "Paleta de comandos",
    pageExportRecords: "Exportar tus registros",
    pageHelp: "Ayuda — cómo funciona todo",
    pageHelpLogging: "Ayuda: anotar dinero",
    pageHelpMonth: "Ayuda: este mes",
    pageHelpTools: "Ayuda: herramientas",
    pageHelpExport: "Ayuda: exportar",
  },

  tools: {
    // --- compartido por todas las páginas de herramientas
    eyebrow: "Herramientas",
    didntWork: "Eso no funcionó",
    copy: "Copiar",
    copied: "Copiado",
    square: "Cuadra",
    // Cada uno es una frase completa: el monto y la palabra que dice hacia dónde
    // fue el dinero no se pueden juntar en el componente.
    amountIn: "{amount} entró",
    amountOut: "{amount} salió",

    // --- hogar compartido: antes de estar en uno
    householdTitle: "Comparte con alguien",
    householdBlurb:
      "Comparte los registros que tú elijas con tu pareja o con quien vives, y repartan los gastos de forma justa. Lo que no compartas queda privado, solo para ti.",
    householdStartHere: "Empieza por aquí",
    householdStartHereBlurb: "Que la otra persona sepa con quién está compartiendo.",
    householdYourName: "Tu nombre",
    householdYourNameHint:
      "Aparece junto a todo lo que compartas, para que cada quien sepa quién es quién.",
    householdYourNamePlaceholder: "Alex",
    householdCreateTitle: "Crea uno nuevo",
    householdCreateBlurb: "Te damos un código para pasárselo a la otra persona.",
    householdNameIt: "Ponle nombre",
    householdNamePlaceholder: "Nuestra casa",
    householdCreating: "Creando…",
    householdCreate: "Crear el hogar",
    householdJoinTitle: "O únete con un código",
    householdJoinBlurb: "Pídeles el código que les aparece en Herramientas.",
    householdInviteCode: "Código de invitación",
    householdCodePlaceholder: "ABC123",
    householdJoining: "Uniéndote…",
    householdJoin: "Unirme al hogar",

    // --- hogar compartido: una vez que ya estás en uno
    householdEyebrow: "Hogar",
    householdJustYou: "Por ahora estás solo tú — pasa el código de abajo para sumar a alguien.",
    householdPeopleSharing_one: "{count} persona compartiendo.",
    householdPeopleSharing_other: "{count} personas compartiendo.",
    householdInviteCodeBlurb: "Se registran y luego escriben esto en Herramientas.",
    householdWhosIn: "Quiénes están",
    householdMemberFallback: "Miembro {id}",
    householdOwner: "dueño",
    householdYourNameTitle: "Tu nombre en este hogar",
    householdShownNextTo: "Aparece junto a lo que compartes",
    householdSaveName: "Guardar el nombre",

    householdEveryoneShared: "Lo que ha compartido cada quien",
    // Dos conteos en una sola frase. El plural sigue al conteo de lo compartido;
    // el caso “ninguno” es su propia frase, no un fragmento intercambiable.
    householdSharedWithSplit_one: "{count} registro compartido, {split} marcado para dividir.",
    householdSharedWithSplit_other: "{count} registros compartidos, {split} marcados para dividir.",
    householdSharedNoSplit_one: "{count} registro compartido, ninguno marcado para dividir.",
    householdSharedNoSplit_other: "{count} registros compartidos, ninguno marcado para dividir.",

    householdSplittingTitle: "Los gastos que están dividiendo",
    householdSplittingBlurb: "Solo los registros marcados para dividir.",
    householdEachShare: "Lo que le toca a cada quien",
    householdTotalToSplit: "Total a dividir",
    householdPaid: "pagó {amount}",
    householdOwed: "le deben {amount}",
    householdOwes: "debe {amount}",
    householdToSquareUp: "Para quedar a mano",
    householdTransfer: "{from} le paga {amount} a {to}",
    householdAllSquare: "Están a mano — nadie le debe nada a nadie.",
    householdNothingToSettle: "No hay nada que saldar",
    householdNothingToSettleBody:
      "No hay nada marcado para dividir, así que nadie le debe nada a nadie. Elige “Dividir” al anotar si quieres repartir un gasto en partes iguales.",
    householdNothingShared: "Todavía no han compartido nada",
    householdNothingSharedBody:
      "Cuando anotes algo, elige “Compartir” para que el hogar lo vea, o “Dividir” para repartirlo en partes iguales.",
    householdLeaveConfirm:
      "¿Salir de este hogar? Todo lo que compartiste vuelve a ser privado, solo tuyo.",
    householdLeaving: "Saliendo…",
    householdLeave: "Salir del hogar",

    // --- lo que de verdad te queda (margen por producto)
    marginsTitle: "Lo que de verdad te queda",
    marginsBlurb:
      "Pon lo que te cuesta un producto y a cuánto lo vendes, y mira la ganancia real de cada venta.",
    marginsYourItems: "Tus productos",
    marginsOverhead: "Tus costos de cada mes andan por {amount}.",
    marginsNoItems: "Todavía no hay productos — agrega el primero aquí abajo.",
    marginsCostSell: "Te cuesta {cost} · lo vendes a {price}",
    marginsRemoveItem: "Quitar {name}",
    marginsYouKeep: "Te queda, por unidad",
    marginsMargin: "Margen",
    marginsPercent: "{percent}%",
    marginsLosing: "Lo estás vendiendo por menos de lo que te cuesta.",
    marginsUnitsToCover_one:
      "Vende como {count} al mes para cubrir los {amount} de costos que sueles tener.",
    marginsUnitsToCover_other:
      "Vende como {count} al mes para cubrir los {amount} de costos que sueles tener.",
    marginsAddItem: "Agregar un producto",
    marginsItem: "Producto",
    marginsItemPlaceholder: "Vela",
    marginsCostsYou: "Te cuesta",
    marginsSellFor: "Lo vendes a",
    marginsSaveItem: "Guardar el producto",

    // --- revisión de caja
    drawerTitle: "Revisión de caja",
    drawerBlurb: "Cuenta la caja al cerrar el día y mira si cuadra con lo que anotaste.",
    drawerTonightsCount: "El conteo de hoy",
    drawerDay: "Día",
    drawerStartingFloat: "Fondo inicial",
    drawerCounted: "Lo que contaste en la caja",
    drawerShouldBe: "Lo que debería haber en la caja",
    // Es una sola suma, así que va en una sola cadena — el orden de los tres
    // montos y las palabras alrededor tienen que poder moverse.
    drawerBreakdown: "{float} de fondo + {moneyIn} que entró − {moneyOut} que salió",
    drawerBalanced: "Cuadra — bien ahí.",
    drawerBalancedBody: "Lo que contaste coincide con lo que anotaste.",
    drawerOver: "Más de lo esperado",
    drawerOverBody: "En la caja hay {amount} más de lo que dicen tus registros.",
    drawerShort: "Falta",
    drawerShortBody: "A la caja le faltan {amount} respecto a lo que anotaste.",
    drawerSaveCount: "Guardar el conteo",
    drawerRecentCounts: "Conteos recientes",
    drawerRecentBlurb: "Tus últimos siete días contando la caja.",
    drawerCountedExpected: "{counted} contado · {expected} esperado",
    drawerRemoveCount: "Quitar el conteo del {date}",

    // --- porcentaje de impuestos + fondo inicial de siempre
    settingsTitle: "Ajustes",
    settingsBlurb:
      "Define qué parte de tus ingresos apartar para impuestos, y con cuánto efectivo sueles empezar el día.",
    settingsTaxRate: "Apartar para impuestos (%)",
    settingsUsualFloat: "Fondo inicial de siempre",
    settingsTaxNote:
      "No es asesoría fiscal — solo aparta una parte de lo que anotas para que la cuenta no te agarre desprevenido. Confirma el porcentaje con tu contador.",
    settingsSave: "Guardar ajustes",

    // --- bloqueo de la app
    lockTitle: "Bloquear esta app",
    lockBlurb:
      "Esconde tus cuentas detrás de un PIN, para que quien tenga tu teléfono desbloqueado no pueda leerlas.",
    lockOnMessage: "El bloqueo está activado. Te vamos a pedir este PIN cuando vuelvas.",
    lockOffMessage: "Bloqueo desactivado.",
    lockOn: "Activado",
    lockOff: "Desactivado",
    lockEveryTime: "Te pide el PIN cada vez que abres la app.",
    lockAsksAfter_one: "Te lo vuelve a pedir después de {count} minuto fuera.",
    lockAsksAfter_other: "Te lo vuelve a pedir después de {count} minutos fuera.",
    lockTurningOff: "Desactivando…",
    lockTurnOff: "Desactivar el bloqueo",
    lockChoosePin: "Elige un PIN",
    lockChoosePinBlurb: "De cuatro a ocho números. Lo escribes cuando vuelvas a la app.",
    lockPinMismatch: "Esos dos PIN no coinciden.",
    lockNewPin: "PIN nuevo",
    lockPinHint: "De 4 a 8 números.",
    lockConfirmPin: "Escríbelo otra vez",
    lockAskAgainAfter: "Volver a pedirlo después de",
    lockTimeoutAlways: "Cada vez que la abro",
    lockTimeoutMinutes_one: "{count} minuto fuera",
    lockTimeoutMinutes_other: "{count} minutos fuera",
    lockTimeoutHours_one: "{count} hora fuera",
    lockTimeoutHours_other: "{count} horas fuera",
    lockTurnOn: "Activar el bloqueo",
    lockFootnote:
      "Esto esconde la app en tu dispositivo. Tu cuenta ya está protegida por tu contraseña, y solo tú puedes leer tus datos — el PIN es una comodidad encima de eso, no un reemplazo. ¿Se te olvidó? Cierra sesión, vuelve a entrar y pon uno nuevo.",
  },

  help: {
    // --- la página misma
    title: "Cómo funciona todo",
    blurb:
      "Cada función, para qué sirve y cómo se usa. Busca, o elige una sección en el menú de Ayuda.",
    searchPlaceholder: "Busca en la ayuda — prueba “recibo”, “dividir”, “impuestos”…",
    searchLabel: "Buscar en la ayuda",
    clearSearch: "Borrar la búsqueda en la ayuda",
    matchCount_one: "{count} tema coincide con “{query}”.",
    matchCount_other: "{count} temas coinciden con “{query}”.",
    oneSectionTitle: "Estás viendo una sola sección",
    oneSectionBody: "Llegaste por un enlace a una parte de la guía.",
    noMatch: "Nada coincide con “{query}”",
    noMatchHint: "Prueba con una palabra más simple — “impuestos”, “recibo”, “exportar”.",
    whereToFind: "Dónde encontrarlo",
    howToUse: "Cómo se usa",
    worthKnowing: "Vale la pena saberlo",
    openIt: "Abrirlo",
    stillStuck: "¿Sigues atorado?",
    // {link} es donde va el enlace a Pregunta sobre tu dinero. Muévelo a donde
    // la frase lo necesite — la página parte la cadena ahí — pero tiene que
    // aparecer exactamente una vez, o el enlace desaparece.
    stillStuckBody:
      "Prueba a preguntarlo con tus propias palabras en {link} — responde sobre tus propios números. Para cualquier cosa de impuestos o de temas legales, consulta con un contador en vez de confiar en la app.",

    // --- títulos de las secciones
    groupStart: "Para empezar",
    groupLogging: "Anotar dinero",
    groupDay: "Tu día",
    groupMonth: "Este mes",
    groupInvoices: "Facturas",
    groupTools: "Herramientas",
    groupExport: "Exportar",
    groupOffline: "El teléfono y quedarse sin señal",
    groupPrivacy: "Privacidad y tus datos",

    // --- para empezar
    firstRunTitle: "Configurarla por primera vez",
    firstRunWhere: "Hoy",
    firstRunSummary:
      "Con dos pasos ya funciona todo lo demás: un registro y un porcentaje de impuestos.",
    firstRunKeywords: "configuración primeros pasos cuenta nueva empezar inicio",
    firstRunStep1: "En Hoy, escribe lo que ganaste en la casilla de configuración y guárdalo.",
    firstRunStep2:
      "Define qué parte de tus ingresos quieres apartar para impuestos — 25% es un punto de partida común.",
    firstRunStep3:
      "El panel de configuración desaparece en cuanto terminas los dos. Hay un enlace para saltártelo si prefieres.",
    firstRunNote1:
      "Nada de esto es para siempre — puedes cambiar el porcentaje de impuestos cuando quieras desde Herramientas, y eliminar cualquier registro.",

    paletteTitle: "Ve a donde quieras con ⌘K",
    paletteWhere: "En cualquier parte",
    paletteSummary:
      "Un solo atajo para llegar a cualquier página, o para anotar un registro sin dejar lo que estás haciendo.",
    paletteKeywords: "paleta de comandos buscar atajo ctrl k teclado",
    paletteStep1: "Presiona ⌘K (Ctrl+K en Windows), o toca Buscar en la barra de arriba.",
    paletteStep2:
      "Escribe parte del nombre de una página — las iniciales también sirven, así que “efd” encuentra En qué se fue el dinero.",
    // El texto entre comillas es lo que se escribe: el lector de registros
    // rápidos solo entiende inglés, así que traducir el ejemplo enseñaría una
    // forma que no funciona. Ver dashboard.quickAddPlaceholder.
    paletteStep3: "O escribe un registro como “spent 20 on supplies” y elige Anotar este registro.",
    paletteStep4: "Las flechas te mueven, Enter elige, Escape cierra.",

    themeTitle: "Oscuro o claro",
    themeWhere: "Barra de arriba",
    themeSummary: "La app viene oscura; cámbiala a claro para lugares con mucha luz.",
    themeKeywords: "tema oscuro claro modo sol luna afuera",
    themeStep1: "Toca el sol o la luna en la barra de arriba. Se queda como lo dejes.",
    themeNote1:
      "El modo claro vale la pena al aire libre — las pantallas oscuras cuestan de leer bajo el sol.",

    // --- anotar dinero
    quickAddTitle: "Anotar rápido — solo escríbelo",
    quickAddWhere: "Hoy → Agregar un registro",
    quickAddSummary: "Escríbelo como lo dirías y los campos se llenan solos.",
    quickAddKeywords: "rápido escribir anotar registro lenguaje natural",
    quickAddStep1: "Escribe algo como “spent 42.50 at costco on groceries” o “made 300”.",
    quickAddStep2: "Revisa la línea de abajo — te muestra exactamente qué entendió.",
    quickAddStep3: "Toca Agregar.",
    quickAddNote1:
      "Aprende de ti: si una vez pones Costco en la categoría Comida, la próxima vez la llena solo.",
    quickAddNote2: "“yesterday” y las fechas como 2026-08-01 sirven igual.",

    voiceTitle: "Agregar por voz",
    voiceWhere: "Hoy → Agregar un registro",
    voiceSummary: "Di el registro en vez de escribirlo.",
    voiceKeywords: "voz micrófono dictar hablar decir",
    voiceStep1: "Toca el micrófono que está junto a la casilla de anotar rápido.",
    voiceStep2: "Di algo como “spent twenty dollars on lunch”.",
    voiceStep3: "Se llena la casilla sola — revísalo y toca Agregar.",
    voiceNote1:
      "Funciona en Chrome y en Safari. En Firefox no aparece el botón del micrófono, porque el navegador no puede hacerlo.",
    voiceNote2: "Los montos dichos en palabras también sirven: “three hundred and fifty” es 350.",
    voiceNote3: "La primera vez, el navegador te va a pedir permiso para usar el micrófono.",

    fullFormTitle: "El registro completo",
    fullFormWhere: "Hoy → Agregar un registro",
    fullFormSummary: "Para cuando quieres poner cada cosa a mano.",
    fullFormKeywords: "formulario manual fecha dinero ganado gastado categoría efectivo tarjeta",
    fullFormStep1: "Pon la fecha, y luego el dinero que ganaste o el que gastaste.",
    fullFormStep2: "Agrega en qué se gastó y dónde (el nombre del negocio), si quieres.",
    fullFormStep3:
      "Elige Efectivo, Tarjeta u Otro — eso es lo que hace que funcione la revisión de caja.",
    fullFormStep4: "Adjunta la foto de un recibo si tienes.",

    receiptsTitle: "Fotos de recibos que se llenan solas",
    receiptsWhere: "Hoy → Agregar un registro",
    receiptsSummary: "Fotografía un recibo y él lee el total, la categoría, la fecha y el negocio.",
    receiptsKeywords: "recibo foto escanear cámara ticket imagen",
    receiptsStep1: "Elige o toma una foto en el campo Foto del recibo.",
    receiptsStep2: "Espera un momento — lee el recibo y llena lo que encontró.",
    receiptsStep3: "Revisa los montos antes de guardar. La foto queda adjunta al registro.",
    receiptsNote1:
      "Para leer recibos hace falta una clave de IA configurada. Sin ella todo lo demás sigue funcionando y solo escribes los datos tú mismo.",
    receiptsNote2:
      "Las fotos de recibos son privadas, solo tuyas, y se guardan de forma segura, aunque el registro esté compartido.",

    editingTitle: "Corregir o quitar registros",
    editingWhere: "Hoy",
    editingSummary: "Elimina un registro, adjunta un recibo después, o cambia quién puede verlo.",
    editingKeywords: "eliminar quitar editar error corregir recibo compartir",
    editingStep1: "Busca el registro en la lista de Hoy.",
    editingStep2: "El icono de la cámara adjunta o cambia la foto del recibo.",
    editingStep3: "El icono de las personas cambia quién puede verlo (solo si estás en un hogar).",
    editingStep4: "El icono del bote lo elimina — te pregunta primero, y esto no se deshace.",
    editingNote1: "Para cambiar los montos, usa Buscar registro — aquí abajo lo explicamos.",

    findEntryTitle: "Buscar un registro y corregirlo",
    findEntryWhere: "Hoy → Buscar registro",
    findEntrySummary: "Busca en todo lo que has anotado y toca uno para cambiarlo.",
    findEntryKeywords:
      "buscar encontrar filtrar editar corregir arreglar cambiar error historial monto fecha equivocado",
    findEntryStep1:
      "Escribe lo que recuerdes — un negocio, una categoría, una fecha, hasta el monto.",
    findEntryStep2:
      "Acota más con Más filtros: categoría, efectivo o tarjeta, un rango de fechas o un rango de montos.",
    findEntryStep3: "Toca un resultado para abrirlo, corrige lo que esté mal y guarda los cambios.",
    findEntryNote1:
      "Cada palabra que escribas tiene que coincidir, así que “costco comida” achica la lista en vez de agrandarla.",
    findEntryNote2:
      "La línea de totales suma lo que tengas en pantalla, así que una búsqueda te sirve de reporte rápido — filtra por una categoría y ya tienes el total de esa categoría.",
    findEntryNote3:
      "En un hogar, cualquiera puede corregir un registro compartido, pero solo quien lo anotó puede eliminarlo.",
    findEntryNote4: "La búsqueda pasa en tu dispositivo, así que es instantánea y va sin conexión.",

    // --- tu día
    safeToSpendTitle: "Lo que puedes gastar hoy",
    safeToSpendWhere: "Hoy",
    safeToSpendSummary:
      "Un solo número: lo que puedes gastar ahora sin meterte en problemas más adelante en el mes.",
    safeToSpendKeywords: "gastar seguro diario límite presupuesto queda",
    safeToSpendNote1:
      "Si pusiste presupuestos, es lo que queda de ellos repartido entre los días que faltan.",
    safeToSpendNote2:
      "Si no pusiste, es el efectivo que tienes menos los pagos que faltan este mes, repartido entre los días que quedan.",
    // La app maneja los montos en dólares en todos los idiomas, así que la cifra
    // sigue siendo $0.00 — solo la separación de miles sigue la región del lector.
    safeToSpendNote3:
      "Muestra $0.00 y se pone rojo cuando vas atrasado, en vez de fingir que hay margen.",

    dueSoonTitle: "Pagos que vencen pronto",
    dueSoonWhere: "Hoy",
    dueSoonSummary: "Un aviso arriba cuando algo vence dentro de los próximos cinco días.",
    dueSoonKeywords: "vence aviso recordatorio pagos alerta pronto",
    dueSoonNote1: "Solo aparece cuando tienes pagos fijos cargados y hay uno cerca.",
    dueSoonNote2: "Los pagos se cargan en Este mes → Pagos.",

    streaksTitle: "Rachas",
    streaksWhere: "Hoy → Tus rachas",
    streaksSummary: "Cuántos días seguidos llevas anotando, ganando, o sin gastar.",
    streaksKeywords: "racha hábito seguidos con ganancia sin gastar récord",
    streaksNote1:
      "Un día sin gastar solo cuenta si ese día anotaste algo — olvidarte de usar la app no te gana una racha.",
    streaksNote2:
      "Las rachas no se cortan solo porque todavía no anotaste hoy; se cuentan desde ayer.",

    askTitle: "Preguntar por tu propio dinero",
    askWhere: "Hoy → Pregunta sobre tu dinero",
    askSummary: "Preguntas en palabras simples sobre tus propios números.",
    askKeywords: "chat ia preguntar duda ayuda consejo",
    askStep1: "Escribe una pregunta como “¿en qué gasté más?” o “¿me alcanza para $200?”",
    askStep2: "Toca una de las preguntas sugeridas para ver el tipo de cosas que responde.",
    askNote1: "Responde con tus propios registros y nunca se inventa cifras sobre tu negocio.",
    askNote2:
      "Maneja gastos, categorías, comparaciones, presupuestos, pagos, negocios, metas, lo que viene, impuestos y márgenes.",
    askNote3:
      "No conoce el saldo de tu banco, ni tus deudas, ni cuándo te pagan — solo lo que anotaste aquí.",

    // --- este mes
    monthOverviewTitle: "Resumen del mes",
    monthOverviewWhere: "Este mes → Resumen",
    monthOverviewSummary: "Dinero que entra, dinero que sale y ganancia de cualquier mes.",
    monthOverviewKeywords: "mensual totales ganancia pérdida resumen",
    monthOverviewStep1: "Usa las flechas de los lados del nombre del mes para moverte entre meses.",
    monthOverviewNote1:
      "El mes que elijas se queda puesto mientras te mueves por las otras páginas del mes.",

    categoriesTitle: "En qué se fue el dinero",
    categoriesWhere: "Este mes → En qué se fue el dinero",
    categoriesSummary: "Tus gastos separados por categoría, de mayor a menor.",
    categoriesKeywords: "categorías desglose gráfica gastos",

    daybydayTitle: "Día por día",
    daybydayWhere: "Este mes → Día por día",
    daybydaySummary: "Cada día del mes como una barra — verde si saliste ganando, rojo si no.",
    daybydayKeywords: "diario gráfica barras días",

    weekTitle: "Tu semana en palabras simples",
    weekWhere: "Este mes → Tu semana",
    weekSummary: "Un resumen corto y escrito de los últimos siete días.",
    weekKeywords: "resumen semanal repaso palabras simples",
    weekNote1:
      "Está escrito con tus propios números, e incluye cómo va la semana comparada con la anterior.",

    outlookTitle: "¿Te alcanza para lo que viene?",
    outlookWhere: "Este mes → ¿Te alcanza?",
    outlookSummary: "Una mirada a los próximos 30 días: ¿te alcanza para los pagos que vienen?",
    outlookKeywords: "pronóstico lo que viene alquiler futuro faltante predecir",
    outlookNote1:
      "Se arma con tu día típico de los últimos tiempos, más cada pago fijo el día que cae.",
    outlookNote2: "Te avisa con una fecha si cree que te vas a quedar corto.",
    outlookNote3:
      "Con pocos días anotados te lo dice de frente, en vez de fingir que es muy preciso.",

    busydaysTitle: "Días fuertes y flojos",
    busydaysWhere: "Este mes → Días fuertes y flojos",
    busydaysSummary: "Qué días de la semana de verdad te traen dinero.",
    busydaysKeywords: "flojo tranquilo fuerte día de la semana patrón mejor día",
    busydaysNote1:
      "Necesita unas tres semanas de registros para que signifique algo, y te lo va a decir.",

    budgetsTitle: "Presupuestos",
    budgetsWhere: "Este mes → Presupuestos",
    budgetsSummary: "Un tope mensual por categoría, con un aviso antes de que te pases.",
    budgetsKeywords: "presupuesto límite tope categoría alerta gastar de más",
    budgetsStep1: "Escribe una categoría y un tope mensual, y toca Guardar presupuesto.",
    budgetsStep2: "Mira las barras — se ponen rojas al 80% y dicen Pasado arriba del 100%.",
    budgetsNote1: "Los presupuestos también alimentan el “puedes gastar hoy” de la página Hoy.",

    goalsTitle: "Metas de ahorro",
    goalsWhere: "Este mes → Metas de ahorro",
    goalsSummary: "Algo para lo que estás juntando dinero, y qué tan cerca estás.",
    goalsKeywords: "meta ahorro objetivo juntar guardar",
    goalsStep1:
      "Agrega un nombre, el monto de la meta, cuánto llevas juntado y, si quieres, una fecha.",
    goalsNote1:
      "Con fecha límite calcula cuánto guardar por semana; sin fecha lo estima según el ritmo que llevas.",

    billsTitle: "Pagos, suscripciones y gastos que se repiten",
    billsWhere: "Este mes → Pagos",
    billsSummary: "Qué hay que pagar, qué parece suscripción, y tus gastos fijos.",
    billsKeywords: "pagos gastos fijos suscripción vencimiento calendario alquiler detectar",
    billsStep1:
      "Agrega un gasto que se repite con su monto, su categoría, cada semana o cada mes, y una fecha de inicio.",
    billsStep2: "De ahí en adelante crea esos gastos solo, a medida que van cayendo las fechas.",
    billsNote1:
      "También detecta cobros que se repiten en tu historial y te los ofrece para seguirlos con un toque.",
    billsNote2:
      "La detección es cuidadosa a propósito: necesita tres o más apariciones, montos parecidos y espacios regulares, así que no te va a marcar una compra suelta.",

    // --- facturas
    invoiceCreateTitle: "Cobrarle a un cliente",
    invoiceCreateWhere: "Facturas → Nueva factura",
    invoiceCreateSummary: "Haz una factura, mándala y dale seguimiento desde una sola lista.",
    invoiceCreateKeywords: "factura cliente cobrar crear enviar borrador número",
    invoiceCreateStep1:
      "Escribe para quién es, las fechas, y una línea por cada cosa que estás cobrando.",
    invoiceCreateStep2: "El total se calcula solo mientras escribes.",
    invoiceCreateStep3: "Créala — empieza como borrador, así que nada es definitivo.",
    invoiceCreateStep4:
      "Cuando de verdad se la mandaste al cliente, ábrela y toca Marcar como enviada.",
    invoiceCreateNote1:
      "Los números van en orden y nunca se reutilizan, ni aunque canceles una. Que haya saltos es normal; que dos facturas compartan número, no.",
    invoiceCreateNote2:
      "Un borrador se puede editar o eliminar. Una vez enviada se puede editar o cancelar, pero no eliminar, para que la numeración quede completa.",
    invoiceCreateNote3:
      "Imprimir o guardar como PDF te da una copia limpia, sin nada de la app alrededor.",

    invoicePaidTitle: "Que te paguen, y qué le hace eso a tus cuentas",
    invoicePaidWhere: "Facturas → abre una",
    invoicePaidSummary: "Marcar una factura como pagada es lo que la convierte en ingreso.",
    invoicePaidKeywords: "pagada pago marcar sin pagar ingreso cuentas por cobrar vencida deben",
    invoicePaidStep1: "Abre la factura y toca Marcar como pagada.",
    invoicePaidStep2:
      "Elige la fecha en que de verdad llegó el dinero — no la de hoy, si son distintas.",
    invoicePaidNote1:
      "Esto crea un registro de ingreso normal en tus cuentas con esa fecha, así que entra en tus totales, en tu mes, en lo que apartas para impuestos y en tu exportación, igual que cualquier otro dinero que entra.",
    invoicePaidNote2:
      "Hasta que la marques como pagada se queda completamente fuera de tus números. Una factura sin pagar no es ingreso, y contarla te inflaría la ganancia y los impuestos.",
    invoicePaidNote3: "¿Cambiaste de opinión? Marcar como no pagada quita ese registro otra vez.",
    invoicePaidNote4:
      "Todo lo que pasa de su fecha de pago aparece como vencido automáticamente — sale de la fecha, así que nunca queda desactualizado.",

    // --- herramientas
    householdTitle: "Compartir con alguien",
    householdWhere: "Herramientas → Hogar",
    householdSummary:
      "Comparte los registros que elijas con tu pareja o con quien vives, y repartan los gastos de forma justa.",
    householdKeywords: "hogar compartir pareja dividir saldar código invitación",
    householdStep1: "Crea un hogar y te dan un código de invitación de seis caracteres.",
    householdStep2: "La otra persona se registra, abre Herramientas → Hogar y escribe ese código.",
    householdStep3: "Cuando anotes algo, elige Solo yo, Compartir o Dividir.",
    householdNote1:
      "Todo queda privado salvo que tú decidas otra cosa — unirte a un hogar no muestra nada de lo que ya tenías anotado.",
    householdNote2:
      "Compartir quiere decir que lo pueden ver. Dividir quiere decir que además se reparte en partes iguales y aparece en el resumen de quién le paga a quién.",
    householdNote3:
      "Cualquiera del hogar puede corregir un registro compartido, pero solo quien lo anotó puede eliminarlo.",
    householdNote4: "Salir de un hogar vuelve privados otra vez los registros que compartiste.",

    marginsTitle: "Lo que de verdad te queda por producto",
    marginsWhere: "Herramientas → Margen por producto",
    marginsSummary: "Pon el costo y el precio de venta, y mira la ganancia real de cada venta.",
    marginsKeywords: "margen ganancia por producto precio venta",
    marginsNote1:
      "También te dice más o menos cuántos tienes que vender al mes para cubrir tus costos de siempre.",
    marginsNote2: "Si estás vendiendo algo con pérdida, te lo dice sin rodeos.",

    drawerTitle: "Revisión de caja",
    drawerWhere: "Herramientas → Caja",
    drawerSummary: "Cuenta la caja y mira si cuadra con lo que anotaste.",
    drawerKeywords: "caja efectivo conteo cuadrar falta sobra fondo",
    drawerStep1: "Escribe el día, tu fondo inicial y lo que de verdad contaste.",
    drawerStep2: "Te muestra lo que debería haber en la caja y la diferencia, antes de guardar.",
    drawerNote1:
      "Solo los registros marcados como Efectivo cuentan para el monto esperado. Si nunca marcaste ninguno, todo se toma como efectivo.",
    drawerNote2:
      "El monto esperado se calcula en el servidor con tus registros, así que no se puede desviar.",

    taxTitle: "Apartar impuestos",
    taxWhere: "Herramientas → Apartar impuestos",
    taxSummary: "Guarda una parte de tus ingresos para que la cuenta de impuestos no sea un susto.",
    taxKeywords: "impuestos apartar porcentaje guardar trimestral",
    taxStep1: "Pon un porcentaje. El total se va actualizando a medida que anotas ingresos.",
    // La palabra entre comillas es la que busca el clasificador de categorías, y
    // el clasificador sigue siendo solo en inglés — ver la nota arriba de zh.ts y
    // ur.ts. Deja “tax” en inglés hasta que el clasificador aprenda el idioma.
    taxNote1: "Anota los pagos de impuestos con “tax” en la categoría y se restan del total.",
    taxNote2: "Esto no es asesoría fiscal — confirma el porcentaje correcto con un contador.",

    reminderTitle: "Recordatorio diario",
    reminderWhere: "Herramientas → Recordatorio diario",
    reminderSummary: "Un empujoncito a la hora que elijas, para que anotar se vuelva costumbre.",
    reminderKeywords: "recordatorio notificación aviso diario hora hábito avisar",
    reminderStep1: "Elige la hora que te acomode — después de cerrar suele funcionar bien.",
    reminderStep2:
      "Toca Activar recordatorios y permite las notificaciones cuando el navegador te lo pida.",
    reminderNote1:
      "Vale la pena ser claros con cómo funciona: la app muestra el recordatorio cuando se da cuenta de que ya pasó la hora. No es un despertador que sale de un servidor, así que no va a sonar en un teléfono que no abrió la app en todo el día.",
    reminderNote2:
      "En iPhone primero tienes que agregar la app a tu pantalla de inicio — Apple no permite notificaciones de otra forma.",
    reminderNote3:
      "Se queda callado si ya anotaste algo ese día. Lo que importa es la costumbre, no la notificación.",
    reminderNote4: "Aparece una sola vez al día, aunque abras la app varias veces.",
    reminderNote5:
      "Si bloqueaste las notificaciones de este sitio, la app te lo dice en vez de fingir que están activadas.",

    lockTitle: "Bloquear la app",
    lockWhere: "Herramientas → Bloquear esta app",
    lockSummary: "Un PIN para que quien tenga tu teléfono desbloqueado no pueda leer tus cuentas.",
    lockKeywords: "bloqueo pin privacidad seguridad clave huella",
    lockStep1:
      "Elige un PIN de 4 a 8 números, escríbelo dos veces y elige cada cuándo debe volver a pedirlo.",
    lockStep2: "Usa Desactivar el bloqueo para quitarlo.",
    lockNote1:
      "Tu PIN se guarda cifrado y se revisa en el servidor — nunca queda guardado como números a la vista.",
    lockNote2:
      "Esto esconde la app en tu dispositivo. Tu cuenta ya está protegida por tu contraseña, así que el PIN es una comodidad encima de eso, no un reemplazo.",
    lockNote3:
      "¿Se te olvidó? Cierra sesión, vuelve a entrar con tu correo y tu contraseña, y pon uno nuevo.",

    // --- exportar
    exportTitle: "Mandarle tus registros a tu contador",
    exportWhere: "Exportar",
    exportSummary: "Descarga tus registros como hoja de cálculo o como un PDF ordenado.",
    exportKeywords: "exportar csv pdf contador descargar hoja de cálculo registros",
    exportStep1: "Elige un rango de fechas, o usa Este mes / El mes pasado / Todo.",
    exportStep2: "Revisa la vista previa — es exactamente lo que va a quedar en el archivo.",
    exportStep3: "Elige Descargar CSV o Descargar PDF.",
    exportNote1:
      "Los dos traen fecha, dinero que entra, dinero que sale, categoría, dónde y una nota, más una fila de totales.",
    exportNote2:
      "Exportar → Descargar CSV y Descargar PDF, en el menú, van directo a la descarga con el rango que tengas puesto.",

    // --- el teléfono y quedarse sin señal
    installTitle: "Ponla en tu teléfono",
    installWhere: "Hoy, o el menú de tu navegador",
    installSummary:
      "Instálala para que se abra como una app, a pantalla completa y con su propio icono.",
    installKeywords: "instalar app pantalla de inicio descargar icono teléfono",
    installStep1: "En Android o Chrome, toca Instalar cuando la app te lo ofrezca en Hoy.",
    installStep2: "En iPhone, toca el botón Compartir en Safari y luego Agregar a inicio.",
    installNote1:
      "Instalarla es lo que hace que anotar sin conexión y los recordatorios diarios funcionen bien, sobre todo en iPhone.",
    installNote2: "Es la misma app y la misma cuenta — no hay nada que configurar de nuevo.",

    offlineLoggingTitle: "Anotar sin señal",
    offlineLoggingWhere: "En cualquier parte",
    offlineLoggingSummary:
      "Sigue anotando en un sótano, en el mercado o donde no hay señal. No se pierde nada.",
    offlineLoggingKeywords:
      "sin conexión sin señal sin internet sincronizar en espera mercado sótano",
    offlineLoggingNote1:
      "Aparece una barra arriba cuando no hay conexión. Tú sigue anotando como siempre.",
    offlineLoggingNote2:
      "Los registros se quedan en tu dispositivo y se mandan solos apenas vuelves a estar en línea, en el mismo orden en que los anotaste.",
    // “Mostrarlos” es un botón de la barra de sin conexión — usa la misma palabra
    // que offline.showThem, para que la instrucción nombre el botón que se ve.
    offlineLoggingNote3: "Toca “Mostrarlos” en esa barra para ver qué falta por enviar.",
    offlineLoggingNote4:
      "Las páginas que ya abriste siguen funcionando sin conexión, y tus números se leen tal como estaban la última vez que cargaron.",
    offlineLoggingNote5:
      "Una sola cosa no funciona sin conexión: adjuntar la foto de un recibo necesita señal. El registro se guarda y la foto la agregas después.",
    offlineLoggingNote6:
      "Si un registro se rechaza varias veces, la app lo aparta y te avisa, en vez de tirarlo sin decir nada. Puedes volver a intentarlo o descartarlo tú mismo.",
    offlineLoggingNote7:
      "Cerrar sesión no borra nada de lo que está en espera — te avisa y lo guarda para la próxima vez que inicies sesión en ese dispositivo.",

    // --- privacidad y tus datos
    privacyTitle: "Quién puede ver tus números",
    privacyWhere: "En toda la app",
    privacySummary:
      "Tus registros son tuyos. No se comparte nada salvo que tú decidas compartirlo.",
    privacyKeywords: "privacidad seguridad datos quién puede ver cifrado",
    privacyNote1:
      "El acceso lo controla la base de datos, no solo la app, así que otra cuenta no puede leer tus registros ni en principio.",
    privacyNote2:
      "La copia de tus números que queda en el dispositivo se borra al cerrar sesión, para que no la lea quien use el aparato después.",
    privacyNote3: "Compartir en el hogar es registro por registro, y siempre lo decides tú.",
    privacyNote4:
      "Las fotos de recibos quedan en un almacenamiento privado que solo tú puedes abrir.",
    privacyNote5:
      "Puedes exportar todo lo que has anotado cuando quieras, y eliminar cualquier registro.",
  },

  onboarding: {
    title: "Vamos a preparar tus cuentas",
    blurb: "Dos cosas rápidas y el resto de la app empieza a funcionar bien.",
    stepsDone_one: "{count} de {total} listo",
    stepsDone_other: "{count} de {total} listos",
    progressLabel: "Avance de la configuración",
    entryStepTitle: "Anota lo que ganaste hoy",
    entryStepDone: "Primer registro anotado",
    entryStepDoneBlurb: "Bien — tus totales y tus gráficas ya están vivos.",
    amountLabel: "Dinero que ganaste hoy",
    taxStepTitle: "Decide cuánto apartar para impuestos",
    taxStepDone: "Apartando el {rate}% para impuestos",
    taxStepDoneBlurb: "Puedes cambiarlo cuando quieras desde {section}.",
    rateLabel: "Porcentaje de tus ingresos",
    setRate: "Poner",
    taxHint:
      "Con un cálculo aproximado basta — 25% es un punto de partida común. Confirma la cifra real con un contador; esto solo sirve para que la cuenta no te agarre desprevenido.",
    skip: "Saltar esto",
  },

  empty: {
    logFirstEntry: "Anota tu primer registro",
    samplePreview: "Así es como se va a ver",
  },

  export: {
    eyebrow: "Exportar",
    title: "Exporta tus registros",
    blurb:
      "Elige las fechas que necesitas y descarga una hoja de cálculo o un PDF ordenado para tu contador.",

    dateRange: "Rango de fechas",
    dateRangeHint: "Deja los dos en blanco para exportar todo.",
    from: "Desde",
    to: "Hasta",
    thisMonth: "Este mes",
    lastMonth: "El mes pasado",
    everything: "Todo",

    entryCount_one: "{count} registro",
    entryCount_other: "{count} registros",
    labelIn: "entró",
    labelOut: "salió",
    labelNet: "neto",

    columnDate: "Fecha",
    columnCategory: "Categoría",
    columnIn: "Entró",
    columnOut: "Salió",
    totalsRow: "Totales",
    totalsNet: "({amount} neto)",

    previewTitle: "Vista previa — esto es lo que te llevas",
    previewNote:
      "Esto es exactamente lo que va al CSV y al PDF de abajo — el PDF además pone el nombre de tu negocio y el rango de fechas como encabezado.",

    sampleBadge: "Ejemplo",
    sampleTitle: "Cómo se va a ver tu exportación",
    sampleBlurb:
      "Todavía no tienes registros en este rango de fechas, así que aquí va un ejemplo inventado con números falsos — solo para que veas qué van a traer el CSV y el PDF cuando empieces a anotar el dinero que entra y sale cada día.",
    sampleNote:
      "Cada registro se vuelve una fila con su fecha, su categoría y sus montos, más una fila de totales abajo. Los botones de descarga de verdad se activan cuando tengas registros reales en el rango.",
    sampleCategorySupplies: "Insumos",
    sampleCategoryRent: "Alquiler",

    nothingToDownload: "Todavía no hay nada que descargar para estas fechas",
    nothingToDownloadBody: "Elige un rango más amplio aquí arriba y vuelve a intentarlo.",

    downloadCsv: "Descargar CSV",
    downloadPdf: "Descargar PDF",
  },

  landing: {
    // --- compartido por el encabezado, el hero y el llamado final
    startFree: "Empieza gratis",
    signIn: "Iniciar sesión",

    // --- landing-header.tsx
    homeLabel: "SimpleBooks — inicio",
    navLabel: "Sitio",

    // --- hero.tsx
    heroTitle: "Mira cómo va tu negocio, hoy mismo",
    heroBody:
      "Anota el dinero que entra y el que sale a medida que pasa. SimpleBooks lo suma por ti, así que en cualquier momento del día sabes si vas ganando — sin hojas de cálculo y sin saber nada de contabilidad.",
    heroSeeHowItWorks: "Mira cómo funciona",
    heroReassuranceSpeed: "Como diez segundos por registro",
    heroReassuranceOffline: "Sigue funcionando sin señal",
    // {count} es TRIAL_DAYS, sale de pricing.ts. Nunca escribas el número aquí.
    heroReassuranceTrial_one: "Gratis por {count} día, cancela cuando quieras",
    heroReassuranceTrial_other: "Gratis por {count} días, cancela cuando quieras",

    // --- product-preview.tsx (un puesto de mercado inventado; nada de esto es real)
    previewToday: "Hoy",
    previewExampleBadge: "Pantalla de ejemplo",
    previewNetLabel: "Neto de hoy",
    previewNetHint: "Vas ganando en el día.",
    previewMoneyIn: "Dinero que entra",
    previewMoneyOut: "Dinero que sale",
    previewAllTime: "Desde el inicio",
    // {amount} es la cifra ya formateada, que se dibuja como componente. Ponlo
    // donde la frase lo necesite — la página parte la cadena ahí — pero consérvalo.
    previewAllTimeIn: "{amount} entró",
    previewAllTimeOut: "{amount} salió",
    // {number} es la cantidad de pagos, en su propio span para que los dígitos
    // conserven su estilo. Tiene que aparecer exactamente una vez.
    previewBillsDue_one: "{number} pago vence pronto",
    previewBillsDue_other: "{number} pagos vencen pronto",
    previewBillsHint: "Conviene cubrirlo antes de que te agarre desprevenido.",
    previewBillRent: "Alquiler del puesto",
    previewBillPhone: "Teléfono",
    previewBillDueTomorrow: "vence mañana",
    previewBillDueInDays_one: "vence en {count} día",
    previewBillDueInDays_other: "vence en {count} días",
    previewRecentEntries: "Registros recientes",
    previewDateMonday: "Lun 4",
    previewDateSunday: "Dom 3",
    previewEntryTakings: "Ventas del puesto — la mañana",
    previewEntryWholesaler: "Mayorista — verduras",
    previewEntryInvoicePaid: "Factura #{number} pagada",
    previewEntryDiesel: "Diésel de la camioneta",
    previewMethodCash: "Efectivo",
    previewMethodCard: "Tarjeta",
    previewMethodBankTransfer: "Transferencia",
    previewCaption:
      "Un ejemplo de la pantalla del día. Todas las cifras de arriba están inventadas para ilustrar — no es un negocio real ni son los datos de nadie.",

    // --- benefits.tsx
    benefitsEyebrow: "Qué hace",
    benefitsTitle: "Todo lo que necesita un negocio de una sola persona, y nada más",
    benefitsDescription:
      "Sin plan de cuentas, sin partida doble, sin palabras raras. Solo lo que haces todos los días.",
    benefitLoggingTitle: "Anotar toma segundos",
    benefitLoggingBody:
      "Escribe o di lo que entró o lo que salió y queda guardado antes del siguiente cliente.",
    benefitAskTitle: "Pregunta por tus propios números",
    benefitAskBody:
      "Pregunta algo como “¿cómo me fue la semana pasada?” y te responde con las mismas palabras simples.",
    benefitReceiptTitle: "Fotografía un recibo",
    benefitReceiptBody:
      "Toma una foto y el negocio, la fecha y el monto se llenan solos para que los revises.",
    benefitInvoiceTitle: "Manda una factura",
    benefitInvoiceBody:
      "Hazla en un minuto, mándala, y mira de un vistazo cuáles siguen sin pagar.",
    benefitBudgetsTitle: "Presupuestos, pagos y metas",
    benefitBudgetsBody:
      "Define lo que piensas gastar, cuándo caen los pagos y para qué estás juntando dinero.",
    benefitOfflineTitle: "Funciona sin señal",
    benefitOfflineBody:
      "Sigue anotando en un mercado techado o en un sótano; se pone al día cuando vuelves a estar en línea.",
    benefitPrivacyTitle: "Tus números siguen siendo tuyos",
    benefitPrivacyBody:
      "Tus cuentas son privadas de tu cuenta y solo las comparte quien tú invites.",

    // --- how-it-works.tsx
    howItWorksEyebrow: "Cómo funciona",
    howItWorksTitle: "Tres pasos y ya estás llevando tus cuentas",
    howItWorksDescription:
      "El primero lo puedes hacer esta misma tarde y quedarte ahí. Lo demás te espera para cuando lo quieras.",
    // Solo lo lee el lector de pantalla, justo antes del título del paso. Los dos
    // puntos son parte de la cadena porque no se escriben igual en todos los idiomas.
    stepNumber: "Paso {number}:",
    stepLogTitle: "Anota el dinero",
    stepLogBody:
      "El efectivo de la lata, un pago con tarjeta, una bolsa de mercadería — agrégalo apenas pasa. Una línea, unos segundos.",
    stepSeeTitle: "Mira cómo vas",
    stepSeeBody:
      "El día, la semana y el mes se calculan solos. Sin fórmulas y sin esperar a fin de mes.",
    stepAskTitle: "Pregunta, manda y planea",
    stepAskBody:
      "Haz una pregunta sobre tus propios números, manda una factura, y pon los presupuestos, los pagos y las metas de ahorro que quieras cumplir.",

    // --- languages.tsx
    languagesEyebrow: "Idiomas",
    languagesTitle: "En tu idioma, no traducido a la fuerza",
    languagesDescription:
      "Toda la app — botones, ayuda, fechas y montos — habla los {count}. Cámbialo cuando quieras desde el botón de idioma de arriba.",
    languagesRtlNote:
      "El urdu se lee de derecha a izquierda, y la pantalla entera se voltea con él en vez de dejar el texto encajado en un molde de izquierda a derecha.",

    // --- testimonials.tsx (falsos a propósito, y la sección lo dice)
    testimonialsEyebrow: "Historias de clientes",
    testimonialsTitle: "Todavía no tenemos ninguna",
    testimonialsDescription:
      "Ninguna de las personas de abajo es real y ninguna de estas frases es real. Son marcadores que muestran dónde van a ir las historias de clientes cuando haya gente que use SimpleBooks de verdad y acepte que la citemos con su nombre.",
    testimonialExampleBadge: "Ejemplo",
    testimonialNamePending: "Falta agregar el nombre",
    testimonialTraderQuote:
      "Esto es un marcador. Aquí va a ir la frase real de alguien que vende en el mercado, sobre las ventas de su día.",
    testimonialTraderTrade: "Vende en el mercado",
    testimonialCafeQuote:
      "Esto es un marcador. Aquí va a ir la frase real de la dueña de un café, sobre recibos y proveedores.",
    testimonialCafeTrade: "Dueña de un café",
    testimonialCleanerQuote:
      "Esto es un marcador. Aquí va a ir la frase real de alguien que hace limpieza por su cuenta, sobre las facturas.",
    testimonialCleanerTrade: "Hace limpieza por su cuenta",

    // --- pricing.tsx
    pricingEyebrow: "Precios",
    // {count} y {day} salen los dos de TRIAL_DAYS en pricing.ts. Nunca escribas
    // el número en la traducción — un cambio de precio o de prueba se hace allá.
    pricingTitle_one: "Prueba todo gratis por {count} día",
    pricingTitle_other: "Prueba todo gratis por {count} días",
    pricingDescription:
      "Te pedimos una tarjeta para que la prueba pase directo a una suscripción. Cancela antes del día {day} y no se cobra nada.",
    pricingMostPopular: "El más elegido",
    pricingNote:
      "Los dos botones te llevan primero a crear tu cuenta — tiene que existir una cuenta antes de que haya algo que cobrar. Los precios están en dólares.",
    // Cómo se lee un precio de cero. Todos los demás son un número formateado.
    priceFree: "Gratis",

    planFreeName: "Free",
    planFreeCadence: "para siempre",
    planFreeTagline: "Tus cuentas siguen siendo tuyas, y puedes llevar un registro diario igual.",
    planFreeCta: "Seguir con Free",
    planFreeBulletLog: "Anota a mano el dinero que entra y el que sale",
    planFreeBulletTotals: "Los totales de hoy, y los de este mes",
    planFreeBulletExports: "Exportar a CSV y PDF — siempre",
    planFreeBulletLanguages: "Los {count} idiomas",

    planProName: "Pro",
    planProCadence: "al mes",
    planProTagline_one: "Gratis por {count} día. Cancela cuando quieras antes de que termine.",
    planProTagline_other: "Gratis por {count} días. Cancela cuando quieras antes de que termine.",
    planProCta_one: "Empezar mi {count} día gratis",
    planProCta_other: "Empezar mis {count} días gratis",
    planProBulletSearch: "Busca y corrige cada registro que hayas anotado",
    planProBulletInsights: "Rachas, tu semana, días fuertes y en qué se fue el dinero",
    planProBulletCashTools: "Margen por producto, revisión de caja y apartar impuestos",
    planProBulletBills: "Calendario de pagos, y las suscripciones que detecta por ti",
    planProBulletAsk: "Pregunta por tus propios números",
    planProBulletReceipts: "Fotografía un recibo y se llena solo",
    planProBulletInvoices: "Facturas, presupuestos y metas de ahorro sin límite",
    planProBulletReminder: "Un recordatorio diario para anotar el día",
    planProBulletSharing: "Comparte con tu pareja o con quien vives",
    planProBulletOffline: "Sigue funcionando sin señal y sincroniza después",
    planProBulletExports: "Exportar a CSV y PDF para tu contador",
    planProBulletLanguages: "Los {count} idiomas",

    // --- faq.tsx
    faqEyebrow: "Preguntas",
    faqTitle: "Antes de que te registres",
    faqAccountingQuestion: "¿Necesito saber algo de contabilidad?",
    faqAccountingAnswer:
      "No. Si puedes anotar “vendí $40 de verdura”, puedes usar SimpleBooks. Aquí no hay debe, haber, asientos ni partida doble por ningún lado — anotas el dinero que entra y el que sale, y la app hace las sumas. Es el registro de lo que mueve tu negocio, no un reemplazo del contador a la hora de los impuestos.",
    faqCancelQuestion: "¿Puedo cancelar?",
    faqCancelAnswer:
      "Sí, cuando quieras, con un clic desde la página de Facturación — sin llamadas, sin avisar con anticipación y sin nadie tratando de convencerte de lo contrario. Si cancelas durante la semana gratis, no se te cobra nunca. Si cancelas después, te quedas con Pro hasta que se acabe el mes que ya pagaste y luego pasas al plan gratis. Tus registros se quedan exactamente donde están, y exportar sigue funcionando con cualquier plan.",
    faqPrivacyQuestion: "¿Quién puede ver mis números?",
    faqPrivacyAnswer:
      "Tú, y quien tú invites a propósito a compartir cuentas contigo. Tus registros no se venden, ni se les muestran a otras personas que usan SimpleBooks. Puedes exportar todo a CSV o PDF cuando quieras, y al eliminar tu cuenta se elimina todo lo que anotaste.",
    faqLanguagesQuestion: "¿Qué idiomas habla?",
    // {languages} es donde va la lista con los nombres de los idiomas — la página
    // parte la cadena ahí y los muestra resaltados. Muévelo a donde la frase lo
    // necesite, pero tiene que aparecer una sola vez o la lista desaparece.
    faqLanguagesAnswer:
      "{count}, y todos cubren la app entera, no solo la portada: {languages}. Puedes cambiar cuando quieras desde el botón de idioma de la barra de arriba.",
    faqBillingQuestion: "¿Cómo funciona el cobro?",
    // {count} es TRIAL_DAYS, de pricing.ts.
    faqBillingAnswer_one:
      "Pro es gratis el primer {count} día. Te pedimos tu tarjeta al principio para que la prueba se vuelva suscripción sin que tengas que hacer nada — y te decimos, dentro de la app y con la cuenta regresiva de arriba de cada página, exactamente cuándo cae el primer cobro y de cuánto va a ser. Cancela antes de eso y no se te cobra nada. Los pagos los maneja Stripe, que guarda los datos de la tarjeta; nunca pasan por SimpleBooks.",
    faqBillingAnswer_other:
      "Pro es gratis los primeros {count} días. Te pedimos tu tarjeta al principio para que la prueba se vuelva suscripción sin que tengas que hacer nada — y te decimos, dentro de la app y con la cuenta regresiva de arriba de cada página, exactamente cuándo cae el primer cobro y de cuánto va a ser. Cancela antes de eso y no se te cobra nada. Los pagos los maneja Stripe, que guarda los datos de la tarjeta; nunca pasan por SimpleBooks.",

    // --- closing-cta.tsx
    closingTitle: "Empieza con las ventas de hoy",
    // {count} es TRIAL_DAYS, de pricing.ts.
    closingBody_one:
      "Con un registro basta para arrancar. Todo es gratis por {count} día — cancela antes de que se acabe y no pagas absolutamente nada.",
    closingBody_other:
      "Con un registro basta para arrancar. Todo es gratis por {count} días — cancela antes de que se acabe la semana y no pagas absolutamente nada.",

    // --- landing-footer.tsx
    footerNavLabel: "Pie de página",
    footerPrivacy: "Privacidad",
    footerTerms: "Términos",
    footerContact: "Contacto",
    footerPricing: "Precios",
    footerDisclaimer:
      "SimpleBooks es una herramienta para llevar tus registros, no un contador. No presenta tu declaración de impuestos ni te dice cuánto debes.",
  },

  lock: {
    // --- la pantalla de bloqueo
    preparing: "Preparando tus cuentas…",
    locked: "Bloqueado",
    enterPin: "Escribe tu PIN",
    blurb: "Tus cuentas quedan escondidas hasta que las desbloquees en este dispositivo.",
    pinLabel: "PIN",
    pinHint: "De 4 a 8 números.",
    checking: "Revisando…",
    unlock: "Desbloquear",
    pinWrong: "Ese PIN no coincide.",
    checkFailed: "No se pudo revisar ahora mismo. Intenta de nuevo.",
    tooManyTries: "Demasiados intentos",
    tooManyTriesBody: "Cierra sesión y vuelve a entrar si se te olvidó el PIN.",
    forgotten:
      "¿Se te olvidó? Cierra sesión, vuelve a entrar con tu correo y tu contraseña, y pon un PIN nuevo desde Herramientas.",

    // --- por qué se rechazó un PIN (pin.ts → pinProblemKey())
    pinLength: "Usa de 4 a 8 números.",
    pinRepetitive: "Ese es muy fácil de adivinar — prueba con algo menos repetitivo.",
    pinCommon: "Ese es uno de los PIN más usados — elige otro.",
  },

  receipt: {
    photoAlt: "Foto del recibo",
    add: "Agregar la foto del recibo",
    replace: "Cambiar la foto del recibo",
    remove: "Quitar la foto del recibo",
  },

  errors: {
    notFoundCode: "404",
    notFoundTitle: "No encontramos la página",
    notFoundBody: "La página que buscas no existe o la movieron de lugar.",
    goHome: "Ir al inicio",
    failedTitle: "Esta página no cargó",
    failedBody: "Algo salió mal de nuestro lado. Puedes recargar o volver al inicio.",
    tryAgain: "Intenta de nuevo",
  },
};
