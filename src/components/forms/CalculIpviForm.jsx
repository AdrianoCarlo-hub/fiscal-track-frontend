import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { ChampMontant } from './ChampsCalcul';

export default function CalculIpviForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({ prixVente: '', acomptes: '' });
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
        prixVente: Number(form.prixVente),
        acomptes: form.acomptes !== '' ? Number(form.acomptes) : null,
      };
      const resultat = await calculFiscalService.calculerIpvi(data);
      onResultat(resultat);
    } catch (err) {
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChampMontant label="Prix de vente (Ar) *" name="prixVente" type="number" value={form.prixVente} onChange={handleChange} required />
      <ChampMontant label="Acomptes déduits (Ar)" name="acomptes" type="number" value={form.acomptes} onChange={handleChange} />
      <p className="text-xs text-slate-500">IPVI : 20 % avec cout forfaitaire de 75 % du prix d'acquisition.</p>
      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul...' : "Calculer l’IPVI"}</Button>
    </form>
  );
}

