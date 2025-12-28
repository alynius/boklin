/**
 * Swedish translations and locale configuration
 */

export const sv = {
  // Common
  common: {
    loading: "Laddar...",
    save: "Spara",
    cancel: "Avbryt",
    delete: "Ta bort",
    edit: "Redigera",
    back: "Tillbaka",
    next: "Nästa",
    confirm: "Bekräfta",
    close: "Stäng",
    search: "Sök",
    filter: "Filter",
    sort: "Sortera",
    required: "Obligatoriskt",
    optional: "Valfritt",
  },

  // Navigation
  nav: {
    home: "Hem",
    dashboard: "Instrumentpanel",
    bookings: "Bokningar",
    availability: "Tillgänglighet",
    eventTypes: "Mötestyper",
    settings: "Inställningar",
    signIn: "Logga in",
    signOut: "Logga ut",
    signUp: "Registrera dig",
  },

  // Auth
  auth: {
    signInTitle: "Logga in på Boklin",
    signInDescription: "Välj hur du vill logga in",
    signInWithGoogle: "Logga in med Google",
    signUpTitle: "Skapa ett konto",
    signUpDescription: "Kom igång gratis på några sekunder",
    forgotPassword: "Glömt lösenordet?",
    noAccount: "Har du inget konto?",
    hasAccount: "Har du redan ett konto?",
  },

  // Booking
  booking: {
    selectDate: "Välj datum",
    selectTime: "Välj tid",
    yourDetails: "Dina uppgifter",
    name: "Namn",
    email: "E-post",
    phone: "Telefon",
    notes: "Anteckningar",
    notesPlaceholder: "Något du vill dela med mötesvärden?",
    bookButton: "Boka möte",
    confirmTitle: "Bekräfta din bokning",
    confirmDescription: "Granska din bokning innan du bekräftar",
    successTitle: "Bokning bekräftad!",
    successDescription: "Du kommer att få en bekräftelse via e-post",
    cancelTitle: "Avboka möte",
    cancelConfirm: "Är du säker på att du vill avboka detta möte?",
    cancelReason: "Anledning till avbokning",
    noSlotsAvailable: "Inga tider tillgängliga",
    duration: "Längd",
    location: "Plats",
    price: "Pris",
    free: "Gratis",
  },

  // Event types
  eventType: {
    title: "Mötestyper",
    create: "Skapa mötestyp",
    edit: "Redigera mötestyp",
    name: "Namn",
    slug: "URL-slug",
    description: "Beskrivning",
    duration: "Längd (minuter)",
    price: "Pris (SEK)",
    location: "Plats",
    locations: {
      in_person: "Fysiskt möte",
      phone: "Telefonsamtal",
      video: "Videomöte",
      custom: "Anpassad plats",
    },
    active: "Aktiv",
    inactive: "Inaktiv",
    requiresConfirmation: "Kräver bekräftelse",
    bufferBefore: "Buffert före (minuter)",
    bufferAfter: "Buffert efter (minuter)",
    minNotice: "Minsta framförhållning (timmar)",
    maxFuture: "Max framtid (dagar)",
  },

  // Availability
  availability: {
    title: "Tillgänglighet",
    setHours: "Ställ in dina arbetstider",
    addSlot: "Lägg till tid",
    removeSlot: "Ta bort tid",
    copyToAll: "Kopiera till alla dagar",
    unavailable: "Otillgänglig",
  },

  // Dashboard
  dashboard: {
    welcome: "Välkommen",
    upcomingBookings: "Kommande bokningar",
    noUpcoming: "Inga kommande bokningar",
    todayBookings: "Dagens bokningar",
    thisWeek: "Denna vecka",
    thisMonth: "Denna månad",
    totalBookings: "Totalt antal bokningar",
    shareLink: "Din bokningslänk",
    copyLink: "Kopiera länk",
    linkCopied: "Länk kopierad!",
  },

  // Settings
  settings: {
    title: "Inställningar",
    profile: "Profil",
    account: "Konto",
    notifications: "Notifikationer",
    integrations: "Integrationer",
    timezone: "Tidszon",
    language: "Språk",
    username: "Användarnamn",
    usernameHint: "Detta syns i din bokningslänk",
    displayName: "Visningsnamn",
    email: "E-post",
    avatar: "Profilbild",
    calendarSync: "Kalendersynkronisering",
    connectGoogle: "Koppla Google Kalender",
    connectOutlook: "Koppla Outlook Kalender",
    connected: "Ansluten",
    disconnect: "Koppla från",
  },

  // Status
  status: {
    pending: "Väntande",
    confirmed: "Bekräftad",
    cancelled: "Avbokad",
    completed: "Genomförd",
  },

  // Errors
  errors: {
    generic: "Något gick fel. Försök igen.",
    notFound: "Sidan kunde inte hittas",
    unauthorized: "Du måste vara inloggad för att se denna sida",
    forbidden: "Du har inte behörighet att se denna sida",
    validation: "Kontrollera att alla fält är korrekt ifyllda",
    network: "Kunde inte ansluta till servern",
  },

  // Time
  time: {
    today: "Idag",
    tomorrow: "Imorgon",
    yesterday: "Igår",
    minutes: "minuter",
    hours: "timmar",
    days: "dagar",
  },
} as const;

export type Translations = typeof sv;
