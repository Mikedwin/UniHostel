@echo off
echo ========================================
echo UniHostel - Dashboard Performance Fix
echo ========================================
echo.
echo This will create database indexes to improve
echo dashboard loading speed and reliability.
echo.
pause

cd backend
echo.
echo Creating database indexes...
echo.
call npm run ensure-indexes

echo.
echo ========================================
echo Done! Your dashboard should now load faster.
echo ========================================
echo.
echo Please restart your backend server if it's running.
pause
