# Project Structure & Architecture

## Directory Organization

### Root Level Structure
```
Hostel Hub/
├── backend/           # Node.js/Express API server
├── frontend/          # React client application  
├── .amazonq/          # Amazon Q configuration and rules
├── package.json       # Root workspace configuration
├── README.md          # Project documentation
├── QUICK_START.md     # Setup instructions
└── *.bat             # Windows development scripts
```

### Backend Architecture (`/backend/`)
```
backend/
├── middleware/
│   └── auth.js        # JWT authentication middleware
├── models/
│   ├── Application.js # Student application data model
│   ├── Hostel.js      # Hostel property data model
│   └── User.js        # User account data model
├── server.js          # Main Express server entry point
├── package.json       # Backend dependencies
├── .env               # Environment configuration
└── .env.example       # Environment template
```

### Frontend Architecture (`/frontend/`)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.js        # Navigation component
│   │   └── ProtectedRoute.js # Route authentication guard
│   ├── context/
│   │   └── AuthContext.js   # Global authentication state
│   ├── pages/
│   │   ├── AddHostel.js     # Manager: Add new hostel
│   │   ├── HostelDetail.js  # Student: View hostel details
│   │   ├── HostelList.js    # Student: Browse all hostels
│   │   ├── Landing.js       # Public: Homepage
│   │   ├── Login.js         # Authentication: Login form
│   │   ├── ManagerDashboard.js # Manager: Control panel
│   │   ├── Register.js      # Authentication: Registration
│   │   └── StudentDashboard.js # Student: Application tracking
│   ├── App.js              # Main application component
│   ├── index.js            # React DOM entry point
│   └── index.css           # Global styles with Tailwind
├── package.json            # Frontend dependencies
├── tailwind.config.js      # Tailwind CSS configuration
└── postcss.config.js       # PostCSS configuration
```

## Core Components & Relationships

### Data Models
- **User Model**: Handles both Student and Manager accounts with role-based access
- **Hostel Model**: Property listings with amenities, pricing, and availability
- **Application Model**: Links students to hostels with application status tracking

### Component Hierarchy
```
App.js
├── AuthContext Provider (Global State)
├── Navbar (Navigation)
├── Router
│   ├── Landing (Public)
│   ├── Login/Register (Authentication)
│   ├── ProtectedRoute
│   │   ├── StudentDashboard
│   │   ├── ManagerDashboard  
│   │   ├── HostelList
│   │   ├── HostelDetail
│   │   └── AddHostel
```

### API Architecture
- **RESTful Design**: Standard HTTP methods for CRUD operations
- **Authentication Layer**: JWT middleware protects sensitive endpoints
- **Role-Based Access**: Different endpoints for Student vs Manager functionality
- **MongoDB Integration**: Mongoose ODM for database operations

## Architectural Patterns

### Frontend Patterns
- **Context API**: Centralized authentication state management
- **Protected Routes**: Route-level authentication guards
- **Component Composition**: Reusable UI components with props
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Patterns
- **MVC Architecture**: Models, middleware, and route handlers separation
- **Middleware Chain**: Authentication, CORS, and error handling
- **Environment Configuration**: Secure credential management with dotenv
- **Database Abstraction**: Mongoose schemas for data validation

### Development Workflow
- **Monorepo Structure**: Single repository with separate frontend/backend
- **Concurrent Development**: Scripts to run both servers simultaneously  
- **Environment Separation**: Different configurations for development/production
- **Automated Setup**: Batch scripts for Windows development environment