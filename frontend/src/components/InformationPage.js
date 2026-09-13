import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowUpRight, Check } from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "./Footer";

export const InfoList = ({ items }) => (
  <ul className="info-list">
    {items.map((item) => (
      <li key={item}>
        <Check aria-hidden="true" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

export const InfoSection = ({
  title,
  icon: Icon,
  children,
  className = "",
}) => (
  <section data-info-motion className={`info-section ${className}`}>
    <div className="info-section-heading">
      {Icon && <Icon aria-hidden="true" />}
      <h2>{title}</h2>
    </div>
    <div className="info-section-body">{children}</div>
  </section>
);

const InformationPage = ({
  title,
  description,
  icon: Icon,
  meta,
  heroImage = "https://getrooms.co/wp-content/uploads/2022/10/Bani-hostel-5709.jpg",
  children,
}) => {
  const pageRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const targets = pageRef.current?.querySelectorAll("[data-info-motion]");
    if (!targets?.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle(
            "info-motion-visible",
            entry.intersectionRatio >= 0.16,
          );
        });
      },
      { threshold: [0, 0.16, 0.55] },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={pageRef}
      className="info-page min-h-screen bg-[#f8f6f0] text-[#173b35]"
    >
      <header
        data-info-motion
        className="info-page-hero relative isolate overflow-hidden bg-[#173b35] px-6 py-14 text-white sm:px-10 sm:py-20 lg:px-16 lg:py-24"
      >
        <img
          src={heroImage}
          alt="Student hostel in Accra, Ghana"
          className="info-page-hero-image absolute inset-0 h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="info-page-hero-overlay absolute inset-0"
        />
        <span aria-hidden="true" className="info-page-wordmark">
          UniHostel
        </span>
        <div className="relative mx-auto max-w-6xl">
          <Link to="/" className="info-page-back">
            <ArrowLeft aria-hidden="true" /> Back to home
          </Link>
          <div className="mt-14 max-w-3xl sm:mt-20">
            <div className="info-page-icon">
              <Icon aria-hidden="true" />
            </div>
            <h1 className="mt-7">{title}</h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              {description}
            </p>
            {meta && <div className="info-page-meta mt-8">{meta}</div>}
          </div>
        </div>
      </header>
      <main className="info-page-content px-6 py-16 sm:px-10 sm:py-24 lg:px-16">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export const InfoLink = ({ to, children }) => (
  <Link to={to} className="info-link">
    {children} <ArrowUpRight aria-hidden="true" />
  </Link>
);

export default InformationPage;
