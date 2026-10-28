import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stats/current')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'white' }}>Chargement...</div>;

  if (!data || data.total === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem', maxWidth: '400px', margin: '3rem auto' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Statistiques</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Aucune sélection n'est disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Statistiques</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>Analyse personnalisée</p>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '0.8rem 0.2rem' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>Taux</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: data.win_rate >= 50 ? '#10b981' : '#ef4444' }}>
            {data.win_rate}%
          </p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '0.8rem 0.2rem' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>Gagnés</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#10b981' }}>{data.won}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '0.8rem 0.2rem' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>Perdus</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#ef4444' }}>{data.lost}</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '0.8rem 0.2rem' }}>
          <h3 style={{ color: '#6b7280', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.3rem' }}>Attente</h3>
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f59e0b' }}>{data.pending}</p>
        </div>
      </div>

      <h2 style={{ marginBottom: '0.8rem', fontSize: '1.2rem' }}>Détail des pronostics</h2>
      
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#64748b' }}>Match</th>
              <th style={{ padding: '0.5rem', textAlign: 'left', color: '#64748b' }}>Prono</th>
              <th style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>Cote</th> {/* <-- NOUVELLE COLONNE */}
              <th style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>Score</th>
              <th style={{ padding: '0.5rem', textAlign: 'center', color: '#64748b' }}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {data.details.map((item: any) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '0.5rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.home_team}</div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.away_team}</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{item.league}</div>
                </td>
                <td style={{ padding: '0.5rem' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>{item.prediction_value}</span>
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 600, color: '#475569' }}>
                  {item.odds_at_analysis || '-'}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                  {item.match_status !== 'NS' ? item.home_goals + ' - ' + item.away_goals : '-'}
                </td>
                <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                  <span className={'badge ' + (item.status === 'PENDING' ? 'badge-pending' : item.status === 'WON' ? 'badge-won' : 'badge-lost')} style={{ fontSize: '0.6rem', padding: '0.1rem 0.3rem' }}>
                    {item.status === 'PENDING' ? 'Attente' : item.status === 'WON' ? 'Gagné' : 'Perdu'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
