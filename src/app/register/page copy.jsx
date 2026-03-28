'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Spinner, showToast } from '../../components/ui/index';
import { S } from '../../lib/styles';
import api from '../../lib/api';

const PLANS = [
  { id: 'free',  label: 'Free Plan',  price: '₹0',       sub: '/forever', features: ['Up to 50 students', '5 teachers', 'All core features'], icon: '🎁', accent: '#2563eb' },
  { id: 'paid',  label: 'Pro Plan',   price: '₹999',     sub: '/month',   features: ['Unlimited students', 'Unlimited teachers', 'Razorpay payments', 'Priority support'], icon: '⭐', accent: '#d97706' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', coaching_name:'', phone:'' });
  const [plan, setPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 8) return showToast('Password must be at least 8 characters', 'error');
    setLoading(true);
    try {
      const res = await api.adminRegister({ ...form, plan });
      api.setTokens(res.accessToken, res.refreshToken);
      const userData = { ...res.data, role:'admin' };
      localStorage.setItem('user', JSON.stringify(userData));
      if (plan === 'paid') {
        showToast('Account created! Redirecting to payment…');
        router.push('/dashboard?upgrade=1');
      } else {
        showToast('Coaching registered! Welcome 🎉');
        router.push('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', width:500, height:500, top:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(79,70,229,0.1),transparent 70%)', borderRadius:'50%', filter:'blur(60px)' }} />
      <div style={{ position:'absolute', width:300, height:300, bottom:'0%', left:'5%', background:'radial-gradient(circle,rgba(37,99,235,0.1),transparent 70%)', borderRadius:'50%', filter:'blur(40px)' }} />

      <div style={{ width:'100%', maxWidth:540, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22 }}>C</div>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>CoachingPro</span>
          </Link>
          <p style={{ color:'#64748b', fontSize:14, marginTop:8 }}>Register your coaching institute</p>
        </div>

        {/* Plan Selector — FIXED: clickable, shows selected state */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:13, color:'#94a3b8', marginBottom:12, fontWeight:600, textAlign:'center' }}>Choose your plan</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)}
                style={{ background: plan===p.id ? `${p.accent}18` : 'rgba(255,255,255,0.03)', border:`2px solid ${plan===p.id ? p.accent : 'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'16px 14px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', userSelect:'none' }}
                onMouseEnter={e => { if(plan!==p.id) e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; }}
                onMouseLeave={e => { if(plan!==p.id) e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{p.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color: plan===p.id ? (p.accent==='#d97706' ? '#fbbf24' : '#60a5fa') : '#94a3b8', marginBottom:4 }}>{p.label}</div>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:2, marginBottom:8 }}>
                  <span style={{ fontSize:20, fontWeight:800, color:'#f1f5f9' }}>{p.price}</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>{p.sub}</span>
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0, textAlign:'left' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize:11, color: plan===p.id ? '#94a3b8' : '#475569', marginBottom:3, display:'flex', alignItems:'center', gap:5 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan===p.id ? p.accent : '#475569'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan===p.id && (
                  <div style={{ marginTop:10, fontSize:11, fontWeight:700, color: p.accent==='#d97706' ? '#fbbf24' : '#60a5fa', background: `${p.accent}22`, borderRadius:6, padding:'3px 0' }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>
            🏛️ Create Your Coaching Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Full Name</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Rajesh Kumar" required style={S.input}
                onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.5)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Coaching Institute Name</label>
              <input type="text" value={form.coaching_name} onChange={set('coaching_name')} placeholder="Bright Future Academy" required style={S.input}
                onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.5)'}
                onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 }}>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={S.input}
                  onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" style={S.input}
                  onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Password</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8}
                  style={{ ...S.input, paddingRight:44 }}
                  onFocus={e => e.target.style.borderColor='rgba(96,165,250,0.5)'}
                  onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                <button type="button" onClick={() => setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:16 }}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Selected plan indicator */}
            <div style={{ background: plan==='paid' ? 'rgba(217,119,6,0.1)' : 'rgba(37,99,235,0.08)', border:`1px solid ${plan==='paid' ? 'rgba(217,119,6,0.3)' : 'rgba(37,99,235,0.2)'}`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#94a3b8' }}>Selected plan:</span>
              <span style={{ fontSize:13, fontWeight:700, color: plan==='paid' ? '#fbbf24' : '#60a5fa' }}>
                {plan==='paid' ? '⭐ Pro — ₹999/mo' : '🎁 Free — ₹0'}
              </span>
            </div>

            <button type="submit" disabled={loading} style={{ ...S.btnPrimary, width:'100%', padding:'13px', fontSize:15, justifyContent:'center', background: plan==='paid' ? 'linear-gradient(135deg,#d97706,#b45309)' : undefined }}>
              {loading ? <Spinner size={18} color="#fff" /> : plan==='paid' ? 'Register & Upgrade →' : 'Register — Start Free →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:18, color:'#64748b', fontSize:13 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color:'#60a5fa', textDecoration:'none', fontWeight:600 }}>Login here</Link>
          </p>
        </div>
      </div>
      <style>{`input::placeholder{color:#475569;}`}</style>
    </div>
  );
}
