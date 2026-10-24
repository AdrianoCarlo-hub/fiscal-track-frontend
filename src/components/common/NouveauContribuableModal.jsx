import { useState } from 'react';
import contribuableService from '../../services/contribuableService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { Input, Select } from '../ui/FormControls';
import useAsyncAction from '../../hooks/useAsyncAction';
import { options, libelle } from '../../utils/libelles';

const NIF_REGEX = /^\d{10}$/;

const CHAMPS_INITIAUX = {
  nif: '',
  raisonSociale: '',
  formeJuridique: 'SARL',
  nomDirigeant: '',
  prenomDirigeant: '',
  cinDirigeant: '',
  emailContribuable: '',
  telephoneContribuable: '',
  adresseContribuable: '',
  communeContribuable: '',
  regimeImposition: 'REEL',
  obligationComptable: 'COMPLET',
  statutActivite: 'ACTIF',
  dateImmatriculation: '',
  motDePasseHashContribuable: '',
};

export default function NouveauContribuableModal({ isOpen, onClose, onSuccess }) {
  const [form, setForm] = useState(CHAMPS_INITIAUX);
  const [nifTouche, setNifTouche] = useState(false);

  const nifValide = NIF_REGEX.test(form.nif);
  const nifInvalide = (nifTouche || form.nif.length > 0) && !nifValide;

  const creation = useAsyncAction(
    () =>
      contribuableService.creer({
        ...form,
        nomDirigeant: form.nomDirigeant || null,
        prenomDirigeant: form.prenomDirigeant || null,
        cinDirigeant: form.cinDirigeant || null,
        emailContribuable: form.emailContribuable || null,
        telephoneContribuable: form.telephoneContribuable || null,
        adresseContribuable: form.adresseContribuable || null,
        communeContribuable: form.communeContribuable || null,
      }),
    {
      onSucces: () => {
        setForm(CHAMPS_INITIAUX);
        setNifTouche(false);
        onSuccess();
      },
    },
  );

  const reinitialiser = () => {
    setForm(CHAMPS_INITIAUX);
    setNifTouche(false);
    creation.reinitialiser();
  };

  const fermer = () => {
    reinitialiser();
    onClose();
  };

  const modifier = (evenement) => {
    const { name, value } = evenement.target;
    const valeur = name === 'nif' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setForm((actuel) => ({ ...actuel, [name]: valeur }));
  };

  const soumettre = (evenement) => {
    evenement.preventDefault();
    if (!nifValide) {
      setNifTouche(true);
      return;
    }
    creation.executer();
  };

  return (
    <Modal
      ouvert={isOpen}
      onClose={fermer}
      titre="Nouveau contribuable"
      description="Créez un dossier fiscal et son accès à l’espace contribuable."
      taille="lg"
      pied={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={fermer} disabled={creation.enCours}>
            Annuler
          </Button>
          <Button type="submit" form="formulaire-nouveau-contribuable" chargement={creation.enCours}>
            Créer le dossier
          </Button>
        </div>
      }
    >
      <form
        id="formulaire-nouveau-contribuable"
        onSubmit={soumettre}
        className="space-y-4"
        noValidate
      >
        {creation.erreur && (
          <Alert variante="danger" titre="Création impossible">
            {creation.erreur.message}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nif"
            name="nif"
            label="NIF"
            obligatoire
            value={form.nif}
            onChange={modifier}
            onBlur={() => setNifTouche(true)}
            maxLength={10}
            inputMode="numeric"
            autoComplete="off"
            placeholder="10 chiffres"
            aide="Identifiant fiscal unique, non modifiable ensuite."
            erreur={
              nifInvalide
                ? 'Le NIF doit contenir exactement 10 chiffres.'
                : creation.champs.nif
            }
          />
          <Input
            id="dateImmatriculation"
            name="dateImmatriculation"
            type="date"
            label="Date d’immatriculation"
            obligatoire
            value={form.dateImmatriculation}
            onChange={modifier}
            erreur={creation.champs.dateImmatriculation}
          />
        </div>

        <Input
          id="raisonSociale"
          name="raisonSociale"
          label="Raison sociale"
          obligatoire
          value={form.raisonSociale}
          onChange={modifier}
          erreur={creation.champs.raisonSociale}
        />

        <Input
          id="motDePasseHashContribuable"
          name="motDePasseHashContribuable"
          type="password"
          label="Mot de passe de l’espace contribuable"
          obligatoire
          value={form.motDePasseHashContribuable}
          onChange={modifier}
          autoComplete="new-password"
          aide="8 à 72 caractères. Communiquez-le au contribuable par un canal sûr."
          erreur={creation.champs.motDePasseHashContribuable}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="formeJuridique"
            name="formeJuridique"
            label="Forme juridique"
            value={form.formeJuridique}
            onChange={modifier}
            erreur={creation.champs.formeJuridique}
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
            erreur={creation.champs.regimeImposition}
          >
            {options('regimeImposition').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="nomDirigeant"
            name="nomDirigeant"
            label="Nom du dirigeant"
            value={form.nomDirigeant}
            onChange={modifier}
          />
          <Input
            id="prenomDirigeant"
            name="prenomDirigeant"
            label="Prénom du dirigeant"
            value={form.prenomDirigeant}
            onChange={modifier}
          />
          <Input
            id="cinDirigeant"
            name="cinDirigeant"
            label="CIN du dirigeant"
            value={form.cinDirigeant}
            onChange={modifier}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="emailContribuable"
            name="emailContribuable"
            type="email"
            label="Adresse e-mail"
            value={form.emailContribuable}
            onChange={modifier}
            aide="Utilisée pour les notifications."
            erreur={creation.champs.emailContribuable}
          />
          <Input
            id="telephoneContribuable"
            name="telephoneContribuable"
            type="tel"
            label="Téléphone"
            value={form.telephoneContribuable}
            onChange={modifier}
            placeholder="+261341234567"
            aide="Format international ou 03XXXXXXXX."
            erreur={creation.champs.telephoneContribuable}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="adresseContribuable"
            name="adresseContribuable"
            label="Adresse"
            value={form.adresseContribuable}
            onChange={modifier}
          />
          <Input
            id="communeContribuable"
            name="communeContribuable"
            label="Commune"
            value={form.communeContribuable}
            onChange={modifier}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="obligationComptable"
            name="obligationComptable"
            label="Obligation comptable"
            value={form.obligationComptable}
            onChange={modifier}
            erreur={creation.champs.obligationComptable}
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
            erreur={creation.champs.statutActivite}
          >
            {options('statutActivite').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
        </div>

        <p className="text-xs text-slate-500">
          Forme sélectionnée : {libelle('formeJuridique', form.formeJuridique)} · Régime :{' '}
          {libelle('regimeImposition', form.regimeImposition)}
        </p>
      </form>
    </Modal>
  );
}
