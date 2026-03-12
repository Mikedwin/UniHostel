# UniHostel - Dedicated Student Accommodation Marketplace

UniHostel is a full-stack web application designed to bridge the gap between university students searching for safe housing and hostel managers looking to fill vacancies. 

## Features

- **Dual-User System**: Specialized workflows for both Students and Hostel Managers.
- **Dynamic Marketplace**: Search and filter hostels by location, price, and facilities.
- **Booking System**: Students can apply for specific semesters directly through the platform.
- **Manager Dashboard**: Landlords can list properties, track availability, and approve/reject bookings.
- **Secure Authentication**: JWT-based security with password encryption.
- **Responsive UI**: Built with React and Tailwind CSS for seamless mobile and desktop browsing.

## Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **npm** or **yarn**

## Installation

### 1. Database Setup
Ensure your MongoDB service is running locally at `mongodb://localhost:27017/unihostel` or have your Atlas connection string ready.

### 2. Backend Setup
    cd backend
    npm install
    # Create .env from .env.example
    cp .env.example .env
    # Update MONGO_URI and JWT_SECRET in .env
    npm run dev

### 3. Frontend Setup
    cd frontend
    npm install
    npm start

## Application Usage

### For Students
1. Register an account as a "Student".
2. Browse the "Hostels" page.
3. Use filters to narrow down your search based on location and budget.
4. Click on a hostel card, fill in the application form (semester and message), and submit.
5. Track your status (Pending/Approved/Rejected) in your Student Dashboard.

### For Managers
1. Register an account as a "Manager".
2. Head to your Manager Dashboard.
3. Click "List New Hostel" to add your property details.
4. View incoming applications from students in real-time.
5. Click the checkmark to "Approve" or cross to "Reject" an application.

## Troubleshooting

- **CORS Errors**: Ensure the backend is running on port 5000 and the frontend on 3000.
- **MongoDB Connection**: If using Atlas, ensure your IP is whitelisted and the URI in `.env` is correct.
- **Images**: This demo uses Unsplash CDN links. If images don't load, check your internet connection.

## Project Structure

- `backend/`: Node/Express API, Mongoose models, and Auth middleware.
- `frontend/`: React components, Context API (Auth), and Tailwind styles.
