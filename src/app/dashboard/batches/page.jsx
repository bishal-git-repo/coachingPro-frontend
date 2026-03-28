'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, FormTextarea, Spinner, EmptyState, ConfirmDialog, PageHeader, showToast, StatusBadge } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import api from '../../../lib/api';

const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const DAY_LABELS = { Mon:'M', Tue:'T', Wed:'W', Thu:'Th', Fri:'F', Sat:'S', Sun:'Su' };
const INIT = { name:'', class_id:'', start_time:'', end_time:'', days_of_week:[], fees_amount:'', fees_frequency:'monthly', max_students:50, description:'' };
const GREEN = { ...S.btnPrimary, background: 'linear-gradient(135deg,#059669,#047857)' };

function DayPicker({ value = [], onChange }) {
  const days = Array.isArray(value) ? value : (value ? value.split(',').map(d=>d.trim()).filter(Boolean) : []);
  function toggle(d) {
    const next = days.includes(d) ? days.filter(x => x !== d) : [...days, d];
    onChange(next);
  }
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {ALL_DAYS.map(d => (
        <button key={d} type="button" onClick={() => toggle(d)}
          style={{ width: 36, height: 36, borderRadius: 8, border: `1.5px solid ${days.includes(d) ? 'rgba(37,99,235,0.7)' : 'rgba(255,255,255,0.12)'}`, background: days.includes(d) ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.04)', color: days.includes(d) ? '#60a5fa' : '#64748b', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          {DAY_LABELS[d]}
        </button>
      ))}
    </div>
  );
}

