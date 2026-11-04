import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { ChampMontant, ChampNombre } from './ChampsCalcul';

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
      onErreur(messageErreur(err) || 'Erreur lors du calcul.');
    } finally {
      setChargement(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ChampMontant label="Salaire brut mensuel (Ar) *" name="salaireBrut" type="number" value={form.salaireBrut} onChange={handleChange} required />
      <ChampMontant label="Cotisations sociales (CNaPS + Sanitaire)" name="cotisationsSociales" type="number" value={form.cotisationsSociales} onChange={handleChange} />

      <div className="grid grid-cols-3 gap-4">
        <ChampMontant label="Avantage logement" name="avantageLogement" type="number" value={form.avantageLogement} onChange={handleChange} />
        <ChampMontant label="Avantage véhicule" name="avantageVehicule" type="number" value={form.avantageVehicule} onChange={handleChange} />
        <ChampMontant label="Avantage téléphone" name="avantageTelephone" type="number" value={form.avantageTelephone} onChange={handleChange} />
      </div>

      <ChampNombre label="Nombre de personnes à charge" name="nombrePersonnesCharge" min={0} value={form.nombrePersonnesCharge} onChange={handleChange} />

      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul...' : 'Calculer l\'IRSA'}</Button>
    </form>
  );
}

