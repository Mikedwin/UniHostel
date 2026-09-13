@echo off
echo ========================================
echo UniHostel Setup Script
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo Node.js is installed: 
    node --version
)
echo.

echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
) else (
    echo npm is installed:
    npm --version
)
echo.

echo Installing backend dependencies...
cd backend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo Installing frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

cd ..

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo IMPORTANT: Make sure MongoDB is running before starting the application.
echo.
echo If you don't have MongoDB installed:
echo 1. Download MongoDB Community Server from https://www.mongodb.com/try/download/community
echo 2. Install and start the MongoDB service
echo 3. Or use MongoDB Atlas (cloud) and update the MONGO_URI in backend/.env
echo.
echo To start the application:
echo - Run 'start-dev.bat' to start both servers
echo - Backend will run on http://localhost:5000
echo - Frontend will run on http://localhost:3000
echo.
pause