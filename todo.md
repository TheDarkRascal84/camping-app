# Camping Site Availability Platform - TODO

## Database & Schema
- [x] Design campgrounds table with location, type, and metadata
- [x] Design sites table with amenities and specifications
- [x] Design availability table with date ranges and status
- [x] Design amenities reference table
- [x] Design data sources metadata table
- [x] Implement database schema in drizzle/schema.ts
- [x] Push database migrations

## Backend - Data Layer
- [x] Create database helper functions for campgrounds
- [x] Create database helper functions for sites
- [x] Create database helper functions for availability
- [x] Create database helper functions for search and filtering

## Backend - Data Ingestion
- [x] Research Recreation.gov API structure and authentication
- [x] Create modular data source adapter architecture
- [x] Implement Recreation.gov adapter
- [x] Implement state parks adapter (placeholder/mock)
- [x] Implement private campgrounds adapter (placeholder/mock)
- [x] Create data normalization layer
- [x] Implement caching strategy with in-memory cache
- [ ] Create background job system for availability refresh
- [ ] Add rate limiting protection

## Backend - API/tRPC Routers
- [x] Create search router with location/date/type filters
- [x] Create campgrounds router for listing and details
- [x] Create availability router for real-time data
- [x] Create filters router for amenities/price/size
- [ ] Implement geocoding for location search
- [x] Implement radius search logic

## Frontend - Core UI
- [x] Design color palette and typography system
- [x] Update global styles in index.css
- [x] Create main layout with navigation
- [x] Build search page with search form
- [x] Create filter sidebar component
- [x] Build campground list view component
- [x] Create campground card component
- [ ] Implement list/map view toggle

## Frontend - Map Integration
- [x] Integrate Google Maps component
- [ ] Implement marker clustering
- [x] Add campground markers with info windows
- [ ] Implement radius search on map
- [x] Sync map view with list view

## Frontend - Campground Details
- [x] Create campground detail page route
- [x] Build campground header with photos
- [x] Display site types and specifications
- [ ] Create availability calendar component
- [x] Build amenities list display
- [x] Add booking link to official provider
- [ ] Show nearby alternatives on map

## Frontend - Advanced Features
- [ ] Implement responsive mobile-first design
- [ ] Add loading states for all async operations
- [ ] Add error handling and fallback UI
- [ ] Implement search result pagination
- [ ] Add empty states for no results

## Testing & Documentation
- [x] Write vitest tests for data adapters
- [x] Write vitest tests for search/filter logic
- [x] Write vitest tests for tRPC procedures
- [ ] Create API documentation
- [ ] Document data source integration
- [ ] Document caching strategy
- [ ] Note legal and ethical considerations

## Deployment
- [ ] Test all features end-to-end
- [ ] Create final checkpoint
- [ ] Prepare deployment documentation

## Bug Fixes
- [x] Fix nested anchor tag error on search page

## Navigation Improvements
- [x] Refactor Search page to use useLocation hook instead of window.location.href

## Accessibility Improvements
- [x] Add keyboard navigation support (Enter/Space keys) to campground cards
- [x] Add proper ARIA attributes for screen reader support

## Image Integration
- [x] Display campground address on search result cards
- [x] Create tRPC endpoint to fetch stock images for campgrounds
- [x] Integrate image fetching with campground data
- [x] Display images on campground cards and detail pages

## Image Gallery Enhancement
- [x] Add image carousel component to campground detail pages
- [x] Fetch multiple images (5-6) for detail page display
- [x] Implement prev/next navigation controls for carousel

## Background Image Enhancement
- [x] Add camping scene as translucent background to landing page
- [x] Ensure text visibility with proper contrast overlays
- [x] Copy background image to public directory

## Visual Refinements
- [x] Adjust background overlay opacity to 80% for more prominent image

## Bug Fixes (Home Page)
- [x] Fix nested anchor tag error on home page

## Performance Enhancements
- [x] Add skeleton loaders for campground images on search results
- [x] Implement loading states for image transitions

## Image Error Handling
- [x] Add fallback placeholder icon for failed image loads
- [x] Implement error state tracking for images

## Booking System
- [x] Design bookings database table schema
- [x] Create tRPC endpoints for booking operations (create, list, cancel)
- [x] Add booking form to campground detail pages
- [x] Implement booking confirmation and management UI
- [x] Add user's bookings dashboard

## Availability Calendar
- [x] Create availability calendar component showing booked vs available dates
- [x] Add tRPC endpoint to fetch booking data for calendar view
- [x] Integrate calendar into campground detail pages
- [x] Add visual indicators for available, booked, and unavailable dates
- [x] Implement date range selection from calendar
