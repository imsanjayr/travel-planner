import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET() {
  try {
    // Restrict to the authenticated user's trips
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locations = await prisma.location.findMany({
      where: {
        trip: { userId: session.user.id },
      },
      select: {
        lat: true,
        lng: true,
        locationTitle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter out invalid coordinates
    const valid = locations.filter(
      (loc) => Number.isFinite(loc.lat) && Number.isFinite(loc.lng)
    );

    // Transform to the shape expected by the globe page.
    const transformed = valid.map((loc) => {
      const name = loc.locationTitle || "Location";
      // Naive country parse: take last comma-separated segment as country if present
      let country = "";
      const parts = name.split(",").map((s) => s.trim());
      if (parts.length > 1) {
        country = parts[parts.length - 1];
      } else {
        country = name; // fallback
      }
      return {
        lat: loc.lat,
        lng: loc.lng,
        name,
        country,
      };
    });

    console.log(`/api/trips: returning ${transformed.length} of ${locations.length} locations`);
    return NextResponse.json(transformed);
  } catch (err) {
    console.error("/api/trips error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
