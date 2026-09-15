import { AlertTriangle, Building2, FileCheck, GraduationCap, Lock, Scale, Shield, Users } from "lucide-react";
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
    title="Terms and Conditions."
    description="These legally binding terms govern your access to and use of UniHostel as a platform administrator, hostel manager, or student. By accessing or using UniHostel, you explicitly agree to these terms."
    meta={`Effective date & last updated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
  >
    <div className="info-article">
      <InfoSection title="1. Marketplace Nature & Safe Harbor." icon={Shield}>
        <p className="info-role-label">Technology platform intermediary notice</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Independent Marketplace"
            items={[
              "UniHostel is strictly an online technology intermediary and marketplace connecting students with independent hostel managers",
              "UniHostel does NOT own, operate, manage, lease, staff, inspect, or insure physical hostel premises",
              "UniHostel is NOT a landlord, lessor, subletter, estate agent, or real estate broker",
              "Any rental, occupancy, or boarding agreement is formed exclusively between the student tenant and the hostel owner/operator",
            ]}
          />
          <RuleGroup
            title="Platform Administration Rights"
            items={[
              "Admin reserves full discretion to approve, reject, verify, or suspend any student or manager account",
              "Admin may investigate allegations of fraud, misconduct, misleading listings, or terms violations",
              "Admin may remove, unpublish, or flag listings that breach quality, safety, or legal standards",
              "Platform features, fee structures, and workflows may be updated with reasonable notice",
            ]}
          />
        </div>
      </InfoSection>

      <InfoSection title="2. Disclaimer of Warranties (AS-IS Platform)." icon={AlertTriangle}>
        <p className="info-role-label">Legal warranty exclusions</p>
        <div className="info-callout info-callout--dark mt-6">
          <h3 className="text-lg font-bold text-[#f6deb1]">Provided "AS-IS" and "AS-AVAILABLE"</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            To the maximum extent permitted by Ghanaian law, the UniHostel platform, applications, and listings are provided on an "AS-IS" and "AS-AVAILABLE" basis without warranties of any kind, whether express, implied, statutory, or otherwise.
          </p>
          <div className="mt-4">
            <InfoList
              items={[
                "No warranty regarding physical living conditions, water/power supply, sanitation, security, noise levels, or structural integrity of hostels",
                "No warranty regarding the moral character, background, or behavior of hostel managers, staff, roommates, or third parties",
                "Managers are solely responsible for verifying the accuracy of their room photos, amenities, pricing, and availability",
                "Students are strongly encouraged to inspect accommodations and ask questions prior to finalizing commitments",
              ]}
            />
          </div>
        </div>
      </InfoSection>

      <InfoSection title="3. Limitation of Liability & Damages Cap." icon={Lock}>
        <p className="info-role-label">Maximum liability ceiling</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Liability Cap"
            items={[
              "To the fullest extent permitted by law, UniHostel's total cumulative aggregate liability for all claims arising out of the platform or any booking shall not exceed the platform commission fee actually retained by UniHostel for that specific transaction, or GHS 500, whichever is less",
              "Under no circumstances shall UniHostel, its founders, directors, or employees be liable for indirect, incidental, special, punitive, or consequential damages",
            ]}
          />
          <RuleGroup
            title="Excluded Losses"
            items={[
              "Loss of personal property, theft, burglary, fire, or damage occurring on hostel grounds",
              "Personal injury, bodily harm, illness, or health hazards on hostel premises",
              "Academic disruption, lost tenancy opportunities, or emotional distress",
              "Disruptions caused by utility outages, internet downtime, or payment network failures",
            ]}
          />
        </div>
      </InfoSection>

      <InfoSection title="4. User Indemnification." icon={FileCheck}>
        <div className="info-callout">
          <h3 className="text-base font-bold text-gray-900">Agreement to Indemnify</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            You agree to defend, indemnify, and hold harmless UniHostel, its officers, directors, employees, contractors, and agents from and against any claims, liabilities, damages, losses, and legal expenses (including reasonable attorney fees) arising out of or in any way connected with:
          </p>
          <div className="mt-4">
            <InfoList
              items={[
                "Your breach of these Terms and Conditions or any applicable laws of Ghana",
                "Any dispute, conflict, damage to property, or tenancy disagreement between a student and a hostel manager",
                "Any false, misleading, or fraudulent information provided in your registration, listing, or application",
                "Your interaction with any hostel, manager, student, or payment provider",
              ]}
            />
          </div>
        </div>
      </InfoSection>

      <InfoSection title="5. Hostel Managers & Property Owners." icon={Building2}>
        <p className="info-role-label">Hostel management obligations</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Listings & Availability Accuracy"
            items={[
              "Provide accurate, truthful photos, room types, pricing, capacity, and facility details",
              "Maintain current capacity and mark rooms unavailable immediately when filled",
              "Do not accept payments outside the platform to bypass approval or commission flows",
              "Keep Paystack subaccount and payout details accurate and current",
            ]}
          />
          <RuleGroup
            title="Manager Legal Responsibilities"
            items={[
              "Manager is solely responsible for tenancy laws, student safety, room allocation, and premises maintenance",
              "Honor valid UniHostel access codes presented by verified students upon arrival",
              "Unfair discrimination, illegal evictions, or deceptive practices will result in permanent platform banning and potential legal reporting",
              "Hostel managers indemnify UniHostel against tenant claims relating to building conditions or double-bookings",
            ]}
          />
        </div>
      </InfoSection>

      <InfoSection title="6. Students & Applicants." icon={GraduationCap}>
        <p className="info-role-label">Student applicant terms</p>
        <div className="info-grid info-grid--two mt-6">
          <RuleGroup
            title="Applications & Room Booking"
            items={[
              "Submitting an application does not guarantee room placement until approved and paid",
              "Room reservations are confirmed ONLY upon successful payment and issuance of an official access code",
              "Do not transfer, sell, or share access codes or account credentials with third parties",
              "Maintain accurate contact details (email and phone/WhatsApp) for official communication",
            ]}
          />
          <RuleGroup
            title="Payments, Fees & Conduct"
            items={[
              "All payments are processed securely via Paystack and include the applicable platform service fee",
              "Platform service fees cover digital matching, security checks, and payment infrastructure and are non-refundable once allocation is issued",
              "Refunds of hostel fees follow the manager's stated policy and dispute mediation outcomes",
              "Any fraudulent activity, harassment, or abuse will result in immediate account termination",
            ]}
          />
        </div>
      </InfoSection>

      <InfoSection title="7. Dispute Resolution & Governing Law (Ghana)." icon={Users}>
        <div className="info-callout info-callout--dark">
          <h3 className="text-lg font-bold text-[#f6deb1]">Governing Law & Alternative Dispute Resolution (Act 798)</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of Ghana, including the Electronic Transactions Act, 2008 (Act 772).
          </p>
          <div className="mt-4">
            <InfoList
              items={[
                "Mandatory 30-day informal negotiation period: Parties must first contact UniHostel support to attempt good-faith informal dispute resolution",
                "Arbitration: Any unresolved dispute shall be referred to and finally resolved by arbitration in Accra, Ghana, under the Alternative Dispute Resolution Act, 2010 (Act 798)",
                "Class Action Waiver: You agree that any dispute resolution proceedings will be conducted solely on an individual basis and not in a class, consolidated, or representative action",
                "Severability: If any provision of these Terms is found invalid or unenforceable, the remaining provisions will continue in full force and effect",
              ]}
            />
          </div>
          <p className="mt-6 text-xs text-white/60">
            By using UniHostel, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, you must immediately discontinue use of the platform.
          </p>
        </div>
      </InfoSection>
    </div>
  </InformationPage>
);

export default Terms;
