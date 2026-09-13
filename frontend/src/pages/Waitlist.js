import React, { useEffect } from 'react';
import Footer from '../components/Footer';
import WaitlistSection from '../components/WaitlistSection';

const Waitlist = () => {
  useEffect(() => {
    document.title = 'Join Early Access Waitlist | UniHostel';
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <WaitlistSection standalone={true} />
      </main>
      <Footer />
    </div>
  );
};

export default Waitlist;
