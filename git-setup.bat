@echo off
echo Initializing Git Repository...
git init

echo Adding all files...
git add .

echo Creating initial commit...
git commit -m "Initial commit - UniHostel application ready for deployment"

echo Setting main branch...
git branch -M main

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Create a new repository on GitHub
echo 2. Copy the repository URL
echo 3. Run: git remote add origin YOUR_GITHUB_URL
echo 4. Run: git push -u origin main
echo ========================================
pause
