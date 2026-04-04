'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ToastContainer, showToast } from '../../components/ui/index';
import { S } from '../../lib/styles';
import api from '../../lib/api';

const PLANS = [
  {
    id: 'free',
    label: 'Free Plan',
    price: '₹0',
    sub: '/forever',
    icon: '🎁',
    accent: '#2563eb',
    features: ['Up to 50 students', 'Up to 5 teachers', 'All core features', 'Basic fee management'],
  },
  {
    id: 'paid',
    label: 'Pro Plan',
    price: '₹999',
    sub: '/month',
    icon: '⭐',
    accent: '#d97706',
    features: ['Unlimited students', 'Unlimited teachers', /*'Razorpay payments',*/ 'Fee slip email delivery', 'Priority support'],
    badge: 'RECOMMENDED',
  },
];

// Dynamically load Razorpay checkout script
function loadRazorpay() {
  return new Promise(resolve => {
    if (typeof window !== 'undefined' && window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RegisterPage() {
  const [form, setForm] = useState({ name:'', email:'', password:'', coaching_name:'', phone:'' });
  const [plan, setPlan] = useState('free');
  const [step, setStep] = useState('form'); // 'form' | 'paying' | 'done'
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('plan') === 'paid') setPlan('paid');
}, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function openRazorpay(userData, tokens) {
    // tokens already set, user logged in — now open payment
    const loaded = await loadRazorpay();
    if (!loaded) {
      showToast('Payment gateway unavailable. You can upgrade later from Settings.', 'error');
      // Still log them in but as free
      localStorage.setItem('user', JSON.stringify({ ...userData, role:'admin' }));
      router.push('/dashboard');
      return;
    }

    let order;
    try {
      order = await api.createPlanOrder();
    } catch (err) {
      showToast('Could not create payment order. You can upgrade later.', 'error');
      localStorage.setItem('user', JSON.stringify({ ...userData, role:'admin' }));
      router.push('/dashboard');
      return;
    }

    const { orderId, amount, currency, key } = order.data;

    const options = {
      key,
      amount,
      currency,
      name: 'CoachingPro',
      description: 'Pro Plan — ₹999/month',
      order_id: orderId,
      prefill: { name: userData.name, email: userData.email },
      theme: { color: '#d97706' },
      modal: {
        ondismiss: () => {
          // User closed payment — log them in as free, let them upgrade later
          showToast('Payment cancelled. You can upgrade anytime from the dashboard.', 'error');
          localStorage.setItem('user', JSON.stringify({ ...userData, plan:'free', role:'admin' }));
          setLoading(false);
          setStep('form');
          router.push('/dashboard');
        },
      },
      handler: async function(response) {
        try {
          const verify = await api.verifyPlanPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          // Update stored user with pro plan
          const proUser = { ...userData, plan:'paid', plan_expires_at: verify.expires_at, role:'admin' };
          localStorage.setItem('user', JSON.stringify(proUser));
          showToast('🎉 Pro plan activated! Welcome to CoachingPro.');
          setStep('done');
          router.push('/dashboard');
        } catch (err) {
          showToast(err.message || 'Payment verification failed. Contact support.', 'error');
          localStorage.setItem('user', JSON.stringify({ ...userData, plan:'free', role:'admin' }));
          setLoading(false);
          setStep('form');
          router.push('/dashboard');
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function(response) {
      showToast(`Payment failed: ${response.error.description}`, 'error');
      localStorage.setItem('user', JSON.stringify({ ...userData, plan:'free', role:'admin' }));
      setLoading(false);
      setStep('form');
      router.push('/dashboard');
    });

    setStep('paying');
    rzp.open();
  }

  async function handleSubmit(e) {
    e.preventDefault();

    // Validation
    if (form.password.length < 8) return showToast('Password must be at least 8 characters', 'error');
    if (!form.name.trim()) return showToast('Name is required', 'error');
    if (!form.coaching_name.trim()) return showToast('Coaching name is required', 'error');

    setLoading(true);
    try {
      // Step 1: Register account (always as free initially)
      const res = await api.adminRegister({ ...form });
      // Step 2: Store tokens so we can call authenticated endpoints
      api.setTokens(res.accessToken, res.refreshToken);
      const userData = { ...res.data };

      if (plan === 'paid') {
        // Step 3: Open Razorpay — user logged in with free plan, payment upgrades them
        showToast('Account created! Opening payment…');
        await openRazorpay(userData, res);
      } else {
        // Free plan — just log in
        const userWithRole = { ...userData, plan:'free', role:'admin' };
        localStorage.setItem('user', JSON.stringify(userWithRole));
        showToast('Coaching registered! Welcome 🎉');
        setLoading(false);
        router.push('/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
      setLoading(false);
    }
  }

  // Show a "processing payment" overlay
  if (step === 'paying') {
    return (
      <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
        <div style={{ width:64, height:64, background:'linear-gradient(135deg,#d97706,#b45309)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, marginBottom:8 }}>⭐</div>
        <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:'#f1f5f9', marginBottom:4 }}>Complete Your Payment</h2>
        <p style={{ color:'#94a3b8', fontSize:14, textAlign:'center', maxWidth:340 }}>Complete the Razorpay checkout to activate your Pro plan. If you close it, you can upgrade later from the dashboard.</p>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100vh', background:'#0a0f1e', display:'flex', alignItems:'center', justifyContent:'center', padding:24, fontFamily:"'Plus Jakarta Sans',sans-serif", position:'relative', overflow:'hidden' }}>
      <ToastContainer />
      {/* Background glows */}
      <div style={{ position:'absolute', width:500, height:500, top:'-15%', right:'-10%', background:'radial-gradient(circle,rgba(79,70,229,0.1),transparent 70%)', borderRadius:'50%', filter:'blur(60px)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', width:300, height:300, bottom:'0%', left:'5%', background:'radial-gradient(circle,rgba(37,99,235,0.1),transparent 70%)', borderRadius:'50%', filter:'blur(40px)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:560, position:'relative', zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <Link href="/" style={{ textDecoration:'none', display:'inline-flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, height:44, background:'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:22, color:'#fff' }}>C</div>
            <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, background:'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>CoachingPro</span>
          </Link>
          <p style={{ color:'#64748b', fontSize:14, marginTop:8 }}>Register your coaching institute</p>
        </div>

        {/* Plan Selector */}
        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:13, color:'#94a3b8', marginBottom:12, fontWeight:600, textAlign:'center' }}>Choose your plan</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            {PLANS.map(p => (
              <div key={p.id} onClick={() => setPlan(p.id)}
                style={{ background:plan===p.id?`${p.accent}15`:'rgba(255,255,255,0.03)', border:`2px solid ${plan===p.id?p.accent:'rgba(255,255,255,0.08)'}`, borderRadius:14, padding:'16px 14px', cursor:'pointer', textAlign:'center', transition:'all 0.2s', userSelect:'none', position:'relative' }}>
                {p.badge && (
                  <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', color:'#0a0f1e', fontSize:9, fontWeight:800, borderRadius:20, padding:'2px 10px', whiteSpace:'nowrap' }}>{p.badge}</div>
                )}
                <div style={{ fontSize:22, marginBottom:6 }}>{p.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:plan===p.id?(p.accent==='#d97706'?'#fbbf24':'#60a5fa'):'#94a3b8', marginBottom:4 }}>{p.label}</div>
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:2, marginBottom:8 }}>
                  <span style={{ fontSize:20, fontWeight:800, color:'#f1f5f9' }}>{p.price}</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>{p.sub}</span>
                </div>
                <ul style={{ listStyle:'none', padding:0, margin:0, textAlign:'left' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ fontSize:11, color:plan===p.id?'#94a3b8':'#475569', marginBottom:3, display:'flex', alignItems:'center', gap:5 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={plan===p.id?p.accent:'#475569'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                {plan===p.id && (
                  <div style={{ marginTop:10, fontSize:11, fontWeight:700, color:p.accent==='#d97706'?'#fbbf24':'#60a5fa', background:`${p.accent}22`, borderRadius:6, padding:'3px 0' }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pro plan notice */}
          {plan === 'paid' && (
            <div style={{ marginTop:12, background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.25)', borderRadius:10, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>💳</span>
              <span style={{ fontSize:12, color:'#fbbf24' }}>Razorpay payment will open after registration. Your account activates instantly on successful payment.</span>
            </div>
          )}
        </div>

        {/* Form */}
        <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:28 }}>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>
            Create Your Coaching Account
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Full Name *</label>
              <input type="text" value={form.name} onChange={set('name')} placeholder="Rajesh Kumar" required style={S.input}
                onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Coaching Institute Name *</label>
              <input type="text" value={form.coaching_name} onChange={set('coaching_name')} placeholder="Bright Future Academy" required style={S.input}
                onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 }}>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Email *</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required style={S.input}
                  onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
              <div style={{ marginBottom:16 }}>
                <label style={S.label}>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="9876543210" style={S.input}
                  onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Password *</label>
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 8 characters" required minLength={8}
                  style={{ ...S.input, paddingRight:44 }}
                  onFocus={e=>e.target.style.borderColor='rgba(96,165,250,0.5)'} onBlur={e=>e.target.style.borderColor='rgba(255,255,255,0.1)'} />
                {/* <button type="button" onClick={()=>setShowPass(s=>!s)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:16 }}>
                  {showPass?'🙈':'👁️'}
                </button> */}
                <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Selected plan summary */}
            <div style={{ background:plan==='paid'?'rgba(217,119,6,0.1)':'rgba(37,99,235,0.08)', border:`1px solid ${plan==='paid'?'rgba(217,119,6,0.3)':'rgba(37,99,235,0.2)'}`, borderRadius:10, padding:'10px 14px', marginBottom:18, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:13, color:'#94a3b8' }}>Selected plan:</span>
              <span style={{ fontSize:13, fontWeight:700, color:plan==='paid'?'#fbbf24':'#60a5fa' }}>
                {plan==='paid'?'⭐ Pro — ₹999/mo':'🎁 Free — ₹0'}
              </span>
            </div>

            <button type="submit" disabled={loading}
              style={{ ...S.btnPrimary, width:'100%', padding:'13px', fontSize:15, justifyContent:'center', background:plan==='paid'?'linear-gradient(135deg,#d97706,#b45309)': 'linear-gradient(178deg, #0050ff, #0c2354)', boxShadow:plan==='paid'?'0 8px 24px rgba(217,119,6,0.25)': '0 8px 24px rgba(0, 80, 255, 0.25)' }}>
              {loading ? <Spinner size={18} color="#fff"/> : plan==='paid'?'Register & Pay ₹999 →':'Register Free →'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:18, color:'#64748b', fontSize:13 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color:'#60a5fa', textDecoration:'none', fontWeight:600 }}>Login here</Link>
          </p>
        </div>
      </div>
      <style>{`input::placeholder{color:#475569;} input{background:#0d1424!important;color:#f1f5f9!important;}`}</style>
    </div>
  );
}
