'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, Spinner, EmptyState, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const MODE_COLORS = { cash:'#16a34a', bank_transfer:'#2563eb', upi:'#7c3aed', cheque:'#d97706' };
const MODE_LABELS = { cash:'Cash', bank_transfer:'Bank Transfer', upi:'UPI', cheque:'Cheque' };

// ─── Teacher: My Payments view ────────────────────────────────
function TeacherPaymentsView() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    api.getTeacherPayments().then(r => setPayments(r.data||[])).catch(()=>{}).finally(()=>setLoading(false));
  }, []);

  const filtered = payments.filter(p => !filterMonth || p.month_year?.startsWith(filterMonth) || p.payment_date?.startsWith(filterMonth));

  const totalEarned = filtered.reduce((s,p) => s+Number(p.amount||0), 0);
  const thisMonth = new Date().toISOString().slice(0,7);
  const thisMonthTotal = payments.filter(p => (p.month_year||p.payment_date||'').startsWith(thisMonth)).reduce((s,p)=>s+Number(p.amount||0),0);

  return (
    <DashboardLayout>
      <PageHeader title="My Payments" subtitle="Your salary payment history" />

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Earned', value:`₹${totalEarned.toLocaleString('en-IN')}`, color:'#4ade80' },
          { label:'This Month', value:`₹${thisMonthTotal.toLocaleString('en-IN')}`, color:'#60a5fa' },
          { label:'Total Payments', value:filtered.length, color:'#a78bfa' },
          { label:'Last Received', value:payments[0]?.payment_date||'—', color:'#fbbf24' },
        ].map(item => (
          <div key={item.label} style={{ background:`${item.color}11`, border:`1px solid ${item.color}22`, borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{item.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:item.color, fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Month filter */}
      <div style={{ display:'flex', gap:10, marginBottom:20, alignItems:'center' }}>
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto' }} />
        {filterMonth && <button onClick={()=>setFilterMonth('')} style={{ ...S.btnGhost, fontSize:12 }}>Clear</button>}
        <span style={{ fontSize:12, color:'#475569', marginLeft:'auto' }}>Showing {filtered.length} payments</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36}/></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No payments yet" desc="Your salary payment history will appear here" />
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {filtered.map(p => (
            <div key={p.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:'18px 22px', display:'flex', alignItems:'center', gap:18, flexWrap:'wrap' }}>
              {/* Month badge */}
              <div style={{ background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:10, padding:'8px 14px', textAlign:'center', minWidth:70 }}>
                <div style={{ fontSize:10, color:'#60a5fa', fontWeight:600, textTransform:'uppercase' }}>{p.month_year?.slice(0,7)||p.payment_date?.slice(0,7)||'—'}</div>
              </div>
              {/* Amount */}
              <div style={{ flex:1 }}>
                <div style={{ fontSize:22, fontWeight:800, color:'#4ade80', fontFamily:"'Space Grotesk',sans-serif" }}>₹{Number(p.amount).toLocaleString('en-IN')}</div>
                {p.notes && <div style={{ fontSize:12, color:'#64748b', marginTop:2 }}>{p.notes}</div>}
              </div>
              {/* Mode */}
              <span style={{ padding:'5px 12px', borderRadius:8, background:`${MODE_COLORS[p.payment_mode]||'#64748b'}18`, border:`1px solid ${MODE_COLORS[p.payment_mode]||'#64748b'}33`, color:MODE_COLORS[p.payment_mode]||'#94a3b8', fontSize:12, fontWeight:600 }}>
                {MODE_LABELS[p.payment_mode]||p.payment_mode}
              </span>
              {/* Date */}
              <div style={{ textAlign:'right', minWidth:90 }}>
                <div style={{ fontSize:13, color:'#94a3b8' }}>{p.payment_date}</div>
                {p.transaction_ref && <div style={{ fontSize:11, color:'#475569', marginTop:2 }}>Ref: {p.transaction_ref}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

// ─── Admin: Full payments management view ─────────────────────
function AdminPaymentsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterTeacher, setFilterTeacher] = useState(searchParams?.get('teacher_id')||'');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterMode, setFilterMode] = useState('');
  const [form, setForm] = useState({
    teacher_id: searchParams?.get('teacher_id')||'', amount:'',
    payment_date: new Date().toISOString().slice(0,10),
    month_year: new Date().toISOString().slice(0,7),
    payment_mode:'bank_transfer', transaction_ref:'', notes:'',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTeacher) params.teacher_id = filterTeacher;
      const r = await api.getTeacherPayments(params);
      setPayments(r.data||[]);
    } catch (e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  }, [filterTeacher]);

  useEffect(() => {
    load();
    api.getTeachers().then(r=>setTeachers(r.data||[])).catch(()=>{});
  }, [load]);

  function onFormTeacherChange(tid) {
    const t = teachers.find(x=>x.id===parseInt(tid));
    setForm(f=>({ ...f, teacher_id:tid, amount:t?.salary?String(t.salary):'' }));
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try { await api.addTeacherPayment(form); showToast('Payment recorded!'); setShowAdd(false); load(); }
    catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  const filtered = payments.filter(p => {
    if (filterMonth && !p.month_year?.startsWith(filterMonth) && !p.payment_date?.startsWith(filterMonth)) return false;
    if (filterMode && p.payment_mode!==filterMode) return false;
    return true;
  });

  const totalPaid = filtered.reduce((s,p)=>s+Number(p.amount),0);
  const thisMonth = new Date().toISOString().slice(0,7);
  const thisMonthTotal = payments.filter(p=>(p.month_year||p.payment_date||'').startsWith(thisMonth)).reduce((s,p)=>s+Number(p.amount),0);

  // Group by teacher for summary cards
  const byTeacher = filtered.reduce((acc,p) => {
    const k=p.teacher_id;
    if(!acc[k]) acc[k]={teacher_name:p.teacher_name,subject:p.subject,total:0,count:0};
    acc[k].total+=Number(p.amount); acc[k].count++;
    return acc;
  }, {});

  const currentTeacher = filterTeacher ? teachers.find(t=>t.id===parseInt(filterTeacher)) : null;

  return (
    <DashboardLayout>
      <PageHeader
        title={currentTeacher ? `Payments — ${currentTeacher.name}` : 'Teacher Payments'}
        subtitle={currentTeacher ? `Monthly salary: ₹${Number(currentTeacher.salary||0).toLocaleString('en-IN')}` : 'Track & record teacher salary payments'}
        action={
          <div style={{ display:'flex', gap:10 }}>
            {filterTeacher && <button onClick={()=>{ setFilterTeacher(''); router.push('/dashboard/payments'); }} style={{ ...S.btnGhost, fontSize:12 }}>✕ Clear Filter</button>}
            <button onClick={()=>{ const t=teachers.find(x=>x.id===parseInt(filterTeacher)); setForm({ teacher_id:filterTeacher||'', amount:t?.salary?String(t.salary):'', payment_date:new Date().toISOString().slice(0,10), month_year:new Date().toISOString().slice(0,7), payment_mode:'bank_transfer', transaction_ref:'', notes:'' }); setShowAdd(true); }} style={S.btnPrimary}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Record Payment
            </button>
          </div>
        } />

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:24 }}>
        {[
          { label:'Total Paid (filtered)', value:`₹${totalPaid.toLocaleString('en-IN')}`, color:'#4ade80' },
          { label:'This Month', value:`₹${thisMonthTotal.toLocaleString('en-IN')}`, color:'#60a5fa' },
          { label:'Total Records', value:filtered.length, color:'#a78bfa' },
          { label:'Teachers Paid', value:Object.keys(byTeacher).length, color:'#fbbf24' },
        ].map(item=>(
          <div key={item.label} style={{ background:`${item.color}11`, border:`1px solid ${item.color}22`, borderRadius:14, padding:'18px 20px' }}>
            <div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{item.label}</div>
            <div style={{ fontSize:20, fontWeight:800, color:item.color, fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:14 }}>
        <select value={filterTeacher} onChange={e=>setFilterTeacher(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto', fontSize:13, flex:'1 1 160px' }}>
          <option value="">All Teachers</option>
          {teachers.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input type="month" value={filterMonth} onChange={e=>setFilterMonth(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto', fontSize:13 }} />
        <select value={filterMode} onChange={e=>setFilterMode(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto', fontSize:13 }}>
          <option value="">All Modes</option>
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="upi">UPI</option>
          <option value="cheque">Cheque</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36}/></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No payment records" desc="Record the first teacher payment" />
      ) : (
        <>
          {/* Teacher summary cards (when no teacher filter) */}
          {!filterTeacher && Object.keys(byTeacher).length > 0 && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:12, marginBottom:24 }}>
              {Object.entries(byTeacher).map(([tid,t])=>(
                <div key={tid} onClick={()=>setFilterTeacher(String(payments.find(p=>p.teacher_name===t.teacher_name)?.teacher_id))}
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:12, padding:'16px 18px', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.background='rgba(124,58,237,0.1)';e.currentTarget.style.borderColor='rgba(124,58,237,0.4)';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.borderColor='rgba(124,58,237,0.2)';}}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <div style={{ width:36, height:36, background:'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14 }}>{t.teacher_name?.[0]}</div>
                    <div>
                      <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{t.teacher_name}</div>
                      <div style={{ fontSize:12, color:'#64748b' }}>{t.subject||'—'}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:18, fontWeight:800, color:'#4ade80' }}>₹{t.total.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize:12, color:'#64748b' }}>{t.count} payments</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Payments table */}
          <div className="table-wrap" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflow:'hidden' }}>
            <table style={S.table}>
              <thead>
                <tr>{['Teacher','Month','Amount','Mode','Date','Ref'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(p=>(
                  <tr key={p.id} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={S.td}><div style={{ fontWeight:600, color:'#f1f5f9', fontSize:14 }}>{p.teacher_name}</div><div style={{ fontSize:12, color:'#64748b' }}>{p.subject||'—'}</div></td>
                    <td style={S.td}><span style={{ fontSize:13, color:'#94a3b8' }}>{p.month_year||'—'}</span></td>
                    <td style={S.td}><span style={{ fontSize:15, fontWeight:800, color:'#4ade80' }}>₹{Number(p.amount).toLocaleString('en-IN')}</span></td>
                    <td style={S.td}><span style={{ padding:'4px 10px', background:`${MODE_COLORS[p.payment_mode]||'#64748b'}18`, border:`1px solid ${MODE_COLORS[p.payment_mode]||'#64748b'}33`, borderRadius:8, fontSize:12, fontWeight:600, color:MODE_COLORS[p.payment_mode]||'#94a3b8' }}>{MODE_LABELS[p.payment_mode]||p.payment_mode}</span></td>
                    <td style={S.td}><span style={{ fontSize:13, color:'#94a3b8' }}>{p.payment_date}</span></td>
                    <td style={S.td}><span style={{ fontSize:12, color:'#475569' }}>{p.transaction_ref||p.notes||'—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Record Payment Modal */}
      <Modal open={showAdd} onClose={()=>setShowAdd(false)} title="Record Teacher Payment" maxWidth={480}>
        <form onSubmit={handleAdd}>
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Teacher *</label>
            <select value={form.teacher_id} onChange={e=>onFormTeacherChange(e.target.value)} className="cp-input" style={S.input} required>
              <option value="">Select teacher</option>
              {teachers.map(t=><option key={t.id} value={t.id}>{t.name} — ₹{Number(t.salary||0).toLocaleString('en-IN')}/mo</option>)}
            </select>
          </div>
          {form.teacher_id && (() => { const t=teachers.find(x=>x.id===parseInt(form.teacher_id)); return t?.salary ? (
            <div style={{ background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:8, padding:'10px 14px', marginBottom:14, display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:13, color:'#93c5fd' }}>Monthly Salary</span>
              <span style={{ fontSize:16, fontWeight:800, color:'#60a5fa' }}>₹{Number(t.salary).toLocaleString('en-IN')}</span>
            </div>
          ) : null; })()}
          <FormInput label="Amount (₹) *" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormInput label="Payment Date *" type="date" value={form.payment_date} onChange={e=>setForm(f=>({...f,payment_date:e.target.value}))} required />
            <FormInput label="Month/Year" type="month" value={form.month_year} onChange={e=>setForm(f=>({...f,month_year:e.target.value}))} />
          </div>
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Payment Mode</label>
            <select value={form.payment_mode} onChange={e=>setForm(f=>({...f,payment_mode:e.target.value}))} className="cp-input" style={S.input}>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>
          <FormInput label="Transaction Ref / Notes" value={form.transaction_ref} onChange={e=>setForm(f=>({...f,transaction_ref:e.target.value}))} placeholder="UPI ID, cheque no, etc." />
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={()=>setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={saving}>{saving?<Spinner size={16} color="#fff"/>:'Record Payment'}</button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}

// ─── Route-level component: shows teacher or admin view ───────
function PaymentsInner() {
  const { user } = useAuth();
  if (!user) return null;
  return user.role === 'teacher' ? <TeacherPaymentsView /> : <AdminPaymentsView />;
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={null}>
      <PaymentsInner />
    </Suspense>
  );
}
