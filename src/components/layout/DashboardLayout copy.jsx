'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ToastContainer } from '../ui/index';

// ── Professional SVG icon set (no emoji/cartoon icons) ────────
const NavIcons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
    </svg>
  ),
  teachers: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  classes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  ),
  batches: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
    </svg>
  ),
  schedule: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  fees: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  payments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  ),
  materials: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
    </svg>
  ),
};

const navItems = {
  admin: [
    { href: '/dashboard', icon: NavIcons.dashboard, label: 'Dashboard' },
    { href: '/dashboard/students', icon: NavIcons.students, label: 'Students' },
    { href: '/dashboard/teachers', icon: NavIcons.teachers, label: 'Teachers' },
    { href: '/dashboard/classes', icon: NavIcons.classes, label: 'Classes' },
    { href: '/dashboard/batches', icon: NavIcons.batches, label: 'Batches' },
    { href: '/dashboard/schedule', icon: NavIcons.schedule, label: 'Time Table' },
    { href: '/dashboard/attendance', icon: NavIcons.attendance, label: 'Attendance' },
    { href: '/dashboard/fees', icon: NavIcons.fees, label: 'Fees' },
    { href: '/dashboard/payments', icon: NavIcons.payments, label: 'Teacher Pay' },
    { href: '/dashboard/materials', icon: NavIcons.materials, label: 'Materials' },
  ],
  teacher: [
    { href: '/dashboard', icon: NavIcons.dashboard, label: 'Dashboard' },
    { href: '/dashboard/schedule', icon: NavIcons.schedule, label: 'Time Table' },
    { href: '/dashboard/attendance', icon: NavIcons.attendance, label: 'Attendance' },
    { href: '/dashboard/materials', icon: NavIcons.materials, label: 'Materials' },
    { href: '/dashboard/payments', icon: NavIcons.payments, label: 'My Payments' },
  ],
  student: [
    { href: '/dashboard', icon: NavIcons.dashboard, label: 'Dashboard' },
    { href: '/dashboard/schedule', icon: NavIcons.schedule, label: 'Time Table' },
    { href: '/dashboard/attendance', icon: NavIcons.attendance, label: 'Attendance' },
    { href: '/dashboard/fees', icon: NavIcons.fees, label: 'My Fees' },
    { href: '/dashboard/materials', icon: NavIcons.materials, label: 'Materials' },
  ],
};

export default function DashboardLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      const isMobile = window.innerWidth < 768;
      setMobile(isMobile);
      if (isMobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Prefetch all nav links for instant navigation (fixes slow redirect issue)
  const items = navItems[user?.role] || navItems.admin;
  useEffect(() => {
    items.forEach(item => router.prefetch(item.href));
    router.prefetch('/profile');
  }, [router]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;

  const sidebarW = sidebarOpen ? 240 : 64;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <ToastContainer />

      {/* Sidebar */}
      <aside style={{
        width: sidebarW, minHeight: '100vh', background: '#080d1a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        position: mobile ? 'fixed' : 'sticky',
        top: 0, left: mobile && !sidebarOpen ? -sidebarW : 0,
        zIndex: 200, transition: 'all 0.3s ease', overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: sidebarOpen ? '20px 20px 16px' : '20px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>C</div>
          {sidebarOpen && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif", whiteSpace: 'nowrap' }}>Coachstra</div>
              <div style={{ fontSize: 11, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{user.coaching_name}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {items.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => mobile && setSidebarOpen(false)}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: sidebarOpen ? '10px 12px' : '10px', borderRadius: 10, marginBottom: 2,
                  background: active ? 'rgba(37,99,235,0.15)' : 'transparent',
                  color: active ? '#60a5fa' : '#64748b',
                  borderLeft: active ? '2px solid #2563eb' : '2px solid transparent',
                  transition: 'all 0.2s', cursor: 'pointer',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; } }}
                >
                  <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                  {sidebarOpen && <span style={{ fontSize: 14, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {sidebarOpen && (
            <Link href="/profile" style={{ textDecoration: 'none', display: 'block' }} onClick={() => mobile && setSidebarOpen(false)}>
              <div style={{ padding: '10px 12px', marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>
                  {user.role} {user.plan === 'paid' && <span style={{ color: '#fbbf24' }}>· Pro</span>}
                </div>
              </div>
            </Link>
          )}
          <button onClick={logout} style={{
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: sidebarOpen ? 'flex-start' : 'center',
            width: '100%', padding: sidebarOpen ? '9px 12px' : '9px',
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)',
            borderRadius: 10, color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobile && sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ height: 60, background: 'rgba(8,13,26,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {sidebarOpen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user.role === 'admin' && user.plan === 'free' && (
              <Link href="/dashboard/upgrade" style={{ background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <span>Upgrade ₹999/mo</span>
              </Link>
            )}
            {/* Profile avatar — click to go to profile page */}
            <Link href="/profile" title="View Profile" style={{ textDecoration: 'none' }}>
              <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'opacity 0.2s', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {user.name?.[0]?.toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="dash-main" style={{ flex: 1, padding: '32px 28px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
