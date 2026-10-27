import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';

export default function Admin() {
  const [searchParams] = useSearchParams();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [matchInfo, setMatchInfo] = useState<any>(null);
  
  // État pour la cote manuelle
  const [manualOdds, setManualOdds] = useState('');

  const [form, setForm] = useState({
    match_id: searchParams.get('match_id') || '',
    prediction_type: '1X2',
    prediction_value: '',
    odds_at_analysis: '',
    reasoning: '',
    confidence: 3
  });

  const loadAnalyses = () => {
    api.get('/analyses/').then(res => setAnalyses(res.data));
  };

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    if (form.match_id && form.match_id.length > 3) {
      api.get('/matches/' + form.match_id)
        .then(res => setMatchInfo(res.data))
        .catch(() => setMatchInfo(null));
    } else {
      setMatchInfo(null);
    }
  }, [form.match_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/analyses/', {
        ...form,
        match_id: parseInt(form.match_id),
        odds_at_analysis: form.odds_at_analysis ? parseFloat(form.odds_at_analysis) : null,
        confidence: parseInt(form.confidence.toString())
      });
      setMessage('✅ Analyse publiée !');
      setForm({ ...form, prediction_value: '', odds_at_analysis: '', reasoning: '' });
      loadAnalyses();
    } catch (err) {
      setMessage('❌ Erreur lors de la publication.');
    }
  };

  const applyManualOdds = () => {
    if (manualOdds) {
      setForm({ ...form, odds_at_analysis: manualOdds });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1>Back-Office</h1>
      
      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
        <h2>Créer une analyse</h2>
        {message && <div style={{ padding: '0.5rem', background: '#dcfce7', color: '#166534', borderRadius: '4px', marginBottom: '1rem' }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>ID du match</label>
              <input type="number" value={form.match_id} onChange={e => setForm({...form, match_id: e.target.value})} required style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Type de pari</label>
              <select value={form.prediction_type} onChange={e => setForm({...form, prediction_type: e.target.value})} style={{ width: '100%', padding: '0.5rem' }}>
                <option value="1X2">1X2 (Vainqueur)</option>
                <option value="Over/Under">Over/Under (Buts)</option>
                <option value="BTTS">Les deux équipes marquent</option>
              </select>
            </div>
          </div>

          {matchInfo && (
            <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>{matchInfo.league?.name}</div>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={matchInfo.home_team.logo_url} alt="Home" style={{ width: '40px', height: '40px' }} />
                  <span style={{ fontWeight: 'bold' }}>{matchInfo.home_team.name}</span>
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {matchInfo.status === 'NS' ? 'vs' : matchInfo.home_goals + ' - ' + matchInfo.away_goals}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img src={matchInfo.away_team.logo_url} alt="Away" style={{ width: '40px', height: '40px' }} />
                  <span style={{ fontWeight: 'bold' }}>{matchInfo.away_team.name}</span>
                </div>
              </div>
              
              {/* AJOUT : Saisie manuelle de la cote depuis le BO */}
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
                <input 
                  type="number" step="0.01" 
                  placeholder="Cote (ex: 1.85)" 
                  value={manualOdds} 
                  onChange={e => setManualOdds(e.target.value)} 
                  style={{ width: '120px', padding: '0.3rem', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                <button type="button" onClick={applyManualOdds} style={{ padding: '0.3rem 0.6rem', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Utiliser cette cote
                </button>
              </div>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label>Pronostic</label>
              <input type="text" placeholder="ex: PSG" value={form.prediction_value} onChange={e => setForm({...form, prediction_value: e.target.value})} required style={{ width: '100%', padding: '0.5rem' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Cote enregistrée</label>
              <input type="number" step="0.01" value={form.odds_at_analysis} onChange={e => setForm({...form, odds_at_analysis: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
            </div>
          </div>

          <div>
            <label>Analyse</label>
            <textarea rows={2} value={form.reasoning} onChange={e => setForm({...form, reasoning: e.target.value})} style={{ width: '100%', padding: '0.5rem' }} />
          </div>

          <button type="submit" style={{ padding: '0.8rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
            Publier l'analyse
          </button>
        </form>
      </div>

      <h2>Historique de mes analyses</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
        <thead>
          <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Match</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Pronostic</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Cote</th>
            <th style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>Statut</th>
          </tr>
        </thead>
        <tbody>
          {analyses.map((a) => (
            <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '0.5rem' }}>{a.match.home_team.name} vs {a.match.away_team.name}</td>
              <td style={{ padding: '0.5rem' }}>{a.prediction_type} : {a.prediction_value}</td>
              <td style={{ padding: '0.5rem' }}>{a.odds_at_analysis || '-'}</td>
              <td style={{ padding: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', background: a.status === 'PENDING' ? '#fef3c7' : a.status === 'WON' ? '#dcfce7' : '#fee2e2', color: a.status === 'PENDING' ? '#92400e' : a.status === 'WON' ? '#166534' : '#991b1b' }}>
                  {a.status === 'PENDING' ? 'En attente' : a.status === 'WON' ? 'Gagné' : 'Perdu'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
