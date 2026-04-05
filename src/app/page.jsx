'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let startTime;
        const step = (ts) => {
          if (!startTime) startTime = ts;
          const p = Math.min((ts - startTime) / duration, 1);
          const e = 1 - Math.pow(1 - p, 3);
          setCount(Math.floor(e * end));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const S = {
  // Layout
  page: { minHeight: '100vh', background: '#0a0f1e', color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  containerSm: { maxWidth: 900, margin: '0 auto', padding: '0 24px' },

  // Glass
  glass: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 },

  // Text
  gradientText: { background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  displayFont: { fontFamily: "'Space Grotesk', sans-serif" },

  // Buttons
  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #2563eb, #4f46e5)', color: '#fff', fontWeight: 700, padding: '14px 32px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 16, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 8px 32px rgba(37,99,235,0.3)' },
  btnGlass: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: '#fff', fontWeight: 600, padding: '14px 32px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', fontSize: 16, textDecoration: 'none', transition: 'all 0.2s' },

  // Sections
  section: { padding: '100px 0' },
  sectionAlt: { padding: '100px 0', background: 'rgba(255,255,255,0.02)' },

  // Cards
  card: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px', transition: 'all 0.3s' },

  // Tags
  badge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999, padding: '8px 18px', fontSize: 13, color: '#93c5fd', marginBottom: 20 },
};

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const features = [
    { icon: '📚', title: 'Classes & Batches', desc: 'Organize students into structured classes and time-slot batches with ease.' },
    { icon: '👥', title: 'Student & Teacher Management', desc: 'Add, track and manage profiles. Send login credentials automatically via email.' },
    { icon: '📅', title: 'Schedule & Timetable', desc: 'Plan classes in advance, set meeting links, and track upcoming sessions.' },
    { icon: '✅', title: 'Attendance Tracking', desc: 'Mark present/absent for students and teachers per session with full reports.' },
    { icon: '💰', title: 'Fees Management', desc: 'Generate fee slips, track payments, send receipts by email and download as PDF.' },
    { icon: '🎬', title: 'Study Materials', desc: 'Upload PDFs and MP4 videos. Students can watch videos right inside the portal.' },
    // { icon: '💳', title: 'Online Payments', desc: "Collect fees online via Razorpay. Instant payment confirmation and receipts." },
    { icon: '📊', title: 'Analytics Dashboard', desc: 'Get a complete overview of collections, attendance rates, and performance.' },
  ];

  const steps = [
    { num: '01', icon: '🏛️', title: 'Register Your Coaching', desc: 'Sign up with your coaching name and start for free. No credit card required.' },
    { num: '02', icon: '👤', title: 'Add Teachers & Students', desc: 'Add staff and students. They receive login credentials via email automatically.' },
    { num: '03', icon: '📋', title: 'Create Classes & Batches', desc: 'Set up classes, batches, schedules, fees structure and study materials.' },
    { num: '04', icon: '🚀', title: 'Manage Everything', desc: 'Track attendance, collect fees, share materials, and monitor progress daily.' },
  ];

  const freePlanFeatures = [
    ['✅', 'Up to 50 Students'],
    ['✅', 'Up to 5 Teachers'],
    ['✅', 'Classes & Batches'],
    ['✅', 'Attendance Tracking'],
    ['✅', 'Study Materials (PDF & Video)'],
    ['✅', 'Schedule Management'],
    // ['❌', 'Online Fee Collection'],
    ['❌', 'Auto Fee Slip Email'],
    ['❌', 'Razorpay Integration'],
  ];

  const paidPlanFeatures = [
    ['✅', 'Unlimited Students'],
    ['✅', 'Unlimited Teachers'],
    ['✅', 'Everything in Free'],
    // ['✅', 'Online Fee Collection'],
    ['✅', 'Auto Fee Slip by Email'],
    ['✅', 'PDF Receipt Download'],
    // ['✅', 'Razorpay Integration'],
    ['✅', 'Priority Support'],
    ['✅', 'Advanced Analytics'],
  ];

  const testimonials = [
    { name: 'Rajesh Sharma', role: 'Director, Bright Future Academy', text: 'CoachingPro transformed how we manage 200+ students. Fee collection is now 100% digital.', av: 'RS' },
    { name: 'Priya Mehta', role: 'Owner, Excellence Coaching Center', text: 'The attendance tracking and automated fee slips save us hours every week. Absolutely love it!', av: 'PM' },
    { name: 'Amit Kumar', role: 'Principal, Career Launcher Institute', text: "Best investment for our coaching. Students love the online study material portal with video support.", av: 'AK' },
  ];

  return (
    <div style={S.page}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 24px',
        background: scrolled ? 'rgba(10,15,30,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 70 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, boxShadow: '0 0 20px rgba(37,99,235,0.4)' }}>C</div>
            <span style={{ ...S.displayFont, fontSize: 20, fontWeight: 700, ...S.gradientText }}>CoachingPro</span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 36, '@media(maxWidth:768px)': { display: 'none' } }} className="desktop-nav">
            {['Features', 'How It Works', 'Pricing'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = '#60a5fa'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                {item}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/login" style={{ color: '#94a3b8', fontSize: 14, fontWeight: 500, textDecoration: 'none', padding: '8px 16px' }}>Login</Link>
            <Link href="/register" style={{ ...S.btnPrimary, padding: '10px 22px', fontSize: 14 }}>Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 100, paddingBottom: 80,
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(96,165,250,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(167,139,250,0.08), transparent)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grid background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />

        {/* Blobs */}
        <div style={{ position: 'absolute', width: 400, height: 400, top: '5%', left: '-10%', background: 'radial-gradient(circle, rgba(96,165,250,0.15), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'floatBlob 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, bottom: '10%', right: '5%', background: 'radial-gradient(circle, rgba(167,139,250,0.12), transparent 70%)', borderRadius: '50%', filter: 'blur(40px)', animation: 'floatBlob 6s ease-in-out infinite reverse' }} />

        <div style={{ ...S.container, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={S.badge}>
            <span style={{ width: 8, height: 8, background: '#4ade80', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            Trusted by 500+ Coaching Institutes Across India
          </div>

          <h1 style={{ ...S.displayFont, fontSize: 'clamp(36px, 6vw, 72px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-1px' }}>
            Manage Your<br />
            <span style={S.gradientText}>Coaching Institute</span><br />
            Like a Pro
          </h1>

          <p style={{ fontSize: 18, color: '#94a3b8', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.7 }}>
            All-in-one platform for classes, batches, attendance, fees, study materials, and more.
            {/* Free to start — upgrade anytime for Razorpay payments. */}
            Free to start — upgrade anytime.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 80 }}>
            <Link href="/register" style={S.btnPrimary}>
              Start Free Today →
            </Link>
            <a href="#features" style={S.btnGlass}>
              See Features ↓
            </a>
          </div>

          {/* Dashboard mockup */}
          <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
            <div style={{ ...S.glass, borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(96,165,250,0.2)', boxShadow: '0 40px 80px rgba(0,0,0,0.5)', animation: 'floatMockup 6s ease-in-out infinite' }}>
              {/* Browser bar */}
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '5px 14px', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                  coachingpro.in/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div style={{ padding: 24, background: 'linear-gradient(135deg, #0f172a, #1e1b4b)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16 }}>
                  {/* Sidebar */}
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 }}>
                    <div style={{ height: 6, background: 'rgba(96,165,250,0.4)', borderRadius: 4, marginBottom: 16 }} />
                    {['Dashboard','Students','Teachers','Classes','Batches','Fees','Materials'].map((item, i) => (
                      <div key={item} style={{ padding: '8px 10px', borderRadius: 8, fontSize: 12, color: i === 5 ? '#60a5fa' : '#64748b', background: i === 5 ? 'rgba(96,165,250,0.1)' : 'transparent', marginBottom: 2 }}>{item}</div>
                    ))}
                  </div>
                  {/* Main area */}
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: 'Students', val: '248', icon: '👨‍🎓', color: 'rgba(96,165,250,0.15)' },
                        { label: 'Teachers', val: '12', icon: '👨‍🏫', color: 'rgba(167,139,250,0.15)' },
                        { label: 'Collected', val: '₹82K', icon: '💰', color: 'rgba(34,197,94,0.15)' },
                        { label: 'Attendance', val: '91%', icon: '✅', color: 'rgba(251,191,36,0.15)' },
                      ].map(card => (
                        <div key={card.label} style={{ background: card.color, borderRadius: 12, padding: 14 }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>{card.icon}</div>
                          <div style={{ fontWeight: 700, fontSize: 20, color: '#fff' }}>{card.val}</div>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{card.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Recent Students</div>
                        {['Rahul Verma','Ananya Singh','Karan Patel'].map(n => (
                          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(96,165,250,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{n[0]}</div>
                            <span style={{ fontSize: 12, color: '#cbd5e1' }}>{n}</span>
                            <div style={{ marginLeft: 'auto', width: 40, height: 4, background: 'rgba(34,197,94,0.4)', borderRadius: 2 }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 14 }}>
                        <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>Fee Collection</div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                          {[65,80,50,90,70,85,60].map((h, i) => (
                            <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, #2563eb, #7c3aed)', borderRadius: '3px 3px 0 0', opacity: 0.8 }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: -30, left: '50%', transform: 'translateX(-50%)', width: '70%', height: 60, background: 'rgba(37,99,235,0.2)', filter: 'blur(30px)', borderRadius: '50%' }} />
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {[
              { end: 500, suffix: '+', label: 'Coaching Institutes' },
              { end: 50000, suffix: '+', label: 'Students Managed' },
              { end: 99, suffix: '%', label: 'Uptime' },
              { end: 2500, suffix: '+', label: 'Teachers Onboarded' },
            ].map(stat => (
              <div key={stat.label} style={{ ...S.glass, padding: '28px 24px', textAlign: 'center', borderRadius: 16 }}>
                <div style={{ ...S.displayFont, fontSize: 40, fontWeight: 800, ...S.gradientText, marginBottom: 6 }}>
                  <Counter end={stat.end} suffix={stat.suffix} />
                </div>
                <div style={{ color: '#64748b', fontSize: 14 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={S.badge}>⚡ Everything You Need</div>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
              Powerful Features for <span style={S.gradientText}>Modern Coachings</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 16, maxWidth: 540, margin: '0 auto' }}>
              From student enrollment to fee collection — manage your entire institute in one platform.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {features.map(f => (
              <div key={f.title} style={{ ...S.card, cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.3)'; e.currentTarget.style.background = 'rgba(96,165,250,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: '#f1f5f9' }}>{f.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ ...S.sectionAlt }}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ ...S.badge, color: '#a78bfa' }}>🗺️ Simple Process</div>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, lineHeight: 1.2 }}>
              Up & Running in <span style={S.gradientText}>4 Simple Steps</span>
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 32 }}>
            {steps.map((step, i) => (
              <div key={step.num} style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                  <div style={{ width: 80, height: 80, background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto' }}>
                    {step.icon}
                  </div>
                  <div style={{ position: 'absolute', top: -8, right: -8, width: 26, height: 26, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>
                    {i + 1}
                  </div>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10, color: '#f1f5f9' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ECOSYSTEM DIAGRAM ── */}
      <section style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, marginBottom: 12 }}>
              How <span style={S.gradientText}>Everything Connects</span>
            </h2>
            <p style={{ color: '#64748b' }}>The complete ecosystem for your coaching institute</p>
          </div>

          <div style={{ ...S.glass, borderRadius: 24, padding: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 32, alignItems: 'center' }}>
              {/* Left: Admin */}
              <div>
                <div style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: 16, padding: 20, textAlign: 'center', marginBottom: 20 }}>
                  <div style={{ fontSize: 36, marginBottom: 6 }}>👨‍💼</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Admin</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Full control</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Create Classes & Batches','Add Students & Teachers','Manage Fees','Upload Study Materials','View Reports & Analytics'].map(a => (
                    <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#94a3b8' }}>
                      <div style={{ width: 6, height: 6, background: '#60a5fa', borderRadius: '50%', flexShrink: 0 }} />
                      {a}
                    </div>
                  ))}
                </div>
              </div>

              {/* Center: Platform */}
              <div style={{ textAlign: 'center', minWidth: 160 }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
                  <div style={{ position: 'absolute', inset: -8, background: 'linear-gradient(135deg,rgba(37,99,235,0.3),rgba(79,70,229,0.3))', borderRadius: '50%', animation: 'pulseRing 2s ease-in-out infinite' }} />
                  <div style={{ width: 120, height: 120, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 40px rgba(37,99,235,0.4)', position: 'relative' }}>
                    <div style={{ fontSize: 36 }}>🎓</div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4 }}>CoachingPro</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['📧 Email Notifications','📄 PDF Generation',/*'💳 Razorpay Payments',*/'🎬 Video Streaming'].map(f => (
                    <div key={f} style={{ ...S.glass, padding: '8px 14px', borderRadius: 8, fontSize: 12, color: '#93c5fd', textAlign: 'center' }}>{f}</div>
                  ))}
                </div>
              </div>

              {/* Right: Teacher & Student */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>👨‍🏫</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Teacher</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Mark attendance • View schedule</div>
                </div>
                <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 16, padding: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 32, marginBottom: 6 }}>👨‍🎓</div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Student</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>View & pay fees • Study materials</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={S.sectionAlt}>
        <div style={S.containerSm}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ ...S.badge, color: '#86efac' }}>💎 Simple Pricing</div>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 12 }}>
              Start Free, <span style={S.gradientText}>Scale When Ready</span>
            </h2>
            <p style={{ color: '#64748b' }}>No hidden fees. No per-student charges. One simple monthly plan.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
            {/* Free Plan */}
            <div style={{ ...S.glass, borderRadius: 24, padding: 36 }}>
              <div style={{ display: 'inline-block', background: 'rgba(100,116,139,0.2)', border: '1px solid rgba(100,116,139,0.3)', borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 20 }}>FREE PLAN</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ ...S.displayFont, fontSize: 52, fontWeight: 800 }}>₹0</span>
                <span style={{ color: '#64748b', fontSize: 14, marginLeft: 8 }}>forever</span>
              </div>
              <div style={{ marginBottom: 32 }}>
                {freePlanFeatures.map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: icon === '✅' ? '#cbd5e1' : '#475569' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/register" style={{ ...S.btnGlass, display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>Start Free</Link>
            </div>

            {/* Paid Plan — amber/gold matching register page */}
            <div style={{ background: 'linear-gradient(135deg, rgba(217,119,6,0.12), rgba(180,83,9,0.06))', border: '2px solid rgba(217,119,6,0.45)', borderRadius: 24, padding: 36, position: 'relative', boxShadow: '0 0 40px rgba(217,119,6,0.08)' }}>
              <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#d97706,#b45309)', borderRadius: 999, padding: '6px 20px', fontSize: 11, fontWeight: 800, letterSpacing: 1, whiteSpace: 'nowrap', color: '#fff' }}>RECOMMENDED</div>
              <div style={{ display: 'inline-block', background: 'rgba(217,119,6,0.18)', border: '1px solid rgba(217,119,6,0.4)', borderRadius: 8, padding: '4px 14px', fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 20 }}>⭐ PRO PLAN</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ ...S.displayFont, fontSize: 52, fontWeight: 800, color: '#fbbf24' }}>₹999</span>
                <span style={{ color: '#92400e', fontSize: 14, marginLeft: 8 }}>/month</span>
              </div>
              <div style={{ marginBottom: 32 }}>
                {paidPlanFeatures.map(([icon, text]) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 14, color: '#fde68a' }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
              <Link href="/register?plan=paid" style={{ display: 'block', textAlign: 'center', width: '100%', boxSizing: 'border-box', padding: '14px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,#d97706,#b45309)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(217,119,6,0.35)', transition: 'all 0.2s' }}>Get Full Access →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={S.section}>
        <div style={S.container}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800 }}>
              Loved by <span style={S.gradientText}>Coaching Owners</span>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
            {testimonials.map(t => (
              <div key={t.name} style={{ ...S.card }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(96,165,250,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{t.av}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{t.role}</div>
                  </div>
                </div>
                <div style={{ color: '#fbbf24', fontSize: 14, marginBottom: 10 }}>★★★★★</div>
                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '80px 0', background: 'radial-gradient(ellipse 60% 80% at 50% 50%, rgba(37,99,235,0.12), transparent)' }}>
        <div style={S.containerSm}>
          <div style={{ ...S.glass, borderRadius: 28, padding: '64px 48px', textAlign: 'center', border: '1px solid rgba(96,165,250,0.2)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🚀</div>
            <h2 style={{ ...S.displayFont, fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, marginBottom: 16 }}>
              Ready to Transform<br /><span style={S.gradientText}>Your Coaching?</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 17, marginBottom: 36, maxWidth: 460, margin: '0 auto 36px' }}>
              Join 500+ coaching institutes. Start free, no credit card needed. Upgrade anytime for ₹999/month.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={S.btnPrimary}>Create Free Account →</Link>
              <Link href="/login" style={S.btnGlass}>Admin Login</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '60px 0 32px' }}>
        <div style={S.container}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>C</div>
                <span style={{ ...S.displayFont, fontWeight: 700, fontSize: 18, ...S.gradientText }}>CoachingPro</span>
              </div>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.7 }}>The complete management platform for coaching institutes in India.</p>
            </div>
                <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: 1 }}>Product</div>
                {[['Features', '#features'], ['How It Works', '#how-it-works'], ['Pricing', '#pricing']].map(([label, href]) => (
                  <a key={label} href={href} style={{ display: 'block', color: '#475569', fontSize: 14, marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#60a5fa'}
                    onMouseLeave={e => e.target.style.color = '#475569'}>
                    {label}
                  </a>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: 1 }}>Portal</div>
                {[['Admin Login', '/login'], ['Register', '/register']].map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: 'block', color: '#475569', fontSize: 14, marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#60a5fa'}
                    onMouseLeave={e => e.target.style.color = '#475569'}>
                    {label}
                  </Link>
                ))}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 16, color: '#f1f5f9', textTransform: 'uppercase', letterSpacing: 1 }}>Legal</div>
                {[
                  ['Privacy Policy', '/privacy-policy'],
                  ['Terms & Conditions', '/terms-and-conditions'],
                  ['Refund Policy', '/refund-policy'],
                  ['Contact Us', '/contact-us'],
                ].map(([label, href]) => (
                  <Link key={label} href={href} style={{ display: 'block', color: '#475569', fontSize: 14, marginBottom: 10, textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#60a5fa'}
                    onMouseLeave={e => e.target.style.color = '#475569'}>
                    {label}
                  </Link>
                ))}
              </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <span style={{ color: '#334155', fontSize: 13 }}>© {new Date().getFullYear()} CoachingPro. Built for India's coaching institutes.</span>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                ['Privacy Policy', '/privacy-policy'],
                ['Terms & Conditions', '/terms-and-conditions'],
                ['Refund Policy', '/refund-policy'],
                ['Contact Us', '/contact-us'],
              ].map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: 12, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#60a5fa'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes floatBlob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }
        @keyframes floatMockup { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulseRing { 0%,100%{transform:scale(1);opacity:0.6} 50%{transform:scale(1.15);opacity:0.3} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}