import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, MapPin, Users, X } from "lucide-react";
import { RaccoonLogo } from "@/components/RaccoonLogo";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { toast } from "sonner";
import { format } from "date-fns";

export default function MyBookings() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: bookings, isLoading, refetch } = trpc.bookings.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const cancelMutation = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to cancel booking: ${error.message}`);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold">Sign in to view your bookings</h1>
        <p className="text-muted-foreground">You need to be logged in to see your reservations</p>
        <Button asChild>
          <a href={getLoginUrl()}>Sign In</a>
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <RaccoonLogo className="h-8 w-8" />
            CampFinder
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/search">
              <Button variant="ghost">Search</Button>
            </Link>
            <Link href="/map">
              <Button variant="ghost">Map</Button>
            </Link>
            <Link href="/my-bookings">
              <Button variant="default">My Bookings</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">
            View and manage your campground reservations
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && bookings && bookings.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You don't have any bookings yet</p>
              <Button asChild>
                <Link href="/search">Start Searching</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && bookings && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Campground Booking
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Confirmation: {booking.confirmationNumber}
                      </CardDescription>
                    </div>
                    {booking.status === "confirmed" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => cancelMutation.mutate({ id: booking.id })}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Check-in:</span>
                        <span>{format(new Date(booking.checkInDate), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Check-out:</span>
                        <span>{format(new Date(booking.checkOutDate), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Guests:</span>
                        <span>{booking.numberOfGuests}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {booking.totalPrice && (
                        <div className="text-sm">
                          <span className="font-medium">Total:</span>
                          <span className="ml-2 text-lg font-bold">
                            ${booking.totalPrice} {booking.currency}
                          </span>
                        </div>
                      )}
                      {booking.contactEmail && (
                        <div className="text-sm">
                          <span className="font-medium">Contact:</span>
                          <span className="ml-2">{booking.contactEmail}</span>
                        </div>
                      )}
                      {booking.specialRequests && (
                        <div className="text-sm">
                          <span className="font-medium">Special Requests:</span>
                          <p className="text-muted-foreground mt-1">{booking.specialRequests}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
