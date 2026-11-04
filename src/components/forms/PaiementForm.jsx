import { useMemo, useState } from 'react';
import paiementService from '../../services/paiementService';
import compteCourantService from '../../services/compteCourantService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Input, Select } from '../ui/FormControls';
import Combobox from '../ui/Combobox';
import MontantInput from '../ui/MontantInput';
import useApiData from '../../hooks/useApiData';
import useAsyncAction from '../../hooks/useAsyncAction';
import { formatMontant } from '../../utils/formatUtils';
import { options } from '../../utils/libelles';

const MODES = options('modePaiement');

export default function PaiementForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    idCompte: '',
    montantVerse: '',
    modePaiement: 'ESPECES',
    referenceTransaction: '',
  });

  const { data: comptes, chargement: chargementComptes, erreur: erreurComptes } = useApiData(
    () => compteCourantService.nonSoldes(),
    [],
    { valeurInitiale: [] },
  );

  const comptesNonSoldes = useMemo(() => (Array.isArray(comptes) ? comptes : []), [comptes]);
  const optionsComptes = useMemo(
    () =>
      comptesNonSoldes.map((compte) => ({
        code: String(compte.idCompte),
        libelle: `Compte n°${compte.idCompte} — NIF ${compte.nif} — reste ${formatMontant(compte.resteARecouvrer)}`,
        nif: compte.nif,
      })),
    [comptesNonSoldes],
  );
  const compteSelectionne = comptesNonSoldes.find(
    (compte) => String(compte.idCompte) === String(form.idCompte),
  );

  const montant = Number(String(form.montantVerse).replace(',', '.'));
  const reste = Number(compteSelectionne?.resteARecouvrer || 0);
  const montantValide = Number.isFinite(montant) && montant > 0;
  const montantTropEleve = montantValide && reste > 0 && montant > reste;
  const referenceRequise = form.modePaiement !== 'ESPECES';

  const enregistrement = useAsyncAction(
    () =>
      paiementService.enregistrer({
        idCompte: Number(form.idCompte),
        montantVerse: montant,
        modePaiement: form.modePaiement,
        referenceTransaction: form.referenceTransaction || null,
      }),
    { onSucces: () => onSuccess() },
  );

  const modifier = (evenement) => {
    const { name, value } = evenement.target;
    setForm((actuel) => ({ ...actuel, [name]: value }));
  };

  const soumettre = (evenement) => {
    evenement.preventDefault();
    if (!form.idCompte || !montantValide) return;
    enregistrement.executer();
  };

  const peutEnregistrer =
    !!form.idCompte &&
    montantValide &&
    (!referenceRequise || form.referenceTransaction.trim() !== '');

  return (
    <Modal
      ouvert
      onClose={onClose}
      titre="Enregistrer un paiement"
      description="Le montant est imputé au compte courant fiscal sélectionné."
      pied={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={enregistrement.enCours}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="formulaire-paiement"
            chargement={enregistrement.enCours}
            disabled={!peutEnregistrer}
          >
            Enregistrer
          </Button>
        </div>
      }
    >
      <form id="formulaire-paiement" onSubmit={soumettre} className="space-y-4" noValidate>
        {enregistrement.erreur && (
          <Alert variante="danger" titre="Enregistrement impossible">
            {enregistrement.erreur.message}
          </Alert>
        )}

        {erreurComptes && (
          <Alert variante="avertissement" titre="Comptes indisponibles">
            La liste des comptes non soldés n’a pas pu être chargée. Saisissez l’identifiant du
            compte manuellement.
          </Alert>
        )}

        {!erreurComptes && comptesNonSoldes.length > 0 ? (
          <Combobox
            id="idCompte"
            label="Compte courant fiscal"
            valeur={form.idCompte}
            onChange={(valeur) => setForm((actuel) => ({ ...actuel, idCompte: valeur }))}
            options={optionsComptes}
            placeholder="Rechercher un compte (n°, NIF…)"
            obligatoire
            erreur={enregistrement.champs.idCompte}
            aide={
              compteSelectionne
                ? `Reste à recouvrer : ${formatMontant(compteSelectionne.resteARecouvrer)}`
                : 'Seuls les comptes non soldés sont proposés.'
            }
            disabled={chargementComptes}
            getRecherche={(option) => option.libelle}
            permettreEffacement={false}
          />
        ) : (
          <Input
            id="idCompte"
            name="idCompte"
            type="number"
            min="1"
            label="Identifiant du compte courant fiscal"
            obligatoire
            value={form.idCompte}
            onChange={modifier}
            placeholder="Ex. 2"
            aide="Le compte courant est créé automatiquement après chaque déclaration validée."
            erreur={enregistrement.champs.idCompte}
          />
        )}

        <MontantInput
          id="montantVerse"
          nom="montantVerse"
          label="Montant versé (Ar)"
          obligatoire
          valeur={form.montantVerse === '' ? null : Number(form.montantVerse)}
          onChange={(valeur) =>
            setForm((actuel) => ({ ...actuel, montantVerse: valeur === null ? '' : String(valeur) }))
          }
          erreur={
            montantTropEleve
              ? `Le montant dépasse le reste à recouvrer (${formatMontant(reste)}).`
              : enregistrement.champs.montantVerse
          }
          aide={
            compteSelectionne
              ? `Reste à recouvrer : ${formatMontant(reste)}.`
              : undefined
          }
        />

        <Select
          id="modePaiement"
          name="modePaiement"
          label="Mode de paiement"
          obligatoire
          value={form.modePaiement}
          onChange={modifier}
          erreur={enregistrement.champs.modePaiement}
        >
          {MODES.map((mode) => (
            <option key={mode.code} value={mode.code}>
              {mode.libelle}
            </option>
          ))}
        </Select>

        <Input
          id="referenceTransaction"
          name="referenceTransaction"
          label="Référence de la transaction"
          obligatoire={referenceRequise}
          value={form.referenceTransaction}
          onChange={modifier}
          placeholder={referenceRequise ? 'Ex. VIR-2026-008' : 'Facultative pour les espèces'}
          aide={
            referenceRequise
              ? 'Obligatoire pour un virement, un chèque ou un paiement mobile.'
              : 'Facultative, mais doit être unique si renseignée.'
          }
          erreur={enregistrement.champs.referenceTransaction}
        />

        <p className="text-xs text-slate-500">
          Le reste à recouvrer et le statut du compte sont recalculés par le serveur après
          l’enregistrement.
        </p>
      </form>
    </Modal>
  );
}
