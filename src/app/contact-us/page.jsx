'use client';
import { useState } from 'react';
import Link from 'next/link';

const BRAND   = 'Coachstra';
const EMAIL   = 'support@coachstra.online';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function ContactCard({ icon, title, value, href, color }) {
  return (
    <a href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{ padding: 24, background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}25`, borderRadius: 16, transition: 'all 0.2s' }}
        onMouseEnter={e => { if (href !== '#') { e.currentTarget.style.borderColor = `${color}55`; e.currentTarget.style.background = `${color}08`; e.currentTarget.style.transform = 'translateY(-2px)'; }}}
        onMouseLeave={e => { e.currentTarget.style.borderColor = `${color}25`; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'none'; }}>
        <div style={{ width: 46, height: 46, background: `${color}18`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{icon}</div>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{title}</p>
        <p style={{ color, fontSize: 15, fontWeight: 600 }}>{value}</p>
      </div>
    </a>
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

export default function ContactUs() {
  const [form, setForm]       = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Failed to send. Please try again.');
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = {
    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 14, fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', marginTop: 6, transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Header */}
      <header style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '18px 0', position: 'sticky', top: 0, background: 'rgba(10,15,30,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>C</div>
            <span style={{ ...S.displayFont, fontSize: 20, fontWeight: 700, ...S.gradientText }}>Coachstra</span>
          </div>
          </Link>
          
          <nav style={{ display: 'flex', gap: 20, fontSize: 13 }}>
            <Link href="/privacy-policy"       style={{ color: '#64748b', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms-and-conditions"  style={{ color: '#64748b', textDecoration: 'none' }}>Terms</Link>
            <Link href="/refund-policy"         style={{ color: '#64748b', textDecoration: 'none' }}>Refund</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg,rgba(245,158,11,0.09) 0%,transparent 100%)', padding: '60px 24px 40px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#fbbf24', marginBottom: 20 }}>
          💬 Get in Touch
        </div>
        <h1 style={{ fontSize: 38, fontWeight: 800, marginBottom: 12, background: 'linear-gradient(135deg,#fff 40%,#fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Contact Us
        </h1>
        <p style={{ color: '#64748b', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
          Have a question or need help? We typically respond within 2 business days.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 32 }}>

          {/* Left — Info */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>Reach Us Directly</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
              <ContactCard icon="📧" title="Email Support"  value={EMAIL}                  href={`mailto:${EMAIL}`} color="#60a5fa" />
              <ContactCard icon="🕐" title="Response Time" value="Within 2 business days" href="#"                 color="#34d399" />
              <ContactCard icon="🇮🇳" title="Location"     value="India"                  href="#"                 color="#f472b6" />
            </div>
            <div style={{ padding: 20, background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Common Topics</p>
              {['Billing & Subscription','Account & Login issues','Feature requests','Refund requests','Technical support','Razorpay payment issues'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13, color: '#94a3b8' }}>
                  <span style={{ color: '#2563eb' }}>→</span> {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — Form */}
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e2e8f0', marginBottom: 20 }}>Send Us a Message</h2>

            {sent ? (
              <div style={{ padding: 40, textAlign: 'center', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 16 }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#34d399', marginBottom: 8 }}>Message Received!</h3>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>
                  Thanks <strong style={{ color: '#e2e8f0' }}>{form.name}</strong>! We will reply to{' '}
                  <strong style={{ color: '#e2e8f0' }}>{form.email}</strong> within 2 business days.
                </p>
                <button onClick={() => { setSent(false); setForm({ name:'', email:'', subject:'', message:'' }); }}
                  style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.1)', color: '#34d399', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28 }}>

                {error && (
                  <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, color: '#f87171', fontSize: 14 }}>
                    ⚠️ {error}
                  </div>
                )}

                <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                      placeholder="Rahul Sharma" style={inp}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email Address *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                      placeholder="rahul@coaching.in" style={inp}
                      onFocus={e => e.target.style.borderColor = '#2563eb'}
                      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Subject *</label>
                  <select required value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))}
                    style={{ ...inp,background: '#21262f', cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}>
                    <option value="">Select a topic...</option>
                    <option>Billing &amp; Subscription</option>
                    <option>Refund Request</option>
                    <option>Account &amp; Login Issue</option>
                    <option>Technical Support</option>
                    <option>Feature Request</option>
                    <option>Razorpay Payment Issue</option>
                    <option>Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                    placeholder="Describe your issue or question in detail..."
                    style={{ ...inp, resize: 'vertical', minHeight: 120 }}
                    onFocus={e => e.target.style.borderColor = '#2563eb'}
                    onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <button type="submit" disabled={loading}
                  style={{ width: '100%', padding: '14px', borderRadius: 10, border: 'none', background: loading ? 'rgba(37,99,235,0.5)' : 'linear-gradient(135deg,#2563eb,#4f46e5)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  {loading ? (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      Sending…
                    </>
                  ) : 'Send Message →'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12, color: '#475569', marginTop: 12 }}>
                  Or email us at <a href={`mailto:${EMAIL}`} style={{ color: '#60a5fa' }}>{EMAIL}</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px', textAlign: 'center', color: '#475569', fontSize: 13 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          <Link href="/privacy-policy"       style={{ color: '#64748b', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms-and-conditions"  style={{ color: '#64748b', textDecoration: 'none' }}>Terms &amp; Conditions</Link>
          <Link href="/refund-policy"         style={{ color: '#64748b', textDecoration: 'none' }}>Refund Policy</Link>
          <Link href="/contact-us"            style={{ color: '#fbbf24', textDecoration: 'none' }}>Contact Us</Link>
        </div>
        <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
