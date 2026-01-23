import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#22C55E] border-t border-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center text-white font-bold text-lg sm:text-xl mb-3 sm:mb-4">
              <Home className="mr-2 w-5 h-5 sm:w-6 sm:h-6" />
              UniHostel
            </div>
            <p className="text-xs sm:text-sm text-white/90 mb-3 sm:mb-4">
              The most reliable platform for university students to find, compare and book verified accommodation.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/hostels" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Browse Hostels
                </Link>
              </li>
              <li>
                <Link to="/student-register" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/manager-register" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  List Your Hostel
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-start">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0 text-white" />
                <a href="mailto:3mikedwin@gmail.com" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors break-all">
                  3mikedwin@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0 text-white" />
                <a href="https://wa.me/233503847786" className="text-xs sm:text-sm text-white/90 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
                  +233 50 3847 786
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 mt-0.5 flex-shrink-0 text-white" />
                <span className="text-xs sm:text-sm text-white/90">
                  Accra, Ghana
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-600 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-white/90">
            © {new Date().getFullYear()} UniHostel. All rights reserved. Built for students, by students.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
