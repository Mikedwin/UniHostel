@echo off
echo Checking MongoDB connection...
echo.

if not exist backend\.env (
    echo backend\.env not found.
    echo Create backend\.env with your MONGO_URI before running this check.
    pause
    exit /b 1
)

echo Testing MongoDB connection using backend\.env MONGO_URI...
timeout /t 1 /nobreak > nul

pushd backend

node -e "require('dotenv').config(); const mongoose = require('mongoose'); if (!process.env.MONGO_URI) { console.log('X MONGO_URI is missing from backend/.env'); process.exit(1); } mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 }).then(() => { console.log('OK MongoDB connection succeeded with backend/.env'); return mongoose.disconnect(); }).then(() => process.exit(0)).catch(err => { console.log('X MongoDB connection failed:', err.message); process.exit(1); });" 2>nul

set CHECK_RESULT=%errorlevel%
popd

if %CHECK_RESULT% equ 0 (
    echo MongoDB is ready with the configured Atlas connection.
) else (
    echo.
    echo MongoDB is not accessible with the configured backend/.env value.
    echo.
    echo Check these items:
    echo 1. Confirm the Atlas database user password was rotated correctly
    echo 2. Update MONGO_URI in backend/.env with the new password
    echo 3. Verify MongoDB Atlas Network Access allows your current IP
    echo 4. Confirm the cluster is running and not paused
)

pause