export default function BatchesPage() {
  const router = useRouter();
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(INIT);

  const set = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getBatches();
      setBatches(r.data || []);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    api.getClasses().then(r => setClasses(r.data || [])).catch(() => {});
  }, [load]);

  function daysArrayToString(days) {
    return Array.isArray(days) ? days.join(',') : days;
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.createBatch({ ...form, days_of_week: daysArrayToString(form.days_of_week) });
      showToast('Batch created');
      setShowAdd(false); setForm(INIT); load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.updateBatch(showEdit.id, { ...form, days_of_week: daysArrayToString(form.days_of_week) });
      showToast('Batch updated');
      setShowEdit(null); load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSaving(false); }
  }

  function openEdit(b, e) {
    e.stopPropagation();
    const days = b.days_of_week ? b.days_of_week.split(',').map(d=>d.trim()).filter(Boolean) : [];
    setForm({
      name: b.name || '',
      class_id: b.class_id || '',
      start_time: b.start_time || '',
      end_time: b.end_time || '',
      days_of_week: days,
      fees_amount: b.fees_amount || '',
      fees_frequency: b.fees_frequency || 'monthly',
      max_students: b.max_students || 50,
      description: b.description || '',
    });
    setShowEdit(b);
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteBatch(showDelete.id); showToast('Batch deleted'); setShowDelete(null); load(); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setDeleting(false); }
  }

  const freqColor = { monthly:'#2563eb', quarterly:'#7c3aed', annually:'#059669', 'one-time':'#d97706' };

  return (
    <DashboardLayout>
      <PageHeader title="Batches" subtitle={`${batches.length} batches`}
        action={
          <button onClick={() => { setForm(INIT); setShowAdd(true); }} style={GREEN}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Batch
          </button>
        } />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : batches.length === 0 ? (
        <EmptyState title="No batches yet" desc="Create your first batch"
          action={<button onClick={() => { setForm(INIT); setShowAdd(true); }} style={GREEN}>Add Batch</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px,1fr))', gap: 18 }}>
          {batches.map(b => {
            const freq = b.fees_frequency || 'monthly';
            const accent = freqColor[freq] || '#2563eb';
            const daysArr = b.days_of_week ? b.days_of_week.split(',').map(d => d.trim()).filter(Boolean) : [];
            const pct = b.max_students > 0 ? Math.min(100, Math.round(((b.student_count||0) / b.max_students) * 100)) : 0;
            return (
              <div key={b.id} onClick={() => router.push(`/dashboard/batches/${b.id}`)}
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}33`, borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}22`; e.currentTarget.style.borderColor = `${accent}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${accent}33`; }}>
                <div style={{ height: 5, background: `linear-gradient(90deg,${accent},${accent}66)` }} />
                <div style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 17, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 3 }}>{b.name}</h3>
                      <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 5 }}>{b.class_name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 5 }} onClick={e => e.stopPropagation()}>
                      <button onClick={e => openEdit(b, e)} style={{ ...S.btnGhost, padding: '6px 9px' }} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={e => { e.stopPropagation(); setShowDelete(b); }} style={{ ...S.btnDanger, padding: '6px 9px' }} title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* Time */}
                  {b.start_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {b.start_time.slice(0,5)} – {b.end_time?.slice(0,5)}
                    </div>
                  )}

                  {/* Day pills */}
                  {daysArr.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                      {ALL_DAYS.map(d => (
                        <span key={d} style={{ width: 28, height: 26, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: daysArr.includes(d) ? `${accent}22` : 'rgba(255,255,255,0.03)', color: daysArr.includes(d) ? accent : '#334155', border: `1px solid ${daysArr.includes(d) ? accent+'44' : 'rgba(255,255,255,0.05)'}` }}>{DAY_LABELS[d]}</span>
                      ))}
                    </div>
                  )}

                  {/* Capacity bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b', marginBottom: 4 }}>
                      <span>Capacity</span>
                      <span style={{ color: accent, fontWeight: 700 }}>{b.student_count || 0}/{b.max_students}</span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct > 85 ? '#dc2626' : accent, borderRadius: 4, transition: 'width 0.4s' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {b.fees_amount > 0
                      ? <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 700 }}>₹{Number(b.fees_amount).toLocaleString('en-IN')}<span style={{ color: '#64748b', fontWeight: 400, fontSize: 11 }}>/{freq}</span></span>
                      : <span style={{ fontSize: 12, color: '#475569' }}>No fee set</span>}
                    <span style={{ fontSize: 11, color: accent, display: 'flex', alignItems: 'center', gap: 3 }}>
                      View details <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Batch" maxWidth={580}>
        <form onSubmit={handleAdd}>
          <FormInput label="Batch Name *" value={form.name} onChange={set('name')} placeholder="Morning Batch A" required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormSelect label="Class *" value={form.class_id} onChange={set('class_id')} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </FormSelect>
            <FormSelect label="Fees Frequency" value={form.fees_frequency} onChange={set('fees_frequency')}>
              {['monthly','quarterly','annually','one-time'].map(f => <option key={f} value={f}>{f}</option>)}
            </FormSelect>
            <FormInput label="Start Time" type="time" value={form.start_time} onChange={set('start_time')} />
            <FormInput label="End Time" type="time" value={form.end_time} onChange={set('end_time')} />
            <FormInput label="Fees Amount (₹)" type="number" value={form.fees_amount} onChange={set('fees_amount')} placeholder="5000" />
            <FormInput label="Max Students" type="number" value={form.max_students} onChange={set('max_students')} placeholder="50" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Days of Week</label>
            <DayPicker value={form.days_of_week} onChange={days => setForm(f => ({ ...f, days_of_week: days }))} />
          </div>
          <FormTextarea label="Description" value={form.description} onChange={set('description')} rows={2} />
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={GREEN} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Create Batch'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Batch" maxWidth={580}>
        <form onSubmit={handleEdit}>
          <FormInput label="Batch Name *" value={form.name} onChange={set('name')} placeholder="Batch name" required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <FormSelect label="Class *" value={String(form.class_id)} onChange={set('class_id')} required>
              <option value="">Select class</option>
              {classes.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </FormSelect>
            <FormSelect label="Fees Frequency" value={form.fees_frequency} onChange={set('fees_frequency')}>
              {['monthly','quarterly','annually','one-time'].map(f => <option key={f} value={f}>{f}</option>)}
            </FormSelect>
            <FormInput label="Start Time" type="time" value={form.start_time} onChange={set('start_time')} />
            <FormInput label="End Time" type="time" value={form.end_time} onChange={set('end_time')} />
            <FormInput label="Fees Amount (₹)" type="number" value={form.fees_amount} onChange={set('fees_amount')} />
            <FormInput label="Max Students" type="number" value={form.max_students} onChange={set('max_students')} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={S.label}>Days of Week</label>
            <DayPicker value={form.days_of_week} onChange={days => setForm(f => ({ ...f, days_of_week: days }))} />
          </div>
          <FormTextarea label="Description" value={form.description} onChange={set('description')} rows={2} />
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowEdit(null)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={GREEN} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Batch?" message={`Delete "${showDelete?.name}"? All related records will also be removed.`} />
    </DashboardLayout>
  );
}
