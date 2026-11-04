import { useState } from 'react';
import calculFiscalService from '../../services/calculFiscalService';
import { messageErreur } from '../../services/api';
import Button from '../ui/Button';
import { Checkbox } from '../ui/FormControls';
import { ChampMontant } from './ChampsCalcul';
import { formatMontant } from '../../utils/formatUtils';

export default function CalculIsForm({ onResultat, onErreur }) {
  const [form, setForm] = useState({
    caBrut: '',
    adherentCga: false,
    achatsConformes: '',
    chargesSalariales: '',
    impotN1: '',
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
      };
      const resultat = await calculFiscalService.calculerIs(data);
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
      <ChampMontant label="CA brut (Ar) *" name="caBrut" type="number" value={form.caBrut} onChange={handleChange} required />

      <Checkbox id="cga" name="adherentCga" label="Adhérent CGA (abattement 50 % plafonné à 5 M Ar)" checked={form.adherentCga} onChange={handleChange} />

      <div className="grid grid-cols-2 gap-4">
        <ChampMontant label="Achats conformes (Ar)" name="achatsConformes" type="number" value={form.achatsConformes} onChange={handleChange} />
        <ChampMontant label="Charges salariales (Ar)" name="chargesSalariales" type="number" value={form.chargesSalariales} onChange={handleChange} />
      </div>

      <ChampMontant label="Impôt de l’année précédente (Ar)" name="impotN1" type="number" value={form.impotN1} onChange={handleChange} />

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

      <Button type="submit" chargement={chargement} size="lg" className="w-full">{chargement ? 'Calcul…' : 'Calculer l’IS'}</Button>
    </form>
  );
}

