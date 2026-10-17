import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewCoupon from './pages/NewCoupon';
import Matches from './pages/Matches';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: '#1f2937', color: 'white', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>BetTracker</Link>
        <Link to="/" style={{ color: '#d1d5db', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/matches" style={{ color: '#d1d5db', textDecoration: 'none' }}>Matchs du jour</Link>
        <Link to="/new" style={{ color: '#d1d5db', textDecoration: 'none' }}>+ Nouveau Coupon</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewCoupon />} />
        <Route path="/matches" element={<Matches />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
