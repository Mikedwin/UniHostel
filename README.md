# UniHostel - Student Accommodation Marketplace

UniHostel is a comprehensive full-stack web application designed to bridge the gap between university students searching for safe, affordable housing and hostel managers looking to fill vacancies. The platform creates a specialized marketplace focused exclusively on student accommodation needs.

## 🚀 Features

### For Students
- **Smart Search & Discovery**: Browse hostels with advanced filtering by location, price range, and available facilities
- **Semester-Based Applications**: Apply for specific academic terms with personalized messages to managers
- **Application Tracking**: Real-time status monitoring (Pending/Approved/Rejected) through dedicated dashboard
- **Responsive Experience**: Mobile-optimized interface for on-the-go housing searches

### For Hostel Managers
- **Property Management**: Easy hostel listing with detailed property information and amenities
- **Application Processing**: Centralized dashboard to review, approve, or reject student applications
- **Availability Tracking**: Monitor occupancy and manage bookings across different time periods
- **Direct Communication**: Receive and respond to student inquiries through the platform

### Technical Features
- **Production-Ready Deployment**: Dockerized application with docker-compose for local development
- **CI/CD Pipeline**: GitHub Actions workflow for automated testing, linting, and building
- **Health Monitoring**: `/api/health` endpoint for monitoring application and database status
- **Security Hardening**: Implemented C1-C8 security enhancements (CSRF protection, rate limiting, input sanitization, etc.)
- **Request/Response Signing**: HMAC-SHA256 for sensitive API endpoints
- **User-Based Rate Limiting**: Redis-backed protection against abuse
- **Session Management**: Automatic cookie rotation on sensitive actions
- **Intrusion Detection System**: Optional IDS with auto-blocking capabilities
- **Comprehensive Error Handling**: Graceful error recovery and informative error messages
- **Backup & Restore**: Automated backup and manual restore functionality
- **Rate Limiting**: IP and user-based rate limiting to prevent abuse
- **Security Headers**: Helmet.js implementation with strict CSP
- **Data Validation**: Server-side validation and sanitization of all inputs

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **Redis** for caching and rate limiting
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Speakeasy** for TOTP/MFA
- **Nodemailer** for email services
- **Cloudinary** for image storage
- **Helmet.js** for security headers
- **Express Rate Limit** for rate limiting
- **Express Mongo Sanitize** for NoSQL injection protection
- **HPP** for HTTP parameter pollution protection
- **Winston** for logging
- **Swagger UI** for API documentation

### Frontend
- **React** with functional components and hooks
- **Vite** for fast development and building
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management
- **SweetAlert2** for modals and notifications
- **Recharts** for data visualization
- **Browser Image Compression** for client-side image optimization
- **PapaParse** for CSV processing

### DevOps & Infrastructure
- **Docker** for containerization
- **Docker Compose** for local development orchestration
- **GitHub Actions** for CI/CD
- **MongoDB** and **Redis** as services

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **Redis** (For caching and rate limiting)
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for containerized deployment)
- **Git** (for version control)

## 🚀 Getting Started

### Option 1: Local Development (Manual Setup)

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd UniHostel-main
```

#### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your configuration:
# - MONGO_URI: MongoDB connection string
# - JWT_SECRET: Strong secret for JWT signing (32+ characters)
# - REDIS_URL: Redis connection string (default: redis://localhost:6379)
# - TOTP_ENCRYPTION_KEY: Key for encrypting TOTP secrets
# - EMAIL_USER/EMAIL_PASSWORD: For sending emails
# - CLOUDINARY_*: Cloudinary credentials for image upload
# - PAYSTACK_*: Paystack keys for payment processing (optional)

# Seed sample data (optional but recommended)
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

#### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

### Option 2: Containerized Deployment (Recommended for Production)

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd UniHostel-main
```

#### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your production values
```

#### 3. Build and Run with Docker Compose
```bash
docker compose up --build
# Or for detached mode:
docker compose up -d --build
```

#### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

#### 5. Stopping the Application
```bash
docker compose down
# To remove volumes as well:
docker compose down -v
```

## 🔧 Configuration

### Environment Variables (.env)

| Variable | Description | Required | Default/Example |
|----------|-------------|----------|-----------------|
| **PORT** | Server port | No | 5000 |
| **MONGO_URI** | MongoDB connection string | Yes | `mongodb://localhost:27017/unihostel` |
| **REDIS_URL** | Redis connection string | No | `redis://localhost:6379` |
| **JWT_SECRET** | Secret for JWT signing (32+ chars) | Yes | `your-super-secret-jwt-key-here` |
| **TOTP_ENCRYPTION_KEY** | Key for encrypting TOTP secrets | Yes | `your-totp-encryption-key` |
| **EMAIL_USER** | Email username for sending emails | Yes (for email) | `your-email@gmail.com` |
| **EMAIL_PASSWORD** | Email password/app-specific password | Yes (for email) | `your-app-password` |
| **EMAIL_FROM_NAME** | Sender name for emails | No | `UniHostel` |
| **CLOUDINARY_CLOUD_NAME** | Cloudinary cloud name | Yes (for uploads) | `your-cloud-name` |
| **CLOUDINARY_API_KEY** | Cloudinary API key | Yes (for uploads) | `your-api-key` |
| **CLOUDINARY_API_SECRET** | Cloudinary API secret | Yes (for uploads) | `your-api-secret` |
| **PAYSTACK_SECRET_KEY** | Paystack secret key | No (for payments) | `sk_test_...` |
| **PAYSTACK_PUBLIC_KEY** | Paystack public key | No (for payments) | `pk_test_...` |
| **ADMIN_COMMISSION_PERCENT** | Commission percentage for admins | No | `3` |
| **FRONTEND_URL** | Frontend URL for CORS | No | `https://your-frontend.vercel.app` |
| **CORS_ALLOWED_ORIGINS** | Comma-separated list of allowed origins | No | `https://your-frontend.vercel.app,http://localhost:5173` |
| **SECURITY_ENABLED** | Enable Intrusion Detection System | No | `false` |
| **SECURITY_AUTO_BLOCK** | Auto-block attackers when IDS triggers | No | `false` |
| **VISITOR_TRACKING_ENABLED** | Enable visitor tracking | No | `false` |
| **TURNSTILE_SECRET_KEY** | Cloudflare Turnstile secret key | No (for bot protection) | `your-secret-key` |
| **TURNSTILE_SITE_KEY** | Cloudflare Turnstile site key | No (for bot protection) | `your-site-key` |
| **ENABLE_API_DOCS_IN_PRODUCTION** | Enable Swagger UI in production | No | `false` |
| **VERIFICATION_TOKEN_EXPIRY_HOURS** | Email verification token expiry | No | `24` |
| **MAX_LOGIN_ATTEMPTS** | Max login attempts before lockout | No | `5` |
| **LOCKOUT_DURATION_MINUTES** | Lockout duration in minutes | No | `30` |
| **USER_RATE_LIMIT_WINDOW_MS** | User rate limit window (ms) | No | `900000` (15 minutes) |
| **USER_RATE_LIMIT_MAX** | Max requests per user in window | No | `100` |

### Health Check Endpoint

The application provides a health check endpoint at `GET /api/health` that returns:
- Overall status (healthy/unhealthy)
- Database connection status
- Redis connection status
- Environment information
- Uptime and timestamp

This endpoint can be used by load balancers, orchestrators, and monitoring systems.

## 📚 API Documentation

When the application is running, interactive API documentation is available at:
- **Development**: `http://localhost:5000/api-docs`
- **Production**: Enable by setting `ENABLE_API_DOCS_IN_PRODUCTION=true` in .env

The documentation is powered by Swagger UI and provides:
- Interactive API exploration
- Detailed endpoint descriptions
- Request/response examples
- Authentication requirements
- Error codes and messages

## 🐳 Docker Deployment

The application includes a production-ready Docker setup:

### Dockerfile Features
- Multi-stage build for optimal image size
- Production dependency installation only
- Non-root user execution
- Proper environment variable handling
- Health check implementation

### Docker Compose Services
- **backend**: Node.js application server
- **frontend**: React/Vite development server (for development) or static file serving (for production)
- **mongo**: MongoDB database
- **redis**: Redis cache and rate limiting store
- **mailhog** (optional): Email testing interface

