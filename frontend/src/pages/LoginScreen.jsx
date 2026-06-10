import React, { useState } from 'react';
import { AuthAPI, setToken } from '../api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await AuthAPI.login(username, password);

      const tok = res.token ?? res.accessToken ?? res.data?.token;
      if (!tok) throw new Error('No token in response');
      onLogin(tok, username);
    } catch (err) {
      setError(err.message === 'HTTP 401'
        ? 'Invalid username or password.'
        : err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 56px)', background: '#F5F3EE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: '#fff', border: '1px solid #E5E3DF', borderRadius: 16,
        padding: '40px 36px', width: 360, boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: '#01696f', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>🔧</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: '#28251d' }}>Admin Login</div>
          <div style={{ fontSize: 12, color: '#7A7974', marginTop: 4 }}>ToolTrack · AMT Lab</div>
        </div>
      
        {error && (
          <div style={{ background: '#FEECEB', color: '#C0392B', borderRadius: 8, padding: '9px 13px', fontSize: 13, marginBottom: 18 }}>
            {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7A7974', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. admin"
            autoFocus
            style={{ width: '100%', padding: '10px 13px', border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 14, color: '#28251d', background: '#F9F8F5', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e  => e.target.style.borderColor = '#01696f'}
            onBlur={e   => e.target.style.borderColor = '#E5E3DF'}
          />
        </div>
        {/* Password */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#7A7974', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            style={{ width: '100%', padding: '10px 13px', border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 14, color: '#28251d', background: '#F9F8F5', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
            onFocus={e  => e.target.style.borderColor = '#01696f'}
            onBlur={e   => e.target.style.borderColor = '#E5E3DF'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '11px', background: loading ? '#7A7974' : '#01696f',
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In →'}
        </button>

        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: '#BAB9B4' }}>
          Kiosk mode is always accessible without login
        </div>
      </div>
    </div>
  );
}