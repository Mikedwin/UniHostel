import React, { useState } from 'react';
import axios from 'axios';
import {
  ArrowRight,
  CheckCircle2,
  Home,
  LockKeyhole,
  MapPin,
  Users,
} from 'lucide-react';
import API_ENDPOINTS from '../config/api';

const WaitlistSection = ({ standalone = false }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', preferredHostel: '', managerPhone: '' });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg('');
    if (!formData.name.trim()) return setErrorMsg('Please enter your full name.');
    if (!formData.email.trim()) return setErrorMsg('Please enter your email address.');
    if (!formData.phone.trim()) return setErrorMsg('Please enter your phone or WhatsApp number.');

    setLoading(true);
    try {
      const response = await axios.post(API_ENDPOINTS.WAITLIST_JOIN, {
        name: formData.name.trim(), email: formData.email.trim(), phone: formData.phone.trim(),
        preferredHostel: formData.preferredHostel.trim(), managerPhone: formData.managerPhone.trim(),
        source: standalone ? 'waitlist_page' : 'landing_page',
      });
      setSuccessData(response.data);
    } catch (error) {
      console.error('Waitlist submit error:', error);
      setErrorMsg(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (label, name, type, placeholder, optional = false) => (
    <label className="waitlist-field" htmlFor={`waitlist-${name}`}>
      <span>{label}{optional && <em>Optional</em>}</span>
      <input id={`waitlist-${name}`} name={name} type={type} value={formData[name]} onChange={handleChange} placeholder={placeholder} required={!optional} />
    </label>
  );

  return (
    <section id="waitlist" className={`waitlist-section ${standalone ? 'waitlist-section--page' : ''}`}>
      <div className="waitlist-shell">
        <div className="waitlist-introduction">
          <span className="waitlist-index" aria-hidden="true">01</span>
          <h1>Start with the place you have in mind.</h1>
          <p>Tell UniHostel where you are looking. We will keep your details on file as verified rooms and useful next steps become available.</p>
          <div className="waitlist-notes">
            <div><Home aria-hidden="true" /><span>Made for student housing decisions across Ghana.</span></div>
            <div><MapPin aria-hidden="true" /><span>A preferred hostel is helpful, but never required.</span></div>
          </div>
        </div>

        <div className="waitlist-form-panel">
          {successData ? (
            <div className="waitlist-success" role="status">
              <CheckCircle2 aria-hidden="true" />
              <p className="waitlist-success-kicker">Request received</p>
              <h2>{successData.alreadyJoined ? 'You are already on the list.' : 'You are on the list.'}</h2>
              <p>{successData.message || 'We have saved your details and will be in touch when there is a relevant next step.'}</p>
              {successData.position && <div className="waitlist-position"><Users aria-hidden="true" /><span>Your place in line</span><strong>#{successData.position}</strong></div>}
              <small><LockKeyhole aria-hidden="true" /> Your details are used only for your UniHostel request.</small>
            </div>
          ) : (
            <>
              <div className="waitlist-form-heading"><p>Join the waitlist</p><h2>Tell us a little about your search.</h2></div>
              {errorMsg && <p className="waitlist-form-error" role="alert">{errorMsg}</p>}
              <form onSubmit={handleSubmit}>
                {field('Full name', 'name', 'text', 'e.g. Nana Ama Mensah')}
                {field('Email address', 'email', 'email', 'you@example.com')}
                {field('Phone / WhatsApp number', 'phone', 'tel', 'e.g. 024 123 4567')}
                {field('Preferred hostel', 'preferredHostel', 'text', 'If you have one in mind', true)}
                {field("Hostel manager's number", 'managerPhone', 'tel', 'If you already have it', true)}
                <button type="submit" className="waitlist-submit" disabled={loading}>
                  {loading ? <><i className="unihostel-button-loader" aria-hidden="true" /> Saving your request</> : <>Join the waitlist <ArrowRight aria-hidden="true" /></>}
                </button>
              </form>
              <p className="waitlist-disclosure"><LockKeyhole aria-hidden="true" /> Your details stay with UniHostel. No marketing noise.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
