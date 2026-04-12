'use client';
import Link from 'next/link';

const BRAND   = 'Coachstra';
const EMAIL   = 'support@coachstra.online';
const UPDATED = 'April 4, 2026';

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#34d399', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid rgba(52,211,153,0.2)' }}>
        {title}
      </h2>
      <div style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function Li({ children }) {
  return (
    <li style={{ marginBottom: 8, paddingLeft: 8, borderLeft: '2px solid rgba(52,211,153,0.3)', marginLeft: 8 }}>
      {children}
    </li>
  );
}

function InfoBox({ icon, title, desc, color }) {
  return (
    <div style={{ padding: 20, background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 12, marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <strong style={{ color: '#e2e8f0', fontSize: 15 }}>{title}</strong>
      </div>
      <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
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
export default function RefundPolicy() {
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
            <Link href="/terms-and-conditions" style={{ color: '#64748b', textDecoration: 'none' }}>Terms</Link>
            <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.1) 0%, transparent 100%)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#34d399', marginBottom: 20 }}>
          💰 Refund & Cancellation
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg,#fff 40%,#34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Refund & Cancellation Policy
        </h1>
        <p style={{ color: '#64748b', fontSize: 14 }}>Last updated: {UPDATED}</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '20px 24px 80px' }}>
        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '16px 20px', marginBottom: 40, fontSize: 14, color: '#6ee7b7', lineHeight: 1.7 }}>
          This policy applies to all subscription payments made on <strong>{BRAND}</strong> for our paid coaching management plan. Please read it carefully before making a purchase. By subscribing, you agree to this refund and cancellation policy.
        </div>

        {/* Quick summary boxes */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 16 }}>Quick Summary</h2>
          <InfoBox icon="✅" color="#34d399" title="7-Day Refund Window"
            desc="If you are not satisfied with our paid plan, you may request a full refund within 7 days of your first subscription payment." />
          <InfoBox icon="🔄" color="#60a5fa" title="Cancel Anytime"
            desc="You can cancel your subscription at any time. Your account will remain active until the end of your current billing period." />
          <InfoBox icon="⚠️" color="#f59e0b" title="No Refund After 7 Days"
            desc="After 7 days from payment, subscriptions are non-refundable. Partial refunds for unused days are not provided." />
        </div>

        <Section title="1. Subscription Payments">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>{BRAND} offers a monthly paid subscription plan (₹999/month) in addition to a free plan.</Li>
            <Li>All payments are processed securely through Razorpay using UPI, credit/debit cards, or net banking.</Li>
            <Li>Subscription plans are billed on a monthly cycle from the date of purchase.</Li>
            <Li>Plan renewals happen automatically on the billing date unless cancelled.</Li>
          </ul>
        </Section>

        <Section title="2. Eligibility for Refund">
          <p style={{ marginBottom: 12 }}>You are eligible for a <strong style={{ color: '#34d399' }}>full refund</strong> if:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>You request a refund within <strong style={{ color: '#34d399' }}>7 days</strong> of your first subscription payment.</Li>
            <Li>You have not made extensive use of paid-only features (e.g., uploaded more than 5 additional files beyond the free plan).</Li>
            <Li>The refund request is your first refund request on this account.</Li>
          </ul>
          <p style={{ marginTop: 12 }}><strong style={{ color: '#e2e8f0' }}>Refunds are NOT provided for:</strong></p>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
            <Li>Requests made after 7 days from the payment date.</Li>
            <Li>Monthly renewals (only the first payment is eligible for refund).</Li>
            <Li>Accounts suspended due to violation of our Terms and Conditions.</Li>
            <Li>Dissatisfaction due to features that are clearly documented in the free plan.</Li>
          </ul>
        </Section>

        <Section title="3. Cancellation Policy">
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li>You may cancel your paid subscription at any time from your account dashboard or by contacting our support team.</Li>
            <Li>After cancellation, your account will be downgraded to the <strong style={{ color: '#e2e8f0' }}>Free Plan</strong> at the end of the current billing period.</Li>
            <Li>You will continue to have access to paid features until the end of the period you have already paid for.</Li>
            <Li>No partial refunds are issued for the remaining days in a billing period after cancellation.</Li>
            <Li>Data and study materials are preserved for 30 days after downgrade before being subject to free plan limits.</Li>
          </ul>
        </Section>

        <Section title="4. How to Request a Refund">
          <p style={{ marginBottom: 16 }}>To request a refund, follow these steps:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { step: '1', text: `Email us at ${EMAIL} with subject line: "Refund Request — [Your Registered Email]"` },
              { step: '2', text: 'Include your registered email, account name, payment date, and Razorpay transaction ID.' },
              { step: '3', text: 'Our team will review your request within 2 business days and respond via email.' },
              { step: '4', text: 'If approved, the refund will be processed within 5–7 business days back to the original payment method.' },
            ].map(({ step, text }) => (
              <div key={step} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 28, height: 28, minWidth: 28, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#34d399' }}>{step}</div>
                <p style={{ color: '#94a3b8', fontSize: 14, paddingTop: 4 }}>{text}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="5. Refund Processing Time">
          <p style={{ marginBottom: 12 }}>Once a refund is approved:</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            <Li><strong style={{ color: '#e2e8f0' }}>UPI / Net Banking:</strong> 3–5 business days.</Li>
            <Li><strong style={{ color: '#e2e8f0' }}>Credit / Debit Card:</strong> 5–7 business days (subject to your bank's processing time).</Li>
            <Li>Razorpay may take additional time to process the refund on their end.</Li>
            <Li>You will receive a confirmation email once the refund has been initiated.</Li>
          </ul>
        </Section>

        <Section title="6. Service Disruptions">
          <p>If {BRAND} experiences significant downtime (more than 24 consecutive hours) due to issues on our end, affected users may be eligible for a prorated credit or service extension. This is evaluated on a case-by-case basis. Planned maintenance periods notified in advance are excluded.</p>
        </Section>

        <Section title="7. Contact for Refund Queries">
          <p>For any questions about refunds or cancellations, please reach out to us:</p>
          <div style={{ marginTop: 16, padding: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12 }}>
            <p style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 8 }}>{BRAND} Support</p>
            <p>📧 <a href={`mailto:${EMAIL}`} style={{ color: '#34d399', textDecoration: 'none' }}>{EMAIL}</a></p>
            <p style={{ marginTop: 4, fontSize: 13, color: '#64748b' }}>Response time: within 2 business days</p>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <Link href="/privacy-policy" style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms-and-conditions" style={{ color: '#64748b', textDecoration: 'none' }}>Terms & Conditions</Link>
          <Link href="/refund-policy" style={{ color: '#34d399', textDecoration: 'none' }}>Refund Policy</Link>
          <Link href="/contact-us" style={{ color: '#64748b', textDecoration: 'none' }}>Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </footer>
    </div>
  );
}
