import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, MapPin, Tent, Calendar, Filter as FilterIcon } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Search() {
  const [, setLocation] = useLocation();
  
  const [searchParams, setSearchParams] = useState<{
    state: string;
    city: string;
    campgroundType: ("tent" | "rv" | "cabin" | "dispersed" | "group" | "mixed")[];
    limit: number;
    offset: number;
  }>({
    state: "",
    city: "",
    campgroundType: [],
    limit: 50,
    offset: 0,
  });

  const [showFilters, setShowFilters] = useState(true);
  const [campgroundImages, setCampgroundImages] = useState<Record<number, string>>({});
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<number, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<number, boolean>>({});

  const { data: campgrounds, isLoading, error } = trpc.campgrounds.search.useQuery(searchParams);

  // Fetch images for all campgrounds
  useEffect(() => {
    if (!campgrounds || campgrounds.length === 0) return;

    // Fetch images for each campground with a small delay to avoid rate limiting
    campgrounds.forEach((campground, index) => {
      // Skip if we already have an image or error for this campground
      if (campgroundImages[campground.id] || imageErrorStates[campground.id]) return;

      // Stagger requests by 100ms each to avoid overwhelming the API
      setTimeout(async () => {
        try {
          const response = await fetch(`/api/trpc/images.getCampgroundImages?input=${encodeURIComponent(JSON.stringify({
            campgroundName: campground.name,
            city: campground.city,
            state: campground.state,
            campgroundType: campground.campgroundType,
            limit: 1,
          }))}`);
          
          const data = await response.json();
          
          if (data.result?.data && data.result.data.length > 0) {
            setCampgroundImages(prev => ({
              ...prev,
              [campground.id]: data.result.data[0].thumbnail,
            }));
            setImageLoadingStates(prev => ({
              ...prev,
              [campground.id]: true,
            }));
          }
        } catch (error) {
          console.error(`Failed to fetch image for campground ${campground.id}:`, error);
          setImageErrorStates(prev => ({
            ...prev,
            [campground.id]: true,
          }));
        }
      }, index * 100); // Stagger by 100ms
    });
  }, [campgrounds, campgroundImages, imageErrorStates]);

  const handleImageLoad = (campgroundId: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [campgroundId]: false,
    }));
  };

  const handleImageError = (campgroundId: number) => {
    setImageLoadingStates(prev => ({
      ...prev,
      [campgroundId]: false,
    }));
    setImageErrorStates(prev => ({
      ...prev,
      [campgroundId]: true,
    }));
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, offset: 0 });
  };

  const toggleCampgroundType = (type: "tent" | "rv" | "cabin" | "dispersed" | "group" | "mixed") => {
    setSearchParams(prev => ({
      ...prev,
      campgroundType: prev.campgroundType.includes(type)
        ? prev.campgroundType.filter(t => t !== type)
        : [...prev.campgroundType, type]
    }));
  };

  const US_STATES = [
    { code: "AL", name: "Alabama" },
    { code: "AK", name: "Alaska" },
    { code: "AZ", name: "Arizona" },
    { code: "AR", name: "Arkansas" },
    { code: "CA", name: "California" },
    { code: "CO", name: "Colorado" },
    { code: "CT", name: "Connecticut" },
    { code: "DE", name: "Delaware" },
    { code: "FL", name: "Florida" },
    { code: "GA", name: "Georgia" },
    { code: "HI", name: "Hawaii" },
    { code: "ID", name: "Idaho" },
    { code: "IL", name: "Illinois" },
    { code: "IN", name: "Indiana" },
    { code: "IA", name: "Iowa" },
    { code: "KS", name: "Kansas" },
    { code: "KY", name: "Kentucky" },
    { code: "LA", name: "Louisiana" },
    { code: "ME", name: "Maine" },
    { code: "MD", name: "Maryland" },
    { code: "MA", name: "Massachusetts" },
    { code: "MI", name: "Michigan" },
    { code: "MN", name: "Minnesota" },
    { code: "MS", name: "Mississippi" },
    { code: "MO", name: "Missouri" },
    { code: "MT", name: "Montana" },
    { code: "NE", name: "Nebraska" },
    { code: "NV", name: "Nevada" },
    { code: "NH", name: "New Hampshire" },
    { code: "NJ", name: "New Jersey" },
    { code: "NM", name: "New Mexico" },
    { code: "NY", name: "New York" },
    { code: "NC", name: "North Carolina" },
    { code: "ND", name: "North Dakota" },
    { code: "OH", name: "Ohio" },
    { code: "OK", name: "Oklahoma" },
    { code: "OR", name: "Oregon" },
    { code: "PA", name: "Pennsylvania" },
    { code: "RI", name: "Rhode Island" },
    { code: "SC", name: "South Carolina" },
    { code: "SD", name: "South Dakota" },
    { code: "TN", name: "Tennessee" },
    { code: "TX", name: "Texas" },
    { code: "UT", name: "Utah" },
    { code: "VT", name: "Vermont" },
    { code: "VA", name: "Virginia" },
    { code: "WA", name: "Washington" },
    { code: "WV", name: "West Virginia" },
    { code: "WI", name: "Wisconsin" },
    { code: "WY", name: "Wyoming" },
  ];

  return (
    <div className="min-h-screen bg-background">
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
                <a className="text-sm font-medium hover:text-primary">Search</a>
              </Link>
              <Link href="/map">
                <a className="text-sm font-medium hover:text-primary">Map View</a>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FilterIcon className="h-5 w-5" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    {showFilters ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {showFilters && (
                <CardContent className="space-y-6">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={searchParams.state}
                      onValueChange={(value) => setSearchParams({ ...searchParams, state: value })}
                    >
                      <SelectTrigger id="state">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(state => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Enter city name"
                      value={searchParams.city}
                      onChange={(e) => setSearchParams({ ...searchParams, city: e.target.value })}
                    />
                  </div>

                  <Separator />

                  {/* Campground Type */}
                  <div className="space-y-3">
                    <Label>Campground Type</Label>
                    {(["tent", "rv", "cabin", "dispersed", "group", "mixed"] as const).map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={searchParams.campgroundType.includes(type)}
                          onCheckedChange={() => toggleCampgroundType(type)}
                        />
                        <label
                          htmlFor={`type-${type}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleSearch} className="w-full">
                    Apply Filters
                  </Button>
                </CardContent>
              )}
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Find Your Perfect Campsite</h1>
              <Link href="/map">
                <Button variant="outline" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Map View
                </Button>
              </Link>
            </div>

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {error && (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <p className="text-destructive">Error loading campgrounds: {error.message}</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && campgrounds && campgrounds.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-muted-foreground">No campgrounds found. Try adjusting your filters or load sample data.</p>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && campgrounds && campgrounds.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {campgrounds.length} campground{campgrounds.length !== 1 ? 's' : ''}
                </p>
                {campgrounds.map((campground) => (
                  <Card 
                    key={campground.id} 
                    className="hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => setLocation(`/campground/${campground.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setLocation(`/campground/${campground.id}`);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`View details for ${campground.name} in ${campground.city}, ${campground.state}`}
                  >
                      {campgroundImages[campground.id] && (
                        <div className="relative h-48 w-full overflow-hidden bg-muted">
                          {imageLoadingStates[campground.id] && !imageErrorStates[campground.id] && (
                            <Skeleton className="absolute inset-0 w-full h-full" />
                          )}
                          {imageErrorStates[campground.id] ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                              <Tent className="h-16 w-16 text-muted-foreground/40" />
                              <p className="text-xs text-muted-foreground">Image unavailable</p>
                            </div>
                          ) : (
                            <img
                              src={campgroundImages[campground.id]}
                              alt={campground.name}
                              className={`w-full h-full object-cover transition-opacity duration-300 ${
                                imageLoadingStates[campground.id] ? 'opacity-0' : 'opacity-100'
                              }`}
                              loading="lazy"
                              onLoad={() => handleImageLoad(campground.id)}
                              onError={() => handleImageError(campground.id)}
                            />
                          )}
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle>{campground.name}</CardTitle>
                            <CardDescription className="space-y-1">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {campground.city}, {campground.state}
                              </div>
                              {campground.address && (
                                <div className="text-xs text-muted-foreground">
                                  {campground.address}
                                </div>
                              )}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {campground.campgroundType}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {campground.description || "No description available"}
                        </p>
                        {campground.managingOrganization && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Managed by {campground.managingOrganization}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
