import { useState } from 'react';
import { Pencil, ShieldCheck, Trash2, UserPlus, Users } from 'lucide-react';
import adminService from '../../services/adminService';
import { useApiData, useListView } from '../../hooks/useApiData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useConfirm, useToast } from '../../context/notificationContext';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Input, Select } from '../../components/ui/FormControls';
import { libelle, options } from '../../utils/libelles';
import { formatTelephone } from '../../utils/formatUtils';

const DIVISIONS = options('division');
const ROLES = options('role').filter((role) => role.code !== 'CONTRIBUABLE');

export default function UtilisateursPage() {
  const { data, chargement, erreur, recharger } = useApiData(adminService.listerUtilisateurs, []);
  const liste = useListView(data || []);
  const { notifier } = useToast();
  const confirmer = useConfirm();
  const [modal, setModal] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(null);

  const utilisateurs = data || [];
  const administrateurs = utilisateurs.filter((u) => u.roleSecurite === 'ADMIN').length;
  const divisions = new Set(utilisateurs.map((u) => u.division)).size;

  const supprimer = async (utilisateur) => {
    const confirme = await confirmer({
      titre: 'Supprimer cet utilisateur ?',
      message: `L’agent ${utilisateur.idAgent} (${utilisateur.emailAgent}) ne pourra plus se connecter. Cette action est irréversible.`,
      libelleConfirmer: 'Supprimer',
      variante: 'danger',
    });
    if (!confirme) return;
    setSuppressionEnCours(utilisateur.idAgent);
    try {
      await adminService.supprimerUtilisateur(utilisateur.idAgent);
      notifier({ titre: 'Utilisateur supprimé', message: `${utilisateur.idAgent} a été supprimé.`, variante: 'succes' });
      recharger();
    } catch (err) {
      notifier({
        titre: 'Suppression impossible',
        message: err?.message || 'Une erreur est survenue.',
        variante: 'danger',
      });
    } finally {
      setSuppressionEnCours(null);
    }
  };

  const colonnes = [
    { cle: 'idAgent', label: 'Identifiant', render: (u) => <span className="font-mono text-xs">{u.idAgent}</span> },
    {
      cle: 'nomAgent',
      label: 'Agent',
      render: (u) => (
        <div>
          <p className="font-medium text-slate-800">
            {u.prenomAgent} {u.nomAgent}
          </p>
          <p className="text-xs text-slate-500">{u.emailAgent}</p>
        </div>
      ),
    },
    {
      cle: 'telephoneAgent',
      label: 'Téléphone',
      render: (u) => <span className="text-sm text-slate-600">{formatTelephone(u.telephoneAgent)}</span>,
    },
    { cle: 'division', label: 'Division', render: (u) => libelle('division', u.division) },
    {
      cle: 'roleSecurite',
      label: 'Rôle',
      render: (u) => (
        <span
          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${
            u.roleSecurite === 'ADMIN'
              ? 'border-danger/25 bg-danger/10 text-danger'
              : 'border-primary/20 bg-primary/10 text-primary'
          }`}
        >
          {libelle('role', u.roleSecurite)}
        </span>
      ),
    },
    {
      cle: 'actions',
      label: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setModal({ mode: 'edition', utilisateur: u })}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-danger hover:bg-danger/5"
            chargement={suppressionEnCours === u.idAgent}
            onClick={() => supprimer(u)}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Gestion des utilisateurs"
        description="Créez et modifiez les comptes des agents fiscaux, leurs divisions et leurs rôles."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Utilisateurs' }]}
        actions={
          <Button onClick={() => setModal({ mode: 'creation' })}>
            <UserPlus className="h-4 w-4" aria-hidden="true" /> Nouvel utilisateur
          </Button>
        }
      />

      {chargement && <LoadingState lignes={3} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <KpiCard title="Agents enregistrés" value={utilisateurs.length} icon={Users} />
            <KpiCard title="Administrateurs" value={administrateurs} icon={ShieldCheck} tone="danger" />
            <KpiCard title="Divisions représentées" value={divisions} icon={Users} tone="success" />
          </div>

          <Alert variante="info" titre="Comptes et sécurité" className="mb-5">
            Le mot de passe est chiffré côté serveur et n’est jamais renvoyé. À la modification, laissez le champ
            vide pour conserver le mot de passe actuel.
          </Alert>

          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher par nom, identifiant, e-mail, division ou rôle…"
            count={liste.filteredCount}
          />

          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            pagination={liste.pagination}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query)}
            onEffacerRecherche={liste.clear}
            titreVide="Aucun utilisateur"
            descriptionVide="Créez un premier compte agent pour commencer."
            cleLigne={(u) => u.idAgent}
          />
        </>
      )}

      <Modal
        ouvert={Boolean(modal)}
        onClose={() => setModal(null)}
        titre={modal?.mode === 'edition' ? 'Modifier l’utilisateur' : 'Nouvel utilisateur'}
        description={
          modal?.mode === 'edition'
            ? `Compte ${modal.utilisateur.idAgent}`
            : 'L’identifiant doit comporter 6 caractères alphanumériques en majuscules.'
        }
      >
        {modal && (
          <FormulaireUtilisateur
            utilisateur={modal.mode === 'edition' ? modal.utilisateur : null}
            onFermer={() => setModal(null)}
            onEnregistre={(message) => {
              setModal(null);
              notifier({ titre: 'Utilisateur enregistré', message, variante: 'succes' });
              recharger();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function FormulaireUtilisateur({ utilisateur, onFermer, onEnregistre }) {
  const edition = Boolean(utilisateur);
  const [form, setForm] = useState({
    idAgent: utilisateur?.idAgent || '',
    nomAgent: utilisateur?.nomAgent || '',
    prenomAgent: utilisateur?.prenomAgent || '',
    emailAgent: utilisateur?.emailAgent || '',
    telephoneAgent: utilisateur?.telephoneAgent || '',
    motDePasse: '',
    division: utilisateur?.division || 'GESTION',
    roleSecurite: utilisateur?.roleSecurite || 'AGENT_GESTION',
  });
  const [erreursLocales, setErreursLocales] = useState({});

  const { executer, enCours, erreur, champs } = useAsyncAction(
    async () => {
      const payload = {
        idAgent: form.idAgent.trim().toUpperCase(),
        nomAgent: form.nomAgent.trim(),
        prenomAgent: form.prenomAgent.trim(),
        emailAgent: form.emailAgent.trim(),
        telephoneAgent: form.telephoneAgent.trim(),
        division: form.division,
        roleSecurite: form.roleSecurite,
      };
      if (form.motDePasse) payload.motDePasseHashAgent = form.motDePasse;
      if (edition) {
        delete payload.idAgent;
        return adminService.modifierUtilisateur(utilisateur.idAgent, payload);
      }
      return adminService.ajouterUtilisateur(payload);
    },
    {
      onSucces: () =>
        onEnregistre(
          edition ? `Le compte ${utilisateur.idAgent} a été mis à jour.` : `Le compte ${form.idAgent} a été créé.`,
        ),
    },
  );

  const modifier = (champ, valeur) => setForm((precedent) => ({ ...precedent, [champ]: valeur }));

  const soumettre = (event) => {
    event.preventDefault();
    const erreurs = {};
    if (!/^[A-Z0-9]{6}$/.test(form.idAgent.trim().toUpperCase())) {
      erreurs.idAgent = '6 caractères alphanumériques en majuscules (ex. AG0005).';
    }
    if (!form.nomAgent.trim()) erreurs.nomAgent = 'Le nom est obligatoire.';
    if (!form.prenomAgent.trim()) erreurs.prenomAgent = 'Le prénom est obligatoire.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.emailAgent.trim())) {
      erreurs.emailAgent = 'Adresse e-mail invalide.';
    }
    if (form.telephoneAgent && !/^(\+261\d{9}|03\d{8})$/.test(form.telephoneAgent.trim())) {
      erreurs.telephoneAgent = 'Format attendu : +261XXXXXXXXX ou 03XXXXXXXX.';
    }
    if (!edition && form.motDePasse.length < 8) {
      erreurs.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères.';
    }
    if (edition && form.motDePasse && form.motDePasse.length < 8) {
      erreurs.motDePasse = 'Le nouveau mot de passe doit contenir au moins 8 caractères.';
    }
    setErreursLocales(erreurs);
    if (Object.keys(erreurs).length > 0) return;
    executer();
  };

  const erreurDe = (champ) => erreursLocales[champ] || champs[champ];

  return (
    <form onSubmit={soumettre} className="space-y-4" noValidate>
      {erreur && (
        <Alert variante="danger" titre="Enregistrement impossible">
          {erreur.message}
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="idAgent"
          label="Identifiant agent"
          obligatoire
          value={form.idAgent}
          onChange={(e) => modifier('idAgent', e.target.value.toUpperCase())}
          disabled={edition}
          maxLength={6}
          placeholder="AG0005"
          erreur={erreurDe('idAgent')}
          aide={edition ? 'L’identifiant ne peut pas être modifié.' : undefined}
        />
        <Input
          id="telephoneAgent"
          label="Téléphone"
          value={form.telephoneAgent}
          onChange={(e) => modifier('telephoneAgent', e.target.value)}
          placeholder="+261340000005"
          erreur={erreurDe('telephoneAgent')}
        />
        <Input
          id="nomAgent"
          label="Nom"
          obligatoire
          value={form.nomAgent}
          onChange={(e) => modifier('nomAgent', e.target.value)}
          erreur={erreurDe('nomAgent')}
        />
        <Input
          id="prenomAgent"
          label="Prénom"
          obligatoire
          value={form.prenomAgent}
          onChange={(e) => modifier('prenomAgent', e.target.value)}
          erreur={erreurDe('prenomAgent')}
        />
      </div>

      <Input
        id="emailAgent"
        type="email"
        label="Adresse e-mail"
        obligatoire
        value={form.emailAgent}
        onChange={(e) => modifier('emailAgent', e.target.value)}
        erreur={erreurDe('emailAgent')}
      />

      <Input
        id="motDePasse"
        type="password"
        label={edition ? 'Nouveau mot de passe' : 'Mot de passe'}
        obligatoire={!edition}
        value={form.motDePasse}
        onChange={(e) => modifier('motDePasse', e.target.value)}
        autoComplete="new-password"
        erreur={erreurDe('motDePasse')}
        aide={edition ? 'Laisser vide pour conserver le mot de passe actuel.' : '8 caractères minimum.'}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="division"
          label="Division"
          obligatoire
          value={form.division}
          onChange={(e) => modifier('division', e.target.value)}
          erreur={erreurDe('division')}
        >
          {DIVISIONS.map((division) => (
            <option key={division.code} value={division.code}>
              {division.libelle}
            </option>
          ))}
        </Select>
        <Select
          id="roleSecurite"
          label="Rôle"
          obligatoire
          value={form.roleSecurite}
          onChange={(e) => modifier('roleSecurite', e.target.value)}
          erreur={erreurDe('roleSecurite')}
        >
          {ROLES.map((role) => (
            <option key={role.code} value={role.code}>
              {role.libelle}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onFermer} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" chargement={enCours}>
          {edition ? 'Enregistrer' : 'Créer l’utilisateur'}
        </Button>
      </div>
    </form>
  );
}