### Production Docker Usage
For production deployments, you can use the built Docker image:
```bash
docker pull your-registry/unihostel:latest
docker run -d \
  --name unihostel \
  -p 5000:5000 \
  --env-file .env \
  --restart unless-stopped \
  your-registry/unihostel:latest
```

Then serve the frontend build through a web server (NGINX, Apache, etc.) or cloud storage.

## 🔄 CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:

1. **Triggers** on push and pull_request to main branch
2. **Sets up** MongoDB and Redis services for testing
3. **Installs** dependencies with caching
4. **Runs** linting checks (ESLint)
5. **Executes** unit tests
6. **Builds** Docker image
7. **Performs** security audits (npm audit)
8. **Pushes** Docker image to registry (when tags are pushed)

To enable Docker publishing in CI:
1. Add `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` repository secrets
2. The workflow will automatically push images on tag pushes

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

### Linting
```bash
# Backend
cd backend
npm run lint
npm run lint:fix

# Frontend
cd frontend
npm run lint
npm run lint:fix
```

### Security Auditing
```bash
cd backend
npm audit --production
```

## 📁 Project Structure

```
UniHostel-main/
├── .github/                  # GitHub Actions workflows
├── backend/                  # Node.js/Express API server
│   ├── config/               # Configuration files
│   ├── middleware/           # Custom middleware (auth, validation, security)
│   ├── models/               # Mongoose data models
│   ├── routes/               # API route handlers
│   ├── services/             # Background services (data retention, caching)
│   ├── utils/                # Utility functions (email, Cloudinary, JWT, etc.)
│   ├── server.js             # Main application entry point
│   ├── package.json          # Backend dependencies and scripts
│   └── .env.example          # Environment variable template
├── frontend/                 # React/Vite client application
│   ├── src/                  # Source code
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers (Auth)
│   │   ├── pages/            # Page components
│   │   ├── utils/            # Utility functions (API client, helpers)
│   │   ├── config/           # Configuration files (API endpoints)
│   │   ├── App.jsx           # Main application component
│   │   └── main.jsx          # Entry point
│   ├── public/               # Static assets
│   ├── package.json          # Frontend dependencies and scripts
│   └── vite.config.js        # Vite configuration
├── docker-compose.yml        # Docker Compose configuration
├── Dockerfile                # Multi-stage Docker build
├── .env.example              # Environment variables template
├── package.json              # Root package.json (for Docker build context)
└── README.md                 # This file
```

## 📱 Application Usage

### For Students
1. **Register** as a "Student" or login with existing credentials
2. **Browse Hostels** using the search and filter functionality
3. **View Details** by clicking on any hostel card
4. **Apply** by filling out the application form with semester and message
5. **Track Applications** in your Student Dashboard
6. **Receive Notifications** via email for application status changes

### For Managers
1. **Register** as a "Manager" or login with existing credentials
2. **Add Listings** using the "List New Hostel" button
3. **Manage Applications** from your Manager Dashboard
4. **Approve/Reject** applications with one-click actions
5. **Monitor Listings** and their occupancy status
6. **Receive Notifications** via email for new applications and actions

## 🔒 Security Features

The application implements multiple layers of security:

### Authentication & Authorization
- JWT-based authentication with HTTP-only cookies
- Role-based access control (Student, Manager, Admin)
- Password hashing using bcryptjs (cost factor 12)
- Session cookie rotation on sensitive actions (login, password change, MFA)
- Optional TOTP/MFA for enhanced security
- Privileged MFA for sensitive operations

### Input Validation & Sanitization
- Server-side validation on all API endpoints
- NoSQL injection protection via express-mongo-sanitize
- HTTP parameter pollution protection via hpp
- Comprehensive input sanitization and validation
- Request/response signing for sensitive APIs using HMAC-SHA256
- CSRF protection with token validation
- Rate limiting (IP-based and user-based) using Redis store

