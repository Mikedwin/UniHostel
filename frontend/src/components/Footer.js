import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
  return (
    <footer
      data-motion-section
      className="unihostel-footer-motion bg-[#173b35] text-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.7fr)_minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-10">
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-flex items-center gap-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#f6deb1] focus:ring-offset-4 focus:ring-offset-[#173b35]"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f6deb1] p-2 shadow-lg transition-transform duration-200 hover:scale-105">
                <Logo className="h-12 w-12" />
              </span>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-[-0.035em] sm:text-3xl text-white">
                  UniHostel
                </span>
                <span className="text-xs font-semibold text-[#f6deb1]/85 tracking-wide uppercase">
                  Built for students, by students
                </span>
              </div>
            </Link>
            <p className="mt-6 text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
              Verified student housing in Accra. Search, apply, and know what
              happens next.
            </p>
          </div>

          <nav aria-label="Platform links">
            <h2 className="text-sm font-bold text-[#f6deb1]">Explore</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/hostels"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  Browse hostels
                </Link>
              </li>
              <li>
                <Link
                  to="/student-register"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  Student registration
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  List your hostel
                </Link>
              </li>
              <li>
                <a
                  href="/#faq"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  FAQs
                </a>
              </li>
            </ul>
          </nav>

          <nav aria-label="Company links">
            <h2 className="text-sm font-bold text-[#f6deb1]">Company</h2>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  About UniHostel
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  Support centre
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  Terms and conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-white/70 transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  Privacy policy
                </Link>
              </li>
            </ul>
          </nav>

          <address className="not-italic">
            <h2 className="text-sm font-bold text-[#f6deb1]">Talk to us</h2>
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3">
                <Mail
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#f6deb1]"
                  aria-hidden="true"
                />
                <a
                  href="mailto:support@example.com"
                  className="break-all transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  support@example.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#f6deb1]"
                  aria-hidden="true"
                />
                <a
                  href="https://wa.me/233503847786"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-white focus:outline-none focus:text-[#f6deb1]"
                >
                  +233 50 3847 786
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-[#f6deb1]"
                  aria-hidden="true"
                />
                <span>Accra, Ghana</span>
              </li>
            </ul>
          </address>
        </div>
      </div>

      <div
        data-motion-element
        data-motion-threshold="0.1"
        className="unihostel-footer-word-trigger border-t border-white/15 px-6 pt-10 sm:px-10 sm:pt-12 lg:px-16"
      >
        <div className="unihostel-footer-word-motion">
          <div
            aria-hidden="true"
            className="mx-auto w-fit whitespace-nowrap text-[14vw] font-black leading-[0.78] tracking-[-0.04em] text-[#f6deb1]"
          >
            UniHostel
          </div>
          <div className="mx-auto mt-9 flex max-w-7xl flex-col gap-3 border-t border-white/15 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} UniHostel. All rights reserved.</p>
            <p>Built for students, by students.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
