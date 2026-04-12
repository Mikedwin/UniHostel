import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck
} from 'lucide-react';
import Footer from '../components/Footer';

const trustHighlights = [
  { icon: BadgeCheck, label: 'Verified hostels' },
  { icon: ShieldCheck, label: 'Secure payments' },
  { icon: Clock3, label: 'Live application tracking' }
];

const whyUniHostel = [
  {
    icon: Building2,
    title: 'Verified accommodation only',
    description:
      'Students browse hostels that have already been reviewed and listed through the platform, reducing uncertainty before applying.'
  },
  {
    icon: CreditCard,
    title: 'Payment happens at the right time',
    description:
      'Students only pay after approval, so the booking process feels clearer, safer, and easier to trust.'
  },
  {
    icon: UserCheck,
    title: 'End-to-end approval visibility',
    description:
      'From application to final approval and access code, the full process is visible inside the dashboard.'
  }
];

const processSteps = [
  {
    step: '01',
    title: 'Browse and apply',
    description:
      'Students explore hostel options, compare details, and submit an application for the best fit.'
  },
  {
    step: '02',
    title: 'Manager reviews the request',
    description:
      'The hostel manager checks availability and approves qualified applications for the next stage.'
  },
  {
    step: '03',
    title: 'Pay after approval',
    description:
      'Payment is requested only after approval, which keeps the process more transparent and student-friendly.'
  },
  {
    step: '04',
    title: 'Receive final approval and access code',
    description:
      'Once everything is confirmed, the student sees the final approval details and access code in the dashboard.'
  }
];

const proofPoints = [
  'Designed for semester-ready student accommodation decisions',
  'Built around approval-first payments instead of rushed checkout',
  'Clear dashboard status updates for students, managers, and admins',
  'Structured to reduce confusion during booking, payment, and move-in'
];

