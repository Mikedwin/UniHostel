@echo off
cd /d "%~dp0"

echo Initializing Git Repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit - UniHostel application ready for deployment"

echo Setting main branch...
git branch -M main

echo Adding remote origin...
git remote add origin https://github.com/Mikedwin/UniHostel.git

echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo Repository: https://github.com/Mikedwin/UniHostel
echo ========================================
echo.
echo Next Steps:
echo 1. Deploy backend to Railway (root: backend)
echo 2. Deploy frontend to Vercel (root: frontend)
echo ========================================
pause
