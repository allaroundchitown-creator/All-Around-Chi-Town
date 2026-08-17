export type DiscoveredBusiness = { provider: "GOOGLE_PLACES"; providerBusinessId: string; businessName: string; category: string; address?: string; city?: string; phone?: string; website?: string; mapsUrl?: string; rating?: number; reviewCount?: number; latitude?: number; longitude?: number; };

type GooglePlace = { id: string; displayName?: { text?: string }; formattedAddress?: string; nationalPhoneNumber?: string; websiteUri?: string; googleMapsUri?: string; rating?: number; userRatingCount?: number; location?: { latitude?: number; longitude?: number }; addressComponents?: Array<{ longText?: string; types?: string[] }> };

export function parseGooglePlace(place: GooglePlace, category: string): DiscoveredBusiness {
  const city = place.addressComponents?.find((part) => part.types?.includes("locality"))?.longText
    ?? place.addressComponents?.find((part) => part.types?.includes("postal_town"))?.longText;
  return { provider: "GOOGLE_PLACES", providerBusinessId: place.id, businessName: place.displayName?.text ?? "Unknown business", category, address: place.formattedAddress, city, phone: place.nationalPhoneNumber, website: place.websiteUri, mapsUrl: place.googleMapsUri, rating: place.rating, reviewCount: place.userRatingCount, latitude: place.location?.latitude, longitude: place.location?.longitude };
}

export async function discoverBusinesses(category: string, location: string, maxResults: number) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("Google Places is not configured. Add GOOGLE_PLACES_API_KEY.");
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", { method: "POST", signal: controller.signal,
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.nationalPhoneNumber,places.websiteUri,places.googleMapsUri,places.rating,places.userRatingCount,places.location" },
      body: JSON.stringify({ textQuery: `${category} in ${location}, Illinois`, maxResultCount: Math.min(maxResults, 20), languageCode: "en", regionCode: "US" }),
    });
    if (!response.ok) throw new Error(`Google Places request failed (${response.status}).`);
    const data = await response.json() as { places?: GooglePlace[] };
    return (data.places ?? []).map((place) => parseGooglePlace(place, category));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("Google Places timed out. Please try again.");
    throw error;
  } finally { clearTimeout(timeout); }
}
