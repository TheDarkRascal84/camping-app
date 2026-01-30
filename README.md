# 🏕️ CampFinder

**Find Your Perfect Campsite**

CampFinder is a modern web application that helps outdoor enthusiasts discover and book campsites across the United States. With real-time availability, interactive maps, detailed amenities, and a beautiful burnt orange theme, CampFinder makes planning your next camping adventure effortless.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

### 🔍 **Advanced Search & Filtering**
- Search campgrounds by state, city, or name
- Filter by campground type (RV, tent, mixed)
- Pagination support (20 results per page)
- Real-time search results

### 🗺️ **Interactive Maps**
- Google Maps integration with custom markers
- View all campgrounds on an interactive map
- Click markers for detailed campground information
- Automatic bounds adjustment for optimal viewing

### 📅 **Real-Time Availability**
- Check campsite availability for specific dates
- Interactive calendar view
- Book campsites directly through the app
- View and manage your bookings

### 🎨 **Beautiful Design**
- Warm burnt orange theme inspired by outdoor adventures
- Custom raccoon logo with hover animations
- Responsive design for mobile, tablet, and desktop
- Smooth transitions and micro-interactions

### 🖼️ **Rich Media**
- High-quality campground images from Unsplash
- Image caching for improved performance
- Fallback images for better UX

### 🔐 **Secure Authentication**
- Manus OAuth integration
- JWT-based session management
- Protected routes and API endpoints

### 📊 **User Dashboard**
- View your booking history
- Manage upcoming reservations
- Personalized user experience

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22+ and pnpm
- MySQL/TiDB database
- Manus platform account (for OAuth and built-in services)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/TheDarkRascal84/camping-app.git
cd camping-app
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

See [ENV_VARIABLES.md](./ENV_VARIABLES.md) for a complete list of required variables.

For Manus platform deployment, configure in **Settings → Secrets** panel.

4. **Push database schema**

```bash
pnpm db:push
```

5. **Start development server**

```bash
pnpm dev
```

6. **Open your browser**

Navigate to `http://localhost:3000`

---

## 🐳 Docker Deployment

CampFinder includes full Docker support for easy deployment.

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Using Docker CLI

```bash
# Build image
docker build -t campfinder-app .

# Run container
docker run -d -p 3000:3000 --name campfinder campfinder-app
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

---

## 📚 Documentation

- **[DOCKER.md](./DOCKER.md)** - Complete Docker deployment guide
- **[ENV_VARIABLES.md](./ENV_VARIABLES.md)** - Environment variables reference
- **[todo.md](./todo.md)** - Project task tracking

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling with burnt orange theme
- **shadcn/ui** - UI component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end typesafe APIs
- **React Query** - Data fetching and caching

### Backend
- **Node.js 22** - Runtime
- **Express 4** - Web framework
- **tRPC 11** - API layer
- **Drizzle ORM** - Database ORM
- **MySQL/TiDB** - Database
- **JWT** - Authentication

### Infrastructure
- **Vite** - Build tool
- **Vitest** - Testing framework
- **Docker** - Containerization
- **pnpm** - Package manager

### External Services
- **Google Maps API** - Interactive maps
- **Unsplash API** - Campground images
- **Manus Platform** - OAuth, storage, LLM services

---

## 📁 Project Structure

```
camping-app/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   └── src/
│       ├── components/    # React components
│       ├── pages/         # Page components
│       ├── lib/           # Utilities and tRPC client
│       └── index.css      # Global styles (burnt orange theme)
├── server/                # Backend application
│   ├── _core/            # Core server infrastructure
│   ├── db.ts             # Database queries
│   ├── routers.ts        # tRPC routers
│   └── *.test.ts         # Test files
├── drizzle/              # Database schema and migrations
│   └── schema.ts         # Database schema
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Dependencies and scripts
```

---

## 🧪 Testing

Run the test suite:

```bash
pnpm test
```

CampFinder includes 38+ tests covering:
- Authentication flows
- Campground search and filtering
- Booking system
- Image caching
- Pagination
- API endpoints

---

## 📜 Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm test         # Run tests
pnpm check        # Type check
pnpm format       # Format code
pnpm db:push      # Push database schema changes
```

---

## 🎨 Design Highlights

### Color Palette
- **Background**: Warm burnt orange (`oklch(0.72 0.12 45)`)
- **Cards**: Light cream (`oklch(0.95 0.02 60)`)
- **Primary**: Forest green (`var(--color-green-700)`)
- **Text**: Dark brown (`oklch(0.15 0.02 45)`)

### Key Features
- Custom raccoon logo with playful hover animation
- Responsive design with mobile-first approach
- Smooth transitions and micro-interactions
- Accessible color contrast ratios

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Manus Platform** - For OAuth, storage, and LLM services
- **Unsplash** - For beautiful campground imagery
- **shadcn/ui** - For the excellent component library
- **Google Maps** - For interactive mapping capabilities

---

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/TheDarkRascal84/camping-app/issues)
- Contact the maintainer

---

## 🗺️ Roadmap

- [ ] User favorites/wishlist feature
- [ ] Sorting options for search results
- [ ] Dark mode toggle
- [ ] Custom favicon
- [ ] Mobile app (React Native)
- [ ] Campground reviews and ratings
- [ ] Weather integration
- [ ] Offline support with PWA

---

**Made with ❤️ for outdoor enthusiasts**
