import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, CheckCircle2, ArrowRight, Shield, Bell, Users, Lock } from 'lucide-react';
import API_ENDPOINTS from '../config/api';

const WaitlistSection = ({ standalone = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredHostel: '',
    managerPhone: ''
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
      setErrorMsg('Please enter your phone/WhatsApp number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.WAITLIST_JOIN, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        preferredHostel: formData.preferredHostel ? formData.preferredHostel.trim() : '',
        managerPhone: formData.managerPhone ? formData.managerPhone.trim() : '',
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
    <section id="waitlist" className={`relative overflow-hidden ${standalone ? 'py-16 md:py-24' : 'py-20 md:py-28'} bg-[#0d221e]`}>
      {/* ── Layered decorative background ── */}

      {/* Base gradient mesh */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0d221e] via-[#122e28] to-[#0a1c18]" />

      {/* Large teal aurora – top center */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-[#23817A]/15 blur-[140px]" />

      {/* Warm accent – bottom right */}
      <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-[#C96E32]/12 blur-[120px]" />

      {/* Secondary teal orb – left edge */}
      <div className="pointer-events-none absolute top-1/3 -left-24 h-64 w-64 rounded-full bg-[#23817A]/10 blur-[100px]" />

      {/* Gold accent – top right */}
      <div className="pointer-events-none absolute -top-16 right-1/4 h-48 w-48 rounded-full bg-[#F6DEB1]/8 blur-[90px]" />

      {/* Small floating accent – mid right */}
      <div className="pointer-events-none absolute top-1/2 right-[15%] h-32 w-32 rounded-full bg-[#C96E32]/10 blur-[70px] animate-pulse" style={{ animationDuration: '6s' }} />

      {/* Tiny teal spark – bottom left */}
      <div className="pointer-events-none absolute bottom-1/4 left-[10%] h-24 w-24 rounded-full bg-[#23817A]/15 blur-[60px] animate-pulse" style={{ animationDuration: '8s' }} />

      {/* Subtle dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle, #F6DEB1 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Diagonal accent lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(135deg, transparent, transparent 60px, #23817A 60px, #23817A 61px)',
        }}
      />

      {/* Faint repeating logo watermark across the entire screen */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'url(/logo-symbol-reverse.png)',
          backgroundSize: '140px 165px',
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Radial vignette for depth */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,#0a1a16_100%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Be the First to Secure Your <span className="text-[#F6DEB1]">Hostel</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg text-white/70">
            Join other verified students getting priority notifications, exclusive room reservations, and instant booking codes before public launch.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-xl">
          {successData ? (
            <div className="rounded-3xl border border-[#23817A]/40 bg-gradient-to-b from-[#173B35]/90 to-[#0e2722]/90 p-8 sm:p-10 text-center shadow-2xl backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#23817A]/20 border border-[#23817A]/40 text-[#F6DEB1]">
                <CheckCircle2 className="h-9 w-9 text-emerald-400" />
              </div>

              <h3 className="mt-5 text-2xl font-bold text-white">
                {successData.alreadyJoined ? "You're Already on the List!" : "You're on the Waitlist! 🎉"}
              </h3>

              <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                {successData.message}
              </p>

              {successData.position && (
                <div className="mt-6 inline-flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-5 py-3">
                  <Users className="h-5 w-5 text-[#C96E32]" />
                  <span className="text-xs uppercase font-medium text-white/60">Queue Status</span>
                  <span className="text-base font-bold text-[#F6DEB1]">Priority #{successData.position}</span>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-white/10 text-xs text-white/50 flex items-center justify-center gap-2">
                <Lock className="h-3.5 w-3.5" />
                We'll reach out to your WhatsApp & email with early access instructions.
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
              {errorMsg && (
                <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-200 text-center">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F6DEB1] mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Michael Edwin"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 focus:border-[#23817A] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#23817A]/40 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F6DEB1] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 focus:border-[#23817A] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#23817A]/40 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#F6DEB1] mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 024 123 4567"
                    required
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 focus:border-[#23817A] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#23817A]/40 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#F6DEB1]">
                      Preferred Hostel
                    </label>
                    <span className="text-[11px] font-normal text-white/50 lowercase tracking-normal">
                      (optional)
                    </span>
                  </div>
                  <input
                    type="text"
                    name="preferredHostel"
                    value={formData.preferredHostel}
                    onChange={handleChange}
                    placeholder="e.g. Evandy Hostel, Pentagon, TF (optional)"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 focus:border-[#23817A] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#23817A]/40 transition text-sm sm:text-base"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#F6DEB1]">
                      Hostel Manager's Number
                    </label>
                    <span className="text-[11px] font-normal text-white/50 lowercase tracking-normal">
                      (optional)
                    </span>
                  </div>
                  <input
                    type="tel"
                    name="managerPhone"
                    value={formData.managerPhone}
                    onChange={handleChange}
                    placeholder="e.g. 024 987 6543 (if known)"
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-white placeholder-white/40 focus:border-[#23817A] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#23817A]/40 transition text-sm sm:text-base"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#C96E32] to-[#df7f3e] hover:from-[#b86128] hover:to-[#cb7132] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[#C96E32]/30 transition transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Securing Your Spot...</span>
                    </div>
                  ) : (
                    <>
                      <span>Join Early Access Waitlist</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-white/50 border-t border-white/10 pt-4">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-[#23817A]" />
                  <span>100% Spam Free</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Bell className="h-3.5 w-3.5 text-[#23817A]" />
                  <span>Instant SMS/Email Alert</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#23817A]" />
                  <span>Free Priority Booking</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
