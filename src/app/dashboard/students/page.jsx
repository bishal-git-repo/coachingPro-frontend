'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, Spinner, StatusBadge, EmptyState, ConfirmDialog, SearchInput, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import api from '../../../lib/api';

// ── KEY FIX: form state lives OUTSIDE the render tree so FormInput
// never gets recreated on parent state changes → no focus loss.
const INIT = { name:'', email:'', phone:'', parent_name:'', parent_phone:'', date_of_birth:'', gender:'', roll_number:'', send_credentials:true };

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);   // student obj
  const [showView, setShowView] = useState(null);   // student obj for view modal
  const [showDelete, setShowDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(INIT);

  const set = useCallback(k => e =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  , []);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.getStudents(); setStudents(r.data || []); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.createStudent(form);
      showToast('Student added' + (form.send_credentials ? ' & credentials sent!' : ''));
      setShowAdd(false); setForm(INIT); load();
    } catch (err) {
      if (err.message?.includes('limit') || err.message?.includes('Upgrade') || err.message?.includes('free plan')) {
        showToast('Student limit reached on Free plan.', 'error');
        setShowAdd(false);
        router.push('/dashboard/upgrade');
      } else {
        showToast(err.message, 'error');
      }
    }
    finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault(); setSaving(true);
    try {
      await api.updateStudent(showEdit.id, form);
      showToast('Student updated'); setShowEdit(null); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteStudent(showDelete.id); showToast('Student removed'); setShowDelete(null); load(); }
    catch (err) { showToast(err.message, 'error'); }
    finally { setDeleting(false); }
  }

  async function handleToggle(s) {
    try { const r = await api.toggleStudentStatus(s.id); showToast(`Student ${r.status}`); load(); }
    catch (err) { showToast(err.message, 'error'); }
  }

  async function handleView(s) {
    try { const r = await api.getStudent(s.id); setShowView(r.data); }
    catch { setShowView(s); }
  }

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').includes(search)
  );

  // StudentForm as a stable component — form state managed by parent, no re-creation
  return (
    <DashboardLayout>
      <PageHeader title="Students" subtitle={`${students.length} total students`}
        action={<button onClick={() => { setForm(INIT); setShowAdd(true); }} style={S.btnPrimary}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Student
        </button>} />

      <div style={{ marginBottom: 20 }}>
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email or phone..." />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No students found" desc={search ? 'Try a different search' : 'Add your first student'}
          action={!search && <button onClick={() => { setForm(INIT); setShowAdd(true); }} style={S.btnPrimary}>Add Student</button>} />
      ) : (
        <div className="table-wrap" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>{['Student','Contact','Batches','Status','Actions'].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={S.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div onClick={() => handleView(s)} style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor: 'pointer', transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.8'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        title="View profile">{s.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: 14 }}>{s.name}</div>
                        {s.roll_number && <div style={{ fontSize: 12, color: '#64748b' }}>Roll: {s.roll_number}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.td}><div style={{ fontSize: 13, color: '#cbd5e1' }}>{s.email}</div><div style={{ fontSize: 12, color: '#64748b' }}>{s.phone}</div></td>
                  <td style={S.td}><div style={{ fontSize: 13, color: '#94a3b8' }}>{s.batch_names || '—'}</div></td>
                  <td style={S.td}><StatusBadge status={s.status} /></td>
                  <td style={S.td}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => handleView(s)} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="View details">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button onClick={() => { setForm({ ...s, send_credentials: false }); setShowEdit(s); }} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="Edit">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => handleToggle(s)} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12, color: s.status === 'active' ? '#fbbf24' : '#4ade80' }} title={s.status === 'active' ? 'Deactivate' : 'Activate'}>
                        {s.status === 'active' ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        ) : (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>
                        )}
                      </button>
                      <button onClick={() => api.resendStudentCredentials(s.id).then(() => showToast('Credentials sent')).catch(e => showToast(e.message, 'error'))} style={{ ...S.btnGhost, padding: '6px 10px', fontSize: 12 }} title="Resend credentials">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      </button>
                      <button onClick={() => setShowDelete(s)} style={{ ...S.btnDanger, padding: '6px 10px', fontSize: 12 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Student" maxWidth={640}>
        <form onSubmit={handleAdd}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormInput label="Full Name *" value={form.name} onChange={set('name')} placeholder="Student name" required />
            <FormInput label="Email Address *" type="email" value={form.email} onChange={set('email')} placeholder="student@email.com" required />
            <FormInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <FormInput label="Roll Number" value={form.roll_number} onChange={set('roll_number')} placeholder="001" />
            <FormInput label="Parent Name" value={form.parent_name} onChange={set('parent_name')} placeholder="Parent name" />
            <FormInput label="Parent Phone" value={form.parent_phone} onChange={set('parent_phone')} placeholder="9876543210" />
            <FormInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            <FormSelect label="Gender" value={form.gender} onChange={set('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FormSelect>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 14px', background: 'rgba(37,99,235,0.08)', borderRadius: 10, border: '1px solid rgba(37,99,235,0.2)' }}>
            <input type="checkbox" id="sendCredAdd" checked={form.send_credentials} onChange={set('send_credentials')} style={{ width: 16, height: 16, cursor: 'pointer' }} />
            <label htmlFor="sendCredAdd" style={{ fontSize: 14, color: '#93c5fd', cursor: 'pointer' }}>Send login credentials to student email</label>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Add Student'}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title="Edit Student" maxWidth={640}>
        <form onSubmit={handleEdit}>
          <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <FormInput label="Full Name *" value={form.name} onChange={set('name')} placeholder="Student name" required />
            <FormInput label="Email Address *" type="email" value={form.email} onChange={set('email')} placeholder="student@email.com" required />
            <FormInput label="Phone" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            <FormInput label="Roll Number" value={form.roll_number} onChange={set('roll_number')} placeholder="001" />
            <FormInput label="Parent Name" value={form.parent_name} onChange={set('parent_name')} placeholder="Parent name" />
            <FormInput label="Parent Phone" value={form.parent_phone} onChange={set('parent_phone')} placeholder="9876543210" />
            <FormInput label="Date of Birth" type="date" value={form.date_of_birth} onChange={set('date_of_birth')} />
            <FormSelect label="Gender" value={form.gender} onChange={set('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </FormSelect>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowEdit(null)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={saving}>{saving ? <Spinner size={16} color="#fff" /> : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal open={!!showView} onClose={() => setShowView(null)} title="Student Profile" maxWidth={520}>
        {showView && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, padding: 20, background: 'rgba(37,99,235,0.08)', borderRadius: 12, border: '1px solid rgba(37,99,235,0.15)' }}>
              <div style={{ width: 60, height: 60, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24, flexShrink: 0 }}>{showView.name?.[0]}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9' }}>{showView.name}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{showView.email}</div>
                <div style={{ marginTop: 6 }}><StatusBadge status={showView.status} /></div>
              </div>
            </div>
            <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Phone', value: showView.phone || '—' },
                { label: 'Roll No.', value: showView.roll_number || '—' },
                { label: 'Gender', value: showView.gender || '—' },
                { label: 'Date of Birth', value: showView.date_of_birth ? new Date(showView.date_of_birth).toLocaleDateString('en-IN') : '—' },
                { label: 'Parent Name', value: showView.parent_name || '—' },
                { label: 'Parent Phone', value: showView.parent_phone || '—' },
                { label: 'Batches', value: showView.batch_names || '—' },
                { label: 'Joined', value: showView.join_date ? new Date(showView.join_date).toLocaleDateString('en-IN') : '—' },
              ].map(row => (
                <div key={row.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 500 }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete}
        loading={deleting} title="Delete Student?"
        message={`Are you sure you want to remove ${showDelete?.name}? This cannot be undone.`} />
    </DashboardLayout>
  );
}
