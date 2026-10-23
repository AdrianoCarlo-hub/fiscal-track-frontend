import { useState } from 'react';
import contribuableService from '../../services/contribuableService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Input, Select } from '../ui/FormControls';
import useAsyncAction from '../../hooks/useAsyncAction';
import { options } from '../../utils/libelles';

function valeurInitiale(contribuable, champ, defaut = '') {
  return contribuable?.[champ] ?? defaut;
}

export default function ContribuableForm({ contribuable, onClose, onSuccess }) {
  const [form, setForm] = useState({
    nif: contribuable.nif,
    raisonSociale: valeurInitiale(contribuable, 'raisonSociale'),
    formeJuridique: valeurInitiale(contribuable, 'formeJuridique', 'SARL'),
    nomDirigeant: valeurInitiale(contribuable, 'nomDirigeant'),
    prenomDirigeant: valeurInitiale(contribuable, 'prenomDirigeant'),
    cinDirigeant: valeurInitiale(contribuable, 'cinDirigeant'),
    emailContribuable: valeurInitiale(contribuable, 'emailContribuable'),
    telephoneContribuable: valeurInitiale(contribuable, 'telephoneContribuable'),
    adresseContribuable: valeurInitiale(contribuable, 'adresseContribuable'),
    communeContribuable: valeurInitiale(contribuable, 'communeContribuable'),
    regimeImposition: valeurInitiale(contribuable, 'regimeImposition', 'REEL'),
    obligationComptable: valeurInitiale(contribuable, 'obligationComptable', 'COMPLET'),
    statutActivite: valeurInitiale(contribuable, 'statutActivite', 'ACTIF'),
    dateImmatriculation: valeurInitiale(contribuable, 'dateImmatriculation', ''),
  });

  const modification = useAsyncAction(
    () =>
      contribuableService.modifier(contribuable.nif, {
        ...form,
        nomDirigeant: form.nomDirigeant || null,
        prenomDirigeant: form.prenomDirigeant || null,
        cinDirigeant: form.cinDirigeant || null,
        emailContribuable: form.emailContribuable || null,
        telephoneContribuable: form.telephoneContribuable || null,
        adresseContribuable: form.adresseContribuable || null,
        communeContribuable: form.communeContribuable || null,
        dateImmatriculation: form.dateImmatriculation || null,
      }),
    { onSucces: () => onSuccess() },
  );

  const modifier = (evenement) => {
    const { name, value } = evenement.target;
    setForm((actuel) => ({ ...actuel, [name]: value }));
  };

  const soumettre = (evenement) => {
    evenement.preventDefault();
    modification.executer();
  };

  return (
    <Modal
      ouvert
      onClose={onClose}
      titre="Modifier le contribuable"
      description={`Dossier ${contribuable.nif} — les modifications sont journalisées.`}
      taille="lg"
      pied={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={modification.enCours}>
            Annuler
          </Button>
          <Button type="submit" form="formulaire-modification-contribuable" chargement={modification.enCours}>
            Enregistrer
          </Button>
        </div>
      }
    >
      <form id="formulaire-modification-contribuable" onSubmit={soumettre} className="space-y-4" noValidate>
        {modification.erreur && (
          <Alert variante="danger" titre="Modification impossible">
            {modification.erreur.message}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="nif" label="NIF" value={form.nif} readOnly disabled aide="Le NIF ne peut pas être modifié." />
          <Input
            id="dateImmatriculation"
            name="dateImmatriculation"
            type="date"
            label="Date d’immatriculation"
            obligatoire
            value={form.dateImmatriculation}
            onChange={modifier}
            erreur={modification.champs.dateImmatriculation}
          />
        </div>

        <Input
          id="raisonSociale"
          name="raisonSociale"
          label="Raison sociale"
          obligatoire
          value={form.raisonSociale}
          onChange={modifier}
          erreur={modification.champs.raisonSociale}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="formeJuridique"
            name="formeJuridique"
            label="Forme juridique"
            value={form.formeJuridique}
            onChange={modifier}
            erreur={modification.champs.formeJuridique}
          >
            {options('formeJuridique').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
          <Select
            id="regimeImposition"
            name="regimeImposition"
            label="Régime d’imposition"
            value={form.regimeImposition}
            onChange={modifier}
            erreur={modification.champs.regimeImposition}
          >
            {options('regimeImposition').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input id="nomDirigeant" name="nomDirigeant" label="Nom du dirigeant" value={form.nomDirigeant} onChange={modifier} />
          <Input id="prenomDirigeant" name="prenomDirigeant" label="Prénom du dirigeant" value={form.prenomDirigeant} onChange={modifier} />
          <Input id="cinDirigeant" name="cinDirigeant" label="CIN du dirigeant" value={form.cinDirigeant} onChange={modifier} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="emailContribuable"
            name="emailContribuable"
            type="email"
            label="Adresse e-mail"
            value={form.emailContribuable}
            onChange={modifier}
            erreur={modification.champs.emailContribuable}
          />
          <Input
            id="telephoneContribuable"
            name="telephoneContribuable"
            type="tel"
            label="Téléphone"
            value={form.telephoneContribuable}
            onChange={modifier}
            placeholder="+261341234567"
            aide="Format +261XXXXXXXXX ou 03XXXXXXXX."
            erreur={modification.champs.telephoneContribuable}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="adresseContribuable" name="adresseContribuable" label="Adresse" value={form.adresseContribuable} onChange={modifier} />
          <Input id="communeContribuable" name="communeContribuable" label="Commune" value={form.communeContribuable} onChange={modifier} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="obligationComptable"
            name="obligationComptable"
            label="Obligation comptable"
            value={form.obligationComptable}
            onChange={modifier}
            erreur={modification.champs.obligationComptable}
          >
            {options('obligationComptable').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
          <Select
            id="statutActivite"
            name="statutActivite"
            label="Statut d’activité"
            value={form.statutActivite}
            onChange={modifier}
            erreur={modification.champs.statutActivite}
          >
            {options('statutActivite').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
        </div>
      </form>
    </Modal>
  );
}
