import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Home() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadData = () => {
    api.get('/analyses/').then(res => {
      const today = new Date().toLocaleDateString('fr-FR');
      const todayAnalyses = res.data.filter((a: any) => {
        const analysisDate = new Date(a.created_at).toLocaleDateString('fr-FR');
        return analysisDate === today;
      });
      setAnalyses(todayAnalyses);
    });
    
    api.get('/ads/').then(res => setAds(res.data.filter((a: any) => a.is_active)));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      setRefreshKey(old => old + 1);
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Bannière réduite */}
      <div className="hero-banner" style={{ padding: '1.5rem 1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.3rem' }}>Pronos du jour 🎯</h1>
        <p style={{ fontSize: '0.95rem' }}>Bienvenue sur BetTracker PRO. L'analyse est un art, la discipline est la clé.</p>
      </div>

      {ads.length > 0 && (
        <div className="marquee-container" style={{ marginBottom: '1.5rem' }}>
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
        // Cartes centrées et de largeur limitée
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
          {analyses.map((a) => (
            <div key={a.id} className="card" style={{ maxWidth: '350px', width: '100%', padding: '1rem', borderLeft: '5px solid ' + (a.status === 'PENDING' ? '#f59e0b' : a.status === 'WON' ? '#10b981' : '#ef4444') }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <span className="text-muted" style={{ fontSize: '0.75rem', margin: 0, color: '#64748b' }}>{new Date(a.created_at).toLocaleDateString('fr-FR')}</span>
                <span className={'badge ' + (a.status === 'PENDING' ? 'badge-pending' : a.status === 'WON' ? 'badge-won' : 'badge-lost')} style={{ fontSize: '0.65rem', padding: '0.2rem 0.6rem' }}>
                  {a.status === 'PENDING' ? 'En attente' : a.status === 'WON' ? 'Gagné' : 'Perdu'}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1rem', marginBottom: '0.3rem', textAlign: 'center', fontWeight: 800, color: '#1e293b' }}>
                {a.match.home_team.name} <span style={{ color: '#94a3b8', margin: '0 0.3rem', fontSize: '0.85rem', fontWeight: 500 }}>vs</span> {a.match.away_team.name}
              </h3>

              {a.match.status !== 'NS' && (
                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                  <div style={{ display: 'inline-block', background: '#f1f5f9', padding: '0.2rem 0.8rem', borderRadius: '6px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {a.match.home_goals} - {a.match.away_goals}
                    </span>
                    {['1H', '2H', 'HT', 'ET', 'LIVE'].includes(a.match.status) && a.match.elapsed !== null && (
                      <span style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 'bold', marginLeft: '0.5rem' }}>
                        {a.match.elapsed}'
                      </span>
                    )}
                  </div>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                <span className="badge badge-info" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>{a.prediction_type} : {a.prediction_value}</span>
                {a.odds_at_analysis && <span className="badge" style={{ background: '#f0fdf4', color: '#166534', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Cote : {a.odds_at_analysis}</span>}
                <span className="badge" style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>Confiance : {a.confidence}/5</span>
              </div>

              {a.reasoning && (
                <p style={{ color: '#475569', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.8rem', margin: 0 }}>
                  "{a.reasoning}"
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem', maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.2rem' }}>Pronostics en cours d'analyse...</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Les pronostics du jour seront publiés très prochainement.</p>
        </div>
      )}
    </div>
  );
}
