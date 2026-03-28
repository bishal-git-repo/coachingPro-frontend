'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Modal, FormInput, FormSelect, FormTextarea, Spinner, PageHeader, showToast, ConfirmDialog } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const WEEK_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function getWeekDates(offset = 0) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return WEEK_DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0,10);
  });
}

function getDayName(dateStr) {
  if (!dateStr) return '';
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(dateStr).getDay()];
}

function toMin(t) { if (!t) return 0; const [h,m] = t.split(':').map(Number); return h*60+m; }
function overlaps(s1,e1,s2,e2) { return toMin(s1) < toMin(e2) && toMin(e1) > toMin(s2); }

const STATUS_COLOR = { scheduled:'#2563eb', completed:'#16a34a', cancelled:'#dc2626' };
const BATCH_COLORS = ['#2563eb','#7c3aed','#0891b2','#059669','#d97706','#dc2626','#db2777'];

function ScheduleCard({ s, accent, onDetail }) {
  const today = new Date().toISOString().slice(0,10);
  const isPast = s.scheduled_date < today || s.status === 'completed';
  return (
    <div style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}33`, borderLeft:`3px solid ${accent}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14, opacity:isPast?0.6:1 }}>
      <div style={{ minWidth:56, textAlign:'center' }}>
        <div style={{ fontSize:11, color:'#64748b', fontWeight:600 }}>{getDayName(s.scheduled_date)}</div>
        <div style={{ fontSize:22, fontWeight:800, color:accent, fontFamily:"'Space Grotesk',sans-serif" }}>{new Date(s.scheduled_date+'T00:00:00').getDate()}</div>
        <div style={{ fontSize:10, color:'#475569' }}>{s.scheduled_date?.slice(0,7)}</div>
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:2 }}>{s.title||s.batch_name}</div>
        <div style={{ fontSize:12, color:'#64748b' }}>{s.batch_name} • {s.class_name} • {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</div>
        {s.description && <div style={{ fontSize:12, color:'#94a3b8', marginTop:2 }}>{s.description}</div>}
      </div>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:8, background:`${STATUS_COLOR[s.status]||'#475569'}18`, color:STATUS_COLOR[s.status]||'#94a3b8', fontWeight:700 }}>{s.status}</span>
        {!isPast && s.meeting_link && (
          <a href={s.meeting_link} target="_blank" rel="noopener noreferrer"
            style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:8, color:'#60a5fa', fontSize:12, fontWeight:600, textDecoration:'none' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
            Join
          </a>
        )}
        <button onClick={() => onDetail(s)} style={{ padding:'5px 10px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#94a3b8', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Details</button>
      </div>
    </div>
  );
}

// Slot validation helper
function validateSlot(form, today) {
  if (!form.scheduled_date || !form.start_time || !form.end_time) return null;
  const isPast = form.scheduled_date < today;
  if (isPast) return { type:'error', msg:'Selected date is in the past' };
  if (toMin(form.end_time) <= toMin(form.start_time)) return { type:'error', msg:'End time must be after start time' };
  const dur = toMin(form.end_time) - toMin(form.start_time);
  if (dur < 15) return { type:'error', msg:'Class duration must be at least 15 minutes' };
  return null;
}

