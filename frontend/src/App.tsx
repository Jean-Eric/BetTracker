import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewCoupon from './pages/NewCoupon';
import Matches from './pages/Matches';
import Admin from './pages/Admin';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: '#1f2937', color: 'white', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>BetTracker</Link>
        <Link to="/" style={{ color: '#d1d5db', textDecoration: 'none' }}>Accueil</Link>
        <Link to="/matches" style={{ color: '#d1d5db', textDecoration: 'none' }}>Matchs</Link>
        <Link to="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none' }}>Mon Dashboard</Link>
        <Link to="/new" style={{ color: '#d1d5db', textDecoration: 'none' }}>Nouveau Coupon</Link>
        <Link to="/admin" style={{ color: '#fbbf24', textDecoration: 'none', marginLeft: 'auto' }}>⚙️ Admin</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/new" element={<NewCoupon />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
