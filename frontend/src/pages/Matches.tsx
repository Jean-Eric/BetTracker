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
  const [expandedLeagues, setExpandedLeagues] = useState<Record<string, boolean>>({});
  
  // On récupère le rôle pour cacher le bouton Analyser
  const role = localStorage.getItem('bt_role');

  useEffect(() => {
    api.get('/matches/today')
      .then(res => { 
        setMatches(res.data); 
        setLoading(false); 
        const initialExpanded: Record<string, boolean> = {};
        res.data.forEach((m: Match) => {
          if (m.league?.name) initialExpanded[m.league.name] = true;
        });
        setExpandedLeagues(initialExpanded);
      })
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

  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const leagueName = match.league?.name || 'Autres compétitions';
    if (!acc[leagueName]) acc[leagueName] = [];
    acc[leagueName].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  const toggleLeague = (leagueName: string) => {
    setExpandedLeagues(prev => ({ ...prev, [leagueName]: !prev[leagueName] }));
  };

  const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'white' }}>Chargement...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>Matchs du jour</h1>
        <p className="text-muted" style={{ fontSize: '0.9rem', margin: 0 }}>Sélectionnez un match pour l'analyser</p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[{ key: 'all', label: 'Tous' }, { key: 'live', label: '🔴 En cours' }, { key: 'upcoming', label: '⏳ À venir' }, { key: 'finished', label: '✅ Terminés' }].map(f => (
          <button 
            key={f.key} 
            onClick={() => setFilterStatus(f.key)} 
            className={'btn ' + (filterStatus === f.key ? 'btn-primary' : 'btn-outline')}
            style={{ borderRadius: '999px', padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {Object.entries(groupedMatches).map(([leagueName, leagueMatches]) => {
          const isExpanded = expandedLeagues[leagueName] !== false;

          return (
            <div key={leagueName}>
              <div 
                onClick={() => toggleLeague(leagueName)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '0.3rem', marginBottom: isExpanded ? '0.8rem' : '0.3rem' }}
              >
                <h2 style={{ fontSize: '1rem', margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  🏆 {leagueName} 
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal' }}>({leagueMatches.length})</span>
                </h2>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  {isExpanded ? '▼' : '▶'}
                </span>
              </div>

              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {leagueMatches.map((m) => (
                    <div key={m.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(255,255,255,0.95)', gap: '0.5rem' }}>
                      
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', textAlign: 'right', minWidth: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.home_team.name}</span>
                        <img src={m.home_team.logo_url} alt={m.home_team.name} style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                      </div>

                      <div style={{ flex: '0 0 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {m.status === 'NS' ? (
                          <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#2563eb' }}>{formatTime(m.match_date)}</div>
                        ) : (
                          <>
                            <div style={{ fontSize: '1rem', fontWeight: 'bold', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '6px', color: '#1e293b' }}>
                              {m.home_goals} - {m.away_goals}
                            </div>
                            {['1H', '2H', 'HT', 'ET', 'LIVE'].includes(m.status) && m.elapsed !== null && (
                              <div style={{ fontSize: '0.7rem', color: '#ef4444', fontWeight: 'bold', marginTop: '0.1rem' }}>{m.elapsed}'</div>
                            )}
                          </>
                        )}
                      </div>

                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                        <img src={m.away_team.logo_url} alt={m.away_team.name} style={{ width: '24px', height: '24px', objectFit: 'contain', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.away_team.name}</span>
                      </div>

                      {/* Bouton Analyser caché pour les non-admins */}
                      {role === 'admin' && (
                        <div style={{ flex: '0 0 70px', textAlign: 'right' }}>
                          {m.status !== 'FT' && (
                            <Link to={'/admin?match_id=' + m.id} className="btn btn-primary" style={{ padding: '0.3rem 0.5rem', fontSize: '0.7rem', borderRadius: '6px' }}>
                              Analyser
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
