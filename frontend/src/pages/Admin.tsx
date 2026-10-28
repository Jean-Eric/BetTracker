import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Admin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'analyses' | 'ads'>('analyses');
  
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [matchInfo, setMatchInfo] = useState<any>(null);
  const [manualOdds, setManualOdds] = useState('');

  const [form, setForm] = useState({
    match_id: searchParams.get('match_id') || '',
    prediction_type: '1X2',
    prediction_value: '',
    odds_at_analysis: '',
    reasoning: '',
    confidence: 3
  });

  const [adForm, setAdForm] = useState({ title: '', content: '', color: '#3b82f6' });
  const [ads, setAds] = useState<any[]>([]);

  const loadAnalyses = () => {
    api.get('/analyses/').then(res => setAnalyses(res.data));
  };

  const loadAds = () => {
    api.get('/ads/').then(res => setAds(res.data));
  };

  useEffect(() => { 
    loadAnalyses(); 
    loadAds();
  }, []);

  useEffect(() => {
    if (form.match_id) setActiveTab('analyses');
  }, [form.match_id]);

  useEffect(() => {
    if (form.match_id && form.match_id.length > 3) {
      api.get('/matches/' + form.match_id).then(res => setMatchInfo(res.data)).catch(() => setMatchInfo(null));
    } else {
      setMatchInfo(null);
    }
  }, [form.match_id]);

  const handleSubmitAnalysis = async (e: React.FormEvent) => {
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

  const handleSubmitAd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/ads/', adForm);
      alert('✅ Publicité créée !');
      setAdForm({ title: '', content: '', color: '#3b82f6' });
      loadAds();
    } catch (err) {
      alert('❌ Erreur lors de la création de la pub.');
    }
  };

  const handleToggleAd = async (id: number) => {
    try {
      await api.put('/ads/' + id + '/toggle');
      loadAds();
    } catch (err) {
      alert('❌ Erreur lors de la modification.');
    }
  };

  const toggleSelection = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const goToStats = () => {
    if (selectedIds.length === 0) {
      alert("Veuillez sélectionner au moins un pronostic.");
      return;
    }
    // On sauvegarde dans le localStorage pour la persistance
    localStorage.setItem('bt_selected_stats', selectedIds.join(','));
    navigate('/dashboard');
  };

  return (
    <div className="admin-page">
      <h1>Back-Office</h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('analyses')} 
          className={'btn ' + (activeTab === 'analyses' ? 'btn-primary' : 'btn-outline')}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          📊 Analyses
        </button>
        <button 
          onClick={() => setActiveTab('ads')} 
          className={'btn ' + (activeTab === 'ads' ? 'btn-primary' : 'btn-outline')}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          📢 Publicités
        </button>
      </div>

      {activeTab === 'analyses' && (
        <>
          {form.match_id && (
            <div className="card" style={{ marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem auto', border: '2px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>Analyser ce match</h2>
                <Link to="/admin" className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Annuler</Link>
              </div>
              
              {message && <div style={{ padding: '0.8rem', background: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#166534' : '#991b1b', borderRadius: '8px', marginBottom: '1rem', fontWeight: 600 }}>{message}</div>}
              
              <form onSubmit={handleSubmitAnalysis} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <div>
                  <label>ID du match</label>
                  <input type="number" value={form.match_id} readOnly style={{ background: '#f1f5f9' }} />
                </div>

                {matchInfo && (
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>{matchInfo.league?.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={matchInfo.home_team.logo_url} alt="Home" style={{ width: '40px', height: '40px' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{matchInfo.home_team.name}</span>
                      </div>
                      <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2563eb' }}>
                        {matchInfo.status === 'NS' ? 'vs' : matchInfo.home_goals + ' - ' + matchInfo.away_goals}
                      </span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src={matchInfo.away_team.logo_url} alt="Away" style={{ width: '40px', height: '40px' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{matchInfo.away_team.name}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <input type="number" step="0.01" placeholder="Cote (ex: 1.85)" value={manualOdds} onChange={e => setManualOdds(e.target.value)} style={{ width: '120px', padding: '0.4rem' }} />
                      <button type="button" onClick={() => setForm({ ...form, odds_at_analysis: manualOdds })} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Appliquer
                      </button>
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Type de pari</label>
                    <select value={form.prediction_type} onChange={e => setForm({...form, prediction_type: e.target.value})}>
                      <option value="1X2">1X2 (Vainqueur)</option>
                      <option value="Over/Under">Over/Under (Buts)</option>
                      <option value="BTTS">Les deux équipes marquent</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Pronostic</label>
                    <input type="text" placeholder="ex: PSG" value={form.prediction_value} onChange={e => setForm({...form, prediction_value: e.target.value})} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Cote enregistrée</label>
                    <input type="number" step="0.01" value={form.odds_at_analysis} onChange={e => setForm({...form, odds_at_analysis: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label>Analyse (Optionnel)</label>
                  <textarea rows={2} value={form.reasoning} onChange={e => setForm({...form, reasoning: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-primary" style={{ padding: '1rem' }}>
                  Publier l'analyse
                </button>
              </form>
            </div>
          )}

          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Historique des analyses</h2>
              <button onClick={goToStats} className="btn btn-primary">
                Calculer les stats sur la sélection ({selectedIds.length})
              </button>
            </div>
            
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <table>
                <thead>
                  <tr style={{ background: '#f8fafc' }}>
                    <th style={{ width: '40px' }}></th>
                    <th>Match</th>
                    <th>Pronostic</th>
                    <th>Cote</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={selectedIds.includes(a.id)} 
                          onChange={() => toggleSelection(a.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 500 }}>{a.match.home_team.name} vs {a.match.away_team.name}</td>
                      <td>{a.prediction_type} : {a.prediction_value}</td>
                      <td>{a.odds_at_analysis || '-'}</td>
                      <td>
                        <span className={'badge ' + (a.status === 'PENDING' ? 'badge-pending' : a.status === 'WON' ? 'badge-won' : 'badge-lost')}>
                          {a.status === 'PENDING' ? 'En attente' : a.status === 'WON' ? 'Gagné' : 'Perdu'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'ads' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>Créer une publicité</h2>
            <form onSubmit={handleSubmitAd} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label>Titre</label>
                <input type="text" placeholder="ex: Promo Betclic" value={adForm.title} onChange={e => setAdForm({...adForm, title: e.target.value})} required />
              </div>
              <div style={{ flex: 2 }}>
                <label>Texte</label>
                <input type="text" placeholder="ex: 100€ remboursés !" value={adForm.content} onChange={e => setAdForm({...adForm, content: e.target.value})} required />
              </div>
              <div>
                <label>Couleur</label>
                <input type="color" value={adForm.color} onChange={e => setAdForm({...adForm, color: e.target.value})} style={{ padding: '0.2rem', height: '42px', cursor: 'pointer' }} />
              </div>
              <button type="submit" className="btn btn-primary">Créer</button>
            </form>
          </div>

          <h2>Toutes les publicités</h2>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ width: '50px' }}>Actif</th>
                  <th>Titre</th>
                  <th>Texte</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={ad.is_active} 
                        onChange={() => handleToggleAd(ad.id)} 
                        style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                      />
                    </td>
                    <td style={{ fontWeight: 600 }}>{ad.title}</td>
                    <td>{ad.content}</td>
                    <td>
                      <span className="badge" style={{ background: ad.color, color: 'white' }}>Couleur</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
