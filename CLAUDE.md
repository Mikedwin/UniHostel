# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in the UniHostel repository.

## Commands

### Backend (Node.js/Express)
- **Start development server**: `cd backend && npm run dev`
- **Start production server**: `cd backend && npm start`
- **Run tests**: `cd backend && npm test`
- **Seed database**: `cd backend && npm run seed`
- **Initialize admin user**: `cd backend && npm run init-admin`
- **Run backup script**: `cd backend && npm run backup`
- **Run restore script**: `cd backend && npm run restore`
- **Check pentest readiness**: `cd backend && npm run pentest:check`

### Frontend (React/Vite)
- **Start development server**: `cd frontend && npm run dev`
- **Build for production**: `cd frontend && npm run build`
- **Preview production build**: `cd frontend && npm run preview`
- **Run tests**: `cd frontend && npm run test`

### General
- **Install all dependencies**: Run `npm install` in both `backend` and `frontend` directories.
- **Environment setup**: Copy `.env.example` to `.env` in the `backend` directory and fill in the required values.

## Project Structure

### Backend (`backend/`)
- `server.js` - Entry point, Express app setup, middleware, and routes.
- `models/` - Mongoose models (User, Hostel, Application, etc.)
- `routes/` - API route handlers (auth, hostels, applications, payments, etc.)
- `middleware/` - Custom middleware (authentication, validation, security, etc.)
- `utils/` - Utility functions (email service, Cloudinary upload, JWT helpers, etc.)
- `services/` - Background services (data retention, caching, etc.)
- `config/` - Configuration (logger, etc.)
- `scripts/` - Maintenance scripts (backup, restore, etc.)
- `.env.example` - Template for environment variables

### Frontend (`frontend/`)
- `src/main.jsx` - Entry point, ReactDOM render.
- `src/App.js` - Main application component with routing and layout.
- `src/components/` - Reusable UI components (Navbar, Buttons, Forms, etc.)
- `src/pages/` - Page components (Landing, HostelList, Login, Register, Dashboard, etc.)
- `src/context/` - React Context providers (AuthContext for authentication state)
- `src/utils/` - Utility functions (API client, visitor tracking, helpers)
- `src/config/` - Configuration files (API endpoints, etc.)
- `src/App.smoke.test.jsx` - Smoke test for the main App component.

## Key Features
- Dual-user system: Students and Hostel Managers
- JWT-based authentication with HTTP-only cookies
- Role-based access control (RBAC)
- MongoDB with Mongoose ODM with MongoDB
- RESTful API with comprehensive error handling
- RESTful API with comprehensive error handling
- Image upload via Cloudinary
- Email notifications via Nodemailer
- Rate limiting, security headers, and input sanitization
- Optional security features: Intrusion Detection System (IDS), visitor tracking
- Payment integration (Paystack example)
- GDPR compliance endpoints
- Backup and restore functionality

## Development Notes
- The backend runs on port 5000 by default (configurable via PORT env var).
- The frontend runs on port 5173 by default (Vite dev server).
- CORS is configured to allow requests from the frontend domain and localhost.
- Ensure MongoDB is running and accessible via the MONGO_URI in `.env`.
- JWT_SECRET must be at least 32 characters long for security.
- Admin users must be created via the `init-admin` script or manually; manager accounts require admin approval.
- Tests are located alongside the files they test (e.g., `user.model.test.js`) or in a `tests/` directory.
- Linting is set up with ESLint and Prettier; run `npm run lint` and `npm run lint:fix` to check and fix code style.
- **Security hardening**:
  * Content Security Policy (CSP) has been tightened – removed `'unsafe-inline'` from `style-src` and `script-src` directives.
  * Authentication cookies are set with `Secure`, `HttpOnly`, and appropriate `SameSite` attributes (secure flag automatically enabled in production).

## Troubleshooting
- **CORS errors**: Verify the backend is running and the FRONTEND_URL/CORS_ALLOWED_ORIGINS in `.env` include the frontend origin.
- **Database connection**: Ensure MongoDB is running and the MONGO_URI is correct. Check the MongoDB connection logs.
- **Authentication issues**: Clear cookies or use an incognito window to test login flow. Verify JWT_SECRET is set correctly.
- **Email not sending**: Check EMAIL_USER and EMAIL_PASSWORD in `.env`. For Gmail, use an App Password if 2FA is enabled.
### Linting and Formatting

