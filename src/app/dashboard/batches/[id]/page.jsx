'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormTextarea, FormSelect, Spinner, ConfirmDialog, showToast } from '../../../../components/ui/index';
import { S } from '../../../../lib/styles';
import api from '../../../../lib/api';

const PURPLE = { ...S.btnPrimary, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' };
const GREEN  = { ...S.btnPrimary, background: 'linear-gradient(135deg,#059669,#047857)' };
const INDIGO = { ...S.btnPrimary, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)' };

// Bug 7 & 8 fix: fetch file with Authorization header → create blob URL
function PdfViewer({ materialId, baseUrl, token }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let url = null;
    fetch(`${baseUrl}/materials/${materialId}/stream`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('Failed to load PDF'); return r.blob(); })
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url); })
      .catch(e => setError(e.message));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [materialId, baseUrl, token]);
  if (error) return <div style={{ color: '#f87171', padding: 20, textAlign: 'center' }}>{error}</div>;
  if (!blobUrl) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={32} /></div>;
  return <iframe src={blobUrl} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: 8 }} title="PDF Viewer" />;
}

function VideoViewer({ materialId, baseUrl, token }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let url = null;
    fetch(`${baseUrl}/materials/${materialId}/stream`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => { if (!r.ok) throw new Error('Failed to load video'); return r.blob(); })
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url); })
      .catch(e => setError(e.message));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [materialId, baseUrl, token]);
  if (error) return <div style={{ color: '#f87171', padding: 20, textAlign: 'center' }}>{error}</div>;
  if (!blobUrl) return <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner size={32} /></div>;
  return (
    <video controls autoPlay style={{ width: '100%', borderRadius: 10, background: '#000', maxHeight: '70vh' }} src={blobUrl}>
      Your browser does not support video.
    </video>
  );
}

