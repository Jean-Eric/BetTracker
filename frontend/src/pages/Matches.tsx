import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

interface Team { id: number; name: string; logo_url: string; }
interface Match {
  id: number; match_date: string; status: string;
  elapsed: number | null;
  home_goals: number | null; away_goals: number | null;
  home_team: Team; away_team: Team; league: { name: string } | null;
}

export default function Matches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    api.get('/matches/today')
      .then(res => { setMatches(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  const isToday = (dateString: string) => {
    const d = new Date(dateString);
    const today = new Date();
    return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  };

  const filteredMatches = matches.filter(m => {
    if (!isToday(m.match_date)) return false;
    if (filterStatus === 'finished' && m.status !== 'FT') return false;
    if (filterStatus === 'live' && !['1H', '2H', 'HT', 'ET', 'LIVE'].includes(m.status)) return false;
    if (filterStatus === 'upcoming' && m.status !== 'NS') return false;
    return true;
  });

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Chargement...</div>;

  return (
    <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center' }}>Matchs du jour</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'Tous' }, { key: 'live', label: '🔴 En cours' }, { key: 'upcoming', label: '⏳ À venir' }, { key: 'finished', label: '✅ Terminés' }].map(f => (
          <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{ padding: '0.6rem 1.2rem', borderRadius: '20px', border: '1px solid #ccc', background: filterStatus === f.key ? '#2563eb' : 'white', color: filterStatus === f.key ? 'white' : '#374151', fontWeight: 'bold', cursor: 'pointer' }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ fontSize: '0.9rem', color: '#6b7280', textAlign: 'center', marginBottom: '1rem' }}>{filteredMatches.length} match(s) trouvé(s)</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredMatches.map((m) => (
          <div key={m.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem', background: 'white', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem', textAlign: 'center' }}>{m.league?.name || 'Compétition inconnue'}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <img src={m.home_team.logo_url} alt={m.home_team.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>{m.home_team.name}</span>
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                {m.status === 'NS' ? (
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>{formatTime(m.match_date)}</div>
                ) : (
                  <>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{m.home_goals} - {m.away_goals}</div>
                    {['1H', '2H', 'HT', 'ET', 'LIVE'].includes(m.status) && m.elapsed !== null && (
                      <div style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 'bold', marginTop: '0.2rem' }}>{m.elapsed}'</div>
                    )}
                  </>
                )}
                <div style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '0.2rem' }}>{m.status === 'FT' ? 'Terminé' : m.status === 'NS' ? 'À venir' : 'En cours'}</div>
                
                {m.status !== 'FT' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to={'/admin?match_id=' + m.id} style={{ fontSize: '0.75rem', color: '#2563eb', textDecoration: 'none', border: '1px solid #2563eb', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      ✍️ Analyser
                    </Link>
                  </div>
                )}
              </div>
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
