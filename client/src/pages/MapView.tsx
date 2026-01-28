import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tent, List, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { MapView as GoogleMapView } from "@/components/Map";
import { Badge } from "@/components/ui/badge";

export default function MapView() {
  const [selectedCampground, setSelectedCampground] = useState<any>(null);

  // Fetch all campgrounds for map markers
  const { data: campgrounds, isLoading } = trpc.campgrounds.search.useQuery({
    limit: 500,
  });

  const handleMapReady = useCallback((map: google.maps.Map) => {
    if (!campgrounds || campgrounds.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const infoWindow = new window.google.maps.InfoWindow();

    // Create markers for each campground
    campgrounds.forEach((campground) => {
      if (!campground.latitude || !campground.longitude) return;

      const lat = parseFloat(campground.latitude);
      const lng = parseFloat(campground.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const position = { lat, lng };
      bounds.extend(position);

      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        title: campground.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#16a34a", // primary green
          fillOpacity: 0.8,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      // Add click listener
      marker.addListener("click", () => {
        setSelectedCampground(campground);
        
        const content = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 4px;">${campground.name}</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 8px;">
              ${campground.city}, ${campground.state}
            </p>
            <p style="font-size: 13px; margin-bottom: 8px;">
              ${campground.description?.substring(0, 100) || 'No description available'}...
            </p>
            <a href="/campground/${campground.id}" style="color: #16a34a; font-weight: 500; text-decoration: none;">
              View Details →
            </a>
          </div>
        `;
        
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
    });

    // Fit map to show all markers
    if (campgrounds.length > 0) {
      map.fitBounds(bounds);
    }
  }, [campgrounds]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <a className="flex items-center gap-2 text-2xl font-bold text-primary">
                <Tent className="h-8 w-8" />
                CampFinder
              </a>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/search">
                <Button variant="outline" className="gap-2">
                  <List className="h-4 w-4" />
                  List View
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading campgrounds...</p>
            </div>
          </div>
        )}

        <GoogleMapView
          initialCenter={{ lat: 39.8283, lng: -98.5795 }}
          initialZoom={4}
          onMapReady={handleMapReady}
          className="w-full h-full"
        />

        {/* Selected Campground Card */}
        {selectedCampground && (
          <Card className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto md:w-96 shadow-lg z-20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle>{selectedCampground.name}</CardTitle>
                  <CardDescription>
                    {selectedCampground.city}, {selectedCampground.state}
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {selectedCampground.campgroundType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {selectedCampground.description || "No description available"}
              </p>
              {selectedCampground.managingOrganization && (
                <p className="text-xs text-muted-foreground">
                  Managed by {selectedCampground.managingOrganization}
                </p>
              )}
              <Link href={`/campground/${selectedCampground.id}`}>
                <Button className="w-full">View Details</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Stats Card */}
        {!isLoading && campgrounds && (
          <Card className="absolute top-4 right-4 shadow-lg z-20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{campgrounds.length}</p>
                <p className="text-sm text-muted-foreground">Campgrounds</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
