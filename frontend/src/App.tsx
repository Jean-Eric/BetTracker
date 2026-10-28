import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Admin from './pages/Admin';
import Home from './pages/Home';
import Login from './pages/Login';
import './index.css';

function MainApp() {
  const [role, setRole] = useState<string | null>(localStorage.getItem('bt_role'));
  const navigate = useNavigate();

  if (!role) {
    return (
      <div className="app-container">
        <Login setRole={setRole} />
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem('bt_role');
    setRole(null);
    navigate('/');
  };

  return (
    <>
      <nav style={{ background: '#0f172a', color: 'white', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link to="/" style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
            BetTracker <span style={{ color: '#3b82f6' }}>PRO</span>
          </Link>
          
          <div style={{ display: 'flex', gap: '1.8rem' }}>
            <NavLink to="/" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#94a3b8', fontWeight: 600, fontSize: '0.95rem' })}>Pronos du jour</NavLink>
            <NavLink to="/matches" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#94a3b8', fontWeight: 600, fontSize: '0.95rem' })}>Matchs du jour</NavLink>
            <NavLink to="/dashboard" style={({ isActive }) => ({ color: isActive ? '#60a5fa' : '#94a3b8', fontWeight: 600, fontSize: '0.95rem' })}>Statistiques</NavLink>
            
            {role === 'admin' && (
              <NavLink to="/admin" style={({ isActive }) => ({ color: '#fbbf24', fontWeight: 'bold', background: 'rgba(251, 191, 36, 0.1)', padding: '0.4rem 0.8rem', borderRadius: '8px' })}>
                ⚙️ Admin
              </NavLink>
            )}
          </div>
        </div>
        
        <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
          Déconnexion
        </button>
      </nav>
      
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {role === 'admin' && <Route path="/admin" element={<Admin />} />}
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
