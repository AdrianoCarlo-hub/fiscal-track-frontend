import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import { formatMontant } from '../../utils/formatUtils';

const CATEGORIES = [
  { value: 'AGRICOLE', label: 'Agricole' },
  { value: 'ARTISANAL', label: 'Artisanal' },
  { value: 'INDUSTRIEL', label: 'Industriel' },
  { value: 'MINIER', label: 'Minier' },
  { value: 'HOTELIER', label: 'Hotelier' },
  { value: 'TOURISTIQUE', label: 'Touristique' },
  { value: 'COMMERCE', label: 'Commerce' },
  { value: 'SERVICE', label: 'Service' },
  { value: 'CARBURANT_DETAIL', label: 'Carburant au detail' },
  { value: 'EDUCATION', label: 'Education' },
  { value: 'SANTE', label: 'Sante' },
  { value: 'ASSOCIE_GERANT_SARL', label: 'Associe-gerant SARL' },
  { value: 'AUTRE', label: 'Autre' },
];

export default function CalculIrForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({
    caHT: '',
    chargesDeductibles: '',
    reintegrations: '',
    deductions: '',
    deficitsReportables: '',
    categorieActivite: 'INDUSTRIEL',
    impotN1: '',
    moisActifs: 12,
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
        caHT: Number(form.caHT),
        chargesDeductibles: form.chargesDeductibles ? Number(form.chargesDeductibles) : null,
        reintegrations: form.reintegrations ? Number(form.reintegrations) : null,
        deductions: form.deductions ? Number(form.deductions) : null,
        deficitsReportables: form.deficitsReportables ? Number(form.deficitsReportables) : null,
        categorieActivite: form.categorieActivite,
        moisActifs: Number(form.moisActifs),
      };
      const resultat = await calculFiscalService.calculerIr(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  const impotN1Nombre = Number(form.impotN1);
  const acompteSimule = Number.isFinite(impotN1Nombre) && impotN1Nombre > 0
    ? Math.round(impotN1Nombre * 0.25) : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="CA HT (Ar) *" name="caHT" type="number" value={form.caHT} onChange={handleChange} required />
        <Field label="Charges déductibles (Ar)" name="chargesDeductibles" type="number" value={form.chargesDeductibles} onChange={handleChange} />
        <Field label="Réintégrations (Ar)" name="reintegrations" type="number" value={form.reintegrations} onChange={handleChange} />
        <Field label="Déductions (Ar)" name="deductions" type="number" value={form.deductions} onChange={handleChange} />
        <Field label="Déficits reportables (Ar)" name="deficitsReportables" type="number" value={form.deficitsReportables} onChange={handleChange} />
        <Field label="Impôt de l’année précédente (Ar)" name="impotN1" type="number" value={form.impotN1} onChange={handleChange} />
      </div>

      {acompteSimule > 0 && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <p className="font-semibold">Acomptes calculés (simulation, rien n’est enregistré)</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <p>Acompte AC1 (31 mars) : <strong>{formatMontant(acompteSimule)}</strong></p>
            <p>Acompte AC2 (30 juin) : <strong>{formatMontant(acompteSimule)}</strong></p>
          </div>
          <p className="mt-1 text-xs">Chaque acompte représente 25 % de l’impôt de l’année précédente.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie d’activité *</label>
          <select name="categorieActivite" value={form.categorieActivite} onChange={handleChange} required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mois actifs (1-12)</label>
          <input type="number" name="moisActifs" value={form.moisActifs} onChange={handleChange}
            min="0" max="12"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none" />
        </div>
      </div>

      <button type="submit" disabled={chargement}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
        {chargement ? 'Calcul…' : 'Calculer l’IR'}
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
