@echo off
echo Pushing Move Selected to History fix to GitHub...
echo.

echo Staging all changes...
git add .

echo.
echo Committing changes...
git commit -m "Fix: Add Move Selected to History functionality for admin logs

- Added isArchived, archivedAt, and archivedBy fields to AdminLog model
- Created new API endpoints for log archiving:
  * PATCH /api/admin/logs/archive - Move logs to history
  * GET /api/admin/logs/history - Get archived logs  
  * PATCH /api/admin/logs/restore - Restore logs from history
- Updated AdminDashboard with Move to History functionality
- Added Logs History tab for managing archived logs
- Enhanced bulk operations for log management
- Fixed issue where Move Selected to History button did nothing"

echo.
echo Pushing to GitHub...
git push origin main

echo.
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS: Changes pushed to GitHub successfully!
    echo The Move Selected to History functionality is now live.
) else (
    echo ERROR: Failed to push changes. Please check your git configuration.
    echo You may need to set up your GitHub credentials or check your internet connection.
)

echo.
pause