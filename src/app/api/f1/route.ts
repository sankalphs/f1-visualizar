import { NextResponse } from "next/server";

const BASE_URL = "https://api.openf1.org/v1";

// Simple in-memory cache for server-side
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_TTL = 30_000; // 30 seconds

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  // Build upstream URL
  const upstream = new URL(`${BASE_URL}/${endpoint}`);
  for (const [key, value] of searchParams.entries()) {
    if (key !== "endpoint") {
      upstream.searchParams.append(key, value);
    }
  }

  const cacheKey = upstream.toString();
  const now = Date.now();

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > now) {
    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, s-maxage=30",
        "X-Cache": "HIT",
      },
    });
  }

  try {
    const response = await fetch(upstream.toString(), {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      // Return cached data if available, even if expired
      if (cached) {
        return NextResponse.json(cached.data, {
          headers: { "X-Cache": "STALE" },
        });
      }
      return NextResponse.json(
        { error: `Upstream ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Store in cache
    cache.set(cacheKey, { data, expiry: now + CACHE_TTL });

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=30",
        "X-Cache": "MISS",
      },
    });
  } catch {
    // Return cached data on network error
    if (cached) {
      return NextResponse.json(cached.data, {
        headers: { "X-Cache": "STALE" },
      });
    }
    return NextResponse.json(
      { error: "Network error" },
      { status: 502 }
    );
  }
}
