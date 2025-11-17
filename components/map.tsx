"use client";

import { useCallback } from "react";
import { Location } from "@/app/generated/prisma";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

interface MapProps {
  itineraries: Location[];
}

export default function Map({ itineraries }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries: ["places"],
  });
  const onLoad = useCallback((map: google.maps.Map) => {
    if (!itineraries || itineraries.length === 0) return;

    try {
      const bounds = new window.google.maps.LatLngBounds();
      itineraries.forEach((loc) => {
        bounds.extend({ lat: loc.lat, lng: loc.lng } as google.maps.LatLngLiteral);
      });

      if (itineraries.length === 1) {
        map.setCenter(bounds.getCenter() as google.maps.LatLng);
        map.setZoom(8);
      } else {
        map.fitBounds(bounds);
      }
    } catch (e) {
      // noop if google not available or fitBounds fails
    }
  }, [itineraries]);
  if (loadError) return <div>Error loading maps: {loadError.message}</div>;
  if (!isLoaded) return <div>Loading maps...</div>;

  const center =
    itineraries.length > 0
      ? { lat: itineraries[0].lat, lng: itineraries[0].lng }
      : { lat: 0, lng: 0 };
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      zoom={8}
      center={center}
      onLoad={onLoad}
    >
      {itineraries.map((location, key) => (
        <Marker
          key={key}
          position={{ lat: location.lat, lng: location.lng }}
          title={location.locationTitle}
        />
      ))}
    </GoogleMap>
  );
}