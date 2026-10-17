import { useEffect, useState } from 'react';
import { api } from '../api/client';

interface Team {
  id: number;
  name: string;
  logo_url: string;
}

interface Match {
  id: number;
  match_date: string;
  status: string;
  home_goals: number | null;
  away_goals: number | null;
  home_team: Team;
  away_team: Team;
  league: { name: string } | null;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/matches/today')
      .then(res => {
        setMatches(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement des matchs...</div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center' }}>Matchs du jour</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {matches.map((m) => (
          <div key={m.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: 'white' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>
              {m.league?.name || 'Compétition inconnue'}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Équipe Domicile */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <img src={m.home_team.logo_url} alt={m.home_team.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>{m.home_team.name}</span>
              </div>

              {/* Score / Heure */}
              <div style={{ flex: 1, textAlign: 'center' }}>
                {m.status === 'NS' ? (
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                    {new Date(m.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                ) : (
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {m.home_goals} - {m.away_goals}
                  </div>
                )}
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>
                  {m.status === 'FT' ? 'Terminé' : m.status === 'NS' ? 'À venir' : 'En cours'}
                </div>
              </div>

              {/* Équipe Extérieur */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <img src={m.away_team.logo_url} alt={m.away_team.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>{m.away_team.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
