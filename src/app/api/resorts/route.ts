import { NextResponse } from "next/server";
import { MOCK_RESORTS } from "@/data/resorts";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");
  const category = searchParams.get("category");
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : null;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : null;

  // 1. Try to fetch from backend Express server if available
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const backendRes = await fetch(`${BACKEND_URL}/api/resorts`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (backendRes.ok) {
      const data = await backendRes.json();
      if (Array.isArray(data?.data) && data.data.length > 0) {
        return NextResponse.json({
          success: true,
          source: "backend-express",
          count: data.data.length,
          data: data.data,
        });
      }
    }
  } catch {
    // Backend server offline, proceed with local dataset
  }

  // 2. Return local mock resorts with filter logic
  let results = [...MOCK_RESORTS].filter((r) => r.status === "active");

  if (destination && destination.trim() !== "" && destination.toLowerCase() !== "all") {
    const q = destination.toLowerCase().trim();
    results = results.filter(
      (r) =>
        r.destination.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q)
    );
  }

  if (category && category !== "all") {
    results = results.filter((r) => r.category === category);
  }

  if (minPrice !== null) {
    results = results.filter((r) => r.pricePerNight >= minPrice);
  }

  if (maxPrice !== null) {
    results = results.filter((r) => r.pricePerNight <= maxPrice);
  }

  return NextResponse.json({
    success: true,
    source: "nextjs-internal-api",
    count: results.length,
    data: results,
  });
}
