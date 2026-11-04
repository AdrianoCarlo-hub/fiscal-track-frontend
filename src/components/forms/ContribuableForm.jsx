import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import contribuableService from '../../services/contribuableService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import Combobox from '../ui/Combobox';
import { Input, Select } from '../ui/FormControls';
import useAsyncAction from '../../hooks/useAsyncAction';
import { libelle, options } from '../../utils/libelles';

const NIF_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEPHONE_REGEX = /^(?:\+261\d{9}|0[0-9]{9})$/;

function valeurInitiale(contribuable, champ, defaut = '') {
  return contribuable?.[champ] ?? defaut;
}

function valeurDate(contribuable, champ) {
  const valeur = contribuable?.[champ];
  return valeur ? String(valeur).slice(0, 10) : '';
}

function valeursInitiales(contribuable) {
  return {
    nif: contribuable?.nif || '',
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
    dateImmatriculation: valeurDate(contribuable, 'dateImmatriculation'),
    dateCloture: valeurDate(contribuable, 'dateCloture'),
    categorieActivite: valeurInitiale(contribuable, 'categorieActivite', 'AUTRE'),
    motDePasse: '',
  };
}

function valider(form, creation) {
  const erreurs = {};
  if (!NIF_REGEX.test(form.nif)) erreurs.nif = 'Le NIF doit contenir exactement 10 chiffres.';
  if (!form.raisonSociale.trim()) erreurs.raisonSociale = 'La raison sociale est obligatoire.';
  if (!form.dateImmatriculation) erreurs.dateImmatriculation = 'La date d’immatriculation est obligatoire.';
  if (form.emailContribuable && !EMAIL_REGEX.test(form.emailContribuable)) {
    erreurs.emailContribuable = 'Saisissez une adresse e-mail valide.';
  }
  if (form.telephoneContribuable && !TELEPHONE_REGEX.test(form.telephoneContribuable.replace(/\s/g, ''))) {
    erreurs.telephoneContribuable = 'Saisissez un numéro au format +261XXXXXXXXX ou 03XXXXXXXX.';
  }
  if (creation && form.motDePasse.length < 8) {
    erreurs.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.';
  }
  return erreurs;
}

