import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ setRole }: { setRole: (r: string) => void }) {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      setRole('admin');
      localStorage.setItem('bt_role', 'admin');
      navigate('/admin');
    } else if (password === 'user') {
      setRole('user');
      localStorage.setItem('bt_role', 'user');
      navigate('/');
    } else {
      alert('Mot de passe incorrect (essayez "admin" ou "user")');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h2>Connexion BetTracker</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>Entrez "admin" ou "user" pour tester.</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn btn-primary">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
