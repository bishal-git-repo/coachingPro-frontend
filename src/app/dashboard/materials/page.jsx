'use client';
import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormTextarea, Spinner, EmptyState, ConfirmDialog, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

function PdfViewer({ materialId, baseUrl, token }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let url = null;
    fetch(`${baseUrl}/materials/${materialId}/stream`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('Failed to load PDF'); return r.blob(); })
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url); })
      .catch(e => setError(e.message));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [materialId, baseUrl, token]);
  if (error) return <div style={{ color:'#f87171', padding:20, textAlign:'center' }}>{error}</div>;
  if (!blobUrl) return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner size={32} /></div>;
  return <iframe src={blobUrl} style={{ width:'100%', height:'100%', border:'none', borderRadius:8 }} title="PDF Viewer" />;
}

function VideoViewer({ materialId, baseUrl, token }) {
  const [blobUrl, setBlobUrl] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    let url = null;
    fetch(`${baseUrl}/materials/${materialId}/stream`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error('Failed to load video'); return r.blob(); })
      .then(blob => { url = URL.createObjectURL(blob); setBlobUrl(url); })
      .catch(e => setError(e.message));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [materialId, baseUrl, token]);
  if (error) return <div style={{ color:'#f87171', padding:20, textAlign:'center' }}>{error}</div>;
  if (!blobUrl) return <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner size={32} /></div>;
  return <video controls autoPlay style={{ width:'100%', borderRadius:10, background:'#000', maxHeight:'70vh', display:'block' }} src={blobUrl}>Your browser does not support video.</video>;
}