export default function ContribuableForm({ contribuable = null, onClose, onSuccess, creation: creationForcee }) {
  const creation = creationForcee ?? !contribuable;
  const [form, setForm] = useState(() => valeursInitiales(contribuable));
  const [touches, setTouches] = useState({});
  const [soumis, setSoumis] = useState(false);
  const [motDePasseVisible, setMotDePasseVisible] = useState(false);

  const operation = useAsyncAction(
    () => {
      const payload = {
        ...form,
        nomDirigeant: form.nomDirigeant || null,
        prenomDirigeant: form.prenomDirigeant || null,
        cinDirigeant: form.cinDirigeant || null,
        emailContribuable: form.emailContribuable || null,
        telephoneContribuable: form.telephoneContribuable || null,
        adresseContribuable: form.adresseContribuable || null,
        communeContribuable: form.communeContribuable || null,
        dateImmatriculation: form.dateImmatriculation || null,
        dateCloture: form.dateCloture || null,
        categorieActivite: form.categorieActivite || null,
        motDePasseHashContribuable: creation ? form.motDePasse : undefined,
      };
      delete payload.motDePasse;
      return creation
        ? contribuableService.creer(payload)
        : contribuableService.modifier(contribuable.nif, payload);
    },
    {
      onSucces: () => {
        setForm(valeursInitiales(contribuable));
        setTouches({});
        setSoumis(false);
        onSuccess();
      },
    },
  );

  const erreursLocales = useMemo(() => valider(form, creation), [creation, form]);
  const erreurDe = (champ) => {
    if (touches[champ] || soumis) return erreursLocales[champ] || operation.champs[champ];
    return operation.champs[champ];
  };

  const modifier = (evenement) => {
    const { name, value } = evenement.target;
    const chiffres = name === 'nif' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setForm((actuel) => ({ ...actuel, [name]: chiffres }));
    setTouches((actuel) => ({ ...actuel, [name]: true }));
  };

  const changerChamp = (nom) => (valeur) => {
    setForm((actuel) => ({ ...actuel, [nom]: valeur }));
    setTouches((actuel) => ({ ...actuel, [nom]: true }));
  };

  const modifie = JSON.stringify(form) !== JSON.stringify(valeursInitiales(contribuable));

  const fermer = () => {
    if (operation.enCours) return;
    if (modifie && !window.confirm('Des modifications ne sont pas enregistrées. Fermer sans enregistrer ?')) {
      return;
    }
    onClose();
  };

  const soumettre = (evenement) => {
    evenement.preventDefault();
    setSoumis(true);
    if (Object.keys(erreursLocales).length > 0) {
      const premier = ['nif', 'raisonSociale', 'dateImmatriculation', 'emailContribuable', 'telephoneContribuable', 'motDePasse'].find(
        (champ) => erreursLocales[champ],
      );
      window.setTimeout(() => document.getElementById(premier)?.focus(), 0);
      return;
    }
    operation.executer();
  };

  return (
    <Modal
      ouvert
      onClose={fermer}
      verrouille={operation.enCours}
      titre={creation ? 'Nouveau contribuable' : 'Modifier le contribuable'}
      description={
        creation
          ? 'Créez un dossier fiscal et son accès à l’espace contribuable.'
          : `Dossier ${contribuable?.nif || ''} — les modifications sont journalisées.`
      }
      taille="lg"
      pied={
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={fermer} disabled={operation.enCours}>
            Annuler
          </Button>
          <Button
            type="submit"
            form="formulaire-contribuable"
            chargement={operation.enCours}
          >
            {creation ? 'Créer le dossier' : 'Enregistrer'}
          </Button>
        </div>
      }
    >
      <form id="formulaire-contribuable" onSubmit={soumettre} className="space-y-4" noValidate>
        {operation.erreur && (
          <Alert variante="danger" titre={creation ? 'Création impossible' : 'Modification impossible'}>
            {operation.erreur.message}
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="nif"
            name="nif"
            label="NIF"
            obligatoire={creation}
            value={form.nif}
            onChange={modifier}
            onBlur={() => setTouches((actuel) => ({ ...actuel, nif: true }))}
            maxLength={10}
            inputMode="numeric"
            autoComplete="off"
            readOnly={!creation}
            disabled={!creation}
            placeholder="10 chiffres"
            aide={creation ? 'Identifiant fiscal unique, non modifiable ensuite.' : 'Le NIF ne peut pas être modifié.'}
            erreur={erreurDe('nif')}
          />
          <Input
            id="dateImmatriculation"
            name="dateImmatriculation"
            type="date"
            label="Date d’immatriculation"
            obligatoire
            value={form.dateImmatriculation}
            onChange={modifier}
            onBlur={() => setTouches((actuel) => ({ ...actuel, dateImmatriculation: true }))}
            erreur={erreurDe('dateImmatriculation')}
          />
        </div>

        <Input
          id="raisonSociale"
          name="raisonSociale"
          label="Raison sociale"
          obligatoire
          value={form.raisonSociale}
          onChange={modifier}
          onBlur={() => setTouches((actuel) => ({ ...actuel, raisonSociale: true }))}
          erreur={erreurDe('raisonSociale')}
        />

        {creation && (
          <div>
            <div className="relative">
              <Input
                id="motDePasse"
                name="motDePasse"
                type={motDePasseVisible ? 'text' : 'password'}
                label="Mot de passe de l’espace contribuable"
                obligatoire
                value={form.motDePasse}
                onChange={modifier}
                onBlur={() => setTouches((actuel) => ({ ...actuel, motDePasse: true }))}
                autoComplete="new-password"
                classNameInput="pr-12"
                aide="8 à 72 caractères. Communiquez-le au contribuable par un canal sûr."
                erreur={erreurDe('motDePasse')}
              />
              <button
                type="button"
                onClick={() => setMotDePasseVisible((valeur) => !valeur)}
                aria-label={motDePasseVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-2 top-[2.1rem] flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {motDePasseVisible ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full transition-all duration-150 ${
                    form.motDePasse.length >= 12
                      ? 'w-full bg-success'
                      : form.motDePasse.length >= 8
                        ? 'w-2/3 bg-warning'
                        : 'w-1/3 bg-danger'
                  }`}
                />
              </div>
              <span className="text-xs text-slate-600">
                {form.motDePasse.length >= 12 ? 'Robuste' : form.motDePasse.length >= 8 ? 'Correct' : 'Trop court'}
              </span>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Combobox
            id="formeJuridique"
            label="Forme juridique"
            valeur={form.formeJuridique}
            onChange={changerChamp('formeJuridique')}
            options={options('formeJuridique')}
            erreur={erreurDe('formeJuridique')}
            placeholder="Rechercher une forme juridique…"
            permettreEffacement={false}
          />
          <Select
            id="regimeImposition"
            name="regimeImposition"
            label="Régime d’imposition"
            value={form.regimeImposition}
            onChange={modifier}
            erreur={operation.champs.regimeImposition}
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
            onBlur={() => setTouches((actuel) => ({ ...actuel, emailContribuable: true }))}
            aide="Utilisée pour les notifications."
            erreur={erreurDe('emailContribuable')}
          />
          <Input
            id="telephoneContribuable"
            name="telephoneContribuable"
            type="tel"
            label="Téléphone"
            value={form.telephoneContribuable}
            onChange={modifier}
            onBlur={() => setTouches((actuel) => ({ ...actuel, telephoneContribuable: true }))}
            placeholder="+261341234567"
            aide="Format international ou 03XXXXXXXX."
            erreur={erreurDe('telephoneContribuable')}
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
            erreur={operation.champs.obligationComptable}
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
            erreur={operation.champs.statutActivite}
          >
            {options('statutActivite').map((option) => (
              <option key={option.code} value={option.code}>
                {option.libelle}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Combobox
            id="categorieActivite"
            label="Catégorie d’activité"
            valeur={form.categorieActivite}
            onChange={changerChamp('categorieActivite')}
            options={options('categorieActivite')}
            erreur={operation.champs.categorieActivite}
            placeholder="Sélectionner une catégorie…"
          />
          <Input
            id="dateCloture"
            name="dateCloture"
            type="date"
            label="Date de clôture d’exercice"
            value={form.dateCloture}
            onChange={modifier}
            aide="Laisser vide pour exercice civil (31 décembre)."
            erreur={operation.champs.dateCloture}
          />
        </div>

        <p className="text-xs text-slate-600">
          Forme sélectionnée : {libelle('formeJuridique', form.formeJuridique)} · Régime :{' '}
          {libelle('regimeImposition', form.regimeImposition)}
        </p>
      </form>
    </Modal>
  );
}
