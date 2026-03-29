'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { FormInput, Spinner, showToast, PageHeader } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import { S } from '../../lib/styles';
import api from '../../lib/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [fetchedUser, setFetchedUser] = useState(null);

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    coaching_name: user?.coaching_name || '', subject: user?.subject || '', qualification: user?.qualification || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passForm, setPassForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [savingPass, setSavingPass] = useState(false);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Fetch fresh data so phone/subject/qualification are populated
  useEffect(() => {
    api.getMe().then(r => {
      const fresh = { ...r.data, role: user?.role };
      setFetchedUser(fresh);
      setProfileForm({
        name: fresh.name || '', email: fresh.email || '', phone: fresh.phone || '',
        coaching_name: fresh.coaching_name || '', subject: fresh.subject || '', qualification: fresh.qualification || '',
      });
    }).catch(() => {});
  }, []);

  const displayed = fetchedUser || user;
  const setPF = k => e => setProfileForm(f => ({ ...f, [k]: e.target.value }));
  const setPW = k => e => setPassForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSaveProfile(e) {
    e.preventDefault(); setSavingProfile(true);
    try {
      await api.put('/auth/profile', profileForm);
      updateUser({ ...profileForm });
      setFetchedUser(f => ({ ...f, ...profileForm }));
      showToast('Profile updated successfully');
    } catch (err) { showToast(err.message || 'Failed to update profile', 'error'); }
    finally { setSavingProfile(false); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    if (passForm.new_password.length < 8) return showToast('Password must be at least 8 characters', 'error');
    if (passForm.new_password !== passForm.confirm_password) return showToast('Passwords do not match', 'error');
    setSavingPass(true);
    try {
      await api.changePassword({ current_password: passForm.current_password, new_password: passForm.new_password });
      showToast('Password changed successfully');
      setPassForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) { showToast(err.message || 'Failed to change password', 'error'); }
    finally { setSavingPass(false); }
  }

  const roleColors = { admin: '#2563eb', teacher: '#7c3aed', student: '#0891b2' };
  const roleColor = roleColors[user?.role] || '#2563eb';

  return (
    <DashboardLayout>
      <PageHeader title="My Profile" subtitle="Manage your account details and security" />
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }} className="two-col-grid">
        {/* Left Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
            <div style={{ width: 88, height: 88, background: `linear-gradient(135deg,${roleColor},${roleColor}88)`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 36, margin: '0 auto', boxShadow: `0 0 30px ${roleColor}44` }}>
              {displayed?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ position: 'absolute', bottom: 2, right: 2, width: 22, height: 22, background: '#16a34a', borderRadius: '50%', border: '2px solid #0a0f1e' }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>{displayed?.name}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${roleColor}18`, border: `1px solid ${roleColor}44`, borderRadius: 999, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: roleColor, textTransform: 'capitalize', marginBottom: 20 }}>
            {user?.role}{user?.plan === 'paid' && <span style={{ color: '#fbbf24' }}> · Pro</span>}
          </div>
          <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20 }}>
            {[
              { icon: '✉', label: 'Email', value: displayed?.email },
              { icon: '📞', label: 'Phone', value: displayed?.phone || '—' },
              displayed?.coaching_name && { icon: '🏫', label: 'Coaching', value: displayed?.coaching_name },
              displayed?.subject && { icon: '📚', label: 'Subject', value: displayed?.subject },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{row.icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 1, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1', wordBreak: 'break-all' }}>{row.value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Plan badge — admin only */}
          {user?.role === 'admin' && (
            <div style={{ marginTop: 8, background: user?.plan === 'paid' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${user?.plan === 'paid' ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: user?.plan === 'paid' ? '#fbbf24' : '#94a3b8' }}>{user?.plan === 'paid' ? 'Pro Plan' : 'Free Plan'}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{user?.plan === 'paid' ? '₹999/month' : 'Basic access'}</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Tabs */}
        <div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
            {[{ key: 'profile', label: 'Profile Details' }, { key: 'password', label: 'Change Password' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ padding: '9px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', background: activeTab === tab.key ? 'rgba(37,99,235,0.2)' : 'transparent', color: activeTab === tab.key ? '#60a5fa' : '#64748b', transition: 'all 0.2s' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 24 }}>Personal Information</h3>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }} className="form-grid-2">
                  <FormInput label="Full Name *" value={profileForm.name} onChange={setPF('name')} required />
                  <FormInput label="Email Address" type="email" value={profileForm.email} disabled />
                  <FormInput label="Phone Number" value={profileForm.phone} onChange={setPF('phone')} placeholder="9876543210" />
                  {user?.role === 'admin' && <FormInput label="Coaching Name" value={profileForm.coaching_name} onChange={setPF('coaching_name')} />}
                  {user?.role === 'teacher' && <>
                    <FormInput label="Subject" value={profileForm.subject} onChange={setPF('subject')} placeholder="e.g. Mathematics" />
                    <FormInput label="Qualification" value={profileForm.qualification} onChange={setPF('qualification')} placeholder="e.g. M.Sc, B.Ed" />
                  </>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button type="submit" style={S.btnPrimary} disabled={savingProfile}>
                    {savingProfile ? <Spinner size={16} color="#fff" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'password' && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Change Password</h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>At least 8 characters with uppercase, number and symbol.</p>
              <form onSubmit={handleChangePassword}>
                {[
                  { label: 'Current Password *', key: 'current_password', vis: 'current' },
                  { label: 'New Password *', key: 'new_password', vis: 'new' },
                  { label: 'Confirm New Password *', key: 'confirm_password', vis: 'confirm' },
                ].map(({ label, key, vis }) => (
                  <div key={key} style={{ marginBottom: 18 }}>
                    <label style={S.label}>{label}</label>
                    <div style={{ position: 'relative' }}>
                      <input type={showPwd[vis] ? 'text' : 'password'} value={passForm[key]} onChange={setPW(key)} required className="cp-input" style={{ ...S.input, paddingRight: 44 }} />
                      <button type="button" onClick={() => setShowPwd(s => ({ ...s, [vis]: !s[vis] }))} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        {showPwd[vis] ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        )}
                      </button>
                    </div>
                    {key === 'new_password' && passForm.new_password && passForm.new_password.length < 8 && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>At least 8 characters</p>}
                    {key === 'confirm_password' && passForm.confirm_password && passForm.new_password !== passForm.confirm_password && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>Passwords do not match</p>}
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" style={S.btnPrimary} disabled={savingPass}>{savingPass ? <Spinner size={16} color="#fff" /> : 'Update Password'}</button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
