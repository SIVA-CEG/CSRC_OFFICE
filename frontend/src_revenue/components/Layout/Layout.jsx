import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';

const COLORS = {
  bgStart: '#eef7f1',
  bgEnd: '#fbfdfc',
};

export default function Layout() {
  return (
    <div style={styles.shell}>
      {/* Global font import + fine-grained states that inline style objects can't express */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700&display=swap');

        * { box-sizing: border-box; }
        html, body, #root { height: 100%; }

        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(20,108,67,0.25); border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(20,108,67,0.4); }

        a { -webkit-tap-highlight-color: transparent; }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Navbar />
      <Sidebar />

      <main style={styles.main}>
        <div style={styles.mainInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    background: `linear-gradient(160deg, ${COLORS.bgStart} 0%, ${COLORS.bgEnd} 55%, ${COLORS.bgStart} 100%)`,
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
  },
  main: {
    marginLeft: 254,
    paddingTop: 76,
    minHeight: '100vh',
  },
  mainInner: {
    padding: '32px 36px 48px',
    maxWidth: '100%',
  },
};