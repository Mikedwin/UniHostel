import React from 'react';
import { Mail, Clock, Phone, MessageSquare, Building2, Shield, AlertTriangle } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We're always here to help. Whether you have a question, need support, want to report an issue, 
            or simply need clarification, feel free to reach out to us. Your feedback and concerns matter to us.
          </p>
        </div>

        {/* Get in Touch Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Get in Touch</h2>
          
          {/* Email Support */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-primary-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Email Support</h3>
            </div>
            <div className="space-y-3 text-gray-700">
              <div>
                <p className="font-semibold">For general inquiries, support requests, or feedback:</p>
                <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline">
                  3mikedwin@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold">For privacy-related concerns:</p>
                <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline">
                  3mikedwin@gmail.com
                </a>
              </div>
              <div>
                <p className="font-semibold">For business or partnership inquiries:</p>
                <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline">
                  3mikedwin@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <Clock className="w-6 h-6 text-blue-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Support Hours</h3>
            </div>
            <p className="text-gray-700 mb-2">Our support team is available:</p>
            <p className="font-semibold text-gray-900">Monday – Friday</p>
            <p className="text-gray-700 mb-3">9:00 AM – 5:00 PM (GMT)</p>
            <p className="text-sm text-gray-600 italic">
              We aim to respond to all inquiries within 24–48 hours.
            </p>
          </div>
        </section>

        {/* Urgent Issues */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-50 to-white border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Urgent Issues</h2>
            </div>
            <p className="text-gray-700 mb-3">For urgent matters such as:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Payment issues</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Access code problems</span>
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                <span>Account suspension concerns</span>
              </li>
            </ul>
            <p className="text-gray-900 font-semibold">
              Please contact us through WhatsApp on{' '}
              <a href="https://wa.me/233503847786" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                +233 50 3847 786
              </a>{' '}
              and mark the issue as High Priority.
            </p>
          </div>
        </section>

        {/* Partnerships */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Partnerships & Institutions</h2>
            </div>
            <p className="text-gray-700 mb-3">If you are:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>A hostel owner</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>A school or university</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>A property manager</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-500 mr-2">•</span>
                <span>A potential partner</span>
              </li>
            </ul>
            <p className="text-gray-900">
              Reach out to us via{' '}
              <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline">
                3mikedwin@gmail.com
              </a>{' '}
              for collaboration opportunities.
            </p>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="mb-12">
          <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-orange-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Trust & Safety</h2>
            </div>
            <p className="text-gray-700 mb-3">To report:</p>
            <ul className="space-y-2 text-gray-700 mb-4">
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Fraud or suspicious activity</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Fake listings</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Policy violations</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-500 mr-2">•</span>
                <span>Harassment or abuse</span>
              </li>
            </ul>
            <p className="text-gray-900">
              Please email{' '}
              <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline">
                3mikedwin@gmail.com
              </a>{' '}
              or use the WhatsApp platform:{' '}
              <a href="https://wa.me/233503847786" className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                +233 50 3847 786
              </a>
            </p>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Email Us</h3>
              <a href="mailto:3mikedwin@gmail.com" className="text-primary-600 hover:underline text-lg">
                3mikedwin@gmail.com
              </a>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">WhatsApp</h3>
              <a href="https://wa.me/233503847786" className="text-primary-600 hover:underline text-lg" target="_blank" rel="noopener noreferrer">
                +233 50 3847 786
              </a>
            </div>
          </div>
        </section>

        {/* Closing Message */}
        <section className="text-center bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">We're Here for You</h2>
          <p className="text-gray-700 max-w-2xl mx-auto">
            At UniHostel, communication is key. No matter your role—student, manager, or administrator—we're 
            committed to supporting you every step of the way.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Contact;
