import { useState } from 'react';
import { Mail, MessageSquare, Save, User } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData from '../../hooks/useApiData';
import useAsyncAction from '../../hooks/useAsyncAction';
import { useToast } from '../../context/notificationContext';
import contribuableService from '../../services/contribuableService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DetailList from '../../components/ui/DetailList';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Checkbox, Select } from '../../components/ui/FormControls';
import { formatDate } from '../../utils/formatUtils';
import { libelle, LIBELLES_CANAL } from '../../utils/libelles';

const CANAUX = ['', 'EMAIL', 'SMS', 'PORTAIL'];

function FormulairePreferences({ contribuable, onEnregistre }) {
  const { notifier } = useToast();
  const nif = contribuable.nif;
  const [canalPrefere, setCanalPrefere] = useState(contribuable.canalPrefere || '');
  const [accepteEmail, setAccepteEmail] = useState(contribuable.accepteEmail !== false);
  const [accepteSms, setAccepteSms] = useState(contribuable.accepteSms !== false);

  const { executer, enCours, erreur, champs, succes } = useAsyncAction(
    () => contribuableService.modifierPreferencesContact(nif, { canalPrefere, accepteEmail, accepteSms }),
    {
      onSucces: async () => {
        notifier({
          titre: 'Préférences enregistrées',
          message: 'Vos préférences de contact ont été mises à jour.',
          variante: 'succes',
        });
        await onEnregistre();
      },
    },
  );

  return (
    <SectionCard
      titre="Préférences de contact"
      description="Choisissez le canal utilisé en priorité et les canaux que vous acceptez de recevoir."
    >
      <form
        onSubmit={(evenement) => {
          evenement.preventDefault();
          executer();
        }}
        className="space-y-5"
      >
        {erreur && (
          <Alert variante="danger" titre="Enregistrement impossible">
            {erreur.message}
          </Alert>
        )}
        {succes && !erreur && (
          <Alert variante="succes" titre="Préférences enregistrées">
            Vos choix seront appliqués aux prochaines notifications.
          </Alert>
        )}

        <Select
          id="canal-prefere"
          label="Canal préféré"
          value={canalPrefere}
          onChange={(evenement) => setCanalPrefere(evenement.target.value)}
          erreur={champs.canalPrefere}
          aide="Sans préférence, toutes les communications autorisées sont utilisées."
        >
          {CANAUX.map((canal) => (
            <option key={canal || 'aucun'} value={canal}>
              {canal ? LIBELLES_CANAL[canal] : 'Sans préférence'}
            </option>
          ))}
        </Select>

        <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
          <legend className="px-1 text-sm font-medium text-slate-700">Canaux acceptés</legend>
          <Checkbox
            id="accepte-email"
            label="Recevoir les notifications par e-mail"
            description={contribuable.emailContribuable || 'Aucune adresse e-mail renseignée'}
            checked={accepteEmail}
            onChange={(evenement) => setAccepteEmail(evenement.target.checked)}
            erreur={champs.accepteEmail}
          />
          <Checkbox
            id="accepte-sms"
            label="Recevoir les notifications par SMS"
            description={contribuable.telephoneContribuable || 'Aucun numéro renseigné'}
            checked={accepteSms}
            onChange={(evenement) => setAccepteSms(evenement.target.checked)}
            erreur={champs.accepteSms}
          />
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Les notifications du portail restent toujours disponibles dans « Mes notifications »,
            même si vous refusez l’e-mail et le SMS.
          </p>
        </fieldset>

        <Button type="submit" chargement={enCours} disabled={enCours}>
          <Save className="h-4 w-4" aria-hidden="true" />
          Enregistrer mes préférences
        </Button>
      </form>
    </SectionCard>
  );
}

export default function ProfilPage() {
  const { utilisateur } = useAuth();
  const nif = utilisateur.identifiant;

  const { data, chargement, erreur, recharger } = useApiData(
    () => contribuableService.parNif(nif),
    [nif],
  );

  if (chargement) return <LoadingState message="Chargement de votre profil…" />;
  if (erreur) return <ErrorState erreur={erreur} onReessayer={recharger} />;
  if (!data) return null;

  const dirigeant = [data.prenomDirigeant, data.nomDirigeant].filter(Boolean).join(' ');

  return (
    <div>
      <PageHeader
        titre="Mon profil"
        description="Consultez les informations de votre dossier fiscal et choisissez comment l’administration vous contacte."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mon profil' }]}
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SectionCard titre="Identification" description="Ces informations sont gérées par votre centre fiscal.">
            <DetailList
              colonnes={2}
              elements={[
                { libelle: 'NIF', valeur: <span className="font-mono">{data.nif}</span> },
                { libelle: 'Raison sociale', valeur: data.raisonSociale },
                { libelle: 'Forme juridique', valeur: libelle('formeJuridique', data.formeJuridique) },
                { libelle: 'Dirigeant', valeur: dirigeant || '—' },
                { libelle: 'CIN du dirigeant', valeur: data.cinDirigeant },
                { libelle: 'Date d’immatriculation', valeur: formatDate(data.dateImmatriculation) },
                { libelle: 'Activité', valeur: libelle('categorieActivite', data.categorieActivite) },
                { libelle: 'Statut de l’activité', valeur: libelle('statutActivite', data.statutActivite) },
                { libelle: 'Régime d’imposition', valeur: libelle('regimeImposition', data.regimeImposition) },
                { libelle: 'Obligation comptable', valeur: libelle('obligationComptable', data.obligationComptable) },
                { libelle: 'Adresse', valeur: data.adresseContribuable },
                { libelle: 'Commune', valeur: data.communeContribuable },
                { libelle: 'E-mail', valeur: data.emailContribuable },
                { libelle: 'Téléphone', valeur: data.telephoneContribuable },
              ]}
            />
            <Alert variante="info" className="mt-5" titre="Modification des informations">
              Pour corriger votre raison sociale, votre dirigeant ou votre adresse, présentez-vous à
              votre centre fiscal muni des pièces justificatives.
            </Alert>
          </SectionCard>

          <FormulairePreferences
            key={`${data.nif}-${data.updatedAt || ''}`}
            contribuable={data}
            onEnregistre={recharger}
          />
        </div>

        <aside className="space-y-6">
          <SectionCard titre="Mon accès">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-mono text-sm font-semibold text-slate-800">{data.nif}</p>
                <p className="text-xs text-slate-500">Identifiant de connexion</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-700">E-mail de contact</p>
                  <p className="break-all text-slate-600">{data.emailContribuable || 'Non renseigné'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3">
                <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-700">Téléphone</p>
                  <p className="text-slate-600">{data.telephoneContribuable || 'Non renseigné'}</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Votre mot de passe est personnel. En cas d’oubli, rapprochez-vous de votre centre
              fiscal pour le réinitialiser.
            </p>
          </SectionCard>

          <SectionCard titre="Canaux disponibles">
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <span className="font-medium text-slate-800">E-mail</span> — avis et rappels
                détaillés, avec lien vers votre espace.
              </li>
              <li>
                <span className="font-medium text-slate-800">SMS</span> — rappels courts (160
                caractères maximum).
              </li>
              <li>
                <span className="font-medium text-slate-800">Portail</span> — historique complet,
                accessible à tout moment.
              </li>
            </ul>
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
