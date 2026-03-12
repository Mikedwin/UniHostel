@echo off
echo Starting UniHostel Application...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak > nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo Both servers are starting...
echo Backend will run on http://localhost:5000
echo Frontend will run on http://localhost:3000
echo.
pause