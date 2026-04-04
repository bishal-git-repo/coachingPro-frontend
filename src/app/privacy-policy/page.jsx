'use client';
import Link from 'next/link';

const BRAND    = 'CoachingPro';
const EMAIL    = 'support@coachingpro.in';
const ADDRESS  = 'India';
const UPDATED  = 'April 4, 2026';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#60a5fa', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(96,165,250,0.2)' }}>
        {title}
      </h2>
      <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function Li({ children }) {
  return (
    <li style={{ marginBottom: 8, paddingLeft: 8, borderLeft: '2px solid rgba(96,165,250,0.3)', marginLeft: 8 }}>
      {children}
    </li>
  );
}
const S = {
  // Layout
  page: { minHeight: '100vh', background: '#0a0f1e', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  containerSm: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },

  // Glass
  glass: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 },

  // Text
  gradientText: { background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  displayFont: { fontFamily: "'Space Grotesk', sans-serif" },

  // Buttons
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 16, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, padding: '14px 32px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 16, textDecoration: 'none', transition: 'all 0.2s' },

  // Sections
  section: { padding: '100px 0' },
  sectionAlt: { padding: '100px 0', background: 'rgba(255,255,255,0.02)' },

  // Cards
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', transition: 'all 0.3s' },

  // Tags
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '8px 18px', fontSize: 13, color: '#93c5fd', marginBottom: 20 },
};

export default function PrivacyPolicy() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0', position: 'sticky', top: 0, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>C</div>
            <span style={{ ...S.displayFont, fontSize: 20, fontWeight: 700, ...S.gradientText }}>CoachingPro</span>
          </div>
          </Link>
          <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <Link href="/terms-and-conditions" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</Link>
            <Link href="/refund-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Refund Policy</Link>
            <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(37,99,235,0.1) 0%, transparent 100%)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#60a5fa', marginBottom: 20 }}>
          🔒 Legal Document
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg,#fff 40%,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Last updated: {UPDATED}</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 40, fontSize: 14, color: '#93c5fd', lineHeight: 1.7 }}>
          This Privacy Policy describes how <strong>{BRAND}</strong> ("we", "us", or "our") collects, uses, and protects your personal information when you use our coaching management platform. By using our services, you agree to the practices described in this policy.
        </div>

        <Section title="1. Information We Collect">
          <p style={{ marginBottom: 12 }}>We collect the following types of information when you register and use {BRAND}:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li><strong style={{ color: '#e2e8f0' }}>Account Information:</strong> Name, email address, phone number, and password when you register.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Institute Details:</strong> Coaching institute name, address, logo, and related business information.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Student & Teacher Data:</strong> Information about students and teachers enrolled under your account, including names, contact details, and academic records.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Payment Information:</strong> Subscription payment data processed securely through Razorpay. We do not store card or bank details directly.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Usage Data:</strong> Pages visited, features used, login timestamps, and device/browser information.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Uploaded Content:</strong> Study materials (PDFs, videos) that you upload to our platform via AWS S3 cloud storage.</Li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>To create and manage your account and provide our coaching management services.</Li>
            <Li>To process subscription payments and send payment receipts and invoices.</Li>
            <Li>To send important service updates, alerts, and transactional emails.</Li>
            <Li>To improve our platform, fix bugs, and develop new features.</Li>
            <Li>To respond to customer support requests and resolve issues.</Li>
            <Li>To comply with legal obligations under Indian laws and regulations.</Li>
            <Li>To detect, prevent, and address fraud, security, or technical issues.</Li>
          </ul>
        </Section>

        <Section title="3. Data Sharing & Third Parties">
          <p style={{ marginBottom: 12 }}>We do <strong style={{ color: '#e2e8f0' }}>not sell</strong> your personal information. We share data only with these trusted service providers:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li><strong style={{ color: '#e2e8f0' }}>Razorpay:</strong> Payment processing for plan subscriptions. Subject to Razorpay's Privacy Policy.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Amazon Web Services (AWS):</strong> Cloud hosting for our application and secure file storage (S3) for uploaded study materials.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Gmail / Nodemailer:</strong> For sending transactional emails like OTPs, receipts, and notifications.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Legal Authorities:</strong> When required by Indian law, court orders, or government regulations.</Li>
          </ul>
        </Section>

        <Section title="4. Data Security">
          <p style={{ marginBottom: 12 }}>We take data security seriously and implement the following measures:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>All data is transmitted over HTTPS (SSL/TLS encryption).</Li>
            <Li>Passwords are hashed using bcrypt — never stored in plain text.</Li>
            <Li>Study materials are stored privately on AWS S3 with access controlled via short-lived pre-signed URLs.</Li>
            <Li>Authentication uses JWT tokens with expiry and refresh mechanisms.</Li>
            <Li>Database access is restricted to authorised systems only.</Li>
          </ul>
        </Section>

        <Section title="5. Data Retention">
          <p>We retain your data for as long as your account is active. If you delete your account, your personal data is removed within 30 days, except where we are required to retain it for legal or financial compliance purposes (such as payment records, which may be retained for up to 7 years as per Indian accounting laws).</p>
        </Section>

        <Section title="6. Your Rights">
          <p style={{ marginBottom: 12 }}>You have the following rights regarding your personal data:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li><strong style={{ color: '#e2e8f0' }}>Access:</strong> Request a copy of the personal data we hold about you.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Correction:</strong> Request correction of inaccurate or incomplete data.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Deletion:</strong> Request deletion of your account and associated personal data.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Portability:</strong> Request your data in a machine-readable format.</Li>
          </ul>
          <p style={{ marginTop: 12 }}>To exercise any of these rights, contact us at <a href={`mailto:${EMAIL}`} style={{ color: '#60a5fa' }}>{EMAIL}</a>.</p>
        </Section>

        <Section title="7. Cookies">
          <p>We use minimal cookies and browser local storage to maintain your session (login state) and store your access token for authentication. We do not use tracking or advertising cookies. You can clear cookies via your browser settings at any time.</p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>{BRAND} is not intended for children under 13. We do not knowingly collect personal information from children under 13. Student data entered by coaching institutes (which may include minors) is managed and controlled by the institute administrator, who is responsible for obtaining appropriate consent from guardians.</p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. For significant changes, we will notify registered users via email. Continued use of {BRAND} after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>For any privacy-related queries, requests, or concerns, please contact us at:</p>
          <div style={{ marginTop: 16, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>{BRAND}</p>
            <p>📧 <a href={`mailto:${EMAIL}`} style={{ color: '#60a5fa', textDecoration: 'none' }}>{EMAIL}</a></p>
            <p style={{ marginTop: 4 }}>📍 {ADDRESS}</p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <Link href="/privacy-policy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms-and-conditions" style={{ color: '#64748b', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link href="/refund-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Refund Policy</Link>
          <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </footer>
    </div>
  );
}
