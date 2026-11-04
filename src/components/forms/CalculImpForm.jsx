import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { ChampMontant } from './ChampsCalcul';

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
      <ChampMontant label="Montant du marché (Ar) *" name="montantMarche" type="number" value={form.montantMarche} onChange={handleChange} required />
      <ChampMontant label="Acomptes déduits (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />
      <p className="text-xs text-slate-500">IMP : 8 % sur les marches publics (CDI 05.xx).</p>
      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul...' : "Calculer l’IMP"}</Button>
    </form>
  );
}

