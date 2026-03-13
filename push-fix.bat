@echo off
echo ========================================
echo Pushing Room Availability Fix to GitHub
echo ========================================
echo.

cd /d "%~dp0"

echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Recalculate room availability when manager edits capacity"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo Done! Changes pushed to GitHub
echo ========================================
echo.
echo Deployments will start automatically:
echo - Render (backend): Check https://dashboard.render.com
echo - Vercel (frontend): Check https://vercel.com/dashboard
echo.
pause
