export const DEFAULT_CATEGORIES = [
  "Wedding planner", "Event planner", "Wedding venue", "Banquet hall", "DJ",
  "Event decorator", "Balloon decorator", "Party planner", "Quinceañera planner",
  "Corporate event planner", "Birthday venue", "Photographer", "Caterer", "Party rental company",
] as const;

export const DEFAULT_LOCATIONS = [
  "Chicago", "Skokie", "Evanston", "Niles", "Morton Grove", "Lincolnwood",
  "Northbrook", "Glenview", "Des Plaines", "Park Ridge", "Schaumburg", "Arlington Heights",
] as const;

export const DEFAULT_LIMITS = {
  maxSearchesPerDay: 6,
  maxBusinessesPerDay: 40,
  maxWebsitePagesPerLead: 3,
  maxAiQualificationsPerDay: 10,
} as const;

export const LEAD_STATUSES = ["NEW", "RESEARCHED", "CONTACTED", "RESPONDED", "INTERESTED", "QUOTE_SENT", "DEPOSIT_SENT", "BOOKED", "LOST", "NOT_INTERESTED"] as const;
