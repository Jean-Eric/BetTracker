import { useState } from 'react';
import { api } from '../api/client';

export default function NewCoupon() {
  const [bookmaker, setBookmaker] = useState('Betclic');
  const [stake, setStake] = useState('10');
  const [selections, setSelections] = useState([{ event_name: '', market: '', pick: '', odds: '' }]);
  const [result, setResult] = useState<any>(null);

  const handleAddSelection = () => {
    setSelections([...selections, { event_name: '', market: '', pick: '', odds: '' }]);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newSelections = [...selections];
    (newSelections[index] as any)[field] = value;
    setSelections(newSelections);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        bookmaker_name: bookmaker,
        stake: parseFloat(stake),
        selections: selections.map(s => ({
          event_name: s.event_name,
          market: s.market,
          pick: s.pick,
          odds: parseFloat(s.odds)
        }))
      };
      const res = await api.post('/coupons/generate', payload);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la génération du coupon');
    }
  };

  if (result) {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center' }}>
        <h2>✅ Coupon généré !</h2>
        <p style={{ fontSize: '1.1rem', margin: '1rem 0' }}><strong>Cote totale :</strong> <span style={{ color: '#2563eb', fontWeight: 'bold' }}>{result.total_odds}</span></p>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}><strong>Gain potentiel :</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>{result.potential_gain} €</span></p>
        <a href={result.tracking_url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ display: 'block', marginBottom: '1rem', padding: '1rem' }}>
          🔗 Ouvrir le coupon
        </a>
        <button onClick={() => setResult(null)} className="btn btn-outline" style={{ width: '100%', padding: '1rem' }}>
          Créer un autre coupon
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>Nouveau Coupon</h1>
        <p className="text-muted">Construisez votre pari combiné</p>
      </div>
      
      <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label>Bookmaker</label>
            <select value={bookmaker} onChange={e => setBookmaker(e.target.value)}>
              <option>Betclic</option>
              <option>1xbet</option>
              <option>Melbet</option>
              <option>Paripesa</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label>Mise (€)</label>
            <input type="number" value={stake} onChange={e => setStake(e.target.value)} />
          </div>
        </div>

        <h3 style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem' }}>Sélections</h3>
        
        {selections.map((sel, index) => (
          <div key={index} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <input placeholder="Événement (ex: PSG vs OM)" value={sel.event_name} onChange={e => handleChange(index, 'event_name', e.target.value)} style={{ marginBottom: '0.5rem' }} required />
            <input placeholder="Marché (ex: 1X2)" value={sel.market} onChange={e => handleChange(index, 'market', e.target.value)} style={{ marginBottom: '0.5rem' }} required />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="Pronostic (ex: PSG)" value={sel.pick} onChange={e => handleChange(index, 'pick', e.target.value)} style={{ flex: 2 }} required />
              <input type="number" step="0.01" placeholder="Cote" value={sel.odds} onChange={e => handleChange(index, 'odds', e.target.value)} style={{ flex: 1 }} required />
            </div>
          </div>
        ))}
        
        <button type="button" onClick={handleAddSelection} className="btn btn-outline">
          + Ajouter une sélection
        </button>

        <button type="submit" className="btn btn-primary" style={{ padding: '1rem', fontSize: '1.1rem' }}>
          Générer le coupon
        </button>
      </form>
    </div>
  );
}
