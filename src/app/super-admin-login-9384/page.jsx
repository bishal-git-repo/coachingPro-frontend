'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Spinner, ToastContainer, showToast } from '../../components/ui/index';
import { S } from '../../lib/styles';

export default function SuperAdminLoginPage() {
  const [step, setStep] = useState('credentials'); // 'credentials' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Prefetch dashboard
    router.prefetch('/super-admin-login-9384/dashboard');
  }, [router]);

  async function handleCredentialsSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      return showToast('Please enter both email and password', 'error');
    }

    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/super-admin/login-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification request failed');

      showToast('OTP generated! Check your backend terminal console.');
      setStep('otp');
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    if (!otp) {
      return showToast('Please enter the 6-digit OTP', 'error');
    }

    setLoading(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const res = await fetch(`${BASE_URL}/super-admin/login-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'OTP verification failed');

      // Save credentials in localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify({ ...data.data, role: 'super-admin' }));

      showToast('Welcome, Super Admin!');
      router.push('/super-admin-login-9384/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid or expired OTP', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070a13', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Plus Jakarta Sans', sans-serif", position: 'relative', overflow: 'hidden' }}>
      <ToastContainer />
      
      {/* Background ambient glow effect */}
      <div style={{ position: 'absolute', width: 500, height: 500, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(239,68,68,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />
      <div style={{ position: 'absolute', width: 450, height: 450, bottom: '-10%', right: '-10%', background: 'radial-gradient(circle, rgba(37,99,235,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(50px)' }} />

      <div style={{ width: '100%', maxWidth: 450, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#dc2626,#f43f5e)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, color: '#fff' }}>S</div>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg, #f87171, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Coachstra Control</span>
          </div>
          <p style={{ color: '#475569', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginTop: 10 }}>Hidden Super Admin Gateway</p>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(16px)', borderRadius: 24, padding: '36px 32px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
          {step === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Secure Authentication
              </h2>

              <div style={{ marginBottom: 20 }}>
                <label style={S.label}>Super Admin Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@coachingpro.site"
                  required
                  style={{ ...S.input, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              <div style={{ marginBottom: 28 }}>
                <label style={S.label}>Master Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ ...S.input, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              <button type="submit" disabled={loading} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #dc2626, #f43f5e)', width: '100%', padding: '13px', fontSize: 15, justifyContent: 'center' }}>
                {loading ? <Spinner size={18} color="#fff" /> : 'Request One-Time PIN'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Verification Required
              </h2>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>
                We sent a 6-digit OTP code to your secure email. Please enter it below.
              </p>

              <div style={{ marginBottom: 28 }}>
                <label style={S.label}>6-Digit OTP Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="000000"
                  required
                  style={{ ...S.input, textAlign: 'center', fontSize: 24, letterSpacing: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" onClick={() => setStep('credentials')} style={{ ...S.btnGhost, flex: 1, padding: '12px' }}>
                  Back
                </button>
                <button type="submit" disabled={loading} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #2563eb, #3b82f6)', flex: 2, padding: '12px', justifyContent: 'center' }}>
                  {loading ? <Spinner size={18} color="#fff" /> : 'Verify & Enter'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
