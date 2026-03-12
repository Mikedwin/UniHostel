@echo off
echo Enter your GitHub repository URL (e.g., https://github.com/username/repo.git):
set /p REPO_URL=

echo Adding remote origin...
git remote add origin %REPO_URL%

echo Pushing to GitHub...
git push -u origin main

echo.
echo ========================================
echo Done! Your code is now on GitHub
echo ========================================
pause
