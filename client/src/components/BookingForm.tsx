import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

interface BookingFormProps {
  campgroundId: number;
  campgroundName: string;
  siteId?: number;
}

export function BookingForm({ campgroundId, campgroundName, siteId }: BookingFormProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [numberOfGuests, setNumberOfGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState("");
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState("");

  const createBookingMutation = trpc.bookings.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Booking confirmed! Confirmation #: ${data.confirmationNumber}`);
      setLocation("/my-bookings");
    },
    onError: (error) => {
      toast.error(`Booking failed: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please sign in to make a booking");
      window.location.href = getLoginUrl();
      return;
    }

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (checkOutDate <= checkInDate) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    createBookingMutation.mutate({
      campgroundId,
      siteId,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests: specialRequests || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
    });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Book Your Stay</CardTitle>
        <CardDescription>Reserve your spot at {campgroundName}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check-in Date */}
          <div className="space-y-2">
            <Label>Check-in Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  onSelect={setCheckInDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Date */}
          <div className="space-y-2">
            <Label>Check-out Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  onSelect={setCheckOutDate}
                  disabled={(date) => date < (checkInDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min={1}
              max={20}
              value={numberOfGuests}
              onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}
            />
          </div>

          {/* Contact Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Contact Phone (Optional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="requests">Special Requests (Optional)</Label>
            <Textarea
              id="requests"
              placeholder="Any special requirements or requests..."
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>

          {!isAuthenticated && (
            <p className="text-xs text-muted-foreground text-center">
              You'll need to sign in to complete your booking
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
