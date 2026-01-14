import React from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, GraduationCap, Building2 } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[600px] py-12">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Find your next</span>
              <span className="block text-primary-600">Student Hostel</span>
            </h1>
            <p className="mt-6 text-lg text-gray-500 max-w-2xl">
              The most reliable platform for university students to find, compare and book verified accommodation. Secure your semester residence with ease.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link 
                to="/hostels" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
              >
                Browse Hostels
              </Link>
              <Link 
                to="/manager-register" 
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200"
              >
                List Your Hostel
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-4 text-center">Already have an account?</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/student-login" 
                  className="flex-1 inline-flex items-center justify-center px-6 py-2 border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors duration-200"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student Login
                </Link>
                <Link 
                  to="/manager-login" 
                  className="flex-1 inline-flex items-center justify-center px-6 py-2 border border-indigo-300 text-indigo-700 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                >
                  <Building2 className="w-4 h-4 mr-2" />
                  Manager Login
                </Link>
              </div>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <img
              className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Student dormitory"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <Search />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Easy Search</h3>
              <p className="mt-2 text-gray-500">Filter by location, price, and facilities to find the perfect fit.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <ShieldCheck />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Verified Listings</h3>
              <p className="mt-2 text-gray-500">All hostels are registered and verified for physical safety.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <Clock />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Real-time Status</h3>
              <p className="mt-2 text-gray-500">Apply instantly and track your application status live.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