export default function BatchDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allStudents, setAllStudents] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [matLoading, setMatLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showAssign, setShowAssign] = useState(false);
  const [showAssignTeacher, setShowAssignTeacher] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showDelMat, setShowDelMat] = useState(null);
  const [showViewPdf, setShowViewPdf] = useState(null);
  const [showViewVid, setShowViewVid] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [matForm, setMatForm] = useState({ title: '', description: '', type: 'pdf' });
  const [matFile, setMatFile] = useState(null);

  const loadBatch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.getBatch(id);
      setBatch(r.data);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [id]);

  const loadMaterials = useCallback(async () => {
    setMatLoading(true);
    try {
      const r = await api.getMaterials({ batch_id: id });
      setMaterials(r.data || []);
    } catch { }
    finally { setMatLoading(false); }
  }, [id]);

  useEffect(() => {
    loadBatch();
    loadMaterials();
    api.getStudents().then(r => setAllStudents(r.data || [])).catch(() => {});
    api.getTeachers().then(r => setAllTeachers(r.data || [])).catch(() => {});
  }, [loadBatch, loadMaterials]);

  async function assignStudent(student_id) {
    try {
      await api.assignStudentToBatch({ batch_id: Number(id), student_id: Number(student_id) });
      showToast('Student assigned!');
      loadBatch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function removeStudent(student_id) {
    try {
      await api.removeStudentFromBatch({ batch_id: Number(id), student_id: Number(student_id) });
      showToast('Student removed');
      loadBatch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function assignTeacher(teacher_id) {
    try {
      await api.assignTeacherToBatch({ batch_id: Number(id), teacher_id: Number(teacher_id) });
      showToast('Teacher assigned!');
      loadBatch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function removeTeacher(teacher_id) {
    try {
      await api.removeTeacherFromBatch({ batch_id: Number(id), teacher_id: Number(teacher_id) });
      showToast('Teacher removed');
      loadBatch();
    } catch (e) { showToast(e.message, 'error'); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!matFile) return showToast('Please select a file', 'error');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', matForm.title);
      fd.append('description', matForm.description);
      fd.append('type', matForm.type);
      fd.append('batch_id', id);
      fd.append('file', matFile);
      await api.uploadMaterial(fd, () => {});
      showToast('Uploaded!');
      setShowUpload(false);
      setMatForm({ title: '', description: '', type: 'pdf' });
      setMatFile(null);
      loadMaterials();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setUploading(false); }
  }

  async function handleDeleteMat() {
    setDeleting(true);
    try {
      await api.deleteMaterial(showDelMat.id);
      showToast('Deleted');
      setShowDelMat(null);
      loadMaterials();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setDeleting(false); }
  }

  const DAYS_LABELS = { Mon:'M', Tue:'T', Wed:'W', Thu:'Th', Fri:'F', Sat:'S', Sun:'Su' };
  const ALL_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const unassignedStudents = allStudents.filter(s => !batch?.students?.find(x => x.id === s.id));
  const unassignedTeachers = allTeachers.filter(t => !batch?.teachers?.find(x => x.id === t.id));

  // Bug 8 fix: use file_type field (backend stores as file_type, not type)
  const filteredMaterials = materials.filter(m => {
    const mtype = m.type || m.file_type || 'pdf';
    return filterType === 'all' || mtype === filterType;
  });

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '';

  if (loading) return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner size={40} /></div>
    </DashboardLayout>
  );

  if (!batch) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>Batch not found. <button onClick={() => router.back()} style={S.btnGhost}>Go back</button></div>
    </DashboardLayout>
  );

  const daysArr = batch.days_of_week ? batch.days_of_week.split(',').map(d => d.trim()) : [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28 }}>
        <button onClick={() => router.back()} style={{ ...S.btnGhost, padding: '8px 12px', flexShrink: 0, marginTop: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Batches / {batch.class_name}</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>{batch.name}</h1>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {batch.start_time && (
              <span style={{ fontSize: 13, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {batch.start_time?.slice(0,5)} – {batch.end_time?.slice(0,5)}
              </span>
            )}
            {daysArr.length > 0 && (
              <div style={{ display: 'flex', gap: 4 }}>
                {ALL_DAYS.map(d => (
                  <span key={d} style={{ width: 26, height: 24, borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, background: daysArr.includes(d) ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.04)', color: daysArr.includes(d) ? '#60a5fa' : '#334155', border: `1px solid ${daysArr.includes(d) ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.06)'}` }}>{DAYS_LABELS[d]}</span>
                ))}
              </div>
            )}
            {batch.fees_amount > 0 && <span style={{ fontSize: 13, color: '#4ade80', fontWeight: 700 }}>₹{Number(batch.fees_amount).toLocaleString('en-IN')}<span style={{ color: '#64748b', fontWeight: 400 }}>/{batch.fees_frequency}</span></span>}
            <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 6 }}>Max {batch.max_students} students</span>
          </div>
        </div>
      </div>

      {/* Info row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Class', value: batch.class_name || '—' },
          { label: 'Students', value: `${batch.students?.length || 0} / ${batch.max_students}` },
          { label: 'Teachers', value: batch.teachers?.length || 0 },
          { label: 'Materials', value: materials.length },
          { label: 'Status', value: batch.is_active ? 'Active' : 'Inactive' },
        ].map(r => (
          <div key={r.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{r.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>{r.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* ── Students ── */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg>
              Students ({batch.students?.length || 0})
            </h2>
            <button onClick={() => setShowAssign(true)} style={{ ...GREEN, padding: '7px 14px', fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>
          {batch.students?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#475569', fontSize: 13 }}>No students assigned yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
              {batch.students?.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{s.name?.[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{s.roll_number ? `Roll: ${s.roll_number}` : s.email}</div>
                  </div>
                  <button onClick={() => removeStudent(s.id)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4, display: 'flex', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Teachers ── */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Teachers ({batch.teachers?.length || 0})
            </h2>
            {/* Bug 3 fix: Added Assign Teacher button */}
            <button onClick={() => setShowAssignTeacher(true)} style={{ ...INDIGO, padding: '7px 14px', fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Assign
            </button>
          </div>
          {batch.teachers?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#475569', fontSize: 13 }}>No teachers assigned</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {batch.teachers?.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
                  <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>{t.name?.[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{t.subject || t.email}</div>
                  </div>
                  <button onClick={() => removeTeacher(t.id)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', padding: 4, display: 'flex', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Study Materials ── */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 20, marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            Study Materials ({materials.length})
          </h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {[['all','All'],['pdf','PDF'],['video','Video']].map(([v,l]) => (
                <button key={v} onClick={() => setFilterType(v)} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: `1px solid ${filterType === v ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`, background: filterType === v ? 'rgba(124,58,237,0.2)' : 'transparent', color: filterType === v ? '#a78bfa' : '#64748b', transition: 'all 0.2s' }}>{l}</button>
              ))}
            </div>
            <button onClick={() => setShowUpload(true)} style={{ ...PURPLE, padding: '7px 14px', fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Upload
            </button>
          </div>
        </div>

        {matLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 30 }}><Spinner size={28} /></div>
        ) : filteredMaterials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#475569', fontSize: 13 }}>No {filterType === 'all' ? '' : filterType + ' '}materials yet</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px,1fr))', gap: 12 }}>
            {filteredMaterials.map(m => {
              const mtype = m.type || m.file_type || 'pdf';
              const isVideo = mtype === 'video';
              return (
                <div key={m.id} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isVideo ? 'rgba(124,58,237,0.2)' : 'rgba(37,99,235,0.2)'}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ height: 90, background: isVideo ? 'linear-gradient(135deg,#2d1b69,#1e1b4b)' : 'linear-gradient(135deg,#1e3a5f,#0a1628)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    onClick={() => isVideo ? setShowViewVid(m) : setShowViewPdf(m)}>
                    {isVideo ? (
                      <div style={{ width: 40, height: 40, background: 'rgba(124,58,237,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    ) : (
                      <div style={{ width: 40, height: 40, background: 'rgba(37,99,235,0.3)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>{new Date(m.created_at).toLocaleDateString('en-IN')}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => isVideo ? setShowViewVid(m) : setShowViewPdf(m)}
                        style={{ flex: 1, padding: '6px', borderRadius: 7, border: `1px solid ${isVideo ? 'rgba(124,58,237,0.3)' : 'rgba(37,99,235,0.3)'}`, background: isVideo ? 'rgba(124,58,237,0.12)' : 'rgba(37,99,235,0.12)', color: isVideo ? '#a78bfa' : '#60a5fa', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {isVideo ? '▶ Watch' : '👁 View'}
                      </button>
                      <button onClick={() => setShowDelMat(m)} style={{ padding: '6px 8px', borderRadius: 7, border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)', color: '#f87171', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Assign Student Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Student to Batch" maxWidth={420}>
        {unassignedStudents.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>All students are already assigned to this batch.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {unassignedStudents.map(s => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{s.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{s.email}</div>
                </div>
                <button onClick={() => { assignStudent(s.id); setShowAssign(false); }} style={{ ...GREEN, padding: '6px 12px', fontSize: 12 }}>Assign</button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Assign Teacher Modal — Bug 3 fix */}
      <Modal open={showAssignTeacher} onClose={() => setShowAssignTeacher(false)} title="Assign Teacher to Batch" maxWidth={420}>
        {unassignedTeachers.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>All teachers are already assigned to this batch.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {unassignedTeachers.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{t.name?.[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{t.subject || t.email}</div>
                </div>
                <button onClick={() => { assignTeacher(t.id); setShowAssignTeacher(false); }} style={{ ...INDIGO, padding: '6px 12px', fontSize: 12 }}>Assign</button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Upload Material Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Study Material" maxWidth={460}>
        <form onSubmit={handleUpload}>
          <FormInput label="Title *" value={matForm.title} onChange={e => setMatForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Chapter 5 Notes" required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Type *</label>
              <select value={matForm.type} onChange={e => setMatForm(f => ({ ...f, type: e.target.value }))} className="cp-input" style={S.input}>
                <option value="pdf">PDF Document</option>
                <option value="video">Video (MP4)</option>
              </select>
            </div>
          </div>
          <FormTextarea label="Description" value={matForm.description} onChange={e => setMatForm(f => ({ ...f, description: e.target.value }))} rows={2} />
          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>File * ({matForm.type === 'pdf' ? 'PDF' : 'MP4'})</label>
            <div style={{ border: '2px dashed rgba(124,58,237,0.3)', borderRadius: 10, padding: 20, textAlign: 'center', cursor: 'pointer', background: 'rgba(124,58,237,0.04)' }}
              onClick={() => document.getElementById('bmat-file').click()}>
              <input id="bmat-file" type="file" accept={matForm.type === 'pdf' ? '.pdf' : '.mp4,video/*'} style={{ display: 'none' }} onChange={e => setMatFile(e.target.files[0])} />
              {matFile ? (
                <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600 }}>{matFile.name}</div>
              ) : (
                <div style={{ color: '#64748b', fontSize: 13 }}>Click to choose {matForm.type === 'pdf' ? 'PDF' : 'MP4'}</div>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowUpload(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={PURPLE} disabled={uploading}>{uploading ? <Spinner size={16} color="#fff" /> : 'Upload'}</button>
          </div>
        </form>
      </Modal>

      {/* PDF Viewer Modal — Bug 7 fix: uses blob URL via fetch with auth header */}
      <Modal open={!!showViewPdf} onClose={() => setShowViewPdf(null)} title={showViewPdf?.title} maxWidth={800}>
        {showViewPdf && <PdfViewer materialId={showViewPdf.id} baseUrl={BASE_URL} token={token} />}
      </Modal>

      {/* Video Viewer Modal — Bug 7 fix: uses blob URL via fetch with auth header */}
      <Modal open={!!showViewVid} onClose={() => setShowViewVid(null)} title={showViewVid?.title} maxWidth={720}>
        {showViewVid && <VideoViewer materialId={showViewVid.id} baseUrl={BASE_URL} token={token} />}
      </Modal>

      <ConfirmDialog open={!!showDelMat} onClose={() => setShowDelMat(null)} onConfirm={handleDeleteMat} loading={deleting}
        title="Delete Material?" message={`Delete "${showDelMat?.title}"?`} />
    </DashboardLayout>
  );
}
