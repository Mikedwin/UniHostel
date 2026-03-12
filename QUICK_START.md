# UniHostel Quick Start Guide

## Prerequisites Installed ✓
- Node.js and npm
- All backend dependencies (Express, MongoDB, JWT, etc.)
- All frontend dependencies (React, Tailwind CSS, etc.)

## Starting the Application

### Option 1: Using Batch Files (Recommended)
```bash
# Run the setup first (if not done already)
setup.bat

# Check MongoDB connection
check-mongodb.bat

# Start both servers
start-dev.bat
```

### Option 2: Using npm Scripts
```bash
# Start both servers simultaneously
npm run dev

# Or start them separately:
npm run start-backend    # Backend on port 5000
npm run start-frontend   # Frontend on port 3000
```

### Option 3: Manual Start
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

## Application URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## Database Setup
The application uses MongoDB. You have two options:

### Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service
3. Database will be created automatically at `mongodb://localhost:27017/unihostel`

### MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGO_URI` in `backend/.env`

## Default Test Users
After starting the application, you can register new users or create test data through the UI.

## Troubleshooting
- **Port conflicts**: Make sure ports 3000 and 5000 are available
- **CORS errors**: Ensure backend is running on port 5000
- **MongoDB errors**: Run `check-mongodb.bat` to verify connection
- **Package issues**: Run `setup.bat` again to reinstall dependencies

## Project Structure
- `backend/` - Express.js API server
- `frontend/` - React application
- `*.bat` - Windows batch scripts for easy management