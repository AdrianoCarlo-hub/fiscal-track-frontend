import { useState } from 'react';
import obligationService from '../../services/obligationService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Input, Select } from '../ui/FormControls';
import useAsyncAction from '../../hooks/useAsyncAction';
import { libelleImpot } from '../../utils/fiscalConstants';

const IMPOTS = [
  { code: 'TVA', periodicite: 'MENSUELLE' },
  { code: 'IRSA', periodicite: 'MENSUELLE' },
  { code: 'IS', periodicite: 'ANNUELLE' },
  { code: 'IR', periodicite: 'ANNUELLE' },
];

const FORMAT_PERIODE = {
  MENSUELLE: /^\d{4}-(0[1-9]|1[0-2])$/,
  ANNUELLE: /^\d{4}$/,
};

export default function ObligationForm({ nif, onClose, onSuccess }) {
  const [form, setForm] = useState({ codeImpot: 'TVA', periodeFiscale: '' });
  const periodicite =
    IMPOTS.find((impot) => impot.code === form.codeImpot)?.periodicite || 'MENSUELLE';
  const periodeValide = FORMAT_PERIODE[periodicite].test(form.periodeFiscale);

  const generation = useAsyncAction(
    () => obligationService.generer(nif, form.codeImpot, form.periodeFiscale),
    { onSucces: () => onSuccess() },
  );

  const modifier = (evenement) => {
    const { name, value } = evenement.target;
    setForm((actuel) => ({ ...actuel, [name]: value }));
  };

  const soumettre = (evenement) => {
    evenement.preventDefault();
    if (!periodeValide) return;
    generation.executer();
  };

  return (
    <Modal
      ouvert
      onClose={onClose}
      titre="Générer une obligation"
      description={`Contribuable ${nif}`}
      pied={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={generation.enCours}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="formulaire-generation-obligation"
            chargement={generation.enCours}
            disabled={!periodeValide}
          >
            Générer
          </Button>
        </div>
      }
    >
      <form id="formulaire-generation-obligation" onSubmit={soumettre} className="space-y-4" noValidate>
        {generation.erreur && (
          <Alert variante="danger" titre="Génération impossible">
            {generation.erreur.message}
          </Alert>
        )}

        <Select
          id="codeImpot"
          name="codeImpot"
          label="Type d’impôt"
          obligatoire
          value={form.codeImpot}
          onChange={modifier}
          erreur={generation.champs.codeImpot}
        >
          {IMPOTS.map((impot) => (
            <option key={impot.code} value={impot.code}>
              {libelleImpot(impot.code)} — {impot.periodicite === 'MENSUELLE' ? 'mensuel' : 'annuel'}
            </option>
          ))}
        </Select>

        <Input
          id="periodeFiscale"
          name="periodeFiscale"
          label="Période fiscale"
          obligatoire
          value={form.periodeFiscale}
          onChange={modifier}
          placeholder={periodicite === 'MENSUELLE' ? '2026-10' : '2025'}
          maxLength={7}
          aide={
            periodicite === 'MENSUELLE'
              ? 'Format attendu : AAAA-MM (impôt mensuel).'
              : 'Format attendu : AAAA (impôt annuel).'
          }
          erreur={
            form.periodeFiscale && !periodeValide
              ? periodicite === 'MENSUELLE'
                ? 'Saisissez une période au format AAAA-MM.'
                : 'Saisissez une année sur 4 chiffres.'
              : generation.champs.periodeFiscale
          }
        />

        <Alert variante="info" titre="Effet de la génération">
          Une obligation est créée avec sa date limite légale. Une obligation déjà existante pour
          ce contribuable, cet impôt et cette période n’est pas dupliquée.
        </Alert>
      </form>
    </Modal>
  );
}
