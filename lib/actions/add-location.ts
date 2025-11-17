"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

async function geocodeAddress(address: string) {
  // Try Google Geocoding API first when a key is provided
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${googleKey}`
      );

      if (response.ok) {
        const data = await response.json();
        const loc = data?.results?.[0]?.geometry?.location;
        if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
          return { lat: loc.lat, lng: loc.lng };
        }
      }
    } catch (err) {
      // swallow and fall through to fallback geocoder
    }
  }

  // Fallback: use OpenStreetMap Nominatim when Google doesn't return usable results
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
    address
  )}`;

  // Use a configurable User-Agent for Nominatim (required by their usage policy).
  // Set `NOMINATIM_USER_AGENT` in your environment (e.g. `.env.local`).
  const nominatimUserAgent = process.env.NOMINATIM_USER_AGENT ||
    "travel-planner/1.0 (contact: dev@localhost)";

  const nomRes = await fetch(nominatimUrl, {
    headers: {
      "User-Agent": nominatimUserAgent,
    },
  });

  if (!nomRes.ok) {
    throw new Error(`Geocoding API error: ${nomRes.status}`);
  }

  const nomData = await nomRes.json();
  if (Array.isArray(nomData) && nomData.length > 0) {
    const item = nomData[0];
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon ?? item.lng ?? NaN);
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      return { lat, lng };
    }
  }

  throw new Error(`No geocoding results found for address: ${address}`);
}

export async function addLocation(formData: FormData, tripId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const address = formData.get("address")?.toString();
  if (!address) {
    throw new Error("Missing address");
  }

  const { lat, lng } = await geocodeAddress(address);

  const count = await prisma.location.count({
    where: { tripId },
  });

  await prisma.location.create({
    data: {
      locationTitle: address,
      lat,
      lng,
      tripId,
      order: count,
    },
  });

  redirect(`/trips/${tripId}`);
}
