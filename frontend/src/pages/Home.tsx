import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Home() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analyses/').then(res => {
      const today = new Date().toLocaleDateString('fr-FR');
      const todayAnalyses = res.data.filter((a: any) => {
        const analysisDate = new Date(a.created_at).toLocaleDateString('fr-FR');
        return analysisDate === today;
      });
      setAnalyses(todayAnalyses);
    });
    
    api.get('/ads/').then(res => setAds(res.data.filter((a: any) => a.is_active)));
  }, []);

  return (
    <div>
      <div className="hero-banner">
        <h1>Pronos du jour 🎯</h1>
        <p>Bienvenue sur BetTracker PRO. L'analyse est un art, la discipline est la clé.</p>
      </div>

      {ads.length > 0 && (
        <div className="marquee-container">
          <div className="marquee-content">
            {ads.map(ad => (
              <span key={ad.id}><strong>{ad.title}</strong> : {ad.content}</span>
            ))}
            {ads.map(ad => (
              <span key={'dup-' + ad.id}><strong>{ad.title}</strong> : {ad.content}</span>
            ))}
          </div>
        </div>
      )}

      {analyses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {analyses.map((a) => (
            <div key={a.id} className="card" style={{ borderLeft: '6px solid ' + (a.status === 'PENDING' ? '#f59e0b' : a.status === 'WON' ? '#10b981' : '#ef4444') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem', margin: 0, color: '#64748b' }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                <span className={'badge ' + (a.status === 'PENDING' ? 'badge-pending' : a.status === 'WON' ? 'badge-won' : 'badge-lost')}>
                  {a.status === 'PENDING' ? 'En attente' : a.status === 'WON' ? 'Gagné' : 'Perdu'}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.2rem', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>
                {a.match.home_team.name} <span style={{ color: '#94a3b8', margin: '0 0.5rem', fontSize: '1rem', fontWeight: 500 }}>vs</span> {a.match.away_team.name}
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info">{a.prediction_type} : {a.prediction_value}</span>
                {a.odds_at_analysis && <span className="badge" style={{ background: '#f0fdf4', color: '#166534' }}>Cote : {a.odds_at_analysis}</span>}
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e' }}>Confiance : {a.confidence}/5</span>
              </div>

              {a.reasoning && (
                <p style={{ color: '#475569', fontSize: '0.95rem', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '1.2rem', margin: 0 }}>
                  "{a.reasoning}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>Vos pronostics sont en cours d'analyse...</h2>
          <p style={{ color: '#64748b' }}>Les pronostics du jour seront publiés très prochainement. Revenez d'ici peu !</p>
        </div>
      )}
    </div>
  );
}
