import { describe, expect, it } from "vitest";
import { parseGooglePlace } from "@/lib/search/google-places";
describe("search parsing", () => { it("maps Google Places fields", () => { const result = parseGooglePlace({ id: "p1", displayName: { text: "Windy City Events" }, formattedAddress: "1 State St", addressComponents: [{ longText: "Chicago", types: ["locality"] }], rating: 4.8, userRatingCount: 25 }, "Event planner"); expect(result).toMatchObject({ providerBusinessId: "p1", businessName: "Windy City Events", city: "Chicago", reviewCount: 25 }); }); });
