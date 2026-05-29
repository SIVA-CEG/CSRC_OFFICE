import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function UnderConstruction({ module }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f5f7' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 20, padding: 40
        }}>
          <div style={{ fontSize: 72 }}>🚧</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#1a1a2e' }}>
            Under Construction
          </h2>
          <p style={{ fontSize: 15, color: '#9ca3af', maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
            The <strong style={{ color: '#c0001e' }}>{module}</strong> module is currently being developed.
            It will be available soon.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: 16, padding: '12px 28px', background: 'linear-gradient(135deg,#c0001e,#e8002a)',
              color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Outfit, sans-serif', letterSpacing: 0.5
            }}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}