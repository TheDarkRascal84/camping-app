import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tent, MapPin, Calendar, Filter, Search as SearchIcon } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
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
                <Button variant="default">Start Searching</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background Image with Translucent Overlay */}
        <div className="absolute inset-0">
          <img
            src="/camping-hero-bg.png"
            alt="Mountain camping scene with tent by lake"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-background/90" />
        </div>
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-5xl font-bold tracking-tight drop-shadow-lg">
              Find Your Perfect Campsite
            </h1>
            <p className="text-xl text-foreground/80 drop-shadow-md">
              Search thousands of campgrounds across the United States. Real-time availability, 
              detailed amenities, and interactive maps to help you plan your next outdoor adventure.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Link href="/search">
                <Button size="lg" className="gap-2">
                  <SearchIcon className="h-5 w-5" />
                  Search Campgrounds
                </Button>
              </Link>
              <Link href="/map">
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="h-5 w-5" />
                  Map View
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Find the Perfect Spot
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <SearchIcon className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Advanced Search</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Search by location, date range, campground type, and more. Find exactly what you're looking for.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Filter className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Smart Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Filter by amenities like water, electric, pet-friendly, RV length, and price range.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Calendar className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-Time Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Check availability for specific dates and see what's open now, or in the next 7, 14, or 30 days.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Interactive Maps</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore campgrounds on an interactive map with marker clustering and radius search.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-4">
            <h2 className="text-3xl font-bold">Multiple Data Sources</h2>
            <p className="text-muted-foreground">
              We aggregate campground data from Recreation.gov (RIDB), state park systems, 
              and private campground networks to give you the most comprehensive search experience.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6">
              <div className="px-6 py-3 bg-background rounded-lg border">
                <p className="font-semibold">Recreation.gov</p>
              </div>
              <div className="px-6 py-3 bg-background rounded-lg border">
                <p className="font-semibold">State Parks</p>
              </div>
              <div className="px-6 py-3 bg-background rounded-lg border">
                <p className="font-semibold">Private Campgrounds</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6 bg-primary/5 rounded-lg p-12">
            <h2 className="text-3xl font-bold">Ready to Start Your Adventure?</h2>
            <p className="text-lg text-muted-foreground">
              Search thousands of campgrounds and find the perfect spot for your next outdoor experience.
            </p>
            <Link href="/search">
              <Button size="lg" className="gap-2">
                <Tent className="h-5 w-5" />
                Start Searching Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-card">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tent className="h-4 w-4" />
              <span>© 2026 CampFinder. Built with Manus.</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/search">
                <a className="text-muted-foreground hover:text-foreground">Search</a>
              </Link>
              <Link href="/map">
                <a className="text-muted-foreground hover:text-foreground">Map</a>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
