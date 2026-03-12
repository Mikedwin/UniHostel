@echo off
echo Starting UniHostel Development Environment...
echo.

echo Starting MongoDB (if not already running)...
echo Make sure MongoDB is running on mongodb://localhost:27017
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd /d backend && npm run dev"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d frontend && npm start"

echo.
echo UniHostel is starting up!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul