import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { Checkbox } from '../ui/FormControls';
import { ChampMontant } from './ChampsCalcul';

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
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChampMontant label="TVA collectée (Ar) *" name="tvaCollectee" type="number" value={form.tvaCollectee} onChange={handleChange} required />
      <ChampMontant label="TVA déductible (Ar) *" name="tvaDeductible" type="number" value={form.tvaDeductible} onChange={handleChange} required />
      <ChampMontant label="Crédit TVA antérieur (Ar)" name="creditTvaAnterieur" type="number" value={form.creditTvaAnterieur} onChange={handleChange} />

      <Checkbox id="exportation" name="exportation" label="Exportation (taux 0%)" checked={form.exportation} onChange={handleChange} />

      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul...' : 'Calculer la TVA'}</Button>
    </form>
  );
}

