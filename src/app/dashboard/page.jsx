'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Spinner, StatusBadge } from '../../components/ui/index';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

function DonutChart({ segments, size=100 }) {
  const total = segments.reduce((s,x)=>s+x.value,0);
  if (!total) return <div style={{ width:size, height:size, borderRadius:'50%', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:'#64748b' }}>No data</div>;
  let offset=0; const r=40,cx=50,cy=50,stroke=12,circ=2*Math.PI*r;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke}/>
      {segments.map((seg,i)=>{const dash=(seg.value/total)*circ;const gap=circ-dash;const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color} strokeWidth={stroke} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={-offset*circ/total+circ*0.25}/>;offset+=seg.value;return el;})}
      <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#f1f5f9" fontSize="14" fontWeight="bold">{total}</text>
    </svg>
  );
}

function StatBox({ label, value, color, href, icon, router }) {
  return (
    <div onClick={() => href && router.push(href)} style={{ cursor:href?'pointer':'default', background:`linear-gradient(135deg,${color}22,${color}11)`, border:`1px solid ${color}33`, borderRadius:16, padding:'20px 24px', display:'flex', alignItems:'center', gap:16, transition:'all 0.2s' }}
      onMouseEnter={e=>{if(href){e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 24px ${color}22`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
      <div style={{ width:52,height:52,background:`${color}22`,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color }}>{icon}</div>
      <div>
        <div style={{ fontSize:28,fontWeight:800,color:'#f1f5f9',fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.1 }}>{value}</div>
        <div style={{ fontSize:13,color:'#94a3b8',marginTop:2 }}>{label}</div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }) {
  const router = useRouter();
  const { stats, recentStudents, upcomingClasses } = data;
  const feeSegs = [
    { label:'Collected', value:Number(stats.fees?.collected||0), color:'#16a34a' },
    { label:'Pending', value:Number(stats.fees?.pending||0), color:'#d97706' },
  ];
  const memSegs = [
    { label:'Students', value:Number(stats.students||0), color:'#2563eb' },
    { label:'Teachers', value:Number(stats.teachers||0), color:'#7c3aed' },
  ];
  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:'#f1f5f9',marginBottom:4 }}>Overview</h1>
        <p style={{ color:'#64748b',fontSize:14 }}>Welcome back! Here's your coaching at a glance.</p>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16,marginBottom:28 }}>
        {[
          { label:'Total Students', value:stats.students, color:'#2563eb', href:'/dashboard/students', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg> },
          { label:'Total Teachers', value:stats.teachers, color:'#7c3aed', href:'/dashboard/teachers', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          { label:'Classes', value:stats.classes, color:'#0891b2', href:'/dashboard/classes', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
          { label:'Batches', value:stats.batches, color:'#059669', href:'/dashboard/batches', icon:<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
        ].map(c => <StatBox key={c.label} {...c} router={router} />)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:24 }} className="three-col-grid">
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'#f1f5f9',marginBottom:16 }}>Fee Overview</div>
          <div style={{ display:'flex',alignItems:'center',gap:16 }}>
            <DonutChart segments={feeSegs} size={90}/>
            <div>{feeSegs.map(s=><div key={s.label} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}><div style={{ width:10,height:10,borderRadius:2,background:s.color,flexShrink:0 }}/><div><div style={{ fontSize:11,color:'#64748b' }}>{s.label}</div><div style={{ fontSize:13,fontWeight:700,color:'#f1f5f9' }}>₹{Number(s.value).toLocaleString('en-IN')}</div></div></div>)}</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'#f1f5f9',marginBottom:16 }}>Members</div>
          <div style={{ display:'flex',alignItems:'center',gap:16 }}>
            <DonutChart segments={memSegs} size={90}/>
            <div>{memSegs.map(s=><div key={s.label} style={{ display:'flex',alignItems:'center',gap:8,marginBottom:8 }}><div style={{ width:10,height:10,borderRadius:2,background:s.color,flexShrink:0 }}/><div><div style={{ fontSize:11,color:'#64748b' }}>{s.label}</div><div style={{ fontSize:13,fontWeight:700,color:'#f1f5f9' }}>{s.value}</div></div></div>)}</div>
          </div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ fontWeight:700,fontSize:14,color:'#f1f5f9',marginBottom:16 }}>Activity</div>
          {[
            { label:'Overdue Fees', value:stats.overdueFees||0, color:'#f87171' },
            { label:'Teacher Pay (month)', value:`₹${Number(stats.teacherPaymentsThisMonth||0).toLocaleString('en-IN')}`, color:'#fbbf24' },
            { label:'Active Batches', value:stats.batches, color:'#4ade80' },
          ].map(item=>(
            <div key={item.label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize:13,color:'#94a3b8' }}>{item.label}</span>
              <span style={{ fontSize:13,fontWeight:700,color:item.color }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24 }} className="two-col-grid">
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>Recent Students</h3>
            <Link href="/dashboard/students" style={{ fontSize:12,color:'#60a5fa',textDecoration:'none' }}>View all →</Link>
          </div>
          {recentStudents?.length ? recentStudents.map((s,i)=>(
            <div key={s.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'10px 12px',borderRadius:10,transition:'background 0.2s',cursor:'pointer',marginBottom:4 }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              onClick={()=>router.push('/dashboard/students')}>
              <div style={{ width:38,height:38,background:`linear-gradient(135deg,hsl(${i*60%360},70%,50%),hsl(${(i*60+40)%360},70%,40%))`,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:15,flexShrink:0,color:'#fff' }}>{s.name[0]}</div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.name}</div>
                <div style={{ fontSize:12,color:'#64748b' }}>Joined {s.join_date?new Date(s.join_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—'}</div>
              </div>
              <StatusBadge status={s.status}/>
            </div>
          )) : <p style={{ color:'#64748b',fontSize:13,textAlign:'center',padding:'32px 0' }}>No students yet</p>}
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>Upcoming Classes</h3>
            <Link href="/dashboard/schedule" style={{ fontSize:12,color:'#60a5fa',textDecoration:'none' }}>View all →</Link>
          </div>
          {upcomingClasses?.length ? upcomingClasses.map((c,i)=>{
            const cols=['#2563eb','#7c3aed','#0891b2','#059669','#d97706']; const col=cols[i%cols.length];
            return <div key={c.id} onClick={()=>router.push('/dashboard/schedule')} style={{ display:'flex',gap:12,padding:'10px 12px',borderRadius:10,marginBottom:4,transition:'background 0.2s',cursor:'pointer' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{ width:4,background:col,borderRadius:2,flexShrink:0 }}/>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9',marginBottom:2 }}>{c.title||c.batch_name}</div>
                <div style={{ fontSize:12,color:'#64748b' }}>{c.batch_name} • {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}</div>
              </div>
              <div style={{ fontSize:11,color:col,background:`${col}18`,border:`1px solid ${col}33`,padding:'3px 8px',borderRadius:6,whiteSpace:'nowrap',height:'fit-content' }}>{c.scheduled_date?new Date(c.scheduled_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}):'—'}</div>
            </div>;
          }) : <p style={{ color:'#64748b',fontSize:13,textAlign:'center',padding:'32px 0' }}>No upcoming classes</p>}
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,padding:24 }}>
        <h3 style={{ fontWeight:700,fontSize:14,color:'#94a3b8',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.5px' }}>Quick Actions</h3>
        <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
          {[
            { label:'Add Student', href:'/dashboard/students', color:'#2563eb' },
            { label:'Add Teacher', href:'/dashboard/teachers', color:'#7c3aed' },
            { label:'Schedule Class', href:'/dashboard/schedule', color:'#0891b2' },
            { label:'Mark Attendance', href:'/dashboard/attendance', color:'#16a34a' },
            { label:'Collect Fees', href:'/dashboard/fees', color:'#d97706' },
            { label:'Upload Material', href:'/dashboard/materials', color:'#ec4899' },
          ].map(a=><Link key={a.label} href={a.href} style={{ display:'inline-flex',alignItems:'center',gap:7,padding:'9px 16px',background:`${a.color}18`,border:`1px solid ${a.color}33`,borderRadius:10,color:a.color,fontSize:13,fontWeight:600,textDecoration:'none',transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background=`${a.color}28`;e.currentTarget.style.transform='translateY(-1px)';}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${a.color}18`;e.currentTarget.style.transform='none';}}>{a.label}</Link>)}
        </div>
      </div>
    </div>
  );
}

