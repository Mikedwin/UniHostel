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
  UserCheck
} from 'lucide-react';
import Footer from '../components/Footer';

const trustHighlights = [
  { icon: BadgeCheck, label: 'Verified hostels' },
  { icon: Clock3, label: 'Live application tracking' },
  { icon: Building2, label: 'Structured approval flow' }
];

const heroGlassCards = [
  {
    icon: BadgeCheck,
    title: 'Verified room match',
    description: 'Reviewed hostel listing ready for student applications.'
  },
  {
    icon: UserCheck,
    title: 'Approval-first booking',
    description: 'Apply now, pay only after the manager approves your spot.'
  },
  {
    icon: CreditCard,
    title: 'Dashboard visibility',
    description: 'Track payment, approval, and final access in one place.'
  }
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
      <section className="relative overflow-hidden bg-[#f3fbf9]">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-95"
            style={{
              backgroundImage:
                "linear-gradient(108deg, rgba(9,37,34,0.88) 0%, rgba(16,79,72,0.78) 38%, rgba(35,129,122,0.72) 58%, rgba(35,129,122,0.34) 100%), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=80')"
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(188,255,239,0.18),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.12),transparent_28%)]" />
          <div className="absolute -top-16 left-[10%] h-48 w-48 rounded-full bg-emerald-200/20 blur-3xl" />
          <div className="absolute top-32 right-[8%] h-64 w-64 rounded-full bg-cyan-100/15 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-[35%] h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute inset-y-0 left-0 w-full bg-[linear-gradient(90deg,rgba(6,20,19,0.68)_0%,rgba(6,20,19,0.28)_42%,rgba(6,20,19,0.10)_100%)] lg:w-[56%]" />
          <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:80px_80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[0.92fr_1.08fr] gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-teal-50 backdrop-blur-md shadow-lg shadow-black/10">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-200" />
                Verified student housing flow
              </div>

              <h1 className="mt-5 max-w-[10.5ch] text-4xl sm:text-5xl lg:text-[4.2rem] xl:text-[4.55rem] font-black tracking-tight leading-[0.98] text-white">
                Find verified student hostels with a process you can actually trust.
              </h1>

              <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-base sm:text-lg lg:text-[1.15rem] leading-8 text-teal-50/92">
                UniHostel helps students browse real options, apply with confidence, pay only after approval, and track everything through to final access.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/hostels"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-sm sm:text-base font-semibold text-slate-950 shadow-xl shadow-black/20 transition-all hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Browse Hostels
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/student-register"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm sm:text-base font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:border-white/35 hover:bg-white/15"
                >
                  Register as Student
                </Link>
              </div>

              <div className="mt-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trustHighlights.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center justify-center lg:justify-start gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-lg shadow-black/10 backdrop-blur-md"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-emerald-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-white">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[480px] sm:min-h-[640px]">
              <div className="absolute left-0 top-20 hidden w-52 rounded-[1.75rem] border border-white/25 bg-white/14 p-4 text-white shadow-2xl shadow-black/15 backdrop-blur-xl xl:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-300/20 text-emerald-100">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Application status</p>
                    <p className="text-xs text-teal-50/80">Visible at every stage</p>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-emerald-200 via-white to-emerald-100" />
                </div>
                <p className="mt-3 text-xs leading-6 text-teal-50/85">
                  Approval, payment, and final access all stay organized inside one dashboard.
                </p>
              </div>

              <div className="absolute right-0 top-8 w-full max-w-[32rem] overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 p-3 shadow-2xl shadow-black/20 backdrop-blur-md lg:right-4 xl:right-2">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#061413]/30 via-transparent to-white/10 pointer-events-none" />
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1500&q=80"
                  alt="Modern student accommodation interior"
                  className="h-[390px] sm:h-[480px] w-full rounded-[1.5rem] object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(6,20,19,0.05)_0%,rgba(6,20,19,0.38)_100%)]" />
                <div className="absolute left-6 top-6 rounded-full border border-white/20 bg-[#082523]/55 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                  Student living, verified
                </div>
                <div className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur-md">
                  Pay after approval
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 grid gap-4 sm:grid-cols-2 lg:left-16 lg:right-6 xl:left-14 xl:right-2">
                {heroGlassCards.map(({ icon: Icon, title, description }, index) => (
                  <div
                    key={title}
                    className={`rounded-[1.75rem] border border-white/20 bg-white/12 p-4 text-white shadow-xl shadow-black/15 backdrop-blur-xl ${
                      index === 2 ? 'sm:col-span-2 lg:ml-8 lg:max-w-[18.5rem]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/14 text-emerald-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-teal-50/82">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
            <div className="relative overflow-hidden rounded-[2rem] p-8 sm:p-10 text-white shadow-2xl shadow-primary-700/20">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, rgba(35,129,122,0.92), rgba(26,97,89,0.90)), url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80')"
                }}
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_30%)]" />
              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-200">Built for students</p>
                <h2 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight">
                  Better accommodation decisions start with better clarity.
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-8 text-teal-50/95">
                  UniHostel is structured to remove the usual confusion around student accommodation by giving students a verified path from browsing to approval, payment, and access.
                </p>
              </div>
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
          <div className="relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-14 text-white shadow-2xl shadow-primary-700/20">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, rgba(35,129,122,0.92), rgba(26,97,89,0.90)), url('https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80')"
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_28%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.24em] text-emerald-200">Ready to start?</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight">
                  Start with verified hostel options, then move through the process with confidence.
                </h2>
                <p className="mt-5 text-base sm:text-lg leading-8 text-teal-50/95">
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
