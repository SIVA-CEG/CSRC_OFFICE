import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './Dashboard.css';

const modules = [
  { id: 'master', title: 'MASTER', icon: '⚙️', desc: 'Manage campus, departments, faculties and more', route: '/master', active: true },
  { id: 'tapals', title: 'MY TAPALS', icon: '📬', desc: 'Inward & outward tapal management', route: '/my-tapals', active: false },
  { id: 'endorsements', title: 'ENDORSEMENTS', icon: '✅', desc: 'Approval and endorsement workflows', route: '/endorsements', active: false },
  { id: 'projects', title: 'PROJECTS', icon: '🔬', desc: 'Research project tracking & management', route: '/projects', active: false },
  { id: 'dst-inspire', title: 'DST INSPIRE', icon: '🌟', desc: 'DST INSPIRE scheme management', route: '/dst-inspire', active: false },
  { id: 'dst-inspire-faculty', title: 'DST INSPIRE FACULTY', icon: '👨‍🏫', desc: 'Faculty award and fellowship tracking', route: '/dst-inspire-faculty', active: false },
  { id: 'women-scientist', title: 'WOMEN SCIENTIST', icon: '👩‍🔬', desc: 'Women scientist scheme management', route: '/women-scientist', active: false },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dash-root">
      <Navbar />
      <div className="dash-body">
        <div className="dash-welcome">
          <div>
            <h1 className="dash-heading">Good Morning, Admin 👋</h1>
            <p className="dash-subheading">Select a module to get started with CSRC Proceedings</p>
          </div>
          <div className="dash-date">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        <div className="dash-grid">
          {modules.map((mod, i) => (
            <div
              key={mod.id}
              className={`dash-card ${mod.active ? 'dash-card--active' : 'dash-card--wip'}`}
              style={{ animationDelay: `${i * 0.08}s` }}
              onClick={() => navigate(mod.route)}
            >
              <div className="dash-card-top">
                <div className="dash-card-icon">{mod.icon}</div>
                {!mod.active && <span className="dash-wip-tag">Soon</span>}
              </div>
              <h3 className="dash-card-title">{mod.title}</h3>
              <p className="dash-card-desc">{mod.desc}</p>
              <div className="dash-card-arrow">
                {mod.active ? '→' : '🚧'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}