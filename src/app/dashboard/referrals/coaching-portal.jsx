'use client';
import { useState, useEffect } from 'react';
import { Spinner, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';

export default function CoachingReferralPortal() {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoadingProfile(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/admin/referral/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProfile(data.data);
    } catch (err) {
      showToast(err.message || 'Failed to load referral details', 'error');
    } finally {
      setLoadingProfile(false);
    }
  }

  function handleCopy() {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    showToast('Coaching referral code copied!');
  }

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={32} color="#7c3aed" />
      </div>
    );
  }

  // LOCKED STATE: Require at least one subscription to activate
  if (profile && !profile.referralSystemActivated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div className="referral-card-locked" style={{ ...S.card, maxWidth: 540, width: '100%', textAlign: 'center', border: '1px dashed rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.02)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(124,58,237,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#a78bfa' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#a78bfa', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            Referral Program Locked
          </h3>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: '1.6', marginBottom: 24 }}>
            Upgrade your coaching account to any Paid Plan to activate the Referral Partner Program. Once activated, the program is unlocked forever!
          </p>
          <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', padding: '12px 24px', width: '100%', justifyContent: 'center' }}>
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  const isActive = profile.isActiveSubscription;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Upper overview section */}
      <div className="referral-grid">
        
        {/* Referral Card Info */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,0,0,0.15))' }}>
          <div>
            <div style={{ display: 'inline-flex', background: 'rgba(124,58,237,0.15)', color: '#c084fc', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Coaching Partner Program Unlocked
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Grow Together, Save Fully</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: '1.6' }}>
              Share your coaching institute's unique referral link with other coaching institute administrators:
              <br/>
              • They get a <strong style={{ color: '#fff' }}>₹50 discount</strong> on their first billing cycle.
              <br/>
              • You get a <strong style={{ color: '#c084fc' }}>100% OFF Coupon</strong> to use on your next billing renewal — an entire month for free!
            </p>
            {!isActive && (
              <div style={{ marginTop: 12, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#f87171' }}>
                ⚠️ Your subscription has expired. You can copy your referral code and continue to refer others, but you will need to renew your subscription to redeem your earned coupons.
              </div>
            )}
          </div>

          {/* Referral code */}
          <div style={{ marginTop: 24 }}>
            <label style={S.label}>Your Institute Referral Code</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '11px 16px', fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '1px', display: 'flex', alignItems: 'center' }}>
                {profile.referralCode}
              </div>
              <button onClick={handleCopy} style={{ ...S.btnGhost, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </div>
          </div>
        </div>

        {/* Plan status overview */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `4px solid ${isActive ? '#7c3aed' : '#dc2626'}` }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: 0 }}>{isActive ? 'Active Subscription' : 'Subscription Status'}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div style={{ width: 44, height: 44, background: isActive ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: isActive ? '#4ade80' : '#f87171' }}>
                {isActive ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{isActive ? 'Paid Pro Plan' : 'Plan Expired'}</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{isActive ? 'Renewing Monthly (₹999/mo)' : 'Free Tier — Upgrade to resume referrals'}</div>
              </div>
            </div>

            {profile.planExpiresAt && (
              <div style={{ marginTop: 24, padding: 12, background: 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(255,255,255,0.06)' : 'rgba(220,38,38,0.12)'}`, borderRadius: 10, fontSize: 13, color: '#cbd5e1' }}>
                {isActive ? 'Valid until: ' : 'Expired on: '}
                <strong style={{ color: isActive ? '#fff' : '#f87171' }}>{new Date(profile.planExpiresAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</strong>
              </div>
            )}
          </div>

          {!isActive && (
            <button onClick={() => window.location.href = '/dashboard/upgrade'} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', padding: '12px 24px', marginTop: 20, justifyContent: 'center', width: '100%' }}>
              Upgrade / Renew Subscription
            </button>
          )}

          {isActive && (
            <div style={{ fontSize: 11, color: '#64748b', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
              Use your earned reward coupons during your next renewal on the upgrade page.
            </div>
          )}
        </div>
      </div>

      {/* Coupons and referrals breakdown */}
      <div className="referral-grid">
        
        {/* Coupons Library */}
        <div style={S.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h4 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Reward Coupons</h4>
            {profile.coupons.length > 0 && (
              <span style={{ fontSize: 11, color: '#94a3b8', background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 12 }}>
                {profile.coupons.filter(c => c.status === 'unused').length} unused
              </span>
            )}
          </div>
          
          {profile.coupons.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0', fontSize: 13 }}>
              No coupons generated yet. Coupons will appear here once another coaching admin subscribes using your code!
            </div>
          ) : (
            <>
              {/* Info about how to use coupons */}
              <div style={{ background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#c084fc', lineHeight: '1.5' }}>
                💡 To use a coupon, go to the <strong>Upgrade / Renew</strong> page and enter your coupon code in the promo code section. Each coupon gives you a <strong>free month extension</strong>.
              </div>

              <div className="table-wrap">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Coupon Code</th>
                      <th style={S.th}>Reward</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile.coupons.map((c) => (
                      <tr key={c.id}>
                        <td style={S.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <code style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: 4, color: c.status === 'unused' ? '#c084fc' : '#64748b', fontWeight: 700, fontSize: 12 }}>{c.code}</code>
                            {c.status === 'unused' && (
                              <button onClick={() => { navigator.clipboard.writeText(c.code); showToast('Coupon code copied!'); }} 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#64748b', display: 'flex', alignItems: 'center' }}
                                title="Copy coupon code">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                              </button>
                            )}
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={{ fontSize: 13, color: '#cbd5e1' }}>100% OFF Month</span>
                        </td>
                        <td style={S.td}>
                          <span style={S.badge(c.status === 'unused' ? 'green' : c.status === 'used' ? 'gray' : 'red')}>
                            {c.status === 'unused' ? '● Available' : c.status === 'used' ? '✓ Used' : '✗ Expired'}
                          </span>
                        </td>
                        <td style={S.td}>
                          {c.status === 'unused' ? (
                            <span style={{ fontSize: 11, color: '#94a3b8' }}>
                              Ready to use at renewal
                            </span>
                          ) : c.status === 'used' ? (
                            <span style={{ fontSize: 11, color: '#64748b' }}>
                              Used {c.used_at ? new Date(c.used_at).toLocaleDateString() : ''}
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, color: '#64748b' }}>
                              Expired {c.expiry_at ? new Date(c.expiry_at).toLocaleDateString() : ''}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Referred Coachings timeline */}
        <div style={S.card}>
          <h4 style={{ fontSize: 16, fontWeight: 800, marginTop: 0, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Referral Activity</h4>
          
          {profile.referrals.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 0', fontSize: 13 }}>
              No referral activity yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {profile.referrals.map((ref) => (
                <div key={ref.id} className="referral-activity-card" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{ref.coaching_name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Administrator: {ref.admin_name}</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Joined: {new Date(ref.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={S.badge(ref.status === 'completed' ? 'green' : 'yellow')}>
                      {ref.status === 'completed' ? 'Verified' : 'Pending Upgrade'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
