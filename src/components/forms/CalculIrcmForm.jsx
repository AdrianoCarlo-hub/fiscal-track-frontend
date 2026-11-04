import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { Checkbox } from '../ui/FormControls';
import { ChampMontant } from './ChampsCalcul';

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
      <ChampMontant label="Chiffre d’affaires brut (Ar) *" name="caBrut" type="number" value={form.caBrut} onChange={handleChange} required />
      <ChampMontant label="Acomptes déduits (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />

      <Checkbox id="estCooperative" name="estCooperative" label="Coopérative (taux réduit 10 %)" checked={form.estCooperative} onChange={handleChange} />

      <p className="text-xs text-slate-500">IRCM : 20 % (10 % pour les cooperatives) sur les revenus des capitaux mobiliers.</p>
      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul...' : "Calculer l’IRCM"}</Button>
    </form>
  );
}

