import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  MapPin,
} from "lucide-react";
import Footer from "../components/Footer";

const steps = [
  {
    number: "01",
    title: "Find your fit",
    text: "Browse verified hostel listings across Ghana and compare room types, prices, and availability.",
  },
  {
    number: "02",
    title: "Apply for a room",
    text: "Send an application for the room that works for your semester and your budget.",
  },
  {
    number: "03",
    title: "Wait for approval",
    text: "Your manager reviews the request before a payment is requested.",
  },
  {
    number: "04",
    title: "Pay and get access",
    text: "Pay after approval, then track final confirmation and access details in your dashboard.",
  },
];

const decisionPoints = [
  {
    title: "The room itself",
    text: "See room types, facilities, capacity, and photos before deciding where you fit.",
    icon: Building2,
  },
  {
    title: "The cost for your semester",
    text: "Check the listed semester price and whether spaces are still available before you apply.",
    icon: CreditCard,
  },
  {
    title: "Where you will be staying",
    text: "Review the hostel location and its details so the choice works for your daily routine.",
    icon: MapPin,
  },
  {
    title: "What happens after you apply",
    text: "Your application is reviewed first. Payment is only requested after approval.",
    icon: BadgeCheck,
  },
];

const faqs = [
  {
    question: "When do I pay for my hostel booking?",
    answer:
      "Payment is requested through Paystack only after a hostel manager approves your application for payment.",
  },
  {
    question: "How do I know a hostel is verified?",
    answer:
      "UniHostel is built around reviewed listings and a structured application flow, so students can make decisions with clearer information.",
  },
  {
    question: "What happens after I pay?",
    answer:
      "Your dashboard keeps the next steps visible. Once final approval is complete, you can view your approval details and access code.",
  },
  {
    question: "Can hostel managers use UniHostel?",
    answer:
      "Yes. Managers use their own workspace to oversee listings, room availability, applications, approvals, and operations.",
  },
];

