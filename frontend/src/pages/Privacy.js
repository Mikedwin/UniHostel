import { Link } from "react-router-dom";
import {
  CreditCard,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import InformationPage, {
  InfoList,
  InfoSection,
} from "../components/InformationPage";

const Privacy = () => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <InformationPage
      icon={Shield}
      title="Privacy and Data Protection."
      description="UniHostel values your privacy. This policy explains what information we collect, how we process it, and your rights under the Data Protection Act, 2012 (Act 843) of Ghana."
      meta={`Effective date and last updated: ${currentDate}`}
    >
      <div className="info-article">
        <InfoSection title="1. Statutory Compliance (Ghana Act 843)." icon={Shield}>
          <div className="info-callout">
            <h3 className="text-base font-bold text-gray-900">Compliance with the Data Protection Act, 2012 (Act 843)</h3>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              UniHostel processes all personal data strictly in compliance with the principles of data protection set out under the Data Protection Act, 2012 (Act 843) of the Republic of Ghana. We ensure that data is processed lawfully, transparently, securely, and solely for specified educational housing and verification purposes.
            </p>
          </div>
        </InfoSection>

        <InfoSection title="2. Information We Collect." icon={Database}>
          <div className="info-grid info-grid--two">
            <div className="info-panel">
              <h3>Profile and Account Data</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Full name, email address, phone / WhatsApp number, and student details",
                    "Manager verification documents, hostel proof of ownership, or business registration",
                    "Account credentials, login timestamps, IP addresses, and device telemetry",
                    "Early Access Waitlist data (name, email, phone, preferred hostel, manager contact)",
                  ]}
                />
              </div>
            </div>
            <div className="info-panel">
              <h3>Listing and Transaction Data</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Hostel listings, room capacity, photos, amenities, and pricing",
                    "Transaction references, payment statuses, and settlement confirmations",
                    "We do NOT store credit card numbers, CVVs, or MoMo PINs; payments are processed securely via Paystack",
                    "Application records, student-manager correspondence, and generated access codes",
                  ]}
                />
              </div>
            </div>
          </div>
        </InfoSection>

        <InfoSection title="3. How We Use Your Information." icon={FileText}>
          <InfoList
            items={[
              "Facilitate hostel search, applications, approvals, payment processing, and access code issuance",
              "Notify waitlist applicants of early access and priority room availability",
              "Verify manager identities to protect students against fraud, fake listings, and impersonation",
              "Maintain platform security, investigate disputes, and monitor system performance",
              "Comply with legal, regulatory, tax, and accounting requirements under Ghanaian law",
            ]}
          />
        </InfoSection>

        <InfoSection title="4. Data Sharing & Third-Party Processors." icon={Users}>
          <div className="info-grid info-grid--two">
            <div>
              <h3>Authorized Processors</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Hostel Managers: Receive applicant contact details solely to evaluate room bookings",
                    "Payment Infrastructure (Paystack): For secure Mobile Money and card processing",
                    "Media Storage (Cloudinary): For securely serving uploaded hostel photos",
                    "Security & Bot Prevention (Cloudflare Turnstile): Analyzes browser signals to prevent automated spam without tracking users",
                    "Law Enforcement: Only when strictly required by a court order or applicable Ghanaian law",
                  ]}
                />
              </div>
            </div>
            <div className="info-callout">
              <h3>Zero Data Selling</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                UniHostel does NOT sell, rent, or trade your personal data to third-party advertisers. Access is strictly role-based: students access their own bookings, managers access their listings and applicants, and administrators access data necessary for system oversight.
              </p>
            </div>
          </div>
        </InfoSection>

        <InfoSection title="5. Data Retention & Security Safeguards." icon={Lock}>
          <InfoList
            items={[
              "Data Encryption: All sensitive communications use HTTPS/TLS and passwords are salted and hashed with bcrypt",
              "Retention Periods: Account data is retained while active. Financial records are retained for statutory accounting periods (up to 6 years) as required by Ghanaian law",
              "Soft Deletion & Anonymization: Deleted accounts are deactivated and personal identifiers removed where legal requirements allow",
              "Security Notice: While we employ industry-standard defenses, no transmission over the internet is completely infallible; users share data at their own risk",
            ]}
          />
        </InfoSection>

        <InfoSection title="6. Your Rights Under Act 843." icon={Eye}>
          <div className="info-grid info-grid--two">
            <div>
              <h3>Data Subject Rights</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-600">
                Under the Data Protection Act, 2012 (Act 843), you have the legal right to:
              </p>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Request access to personal data held about you",
                    "Request correction of inaccurate or incomplete records",
                    "Request deletion or restriction of your personal data",
                    "Object to automated processing or withdraw consent",
                  ]}
                />
              </div>
            </div>
            <div className="info-panel info-panel--warm">
              <h3>Exercising Your Rights</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-700">
                To request data deletion, access, or correction, contact our Data Protection Officer through our official support desk or email. We will process your request within statutory timeframes.
              </p>
            </div>
          </div>
        </InfoSection>

        <InfoSection title="7. Contact & Privacy Inquiries." icon={CreditCard}>
          <div className="info-callout info-callout--dark mt-4">
            <ShieldCheck className="h-7 w-7 text-[#f6deb1]" />
            <h3 className="mt-5 text-lg font-bold text-[#f6deb1]">Data Protection & Privacy Desk</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              For any questions, concerns, or data rights requests under Act 843, please reach out via our official Customer Support Desk:
            </p>
            <div className="mt-5">
              <Link
                to="/support"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-[#f6deb1]"
              >
                <ShieldCheck className="h-4 w-4 text-[#f6deb1]" aria-hidden="true" />
                Go to Customer Support &amp; Data Protection Desk &rarr;
              </Link>
            </div>
          </div>
        </InfoSection>
      </div>
    </InformationPage>
  );
};

export default Privacy;
