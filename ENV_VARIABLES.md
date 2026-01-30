# Environment Variables Reference

This document lists all environment variables required to run CampFinder. Use this as a reference when setting up your deployment.

## How to Use

### For Manus Platform Deployment
Configure these in the **Management UI → Settings → Secrets** panel. All variables are automatically injected.

### For Docker/Local Deployment
Create a `.env` file in the project root and add these variables with your actual values.

---

## Required Environment Variables

### Database

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | MySQL/TiDB connection string | `mysql://user:password@localhost:3306/campfinder` |

### Authentication & Security

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT token signing | Generate with: `openssl rand -base64 32` |
| `OAUTH_SERVER_URL` | Manus OAuth server URL (backend) | `https://api.manus.im` |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth portal URL (frontend) | `https://login.manus.im` |
| `VITE_APP_ID` | Your Manus application ID | `your-manus-app-id` |

### Owner Information

| Variable | Description | Example |
|----------|-------------|---------|
| `OWNER_OPEN_ID` | Owner's OpenID from Manus platform | `your-owner-open-id` |
| `OWNER_NAME` | Owner's display name | `Your Name` |

### Manus Built-in Services

| Variable | Description | Example |
|----------|-------------|---------|
| `BUILT_IN_FORGE_API_URL` | Manus Forge API URL | `https://forge-api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | Server-side API key for Manus services | `your-server-side-forge-api-key` |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend API key for Manus services | `your-frontend-forge-api-key` |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend Forge API URL | `https://forge-api.manus.im` |

### External APIs

| Variable | Description | Example |
|----------|-------------|---------|
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key for images | Get one at: https://unsplash.com/developers |

### Analytics

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint URL | `your-analytics-endpoint` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | `your-website-id` |

### Application Branding

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_APP_TITLE` | Application title | `CampFinder` |
| `VITE_APP_LOGO` | Application logo URL | `https://your-domain.com/logo.png` |

### Runtime Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production`, `development`, or `test` |

---

## Example .env File

For Docker or local development, create a `.env` file:

```bash
# Database
DATABASE_URL=mysql://user:password@localhost:3306/campfinder

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-manus-app-id

# Owner
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name

# Manus Services
BUILT_IN_FORGE_API_URL=https://forge-api.manus.im
BUILT_IN_FORGE_API_KEY=your-server-side-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-api-key
VITE_FRONTEND_FORGE_API_URL=https://forge-api.manus.im

# External APIs
UNSPLASH_ACCESS_KEY=your-unsplash-access-key

# Analytics
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# Branding
VITE_APP_TITLE=CampFinder
VITE_APP_LOGO=https://your-domain.com/logo.png

# Environment
NODE_ENV=production
```

---

## Important Notes

1. **VITE_ Prefix**: Variables prefixed with `VITE_` are exposed to the frontend. Never put sensitive secrets in these variables.

2. **Security**: Keep server-side secrets (`JWT_SECRET`, `BUILT_IN_FORGE_API_KEY`) secure and never commit them to version control.

3. **.gitignore**: The `.env` file should already be in `.gitignore`. Never commit it to your repository.

4. **Docker**: When using Docker, you can either:
   - Create a `.env` file and Docker Compose will automatically load it
   - Pass variables directly via `-e` flag: `docker run -e DATABASE_URL=... -e JWT_SECRET=...`

5. **Manus Platform**: All these variables are pre-configured in the Manus platform. You only need to set them for external deployments.

6. **Generate Strong Secrets**: For `JWT_SECRET`, use a cryptographically secure random string:
   ```bash
   openssl rand -base64 32
   ```

---

## Troubleshooting

### Missing Environment Variables
If the app fails to start with "Missing environment variable" errors, check that all required variables are set.

### Database Connection Fails
- Verify `DATABASE_URL` format is correct
- Ensure database server is accessible
- Check firewall rules

### Authentication Issues
- Verify `JWT_SECRET` is set and matches across all instances
- Check `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are correct
- Ensure `VITE_APP_ID` matches your Manus application

### Images Not Loading
- Verify `UNSPLASH_ACCESS_KEY` is valid
- Check API rate limits haven't been exceeded
