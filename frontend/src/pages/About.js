import {
  Building2,
  Eye,
  GraduationCap,
  Shield,
  Target,
  Users,
} from "lucide-react";
import InformationPage, {
  InfoLink,
  InfoList,
  InfoSection,
} from "../components/InformationPage";

const About = () => (
  <InformationPage
    icon={Target}
    title="A clearer route to student housing."
    description="UniHostel brings verified listings, applications, approval, and payment into one trust-first journey for student housing in Accra."
  >
    <InfoSection title="Built to remove the unknowns." icon={Target}>
      <div className="info-callout">
        <p>
          Finding safe, affordable, reliable accommodation should not be
          stressful. UniHostel connects students with verified hostels through
          one simple, transparent, secure process.
        </p>
      </div>
      <p>
        Platform bridges students searching for accommodation and hostel
        managers who need to manage and fill rooms, with oversight that supports
        trust, fairness, and accountability.
      </p>
    </InfoSection>
    <InfoSection title="What that means in practice." icon={Users}>
      <div className="info-grid info-grid--three">
        <article className="info-panel">
          <GraduationCap className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>For students</h3>
          <p className="mt-3">
            Make housing decisions with real information and a visible next
            step.
          </p>
          <div className="mt-5">
            <InfoList
              items={[
                "Browse verified rooms with clear pricing",
                "See room details and hostel images",
                "Apply before payment is requested",
                "Receive an access code after confirmation",
              ]}
            />
          </div>
        </article>
        <article className="info-panel">
          <Building2 className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>For managers</h3>
          <p className="mt-3">
            Keep listings, availability, applications, and occupancy in one
            workspace.
          </p>
          <div className="mt-5">
            <InfoList
              items={[
                "Manage hostel listings and rooms",
                "Keep capacity and availability current",
                "Review applications fairly",
                "Track applications, occupancy, and earnings",
              ]}
            />
          </div>
        </article>
        <article className="info-panel">
          <Shield className="mb-5 h-7 w-7 text-[#c96e32]" />
          <h3>For administrators</h3>
          <p className="mt-3">
            Maintain integrity across listings, people, and the process.
          </p>
          <div className="mt-5">
            <InfoList
              items={[
                "Verify users and moderate platform activity",
                "Oversee applications and payments",
                "Resolve disputes",
                "Use analytics and reporting for oversight",
              ]}
            />
          </div>
        </article>
      </div>
    </InfoSection>
    <InfoSection title="A process you can follow." icon={Eye}>
      <div className="info-grid info-grid--two">
        <div className="info-panel">
          <span className="info-role-label">Student journey</span>
          <h3 className="mt-3">Find, apply, then pay after approval.</h3>
          <div className="mt-5">
            <InfoList
              items={[
                "Browse available hostels",
                "Apply for a preferred room",
                "Wait for manager approval",
                "Pay securely after approval",
                "Receive final confirmation and access code",
              ]}
            />
          </div>
        </div>
        <div className="info-callout info-callout--dark">
          <h3>Our mission</h3>
          <p className="mt-4">
            Simplify student housing with a digital process that makes
            discovering, applying for, and securing accommodation easy,
            transparent, and reliable.
          </p>
          <div className="mt-6">
            <InfoList
              items={[
                "Reduce fraud and misinformation",
                "Remove uncertainty around availability",
                "Create a fair, structured booking process",
              ]}
            />
          </div>
        </div>
      </div>
    </InfoSection>
    <InfoSection title="Trust is the product." icon={Shield}>
      <div className="info-grid info-grid--two">
        <div>
          <h3>Our vision</h3>
          <p className="mt-3">
            Every student should be able to secure accommodation without stress.
            Every hostel manager should be able to operate with better tools and
            clearer information.
          </p>
        </div>
        <div>
          <h3>Security and accountability</h3>
          <p className="mt-3">
            Payment handling, data protection, and access codes support a
            process designed to prevent impersonation and keep decisions
            visible.
          </p>
        </div>
      </div>
      <div className="mt-10">
        <InfoLink to="/hostels">Browse verified hostels</InfoLink>
      </div>
    </InfoSection>
  </InformationPage>
);

export default About;
