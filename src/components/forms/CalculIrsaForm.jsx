import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';

export default function CalculIrsaForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({
    salaireBrut: '',
    cotisationsSociales: '',
    avantageLogement: '',
    avantageVehicule: '',
    avantageTelephone: '',
    nombrePersonnesCharge: 0,
  });
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);
    try {
      const data = {
        salaireBrut: Number(form.salaireBrut),
        cotisationsSociales: form.cotisationsSociales ? Number(form.cotisationsSociales) : null,
        avantageLogement: form.avantageLogement ? Number(form.avantageLogement) : null,
        avantageVehicule: form.avantageVehicule ? Number(form.avantageVehicule) : null,
        avantageTelephone: form.avantageTelephone ? Number(form.avantageTelephone) : null,
        nombrePersonnesCharge: Number(form.nombrePersonnesCharge),
      };
      const resultat = await calculFiscalService.calculerIrsa(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(err.response?.data?.message || 'Erreur lors du calcul');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Salaire brut mensuel (Ar) *" name="salaireBrut" type="number" value={form.salaireBrut} onChange={handleChange} required />
      <Field label="Cotisations sociales (CNaPS + Sanitaire)" name="cotisationsSociales" type="number" value={form.cotisationsSociales} onChange={handleChange} />

      <div className="grid grid-cols-3 gap-4">
        <Field label="Avantage logement" name="avantageLogement" type="number" value={form.avantageLogement} onChange={handleChange} />
        <Field label="Avantage vehicule" name="avantageVehicule" type="number" value={form.avantageVehicule} onChange={handleChange} />
        <Field label="Avantage telephone" name="avantageTelephone" type="number" value={form.avantageTelephone} onChange={handleChange} />
      </div>

      <Field label="Nombre de personnes a charge" name="nombrePersonnesCharge" type="number" value={form.nombrePersonnesCharge} onChange={handleChange} />

      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul...' : 'Calculer l\'IRSA'}
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
