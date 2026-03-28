'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormTextarea, Spinner, EmptyState, ConfirmDialog, PageHeader, showToast, StatusBadge } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import api from '../../../lib/api';

const INIT = { name: '', subjects: '', description: '' };
const CYAN = { ...S.btnPrimary, background: 'linear-gradient(135deg,#0891b2,#0e7490)' };

// Subject pill colors
const subjectColors = ['#2563eb','#7c3aed','#059669','#d97706','#dc2626','#0891b2','#db2777'];

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(INIT);

  // KEY FIX: stable set handler — form lives outside any child component
  const set = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getClasses(); setClasses(r.data || []); }
    catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openDetail(cls) {
    setDetailLoading(true);
    setShowDetail({ ...cls, batches: [], students: [] });
    try {
      const r = await api.getClass(cls.id);
      const batchData = r.data?.batches || [];
      // Fetch students for each batch
      let allStudents = [];
      for (const b of batchData) {
        const br = await api.getBatch(b.id).catch(() => ({ data: {} }));
        const bStudents = (br.data?.students || []).map(s => ({ ...s, batch_name: b.name, batch_id: b.id }));
        allStudents = [...allStudents, ...bStudents];
      }
      // Deduplicate students
      const seen = new Set();
      const uniqueStudents = allStudents.filter(s => { if (seen.has(s.id)) return false; seen.add(s.id); return true; });
      setShowDetail({ ...r.data, batches: batchData, students: uniqueStudents });
    } catch (e) { showToast(e.message, 'error'); }
    finally { setDetailLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try { await api.createClass(form); showToast('Class created'); setShowAdd(false); setForm(INIT); load(); }
    catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true);
    try { await api.updateClass(showEdit.id, form); showToast('Class updated'); setShowEdit(null); load(); }
    catch (e) { showToast(e.message, 'error'); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteClass(showDelete.id); showToast('Class deleted'); setShowDelete(null); load(); }
    catch (e) { showToast(e.message, 'error'); } finally { setDeleting(false); }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Classes" subtitle={`${classes.length} classes`}
        action={
          <button onClick={() => { setForm(INIT); setShowAdd(true); }} style={CYAN}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Class
          </button>
        } />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : classes.length === 0 ? (
        <EmptyState title="No classes yet" desc="Create your first class to get started"
          action={<button onClick={() => { setForm(INIT); setShowAdd(true); }} style={CYAN}>Add Class</button>} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {classes.map((c, ci) => {
            const accent = subjectColors[ci % subjectColors.length];
            const subjects = c.subjects ? c.subjects.split(',').map(s => s.trim()).filter(Boolean) : [];
            return (
              <div key={c.id} onClick={() => openDetail(c)}
                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}33`, borderRadius: 18, padding: 0, cursor: 'pointer', transition: 'all 0.25s', overflow: 'hidden' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${accent}22`; e.currentTarget.style.borderColor = `${accent}66`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = `${accent}33`; }}>
                {/* Colored top bar */}
                <div style={{ height: 6, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 46, height: 46, background: `linear-gradient(135deg,${accent},${accent}88)`, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => { setForm({ name: c.name, subjects: c.subjects || '', description: c.description || '' }); setShowEdit(c); }}
                        style={{ ...S.btnGhost, padding: '6px 10px' }} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setShowDelete(c)} style={{ ...S.btnDanger, padding: '6px 10px' }} title="Delete">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: 19, fontWeight: 800, color: '#f1f5f9', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{c.name}</h3>

                  {subjects.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {subjects.map((s, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, color: subjectColors[i % subjectColors.length], background: `${subjectColors[i % subjectColors.length]}18`, border: `1px solid ${subjectColors[i % subjectColors.length]}33`, borderRadius: 6, padding: '3px 8px' }}>{s}</span>
                      ))}
                    </div>
                  )}

                  {c.description && (
                    <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5, marginBottom: 14, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#94a3b8' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
                      <span style={{ fontWeight: 600, color: accent }}>{c.batch_count || 0}</span> batches
                    </div>
                    <span style={{ fontSize: 12, color: accent, display: 'flex', alignItems: 'center', gap: 4 }}>
                      View details
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.name || 'Class Details'} maxWidth={680}>
        {showDetail && (
          <div>
            {detailLoading && <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}><Spinner size={28} /></div>}

            {/* Subjects */}
            {showDetail.subjects && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Subjects</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {showDetail.subjects.split(',').map((s, i) => (
                    <span key={i} style={{ fontSize: 12, fontWeight: 600, color: subjectColors[i % subjectColors.length], background: `${subjectColors[i % subjectColors.length]}18`, border: `1px solid ${subjectColors[i % subjectColors.length]}33`, borderRadius: 6, padding: '4px 10px' }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {showDetail.description && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#94a3b8', lineHeight: 1.6 }}>
                {showDetail.description}
              </div>
            )}

            {/* Batches */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/></svg>
                Batches ({showDetail.batches?.length || 0})
              </div>
              {showDetail.batches?.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {showDetail.batches.map(b => (
                    <div key={b.id} onClick={() => { setShowDetail(null); router.push('/dashboard/batches'); }}
                      style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.1)'}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{b.start_time?.slice(0,5)} – {b.end_time?.slice(0,5)}</div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 13, color: '#64748b' }}>No batches yet</p>}
            </div>

            {/* Students */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
                Students ({showDetail.students?.length || 0})
              </div>
              {showDetail.students?.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 8, maxHeight: 240, overflowY: 'auto' }}>
                  {showDetail.students.map(s => (
                    <div key={s.id} onClick={() => { setShowDetail(null); router.push('/dashboard/students'); }}
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
                      <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{s.name?.[0]}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.batch_name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p style={{ fontSize: 13, color: '#64748b' }}>No students enrolled</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Class">
        <form onSubmit={handleAdd}>
          <FormInput label="Class Name *" value={form.name} onChange={set('name')} placeholder="e.g. Class 10, JEE Mains" required />
          <FormInput label="Subjects (comma separated)" value={form.subjects} onChange={set('subjects')} placeholder="Maths, Physics, Chemistry" />
          <FormTextarea label="Description" value={form.description} onChange={set('description')} placeholder="About this class..." />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={CYAN} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Create Class'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Class">
        <form onSubmit={handleEdit}>
          <FormInput label="Class Name *" value={form.name} onChange={set('name')} placeholder="e.g. Class 10, JEE Mains" required />
          <FormInput label="Subjects (comma separated)" value={form.subjects} onChange={set('subjects')} placeholder="Maths, Physics, Chemistry" />
          <FormTextarea label="Description" value={form.description} onChange={set('description')} placeholder="About this class..." />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowEdit(null)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={CYAN} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Class?" message={`Delete "${showDelete?.name}"? All batches inside will also be deleted.`} />
    </DashboardLayout>
  );
}
