# UniHostel - Student Accommodation Marketplace

UniHostel is a comprehensive full-stack web application designed to bridge the gap between university students searching for safe, affordable housing and hostel managers looking to fill vacancies. The platform creates a specialized marketplace focused exclusively on student accommodation needs.

## 🚀 Features

### For Students
- **Smart Search & Discovery**: Browse hostels with advanced filtering by location, price range, and available facilities
- **Semester-Based Applications**: Apply for specific academic terms with personalized messages to managers
- **Application Tracking**: Real-time status monitoring (Pending/Approved/Rejected) through dedicated dashboard
- **Responsive Experience**: Mobile-optimized interface for on-the-go housing searches

### For Hostel Managers
- **Property Management**: Easy hostel listing with detailed property information and amenities
- **Application Processing**: Centralized dashboard to review, approve, or reject student applications
- **Availability Tracking**: Monitor occupancy and manage bookings across different time periods
- **Direct Communication**: Receive and respond to student inquiries through the platform

### Technical Features
- **Secure Authentication**: JWT-based security with encrypted password storage
- **Real-time Updates**: Dynamic application status changes and instant notifications
- **Advanced Search**: Multi-criteria search with text matching across multiple fields
- **Responsive Design**: Modern UI/UX with Tailwind CSS for all device sizes
- **Error Handling**: Comprehensive error handling and user feedback

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with functional components and hooks
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or MongoDB Atlas)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Hostel Hub"
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
copy .env.example .env
# Update MONGO_URI and JWT_SECRET in .env

# Seed sample data (optional)
npm run seed

# Start development server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm start
```

### 4. Quick Start (Both Servers)
Alternatively, use the batch script to start both servers:
```bash
start-all.bat
```

## 🔧 Configuration

### Environment Variables (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/unihostel
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/unihostel
JWT_SECRET=your-super-secret-jwt-key
```

### Sample Data
Run the seed script to populate your database with sample data:
```bash
cd backend
npm run seed
```

**Sample Login Credentials:**
- **Manager**: manager@test.com / password123
- **Student**: student@test.com / password123

## 📱 Application Usage

### For Students
1. **Register** as a "Student" or login with existing credentials
2. **Browse Hostels** using the search and filter functionality
3. **View Details** by clicking on any hostel card
4. **Apply** by filling out the application form with semester and message
5. **Track Applications** in your Student Dashboard

### For Managers
1. **Register** as a "Manager" or login with existing credentials
2. **Add Listings** using the "List New Hostel" button
3. **Manage Applications** from your Manager Dashboard
4. **Approve/Reject** applications with one-click actions
5. **Monitor Listings** and their status

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Hostels
- `GET /api/hostels` - Get all hostels (with search/filter)
- `GET /api/hostels/:id` - Get specific hostel
- `POST /api/hostels` - Create new hostel (Manager only)
- `GET /api/hostels/my-listings` - Get manager's listings

### Applications
- `POST /api/applications` - Submit application (Student only)
- `GET /api/applications/student` - Get student's applications
- `GET /api/applications/manager` - Get applications for manager's hostels
- `PATCH /api/applications/:id` - Update application status (Manager only)

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with intuitive navigation
- **Loading States**: Visual feedback during data loading
- **Error Handling**: User-friendly error messages and validation
- **Hover Effects**: Interactive elements with smooth transitions
- **Form Validation**: Client-side and server-side validation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access**: Different permissions for students and managers
- **Input Validation**: Comprehensive validation on both client and server
- **CORS Protection**: Configured for secure cross-origin requests

## 🚨 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process-id> /F
```

**MongoDB Connection Issues**
- Ensure MongoDB is running locally or Atlas connection string is correct
- Check firewall settings and IP whitelist for Atlas
- Verify database name in connection string

**CORS Errors**
- Ensure backend is running on port 5000
- Check that frontend is making requests to correct backend URL

**Images Not Loading**
- Using Unsplash CDN links - check internet connection
- Images will fallback to default if original fails to load

## 📁 Project Structure

```
Hostel Hub/
├── backend/                 # Node.js/Express API server
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Mongoose data models
│   ├── server.js          # Main server file
│   ├── seed.js            # Database seeding script
│   └── .env               # Environment variables
├── frontend/               # React client application
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context for state management
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main App component
│   └── tailwind.config.js # Tailwind CSS configuration
├── start-all.bat          # Script to start both servers
└── README.md              # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Images provided by [Unsplash](https://unsplash.com)
- Icons by [Lucide](https://lucide.dev)
- UI components styled with [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ for the student community**