'use client';
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { Spinner, PageHeader, showToast } from '../../../components/ui/index';
import { S } from '../../../lib/styles';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

const STATUS_CFG = {
  present: { color:'#16a34a', bg:'rgba(22,163,74,0.15)', border:'rgba(22,163,74,0.3)', label:'Present' },
  absent:  { color:'#dc2626', bg:'rgba(220,38,38,0.15)',  border:'rgba(220,38,38,0.3)',  label:'Absent' },
  late:    { color:'#d97706', bg:'rgba(217,119,6,0.15)',  border:'rgba(217,119,6,0.3)',  label:'Late' },
};

export default function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  const [myBatches, setMyBatches] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0,10));
  const [checking, setChecking] = useState(false);
  const [session, setSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load classes and batches filtered to user role
  useEffect(() => {
    if (isAdmin) {
      api.getClasses().then(r => setAllClasses(r.data||[])).catch(()=>{});
      api.getBatches().then(r => setAllBatches(r.data||[])).catch(()=>{});
    } else {
      // Use /my-batches endpoint — reliably returns only assigned batches
      api.getMyBatches().then(r => {
        const batches = r.data || [];
        setMyBatches(batches);
        // Extract unique classes
        const classMap = {};
        batches.forEach(b => { if (b.class_name) classMap[b.class_name] = { id: b.class_name, name: b.class_name }; });
        setAllClasses(Object.values(classMap));
        setAllBatches(batches);
      }).catch(()=>{});
    }
  }, [isAdmin, isTeacher]);

  const filteredBatches = selectedClass
    ? allBatches.filter(b => isAdmin ? b.class_id === parseInt(selectedClass) : b.class_name === selectedClass)
    : allBatches;

  function resetSession() { setSession(null); setStudents([]); setMarks({}); setSaved(false); }
  useEffect(() => { resetSession(); }, [selectedBatch, attendanceDate]);

  async function checkSession() {
    if (!selectedBatch || !attendanceDate) return;
    setChecking(true);
    try {
      const batchId = isAdmin ? selectedBatch : (allBatches.find(b => b.id == selectedBatch || b.name === selectedBatch)?.id || selectedBatch);
      const r = await api.getScheduledClasses({ batch_id: batchId, date_from: attendanceDate, date_to: attendanceDate });
      const found = (r.data||[])[0] || null;
      if (!found) { setSession(false); return; }
      setSession(found);

      if (isStudent) {
        // Student: just show their own status
        try {
          const ar = await api.getSessionAttendance(found.id);
          const myRecord = (ar.data||[]).find(a => a.student_id === user?.id || a.id === user?.id);
          setStudents([{ id: user?.id, name: user?.name, status: myRecord?.status || 'not marked' }]);
          if (myRecord) setMarks({ [user?.id]: myRecord.status });
        } catch { setStudents([{ id: user?.id, name: user?.name, status: 'not marked' }]); }
        return;
      }

      // Admin / Teacher: load all students and mark attendance
      const br = await api.getBatch(batchId);
      const studs = br.data?.students || [];
      setStudents(studs);
      const m = {};
      studs.forEach(s => { m[s.id] = 'absent'; });
      try {
        const ar = await api.getSessionAttendance(found.id);
        (ar.data||[]).forEach(a => { if (a.status) m[a.student_id||a.id] = a.status; });
      } catch {}
      setMarks(m);
    } catch (e) { showToast(e.message,'error'); }
    finally { setChecking(false); }
  }

  function setMark(studentId, status) {
    setMarks(prev => ({ ...prev, [studentId]: status }));
  }

  function setAllStatus(status) {
    const m = {};
    students.forEach(s => { m[s.id] = status; });
    setMarks(m);
  }

  async function saveAttendance() {
    if (!session || isStudent) return;
    setSaving(true);
    try {
      const records = Object.entries(marks).map(([student_id, status]) => ({ student_id: Number(student_id), status }));
      await api.markAttendance({ scheduled_class_id: session.id, records });
      showToast('Attendance saved!');
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) { showToast(e.message,'error'); }
    finally { setSaving(false); }
  }

  const presentCount = Object.values(marks).filter(s => s==='present').length;
  const absentCount = Object.values(marks).filter(s => s==='absent').length;
  const lateCount = Object.values(marks).filter(s => s==='late').length;
  const total = students.length;
  const pct = total > 0 ? Math.round((presentCount/total)*100) : 0;

  return (
    <DashboardLayout>
      <PageHeader title="Attendance" subtitle={isStudent ? 'View your attendance for a session' : 'Mark attendance for a scheduled class'} />

      {/* Filters */}
      <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:14, padding:18, marginBottom:20 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, alignItems:'flex-end' }}>
          <div>
            <label style={S.label}>Date *</label>
            <input type="date" value={attendanceDate} onChange={e => setAttendanceDate(e.target.value)} className="cp-input" style={S.input} />
          </div>
          <div>
            <label style={S.label}>Class (filter)</label>
            <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedBatch(''); }} className="cp-input" style={S.input}>
              <option value="">All Classes</option>
              {allClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Batch *</label>
            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} className="cp-input" style={S.input}>
              <option value="">Select Batch</option>
              {filteredBatches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ ...S.label, opacity:0 }}>.</label>
            <button onClick={checkSession} disabled={!selectedBatch||!attendanceDate||checking}
              style={{ ...S.btnPrimary, width:'100%', justifyContent:'center', padding:'10px' }}>
              {checking ? <Spinner size={16} color="#fff" /> : 'Check Session'}
            </button>
          </div>
        </div>
      </div>

      {session === null && (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#475569' }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ margin:'0 auto 14px', display:'block' }}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <p style={{ fontSize:16, fontWeight:600, color:'#64748b' }}>Select a batch and date, then click "Check Session"</p>
        </div>
      )}

      {session === false && (
        <div style={{ background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.25)', borderRadius:14, padding:'28px 24px', textAlign:'center' }}>
          <p style={{ fontSize:15, fontWeight:700, color:'#fbbf24', marginBottom:8 }}>No Scheduled Class Found</p>
          <p style={{ fontSize:13, color:'#92400e' }}>No class scheduled for this batch on <strong>{attendanceDate}</strong>.</p>
          {(isAdmin||isTeacher) && <p style={{ fontSize:12, color:'#78350f', marginTop:6 }}>Go to <strong>Time Table</strong> to schedule a class first.</p>}
        </div>
      )}

      {session && session !== false && (
        <>
          {/* Session info */}
          <div style={{ background:'rgba(37,99,235,0.08)', border:'1px solid rgba(37,99,235,0.2)', borderRadius:12, padding:'12px 18px', marginBottom:20, display:'flex', gap:16, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:13, color:'#60a5fa', fontWeight:700 }}>{session.batch_name}</span>
            <span style={{ fontSize:13, color:'#94a3b8' }}>{session.start_time?.slice(0,5)} – {session.end_time?.slice(0,5)}</span>
            {session.title && <span style={{ fontSize:13, color:'#64748b' }}>{session.title}</span>}
          </div>

          {isStudent ? (
            /* Student: just show own status */
            <div style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:28, textAlign:'center' }}>
              <div style={{ fontSize:14, color:'#64748b', marginBottom:12 }}>Your attendance for this session</div>
              {(() => {
                const status = marks[user?.id] || students[0]?.status || 'not marked';
                const cfg = STATUS_CFG[status];
                return cfg ? (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:12, background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:16, padding:'20px 40px' }}>
                    <div style={{ fontSize:36 }}>{status==='present'?'✓':status==='absent'?'✗':'⏰'}</div>
                    <div style={{ fontSize:22, fontWeight:800, color:cfg.color }}>{cfg.label}</div>
                  </div>
                ) : (
                  <div style={{ fontSize:16, color:'#64748b' }}>Not marked yet</div>
                );
              })()}
            </div>
          ) : (
            /* Admin / Teacher: mark attendance with 3 checkboxes */
            <>
              {/* Stats */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
                {[{label:'Total',value:total,color:'#94a3b8'},{label:'Present',value:presentCount,color:'#4ade80'},{label:'Absent',value:absentCount,color:'#f87171'},{label:'Late',value:lateCount,color:'#fbbf24'}].map(it => (
                  <div key={it.label} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:22, fontWeight:800, color:it.color, fontFamily:"'Space Grotesk',sans-serif" }}>{it.value}</div>
                    <div style={{ fontSize:11, color:'#64748b', marginTop:3 }}>{it.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {total > 0 && (
                <div style={{ marginBottom:16, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:10, padding:'12px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:12, color:'#94a3b8' }}>Attendance Rate</span>
                    <span style={{ fontSize:13, fontWeight:800, color:pct>=75?'#4ade80':'#f87171' }}>{pct}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(255,255,255,0.08)', borderRadius:4, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg,${pct>=75?'#16a34a':'#dc2626'},${pct>=75?'#4ade80':'#f87171'})`, borderRadius:4, transition:'width 0.4s' }} />
                  </div>
                </div>
              )}

              {/* Mark all */}
              <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center' }}>
                <span style={{ fontSize:12, color:'#64748b' }}>Mark all:</span>
                {Object.entries(STATUS_CFG).map(([status, cfg]) => (
                  <button key={status} onClick={() => setAllStatus(status)}
                    style={{ padding:'6px 14px', border:`1px solid ${cfg.border}`, borderRadius:8, background:cfg.bg, color:cfg.color, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                    {cfg.label}
                  </button>
                ))}
              </div>

              {/* Student list with 3 radio buttons */}
              {students.length === 0 ? (
                <div style={{ textAlign:'center', padding:40, color:'#475569' }}>No students in this batch</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:24 }}>
                  {students.map(s => {
                    const current = marks[s.id] || 'absent';
                    return (
                      <div key={s.id} style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:'12px 16px', display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:36, height:36, background:'linear-gradient(135deg,#2563eb,#4f46e5)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, flexShrink:0 }}>{s.name?.[0]}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                          {s.roll_number && <div style={{ fontSize:11, color:'#64748b' }}>Roll: {s.roll_number}</div>}
                        </div>
                        {/* 3 checkboxes */}
                        <div style={{ display:'flex', gap:6 }}>
                          {Object.entries(STATUS_CFG).map(([status, cfg]) => (
                            <button key={status} onClick={() => setMark(s.id, status)}
                              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1.5px solid ${current===status?cfg.color:cfg.border}`, background:current===status?cfg.bg:'transparent', color:current===status?cfg.color:'#64748b', fontSize:12, fontWeight:current===status?700:400, cursor:'pointer', fontFamily:'inherit', transition:'all 0.15s' }}>
                              {current === status && <span>✓</span>}
                              {cfg.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {students.length > 0 && (
                <div style={{ position:'sticky', bottom:16, display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={saveAttendance} disabled={saving}
                    style={{ ...S.btnPrimary, background:saved?'linear-gradient(135deg,#16a34a,#15803d)':undefined, padding:'12px 28px', fontSize:15, fontWeight:700, boxShadow:'0 8px 24px rgba(37,99,235,0.3)' }}>
                    {saving ? <Spinner size={18} color="#fff" /> : saved ? '✓ Saved!' : 'Save Attendance'}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
