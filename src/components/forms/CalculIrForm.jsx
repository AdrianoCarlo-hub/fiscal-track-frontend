import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import { formatMontant } from '../../utils/formatUtils';
import Combobox from '../ui/Combobox';
import Button from '../ui/Button';
import { ChampMontant, ChampNombre } from './ChampsCalcul';
import { options } from '../../utils/referentiels';

const CATEGORIES = options('categorieActivite');

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
        <ChampMontant label="CA HT (Ar) *" name="caHT" type="number" value={form.caHT} onChange={handleChange} required />
        <ChampMontant label="Charges déductibles (Ar)" name="chargesDeductibles" type="number" value={form.chargesDeductibles} onChange={handleChange} />
        <ChampMontant label="Réintégrations (Ar)" name="reintegrations" type="number" value={form.reintegrations} onChange={handleChange} />
        <ChampMontant label="Déductions (Ar)" name="deductions" type="number" value={form.deductions} onChange={handleChange} />
        <ChampMontant label="Déficits reportables (Ar)" name="deficitsReportables" type="number" value={form.deficitsReportables} onChange={handleChange} />
        <ChampMontant label="Impôt de l’année précédente (Ar)" name="impotN1" type="number" value={form.impotN1} onChange={handleChange} />
      </div>

      {acompteSimule > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-slate-800">
          <p className="font-semibold">Acomptes calculés (simulation, rien n’est enregistré)</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <p>Acompte AC1 (31 mars) : <strong>{formatMontant(acompteSimule)}</strong></p>
            <p>Acompte AC2 (30 juin) : <strong>{formatMontant(acompteSimule)}</strong></p>
          </div>
          <p className="mt-1 text-xs">Chaque acompte représente 25 % de l’impôt de l’année précédente.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Combobox
          id="categorieActivite"
          label="Catégorie d’activité"
          obligatoire
          options={CATEGORIES}
          valeur={form.categorieActivite}
          onChange={(valeur) => setForm({ ...form, categorieActivite: valeur })}
          placeholder="Rechercher une catégorie…"
          permettreEffacement={false}
        />
        <ChampNombre
          label="Mois actifs (0 à 12)"
          name="moisActifs"
          min={0}
          max={12}
          value={form.moisActifs}
          onChange={handleChange}
        />
      </div>

      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul…' : 'Calculer l’IR'}</Button>
    </form>
  );
}

