import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';

export default function CalculImpForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({ montantMarche: '', acomptes: '' });
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const data = {
        montantMarche: Number(form.montantMarche),
        acomptes: form.acomptes !== '' ? Number(form.acomptes) : null,
      };
      const resultat = await calculFiscalService.calculerImp(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Montant du marche (Ar) *" name="montantMarche" type="number" value={form.montantMarche} onChange={handleChange} required />
      <Field label="Acomptes deduits (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />
      <p className="text-xs text-slate-500">IMP : 8 % sur les marches publics (CDI 05.xx).</p>
      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul...' : "Calculer l'IMP"}
      </button>
    </form>
  );
}

function Field({ label, name, type, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
    </div>
  );
}