function StudentDashboard({ data }) {
  const router = useRouter();
  const { batches, fees, upcomingClasses } = data;
  const pendingFees = fees?.filter(f => f.status==='pending'||f.status==='overdue') || [];
  const totalDue = pendingFees.reduce((s,f)=>s+Number(f.amount),0);
  return (
    <div>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:'#f1f5f9',marginBottom:6 }}>My Dashboard</h1>
      <p style={{ color:'#64748b',fontSize:14,marginBottom:24 }}>Here's a quick overview of your learning progress.</p>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:28 }}>
        {[
          { label:'My Batches', value:batches?.length||0, color:'#2563eb', href:'/dashboard/schedule',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
          { label:'Upcoming Classes', value:upcomingClasses?.length||0, color:'#7c3aed', href:'/dashboard/schedule',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          { label:'Pending Fees', value:pendingFees.length, color:'#d97706', href:'/dashboard/fees',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
          { label:'Amount Due', value:`₹${totalDue.toLocaleString('en-IN')}`, color:totalDue>0?'#f87171':'#4ade80', href:'/dashboard/fees',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        ].map(c=><StatBox key={c.label} {...c} router={router}/>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20 }} className="two-col-grid">
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9',marginBottom:16 }}>My Batches</h3>
          {batches?.length ? batches.map((b,i)=>{const cols=['#2563eb','#7c3aed','#0891b2','#059669'];const col=cols[i%cols.length];return(
            <div key={i} style={{ padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:4,height:36,background:col,borderRadius:2,flexShrink:0 }}/>
              <div><div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9' }}>{b.name}</div><div style={{ fontSize:12,color:'#64748b' }}>{b.class_name} • {b.start_time?.slice(0,5)}–{b.end_time?.slice(0,5)}</div></div>
            </div>
          );}) : <p style={{ color:'#64748b',fontSize:13 }}>Not enrolled in any batch</p>}
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>Upcoming Classes</h3>
            <Link href="/dashboard/schedule" style={{ fontSize:12,color:'#60a5fa',textDecoration:'none' }}>View all →</Link>
          </div>
          {upcomingClasses?.length ? upcomingClasses.slice(0,5).map(c=>(
            <div key={c.id} style={{ padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9' }}>{c.title||c.batch_name}</div>
              <div style={{ fontSize:12,color:'#64748b' }}>{c.scheduled_date} • {c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}</div>
            </div>
          )) : <p style={{ color:'#64748b',fontSize:13 }}>No upcoming classes</p>}
        </div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
        <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
          <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>Recent Fees</h3>
          <Link href="/dashboard/fees" style={{ fontSize:12,color:'#60a5fa',textDecoration:'none' }}>View all →</Link>
        </div>
        {fees?.slice(0,5).map(f=>{
          const sts={paid:'#4ade80',pending:'#fbbf24',overdue:'#f87171'};
          return <div key={f.id} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div><div style={{ fontSize:13,color:'#f1f5f9' }}>{f.month_year||'Fee'}</div><div style={{ fontSize:12,color:'#64748b' }}>₹{Number(f.amount).toLocaleString('en-IN')}</div></div>
            <span style={{ fontSize:12,fontWeight:700,color:sts[f.status]||'#94a3b8',padding:'3px 10px',borderRadius:6,background:`${sts[f.status]||'#94a3b8'}18`,alignSelf:'center' }}>{f.status}</span>
          </div>;
        })}
        {!fees?.length && <p style={{ color:'#64748b',fontSize:13 }}>No fees yet</p>}
      </div>
    </div>
  );
}

function TeacherDashboard({ data }) {
  const router = useRouter();
  const { batches, upcomingClasses, payments } = data;
  const totalEarned = payments?.reduce((s,p)=>s+Number(p.amount||0),0) || 0;
  const lastPayment = payments?.[0];
  return (
    <div>
      <h1 style={{ fontFamily:"'Space Grotesk',sans-serif",fontSize:26,fontWeight:800,color:'#f1f5f9',marginBottom:6 }}>My Dashboard</h1>
      <p style={{ color:'#64748b',fontSize:14,marginBottom:24 }}>Here's your teaching overview.</p>
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:16,marginBottom:28 }}>
        {[
          { label:'My Batches', value:batches?.length||0, color:'#2563eb', href:'/dashboard/schedule',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg> },
          { label:'Upcoming Classes', value:upcomingClasses?.length||0, color:'#7c3aed', href:'/dashboard/schedule',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
          { label:'Last Payment', value:`₹${Number(lastPayment?.amount||0).toLocaleString('en-IN')}`, color:'#d97706', href:'/dashboard/payments',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          { label:'Total Earned', value:`₹${totalEarned.toLocaleString('en-IN')}`, color:'#4ade80', href:'/dashboard/payments',
            icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
        ].map(c=><StatBox key={c.label} {...c} router={router}/>)}
      </div>
      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }} className="two-col-grid">
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>My Batches</h3>
          </div>
          {batches?.length ? batches.map((b,i)=>{const cols=['#2563eb','#7c3aed','#0891b2','#059669'];const col=cols[i%cols.length];return(
            <div key={i} style={{ padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:4,height:36,background:col,borderRadius:2,flexShrink:0 }}/>
              <div><div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9' }}>{b.name}</div><div style={{ fontSize:12,color:'#64748b' }}>{b.class_name} • {b.student_count||0} students</div></div>
            </div>
          );}) : <p style={{ color:'#64748b',fontSize:13 }}>Not assigned to any batch</p>}
        </div>
        <div style={{ background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16,padding:24 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16 }}>
            <h3 style={{ fontWeight:700,fontSize:15,color:'#f1f5f9' }}>Upcoming Classes</h3>
            <Link href="/dashboard/schedule" style={{ fontSize:12,color:'#60a5fa',textDecoration:'none' }}>View all →</Link>
          </div>
          {upcomingClasses?.length ? upcomingClasses.map(c=>(
            <div key={c.id} style={{ display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
              <div><div style={{ fontSize:14,fontWeight:600,color:'#f1f5f9' }}>{c.title||c.batch_name}</div><div style={{ fontSize:12,color:'#64748b' }}>{c.start_time?.slice(0,5)}–{c.end_time?.slice(0,5)}</div></div>
              <div style={{ fontSize:12,color:'#60a5fa' }}>{c.scheduled_date}</div>
            </div>
          )) : <p style={{ color:'#64748b',fontSize:13 }}>No upcoming classes</p>}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!user) return;
    const fn={admin:api.getAdminDashboard,teacher:api.getTeacherDashboard,student:api.getStudentDashboard}[user.role];
    fn?.call(api).then(r=>setData(r.data)).catch(console.error).finally(()=>setLoading(false));
  }, [user]);
  return (
    <DashboardLayout>
      {loading ? <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:300 }}><Spinner size={40}/></div>
        : data ? (user?.role==='admin'?<AdminDashboard data={data}/>:user?.role==='teacher'?<TeacherDashboard data={data}/>:<StudentDashboard data={data}/>) : null}
    </DashboardLayout>
  );
}
