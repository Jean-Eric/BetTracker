import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère la sélection depuis le localStorage
    const idsParam = localStorage.getItem('bt_selected_stats');
    
    if (idsParam) {
      const ids = idsParam.split(',').map(Number);
      api.post('/stats/calculate', ids)
        .then(res => { setStats(res.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'white' }}>Calcul en cours...</div>;

  // Message pour l'utilisateur simple (sans lien vers l'admin)
  if (!stats) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '3rem auto' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>Statistiques</h1>
        <p style={{ color: '#64748b' }}>Aucune sélection de pronostics n'est disponible pour le moment. Revenez plus tard.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1>Statistiques de la sélection</h1>
        <p className="text-muted">Analyse personnalisée</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Taux de réussite</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: stats.win_rate >= 50 ? '#10b981' : '#ef4444' }}>
            {stats.win_rate}%
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Gagnés</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981' }}>{stats.won}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Perdus</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ef4444' }}>{stats.lost}</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>En attente</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending}</p>
        </div>
      </div>
    </div>
  );
}
