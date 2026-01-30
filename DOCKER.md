# Docker Deployment Guide for CampFinder

This guide explains how to run the CampFinder camping app in a Docker container on Ubuntu.

## Prerequisites

- Docker installed on your Ubuntu system
- Docker Compose installed (optional, but recommended)
- Environment variables configured (see below)

## Quick Start

### Option 1: Using Docker Compose (Recommended)

1. **Create a `.env` file** in the project root with your environment variables:

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id

# Owner Info
OWNER_OPEN_ID=your-open-id
OWNER_NAME=Your Name

# Manus Services
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im

# Unsplash
UNSPLASH_ACCESS_KEY=your-unsplash-key

# Analytics
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Branding
VITE_APP_TITLE=CampFinder
VITE_APP_LOGO=your-logo-url
```

2. **Build and run** with Docker Compose:

```bash
docker-compose up -d
```

3. **Access the app** at `http://localhost:3000`

4. **View logs**:

```bash
docker-compose logs -f
```

5. **Stop the container**:

```bash
docker-compose down
```

### Option 2: Using Docker CLI

1. **Build the image**:

```bash
docker build -t campfinder-app .
```

2. **Run the container**:

```bash
docker run -d \
  --name campfinder \
  -p 3000:3000 \
  -e DATABASE_URL="mysql://user:password@host:port/database" \
  -e JWT_SECRET="your-jwt-secret" \
  -e OAUTH_SERVER_URL="https://api.manus.im" \
  -e VITE_OAUTH_PORTAL_URL="https://login.manus.im" \
  -e VITE_APP_ID="your-app-id" \
  -e OWNER_OPEN_ID="your-open-id" \
  -e OWNER_NAME="Your Name" \
  -e BUILT_IN_FORGE_API_URL="https://forge-api.manus.im" \
  -e BUILT_IN_FORGE_API_KEY="your-api-key" \
  -e VITE_FRONTEND_FORGE_API_KEY="your-frontend-key" \
  -e VITE_FRONTEND_FORGE_API_URL="https://forge-api.manus.im" \
  -e UNSPLASH_ACCESS_KEY="your-unsplash-key" \
  -e VITE_ANALYTICS_ENDPOINT="your-analytics-endpoint" \
  -e VITE_ANALYTICS_WEBSITE_ID="your-website-id" \
  -e VITE_APP_TITLE="CampFinder" \
  -e VITE_APP_LOGO="your-logo-url" \
  campfinder-app
```

3. **Access the app** at `http://localhost:3000`

4. **View logs**:

```bash
docker logs -f campfinder
```

5. **Stop the container**:

```bash
docker stop campfinder
docker rm campfinder
```

## Docker Commands Cheat Sheet

```bash
# Build image
docker build -t campfinder-app .

# Run container
docker run -d -p 3000:3000 --name campfinder campfinder-app

# Stop container
docker stop campfinder

# Start stopped container
docker start campfinder

# Remove container
docker rm campfinder

# Remove image
docker rmi campfinder-app

# View logs
docker logs campfinder

# Follow logs in real-time
docker logs -f campfinder

# Execute command in running container
docker exec -it campfinder sh

# Inspect container
docker inspect campfinder

# View resource usage
docker stats campfinder
```

## Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and restart
docker-compose up -d --build

# View running services
docker-compose ps

# Stop without removing containers
docker-compose stop

# Start stopped services
docker-compose start
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs campfinder` or `docker-compose logs`
- Verify environment variables are set correctly
- Ensure port 3000 is not already in use

### Database connection issues
- Verify `DATABASE_URL` is correct
- Ensure database is accessible from Docker container
- Check firewall rules

### Build failures
- Clear Docker cache: `docker builder prune`
- Rebuild without cache: `docker build --no-cache -t campfinder-app .`

## Production Considerations

1. **Use a reverse proxy** (nginx, Caddy) for HTTPS
2. **Set up proper logging** and monitoring
3. **Configure resource limits** in docker-compose.yml
4. **Use Docker secrets** for sensitive environment variables
5. **Implement health checks** (already configured in docker-compose.yml)
6. **Set up automatic restarts** (already configured with `restart: unless-stopped`)

## Health Check

The container includes a health check that pings `http://localhost:3000/` every 30 seconds. Check health status:

```bash
docker inspect --format='{{.State.Health.Status}}' campfinder
```

## Notes

- The Dockerfile uses multi-stage builds to minimize image size
- Production dependencies only are installed in the final image
- The app runs on port 3000 by default
- All environment variables from Manus platform need to be provided
