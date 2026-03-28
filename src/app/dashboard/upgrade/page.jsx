'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Spinner, showToast } from '../../../components/ui/index';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

// Load Razorpay script dynamically
function loadRazorpay() {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const FEATURES_FREE = [
  'Up to 50 students',
  'Up to 5 teachers',
  'Batch & class management',
  'Attendance tracking',
  'Study materials (PDF & video)',
  'Basic fee management',
];

const FEATURES_PRO = [
  'Unlimited students',
  'Unlimited teachers',
  'Everything in Free',
  'Razorpay payment collection',
  'Fee slip email delivery',
  'Priority support',
  'Early access to new features',
];

function UpgradeInner() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromRegister = searchParams?.get('from') === 'register';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);

  // If already pro, show current plan info
  const isPro = user?.plan === 'paid';

  async function handleUpgrade() {
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) { showToast('Failed to load payment gateway. Check your connection.', 'error'); setLoading(false); return; }

      // Create Razorpay order
      const order = await api.createPlanOrder();
      const { orderId, amount, currency, key } = order.data;

      const options = {
        key,
        amount,
        currency,
        name: 'CoachingPro',
        description: 'Pro Plan — ₹999/month',
        order_id: orderId,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#d97706' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            showToast('Payment cancelled. You can upgrade anytime.', 'error');
          },
        },
        handler: async function(response) {
          try {
            const verify = await api.verifyPlanPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Update user context to reflect pro plan
            updateUser({ plan: 'paid', plan_expires_at: verify.expires_at });
            setExpiresAt(verify.expires_at);
            setSuccess(true);
            showToast('🎉 Upgraded to Pro successfully!');
          } catch (err) {
            showToast(err.message || 'Payment verification failed', 'error');
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function(response) {
        showToast(`Payment failed: ${response.error.description}`, 'error');
        setLoading(false);
      });
      rzp.open();

    } catch (err) {
      console.error('Full error:', err);
  console.error('Response:', err.response);
  showToast(err.message || 'Could not initiate payment', 'error');
  setLoading(false);
    }
  }

  if (success) {
    return (
      <DashboardLayout>
        <div style={{ maxWidth:520, margin:'60px auto', textAlign:'center' }}>
          <div style={{ width:80, height:80, background:'linear-gradient(135deg,#d97706,#b45309)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, margin:'0 auto 24px' }}>⭐</div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:28, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>You're on Pro!</h1>
          <p style={{ color:'#94a3b8', fontSize:15, marginBottom:8 }}>Your account has been upgraded to the Pro Plan.</p>
          {expiresAt && <p style={{ color:'#64748b', fontSize:13, marginBottom:32 }}>Valid until {new Date(expiresAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>}
          <div style={{ background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.25)', borderRadius:16, padding:24, marginBottom:28, textAlign:'left' }}>
            <p style={{ fontSize:13, fontWeight:700, color:'#fbbf24', marginBottom:12 }}>Pro features now unlocked:</p>
            {FEATURES_PRO.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{f}</span>
              </div>
            ))}
          </div>
          <button onClick={() => router.push('/dashboard')}
            style={{ background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff', border:'none', borderRadius:12, padding:'13px 32px', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
            Go to Dashboard →
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth:680, margin:'0 auto' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          {fromRegister && (
            <div style={{ background:'rgba(217,119,6,0.1)', border:'1px solid rgba(217,119,6,0.3)', borderRadius:10, padding:'10px 18px', marginBottom:20, display:'inline-flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:14 }}>👋</span>
              <span style={{ fontSize:13, color:'#fbbf24', fontWeight:600 }}>Account created! Complete your Pro upgrade to unlock all features.</span>
            </div>
          )}
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:32, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>
            {isPro ? 'Your Current Plan' : 'Upgrade to Pro'}
          </h1>
          <p style={{ color:'#64748b', fontSize:15 }}>
            {isPro ? 'You have access to all Pro features.' : 'Unlock unlimited students, teachers & payment collection.'}
          </p>
        </div>

        {/* Plan comparison */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:36 }}>
          {/* Free plan */}
          <div style={{ background:'rgba(255,255,255,0.04)', border:`2px solid ${!isPro ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius:20, padding:28 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ fontSize:28 }}>🎁</div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9' }}>Free Plan</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <span style={{ fontSize:24, fontWeight:800, color:'#60a5fa' }}>₹0</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>/forever</span>
                </div>
              </div>
              {!isPro && <div style={{ marginLeft:'auto', fontSize:11, fontWeight:700, color:'#60a5fa', background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:6, padding:'3px 8px' }}>Current</div>}
            </div>
            {FEATURES_FREE.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{f}</span>
              </div>
            ))}
          </div>

          {/* Pro plan */}
          <div style={{ background:'linear-gradient(135deg,rgba(217,119,6,0.12),rgba(180,83,9,0.08))', border:`2px solid ${isPro ? 'rgba(217,119,6,0.6)' : 'rgba(217,119,6,0.35)'}`, borderRadius:20, padding:28, position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:14, right:14, fontSize:10, fontWeight:800, color:'#0a0f1e', background:'linear-gradient(135deg,#fbbf24,#f59e0b)', borderRadius:20, padding:'3px 10px' }}>
              {isPro ? 'ACTIVE' : 'RECOMMENDED'}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <div style={{ fontSize:28 }}>⭐</div>
              <div>
                <div style={{ fontSize:16, fontWeight:800, color:'#f1f5f9' }}>Pro Plan</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                  <span style={{ fontSize:24, fontWeight:800, color:'#fbbf24' }}>₹999</span>
                  <span style={{ fontSize:12, color:'#64748b' }}>/month</span>
                </div>
              </div>
            </div>
            {FEATURES_PRO.map(f => (
              <div key={f} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:13, color:'#94a3b8' }}>{f}</span>
              </div>
            ))}
            {isPro && user?.plan_expires_at && (
              <div style={{ marginTop:16, background:'rgba(217,119,6,0.12)', border:'1px solid rgba(217,119,6,0.25)', borderRadius:8, padding:'8px 12px', fontSize:12, color:'#fbbf24' }}>
                ✓ Active until {new Date(user.plan_expires_at).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {isPro ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.2)', borderRadius:14, padding:'20px 28px', marginBottom:20, display:'inline-block' }}>
              <p style={{ color:'#fbbf24', fontWeight:700, fontSize:15, marginBottom:4 }}>You're on Pro 🎉</p>
              <p style={{ color:'#94a3b8', fontSize:13 }}>All Pro features are active on your account.</p>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center' }}>
              <button onClick={handleUpgrade} disabled={loading}
                style={{ background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff', border:'none', borderRadius:12, padding:'12px 28px', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8 }}>
                {loading ? <Spinner size={16} color="#fff"/> : '↻ Renew / Extend — ₹999'}
              </button>
              <button onClick={() => router.push('/dashboard')}
                style={{ background:'rgba(255,255,255,0.06)', color:'#94a3b8', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 24px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:14, padding:'16px 24px', marginBottom:24, display:'inline-block' }}>
              <p style={{ color:'#64748b', fontSize:13 }}>Secure payment powered by Razorpay · Cancel anytime</p>
            </div>
            <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={handleUpgrade} disabled={loading}
                style={{ background:'linear-gradient(135deg,#d97706,#b45309)', color:'#fff', border:'none', borderRadius:12, padding:'14px 36px', fontSize:16, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:10, boxShadow:'0 8px 24px rgba(217,119,6,0.3)' }}>
                {loading ? <Spinner size={18} color="#fff"/> : <>⭐ Upgrade to Pro — ₹999/mo</>}
              </button>
              {fromRegister ? (
                <button onClick={() => router.push('/dashboard')}
                  style={{ background:'rgba(255,255,255,0.04)', color:'#64748b', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 24px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  Continue with Free plan
                </button>
              ) : (
                <button onClick={() => router.back()}
                  style={{ background:'rgba(255,255,255,0.04)', color:'#64748b', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'14px 24px', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  Maybe later
                </button>
              )}
            </div>
            <p style={{ marginTop:16, fontSize:12, color:'#475569' }}>
              After payment your account upgrades instantly. No hidden fees.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeInner />
    </Suspense>
  );
}
