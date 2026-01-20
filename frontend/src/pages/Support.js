import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Building2, Shield, Clock, AlertTriangle, Mail, Phone, HelpCircle } from 'lucide-react';
import Footer from '../components/Footer';

const Support = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-100 p-4 rounded-full">
              <HelpCircle className="w-12 h-12 text-primary-600" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Support Center
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Welcome to the Support Center. We're here to help you every step of the way. Whether you're a student applying for a room, a hostel manager managing listings, or an administrator overseeing the platform, this is your go-to place for help, guidance, and answers.
          </p>
          <p className="text-gray-700 font-semibold mt-4">
            Our goal is to make your experience smooth, transparent, and stress-free.
          </p>
        </div>

        {/* How Can We Help */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">How Can We Help You?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Students */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 p-3 rounded-full mr-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Students</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3 font-semibold">Get help with:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Creating and managing your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Browsing hostels and rooms</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Understanding application and approval status</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Payments and receipts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Access codes and hostel entry</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Refunds and disputes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Reporting issues or suspicious activity</span>
                </li>
              </ul>
            </div>

            {/* For Managers */}
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-500 p-3 rounded-full mr-3">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Managers</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3 font-semibold">Support for:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Account verification and approval</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Creating and editing hostel listings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Managing room capacity and occupancy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Reviewing and approving applications</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Payment tracking and settlements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Dashboard analytics and reports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Technical issues or errors</span>
                </li>
              </ul>
            </div>

            {/* For Administrators */}
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-500 p-3 rounded-full mr-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Admins</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3 font-semibold">Tools and guidance for:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>User management and verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Application intervention and dispute resolution</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Payment and commission tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>System analytics and exports</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Platform monitoring and security</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Technical troubleshooting</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Report an Issue */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Report an Issue</h2>
            </div>
            <p className="text-gray-700 mb-4">If something isn't working as expected, you can:</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Attach screenshots or documents</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Contact the admin through his whatsapp number +233 50 3847 786</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Track the status of your request in real time</span>
              </li>
            </ul>
            <p className="text-sm text-gray-600 italic">
              All issues are logged and reviewed to ensure quick resolution.
            </p>
          </div>
        </section>

        {/* Response Time */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <Clock className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Response Time</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold mr-3 mt-1">CRITICAL</div>
                <div>
                  <p className="font-semibold text-gray-900">Critical issues (payments, access problems)</p>
                  <p className="text-sm text-gray-600">Within 24 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mr-3 mt-1">GENERAL</div>
                <div>
                  <p className="font-semibold text-gray-900">General inquiries</p>
                  <p className="text-sm text-gray-600">24–48 hours</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mr-3 mt-1">FEATURES</div>
                <div>
                  <p className="font-semibold text-gray-900">Feature requests</p>
                  <p className="text-sm text-gray-600">Reviewed periodically</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              We prioritize issues based on urgency to serve you better.
            </p>
          </div>
        </section>

        {/* Safety & Trust */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg p-6 sm:p-8">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Safety & Trust</h2>
            </div>
            <p className="text-gray-700 mb-4">If you notice:</p>
            <ul className="space-y-2 text-gray-700 mb-6">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Suspicious listings</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Fraudulent activity</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Misleading information</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Harassment or abuse</span>
              </li>
            </ul>
            <p className="text-gray-900 font-semibold">
              Please report it immediately using the Contact Us form below. Your safety and trust are our top priorities.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Support</h3>
              <a href="mailto:support@unihostel.com" className="text-primary-600 hover:underline">
                support@unihostel.com
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Phone Support</h3>
              <a href="tel:+233123456789" className="text-primary-600 hover:underline">
                +233 123 456 789
              </a>
            </div>
          </div>

          <div className="bg-gray-100 rounded-lg p-6 mt-6 text-center">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-900 font-semibold mb-1">Business Hours</p>
            <p className="text-gray-600">Monday – Friday, 9:00 AM – 5:00 PM (GMT)</p>
          </div>
        </section>

        {/* Closing Statement */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">We're Here to Help</h2>
          <p className="text-lg mb-2">
            At UniHostel, support isn't an afterthought — it's part of the experience.
          </p>
          <p className="text-base">
            If you're stuck, confused, or just need clarification, we've got you covered.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Support;
