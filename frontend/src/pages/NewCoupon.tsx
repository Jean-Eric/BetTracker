import { useState } from 'react';
import { api } from '../api/client';

export default function NewCoupon() {
  const [bookmaker, setBookmaker] = useState('Betclic');
  const [stake, setStake] = useState('10');
  const [selections, setSelections] = useState([
    { event_name: '', market: '', pick: '', odds: '' }
  ]);
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
      <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto' }}>
        <h2>✅ Coupon généré !</h2>
        <p><strong>Cote totale :</strong> {result.total_odds}</p>
        <p><strong>Gain potentiel :</strong> {result.potential_gain} €</p>
        <p>Ouvrez ce lien sur votre téléphone ou cliquez dessus :</p>
        <a href={result.tracking_url} target="_blank" rel="noreferrer" 
           style={{ display: 'block', background: '#2563eb', color: 'white', padding: '1rem', textAlign: 'center', borderRadius: '8px', textDecoration: 'none', marginTop: '1rem' }}>
          🔗 Ouvrir le coupon
        </a>
        <button onClick={() => setResult(null)} style={{ marginTop: '1rem', width: '100%', padding: '1rem' }}>
          Créer un autre coupon
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '500px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h2>Nouveau Coupon</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div>
          <label>Bookmaker</label>
          <select value={bookmaker} onChange={e => setBookmaker(e.target.value)} style={{ width: '100%', padding: '0.5rem' }}>
            <option>Betclic</option>
            <option>1xbet</option>
            <option>Melbet</option>
            <option>Paripesa</option>
          </select>
        </div>

        <div>
          <label>Mise (€)</label>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)} style={{ width: '100%', padding: '0.5rem' }} />
        </div>

        <h3>Sélections</h3>
        {selections.map((sel, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
            <input placeholder="Événement (ex: PSG vs OM)" value={sel.event_name} onChange={e => handleChange(index, 'event_name', e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }} required />
            <input placeholder="Marché (ex: 1X2)" value={sel.market} onChange={e => handleChange(index, 'market', e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }} required />
            <input placeholder="Pronostic (ex: PSG)" value={sel.pick} onChange={e => handleChange(index, 'pick', e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem' }} required />
            <input type="number" step="0.01" placeholder="Cote (ex: 1.85)" value={sel.odds} onChange={e => handleChange(index, 'odds', e.target.value)} style={{ width: '100%', padding: '0.5rem' }} required />
          </div>
        ))}
        
        <button type="button" onClick={handleAddSelection} style={{ padding: '0.5rem' }}>
          + Ajouter une sélection
        </button>

        <button type="submit" style={{ padding: '1rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', marginTop: '1rem' }}>
          Générer le coupon
        </button>
      </form>
    </div>
  );
}
