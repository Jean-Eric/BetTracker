import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Home() {
  const [analyses, setAnalyses] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analyses/').then(res => setAnalyses(res.data));
  }, []);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Pronostics du moment</h1>
      <p style={{ color: '#6b7280' }}>Analyses publiées par l'expert BetTracker</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
        {analyses.map((a) => (
          <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.5rem', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {new Date(a.created_at).toLocaleDateString('fr-FR')}
            </div>
            
            <h3 style={{ margin: '0 0 1rem 0' }}>
              {a.match.home_team.name} vs {a.match.away_team.name}
            </h3>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
                {a.prediction_type} : {a.prediction_value}
              </div>
              {a.odds_at_analysis && (
                <div style={{ background: '#f0fdf4', color: '#166534', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
                  Cote : {a.odds_at_analysis}
                </div>
              )}
              <div style={{ background: '#fef3c7', color: '#92400e', padding: '0.5rem 1rem', borderRadius: '4px', fontWeight: 'bold' }}>
                Confiance : {a.confidence}/5
              </div>
            </div>

            {a.reasoning && (
              <p style={{ color: '#374151', lineHeight: '1.5', margin: 0, fontStyle: 'italic' }}>
                "{a.reasoning}"
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
