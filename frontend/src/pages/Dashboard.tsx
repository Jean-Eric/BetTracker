import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/stats/global')
      .then(res => setStats(res.data))
      .catch(err => {
        console.error(err);
        setError('Erreur lors du chargement des statistiques');
      });
  }, []);

  if (error) return <div style={{ color: 'red', padding: '1rem' }}>{error}</div>;
  if (!stats) return <div style={{ padding: '1rem' }}>Chargement...</div>;

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>Tableau de bord</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>ROI Global</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: stats.roi.roi >= 0 ? '#16a34a' : '#dc2626' }}>
            {stats.roi.roi}%
          </p>
        </div>
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>Win Rate</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.roi.win_rate}%</p>
        </div>
        <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '8px', flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280' }}>Paris résolus</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.roi.count}</p>
        </div>
      </div>

      <div style={{ background: stats.trend.signal === 'danger' ? '#fee2e2' : stats.trend.signal === 'good' ? '#dcfce7' : '#f3f4f6', padding: '1rem', borderRadius: '8px' }}>
        <strong>Signal de tendance : </strong> {stats.trend.message}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Par bookmaker</h2>
      <ul>
        {stats.by_bookmaker.map((b: any) => (
          <li key={b.name}>
            {b.name} : {b.placed} placés / {b.generated} générés
          </li>
        ))}
      </ul>
    </div>
  );
}
