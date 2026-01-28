import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter, isBefore, startOfDay } from "date-fns";

interface BookedDate {
  date: Date;
  status: "available" | "booked" | "unavailable";
}

interface AvailabilityCalendarProps {
  campgroundId: number;
  bookedDates?: BookedDate[];
  onDateSelect?: (startDate: Date, endDate: Date | null) => void;
}

export function AvailabilityCalendar({ 
  campgroundId, 
  bookedDates = [],
  onDateSelect 
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay();

  // Create array of empty cells for days before month starts
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getDateStatus = (date: Date): "available" | "booked" | "unavailable" | "past" => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) {
      return "past";
    }

    const bookedDate = bookedDates.find(bd => isSameDay(new Date(bd.date), date));
    return bookedDate?.status || "available";
  };

  const getDateClasses = (date: Date): string => {
    const status = getDateStatus(date);
    const isSelected = selectedStartDate && isSameDay(date, selectedStartDate) || 
                      selectedEndDate && isSameDay(date, selectedEndDate);
    const isInRange = selectedStartDate && selectedEndDate && 
                     isAfter(date, selectedStartDate) && 
                     isBefore(date, selectedEndDate);

    let classes = "h-12 w-full rounded-md flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ";

    if (isSelected) {
      classes += "bg-primary text-primary-foreground ";
    } else if (isInRange) {
      classes += "bg-primary/20 text-primary ";
    } else if (status === "available") {
      classes += "bg-green-100 text-green-900 hover:bg-green-200 ";
    } else if (status === "booked") {
      classes += "bg-red-100 text-red-900 cursor-not-allowed ";
    } else if (status === "unavailable") {
      classes += "bg-gray-100 text-gray-500 cursor-not-allowed ";
    } else if (status === "past") {
      classes += "bg-gray-50 text-gray-400 cursor-not-allowed ";
    }

    return classes;
  };

  const handleDateClick = (date: Date) => {
    const status = getDateStatus(date);
    if (status === "booked" || status === "unavailable" || status === "past") {
      return; // Can't select unavailable dates
    }

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      // Start new selection
      setSelectedStartDate(date);
      setSelectedEndDate(null);
      onDateSelect?.(date, null);
    } else {
      // Complete selection
      if (isAfter(date, selectedStartDate)) {
        setSelectedEndDate(date);
        onDateSelect?.(selectedStartDate, date);
      } else {
        // If clicked date is before start, make it the new start
        setSelectedStartDate(date);
        setSelectedEndDate(null);
        onDateSelect?.(date, null);
      }
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleClearSelection = () => {
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onDateSelect?.(null as any, null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
            <CardDescription>
              Select your check-in and check-out dates
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-green-100 border border-green-300" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-100 border border-red-300" />
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-primary border border-primary" />
            <span>Selected</span>
          </div>
        </div>

        {/* Selected dates display */}
        {selectedStartDate && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="font-medium">Check-in:</span>{" "}
                {format(selectedStartDate, "MMM dd, yyyy")}
                {selectedEndDate && (
                  <>
                    {" • "}
                    <span className="font-medium">Check-out:</span>{" "}
                    {format(selectedEndDate, "MMM dd, yyyy")}
                  </>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="h-10 flex items-center justify-center text-sm font-semibold text-muted-foreground"
            >
              {day}
            </div>
          ))}

          {/* Empty cells before month starts */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="h-12" />
          ))}

          {/* Days of the month */}
          {daysInMonth.map((date) => (
            <div
              key={date.toISOString()}
              className={getDateClasses(date)}
              onClick={() => handleDateClick(date)}
            >
              {format(date, "d")}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
