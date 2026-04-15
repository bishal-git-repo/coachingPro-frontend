'use client';
import { useState, useEffect } from 'react';
import { S, colors } from '../../lib/styles';

// ── SPINNER ──────────────────────────────────────────────────
export function Spinner({ size = 24, color = '#2563eb' }) {
  return (
    <div style={{
      width: size, height: size, border: `3px solid rgba(255,255,255,0.1)`,
      borderTopColor: color, borderRadius: '50%',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── TOAST ────────────────────────────────────────────────────
let toastFn = null;
export function showToast(msg, type = 'success') {
  if (toastFn) toastFn(msg, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    toastFn = (msg, type) => {
      const id = Date.now();
      setToasts(t => [...t, { id, msg, type }]);
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === 'error' ? '#1a0a0a' : '#0a1a0f',
          border: `1px solid ${t.type === 'error' ? 'rgba(220,38,38,0.4)' : 'rgba(22,163,74,0.4)'}`,
          borderRadius: 12, padding: '12px 20px',
          color: t.type === 'error' ? '#f87171' : '#4ade80',
          fontSize: 14, fontWeight: 500,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.3s ease',
          maxWidth: 360, display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {t.type === 'error' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          )}
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes slideInRight{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

// ── MODAL ────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', fn);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', fn);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div style={S.modal} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...S.modalBox, maxWidth, width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', width: 32, height: 32, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── FORM INPUT ─────────────────────────────────────────────────────────────────
// KEY FIX: Removed local focused state. It caused parent re-renders which
// unmounted inputs on every keystroke, losing focus. CSS handles focus styles instead.
export function FormInput({ label, error, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={S.label}>{label}</label>}
      <input
        {...props}
        className="cp-input"
        style={{
          ...S.input,
          borderColor: error ? 'rgba(220,38,38,0.5)' : undefined,
        }}
      />
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── FORM SELECT ──────────────────────────────────────────────
// FIX: Proper select appearance with custom arrow, fixed broken gender dropdown UI
export function FormSelect({ label, error, children, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={S.label}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <select
          {...props}
          className="cp-input"
          style={{
            ...S.input,
            cursor: 'pointer',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            paddingRight: 36,
            borderColor: error ? 'rgba(220,38,38,0.5)' : undefined,
          }}
        >
          {children}
        </select>
        <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', display: 'flex', alignItems: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── FORM TEXTAREA ────────────────────────────────────────────
export function FormTextarea({ label, error, rows = 3, ...props }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {label && <label style={S.label}>{label}</label>}
      <textarea {...props} rows={rows} className="cp-input" style={{ ...S.input, resize: 'vertical', lineHeight: 1.6 }} />
      {error && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ── STAT CARD ────────────────────────────────────────────────
export function StatCard({ icon, label, value, sub, color = '#2563eb', gradient }) {
  const bg = gradient || `linear-gradient(135deg, ${color}22, ${color}11)`;
  return (
    <div style={{ background: bg, border: `1px solid ${color}33`, borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 52, height: 52, background: `${color}22`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {typeof icon === 'string' ? <span style={{ fontSize: 24 }}>{icon}</span> : icon}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: color, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── STATUS BADGE ─────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    active: 'green', inactive: 'red', paid: 'green', pending: 'yellow',
    overdue: 'red', partial: 'purple', present: 'green', absent: 'red',
    late: 'yellow', scheduled: 'blue', completed: 'green', cancelled: 'red',
  };
  return <span style={S.badge(map[status] || 'gray')}>{status}</span>;
}

// ── EMPTY STATE ──────────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', opacity: 0.4 }}>
        {icon ? (typeof icon === 'string' ? <span style={{ fontSize: 48 }}>{icon}</span> : icon) : (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        )}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{desc}</div>
      {action}
    </div>
  );
}

// ── CONFIRM DIALOG ───────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null;
  return (
    <div style={S.modal}>
      <div style={{ ...S.modalBox, maxWidth: 420, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, background: 'rgba(220,38,38,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.5" fill="#f87171"/>
            </svg>
          </div>
        </div>
        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f1f5f9', marginBottom: 10 }}>{title}</h3>
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={onClose} style={S.btnGhost}>Cancel</button>
          <button onClick={onConfirm} style={S.btnDanger} disabled={loading}>
            {loading ? <Spinner size={16} color="#f87171" /> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── SEARCH INPUT ─────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', alignItems: 'center' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="cp-input"
        style={{ ...S.input, paddingLeft: 38, maxWidth: 320 }}
      />
    </div>
  );
}

// ── PAGE HEADER ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="page-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
      <div>
        <h1 style={S.pageTitle}>{title}</h1>
        {subtitle && <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
