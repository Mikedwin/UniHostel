import { Building2, GraduationCap, Scale, Shield, Users } from "lucide-react";
import InformationPage, {
  InfoList,
  InfoSection,
} from "../components/InformationPage";

const RuleGroup = ({ title, items, children }) => (
  <div className="info-panel">
    <h3>{title}</h3>
    {children && <p className="mt-3">{children}</p>}
    <div className="mt-4">
      <InfoList items={items} />
    </div>
  </div>
);

const Terms = () => (
  <InformationPage
    icon={Scale}
    title="Terms, made clear."
    description="These terms explain how UniHostel works for platform administrators, hostel managers, and students. By using UniHostel, you agree to them."
    meta={`Last updated: ${new Date().toLocaleDateString()}`}
  >
    <div className="info-article">
      <InfoSection title="Platform administration." icon={Shield}>
        <p className="info-role-label">Platform owner and system overseer</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Role and authority"
            items={[
              "Admin controls the platform and has full system privileges",
              "Admin oversees students, managers, listings, applications, payments, and analytics",
            ]}
          />
          <RuleGroup
            title="System control rights"
            items={[
              "Approve or reject manager registrations",
              "Suspend, ban, or disable user accounts",
              "Investigate disputes, fraud, or suspicious activity",
              "Edit or remove listings that violate platform rules",
            ]}
          />
          <RuleGroup
            title="Payments and data"
            items={[
              "Commission is deducted during Paystack payment",
              "Settlement may take 1–3 business days",
              "Admin may access transactions, earnings, and platform analytics",
              "Reports may be exported for record keeping",
            ]}
          />
          <RuleGroup
            title="Limits and updates"
            items={[
              "Platform facilitates bookings; it does not own or manage hostels",
              "Platform is not liable for living conditions, disputes, or property loss",
              "Platform rules, commissions, workflows, and terms may change",
            ]}
          />
        </div>
      </InfoSection>
      <InfoSection title="Hostel managers." icon={Building2}>
        <p className="info-role-label">Hostel owners and operators</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Registration and listings"
            items={[
              "Provide accurate, truthful information",
              "Receive Admin approval before listing hostels",
              "Keep room price, capacity, facilities, availability, and occupancy accurate",
              "Do not create misleading listings",
            ]}
          />
          <RuleGroup
            title="Applications and rooms"
            items={[
              "Occupancy follows approved applications, not total applications",
              "Review applications fairly and responsibly",
              "First approval allows payment; final approval confirms allocation",
              "Do not manipulate occupancy data or bypass approval flow",
            ]}
          />
          <RuleGroup
            title="Payments and access"
            items={[
              "Manager receives hostel fee excluding Admin commission",
              "Payments use Paystack subaccounts",
              "Maintain correct Paystack subaccount details",
              "Verify valid student access codes on arrival",
            ]}
          />
          <RuleGroup
            title="Responsibility"
            items={[
              "Manager is responsible for hostel conditions, room availability, and student welfare",
              "Unfair discrimination, outside-platform payment, or workflow bypass may lead to suspension or permanent ban",
              "Platform is not liable for manager-related issues",
            ]}
          />
        </div>
      </InfoSection>
      <InfoSection title="Students and applicants." icon={GraduationCap}>
        <p className="info-role-label">Applicants and occupants</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Accounts and applications"
            items={[
              "Provide accurate personal information",
              "Use one account only",
              "Do not share accounts or impersonate another person",
              "Applying does not guarantee placement",
            ]}
          />
          <RuleGroup
            title="When a room is secured"
            items={[
              "Manager approval",
              "Successful payment",
              "Final confirmation",
              "A room remains open until approved students fill capacity",
            ]}
          />
          <RuleGroup
            title="Payments and access"
            items={[
              "Payment includes hostel fee and Admin commission",
              "Payments are processed via Paystack",
              "Do not pay managers outside platform",
              "Failed or incomplete payment does not reserve a room",
              "Do not share access codes",
            ]}
          />
          <RuleGroup
            title="Conduct and liability"
            items={[
              "Do not provide false details, attempt fraud, harass others, or share access codes",
              "Refunds depend on manager decision, platform rules, and Paystack policies",
              "Platform does not guarantee hostel quality; students remain responsible for personal belongings",
            ]}
          />
        </div>
      </InfoSection>
      <InfoSection title="Governing law." icon={Users}>
        <div className="info-callout info-callout--dark">
          <p>
            These terms are governed by laws of Ghana. Any dispute is resolved
            under Ghanaian jurisdiction.
          </p>
          <p className="mt-4">
            By using UniHostel, you acknowledge that you have read, understood,
            and agree to these Terms & Conditions. If you do not agree,
            discontinue use of platform.
          </p>
        </div>
      </InfoSection>
    </div>
  </InformationPage>
);

export default Terms;
