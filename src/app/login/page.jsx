'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ToastContainer, showToast } from '../../components/ui/index';
import { S } from '../../lib/styles';

export default function LoginPage() {
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  // Prefetch dashboard so navigation is instant after login
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return showToast('Please fill all fields', 'error');
    setLoading(true);
    try {
      await login(role, email, password);
      showToast('Login successful!');
      router.push('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const roleConfig = {
    admin: {
      label: 'Admin', color: '#2563eb', desc: 'Coaching owner',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    },
    teacher: {
      label: 'Teacher', color: '#7c3aed', desc: 'Teaching staff',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
    },
    student: {
      label: 'Student', color: '#0891b2', desc: 'Enrolled student',
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>,
    },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <ToastContainer />
      <div style={{ position: 'absolute', width: 400, height: 400, top: '-10%', left: '-10%', background: 'radial-gradient(circle, rgba(37,99,235,0.12), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(124,58,237,0.1), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>C</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Coachstra</span>
          </Link>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Sign in to your portal</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
          {Object.entries(roleConfig).map(([key, cfg]) => (
            <button key={key} onClick={() => setRole(key)} style={{
              padding: '14px 8px', borderRadius: 12, border: `2px solid ${role === key ? cfg.color : 'rgba(255,255,255,0.08)'}`,
              background: role === key ? `${cfg.color}18` : 'rgba(255,255,255,0.03)',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center', fontFamily: 'inherit',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
            }}>
              <div style={{ color: role === key ? cfg.color : '#64748b' }}>{cfg.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: role === key ? cfg.color : '#94a3b8' }}>{cfg.label}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>{cfg.desc}</div>
            </button>
          ))}
        </div>

        {/* Form card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 28px' }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: roleConfig[role].color }}>{roleConfig[role].icon}</span>
            {roleConfig[role].label} Login
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={S.label}>Email Address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="cp-input"
                style={S.input}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="cp-input"
                  style={{ ...S.input, paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.btnPrimary, width: '100%', padding: '13px', fontSize: 15, justifyContent: 'center' }}>
              {loading ? <Spinner size={18} color="#fff" /> : `Sign in as ${roleConfig[role].label}`}
            </button>
          </form>
        </div>

        {role === 'admin' && (
          <p style={{ textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 14 }}>
            New coaching?{' '}
            <Link href="/register" style={{ color: '#60a5fa', textDecoration: 'none', fontWeight: 600 }}>Register here →</Link>
          </p>
        )}
        {role !== 'admin' && (
          <p style={{ textAlign: 'center', marginTop: 16, color: '#475569', fontSize: 13 }}>
            Credentials are sent by your coaching admin via email.
          </p>
        )}
      </div>
      <style>{`select option{background:#1e293b;color:#f1f5f9;}`}</style>
    </div>
  );
}