const faqs = [
  {
    question: 'How do I pay for my hostel booking?',
    answer:
      'Payments are processed through Paystack only after the hostel manager approves your application for payment.'
  },
  {
    question: 'Is my payment secure?',
    answer:
      'Yes. Payments are handled through a secure gateway, and the platform does not store your card details.'
  },
  {
    question: 'How do I get my access code?',
    answer:
      'After payment and final approval, your student dashboard shows the approval details and your unique access code.'
  },
  {
    question: 'How long does approval take?',
    answer:
      'Most approvals depend on the hostel manager, but the platform keeps the full process visible with status updates.'
  },
  {
    question: 'What if I have issues with my hostel?',
    answer:
      'Students can raise concerns through the platform so the issue can be reviewed and handled through the proper admin flow.'
  },
  {
    question: 'Can I cancel my booking?',
    answer:
      'Cancellation and refund decisions depend on the hostel and admin review, so students should contact support through their account.'
  }
];

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq((current) => (current === index ? null : index));
  };

  return (
    <div className="bg-white text-slate-900">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(35,129,122,0.20),_transparent_35%),linear-gradient(180deg,#f7fbfb_0%,#ffffff_45%,#f7fbfb_100%)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-[-6rem] h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-14 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white/90 px-4 py-2 text-xs sm:text-sm font-semibold text-primary-700 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Built for trusted student accommodation decisions
              </div>

              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.02] text-slate-950">
                Find verified student hostels with a process you can actually trust.
              </h1>

              <p className="mt-5 max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-xl leading-8 text-slate-600">
                UniHostel helps students browse real options, apply with confidence, pay only after approval, and track everything through to final access.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/hostels"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition-all hover:bg-primary-700 hover:-translate-y-0.5"
                >
                  Browse Hostels
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/student-register"
                  className="inline-flex items-center justify-center rounded-xl border border-primary-200 bg-white px-7 py-3.5 text-sm sm:text-base font-semibold text-primary-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50"
                >
                  Register as Student
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trustHighlights.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center justify-center lg:justify-start gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white p-3 shadow-2xl shadow-slate-200/70">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-900/10 via-transparent to-emerald-100/50 pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
                  alt="Student hostel room"
                  className="h-[420px] sm:h-[500px] w-full rounded-[1.5rem] object-cover"
                  loading="lazy"
                />

                <div className="absolute left-6 right-6 top-6 flex justify-between gap-4">
                  <div className="max-w-[13rem] rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur">
                    <div className="flex items-center gap-2 text-primary-700">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.2em]">Trust first</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      Apply before paying and keep every step visible in your dashboard.
                    </p>
                  </div>

                  <div className="hidden sm:block rounded-2xl bg-slate-950/90 px-4 py-3 text-white shadow-lg backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-200">Student flow</p>
                    <p className="mt-1 text-sm font-semibold">Apply → Approval → Payment → Access</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur">
                    <div className="flex items-center gap-2 text-primary-700">
                      <MapPin className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.16em]">Verified listings</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      Browse accommodation options prepared for university students.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/92 p-4 shadow-lg backdrop-blur">
                    <div className="flex items-center gap-2 text-primary-700">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-[0.16em]">Final access</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">
                      Students receive their final approval details and access code after completion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">Why UniHostel</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              A booking process designed to feel clearer, safer, and more reliable.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-8">
              The landing experience should immediately show students that this is more than a hostel list. It is a guided system for finding, applying for, and securing accommodation without confusion.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-7">
            {whyUniHostel.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-3xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfb_100%)] p-6 sm:p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-lg shadow-primary-600/20">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{title}</h3>
                <p className="mt-3 text-sm sm:text-base leading-7 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">How it works</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
                A simple flow from hostel search to final move-in access.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-slate-600 leading-8">
                Students should understand the process at a glance. The platform works best when the journey feels transparent from beginning to end.
              </p>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-200"
              >
                <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-primary-600 via-emerald-400 to-primary-200" />
                <div className="flex items-center justify-between gap-4">
                  <span className="text-4xl font-black tracking-tight text-primary-100">{step.step}</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-950">{step.title}</h3>
                <p className="mt-3 text-sm sm:text-base leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center">
            <div className="rounded-[2rem] bg-slate-950 p-8 sm:p-10 text-white shadow-2xl shadow-slate-900/10">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-300">Built for students</p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                Better accommodation decisions start with better clarity.
              </h2>
              <p className="mt-5 text-base sm:text-lg leading-8 text-slate-300">
                UniHostel is structured to remove the usual confusion around student accommodation by giving students a verified path from browsing to approval, payment, and access.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {proofPoints.map((point) => (
                <div
                  key={point}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm sm:text-base font-medium leading-7 text-slate-700">{point}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-14 sm:py-16 lg:py-20 bg-[linear-gradient(180deg,#f8fbfb_0%,#ffffff_100%)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-primary-600">Questions students ask</p>
            <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-slate-950">
              Helpful answers without the noise.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-8">
              The essentials are here so new students can understand how UniHostel works before signing up or applying.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between gap-4 px-5 sm:px-7 py-5 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-sm sm:text-lg font-bold text-slate-900">{faq.question}</span>
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                    {openFaq === index ? (
                      <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="border-t border-slate-100 px-5 sm:px-7 py-5 bg-slate-50/70">
                    <p className="text-sm sm:text-base leading-7 text-slate-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 text-white shadow-2xl shadow-slate-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-300">Ready to start?</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                  Start with verified hostel options, then move through the process with confidence.
                </h2>
                <p className="mt-4 text-base sm:text-lg leading-8 text-slate-300">
                  Browse hostels, register as a student, or contact support if you manage hostel accommodation and want to list on the platform.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/hostels"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Browse Hostels
                </Link>
                <Link
                  to="/student-register"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm sm:text-base font-semibold text-white backdrop-blur transition-all hover:bg-white/15"
                >
                  Register as Student
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm sm:text-base font-semibold text-white transition-all hover:bg-white/10"
                >
                  Manager Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
