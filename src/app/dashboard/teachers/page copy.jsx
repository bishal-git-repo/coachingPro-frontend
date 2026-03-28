'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, Spinner, StatusBadge, EmptyState, ConfirmDialog, SearchInput, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import api from '../../../lib/api';

const INIT = { name:'', email:'', phone:'', subject:'', qualification:'', salary:'', send_credentials:true };

export default function TeachersPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showView, setShowView] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState(INIT);

  const set = useCallback(k => e =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  , []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getTeachers(); setTeachers(r.data || []); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.createTeacher(form);
      showToast('Teacher added' + (form.send_credentials ? ' & credentials sent!' : ''));
      setShowAdd(false); setForm(INIT); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true);
    try { await api.updateTeacher(showEdit.id, form); showToast('Teacher updated'); setShowEdit(null); load(); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteTeacher(showDelete.id); showToast('Teacher removed'); setShowDelete(null); load(); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(false); }
  }

  async function handleToggle(t) {
    try { const r = await api.toggleTeacherStatus(t.id); showToast(`Teacher ${r.status}`); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }

  async function handleView(t) {
    try { const r = await api.getTeacher(t.id); setShowView(r.data); }
    catch { setShowView(t); }
  }

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase()) ||
    (t.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const btnPurple = { ...S.btnPrimary, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' };

  return (
    <DashboardLayout>
      <PageHeader title="Teachers" subtitle={`${teachers.length} total teachers`}
        action={<button onClick={() => { setForm(INIT); setShowAdd(true); }} style={btnPurple}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Teacher
        </button>} />

      <div style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or subject..." />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No teachers found" desc="Add your first teacher"
          action={!search && <button onClick={() => { setForm(INIT); setShowAdd(true); }} style={btnPurple}>Add Teacher</button>} />
      ) : (
        <div className="table-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Teacher','Subject / Qual.','Batches','Salary','Status','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div onClick={() => handleView(t)} style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.8'} onMouseLeave={e => e.currentTarget.style.opacity='1'} title="View profile">
                        {t.name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{t.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}><div style={{ fontSize: 13 }}>{t.subject || '—'}</div><div style={{ fontSize: 12, color: '#64748b' }}>{t.qualification || '—'}</div></td>
                  <td style={S.td}><span style={{ fontSize: 13, color: '#94a3b8' }}>{t.batch_count || 0} batches</span></td>
                  <td style={S.td}><span style={{ color: '#4ade80', fontSize: 13, fontWeight: 600 }}>₹{Number(t.salary || 0).toLocaleString('en-IN')}</span></td>
                  <td style={S.td}><StatusBadge status={t.status} /></td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {/* View */}
                      <button onClick={() => handleView(t)} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="View profile">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      {/* Edit */}
                      <button onClick={() => { setForm({ ...t, send_credentials: false }); setShowEdit(t); }} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {/* Active/Inactive toggle */}
                      <button onClick={() => handleToggle(t)} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12, color: t.status === 'active' ? '#fbbf24' : '#4ade80' }} title={t.status === 'active' ? 'Deactivate' : 'Activate'}>
                        {t.status === 'active' ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                        )}
                      </button>
                      {/* View Payments — redirects to payments page filtered by this teacher */}
                      <button onClick={() => router.push(`/dashboard/payments?teacher_id=${t.id}`)} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12, color: '#4ade80' }} title="View payments">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                      </button>
                      {/* Resend credentials */}
                      <button onClick={() => api.resendTeacherCredentials(t.id).then(() => showToast('Credentials sent')).catch(e => showToast(e.message, 'error'))} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="Resend credentials">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </button>
                      {/* Delete */}
                      <button onClick={() => setShowDelete(t)} style={{ ...S.btnDanger, padding: '6px 10px', fontSize: 12 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Teacher" maxWidth={600}>
        <form onSubmit={handleAdd}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormInput label="Full Name *" value={form.name} onChange={set('name')} placeholder="Teacher name" required />
            <FormInput label="Email Address *" type="email" value={form.email} onChange={set('email')} placeholder="teacher@email.com" required />
            <FormInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <FormInput label="Subject" value={form.subject} onChange={set('subject')} placeholder="Mathematics" />
            <FormInput label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="B.Ed, M.Sc" />
            <FormInput label="Monthly Salary (₹)" type="number" value={form.salary} onChange={set('salary')} placeholder="20000" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 14px', background: 'rgba(124,58,237,0.08)', borderRadius: 10, border: '1px solid rgba(124,58,237,0.2)' }}>
            <input type="checkbox" id="sendCredTAdd" checked={form.send_credentials} onChange={set('send_credentials')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="sendCredTAdd" style={{ fontSize: 14, color: '#c4b5fd', cursor: 'pointer' }}>Send login credentials to teacher email</label>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={btnPurple} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Add Teacher'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Teacher" maxWidth={600}>
        <form onSubmit={handleEdit}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormInput label="Full Name *" value={form.name} onChange={set('name')} placeholder="Teacher name" required />
            <FormInput label="Email Address *" type="email" value={form.email} onChange={set('email')} placeholder="teacher@email.com" required />
            <FormInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <FormInput label="Subject" value={form.subject} onChange={set('subject')} placeholder="Mathematics" />
            <FormInput label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="B.Ed, M.Sc" />
            <FormInput label="Monthly Salary (₹)" type="number" value={form.salary} onChange={set('salary')} placeholder="20000" />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowEdit(null)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={btnPurple} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!showView} onClose={() => setShowView(null)} title="Teacher Profile" maxWidth={520}>
        {showView && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: 'rgba(124,58,237,0.08)', borderRadius: 12, border: '1px solid rgba(124,58,237,0.15)' }}>
              <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>{showView.name?.[0]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{showView.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{showView.email}</div>
                <div style={{ marginTop: 6 }}><StatusBadge status={showView.status} /></div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Phone', value: showView.phone || '—' },
                { label: 'Subject', value: showView.subject || '—' },
                { label: 'Qualification', value: showView.qualification || '—' },
                { label: 'Monthly Salary', value: `₹${Number(showView.salary || 0).toLocaleString('en-IN')}` },
                { label: 'Batches', value: showView.batch_names || '—' },
                { label: 'Joined', value: showView.join_date ? new Date(showView.join_date).toLocaleDateString('en-IN') : '—' },
              ].map(row => (
                <div key={row.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setShowView(null); router.push(`/dashboard/payments?teacher_id=${showView.id}`); }}
              style={{ ...S.btnPrimary, background: 'linear-gradient(135deg,#16a34a,#15803d)', width: '100%', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              View Payment History
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Teacher?" message={`Remove ${showDelete?.name}? This cannot be undone.`} />
    </DashboardLayout>
  );
}
