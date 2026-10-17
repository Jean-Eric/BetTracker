import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NewCoupon from './pages/NewCoupon';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '1rem', background: '#1f2937', color: 'white', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>BetTracker</Link>
        <Link to="/" style={{ color: '#d1d5db', textDecoration: 'none' }}>Dashboard</Link>
        <Link to="/new" style={{ color: '#d1d5db', textDecoration: 'none' }}>+ Nouveau Coupon</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/new" element={<NewCoupon />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
