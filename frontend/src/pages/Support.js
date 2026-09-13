import {
  AlertTriangle,
  Building2,
  Clock,
  GraduationCap,
  HelpCircle,
  Mail,
  Phone,
  Shield,
} from "lucide-react";
import InformationPage, {
  InfoList,
  InfoSection,
} from "../components/InformationPage";

const Support = () => (
  <InformationPage
    icon={HelpCircle}
    title="Help, without the runaround."
    description="Get guidance for room search, applications, payments, listings, and platform access. We keep support connected to the way UniHostel actually works."
    meta="Support centre · Accra, Ghana"
  >
    <InfoSection title="Start with your role." icon={HelpCircle}>
      <div className="info-grid info-grid--three">
        <article className="info-panel">
          <GraduationCap className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>Students</h3>
          <div className="mt-5">
            <InfoList
              items={[
                "Account access and profile help",
                "Hostel search and room details",
                "Applications, approval status, and receipts",
                "Payments, access codes, refunds, and disputes",
              ]}
            />
          </div>
        </article>
        <article className="info-panel">
          <Building2 className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>Managers</h3>
          <div className="mt-5">
            <InfoList
              items={[
                "Account verification",
                "Listings, room capacity, and occupancy",
                "Application review and payment settlements",
                "Dashboard issues and technical errors",
              ]}
            />
          </div>
        </article>
        <article className="info-panel">
          <Shield className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>Administrators</h3>
          <div className="mt-5">
            <InfoList
              items={[
                "User verification and moderation",
                "Disputes and application intervention",
                "Payment and commission tracking",
                "Security and platform monitoring",
              ]}
            />
          </div>
        </article>
      </div>
    </InfoSection>
    <InfoSection title="When something needs attention." icon={AlertTriangle}>
      <div className="info-grid info-grid--two">
        <div className="info-callout">
          <h3>Report an issue</h3>
          <p className="mt-3">
            Include screenshots or documents where helpful, then contact support
            through WhatsApp at +233 50 3847 786.
          </p>
          <div className="mt-5">
            <InfoList
              items={[
                "Tell us what happened",
                "Share supporting screenshots or documents",
                "Track your request as it is reviewed",
              ]}
            />
          </div>
        </div>
        <div className="info-panel info-panel--warm">
          <h3>Safety comes first</h3>
          <p className="mt-3">
            Report suspicious listings, fraudulent activity, misleading
            information, harassment, or abuse immediately. Safety and trust are
            not optional.
          </p>
        </div>
      </div>
    </InfoSection>
    <InfoSection title="Response expectations." icon={Clock}>
      <div className="info-grid info-grid--three">
        <div className="info-panel">
          <span className="info-role-label">Critical</span>
          <h3 className="mt-3">Payments and access</h3>
          <p className="mt-3">Within 24 hours.</p>
        </div>
        <div className="info-panel">
          <span className="info-role-label">General</span>
          <h3 className="mt-3">Questions and guidance</h3>
          <p className="mt-3">24–48 hours.</p>
        </div>
        <div className="info-panel">
          <span className="info-role-label">Features</span>
          <h3 className="mt-3">Product requests</h3>
          <p className="mt-3">Reviewed periodically.</p>
        </div>
      </div>
    </InfoSection>
    <InfoSection title="Talk to a person." icon={Mail}>
      <div className="info-grid info-grid--two">
        <a
          className="info-panel no-underline"
          href="mailto:support@example.com"
        >
          <Mail className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>Email support</h3>
          <p className="mt-3 text-[#c96e32]">support@example.com</p>
        </a>
        <a className="info-panel no-underline" href="tel:+233503847786">
          <Phone className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>Phone support</h3>
          <p className="mt-3 text-[#c96e32]">+233 50 3847 786</p>
          <p className="mt-2 text-sm">
            Monday – Friday, 9:00 AM – 5:00 PM (GMT)
          </p>
        </a>
      </div>
    </InfoSection>
  </InformationPage>
);

export default Support;
