import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';

export default function CalculTvaForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({
    tvaCollectee: '',
    tvaDeductible: '',
    creditTvaAnterieur: '',
    exportation: false,
  });
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked
      : e.target.type === 'number' ? Number(e.target.value)
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const data = {
        tvaCollectee: Number(form.tvaCollectee),
        tvaDeductible: Number(form.tvaDeductible),
        creditTvaAnterieur: form.creditTvaAnterieur ? Number(form.creditTvaAnterieur) : null,
        exportation: form.exportation,
      };
      const resultat = await calculFiscalService.calculerTva(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(err.response?.data?.message || 'Erreur lors du calcul');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="TVA collectee (Ar) *" name="tvaCollectee" type="number" value={form.tvaCollectee} onChange={handleChange} required />
      <Field label="TVA deductibile (Ar) *" name="tvaDeductible" type="number" value={form.tvaDeductible} onChange={handleChange} required />
      <Field label="Credit TVA anterieur (Ar)" name="creditTvaAnterieur" type="number" value={form.creditTvaAnterieur} onChange={handleChange} />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="exportation" name="exportation" checked={form.exportation} onChange={handleChange}
          className="w-4 h-4" />
        <label htmlFor="exportation" className="text-sm">Exportation (taux 0%)</label>
      </div>

      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul...' : 'Calculer la TVA'}
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
