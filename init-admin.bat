@echo off
echo ========================================
echo UniHostel - Admin Account Initialization
echo ========================================
echo.
echo This will create a manager account with:
echo Email: 1mikedwin@gmail.com
echo Role: Manager
echo.
pause

cd backend
echo.
echo Running initialization script...
echo.
call npm run init-admin

echo.
echo ========================================
echo Done! You can now login with your credentials.
echo ========================================
pause