- **Backend lint**: `cd backend && npm run lint`
- **Backend lint fix**: `cd backend && npm run lint:fix`
- **Backend format**: `cd backend && npm run format`
- **Frontend lint**: `cd frontend && npm run lint`
- **Frontend lint fix**: `cd frontend && npm run lint:fix`
- **Frontend format**: `cd frontend && npm run format`

## Progress Log
- **C1**: Replaced in‑memory CSRF token store with Redis (completed).
- **C2**: Replaced in‑memory rate‑limit stores with Redis (completed).
- **C3**: Replaced in‑memory cache with Redis‑based service; updated all cache calls to await async methods; updated cache middleware and test hooks (completed).
- **C4**: Hardened IDS regex patterns to mitigate ReDoS (completed).
- **C5**: Implemented session cookie rotation on sensitive actions (login, password change, 2FA, etc.) (completed).
- **C6**: Expanded IDS coverage to detect path traversal, command injection, SSRF, and authentication bypass attempts (completed).
- **C7**: Implemented request/response signing for sensitive APIs using HMAC-SHA256 (completed).

- **C8**: Implemented user-based rate limiting (abuse prevention) using Redis store (completed).

## Production readiness overview & next steps

**Overview**  
The UniHostel backend/frontend implements core features (auth, CRUD, payments, admin, file uploads, email, MFA, IDS, request/response signing, user‑based rate limiting, session‑cookie rotation, Redis‑backed stores, caching, data retention, backup/restore). Security hardening steps C1‑C8 are complete.

**Estimated production readiness**  
- Core functionality: ~85%  
- Security hardening (baseline + C1‑C8): ~90%  
- Observability & monitoring: ~40% (logging only)  
- DevOps / CI‑CD & containerisation: ~20% (no Dockerfile, no pipeline)  
- Testing (unit + e2e + performance): ~45% (unit tests present)  
- Documentation & onboarding: ~30% (no public README, limited docs)  
**Overall weighted estimate:** ~55%.

**Recommended next step**  
Add Dockerisation and a basic CI/CD pipeline to enable reliable builds, automated testing, and repeatable deployments:

1. **Dockerfile** (multi‑stage) that installs production deps, builds the React app, and serves the static build via Express (or separates with NGINX).  
2. **docker‑compose.yml** for local dev with MongoDB, Redis, and optional Mailhog.  
3. **GitHub Actions workflow** (`.github/workflows/ci.yml`) that on each push/PR:  
   - Checks out code, sets up Node.js LTS, installs deps.  
   - Runs `npm run lint` and `npm run lint:fix`.  
   - Runs unit tests (`npm test`).  
   - Builds the Docker image and optionally runs `npm audit --production`.  
   - Pushes the image to a registry on tag/release.  
4. **Health‑check endpoint** (`GET /api/health`) returning status and DB/Redis connectivity.  
5. **Documentation**: add a top‑level `README.md` with project overview, prerequisites, quick start (`docker compose up --build`), env var reference, npm scripts, and ensure Swagger UI (`/api-docs`) is mounted and functional.

Completing these steps will raise production readiness to ~75%+, addressing the biggest gaps in CI/CD, observability, containerisation, and docs. After that, consider adding e2e tests (Cypress/Playwright), advanced monitoring (Prometheus+Grafana, Loki), dependency‑scanning in CI, and further security headers.

Next up: Implement Dockerfile, docker‑compose.yml, and GitHub Actions CI workflow.

## End-to-End Testing Setup (Added)

- Added Cypress configuration:
  * `cypress.config.js` with baseUrl `http://localhost:5173`
  * `cypress/support/e2e.js` (support file)
  * `cypress/e2e/app.cy.js` (basic smoke test: visits homepage, checks heading, clicks "Browse Hostels" and "Register as Student")
- Updated root `package.json`:
  * Added `"start"` script: `concurrently "npm run dev --workspace=backend" "npm run dev --workspace=frontend"`
  * Existing `"test:e2e"` script works: `start-server-and-test start http://localhost:5173 cypress:run`
- Enables running end-to-end tests locally with `npm run test:e2e`, which starts both backend (port 5000) and frontend (port 5173) and runs Cypress tests.

This addresses the first weakness identified: lack of end‑to‑end test coverage.