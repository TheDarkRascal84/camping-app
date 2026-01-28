import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MapView from "./pages/MapView";
import CampgroundDetail from "./pages/CampgroundDetail";
import MyBookings from "./pages/MyBookings";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/search"} component={Search} />
      <Route path={"/map"} component={MapView} />
      <Route path={"/campground/:id"} component={CampgroundDetail} />
      <Route path={"/my-bookings"} component={MyBookings} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
