import React, { useState, useEffect, useCallback } from 'react';
import { TransactionAPI } from '../api';


const T = {
  teal: '#01696f', tealBg: '#CEDCD8',
  ink: '#28251d', ink2: '#7A7974', ink3: '#BAB9B4',
  border: '#E5E3DF', surface: '#FFFFFF', surface2: '#F9F8F5',
  green: '#437a22', greenBg: '#D4DFCC',
  red: '#C0392B', redBg: '#FEECEB',
  amber: '#B45309', amberBg: '#FEF3DC',
};

const OVERDUE_HOURS = 24;       // borrows older than this are flagged
const FETCH_SIZE    = 200;      // transactions pulled for the computation

const hoursSince = (iso) => (Date.now() - new Date(iso).getTime()) / 3_600_000;

function agoLabel(iso) {
  const h = hoursSince(iso);
  if (h < 1)  return `${Math.max(1, Math.round(h * 60))} min ago`;
  if (h < 24) return `${Math.round(h)} hr ago`;
  return `${Math.round(h / 24)} day${Math.round(h / 24) === 1 ? '' : 's'} ago`;
}

export default function BorrowedToolsPanel({ onReturned }) {
  const [txs,         setTxs]         = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [returningId, setReturningId] = useState(null);
  const [unchecked,   setUnchecked]   = useState({}); // itemId -> true means "do not return"
  const [notes,       setNotes]       = useState({}); // txId   -> condition note

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await TransactionAPI.getAll({ size: FETCH_SIZE });
      const list = res?.data?.content ?? res?.data ?? [];
      setTxs(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const borrowTxs = txs.filter(t => String(t.type).toUpperCase() === 'BORROW');

  const active = borrowTxs
    .map(t => ({ ...t, unreturned: (t.items || []).filter(i => !i.returned) }))
    .filter(t => t.unreturned.length > 0)
    .sort((a, b) => new Date(a.transactedAt) - new Date(b.transactedAt)); // oldest (most overdue) first

  const overdueCount = active.filter(t => hoursSince(t.transactedAt) >= OVERDUE_HOURS).length;
  const outCount     = active.reduce((n, t) => n + t.unreturned.length, 0);

  const ranking = (() => {
    const counts = {};
    for (const t of borrowTxs) {
      for (const it of (t.items || [])) {
        const key = it.toolCode || it.toolName || `#${it.toolId}`;
        if (!counts[key]) counts[key] = { code: it.toolCode, name: it.toolName, count: 0 };
        counts[key].count += 1;
      }
    }
    return Object.values(counts).sort((a, b) => b.count - a.count);
  })();
  const maxCount = ranking.length ? ranking[0].count : 0;

  const borrower = (t) => t.student?.name || t.borrowerName || 'Walk-in';
  const isChecked = (id) => !unchecked[id];
  const toggle = (id) => setUnchecked(u => ({ ...u, [id]: !u[id] }));

  const handleReturn = async (tx) => {
    const ids = tx.unreturned.filter(i => isChecked(i.id)).map(i => i.id);
    if (ids.length === 0) return;
    setReturningId(tx.id);
    setError('');
    try {
      await TransactionAPI.returnItems(tx.id, ids, notes[tx.id] || '');
      await load();
      if (onReturned) onReturned();
    } catch (e) {
      setError(e.message || 'Return failed — please try again.');
    } finally {
      setReturningId(null);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.ink }}>Tool Returns &amp; Tracking</div>
          <div style={{ fontSize: 12, color: T.ink2, marginTop: 2 }}>Return borrowed tools and review borrowing activity.</div>
        </div>
        <button onClick={load} style={btn.ghost}>↻ Refresh</button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <Chip label="Tools currently out" value={outCount} color={T.teal} bg={T.tealBg} />
        <Chip label={`Overdue (>${OVERDUE_HOURS}h)`} value={overdueCount}
              color={overdueCount ? T.red : T.green} bg={overdueCount ? T.redBg : T.greenBg} />
      </div>

      {error && <div style={box.error}>{error}</div>}

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* ── Unreturned list ── */}
        <div style={{ flex: '2 1 420px', minWidth: 320 }}>
          <SectionTitle>Currently Borrowed</SectionTitle>

          {loading ? (
            <div style={box.muted}>Loading…</div>
          ) : active.length === 0 ? (
            <div style={box.muted}>✓ Nothing is out — all tools have been returned.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {active.map(tx => {
                const overdue = hoursSince(tx.transactedAt) >= OVERDUE_HOURS;
                return (
                  <div key={tx.id} style={{ ...card.base, borderColor: overdue ? T.red : T.border }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 700, color: T.ink, fontSize: 14 }}>{borrower(tx)}</div>
                        <div style={{ fontSize: 11, color: T.ink2, marginTop: 2 }}>
                          Receipt {tx.receiptNumber} · borrowed {agoLabel(tx.transactedAt)}
                        </div>
                      </div>
                      {overdue && <span style={badge.overdue}>OVERDUE</span>}
                    </div>

                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {tx.unreturned.map(item => (
                        <label key={item.id} style={row.item}>
                          <input type="checkbox" checked={isChecked(item.id)} onChange={() => toggle(item.id)} />
                          <span style={{ fontWeight: 600, color: T.ink, flex: 1 }}>{item.toolName}</span>
                          <span style={{ fontFamily: 'monospace', fontSize: 11, color: T.ink3 }}>{item.toolCode}</span>
                        </label>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Condition note (optional) — e.g. returned with scratch"
                      value={notes[tx.id] || ''}
                      onChange={e => setNotes(n => ({ ...n, [tx.id]: e.target.value }))}
                      style={input.note}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                      <button
                        onClick={() => handleReturn(tx)}
                        disabled={returningId === tx.id}
                        style={{ ...btn.primary, opacity: returningId === tx.id ? 0.6 : 1 }}
                      >
                        {returningId === tx.id ? 'Returning…' : '✓ Mark Returned'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Most borrowed ── */}
        <div style={{ flex: '1 1 260px', minWidth: 240 }}>
          <SectionTitle>Most Borrowed Tools</SectionTitle>
          {loading ? (
            <div style={box.muted}>Loading…</div>
          ) : ranking.length === 0 ? (
            <div style={box.muted}>No borrow history yet.</div>
          ) : (
            <div style={{ ...card.base, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {ranking.slice(0, 8).map((r, i) => (
                <div key={r.code || r.name || i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: T.ink, fontWeight: 600 }}>
                      {i + 1}. {r.name}{r.code ? ` (${r.code})` : ''}
                    </span>
                    <span style={{ color: T.teal, fontWeight: 700 }}>{r.count}×</span>
                  </div>
                  <div style={{ height: 8, background: T.surface2, borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${maxCount ? (r.count / maxCount) * 100 : 0}%`,
                      background: T.teal, borderRadius: 999, transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Small presentational helpers ──────────────────────────────────────────────
function SectionTitle({ children }) {
  return <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.ink3, marginBottom: 10 }}>{children}</div>;
}
function Chip({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, borderRadius: 10, padding: '10px 16px', minWidth: 120 }}>
      <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: 11, color, opacity: 0.85, marginTop: 2 }}>{label}</div>
    </div>
  );
}

const card = {
  base: { background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 12, padding: 16 },
};
const box = {
  muted: { background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 10, padding: '18px 16px', color: T.ink2, fontSize: 13 },
  error: { background: T.redBg, color: T.red, borderRadius: 8, padding: '9px 12px', fontSize: 12, marginBottom: 14 },
};
const row = {
  item: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: T.surface2, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 13, cursor: 'pointer' },
};
const input = {
  note: { width: '100%', marginTop: 10, padding: '8px 12px', border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, color: T.ink, background: T.surface, outline: 'none', boxSizing: 'border-box' },
};
const badge = {
  overdue: { background: T.redBg, color: T.red, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 999, flexShrink: 0 },
};
const btn = {
  primary: { padding: '9px 18px', background: T.teal, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' },
  ghost:   { padding: '7px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12, fontWeight: 600, color: T.ink2, cursor: 'pointer', fontFamily: 'inherit' },
};