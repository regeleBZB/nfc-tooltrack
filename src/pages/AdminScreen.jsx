import React, { useState } from 'react';

// ── Reusable sub-components ──────────────────────────────────────────────────

function StatCard({ label, value, sub, valueColor }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(11,26,53,0.7), rgba(46,44,0,0.5))',
      border: '1px solid var(--gold-border)',
      borderRadius: '12px',
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '60px', height: '60px', borderRadius: '50%',
        background: 'var(--gold-glow)', transform: 'translate(20px,-20px)',
      }} />
      <div style={{
        fontFamily: "'Space Mono', monospace", fontSize: '9px',
        letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase',
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: '38px',
        fontWeight: 700, color: valueColor || 'var(--old-gold)', lineHeight: 1.1, marginTop: '4px',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{
      fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '13px',
      letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--old-gold)',
      marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      {children}
      <div style={{ flex: 1, height: '1px', background: 'var(--gold-border)' }} />
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Available: { bg: 'rgba(34,197,94,0.15)',  color: '#4ade80', border: 'rgba(34,197,94,0.3)' },
    Borrowed:  { bg: 'rgba(190,183,0,0.15)',  color: 'var(--old-gold)', border: 'var(--gold-border)' },
    Overdue:   { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.3)' },
  };
  const c = map[status] || map.Available;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      letterSpacing: '1px', fontWeight: 700,
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {status}
    </span>
  );
}

function RoleBadge({ role }) {
  const map = {
    Admin:      { bg: 'rgba(26,58,107,0.4)',   color: '#93c5fd', border: 'rgba(59,130,246,0.3)' },
    Instructor: { bg: 'rgba(152,146,0,0.2)',   color: 'var(--olive)', border: 'rgba(152,146,0,0.3)' },
    Student:    { bg: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: 'rgba(255,255,255,0.1)' },
  };
  const c = map[role] || map.Student;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '20px',
      fontFamily: "'Space Mono', monospace", fontSize: '9px', letterSpacing: '1px',
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {role}
    </span>
  );
}

function TagChip({ id }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      background: 'rgba(26,58,107,0.4)', border: '1px solid rgba(59,130,246,0.2)',
      borderRadius: '3px', fontFamily: "'Space Mono', monospace",
      fontSize: '9px', color: '#93c5fd', marginLeft: '4px',
    }}>
      {id}
    </span>
  );
}

function Panel({ children }) {
  return (
    <div style={{
      background: 'linear-gradient(160deg, rgba(11,26,53,0.5), rgba(4,4,0,0.8))',
      border: '1px solid var(--gold-border)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      {children}
    </div>
  );
}

function PanelHeader({ title, children }) {
  return (
    <div style={{
      padding: '16px 20px',
      borderBottom: '1px solid var(--gold-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(190,183,0,0.04)',
    }}>
      <span style={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: '14px',
        fontWeight: 600, letterSpacing: '2px', color: 'var(--old-gold)',
      }}>
        {title}
      </span>
      {children}
    </div>
  );
}

function SearchInput({ placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: '6px 12px',
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(190,183,0,0.15)',
        borderRadius: '4px',
        color: 'var(--text-bright)',
        fontSize: '12px',
        fontFamily: "'DM Sans', sans-serif",
        outline: 'none',
        width: '140px',
      }}
    />
  );
}

// ── Initial mock data ────────────────────────────────────────────────────────

const INITIAL_TOOLS = [
  { id: 1, name: 'Digital Multimeter',  tag: 'NFC-A3F7', status: 'Borrowed' },
  { id: 2, name: 'Oscilloscope Probe',  tag: 'NFC-B2C1', status: 'Available' },
  { id: 3, name: 'Function Generator',  tag: 'NFC-D4E9', status: 'Overdue' },
  { id: 4, name: 'Breadboard Kit',      tag: 'NFC-F1A2', status: 'Available' },
  { id: 5, name: 'DC Power Supply',     tag: 'NFC-G9B3', status: 'Borrowed' },
];

const INITIAL_USERS = [
  { id: 1, name: 'Reyes, Maria',    studentId: '2024-00421', role: 'Student' },
  { id: 2, name: 'Santos, Luis',    studentId: '2023-01182', role: 'Student' },
  { id: 3, name: 'Prof. Dela Cruz', studentId: 'INS-0042',  role: 'Instructor' },
  { id: 4, name: 'Admin User',      studentId: 'ADM-001',   role: 'Admin' },
];

