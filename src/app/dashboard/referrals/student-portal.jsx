'use client';
import { useState, useEffect } from 'react';
import { Spinner, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';

export default function StudentReferralPortal() {
  const [profile, setProfile] = useState(null);
  const [upiInput, setUpiInput] = useState('');
  const [timeline, setTimeline] = useState({ referrals: [], transactions: [], redeemRequests: [] });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(true);
  const [submittingUpi, setSubmittingUpi] = useState(false);
  const [submittingRedeem, setSubmittingRedeem] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile && !profile.isLocked) {
      fetchTimeline();
    }
  }, [profile]);

  async function fetchProfile() {
    setLoadingProfile(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/student/referral/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setProfile(data.data);
      if (data.data.upiId) {
        setUpiInput(data.data.upiId);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load referral details', 'error');
    } finally {
      setLoadingProfile(false);
    }
  }

  async function fetchTimeline() {
    setLoadingTimeline(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/student/referral/timeline`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setTimeline(data.data);
    } catch (err) {
      showToast(err.message || 'Failed to load referral logs', 'error');
    } finally {
      setLoadingTimeline(false);
    }
  }

  async function handleLinkUPI(e) {
    e.preventDefault();
    if (!upiInput) {
      return showToast('UPI ID cannot be blank', 'error');
    }

    setSubmittingUpi(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/student/referral/upi`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ upiId: upiInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('UPI ID configured! Referral code unlocked.');
      fetchProfile();
    } catch (err) {
      showToast(err.message || 'UPI configuration failed', 'error');
    } finally {
      setSubmittingUpi(false);
    }
  }

  async function handleRedeem() {
    setSubmittingRedeem(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/student/referral/redeem`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Redemption request submitted! ₹50 debited.');
      fetchProfile();
      fetchTimeline();
    } catch (err) {
      showToast(err.message || 'Redemption request failed', 'error');
    } finally {
      setSubmittingRedeem(false);
    }
  }

  function handleCopy() {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    showToast('Referral code copied to clipboard!');
  }

  if (loadingProfile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
        <Spinner size={32} color="#0891b2" />
      </div>
    );
  }

  // LOCKED STATE 1: Coaching Subscription Inactive
  if (profile && !profile.isCoachingSubscriptionActive) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div className="referral-card-locked" style={{ ...S.card, maxWidth: 540, width: '100%', textAlign: 'center', border: '1px dashed rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.02)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(220,38,38,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#f87171' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f87171', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            Referral Program Locked
          </h3>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: '1.6', marginBottom: 16 }}>
            The student referral program is temporarily locked because your coaching institute's premium subscription is expired or inactive.
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: '1.6' }}>
            Once your coaching administrator renews their subscription, this page will automatically unlock, and you can resume sharing your referral code to earn reward points.
          </p>
        </div>
      </div>
    );
  }

  // LOCKED STATE 2: Require UPI ID setup
  if (profile.isLocked) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
        <div className="referral-card-locked" style={{ ...S.card, maxWidth: 540, width: '100%', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.15)' }}>
          <div style={{ width: 64, height: 64, background: 'rgba(8,145,178,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 12, fontFamily: "'Space Grotesk', sans-serif" }}>
            Referral System Locked
          </h3>
          <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: '1.6', marginBottom: 32 }}>
            Link a secure UPI ID to unlock your personalized referral code! Share it with new coaching institutes to earn ₹50 points once they complete their first subscription.
          </p>

          <form onSubmit={handleLinkUPI}>
            <div style={{ marginBottom: 20, textAlign: 'left' }}>
              <label style={S.label}>Your UPI Address (e.g. name@paytm)</label>
              <input
                type="text"
                placeholder="username@bank"
                value={upiInput}
                onChange={e => setUpiInput(e.target.value)}
                required
                style={{ ...S.input, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
            </div>
            <button type="submit" disabled={submittingUpi} style={{ ...S.btnPrimary, background: 'linear-gradient(135deg, #0891b2, #06b6d4)', width: '100%', padding: '12px' }}>
              {submittingUpi ? <Spinner size={16} color="#fff" /> : 'Unlock My Referral Code'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // UNLOCKED STATE
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Overview Block */}
      <div className="referral-grid-student-overview">
        
        {/* Referral code card */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(8,145,178,0.08), rgba(0,0,0,0.1))' }}>
          <div>
            <div style={{ display: 'inline-flex', background: 'rgba(8,145,178,0.15)', color: '#22d3ee', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>
              Referral Program Active
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Invite Coachings & Earn</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 8, lineHeight: '1.5' }}>
              When a new coaching institute signs up and upgrades to a Paid Plan for the first time using your code:
              <br/>
              • They get a <strong style={{ color: '#fff' }}>₹50 discount</strong> on their first subscription.
              <br/>
              • You earn <strong style={{ color: '#22d3ee' }}>₹50 referral points</strong>, redeemable directly to your UPI.
            </p>
          </div>

          <div style={{ marginTop: 24 }}>
            <label style={S.label}>Share Referral Code</label>
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

        {/* Wallet balance card */}
        <div style={{ ...S.card, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: '4px solid #0891b2' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#94a3b8', margin: 0 }}>Referral Wallet</h3>
            <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginTop: 12, display: 'flex', alignItems: 'baseline', gap: 4 }}>
              ₹{profile.wallet.balance}
              <span style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>Balance</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TOTAL EARNED</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#cbd5e1', marginTop: 2 }}>₹{profile.wallet.totalEarned}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>TOTAL REDEEMED</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#cbd5e1', marginTop: 2 }}>₹{profile.wallet.totalRedeemed}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>PAYOUT TARGET UPI</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>{profile.upiId}</span>
            </div>
            
            <button
              onClick={handleRedeem}
              disabled={profile.wallet.balance < 50 || submittingRedeem}
              style={{
                ...S.btnPrimary,
                background: profile.wallet.balance >= 50 ? 'linear-gradient(135deg, #0891b2, #06b6d4)' : 'rgba(255,255,255,0.03)',
                color: profile.wallet.balance >= 50 ? '#fff' : '#475569',
                cursor: profile.wallet.balance >= 50 ? 'pointer' : 'not-allowed',
                padding: '12px',
                width: '100%',
                fontWeight: 700
              }}
            >
              {submittingRedeem ? <Spinner size={16} color="#fff" /> : profile.wallet.balance >= 50 ? 'Redeem ₹50 Points' : 'Min. Balance for Payout: ₹50'}
            </button>
          </div>
        </div>
      </div>

      {/* History timelines */}
      <div className="referral-grid-equal">
        
        {/* Referrals Usage History */}
        <div style={S.card}>
          <h4 style={{ fontSize: 16, fontWeight: 800, marginTop: 0, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Referral Usage Timeline</h4>
          
          {loadingTimeline ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}><Spinner size={18} color="#0891b2" /></div>
          ) : timeline.referrals.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: 13 }}>
              No referral usages yet. Your referrals will appear here once they complete their purchases!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {timeline.referrals.map((ref) => (
                <div key={ref.id} className="referral-activity-card" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{ref.coaching_name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Admin: {ref.admin_name}</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Date: {new Date(ref.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 14 }}>+₹{ref.points_earned}</span>
                    <span style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>Status: Completed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem requests timeline */}
        <div style={S.card}>
          <h4 style={{ fontSize: 16, fontWeight: 800, marginTop: 0, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Redeem Request Logs</h4>
          
          {loadingTimeline ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}><Spinner size={18} color="#0891b2" /></div>
          ) : timeline.redeemRequests.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px 0', fontSize: 13 }}>
              No redemption requests submitted yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {timeline.redeemRequests.map((rr) => (
                <div key={rr.id} className="referral-activity-card" style={{ padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Redeem Request</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>UPI: {rr.upi_id}</div>
                    {rr.remarks && <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>Remarks: {rr.remarks}</div>}
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Requested: {new Date(rr.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={{ color: '#f87171', fontWeight: 700, fontSize: 14 }}>-₹{rr.amount}</span>
                    <span style={{ ...S.badge(rr.status === 'pending' ? 'yellow' : rr.status === 'approved' ? 'green' : 'red'), marginTop: 4 }}>
                      {rr.status}
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
