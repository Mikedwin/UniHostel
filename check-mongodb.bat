@echo off
echo Checking MongoDB connection...
echo.

echo Testing MongoDB connection on localhost:27017...
timeout /t 1 /nobreak > nul

:: Try to connect to MongoDB using a simple test
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/unihostel', { 
  serverSelectionTimeoutMS: 3000 
}).then(() => {
  console.log('✓ MongoDB is running and accessible');
  process.exit(0);
}).catch(err => {
  console.log('✗ MongoDB connection failed:', err.message);
  console.log('');
  console.log('Please ensure MongoDB is running:');
  console.log('1. Start MongoDB service, or');
  console.log('2. Update MONGO_URI in backend/.env to use MongoDB Atlas');
  process.exit(1);
});" 2>nul

if %errorlevel% equ 0 (
    echo MongoDB is ready!
) else (
    echo.
    echo MongoDB is not running or not accessible.
    echo.
    echo To start MongoDB locally:
    echo 1. Open Services (services.msc)
    echo 2. Find "MongoDB" service and start it
    echo 3. Or run: net start MongoDB
    echo.
    echo Alternatively, you can use MongoDB Atlas (cloud):
    echo 1. Create account at https://www.mongodb.com/atlas
    echo 2. Create a cluster and get connection string
    echo 3. Update MONGO_URI in backend/.env
)

pause