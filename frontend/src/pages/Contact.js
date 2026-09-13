import React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Clock3,
  Mail,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const contactRows = [
  {
    icon: Mail,
    title: "Email support",
    copy: "Questions, account help, feedback, and partnerships.",
    action: "support@example.com",
    href: "mailto:support@example.com",
  },
  {
    icon: MessageCircle,
    title: "Urgent support",
    copy: "Payment, access, or account concerns needing faster attention.",
    action: "+233 50 3847 786",
    href: "https://wa.me/233503847786",
  },
];
const Contact = () => (
  <div className="contact-page">
    <section className="contact-hero">
      <div>
        <p>Talk to UniHostel</p>
        <h1>Bring us into the conversation.</h1>
        <span>
          Questions about a room, your account, a listing, or running a hostel?
          Reach out with context. We will help you find next step.
        </span>
      </div>
      <aside>
        <Clock3 />
        <strong>Monday–Friday</strong>
        <span>9:00 AM–5:00 PM GMT</span>
        <small>Most messages receive a reply within 24–48 hours.</small>
      </aside>
    </section>
    <main className="contact-main">
      <section className="contact-direct">
        <h2>Choose right lane.</h2>
        <div>
          {contactRows.map(({ icon: Icon, title, copy, action, href }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
            >
              <Icon />
              <div>
                <strong>{title}</strong>
                <p>{copy}</p>
                <span>
                  {action} <ArrowRight />
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
      <section className="contact-routes">
        <article>
          <AlertTriangle />
          <h2>Urgent issues</h2>
          <p>Payment problems, account access, or suspension concerns.</p>
          <a href="https://wa.me/233503847786" target="_blank" rel="noreferrer">
            Message WhatsApp <ArrowRight />
          </a>
        </article>
        <article>
          <Building2 />
          <h2>List your hostel</h2>
          <p>Owners, managers, schools, and housing partners can start here.</p>
          <a href="mailto:support@example.com">
            Start a conversation <ArrowRight />
          </a>
        </article>
        <article>
          <ShieldCheck />
          <h2>Trust and safety</h2>
          <p>
            Report suspicious activity, fake listings, policy breaches, or
            harassment.
          </p>
          <a href="mailto:support@example.com">
            Report concern <ArrowRight />
          </a>
        </article>
      </section>
      <section className="contact-close">
        <h2>Clear housing needs clear support.</h2>
        <p>
          UniHostel helps students, managers, and institutions make housing
          decisions with confidence.
        </p>
      </section>
    </main>
  </div>
);
export default Contact;
