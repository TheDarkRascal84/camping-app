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