const Landing = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [motionEnabled, setMotionEnabled] = useState(false);
  const landingRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const targets = landingRef.current?.querySelectorAll(
      "[data-motion-section], [data-motion-element]",
    );
    if (!targets?.length) return undefined;

    setMotionEnabled(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const threshold = Number(entry.target.dataset.motionThreshold ?? 0.4);
          entry.target.classList.toggle(
            "unihostel-motion-visible",
            entry.intersectionRatio >= threshold,
          );
        });
      },
      { threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7], rootMargin: "0px" },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={landingRef}
      className={`bg-[#f8f6f0] text-[#173b35] ${motionEnabled ? "unihostel-motion-enabled" : ""}`}
    >
      <main>
        <section
          data-motion-section
          className="unihostel-hero-motion relative isolate min-h-[540px] overflow-hidden bg-[#173b35] sm:min-h-[620px] lg:min-h-[680px]"
        >
          <img
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2200&q=90"
            alt="Comfortable, furnished student accommodation"
            className="unihostel-hero-media absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(22,31,22,.88)_0%,rgba(27,43,28,.70)_42%,rgba(27,43,28,.18)_72%,rgba(27,43,28,.05)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(17,27,19,.48),transparent_54%)]" />

          <div className="relative mx-auto flex min-h-[540px] max-w-7xl items-end px-6 pb-14 pt-32 sm:min-h-[620px] sm:px-10 sm:pb-20 sm:pt-36 lg:min-h-[680px] lg:px-16 lg:pb-24">
            <div className="max-w-xl text-white">
              <p className="unihostel-hero-reveal unihostel-hero-reveal-1 flex items-center gap-2 text-xs font-semibold tracking-[0.02em] text-[#f6deb1] sm:text-sm">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
                Verified student housing across Ghana
              </p>
              <h1 className="mt-5 max-w-[10ch] text-4xl font-black leading-[0.94] tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
                <span className="unihostel-hero-reveal unihostel-hero-reveal-2 block">
                  Find a hostel.
                </span>
                <span className="unihostel-hero-reveal unihostel-hero-reveal-3 block">
                  Know what happens next.
                </span>
              </h1>
              <p className="unihostel-hero-reveal unihostel-hero-reveal-4 mt-6 max-w-md text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
                Browse verified rooms, apply with confidence, and pay only after
                approval.
              </p>
              <div className="unihostel-hero-reveal unihostel-hero-reveal-5 mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <Link
                  to="/waitlist"
                  className="inline-flex items-center justify-center gap-2 bg-[#c96e32] px-7 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-[#ad5926] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#173b35] shadow-lg shadow-[#c96e32]/30"
                >
                  Join Early Access Waitlist{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/hostels"
                  className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur px-6 py-3.5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/25 border border-white/20"
                >
                  Browse Hostels
                </Link>
              </div>
              <p className="unihostel-hero-reveal unihostel-hero-reveal-6 mt-9 text-xs font-semibold tracking-[0.02em] text-white/75 sm:text-sm">
                Verified listings{" "}
                <span className="mx-1.5 text-[#f6deb1]">·</span> Apply first{" "}
                <span className="mx-1.5 text-[#f6deb1]">·</span> Pay after
                approval
              </p>
            </div>
          </div>
          <div
            className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 gap-2 lg:flex"
            aria-hidden="true"
          >
            <span className="h-2 w-2 rounded-full bg-white" />
            <span className="h-2 w-2 rounded-full bg-white/55" />
            <span className="h-2 w-2 rounded-full bg-white/55" />
          </div>
        </section>

        <section
          data-motion-section
          className="unihostel-decision-motion bg-[#e6eadf] px-6 py-16 sm:px-10 sm:py-24 lg:px-16"
        >
          <div className="unihostel-decision-frame mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div className="unihostel-decision-copy max-w-lg">
              <div
                className="unihostel-decision-mark h-1 w-12 bg-[#c96e32]"
                aria-hidden="true"
              />
              <h2 className="mt-6 text-4xl font-black leading-[0.98] tracking-[-0.04em] text-[#173b35] sm:text-5xl">
                Know the room before you commit.
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-[#526960] sm:text-lg sm:leading-8">
                A hostel decision affects your semester. UniHostel keeps the
                information that matters together, before you send an
                application.
              </p>
              <Link
                to="/hostels"
                className="unihostel-decision-link mt-8 inline-flex items-center gap-2 border-b-2 border-[#c96e32] pb-1.5 text-sm font-bold text-[#173b35] transition-colors duration-200 hover:border-[#173b35] hover:text-[#c96e32] focus:outline-none focus:ring-2 focus:ring-[#173b35] focus:ring-offset-4 focus:ring-offset-[#e6eadf]"
              >
                Browse verified hostels{" "}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="unihostel-decision-list border-t border-[#173b35]/25">
              {decisionPoints.map(({ title, text, icon: Icon }) => (
                <article
                  key={title}
                  className="unihostel-decision-point group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-4 border-b border-[#173b35]/20 py-6 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-6 sm:py-7"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173b35] text-[#f6deb1] transition-transform duration-200 group-hover:-translate-y-0.5 sm:h-12 sm:w-12">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="max-w-xl">
                    <h3 className="text-lg font-bold tracking-[-0.02em] text-[#173b35] sm:text-xl">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#526960] sm:text-base sm:leading-7">
                      {text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          data-motion-section
          className="unihostel-process-motion bg-[#173b35] px-6 py-16 text-white sm:px-10 sm:py-24 lg:px-16"
        >
          <div className="unihostel-process-frame mx-auto max-w-7xl">
            <div className="unihostel-process-intro grid gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-20">
              <h2 className="max-w-md text-4xl font-black leading-[0.98] tracking-[-0.04em] sm:text-5xl">
                How UniHostel works, from search to access.
              </h2>
              <p className="max-w-xl text-base leading-7 text-white/75 sm:text-lg sm:leading-8">
                Each stage stays visible. You know what to do now, what your
                hostel manager needs to do next, and when payment becomes due.
              </p>
            </div>

            <div className="unihostel-process-track relative mt-14 border-t border-white/20 lg:mt-20">
              <span className="unihostel-process-signal" aria-hidden="true" />
              <div
                className="absolute bottom-0 left-0 top-0 hidden w-px bg-white/20 sm:block lg:hidden"
                aria-hidden="true"
              />
              <div className="grid gap-0 sm:pl-10 lg:grid-cols-4 lg:pl-0">
                {steps.map(({ number, title, text }) => (
                  <article
                    key={number}
                    className="group relative grid grid-cols-[1.5rem_minmax(0,1fr)] gap-3 border-b border-white/20 py-7 last:border-b-0 sm:block lg:border-b-0 lg:border-r lg:border-white/20 lg:px-7 lg:py-0 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
                  >
                    <span className="flex h-6 w-6 items-center justify-center bg-[#c96e32] text-[10px] font-black text-white sm:absolute sm:-left-[3.15rem] sm:top-6 lg:-left-0 lg:-top-3 lg:h-7 lg:w-7">
                      {number}
                    </span>
                    <div className="min-w-0 lg:pt-11">
                      <h3 className="text-xl font-bold tracking-[-0.025em] text-white sm:text-2xl">
                        {title}
                      </h3>
                      <p className="mt-3 max-w-xs text-sm leading-6 text-white/70 sm:text-base sm:leading-7">
                        {text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          data-motion-section
          data-motion-threshold="0.55"
          className="unihostel-role-motion bg-[#f8f6f0] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="unihostel-role-frame mx-auto grid max-w-6xl items-stretch overflow-hidden rounded-[2rem] bg-[#173b35] lg:grid-cols-2">
            <div className="unihostel-role-student p-8 text-white sm:p-12 lg:p-14">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f6deb1]">
                For students
              </p>
              <h2 className="mt-3 text-4xl font-black uppercase leading-[1.02] tracking-[-0.04em] sm:text-5xl">
                Choose a place with fewer unknowns.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/80">
                Keep hostel search, applications, payment status, and final
                access details in one clear student journey.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-white/90">
                {[
                  "Browse available hostel rooms",
                  "Apply before you pay",
                  "Track every approval stage",
                ].map((point) => (
                  <li key={point} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 text-[#f6deb1]" />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/student-register"
                className="mt-9 inline-flex items-center gap-2 border border-white/50 bg-white px-5 py-3 text-sm font-bold text-[#173b35] transition-colors hover:bg-[#f8f6f0]"
              >
                Start as a student <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="unihostel-role-manager relative min-h-[350px]">
              <img
                src="https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=85"
                alt="Comfortable shared student living space"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[#173b35]/15" />
              <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-white/92 p-5 text-[#173b35] shadow-xl backdrop-blur-sm sm:left-8 sm:right-8">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c96e32]">
                  For managers
                </p>
                <p className="mt-2 text-lg font-black">
                  Keep listings, applications, occupancy, and approvals
                  together.
                </p>
                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold underline decoration-[#c96e32] decoration-2 underline-offset-4"
                >
                  List your hostel <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="faq"
          data-motion-section
          className="unihostel-faq-motion bg-[#f8f6f0] px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
        >
          <div className="unihostel-faq-frame mx-auto max-w-4xl">
            <div className="unihostel-faq-heading text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c96e32]">
                Questions, answered
              </p>
              <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.04em] text-[#173b35] sm:text-5xl">
                Everything should feel clear.
              </h2>
            </div>
            <div className="unihostel-faq-list mt-10 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <article
                    key={faq.question}
                    className={`unihostel-faq-item overflow-hidden rounded-2xl border border-[#deddd4] bg-white ${isOpen ? "is-open" : ""}`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      className="unihostel-faq-trigger flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7"
                    >
                      <span className="font-bold text-[#173b35]">
                        {faq.question}
                      </span>
                      <span className="unihostel-faq-toggle flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6eadf] text-[#173b35]">
                        <ChevronDown
                          className="unihostel-faq-chevron h-4 w-4"
                          aria-hidden="true"
                        />
                      </span>
                    </button>
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-label={faq.question}
                      className={`unihostel-faq-answer ${isOpen ? "is-open" : ""}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div className="unihostel-faq-answer-content border-t border-[#173b35]/15 px-5 py-5 sm:px-7">
                          <span
                            className="unihostel-faq-answer-rule"
                            aria-hidden="true"
                          />
                          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#526960]">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section
          data-motion-section
          className="unihostel-cta-motion border-t border-[#173b35]/15 bg-[#e6eadf] px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="unihostel-cta-frame mx-auto max-w-2xl text-[#173b35]">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#c96e32]">
              Ready when you are
            </p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[-0.04em] sm:text-5xl">
              Find a room you can move toward with confidence.
            </h2>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/hostels"
                className="inline-flex items-center justify-center gap-2 bg-[#c96e32] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#ad5926] focus:outline-none focus:ring-2 focus:ring-[#173b35] focus:ring-offset-3 focus:ring-offset-[#e6eadf]"
              >
                Browse hostels <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center border border-[#173b35]/50 px-6 py-3.5 text-sm font-bold text-[#173b35] transition-colors hover:border-[#173b35] hover:bg-[#173b35] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#173b35] focus:ring-offset-3 focus:ring-offset-[#e6eadf]"
              >
                I manage a hostel
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Landing;
