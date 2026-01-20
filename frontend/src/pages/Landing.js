import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import Footer from '../components/Footer';

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      question: 'How do I pay for my hostel booking?',
      answer: 'We use Paystack, a secure payment gateway. You can pay with your debit/credit card or mobile money. Payment is only required after your application is approved by the hostel manager.'
    },
    {
      question: 'Is my payment secure?',
      answer: 'Yes! All payments are processed through Paystack with bank-level encryption. We never store your card details. Your financial information is completely secure.'
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Cancellation policies vary by hostel. Please contact the hostel manager directly through your dashboard. Refunds are handled on a case-by-case basis by the admin team.'
    },
    {
      question: 'How do I get my access code?',
      answer: 'After you pay and the manager gives final approval, you will receive a unique access code in your student dashboard. Present this code to the hostel manager when you arrive.'
    },
    {
      question: 'What if I have issues with my hostel?',
      answer: 'You can raise a dispute through your student dashboard. Our admin team will review your case and work with both parties to resolve the issue fairly.'
    },
    {
      question: 'How long does approval take?',
      answer: 'Most managers respond within 24-48 hours. You will receive notifications at each stage: application submitted, approved for payment, payment received, and final approval.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] lg:min-h-[600px] py-8 lg:py-12">
          {/* Content */}
          <div className="order-2 lg:order-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight font-extrabold text-gray-900 leading-tight">
              <span className="block">Find your next</span>
              <span className="block text-primary-600 mt-1">Student Hostel</span>
            </h1>
            <p className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              The most reliable platform for university students to find, compare and book verified accommodation. Secure your semester residence with ease.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                to="/hostels" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Browse Hostels
              </Link>
              <Link 
                to="/manager-register" 
                className="inline-flex items-center justify-center px-6 sm:px-8 py-3 border border-transparent text-base font-semibold rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors duration-200"
              >
                List Your Hostel
              </Link>
            </div>
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2">
            <img
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-xl"
              src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Student dormitory"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <Search />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Search</h3>
              <p className="text-sm text-gray-600">Filter by location, price, and facilities to find the perfect fit.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <ShieldCheck />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Listings</h3>
              <p className="text-sm text-gray-600">All hostels are registered and verified for physical safety.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white mb-4">
                <Clock />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Status</h3>
              <p className="text-sm text-gray-600">Apply instantly and track your application status live.</p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="bg-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg text-gray-600">Everything you need to know about booking your hostel</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 transition-colors">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex justify-between items-center"
                >
                  <span className="text-base sm:text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Landing;
