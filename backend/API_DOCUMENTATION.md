# API Documentation Implementation

## Overview
Swagger/OpenAPI 3.0 documentation has been implemented for the UniHostel API, providing interactive API exploration and testing capabilities.

## Access Documentation

### Local Development
```
http://localhost:5000/api-docs
```

### Production
```
https://unihostel-production.up.railway.app/api-docs
```

## Installation

Install the required dependencies:
```bash
cd backend
npm install
```

New packages added:
- `swagger-jsdoc@^6.2.8` - Generates OpenAPI spec from JSDoc comments
- `swagger-ui-express@^5.0.0` - Serves interactive Swagger UI

## Features

### Interactive API Explorer
- **Try It Out**: Test endpoints directly from the browser
- **Authentication**: Configure JWT tokens for protected endpoints
- **Request/Response Examples**: See sample payloads and responses
- **Schema Validation**: View data models and validation rules

### Documented Endpoints

#### Authentication
- `POST /api/auth/register` - Register new student account
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password/:token` - Reset password with token

#### Hostels
- `GET /api/hostels` - List all hostels (with filters)
- `GET /api/hostels/:id` - Get hostel details
- `POST /api/hostels` - Create hostel (Manager only)
- `PUT /api/hostels/:id` - Update hostel (Manager only)
- `DELETE /api/hostels/:id` - Delete hostel (Manager only)

#### Applications
- `POST /api/applications` - Submit application (Student only)
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/manager` - Get manager's applications
- `PATCH /api/applications/:id/status` - Update application status

#### Payments
- `POST /api/payment/initialize` - Initialize Paystack payment
- `GET /api/payment/verify/:reference` - Verify payment
- `POST /api/payment/webhook` - Paystack webhook handler

#### Admin
- `GET /api/admin/users` - List all users
- `PATCH /api/admin/users/:id/status` - Update user status
- `GET /api/admin/stats` - System statistics

#### GDPR
- `GET /api/gdpr/export-data` - Export user data
- `DELETE /api/gdpr/delete-account` - Delete account

## Security Schemes

### Bearer Authentication
Protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### CSRF Protection
Mutation endpoints require CSRF token:
```
X-CSRF-Token: <csrf-token>
```

## Usage Guide

### 1. Authenticate
1. Use `POST /api/auth/login` to get JWT token
2. Click "Authorize" button in Swagger UI
3. Enter: `Bearer <your-token>`
4. Click "Authorize" to save

### 2. Test Endpoints
1. Expand any endpoint
2. Click "Try it out"
3. Fill in parameters/body
4. Click "Execute"
5. View response below

### 3. View Schemas
Scroll to "Schemas" section to see:
- User model
- Hostel model
- Application model
- Error responses

## Adding New Documentation

Add JSDoc comments above route handlers:

```javascript
/**
 * @swagger
 * /api/your-endpoint:
 *   post:
 *     tags: [YourTag]
 *     summary: Brief description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field: { type: string }
 *     responses:
 *       200:
 *         description: Success response
 */
app.post('/api/your-endpoint', async (req, res) => {
  // handler code
});
```

## Benefits

### For Developers
- **No Manual Docs**: Auto-generated from code comments
- **Always Up-to-Date**: Docs update with code changes
- **Type Safety**: Schema validation prevents errors
- **Testing Tool**: Test APIs without Postman

### For Integration
- **Clear Contracts**: Well-defined request/response formats
- **Easy Onboarding**: New developers understand API quickly
- **Client Generation**: Generate API clients from OpenAPI spec
- **Standardized**: Industry-standard OpenAPI 3.0 format

## Maintenance

Documentation is automatically updated when:
1. Route handlers are modified
2. JSDoc comments are updated
3. Server restarts

No manual documentation updates needed!

## Production Considerations

- Documentation is publicly accessible at `/api-docs`
- Consider adding authentication for production docs if needed
- Swagger UI is lightweight and doesn't impact performance
- All sensitive data (tokens, passwords) are marked as required but not exposed

## Next Steps

1. Run `npm install` to install Swagger packages
2. Restart server: `npm run dev`
3. Visit `http://localhost:5000/api-docs`
4. Explore and test your API!
