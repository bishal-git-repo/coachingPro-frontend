'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner, ToastContainer, showToast } from '../../../components/ui/index';
import { S, colors } from '../../../lib/styles';

export default function SuperAdminDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentRegs, setRecentRegs] = useState([]);
  const [redeemRequests, setRedeemRequests] = useState([]);
  const [redeemPage, setRedeemPage] = useState(1);
  const [redeemPages, setRedeemPages] = useState(1);
  const [redeemFilter, setRedeemFilter] = useState('pending');
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRedeems, setLoadingRedeems] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const router = useRouter();

  useEffect(() => {
    // 1. Session check
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (!storedUser || !token) {
      router.push('/super-admin-login-9384');
      return;
    }
    
    try {
      const u = JSON.parse(storedUser);
      if (u.role !== 'super-admin') {
        router.push('/super-admin-login-9384');
        return;
      }
      setUser(u);
    } catch {
      router.push('/super-admin-login-9384');
      return;
    }
  }, [router]);

  // Load stats & recent registrations
  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

  // Load redeem requests whenever filter/page changes
  useEffect(() => {
    if (!user) return;
    fetchRedeemRequests();
  }, [user, redeemFilter, redeemPage]);

  async function fetchStats() {
    setLoadingStats(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/super-admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStats(data.data.stats);
      setRecentRegs(data.data.recentRegistrations);
    } catch (err) {
      showToast(err.message || 'Failed to fetch dashboard metrics', 'error');
    } finally {
      setLoadingStats(false);
    }
  }

  async function fetchRedeemRequests() {
    setLoadingRedeems(true);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/super-admin/redeem-requests?status=${redeemFilter}&page=${redeemPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setRedeemRequests(data.data);
      setRedeemPages(data.pages || 1);
    } catch (err) {
      showToast(err.message || 'Failed to load redemption requests', 'error');
    } finally {
      setLoadingRedeems(false);
    }
  }

  async function handleApprove(requestId) {
    setProcessingId(requestId);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/super-admin/redeem-requests/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ remarks: remarks[requestId] || 'Approved by Super Admin' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Redemption request approved and paid successfully!');
      fetchRedeemRequests();
      fetchStats(); // update pending stats
    } catch (err) {
      showToast(err.message || 'Approval failed', 'error');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(requestId) {
    setProcessingId(requestId);
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BASE_URL}/super-admin/redeem-requests/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ remarks: remarks[requestId] || 'Rejected by Super Admin' })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast('Redemption request rejected and points refunded.');
      fetchRedeemRequests();
      fetchStats();
    } catch (err) {
      showToast(err.message || 'Rejection failed', 'error');
    } finally {
      setProcessingId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/super-admin-login-9384');
  }

  if (!user || loadingStats) {
    return (
      <div style={{ minHeight: '100vh', background: '#080d1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spinner size={36} color="#ef4444" />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ToastContainer />

      {/* Header bar */}
      <header style={{ height: 70, background: '#080d1a', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#dc2626,#f43f5e)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#fff' }}>S</div>
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Super Admin Panel</h1>
            <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Controller Portal</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: '#94a3b8' }}>Logged in as: <strong style={{ color: '#ef4444' }}>{user.name}</strong></span>
          <button onClick={handleLogout} style={{ ...S.btnDanger, padding: '7px 14px', fontSize: 12 }}>
            Exit Session
          </button>
        </div>
      </header>

      {/* Stats Section */}
      <main style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
        <h2 style={{ ...S.pageTitle, fontSize: 22, marginBottom: 24 }}>System Statistics</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div style={{ ...S.card, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Coachings</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 8 }}>{stats?.totalCoachings}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{stats?.paidCoachings} Paid</span> · {stats?.freeCoachings} Free
            </div>
          </div>

          <div style={{ ...S.card, borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription Activity</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 8 }}>{stats?.activeSubscriptions}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>
              Active Paid · <span style={{ color: '#f87171' }}>{stats?.expiredSubscriptions} Expired</span>
            </div>
          </div>

          <div style={{ ...S.card, borderLeft: '4px solid #a78bfa' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Enrolled Students</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 8 }}>{stats?.totalStudents}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Across all registered institutes</div>
          </div>

          <div style={{ ...S.card, borderLeft: '4px solid #06b6d4' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Registered Teachers</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginTop: 8 }}>{stats?.totalTeachers}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Staffing system-wide</div>
          </div>

          <div style={{ ...S.card, borderLeft: '4px solid #fbbf24' }}>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', marginTop: 8 }}>₹{stats?.totalEarnings?.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Paid system subscriptions</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 32, alignItems: 'start' }}>
          {/* Redeem requests grid */}
          <div style={S.card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, fontFamily: "'Space Grotesk', sans-serif" }}>Redeem Request Portal</h3>
              
              <div style={{ display: 'flex', gap: 8 }}>
                {['pending', 'approved', 'rejected', 'all'].map((filter) => (
                  <button key={filter} onClick={() => { setRedeemFilter(filter); setRedeemPage(1); }} style={{
                    ...S.btnGhost,
                    padding: '6px 12px',
                    fontSize: 12,
                    background: redeemFilter === filter ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                    color: redeemFilter === filter ? '#60a5fa' : '#64748b',
                    borderColor: redeemFilter === filter ? 'rgba(37,99,235,0.3)' : 'transparent',
                    textTransform: 'capitalize'
                  }}>
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {loadingRedeems ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Spinner size={24} color="#60a5fa" />
              </div>
            ) : redeemRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                No redeem requests found in this category.
              </div>
            ) : (
              <div>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={S.th}>Student</th>
                      <th style={S.th}>Coaching</th>
                      <th style={S.th}>Amount</th>
                      <th style={S.th}>UPI ID</th>
                      <th style={S.th}>Status</th>
                      <th style={S.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redeemRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{req.student_name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{req.student_email}</div>
                        </td>
                        <td style={S.td}>
                          <span style={{ fontSize: 13, color: '#94a3b8' }}>{req.student_coaching}</span>
                        </td>
                        <td style={S.td}>
                          <strong style={{ color: '#4ade80' }}>₹{req.amount}</strong>
                        </td>
                        <td style={S.td}>
                          <code style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{req.upi_id}</code>
                        </td>
                        <td style={S.td}>
                          <span style={S.badge(req.status === 'pending' ? 'yellow' : req.status === 'approved' ? 'green' : 'red')}>
                            {req.status}
                          </span>
                        </td>
                        <td style={S.td}>
                          {req.status === 'pending' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <input
                                type="text"
                                placeholder="Payout remarks..."
                                value={remarks[req.id] || ''}
                                onChange={e => setRemarks({ ...remarks, [req.id]: e.target.value })}
                                style={{
                                  background: 'rgba(255,255,255,0.03)',
                                  border: '1px solid rgba(255,255,255,0.08)',
                                  color: '#fff',
                                  fontSize: 11,
                                  padding: '4px 8px',
                                  borderRadius: 6,
                                  outline: 'none',
                                  width: 140
                                }}
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  disabled={processingId !== null}
                                  style={{
                                    background: '#16a34a',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '4px 8px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  disabled={processingId !== null}
                                  style={{
                                    background: '#dc2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 6,
                                    padding: '4px 8px',
                                    fontSize: 11,
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#64748b' }}>
                              {req.remarks || 'No remarks'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {redeemPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 20 }}>
                    <button
                      disabled={redeemPage === 1}
                      onClick={() => setRedeemPage(p => p - 1)}
                      style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}
                    >
                      Prev
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, color: '#64748b' }}>
                      Page {redeemPage} of {redeemPages}
                    </span>
                    <button
                      disabled={redeemPage === redeemPages}
                      onClick={() => setRedeemPage(p => p + 1)}
                      style={{ ...S.btnGhost, padding: '4px 10px', fontSize: 11 }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent registrations list */}
          <div style={S.card}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginTop: 0, marginBottom: 20, fontFamily: "'Space Grotesk', sans-serif" }}>Recent Registrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentRegs.map((reg) => (
                <div key={reg.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{reg.coaching_name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Admin: {reg.name} ({reg.email})</div>
                    <div style={{ fontSize: 10, color: '#475569', marginTop: 4 }}>Registered: {new Date(reg.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                    <span style={S.badge(reg.plan === 'paid' ? 'green' : 'gray')}>
                      {reg.plan === 'paid' ? 'Paid Plan' : 'Free Trial'}
                    </span>
                    {reg.plan === 'paid' && reg.plan_expires_at && (
                      <span style={{ fontSize: 10, color: '#64748b', marginTop: 4 }}>
                        Exp: {new Date(reg.plan_expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
