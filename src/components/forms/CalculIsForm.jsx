import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';

export default function CalculIsForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({
    caBrut: '',
    adherentCga: false,
    achatsConformes: '',
    chargesSalariales: '',
    acomptes: '',
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
        caBrut: Number(form.caBrut),
        adherentCga: form.adherentCga,
        achatsConformes: form.achatsConformes ? Number(form.achatsConformes) : null,
        chargesSalariales: form.chargesSalariales ? Number(form.chargesSalariales) : null,
        acomptes: form.acomptes ? Number(form.acomptes) : null,
      };
      const resultat = await calculFiscalService.calculerIs(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(err.response?.data?.message || 'Erreur lors du calcul');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="CA brut (Ar) *" name="caBrut" type="number" value={form.caBrut} onChange={handleChange} required />

      <div className="flex items-center gap-2">
        <input type="checkbox" id="cga" name="adherentCga" checked={form.adherentCga} onChange={handleChange}
          className="w-4 h-4" />
        <label htmlFor="cga" className="text-sm">Adherent CGA (abattement 50% plafonne a 5M)</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Achats conformes (Ar)" name="achatsConformes" type="number" value={form.achatsConformes} onChange={handleChange} />
        <Field label="Charges salariales (Ar)" name="chargesSalariales" type="number" value={form.chargesSalariales} onChange={handleChange} />
      </div>

      <Field label="Acomptes deja verses (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />

      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul...' : 'Calculer l\'IS'}
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
