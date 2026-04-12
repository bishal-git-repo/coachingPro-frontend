'use client';
import Link from 'next/link';

const BRAND   = 'Coachstra';
const EMAIL   = 'support@coachstra.online';
const UPDATED = 'April 4, 2026';
const PRICE   = '₹999/month';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#a78bfa', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(167,139,250,0.2)' }}>
        {title}
      </h2>
      <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function Li({ children }) {
  return (
    <li style={{ marginBottom: 8, paddingLeft: 8, borderLeft: '2px solid rgba(167,139,250,0.3)', marginLeft: 8 }}>
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
export default function TermsAndConditions() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0', position: 'sticky', top: 0, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>C</div>
            <span style={{ ...S.displayFont, fontSize: 20, fontWeight: 700, ...S.gradientText }}>Coachstra</span>
          </div>
          </Link>
          <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <Link href="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/refund-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Refund Policy</Link>
            <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(79,70,229,0.12) 0%, transparent 100%)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.35)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#a78bfa', marginBottom: 20 }}>
          📜 Legal Document
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg,#fff 40%,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Terms &amp; Conditions
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Last updated: {UPDATED}</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ background: 'rgba(79,70,229,0.08)', border: '1px solid rgba(79,70,229,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 40, fontSize: 14, color: '#c4b5fd', lineHeight: 1.7 }}>
          Please read these Terms and Conditions carefully before using <strong>{BRAND}</strong>. By accessing or using our platform, you agree to be bound by these terms. If you disagree with any part of these terms, you may not use our services.
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account on {BRAND}, you confirm that you are at least 18 years of age, have the legal authority to enter into these terms on behalf of yourself or your coaching institute, and agree to comply with all applicable Indian laws and regulations.</p>
        </Section>

        <Section title="2. Description of Services">
          <p style={{ marginBottom: 12 }}>{BRAND} is a cloud-based coaching management platform that provides:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>Student and teacher management (enrolment, profiles, attendance)</Li>
            <Li>Batch and class scheduling management</Li>
            <Li>Fee collection and payment tracking</Li>
            <Li>Study material upload and distribution (PDFs and videos)</Li>
            <Li>Dashboard analytics and reporting</Li>
            <Li>Email notifications for students and teachers</Li>
          </ul>
          <p style={{ marginTop: 12 }}>Services are provided on a Software-as-a-Service (SaaS) basis. We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice.</p>
        </Section>

        <Section title="3. Account Registration & Responsibilities">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>You must provide accurate, complete, and current information during registration.</Li>
            <Li>You are responsible for maintaining the confidentiality of your login credentials.</Li>
            <Li>You are responsible for all activity that occurs under your account.</Li>
            <Li>You must immediately notify us of any unauthorised access to your account.</Li>
            <Li>Each coaching institute must register with a single admin account. Multiple admin accounts for the same institute are not permitted.</Li>
          </ul>
        </Section>

        <Section title="4. Subscription Plans & Payments">
          <p style={{ marginBottom: 12 }}>We offer two plans:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <p style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>🆓 Free Plan</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: 13 }}>
                <Li>Up to 50 students</Li>
                <Li>Up to 5 teachers</Li>
                <Li>Up to 15 PDFs + 5 videos</Li>
                <Li>All core features</Li>
              </ul>
            </div>
            <div style={{ padding: 16, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: 10 }}>
              <p style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 8 }}>⭐ Paid Plan — {PRICE}</p>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: 13 }}>
                <Li>Unlimited students</Li>
                <Li>Unlimited teachers</Li>
                <Li>Unlimited study materials</Li>
                <Li>Priority support</Li>
              </ul>
            </div>
          </div>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>Payments are processed securely via Razorpay. We accept UPI, credit/debit cards, and net banking.</Li>
            <Li>Subscriptions are billed monthly. Your plan renews automatically on the billing date.</Li>
            <Li>Prices are inclusive of applicable taxes (GST).</Li>
            <Li>We reserve the right to change pricing with 30 days' notice to registered users.</Li>
          </ul>
        </Section>

        <Section title="5. Acceptable Use Policy">
          <p style={{ marginBottom: 12 }}>You agree NOT to use {BRAND} to:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>Upload or distribute illegal, harmful, defamatory, or obscene content.</Li>
            <Li>Violate any intellectual property rights of third parties.</Li>
            <Li>Attempt to hack, reverse-engineer, or compromise the security of our platform.</Li>
            <Li>Use automated bots or scrapers to access our system.</Li>
            <Li>Share your account credentials with unauthorised third parties.</Li>
            <Li>Upload study materials that infringe on copyright (pirated books, unlicensed content).</Li>
          </ul>
          <p style={{ marginTop: 12 }}>Violation of these terms may result in immediate account suspension or termination without refund.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p style={{ marginBottom: 12 }}><strong style={{ color: '#e2e8f0' }}>Our IP:</strong> {BRAND}'s platform, code, design, branding, and all associated intellectual property are owned by us. You may not copy, reproduce, or create derivative works.</p>
          <p><strong style={{ color: '#e2e8f0' }}>Your Content:</strong> Study materials, student data, and content you upload remain your property. You grant us a limited, non-exclusive licence to store and serve this content as part of providing our services. We do not claim ownership of your content.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p style={{ marginBottom: 12 }}>To the fullest extent permitted by Indian law:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>{BRAND} is provided "as is" without warranties of any kind, express or implied.</Li>
            <Li>We are not liable for any indirect, incidental, or consequential damages arising from use of our platform.</Li>
            <Li>Our maximum liability to you shall not exceed the amount paid by you in the 3 months preceding the claim.</Li>
            <Li>We are not responsible for data loss due to user error or third-party service failures (AWS, Razorpay).</Li>
          </ul>
        </Section>

        <Section title="8. Termination">
          <p>You may terminate your account at any time by contacting us. We reserve the right to suspend or terminate accounts that violate these terms, with or without notice. Upon termination, your data will be retained for 30 days before permanent deletion, giving you an opportunity to export it.</p>
        </Section>

        <Section title="9. Governing Law & Disputes">
          <p>These Terms are governed by the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts located in India. We encourage you to contact us first to resolve any disputes amicably.</p>
        </Section>

        <Section title="10. Contact Us">
          <p>For any questions about these Terms and Conditions, contact us at:</p>
          <div style={{ marginTop: 16, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>{BRAND}</p>
            <p>📧 <a href={`mailto:${EMAIL}`} style={{ color: '#a78bfa', textDecoration: 'none' }}>{EMAIL}</a></p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <Link href="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms-and-conditions" style={{ color: '#a78bfa', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link href="/refund-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Refund Policy</Link>
          <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </footer>
    </div>
  );
}
