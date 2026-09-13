import {
  CreditCard,
  Database,
  Eye,
  FileText,
  Lock,
  Mail,
  Shield,
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
      title="Your information deserves care."
      description="This policy explains what UniHostel collects, why we use it, how we protect it, and rights available when you use platform."
      meta={`Effective date and last updated: ${currentDate}`}
    >
      <div className="info-article">
        <InfoSection title="What we collect." icon={Database}>
          <div className="info-grid info-grid--two">
            <div className="info-panel">
              <h3>Profile and account data</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Name, email address, phone number, and profile details",
                    "Manager verification documents where required",
                    "Account type, application history, approval records, and dashboard activity",
                    "Login timestamps, IP addresses, and device information",
                  ]}
                />
              </div>
            </div>
            <div className="info-panel">
              <h3>Listing and payment data</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Hostel details, room capacity, pricing, and uploaded images",
                    "Transaction references, payment status, amount paid, and settlement status",
                    "We do not store card or mobile money details; payment providers such as Paystack process payments",
                  ]}
                />
              </div>
            </div>
          </div>
        </InfoSection>
        <InfoSection title="How information is used." icon={FileText}>
          <InfoList
            items={[
              "Create and manage accounts",
              "Process applications, approvals, payments, and settlements",
              "Generate platform reports and analytics",
              "Prevent fraud and misuse",
              "Communicate important updates and provide support",
              "Improve platform functionality",
            ]}
          />
        </InfoSection>
        <InfoSection title="Access and sharing." icon={Users}>
          <div className="info-grid info-grid--two">
            <div>
              <h3>When we share data</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Between students and managers for application-related activity",
                    "With payment providers for transaction processing",
                    "With service providers supporting platform operations",
                    "With authorities where law requires it",
                  ]}
                />
              </div>
            </div>
            <div className="info-callout">
              <h3>Clear boundary</h3>
              <p className="mt-3">
                UniHostel does not sell or rent personal data to third parties.
                Access is role-based: students see their own activity, managers
                see data related to their hostels, and admins use wider access
                for moderation and oversight.
              </p>
            </div>
          </div>
        </InfoSection>
        <InfoSection title="Payments and security." icon={Lock}>
          <InfoList
            items={[
              "Financial data is displayed according to role",
              "Managers see hostel earnings; Admin sees platform-wide financial data",
              "We use encrypted storage, secure authentication, role-based access control, and audit logs for sensitive actions",
              "No system is 100% secure; users share data at their own risk",
            ]}
          />
        </InfoSection>
        <InfoSection title="Retention and your rights." icon={Eye}>
          <div className="info-grid info-grid--two">
            <div>
              <h3>Retention</h3>
              <p className="mt-3">
                Data is kept while account remains active, where legal or audit
                needs require it, or to resolve disputes and enforce agreements.
              </p>
            </div>
            <div>
              <h3>Your choices</h3>
              <div className="mt-4">
                <InfoList
                  items={[
                    "Access personal data",
                    "Correct inaccurate data",
                    "Request account deletion where legal obligations permit",
                    "Withdraw consent or object to certain processing",
                  ]}
                />
              </div>
            </div>
          </div>
        </InfoSection>
        <InfoSection title="Cookies, changes, and contact." icon={CreditCard}>
          <p>
            Cookies may maintain login sessions, improve experience, and analyze
            platform use. Browser settings can control cookie preferences. We
            may update this policy and communicate changes through platform.
          </p>
          <div className="info-callout info-callout--dark mt-8">
            <Mail className="h-7 w-7 text-[#f6deb1]" />
            <h3 className="mt-5">Questions about privacy?</h3>
            <p className="mt-3">
              Contact support at{" "}
              <a
                className="text-[#f6deb1] underline underline-offset-4"
                href="mailto:support@example.com"
              >
                support@example.com
              </a>
              . Jurisdiction: Ghana.
            </p>
          </div>
        </InfoSection>
      </div>
    </InformationPage>
  );
};

export default Privacy;
