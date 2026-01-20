import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Building2, GraduationCap, Shield, CheckCircle, TrendingUp, Eye } from 'lucide-react';
import Footer from '../components/Footer';

const About = () => {
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            About UniHostel
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Finding safe, affordable, and reliable student accommodation shouldn't be stressful. That's why we built <span className="font-semibold text-primary-600">UniHostel</span>— a centralized platform designed to connect students with verified hostels in a simple, transparent, and secure way.
          </p>
        </div>

        {/* Introduction */}
        <div className="mb-12 bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-lg p-6 sm:p-8">
          <p className="text-gray-700 leading-relaxed">
            Our platform bridges the gap between students searching for accommodation and hostel managers looking to efficiently manage and fill their rooms, while giving administrators full oversight to ensure trust, fairness, and accountability across the system.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-12">
          <div className="flex items-center mb-6">
            <div className="bg-primary-500 p-3 rounded-full mr-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our mission is to simplify student housing by providing a digital solution that makes discovering, applying, and securing hostel accommodation easy, transparent, and reliable.
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-900 font-semibold mb-3">We aim to:</p>
            <ul className="space-y-2">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Eliminate uncertainty in hostel availability</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Reduce fraud and misinformation</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Create a fair and structured booking process for all parties</span>
              </li>
            </ul>
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 text-center">What We Do</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Students */}
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-500 p-3 rounded-full mr-3">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">For Students</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">We help students:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Browse verified hostels with clear pricing and room details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>View actual room images and hostel views</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Apply for rooms without physical stress or guesswork</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Make secure payments only after approval</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  <span>Receive a unique access code after confirmation</span>
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
              <p className="text-sm text-gray-600 mb-3">We empower managers to:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>List and manage hostels efficiently</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Control room availability and occupancy in real time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Review and approve applications fairly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Receive payments securely through integrated systems</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  <span>Track applications, occupancy, and earnings from one dashboard</span>
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
              <p className="text-sm text-gray-600 mb-3">We provide administrators with:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Full system oversight and control</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>User verification and platform moderation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Transparent commission tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Advanced analytics and reporting tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span>Tools to resolve disputes and maintain platform integrity</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-gray-50 rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {[
                { step: 1, text: 'Students browse available hostels' },
                { step: 2, text: 'Students apply for preferred rooms' },
                { step: 3, text: 'Managers review and approve applications' },
                { step: 4, text: 'Approved students make secure payments' },
                { step: 5, text: 'Final confirmation is granted' },
                { step: 6, text: 'Students receive a unique access code for hostel entry' }
              ].map((item) => (
                <div key={item.step} className="flex items-start">
                  <div className="bg-primary-600 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-4">
                    {item.step}
                  </div>
                  <p className="text-gray-700 pt-1">{item.text}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-600 mt-6 italic">
              This structured process ensures fairness, transparency, and security at every stage.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Verified Listings', desc: 'No fake hostels, no misleading information' },
              { icon: CheckCircle, title: 'Secure Payments', desc: 'Powered by trusted payment gateways' },
              { icon: Users, title: 'Fair Allocation', desc: 'Rooms are filled only after approval' },
              { icon: Eye, title: 'Transparency', desc: 'Clear pricing and application status' },
              { icon: TrendingUp, title: 'Data-Driven', desc: 'Real-time dashboards and insights' }
            ].map((feature, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <feature.icon className="w-8 h-8 text-primary-600 mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Vision */}
        <section className="mb-12 bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-4">
            <div className="bg-purple-500 p-3 rounded-full mr-4">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Vision</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-4">
            We envision a future where every student can secure accommodation without stress, and every hostel manager can operate efficiently using technology.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Our long-term goal is to become the leading student accommodation platform, expanding across institutions while maintaining trust, quality, and accountability.
          </p>
        </section>

        {/* Trust & Security */}
        <section className="mb-12 bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-6 sm:p-8">
          <div className="flex items-center mb-4">
            <div className="bg-blue-500 p-3 rounded-full mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trust & Security</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            We take data protection and payment security seriously. All transactions are handled securely, and access to hostels is protected through unique verification codes to prevent impersonation or unauthorized access.
          </p>
        </section>

        {/* Closing Statement */}
        <div className="text-center bg-primary-600 text-white rounded-lg p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Built for Students. Powered by Trust.</h2>
          <p className="text-lg mb-6">UniHostel is more than a booking platform — it's a smarter way to find and manage student accommodation.</p>
          <Link 
            to="/hostels" 
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Browse Hostels Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
