import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';

export default function CalculIrcmForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({ caBrut: '', estCooperative: false, acomptes: '' });
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value))
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const data = {
        caBrut: Number(form.caBrut),
        estCooperative: form.estCooperative,
        acomptes: form.acomptes !== '' ? Number(form.acomptes) : null,
      };
      const resultat = await calculFiscalService.calculerIrcm(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Chiffre d'affaires brut (Ar) *" name="caBrut" type="number" value={form.caBrut} onChange={handleChange} required />
      <Field label="Acomptes deduits (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="estCooperative" name="estCooperative" checked={form.estCooperative} onChange={handleChange}
          className="w-4 h-4" />
        <label htmlFor="estCooperative" className="text-sm">Cooperative (taux reduit 10 %)</label>
      </div>

      <p className="text-xs text-slate-500">IRCM : 20 % (10 % pour les cooperatives) sur les revenus des capitaux mobiliers.</p>
      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul...' : "Calculer l'IRCM"}
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
