'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, Spinner, EmptyState, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

function getDisplayStatus(f) {
  if (f.status === 'paid' || f.status === 'partial') return f.status;
  if (f.due_date && new Date(f.due_date) < new Date(new Date().toDateString())) return 'overdue';
  return f.status || 'pending';
}

const STATUS_STYLE = {
  paid:    { bg:'rgba(22,163,74,0.15)',  color:'#4ade80', border:'rgba(22,163,74,0.3)',  label:'Paid' },
  pending: { bg:'rgba(217,119,6,0.15)',  color:'#fbbf24', border:'rgba(217,119,6,0.3)',  label:'Pending' },
  overdue: { bg:'rgba(220,38,38,0.15)',  color:'#f87171', border:'rgba(220,38,38,0.3)',  label:'Overdue' },
  partial: { bg:'rgba(124,58,237,0.15)', color:'#a78bfa', border:'rgba(124,58,237,0.3)', label:'Partial' },
};

export default function FeesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [fees, setFees] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [showPay, setShowPay] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterBatch, setFilterBatch] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(null);

  const initForm = { student_id:'', batch_id:'', amount:'', due_date:'', month_year:new Date().toISOString().slice(0,7), description:'' };
  const [form, setForm] = useState(initForm);
  const [bulkForm, setBulkForm] = useState({ batch_id:'', amount:'', due_date:'', month_year:new Date().toISOString().slice(0,7) });
  const [payForm, setPayForm] = useState({ payment_mode:'cash', payment_date:new Date().toISOString().slice(0,10), transaction_id:'' });
  const set = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterBatch) params.batch_id = filterBatch;
      if (filterMonth) params.month_year = filterMonth;
      const r = await api.getFees(params);
      setFees(r.data || []);
    } catch (e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  }, [filterBatch, filterMonth]);

  const loadAnalytics = useCallback(() => {
    if (!isAdmin) return;
    api.getFeesAnalytics().then(r => setAnalytics(r.data?.summary || r.data)).catch(()=>{});
  }, [isAdmin]);

  useEffect(() => {
    load();
    loadAnalytics();
    if (isAdmin) {
      api.getStudents().then(r => setStudents(r.data||[])).catch(()=>{});
      api.getBatches().then(r => setBatches(r.data||[])).catch(()=>{});
      api.getClasses().then(r => setClasses(r.data||[])).catch(()=>{});
    }
  }, [load, loadAnalytics, isAdmin]);

  function onBatchChange(batchId) {
    const batch = batches.find(b => b.id === parseInt(batchId));
    setForm(f => ({ ...f, batch_id:batchId, amount:batch?.fees_amount?String(batch.fees_amount):f.amount }));
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try { await api.createFee(form); showToast('Fee record created'); setShowAdd(false); setForm(initForm); load(); loadAnalytics(); }
    catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  async function handleBulk(e) {
    e.preventDefault(); setSaving(true);
    try { await api.createBulkFees(bulkForm); showToast('Bulk fees created!'); setShowBulk(false); load(); loadAnalytics(); }
    catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  async function handleMarkPaid(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.markFeePaid(showPay.id, payForm);
      showToast('Fee marked as paid!');
      setShowPay(null);
      // Reload fees AND analytics simultaneously so top cards update immediately
      const [feesRes, analyticsRes] = await Promise.all([
        api.getFees((() => { const p={}; if(filterBatch) p.batch_id=filterBatch; if(filterMonth) p.month_year=filterMonth; return p; })()),
        api.getFeesAnalytics(),
      ]);
      setFees(feesRes.data||[]);
      setAnalytics(analyticsRes.data?.summary||analyticsRes.data);
    } catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  async function handleDeleteFee(fee) {
    setSaving(true);
    try {
      await api.deleteFee(fee.id);
      showToast('Fee record deleted');
      const [feesRes, analyticsRes] = await Promise.all([
        api.getFees((() => { const p={}; if(filterBatch) p.batch_id=filterBatch; if(filterMonth) p.month_year=filterMonth; return p; })()),
        api.getFeesAnalytics(),
      ]);
      setFees(feesRes.data||[]);
      setAnalytics(analyticsRes.data?.summary||analyticsRes.data);
      setShowDelete(null);
    } catch (e) { showToast(e.message,'error'); }
    finally { setSaving(false); }
  }

  async function handleDownload(fee) {
    try {
      const blob = await api.downloadFeeSlip(fee.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=`fee-slip-${fee.id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) { showToast(e.message,'error'); }
  }

  const filteredBatches = filterClass ? batches.filter(b => b.class_id===parseInt(filterClass)) : batches;

  const filtered = fees.filter(f => {
    const displayStatus = getDisplayStatus(f);
    if (filterStatus && displayStatus !== filterStatus) return false;
    if (filterClass) { const b = batches.find(x => x.id===f.batch_id); if (!b || b.class_id!==parseInt(filterClass)) return false; }
    return true;
  });

  // Live computed summary (updates instantly when fees change)
  const allTotal = fees.reduce((s,f) => s+Number(f.amount),0);
  const allCollected = fees.filter(f => f.status==='paid').reduce((s,f) => s+Number(f.paid_amount||f.amount),0);
  const allPending = fees.filter(f => ['pending','overdue'].includes(getDisplayStatus(f))).reduce((s,f) => s+Number(f.amount),0);
  const allOverdue = fees.filter(f => getDisplayStatus(f)==='overdue').length;

  const summary = {
    total: allTotal,
    collected: allCollected,
    pending: allPending,
    overdue: allOverdue,
  };

  return (
    <DashboardLayout>
      <PageHeader title="Fees" subtitle={isAdmin ? 'Manage student fee records' : 'Your fee history'}
        action={isAdmin && (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { setBulkForm({ batch_id:'', amount:'', due_date:'', month_year:new Date().toISOString().slice(0,7) }); setShowBulk(true); }} style={{ ...S.btnGhost, fontSize:13 }}>Bulk Create</button>
            <button onClick={() => { setForm(initForm); setShowAdd(true); }} style={S.btnPrimary}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Fee
            </button>
          </div>
        )} />

      {/* Analytics cards — admin only, live computed so always current */}
      {isAdmin && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:14, marginBottom:24 }}>
          {[
            { label:'Total Billed', value:`₹${Number(summary.total).toLocaleString('en-IN')}`, color:'#2563eb' },
            { label:'Collected', value:`₹${Number(summary.collected).toLocaleString('en-IN')}`, color:'#16a34a' },
            { label:'Pending/Overdue', value:`₹${Number(summary.pending).toLocaleString('en-IN')}`, color:'#d97706' },
            { label:'Overdue Count', value:summary.overdue, color:'#dc2626' },
          ].map(item => (
            <div key={item.label} style={{ background:`${item.color}11`, border:`1px solid ${item.color}22`, borderRadius:14, padding:'16px 20px' }}>
              <div style={{ fontSize:11, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color:item.color, fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'flex-end' }}>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        {isAdmin && <>
          <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterBatch(''); }} className="cp-input" style={{ ...S.input, width:'auto' }}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto' }}>
            <option value="">All Batches</option>
            {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </>}
        <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="cp-input" style={{ ...S.input, width:'auto' }} placeholder="Filter by month" />
        {(filterStatus || filterClass || filterBatch || filterMonth) && (
          <button onClick={() => { setFilterStatus(''); setFilterClass(''); setFilterBatch(''); setFilterMonth(''); }} style={{ ...S.btnGhost, fontSize:12 }}>✕ Clear</button>
        )}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No fee records" desc={filterStatus||filterMonth ? 'Try different filters' : isAdmin ? 'Add your first fee record' : 'No fees assigned yet'} />
      ) : (
        <div className="table-wrap" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, overflowX:'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Student','Batch','Month','Amount','Status','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const displayStatus = getDisplayStatus(f);
                const scfg = STATUS_STYLE[displayStatus] || STATUS_STYLE.pending;
                return (
                  <tr key={f.id} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={S.td}><div style={{ fontWeight:600, color:'#f1f5f9', fontSize:14 }}>{f.student_name}</div><div style={{ fontSize:12, color:'#64748b' }}>{f.student_email}</div></td>
                    <td style={S.td}><div style={{ fontSize:13 }}>{f.batch_name}</div><div style={{ fontSize:11, color:'#64748b' }}>{f.class_name}</div></td>
                    <td style={S.td}><span style={{ fontSize:13, color:'#94a3b8' }}>{f.month_year||'—'}</span></td>
                    <td style={S.td}>
                      <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>₹{Number(f.amount).toLocaleString('en-IN')}</span>
                      {f.due_date && <div style={{ fontSize:11, color:displayStatus==='overdue'?'#f87171':'#64748b' }}>{displayStatus==='overdue'?'⚠ Overdue: ':'Due: '}{f.due_date}</div>}
                    </td>
                    <td style={S.td}><span style={{ padding:'4px 10px', borderRadius:8, fontSize:12, fontWeight:700, background:scfg.bg, color:scfg.color, border:`1px solid ${scfg.border}` }}>{scfg.label}</span></td>
                    <td style={S.td}>
                      <div style={{ display:'flex', gap:6 }}>
                        {isAdmin && displayStatus !== 'paid' && (
                          <button onClick={() => { setShowPay(f); setPayForm({ payment_mode:'cash', payment_date:new Date().toISOString().slice(0,10), transaction_id:'' }); }}
                            style={{ ...S.btnPrimary, background:'linear-gradient(135deg,#16a34a,#15803d)', padding:'6px 12px', fontSize:12 }}>Pay</button>
                        )}
                        <button onClick={() => handleDownload(f)} style={{ ...S.btnGhost, padding:'6px 10px', fontSize:12 }} title="Download">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </button>
                        {isAdmin && (
                          <>
                            <button onClick={() => api.emailFeeSlip(f.id).then(()=>showToast('Slip sent!')).catch(e=>showToast(e.message,'error'))} style={{ ...S.btnGhost, padding:'6px 10px', fontSize:12 }} title="Email">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            </button>
                            {displayStatus !== 'paid' && (
                              <button onClick={() => setShowDelete(f)} style={{ ...S.btnGhost, padding:'6px 10px', fontSize:12, color:'#f87171', borderColor:'rgba(220,38,38,0.3)' }} title="Delete">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Fee Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Fee Record" maxWidth={480}>
        <form onSubmit={handleAdd}>
          <FormSelect label="Student *" value={form.student_id} onChange={set('student_id')} required>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} — {s.email}</option>)}
          </FormSelect>
          <FormSelect label="Batch (auto-fills amount)" value={form.batch_id} onChange={e => onBatchChange(e.target.value)}>
            <option value="">Select batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name} — ₹{b.fees_amount}/{b.fees_frequency}</option>)}
          </FormSelect>
          <FormInput label="Amount (₹) *" type="number" value={form.amount} onChange={set('amount')} required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormInput label="Due Date" type="date" value={form.due_date} onChange={set('due_date')} />
            <FormInput label="Month/Year" type="month" value={form.month_year} onChange={set('month_year')} />
          </div>
          <FormInput label="Description" value={form.description} onChange={set('description')} placeholder="Optional note" />
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Create Fee'}</button>
          </div>
        </form>
      </Modal>

      {/* Bulk Modal */}
      <Modal open={showBulk} onClose={() => setShowBulk(false)} title="Bulk Fee — All Batch Students" maxWidth={440}>
        <form onSubmit={handleBulk}>
          <FormSelect label="Batch *" value={bulkForm.batch_id} onChange={e => { const b=batches.find(x=>x.id===parseInt(e.target.value)); setBulkForm(f=>({...f,batch_id:e.target.value,amount:b?.fees_amount?String(b.fees_amount):f.amount})); }} required>
            <option value="">Select batch</option>
            {batches.map(b => <option key={b.id} value={b.id}>{b.name} — ₹{b.fees_amount}/{b.fees_frequency}</option>)}
          </FormSelect>
          <FormInput label="Amount (₹) *" type="number" value={bulkForm.amount} onChange={e => setBulkForm(f=>({...f,amount:e.target.value}))} required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormInput label="Due Date" type="date" value={bulkForm.due_date} onChange={e => setBulkForm(f=>({...f,due_date:e.target.value}))} />
            <FormInput label="Month/Year" type="month" value={bulkForm.month_year} onChange={e => setBulkForm(f=>({...f,month_year:e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowBulk(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Create for All Students'}</button>
          </div>
        </form>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal open={!!showPay} onClose={() => setShowPay(null)} title={`Mark Paid — ${showPay?.student_name}`} maxWidth={400}>
        <div style={{ background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)', borderRadius:10, padding:'12px 16px', marginBottom:18 }}>
          <div style={{ fontSize:12, color:'#64748b', marginBottom:2 }}>Amount Due</div>
          <div style={{ fontSize:24, fontWeight:800, color:'#4ade80' }}>₹{Number(showPay?.amount).toLocaleString('en-IN')}</div>
        </div>
        <form onSubmit={handleMarkPaid}>
          <FormSelect label="Payment Mode *" value={payForm.payment_mode} onChange={e => setPayForm(f=>({...f,payment_mode:e.target.value}))}>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </FormSelect>
          <FormInput label="Payment Date *" type="date" value={payForm.payment_date} onChange={e => setPayForm(f=>({...f,payment_date:e.target.value}))} required />
          <FormInput label="Transaction ID / Reference" value={payForm.transaction_id} onChange={e => setPayForm(f=>({...f,transaction_id:e.target.value}))} placeholder="UPI ref / cheque no" />
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowPay(null)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={{ ...S.btnPrimary, background:'linear-gradient(135deg,#16a34a,#15803d)' }} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Mark as Paid'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={!!showDelete} onClose={() => setShowDelete(null)} title="Delete Fee Record" maxWidth={400}>
        <div style={{ padding: '8px 0 24px 0', fontSize: 15, color: '#e2e8f0', lineHeight: 1.5 }}>
          Are you sure you want to delete the fee record for <strong style={{color:'#fff'}}>{showDelete?.student_name}</strong> amounting to <strong style={{color:'#f87171'}}>₹{showDelete?.amount ? Number(showDelete.amount).toLocaleString('en-IN') : ''}</strong>?<br/>
          <span style={{ fontSize: 13, color: '#94a3b8', display: 'inline-block', marginTop: 8 }}>This action cannot be undone.</span>
        </div>
        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button type="button" onClick={() => setShowDelete(null)} style={S.btnGhost}>Cancel</button>
          <button type="button" onClick={() => handleDeleteFee(showDelete)} style={{ ...S.btnPrimary, background:'linear-gradient(135deg,#dc2626,#991b1b)' }} disabled={saving}>
            {saving ? <Spinner size={16} color="#fff" /> : 'Yes, Delete'}
          </button>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