const FEED = [
  { type: 'borrow', text: 'Reyes, Maria borrowed Digital Multimeter', tag: 'NFC-A3F7', time: 'Today · 09:42 AM · EE301-3A' },
  { type: 'return', text: 'Santos, Luis returned Breadboard Kit',      tag: 'NFC-F1A2', time: 'Today · 09:31 AM · EE205-2B' },
  { type: 'overdue',text: 'Cruz, Ana — Function Generator OVERDUE 2d', tag: 'NFC-D4E9', time: 'Due · May 15 · EE301-3A' },
  { type: 'borrow', text: 'Gomez, R. borrowed DC Power Supply',        tag: 'NFC-G9B3', time: 'Today · 08:55 AM · EE402-4A' },
  { type: 'return', text: 'Torres, J. returned Oscilloscope Probe',    tag: 'NFC-B2C1', time: 'Today · 08:20 AM · EE205-2B' },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminScreen() {
  const [tools, setTools]           = useState(INITIAL_TOOLS);
  const [users, setUsers]           = useState(INITIAL_USERS);
  const [toolSearch, setToolSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [newTool, setNewTool]       = useState({ name: '', tag: '' });

  const addTool = () => {
    if (!newTool.name || !newTool.tag) return;
    setTools(prev => [...prev, { id: Date.now(), ...newTool, status: 'Available' }]);
    setNewTool({ name: '', tag: '' });
    // TODO: POST /api/tools
  };

  const removeTool = (id) => {
    setTools(prev => prev.filter(t => t.id !== id));
    // TODO: DELETE /api/tools/:id
  };

  const removeUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    // TODO: DELETE /api/users/:id
  };

  const filteredTools = tools.filter(t =>
    t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
    t.tag.toLowerCase().includes(toolSearch.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.studentId.toLowerCase().includes(userSearch.toLowerCase())
  );

  const tdStyle = {
    padding: '11px 16px', fontSize: '13px',
    color: 'var(--text-bright)', borderBottom: '1px solid rgba(255,255,255,0.04)',
  };
  const thStyle = {
    padding: '10px 16px', textAlign: 'left',
    fontFamily: "'Space Mono', monospace", fontSize: '9px',
    letterSpacing: '2px', color: 'var(--text-muted)', textTransform: 'uppercase',
    borderBottom: '1px solid rgba(190,183,0,0.1)',
    background: 'rgba(11,26,53,0.3)',
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)',
      background: 'linear-gradient(160deg, rgba(11,26,53,0.5) 0%, var(--black) 40%)',
      padding: '32px',
    }}>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '28px' }}>
        <StatCard label="Total Tools"       value={tools.length}                            sub={`${tools.filter(t=>t.status==='Available').length} available`} />
        <StatCard label="Currently Borrowed" value={tools.filter(t=>t.status==='Borrowed').length}  sub={`${tools.filter(t=>t.status==='Overdue').length} overdue`} valueColor="var(--warning)" />
        <StatCard label="Active Users"       value={users.length}                            sub={`${users.filter(u=>u.role==='Instructor').length} instructors`} valueColor="var(--info)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>

        {/* LEFT COLUMN */}
        <div>

          {/* Tool Inventory */}
          <SectionTitle>Tool Inventory</SectionTitle>
          <Panel>
            <PanelHeader title="All Tools">
              <SearchInput placeholder="Search tools…" value={toolSearch} onChange={e => setToolSearch(e.target.value)} />
            </PanelHeader>

            {/* Add tool form */}
            <div style={{ padding: '16px 20px', display: 'flex', gap: '8px' }}>
              <input
                placeholder="Tool name"
                value={newTool.name}
                onChange={e => setNewTool(p => ({ ...p, name: e.target.value }))}
                style={{ flex: 1, padding: '9px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(190,183,0,0.15)', borderRadius: '6px', color: 'var(--text-bright)', fontSize: '12px', outline: 'none' }}
              />
              <input
                placeholder="NFC Tag ID"
                value={newTool.tag}
                onChange={e => setNewTool(p => ({ ...p, tag: e.target.value }))}
                style={{ width: '120px', padding: '9px 12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(190,183,0,0.15)', borderRadius: '6px', color: 'var(--text-bright)', fontSize: '12px', outline: 'none' }}
              />
              <button onClick={addTool} style={{ padding: '9px 18px', background: 'var(--old-gold)', border: 'none', borderRadius: '6px', color: 'var(--black)', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '12px', letterSpacing: '1px', cursor: 'pointer' }}>
                + Add
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Tool</th>
                  <th style={thStyle}>NFC Tag</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTools.map(tool => (
                  <tr key={tool.id}>
                    <td style={tdStyle}>{tool.name}</td>
                    <td style={tdStyle}><TagChip id={tool.tag} /></td>
                    <td style={tdStyle}><StatusBadge status={tool.status} /></td>
                    <td style={tdStyle}>
                      <button onClick={() => removeTool(tool.id)} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '1px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'transparent' }}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          {/* User Management */}
          <div style={{ marginTop: '20px' }}>
            <SectionTitle>User Management</SectionTitle>
            <Panel>
              <PanelHeader title="Registered Users">
                <SearchInput placeholder="Search users…" value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </PanelHeader>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td style={tdStyle}>{user.name}</td>
                      <td style={{ ...tdStyle, fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{user.studentId}</td>
                      <td style={tdStyle}><RoleBadge role={user.role} /></td>
                      <td style={tdStyle}>
                        <button onClick={() => removeUser(user.id)} style={{ padding: '4px 12px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: '1px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'transparent' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <SectionTitle>Live Activity Feed</SectionTitle>
          <Panel>
            <PanelHeader title="Recent Transactions">
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block', animation: 'liveDot 1.5s infinite' }} />
                LIVE
              </div>
            </PanelHeader>
            <div style={{ padding: '0 20px 16px' }}>
              {FEED.map((item, i) => {
                const dotColor = { borrow: '#BEB700', return: '#4ade80', overdue: '#f87171' }[item.type];
                return (
                  <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor, boxShadow: `0 0 6px ${dotColor}`, marginTop: '4px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-bright)', lineHeight: 1.5 }}>
                        {item.text}<TagChip id={item.tag} />
                      </div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px' }}>{item.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Quick actions */}
          <div style={{ marginTop: '20px' }}>
            <SectionTitle>Quick Actions</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: '📋  Export Borrow Report', bg: 'var(--old-gold)', color: 'var(--black)' },
                { label: '📡  Register New NFC Tag', bg: 'var(--accent-blue)', color: '#fff' },
                { label: '🔔  Send Overdue Reminders', bg: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' },
              ].map((btn, i) => (
                <button key={i} style={{ width: '100%', padding: '12px', background: btn.bg, border: btn.border || 'none', borderRadius: '6px', color: btn.color, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: '13px', letterSpacing: '1px', cursor: 'pointer' }}>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