### Network & Infrastructure Security
- Helmet.js with secure defaults and strict CSP
- CORS configuration with dynamic origin validation
- Trust proxy configuration for proper IP detection behind proxies
- Rate limiting to prevent abuse and brute force attacks
- Optional Intrusion Detection System (IDS) with attack pattern detection
- Optional auto-blocking of malicious IPs
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, etc.

### Data Protection
- Environment variable-based configuration
- Secure handling of API keys and secrets
- Encrypted storage of sensitive data (TOTP secrets)
- Secure password reset implementation
- Data retention and deletion policies
- GDPR compliance endpoints for data export and deletion

### Monitoring & Observability
- Structured logging with Winston
- Health check endpoint for monitoring
- Error tracking and reporting
- Optional visitor analytics
- Email delivery monitoring
- Backup and restore capabilities

## 🐛 Troubleshooting

### Common Issues

#### Container Fail to Start
1. **Check logs**: `docker compose logs [service-name]`
2. **Verify environment**: Ensure `.env` file exists with required variables
3. **Check dependencies**: MongoDB and Redis must be accessible
4. **Resource constraints**: Ensure sufficient memory and disk space

#### Database Connection Issues
- Verify MongoDB is running and accessible
- Check `MONGO_URI` in `.env` for correct format and credentials
- For MongoDB Atlas: ensure IP whitelist includes your server's IP
- Test connection: `mongo "your-connection-string"`

#### Redis Connection Issues
- Verify Redis is running on default port 6379
- Check `REDIS_URL` in `.env`
- Test connection: `redis-cli ping` should return `PONG`

#### Port Conflicts
- Ensure ports 5000 (backend) and 5173 (frontend) are free
- To check: `lsof -i :5000` and `lsof -i :5173` (macOS/Linux)
- Or: `netstat -ano | findstr :5000` (Windows)
- Change ports in `.env` and docker-compose.yml if needed

#### Email Notifications Not Sending
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`
- For Gmail: use App Password if 2FA is enabled
- Check email service provider limits and restrictions
- Test email connectivity manually if possible

#### Image Upload Failures
- Verify Cloudinary credentials in `.env`
- Check internet connectivity to Cloudinary API
- Ensure file types and sizes are within limits
- Check Cloudinary account status and usage

#### API Documentation Not Loading
- Ensure `ENABLE_API_DOCS_IN_PRODUCTION=true` for production environments
- Check that `/api-docs` route is accessible
- Verify swagger-ui-express dependency is installed

### Performance Issues
- Monitor database query performance with MongoDB profiler
- Check Redis memory usage and eviction policies
- Optimize frequently accessed database queries
- Consider adding database indexes for common query patterns
- Enable HTTP caching headers for static assets
- Use CDN for static assets in production

## 📈 Monitoring & Maintenance

### Health Checks
Regularly check the health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response when healthy:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "connected": true,
    "readyState": 1
  },
  "redis": {
    "status": "connected",
    "connected": true
  },
  "environment": "production",
  "uptime": 3600.5,
  "timestamp": "2026-07-10T10:30:00.000Z"
}
```

### Logs
- Application logs: `docker compose logs -f backend`
- Access logs: Stored in `backend/logs/access.log`
- Error logs: Check console output and application logs

### Backups
Manual backup:
```bash
docker compose exec backend npm run backup
```

Automated backups can be scheduled using cron or similar tools.

### Updates
To update the application:
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build
```

Or for rolling updates with Docker Swarm/Kubernetes:
```bash
docker service update --image your-registry/unihostel:latest unihostel_service
```

## 🤝 Contributing

We welcome contributions to improve UniHostel! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: Ensure all tests pass
5. **Run linting**: Fix any linting errors
6. **Commit your changes**: `git commit -m "Add amazing feature"`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

Please ensure your code follows:
- Existing code style and conventions
- Includes appropriate tests
- Doesn't break existing functionality
- Is well-documented for complex logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Unsplash** for providing beautiful, free images used in the application
- **Lucide** for the excellent open-source icon set
- **Tailwind CSS** for the utility-first CSS framework
- **MongoDB** and **Redis** for their excellent database solutions
- **The Express.js community** for the robust web framework
- **All contributors** who have helped improve this project

---

**Built with ❤️ for the student community**

*Last updated: July 2026*