export default function MaterialsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const canUpload = isAdmin || isTeacher;

  const [materials, setMaterials] = useState([]);
  const [myBatches, setMyBatches] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showDelete, setShowDelete] = useState(null);
  const [showViewPdf, setShowViewPdf] = useState(null);
  const [showViewVid, setShowViewVid] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [filterType, setFilterType] = useState('all');
  const [filterBatch, setFilterBatch] = useState('');
  const fileRef = useRef(null);

  const initForm = { title:'', description:'', batch_id:'', type:'pdf' };
  const [form, setForm] = useState(initForm);
  const [file, setFile] = useState(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const token = typeof window !== 'undefined' ? (localStorage.getItem('accessToken')||'') : '';

  useEffect(() => {
    // Load batches filtered to this user's batches (for student/teacher)
    if (isAdmin) {
      api.getBatches().then(r => { setAllBatches(r.data||[]); setMyBatches(r.data||[]); }).catch(()=>{});
    } else {
      // Use /my-batches — reliably returns only assigned batches with b.id
      api.getMyBatches().then(r => {
        const batches = r.data || [];
        setMyBatches(batches);
        setAllBatches(batches);
        if (batches.length > 0) setFilterBatch(String(batches[0].id));
      }).catch(()=>{});
    }
    load();
  }, [isAdmin, isTeacher]);

  async function load() {
    setLoading(true);
    try { const r = await api.getMaterials(); setMaterials(r.data||[]); }
    catch (e) { showToast(e.message,'error'); } finally { setLoading(false); }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return showToast('Please select a file','error');
    setUploading(true); setUploadPct(0);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      fd.append('file', file);
      await api.uploadMaterial(fd, pct => setUploadPct(pct));
      showToast('Material uploaded!');
      setShowAdd(false); setForm(initForm); setFile(null);
      if (fileRef.current) fileRef.current.value='';
      load();
    } catch (e) { showToast(e.message,'error'); } finally { setUploading(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteMaterial(showDelete.id); showToast('Deleted'); setShowDelete(null); load(); }
    catch (e) { showToast(e.message,'error'); } finally { setDeleting(false); }
  }

  function fmtSize(bytes) {
    if (!bytes) return '';
    return bytes > 1024*1024 ? (bytes/1024/1024).toFixed(1)+' MB' : (bytes/1024).toFixed(0)+' KB';
  }

  // Filter materials to user's batches
  const filtered = materials.filter(m => {
    const mtype = m.type||m.file_type||'pdf';
    const batchMatch = !filterBatch ? (isAdmin ? true : myBatches.some(b => b.id==m.batch_id)) : String(m.batch_id)===String(filterBatch);
    const typeMatch = filterType==='all' || mtype===filterType;
    // Non-admin: only show materials from their batches
    const accessCheck = isAdmin ? true : myBatches.some(b => b.id==m.batch_id);
    return typeMatch && batchMatch && accessCheck;
  });

  // Upload batch options: only user's batches
  const uploadBatches = isAdmin ? allBatches : myBatches;

  return (
    <DashboardLayout>
      <PageHeader
        title="Study Materials"
        subtitle={`${filtered.length} materials`}
        action={canUpload && (
          <button onClick={() => { setForm(initForm); setFile(null); setShowAdd(true); }} style={S.btnPrimary}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Upload Material
          </button>
        )} />

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:24, flexWrap:'wrap', alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
        <div style={{ display:'flex', gap:6 }}>
          {[['all','All'],['pdf','PDF'],['video','Video']].map(([val,label]) => (
            <button key={val} onClick={() => setFilterType(val)} style={{ padding:'8px 16px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', border:`1px solid ${filterType===val?'rgba(37,99,235,0.5)':'rgba(255,255,255,0.08)'}`, background:filterType===val?'rgba(37,99,235,0.18)':'rgba(255,255,255,0.03)', color:filterType===val?'#60a5fa':'#64748b' }}>{label}</button>
          ))}
        </div>
        <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="cp-input"
          style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#94a3b8', padding:'8px 12px', fontSize:12, cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
          <option value="">{isAdmin ? 'All Batches' : 'All My Batches'}</option>
          {(isAdmin ? allBatches : myBatches).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <span style={{ fontSize:12, color:'#475569', marginLeft:'auto' }}>Showing {filtered.length}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No materials found" desc="Upload PDFs and videos for students"
          action={canUpload && <button onClick={() => { setForm(initForm); setShowAdd(true); }} style={S.btnPrimary}>Upload Material</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {filtered.map(m => {
            const mtype = m.type||m.file_type||'pdf';
            const isVideo = mtype==='video';
            const accent = isVideo ? '#7c3aed' : '#2563eb';
            return (
              <div key={m.id} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}22`, borderRadius:16, overflow:'hidden', transition:'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=`${accent}55`; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=`${accent}22`; e.currentTarget.style.transform='none'; }}>
                <div onClick={() => isVideo ? setShowViewVid(m) : setShowViewPdf(m)}
                  style={{ height:110, background:isVideo?'linear-gradient(135deg,#2d1b69,#1e1b4b)':'linear-gradient(135deg,#1e3a5f,#0a1628)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', position:'relative' }}>
                  <div style={{ width:48, height:48, background:`${accent}33`, borderRadius:isVideo?'50%':12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    {isVideo ? <svg width="24" height="24" viewBox="0 0 24 24" fill={accent} stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                  </div>
                  <div style={{ position:'absolute', top:8, right:8, background:`${accent}cc`, borderRadius:5, padding:'2px 8px', fontSize:10, fontWeight:700, color:'#fff' }}>{mtype.toUpperCase()}</div>
                </div>
                <div style={{ padding:14 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.title}</h3>
                  <div style={{ fontSize:12, color:'#64748b', marginBottom:4 }}>{m.batch_name}</div>
                  {m.file_size && <div style={{ fontSize:11, color:'#475569', marginBottom:10 }}>{fmtSize(m.file_size)}</div>}
                  <div style={{ display:'flex', gap:7 }}>
                    <button onClick={() => isVideo ? setShowViewVid(m) : setShowViewPdf(m)}
                      style={{ flex:1, padding:'7px', borderRadius:8, border:`1px solid ${accent}44`, background:`${accent}12`, color:isVideo?'#a78bfa':'#60a5fa', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                      {isVideo ? '▶ Watch' : '👁 View PDF'}
                    </button>
                    {canUpload && (
                      <button onClick={() => setShowDelete(m)} style={{ padding:'7px 10px', borderRadius:8, border:'1px solid rgba(220,38,38,0.3)', background:'rgba(220,38,38,0.08)', color:'#f87171', cursor:'pointer', fontFamily:'inherit' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Upload Study Material" maxWidth={520}>
        <form onSubmit={handleUpload}>
          <FormInput label="Title *" value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))} placeholder="Chapter 5 — Algebra Notes" required />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Type *</label>
              <select value={form.type} onChange={e => setForm(f=>({...f,type:e.target.value}))} className="cp-input" style={S.input}>
                <option value="pdf">PDF Document</option>
                <option value="video">Video (MP4)</option>
              </select>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={S.label}>Batch *</label>
              <select value={form.batch_id} onChange={e => setForm(f=>({...f,batch_id:e.target.value}))} className="cp-input" style={S.input} required>
                <option value="">Select batch</option>
                {uploadBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <FormTextarea label="Description" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="About this material..." rows={2} />
          <div style={{ marginBottom:20 }}>
            <label style={S.label}>File * {form.type==='pdf'?'(PDF)':'(MP4 Video)'}</label>
            <div style={{ border:'2px dashed rgba(255,255,255,0.12)', borderRadius:10, padding:20, textAlign:'center', cursor:'pointer', background:'rgba(255,255,255,0.02)' }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); const f=e.dataTransfer.files[0]; if(f) setFile(f); }}>
              <input ref={fileRef} type="file" accept={form.type==='pdf'?'.pdf':'.mp4,video/mp4'} style={{ display:'none' }} onChange={e => setFile(e.target.files[0])} />
              {file ? <div><div style={{ fontSize:14, color:'#60a5fa', fontWeight:600 }}>{file.name}</div></div>
                : <div style={{ color:'#64748b', fontSize:14 }}>Click or drag & drop your {form.type==='pdf'?'PDF':'MP4'} here</div>}
            </div>
          </div>
          {uploading && (
            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#94a3b8', marginBottom:6 }}><span>Uploading…</span><span>{uploadPct}%</span></div>
              <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${uploadPct}%`, background:'linear-gradient(90deg,#2563eb,#4f46e5)', borderRadius:4, transition:'width 0.3s' }} />
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
            <button type="button" onClick={() => setShowAdd(false)} style={S.btnGhost}>Cancel</button>
            <button type="submit" style={S.btnPrimary} disabled={uploading}>{uploading ? <><Spinner size={16} color="#fff" /> Uploading…</> : 'Upload'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!showViewPdf} onClose={() => setShowViewPdf(null)} title={showViewPdf?.title} maxWidth={860}>
        {showViewPdf && <div style={{ height:'75vh' }}><PdfViewer materialId={showViewPdf.id} baseUrl={BASE_URL} token={token} /></div>}
      </Modal>
      <Modal open={!!showViewVid} onClose={() => setShowViewVid(null)} title={showViewVid?.title} maxWidth={740}>
        {showViewVid && <VideoViewer materialId={showViewVid.id} baseUrl={BASE_URL} token={token} />}
      </Modal>
      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Material?" message={`Delete "${showDelete?.title}"? Students will lose access.`} />
    </DashboardLayout>
  );
}
