@echo off
echo ========================================
echo  Pushing Manager Dashboard Fix to GitHub
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo ERROR: Git repository not initialized!
    echo Run: git init
    echo Then: git remote add origin [your-repo-url]
    pause
    exit /b 1
)

echo Step 1: Checking current branch...
git branch
echo.

echo Step 2: Checking git status...
git status
echo.

echo Step 3: Adding all changes...
git add .
echo.

echo Step 4: Committing changes...
git commit -m "Fix: Manager Dashboard approve/reject functionality with enhanced logging and error handling"
echo.

echo Step 5: Checking remote...
git remote -v
echo.

echo Step 6: Pushing to GitHub...
git push origin main
echo.

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Push failed! Trying 'master' branch...
    git push origin master
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ========================================
    echo  Push Failed!
    echo ========================================
    echo.
    echo Possible reasons:
    echo 1. Remote repository not set up
    echo 2. Authentication required
    echo 3. Branch name mismatch
    echo.
    echo Try manually:
    echo   git push origin [your-branch-name]
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  Successfully pushed to GitHub!
echo ========================================
echo.
echo Changes pushed:
echo - Enhanced Manager Dashboard error handling
echo - Improved backend validation and logging
echo - Environment-aware API configuration
echo - Documentation files (FIX_SUMMARY.md, etc.)
echo.
pause
