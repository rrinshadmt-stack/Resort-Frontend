import { Resort, SearchFilterParams } from "@/types/resort";
import { MOCK_RESORTS } from "@/data/resorts";
import { MOCK_ROOMS } from "@/data/rooms";
import { MOCK_REVIEWS } from "@/data/reviews";
import { RoomType } from "@/types/resort";
import { Review } from "@/types/review";

export interface ResortsApiResponse {
  success: boolean;
  resorts: Resort[];
  total: number;
  source: "backend-express" | "nextjs-internal-api" | "mock-fallback";
  isLive: boolean;
  message?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch resorts with dynamic filtering & sorting, integrating backend Express API & mock fallback
 */
export async function fetchResorts(filters?: SearchFilterParams): Promise<ResortsApiResponse> {
  const query = new URLSearchParams();
  if (filters?.destination) query.set("destination", filters.destination);
  if (filters?.category) query.set("category", filters.category);
  if (filters?.minPrice !== undefined) query.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice !== undefined) query.set("maxPrice", String(filters.maxPrice));
  if (filters?.minRating !== undefined) query.set("minRating", String(filters.minRating));
  if (filters?.sortBy) query.set("sortBy", filters.sortBy);

  // 1. Try Next.js internal API endpoint first (which also tries Express)
  try {
    const res = await fetch(`/api/resorts?${query.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data?.data)) {
        // Map backend objects to frontend Resort interface if needed
        const mapped: Resort[] = data.data.map((item: any, idx: number) => {
          // If already matches frontend model:
          if (item.featuredImage && item.pricePerNight) return item;
          // If backend Mongoose model shape:
          return {
            id: item._id || item.id || `res-${idx + 1}`,
            name: item.name || "Luxury Resort",
            slug: item.slug || "luxury-resort",
            tagline: item.tagline || item.description?.slice(0, 80) || "Experience serene hospitality",
            description: item.description || "A luxury hospitality retreat.",
            ownerId: item.ownerId || "owner-01",
            ownerName: item.ownerName || "Aura Host",
            category: (item.category as any) || "villas",
            destination: item.destination || item.location || "Maldives",
            city: item.city || item.location?.split(",")[0]?.trim() || "Paradise",
            country: item.country || item.location?.split(",")[1]?.trim() || "Island",
            address: item.address || item.location || "Coastal Highway",
            rating: item.rating || 4.8,
            reviewCount: item.reviewCount || 42,
            pricePerNight: item.pricePerNight || 240,
            originalPrice: item.originalPrice || Math.round((item.pricePerNight || 240) * 1.25),
            currency: item.currency || "$",
            images: item.images?.length > 0 ? item.images : [
              "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
            ],
            featuredImage:
              item.featuredImage ||
              item.images?.[0] ||
              "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
            amenities: item.amenities || ["Ocean View", "Infinity Pool", "Free WiFi", "Spa"],
            status: item.isAvailable === false ? "suspended" : "active",
            checkInTime: item.checkInTime || "14:00",
            checkOutTime: item.checkOutTime || "11:00",
            rules: item.rules || ["No smoking", "Pets allowed on request"],
            cancellationPolicy: item.cancellationPolicy || "Free cancellation up to 48 hours before check-in",
            isFeatured: item.isFeatured ?? true,
            totalRooms: item.totalRooms || 24,
            createdAt: item.createdAt || "2026-01-01",
          };
        });

        return {
          success: true,
          resorts: mapped,
          total: mapped.length,
          source: data.source || "nextjs-internal-api",
          isLive: data.source === "backend-express",
        };
      }
    }
  } catch (err) {
    console.warn("API resort fetch error, falling back to mock dataset:", err);
  }

  // 2. Direct Mock Filter Fallback
  let results = [...MOCK_RESORTS].filter((r) => r.status === "active");

  if (filters?.destination && filters.destination.trim() !== "" && filters.destination.toLowerCase() !== "all") {
    const q = filters.destination.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.destination.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
    );
  }

  if (filters?.category && filters.category !== "all") {
    results = results.filter((r) => r.category === filters.category);
  }

  if (filters?.minPrice !== undefined) {
    results = results.filter((r) => r.pricePerNight >= filters.minPrice!);
  }

  if (filters?.maxPrice !== undefined) {
    results = results.filter((r) => r.pricePerNight <= filters.maxPrice!);
  }

  if (filters?.minRating !== undefined) {
    results = results.filter((r) => r.rating >= filters.minRating!);
  }

  if (filters?.amenities && filters.amenities.length > 0) {
    results = results.filter((r) =>
      filters.amenities!.every((reqAmenity) =>
        r.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
      )
    );
  }

  if (filters?.sortBy === "price-low") {
    results.sort((a, b) => a.pricePerNight - b.pricePerNight);
  } else if (filters?.sortBy === "price-high") {
    results.sort((a, b) => b.pricePerNight - a.pricePerNight);
  } else if (filters?.sortBy === "rating") {
    results.sort((a, b) => b.rating - a.rating);
  }

  return {
    success: true,
    resorts: results,
    total: results.length,
    source: "mock-fallback",
    isLive: false,
  };
}

/**
 * Fetch a single resort by ID from API with mock fallback
 */
export async function fetchResortById(id: string): Promise<{ resort: Resort | null; isLive: boolean }> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/resorts/${id}`, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data) {
        const item = data.data;
        const resort: Resort = {
          id: item._id || item.id,
          name: item.name || "Luxury Resort",
          slug: item.slug || "luxury-resort",
          tagline: item.tagline || item.description?.slice(0, 80) || "Experience luxurious tranquility",
          description: item.description || "A luxury hospitality retreat.",
          ownerId: item.ownerId || "owner-01",
          ownerName: item.ownerName || "Aura Host",
          category: (item.category as any) || "villas",
          destination: item.destination || item.location || "Maldives",
          city: item.city || item.location?.split(",")[0]?.trim() || "Maldives",
          country: item.country || item.location?.split(",")[1]?.trim() || "Maldives",
          address: item.address || item.location || "Crystal Lagoon Atoll",
          rating: item.rating || 4.9,
          reviewCount: item.reviewCount || 38,
          pricePerNight: item.pricePerNight || 320,
          originalPrice: item.originalPrice || Math.round((item.pricePerNight || 320) * 1.25),
          currency: item.currency || "$",
          images: item.images?.length > 0 ? item.images : [
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80"
          ],
          featuredImage:
            item.featuredImage ||
            item.images?.[0] ||
            "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80",
          amenities: item.amenities || ["Ocean View", "Infinity Pool", "Free WiFi"],
          status: item.isAvailable === false ? "suspended" : "active",
          checkInTime: item.checkInTime || "14:00",
          checkOutTime: item.checkOutTime || "11:00",
          rules: item.rules || ["No smoking", "Pets allowed on request"],
          cancellationPolicy: item.cancellationPolicy || "Free cancellation up to 48 hours before check-in",
          isFeatured: item.isFeatured ?? true,
          totalRooms: item.totalRooms || 20,
          createdAt: item.createdAt || "2026-01-01",
        };
        return { resort, isLive: true };
      }
    }
  } catch {
    // Backend offline
  }

  const found = MOCK_RESORTS.find((r) => r.id === id) || null;
  return { resort: found, isLive: false };
}

/**
 * Fetch rooms for a resort
 */
export async function fetchResortRooms(resortId: string): Promise<RoomType[]> {
  const rooms = MOCK_ROOMS.filter((rm) => rm.resortId === resortId);
  return rooms.length > 0 ? rooms : MOCK_ROOMS.slice(0, 2);
}

/**
 * Fetch reviews for a resort
 */
export async function fetchResortReviews(resortId: string): Promise<Review[]> {
  return MOCK_REVIEWS.filter((rev) => rev.resortId === resortId);
}
