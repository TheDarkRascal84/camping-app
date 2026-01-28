import { useCallback, useState } from "react";
import { useRoute, Link } from "wouter";
import useEmblaCarousel from "embla-carousel-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tent, MapPin, Phone, ExternalLink, Loader2, Calendar, DollarSign, Users, Truck, Droplet, Zap, Trash2, Flame, Utensils, Dog, Accessibility } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingForm } from "@/components/BookingForm";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { addMonths, subMonths } from "date-fns";

export default function CampgroundDetail() {
  const [, params] = useRoute("/campground/:id");
  const campgroundId = params?.id ? parseInt(params.id) : 0;
  const [calendarStartDate, setCalendarStartDate] = useState(new Date());
  const [calendarEndDate, setCalendarEndDate] = useState(() => addMonths(new Date(), 3));

  const { data: campground, isLoading: campgroundLoading } = trpc.campgrounds.getById.useQuery(
    { id: campgroundId },
    { enabled: campgroundId > 0 }
  );

  const { data: sites, isLoading: sitesLoading } = trpc.campgrounds.getSites.useQuery(
    { campgroundId },
    { enabled: campgroundId > 0 }
  );

  const { data: amenities, isLoading: amenitiesLoading } = trpc.campgrounds.getAmenities.useQuery(
    { campgroundId },
    { enabled: campgroundId > 0 }
  );

  // Fetch booked dates for calendar
  const { data: bookedDates } = trpc.bookings.getBookedDates.useQuery(
    {
      campgroundId,
      startDate: calendarStartDate,
      endDate: calendarEndDate,
    },
    { enabled: campgroundId > 0 }
  );

  // Fetch images for carousel
  const { data: images, isLoading: imagesLoading } = trpc.images.getCampgroundImages.useQuery(
    {
      campgroundName: campground?.name || "",
      city: campground?.city || "",
      state: campground?.state || "",
      campgroundType: campground?.campgroundType || "tent",
      limit: 6,
      campgroundId: campgroundId, // Pass ID for caching
    },
    { enabled: !!campground && campgroundId > 0 }
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (campgroundLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!campground) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container py-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Tent className="h-8 w-8" />
              CampFinder
            </Link>
          </div>
        </header>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Campground Not Found</h1>
          <Button asChild>
            <Link href="/search">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  const getSiteIcon = (type: string) => {
    switch (type) {
      case "rv": return <Truck className="h-4 w-4" />;
      case "cabin": return <Tent className="h-4 w-4" />;
      default: return <Tent className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Tent className="h-8 w-8" />
              CampFinder
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/search">Back to Search</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Image Carousel */}
      {images && images.length > 0 && (
        <div className="relative bg-black">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {images.map((image, index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0">
                  <div className="relative h-[400px] md:h-[500px]">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <p className="text-white text-xs">{image.credit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all"
            aria-label="Previous image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-3 shadow-lg transition-all"
            aria-label="Next image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container py-12">
          <div className="max-w-4xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{campground.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{campground.city}, {campground.state}</span>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize text-lg px-4 py-2">
                {campground.campgroundType}
              </Badge>
            </div>

            {campground.description && (
              <p className="text-lg text-muted-foreground mb-6">
                {campground.description}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {campground.bookingUrl && (
                <a href={campground.bookingUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Book on Official Site
                  </Button>
                </a>
              )}
              {campground.phoneNumber && (
                <Button variant="outline" className="gap-2">
                  <Phone className="h-4 w-4" />
                  {campground.phoneNumber}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="sites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sites">
                  Available Sites ({sites?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="amenities">
                  Amenities ({amenities?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sites" className="space-y-4 mt-6">
                {sitesLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {!sitesLoading && (!sites || sites.length === 0) && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No sites available. Sites data may need to be synced.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!sitesLoading && sites && sites.length > 0 && (
                  <div className="grid gap-4">
                    {sites.map((site) => (
                      <Card key={site.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                {getSiteIcon(site.siteType)}
                                {site.siteName}
                              </CardTitle>
                              <CardDescription className="capitalize">
                                {site.siteType} site
                                {site.siteNumber && ` • Site #${site.siteNumber}`}
                              </CardDescription>
                            </div>
                            {site.pricePerNight && (
                              <div className="text-right">
                                <p className="text-2xl font-bold text-primary">
                                  ${parseFloat(site.pricePerNight).toFixed(0)}
                                </p>
                                <p className="text-xs text-muted-foreground">per night</p>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            {site.maxOccupancy && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{site.maxOccupancy} people</span>
                              </div>
                            )}
                            {site.rvMaxLength && (
                              <div className="flex items-center gap-2">
                                <Truck className="h-4 w-4 text-muted-foreground" />
                                <span>{site.rvMaxLength}ft RV</span>
                              </div>
                            )}
                            {site.hasWater && (
                              <div className="flex items-center gap-2 text-primary">
                                <Droplet className="h-4 w-4" />
                                <span>Water</span>
                              </div>
                            )}
                            {site.hasElectric && (
                              <div className="flex items-center gap-2 text-primary">
                                <Zap className="h-4 w-4" />
                                <span>Electric</span>
                              </div>
                            )}
                            {site.hasSewer && (
                              <div className="flex items-center gap-2 text-primary">
                                <Trash2 className="h-4 w-4" />
                                <span>Sewer</span>
                              </div>
                            )}
                            {site.hasFireRing && (
                              <div className="flex items-center gap-2 text-primary">
                                <Flame className="h-4 w-4" />
                                <span>Fire Ring</span>
                              </div>
                            )}
                            {site.hasPicnicTable && (
                              <div className="flex items-center gap-2 text-primary">
                                <Utensils className="h-4 w-4" />
                                <span>Picnic Table</span>
                              </div>
                            )}
                            {site.isPetFriendly && (
                              <div className="flex items-center gap-2 text-primary">
                                <Dog className="h-4 w-4" />
                                <span>Pet Friendly</span>
                              </div>
                            )}
                            {site.isAccessible && (
                              <div className="flex items-center gap-2 text-primary">
                                <Accessibility className="h-4 w-4" />
                                <span>Accessible</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="amenities" className="space-y-4 mt-6">
                {amenitiesLoading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {!amenitiesLoading && (!amenities || amenities.length === 0) && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-muted-foreground">
                        No amenities information available.
                      </p>
                    </CardContent>
                  </Card>
                )}

                {!amenitiesLoading && amenities && amenities.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {amenities.map((amenity) => (
                      <Card key={amenity.id}>
                        <CardHeader>
                          <CardTitle className="text-base">{amenity.name}</CardTitle>
                          {amenity.description && (
                            <CardDescription>{amenity.description}</CardDescription>
                          )}
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Availability Calendar */}
            <AvailabilityCalendar
              campgroundId={campground.id}
              bookedDates={bookedDates || []}
            />

            {/* Booking Form */}
            <BookingForm 
              campgroundId={campground.id} 
              campgroundName={campground.name}
            />

            <Card>
              <CardHeader>
                <CardTitle>Campground Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campground.managingOrganization && (
                  <div>
                    <p className="text-sm font-medium mb-1">Managed By</p>
                    <p className="text-sm text-muted-foreground">
                      {campground.managingOrganization}
                    </p>
                  </div>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {campground.address && <>{campground.address}<br /></>}
                    {campground.city}, {campground.state} {campground.zipCode}
                  </p>
                </div>

                {(campground.latitude && campground.longitude) && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium mb-1">Coordinates</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {parseFloat(campground.latitude).toFixed(4)}, {parseFloat(campground.longitude).toFixed(4)}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                <div>
                  <p className="text-sm font-medium mb-1">Reservations</p>
                  <p className="text-sm text-muted-foreground">
                    {campground.reservable ? "Reservations required" : "First-come, first-served"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Source</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="capitalize">
                  {campground.dataSource}
                </Badge>
                {campground.lastSyncedAt && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(campground.lastSyncedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
