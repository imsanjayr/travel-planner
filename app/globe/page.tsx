"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
// Dynamically import Globe to avoid SSR window access
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

export interface TransformedLocation {
  lat: number;
  lng: number;
  name: string;
  country: string;
}

export default function GlobePage() {
  const globeRef = useRef<any>(undefined);

  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(
    new Set()
  );
  const [locations, setLocations] = useState<TransformedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/trips", { credentials: "same-origin" });
        if (!response.ok) {
          const text = await response.text();
          console.error("API /api/trips failed:", response.status, text.slice(0, 200));
          setLocations([]);
          setVisitedCountries(new Set());
          return;
        }
        let data: TransformedLocation[] = [];
        try {
          data = await response.json();
        } catch (e) {
          const text = await response.text();
          console.error("Invalid JSON from /api/trips:", text.slice(0, 200));
          setLocations([]);
          setVisitedCountries(new Set());
          return;
        }
        setLocations(data);
        const countries = new Set<string>(data.map((loc: TransformedLocation) => loc.country));
        setVisitedCountries(countries);
      } catch (err) {
        console.error("Network error calling /api/trips:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    let intervalId: number | undefined;

    const apply = () => {
      const controls = globeRef.current?.controls?.();
      if (controls) {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.5;
        return true;
      }
      return false;
    };

    // Try immediately; if not ready, keep trying until it is
    if (!apply()) {
      intervalId = window.setInterval(() => {
        if (apply()) {
          if (intervalId) clearInterval(intervalId);
        }
      }, 100);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading, locations.length]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {" "}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center text-4xl font-bold mb-12">
            {" "}
            Your Travel Journey
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white ronded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {" "}
                  See where you've been...
                </h2>

                <div className="h-[600px] w-full relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900">
                        {" "}
                      </div>
                    </div>
                  ) : (
                    <Globe
                      ref={globeRef}
                      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                      backgroundColor="rgba(0,0,0,0)"
                      pointColor={() => "#FF5733"}
                      pointLabel="name"
                      pointsData={locations}
                                            pointAltitude={0.1}
                      pointsMerge={false}
                      pointRadius={0.3}
                      width={800}
                      height={600}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  {" "}
                  <CardTitle> Countries Visited</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900">
                        {" "}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          {" "}
                          You've visited{" "}
                          <span className="font-bold">
                            {" "}
                            {visitedCountries.size}
                          </span>{" "}
                          countries.
                        </p>
                      </div>

                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {Array.from(visitedCountries)
                          .sort()
                          .map((country, key) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 p-3 rounded-lg hover: bg-gray-50 transition-colors border border-gray-100"
                            >
                              <MapPin className="h-4 w-4 text-red-500" />
                              <span className="font-medium"> {country}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}