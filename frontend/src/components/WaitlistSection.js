import React, { useState } from 'react';
import axios from 'axios';
import { CheckCircle2, ArrowRight, Shield, Bell, Sparkles, Lock, Building2, Clock } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

const WaitlistSection = ({ standalone = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMsg('Please enter your phone or WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.WAITLIST_JOIN, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        source: standalone ? 'waitlist_page' : 'landing_page'
      });

      setSuccessData(response.data);
    } catch (err) {
      console.error('Waitlist submit error:', err);
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="waitlist"
      className={`bg-[#f8f6f0] ${standalone ? 'py-10 sm:py-16' : 'py-12 sm:py-20'}`}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#173b35] p-8 sm:p-12 lg:p-16 text-white shadow-[0_20px_50px_rgba(23,59,53,0.16)]">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#f6deb1]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#c96e32]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            {/* Left Column: Heading & Value Proposition */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#f6deb1] backdrop-blur-sm">
                <Clock className="h-3.5 w-3.5 text-[#f6deb1]" />
                Priority Access
              </span>

              <h1 className="mt-5 text-3xl font-black leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl text-white">
                Be first in line for <span className="text-[#f6deb1]">verified hostel</span> spaces.
              </h1>

              <p className="mt-5 max-w-lg text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                Skip the scramble. Join verified students who receive first notification, early booking windows, and instant access codes before public listing releases.
              </p>

              {/* Benefit Points */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-white/15">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f6deb1]">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">100% Verified Only</p>
                    <p className="text-xs text-white/70 mt-0.5">Inspected hostel rooms in Accra</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#f6deb1]">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Instant Alerts</p>
                    <p className="text-xs text-white/70 mt-0.5">Direct SMS & WhatsApp notification</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Form Card */}
            <div>
              {successData ? (
                <div className="rounded-[2rem] border border-[#deddd4]/80 bg-white p-8 sm:p-10 text-center text-[#173b35] shadow-xl">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e6eadf] text-[#173b35]">
                    <CheckCircle2 className="h-9 w-9 text-[#173b35]" />
                  </div>

                  <h3 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight text-[#173b35]">
                    {successData.alreadyJoined ? "You're Already On The List!" : "You're In! 🎉"}
                  </h3>

                  <p className="mt-3 text-sm sm:text-base text-[#526960] leading-relaxed">
                    {successData.message || "We have recorded your spot. You'll receive priority booking instructions via WhatsApp and email."}
                  </p>

                  {successData.position && (
                    <div className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-[#e6eadf] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#173b35]">
                      <Sparkles className="h-4 w-4 text-[#c96e32]" />
                      Priority Queue #{successData.position}
                    </div>
                  )}

                  <div className="mt-8 pt-6 border-t border-[#deddd4] text-xs text-[#526960] flex items-center justify-center gap-2">
                    <Lock className="h-3.5 w-3.5 text-[#173b35]" />
                    Your contact information is strictly protected and never shared.
                  </div>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-[#deddd4]/80 bg-white p-6 sm:p-9 text-[#173b35] shadow-xl">
                  <div className="mb-6">
                    <h2 className="text-xl sm:text-2xl font-black tracking-[-0.02em] text-[#173b35]">
                      Reserve Your Spot
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-[#526960]">
                      Fill out your details to get early booking privileges.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs font-medium text-red-700 text-center">
                      {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#526960] mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Michael Edwin"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#173b35] placeholder:text-slate-400 focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20 shadow-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#526960] mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="student@example.com"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#173b35] placeholder:text-slate-400 focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20 shadow-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#526960] mb-1.5">
                        Phone / WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 024 123 4567"
                        required
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#173b35] placeholder:text-slate-400 focus:border-[#173b35] focus:outline-none focus:ring-2 focus:ring-[#173b35]/20 shadow-sm transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#c96e32] px-6 py-4 text-sm font-bold text-white shadow-lg shadow-[#c96e32]/25 transition-all hover:bg-[#ad5926] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Securing Your Spot...</span>
                        </div>
                      ) : (
                        <>
                          <span>Join Priority Waitlist</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 pt-4 border-t border-[#deddd4] flex items-center justify-center gap-1.5 text-xs text-[#526960]">
                    <Lock className="h-3 w-3 text-[#173b35]" />
                    <span>Zero spam. Direct hostel notification only.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