export default function SchedulePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const [allBatches, setAllBatches] = useState([]);   // all batches from API
  const [myBatches, setMyBatches] = useState([]);     // teacher/student filtered batches
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState('list');   // admin defaults to grid via effect
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Teacher/student filters
  const [filterBatch, setFilterBatch] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const INIT_FORM = { batch_id:'', scheduled_date:'', start_time:'', end_time:'', title:'', description:'', meeting_link:'' };
  const [form, setForm] = useState(INIT_FORM);
  const set = useCallback(k => e => setForm(f => ({ ...f, [k]: e.target.value })), []);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const today = new Date().toISOString().slice(0,10);

  // Set admin default view mode
  useEffect(() => { if (isAdmin) setViewMode('grid'); }, [isAdmin]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { date_from: weekDates[0], date_to: weekDates[6] };
      const r = await api.getScheduledClasses(params);
      setSessions(r.data || []);
    } catch (e) { showToast(e.message,'error'); }
    finally { setLoading(false); }
  }, [weekDates]);

  useEffect(() => {
    load();
    if (isAdmin) {
      api.getBatches().then(r => setAllBatches(r.data||[])).catch(()=>{});
    } else {
      // Use dedicated /my-batches endpoint — reliably returns only assigned batches
      api.getMyBatches().then(r => setMyBatches(r.data||[])).catch(()=>{});
    }
  }, [load, isAdmin, isTeacher]);

  // IDs set for filtering sessions
  const myBatchIdSet = useMemo(() => new Set(myBatches.map(b => b.id)), [myBatches]);

  // Filter sessions: teacher/student only see their batches
  const visibleSessions = useMemo(() => {
    let list = isAdmin ? sessions : sessions.filter(s => myBatchIdSet.has(s.batch_id));
    if (!isAdmin && filterBatch) list = list.filter(s => String(s.batch_id) === String(filterBatch));
    if (!isAdmin && filterDate) list = list.filter(s => s.scheduled_date === filterDate);
    return list;
  }, [sessions, isAdmin, myBatchIdSet, filterBatch, filterDate]);

  // Upcoming (not past, not cancelled) for non-admin
  const upcomingSessions = useMemo(() =>
    [...visibleSessions]
      .filter(s => s.scheduled_date >= today && s.status !== 'cancelled')
      .sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.start_time.localeCompare(b.start_time)),
    [visibleSessions, today]);

  // Show all visible sessions for teacher (past + upcoming) when filters applied
  const allVisibleSorted = useMemo(() =>
    [...visibleSessions].sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date) || a.start_time.localeCompare(b.start_time)),
    [visibleSessions]);

  const timetable = useMemo(() => {
    const map = {};
    weekDates.forEach(d => { map[d] = []; });
    visibleSessions.forEach(s => { if (map[s.scheduled_date]) map[s.scheduled_date].push(s); });
    return map;
  }, [visibleSessions, weekDates]);

  // Conflict check searches ALL loaded sessions (not just visible ones)
  function findConflict(batchId, date, startTime, endTime, excludeId=null) {
    return sessions.find(s => {
      if (excludeId && s.id === excludeId) return false;
      return s.batch_id === Number(batchId) && s.scheduled_date === date && overlaps(startTime, endTime, s.start_time, s.end_time);
    });
  }

  // Slot status for admin form
  const slotStatus = useMemo(() => {
    if (!form.scheduled_date || !form.start_time || !form.end_time) return null;
    const validationErr = validateSlot(form, today);
    if (validationErr) return validationErr;
    if (!form.batch_id) return null;
    const conflict = findConflict(form.batch_id, form.scheduled_date, form.start_time, form.end_time, showEdit?.id);
    if (conflict) return { type:'conflict', msg:`Conflict: ${conflict.batch_name} is scheduled ${conflict.start_time?.slice(0,5)}–${conflict.end_time?.slice(0,5)} on this date` };
    return { type:'ok', msg:'Slot is available' };
  }, [form.batch_id, form.scheduled_date, form.start_time, form.end_time, sessions, showEdit]);

  async function handleAdd(e) {
    e.preventDefault();
    if (slotStatus?.type === 'error') { showToast(slotStatus.msg, 'error'); return; }
    if (slotStatus?.type === 'conflict') { showToast(slotStatus.msg, 'error'); return; }
    setSaving(true);
    try { await api.createScheduledClass(form); showToast('Class scheduled!'); setShowAdd(false); setForm(INIT_FORM); load(); }
    catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (slotStatus?.type === 'error') { showToast(slotStatus.msg, 'error'); return; }
    if (slotStatus?.type === 'conflict') { showToast(slotStatus.msg, 'error'); return; }
    setSaving(true);
    try { await api.updateScheduledClass(showEdit.id, form); showToast('Updated!'); setShowEdit(null); load(); }
    catch (e) { showToast(e.message,'error'); } finally { setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    try { await api.deleteScheduledClass(showDelete.id); showToast('Deleted'); setShowDelete(null); load(); }
    catch (e) { showToast(e.message,'error'); } finally { setDeleting(false); }
  }

  function openEdit(s, e) {
    e.stopPropagation();
    setForm({ batch_id:s.batch_id, scheduled_date:s.scheduled_date, start_time:s.start_time, end_time:s.end_time, title:s.title||'', description:s.description||'', meeting_link:s.meeting_link||'' });
    setShowEdit(s);
  }

  // Week label
  const weekLabel = weekOffset === 0 ? 'This Week'
    : weekOffset === 1 ? 'Next Week'
    : weekOffset === -1 ? 'Last Week'
    : `${weekDates[0]} – ${weekDates[6]}`;

  const batchesForDropdown = isAdmin ? allBatches : myBatches;

  return (
    <DashboardLayout>
      <PageHeader
        title="Time Table"
        subtitle={isAdmin ? 'Weekly class schedule' : 'Your class schedule'}
        action={
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            {/* Week navigator — works for all roles */}
            <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.06)', borderRadius:10, padding:'3px 4px' }}>
              <button onClick={() => setWeekOffset(o => o-1)}
                style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'5px 12px', fontSize:18, fontWeight:700, lineHeight:1 }}>‹</button>
              <button onClick={() => setWeekOffset(0)}
                style={{ background:'none', border:'none', color:weekOffset===0?'#60a5fa':'#94a3b8', cursor:'pointer', padding:'5px 10px', fontSize:12, fontWeight:700, minWidth:80, textAlign:'center' }}>
                {weekLabel}
              </button>
              <button onClick={() => setWeekOffset(o => o+1)}
                style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', padding:'5px 12px', fontSize:18, fontWeight:700, lineHeight:1 }}>›</button>
            </div>

            {isAdmin && (
              <>
                <div style={{ display:'flex', background:'rgba(255,255,255,0.06)', borderRadius:10, padding:3 }}>
                  {[['grid','Grid'],['list','List']].map(([v,l]) => (
                    <button key={v} onClick={() => setViewMode(v)}
                      style={{ padding:'6px 14px', borderRadius:7, border:'none', cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', background:viewMode===v?'rgba(37,99,235,0.6)':'transparent', color:viewMode===v?'#fff':'#94a3b8', transition:'all 0.2s' }}>{l}</button>
                  ))}
                </div>
                <button onClick={() => { setForm(INIT_FORM); setShowAdd(true); }} style={S.btnPrimary}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Schedule Class
                </button>
              </>
            )}
          </div>
        } />

      {/* Teacher/student: batch + date filters */}
      {!isAdmin && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'12px 14px' }}>
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} className="cp-input"
            style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.12)', borderRadius:8, color:'#94a3b8', padding:'8px 12px', fontSize:13, cursor:'pointer', fontFamily:'inherit', outline:'none' }}>
            <option value="">All My Batches</option>
            {myBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="cp-input"
            style={{ ...S.input, width:'auto', fontSize:13 }} />
          {(filterBatch || filterDate) && (
            <button onClick={() => { setFilterBatch(''); setFilterDate(''); }} style={{ ...S.btnGhost, fontSize:12, padding:'6px 12px' }}>✕ Clear</button>
          )}
          <span style={{ fontSize:12, color:'#475569', marginLeft:'auto' }}>
            {(filterDate || filterBatch ? allVisibleSorted : upcomingSessions).length} session(s) · {weekDates[0]} – {weekDates[6]}
          </span>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36}/></div>
      ) : !isAdmin ? (
        /* ── TEACHER / STUDENT: list mode ── */
        (() => {
          const displayList = (filterDate || filterBatch) ? allVisibleSorted : upcomingSessions;
          return displayList.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'#475569' }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto 14px', display:'block' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <p style={{ fontSize:16, fontWeight:600, color:'#64748b' }}>
                {myBatches.length === 0 ? 'Not assigned to any batch yet' : 'No classes found for this period'}
              </p>
              <p style={{ fontSize:13, color:'#475569', marginTop:6 }}>Use the arrows above to browse other weeks</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {displayList.map((s, i) => (
                <ScheduleCard key={s.id} s={s} accent={BATCH_COLORS[i % BATCH_COLORS.length]} onDetail={setShowDetail} />
              ))}
            </div>
          );
        })()
      ) : viewMode === 'grid' ? (
        /* ── ADMIN: Grid view ── */
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10, marginBottom:10 }}>
            {WEEK_DAYS.map((day, i) => {
              const date = weekDates[i]; const isToday = date === today;
              return (
                <div key={day} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#64748b', marginBottom:4, fontWeight:600 }}>{day}</div>
                  <div style={{ fontSize:14, fontWeight:800, color:isToday?'#60a5fa':'#f1f5f9', background:isToday?'rgba(37,99,235,0.15)':'transparent', borderRadius:8, padding:'4px 0', border:isToday?'1px solid rgba(37,99,235,0.3)':'1px solid transparent' }}>
                    {new Date(date+'T00:00:00').getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:10, minHeight:400 }}>
            {WEEK_DAYS.map((day, i) => {
              const date = weekDates[i]; const isToday = date === today;
              const daySessions = (timetable[date]||[]).sort((a,b) => a.start_time.localeCompare(b.start_time));
              return (
                <div key={day}
                  style={{ background:isToday?'rgba(37,99,235,0.04)':'rgba(255,255,255,0.03)', border:`1px solid ${isToday?'rgba(37,99,235,0.2)':'rgba(255,255,255,0.06)'}`, borderRadius:12, padding:8, minHeight:200, cursor:'pointer', transition:'border-color 0.2s' }}
                  onClick={() => { setForm({ ...INIT_FORM, scheduled_date:date }); setShowAdd(true); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = isToday?'rgba(37,99,235,0.5)':'rgba(255,255,255,0.15)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isToday?'rgba(37,99,235,0.2)':'rgba(255,255,255,0.06)'}>
                  {daySessions.length === 0 && <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:80, color:'#334155', fontSize:11 }}>+ Add</div>}
                  {daySessions.map(s => {
                    const accent = BATCH_COLORS[allBatches.findIndex(b => b.id===s.batch_id) % BATCH_COLORS.length] || '#2563eb';
                    return (
                      <div key={s.id} onClick={e => e.stopPropagation()} style={{ background:`${accent}18`, border:`1px solid ${accent}44`, borderLeft:`3px solid ${accent}`, borderRadius:8, padding:'7px 8px', marginBottom:6 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:2 }}>{s.batch_name}</div>
                        <div style={{ fontSize:10, color:'#94a3b8', marginBottom:3 }}>{s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</div>
                        {s.title && <div style={{ fontSize:10, color:'#60a5fa', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>{s.title}</div>}
                        <div style={{ display:'flex', gap:4, alignItems:'center' }}>
                          <span style={{ fontSize:9, padding:'2px 5px', borderRadius:4, background:`${STATUS_COLOR[s.status]||'#475569'}22`, color:STATUS_COLOR[s.status]||'#94a3b8', fontWeight:700 }}>{s.status}</span>
                          <button onClick={e => openEdit(s,e)} style={{ background:'none', border:'none', cursor:'pointer', color:'#60a5fa', padding:'1px 3px', fontSize:10 }}>✏</button>
                          <button onClick={e => { e.stopPropagation(); setShowDelete(s); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#f87171', padding:'1px 3px', fontSize:10 }}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          {allBatches.length > 0 && (
            <div style={{ marginTop:14, display:'flex', gap:12, flexWrap:'wrap', alignItems:'center' }}>
              <span style={{ fontSize:11, color:'#475569' }}>Batches:</span>
              {allBatches.slice(0,7).map((b,i) => (
                <span key={b.id} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#94a3b8' }}>
                  <span style={{ width:10, height:10, background:BATCH_COLORS[i%BATCH_COLORS.length], borderRadius:3, display:'inline-block' }}/>
                  {b.name}
                </span>
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── ADMIN: List view ── */
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {visibleSessions.length === 0 ? (
            <div style={{ textAlign:'center', padding:60, color:'#475569' }}>No classes this week. Click "Schedule Class" to add.</div>
          ) : [...visibleSessions].sort((a,b) => a.scheduled_date.localeCompare(b.scheduled_date)||a.start_time.localeCompare(b.start_time)).map(s => {
            const accent = BATCH_COLORS[allBatches.findIndex(b => b.id===s.batch_id) % BATCH_COLORS.length] || '#2563eb';
            return (
              <div key={s.id} style={{ background:'rgba(255,255,255,0.04)', border:`1px solid ${accent}33`, borderLeft:`3px solid ${accent}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', gap:14 }}>
                <div style={{ minWidth:60, textAlign:'center' }}>
                  <div style={{ fontSize:11, color:'#64748b' }}>{getDayName(s.scheduled_date)}</div>
                  <div style={{ fontSize:20, fontWeight:800, color:accent, fontFamily:"'Space Grotesk',sans-serif" }}>{new Date(s.scheduled_date+'T00:00:00').getDate()}</div>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:2 }}>{s.title||s.batch_name}</div>
                  <div style={{ fontSize:12, color:'#64748b' }}>{s.batch_name} • {s.class_name} • {s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)}</div>
                  {s.meeting_link && <a href={s.meeting_link} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:'#60a5fa' }}>🔗 Meeting link</a>}
                </div>
                <span style={{ fontSize:11, padding:'3px 10px', borderRadius:8, background:`${STATUS_COLOR[s.status]||'#475569'}18`, color:STATUS_COLOR[s.status]||'#94a3b8', fontWeight:700 }}>{s.status}</span>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={e => openEdit(s,e)} style={{ ...S.btnGhost, padding:'5px 9px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => setShowDelete(s)} style={{ ...S.btnGhost, padding:'5px 9px', color:'#f87171' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)} title={showDetail?.title||showDetail?.batch_name} maxWidth={460}>
        {showDetail && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Batch', value:showDetail.batch_name },
              { label:'Class', value:showDetail.class_name },
              { label:'Date', value:`${getDayName(showDetail.scheduled_date)}, ${showDetail.scheduled_date}` },
              { label:'Time', value:`${showDetail.start_time?.slice(0,5)} – ${showDetail.end_time?.slice(0,5)}` },
              { label:'Status', value:showDetail.status },
              showDetail.description && { label:'Notes', value:showDetail.description },
            ].filter(Boolean).map(r => (
              <div key={r.label} style={{ display:'flex', gap:12 }}>
                <div style={{ fontSize:12, color:'#64748b', width:70, flexShrink:0 }}>{r.label}</div>
                <div style={{ fontSize:14, color:'#f1f5f9', fontWeight:600 }}>{r.value}</div>
              </div>
            ))}
            {showDetail.meeting_link && (
              <a href={showDetail.meeting_link} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px', background:'rgba(37,99,235,0.15)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:10, color:'#60a5fa', fontWeight:700, textDecoration:'none', marginTop:6 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.845v6.31a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
                Join Meeting
              </a>
            )}
          </div>
        )}
      </Modal>

      {/* Admin: Schedule Form Modal (shared for add/edit) */}
      {isAdmin && (() => {
        const isEdit = !!showEdit;
        const open = isEdit ? !!showEdit : showAdd;
        const onClose = isEdit ? () => setShowEdit(null) : () => { setShowAdd(false); setForm(INIT_FORM); };

        return (
          <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Scheduled Class' : 'Schedule New Class'} maxWidth={520}>
            <form onSubmit={isEdit ? handleEdit : handleAdd}>
              <FormSelect label="Batch *" value={form.batch_id} onChange={set('batch_id')} required>
                <option value="">Select batch</option>
                {allBatches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.class_name}</option>)}
              </FormSelect>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 16px' }}>
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>Date * <span style={{ fontSize:11, color:'#64748b' }}>(cannot be past)</span></label>
                  <input type="date" value={form.scheduled_date} onChange={set('scheduled_date')}
                    min={today} className="cp-input" style={S.input} required />
                </div>
                <FormInput label="Title / Topic" value={form.title} onChange={set('title')} placeholder="e.g. Chapter 5" />
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>Start Time *</label>
                  <input type="time" value={form.start_time} onChange={set('start_time')} className="cp-input" style={S.input} required />
                </div>
                <div style={{ marginBottom:16 }}>
                  <label style={S.label}>End Time * <span style={{ fontSize:11, color:'#64748b' }}>(must be after start)</span></label>
                  <input type="time" value={form.end_time} onChange={set('end_time')}
                    min={form.start_time||undefined} className="cp-input" style={S.input} required />
                </div>
              </div>
              <FormInput label="Meeting Link (optional)" value={form.meeting_link} onChange={set('meeting_link')} placeholder="https://meet.google.com/..." />
              <FormTextarea label="Notes" value={form.description} onChange={set('description')} rows={2} />

              {/* Live slot status — shows errors, conflicts, or availability */}
              {slotStatus && (
                <div style={{
                  background: slotStatus.type==='ok' ? 'rgba(22,163,74,0.08)' : slotStatus.type==='conflict' ? 'rgba(220,38,38,0.08)' : 'rgba(217,119,6,0.08)',
                  border: `1px solid ${slotStatus.type==='ok' ? 'rgba(22,163,74,0.3)' : slotStatus.type==='conflict' ? 'rgba(220,38,38,0.3)' : 'rgba(217,119,6,0.3)'}`,
                  borderRadius:10, padding:'10px 14px', marginBottom:16, display:'flex', alignItems:'center', gap:8
                }}>
                  <span style={{ fontSize:15 }}>
                    {slotStatus.type==='ok' ? '✓' : slotStatus.type==='conflict' ? '⚠' : '✕'}
                  </span>
                  <span style={{ fontSize:13, fontWeight:600, color: slotStatus.type==='ok'?'#4ade80':slotStatus.type==='conflict'?'#f87171':'#fbbf24' }}>
                    {slotStatus.msg}
                  </span>
                </div>
              )}

              <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
                <button type="button" onClick={onClose} style={S.btnGhost}>Cancel</button>
                <button type="submit" style={S.btnPrimary} disabled={saving || slotStatus?.type==='error' || slotStatus?.type==='conflict'}>
                  {saving ? <Spinner size={16} color="#fff"/> : isEdit ? 'Save Changes' : 'Schedule'}
                </button>
              </div>
            </form>
          </Modal>
        );
      })()}

      <ConfirmDialog open={!!showDelete} onClose={() => setShowDelete(null)} onConfirm={handleDelete} loading={deleting}
        title="Delete Session?" message={`Remove "${showDelete?.batch_name}" on ${showDelete?.scheduled_date}?`} />
    </DashboardLayout>
  );
}
