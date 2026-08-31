import type { ClientLocale } from "@/types/client-portal";

export const clientCopy = {
  en: {
    portal: "My KeyHold",
    overview: "Overview",
    saved: "Saved Properties",
    watchlist: "Watchlist",
    comparisons: "Saved Comparisons",
    portfolio: "Portfolio",
    payments: "Payment Calendar",
    construction: "Construction",
    documents: "Documents",
    analyses: "Saved Analyses",
    notifications: "Notifications",
    advisor: "Advisor",
    profile: "Profile",
    signOut: "Sign out",
    signIn: "Sign in",
    register: "Create account",
  },
  fr: {
    portal: "Mon KeyHold",
    overview: "Vue d’ensemble",
    saved: "Biens enregistrés",
    watchlist: "Veille",
    comparisons: "Comparaisons enregistrées",
    portfolio: "Portefeuille",
    payments: "Calendrier des paiements",
    construction: "Construction",
    documents: "Documents",
    analyses: "Analyses enregistrées",
    notifications: "Notifications",
    advisor: "Conseiller",
    profile: "Profil",
    signOut: "Se déconnecter",
    signIn: "Se connecter",
    register: "Créer un compte",
  },
} as const;

export function clientPath(locale: ClientLocale, path = ""): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return locale === "fr" ? `/fr/account${normalized === "/" ? "" : normalized}` : `/account${normalized === "/" ? "" : normalized}`;
}

export function clientEnumLabel(locale: ClientLocale, value: string): string {
  if (locale === "en") return value.replaceAll("-", " ");
  const fr: Record<string, string> = {
    "reserved": "réservé", "contracted": "sous contrat", "under-construction": "en construction", "handed-over": "livré", "rented": "loué", "sold": "vendu",
    "price-below": "prix sous le seuil", "construction-reaches": "construction atteint le seuil", "new-unit": "nouvelle unité",
    "active": "actif", "paused": "en pause", "upcoming": "à venir", "due": "dû", "paid": "payé", "overdue": "en retard", "waived": "annulé",
    "Off-Plan": "Sur plan", "Ready": "Prêt", "Short-Term": "Location courte durée", "Long-Term": "Location longue durée", "custom": "personnalisé"
  };
  return fr[value] ?? value.replaceAll("-", " ");
}
