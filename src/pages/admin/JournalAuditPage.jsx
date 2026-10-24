import { useMemo, useState } from 'react';
import { Activity, CalendarClock, History, Play, Users } from 'lucide-react';
import adminService from '../../services/adminService';
import { useApiData, useListView } from '../../hooks/useApiData';
import { useConfirm, useToast } from '../../context/notificationContext';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Tabs from '../../components/ui/Tabs';
import KpiCard from '../../components/ui/KpiCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { formatDateHeure } from '../../utils/formatUtils';

const LIBELLES_ACTIONS = {
  CONNEXION: 'Connexion',
  CONNEXION_ECHEC: 'Échec de connexion',
  CREATION_UTILISATEUR: 'Création d’un utilisateur',
  MODIFICATION_UTILISATEUR: 'Modification d’un utilisateur',
  SUPPRESSION_UTILISATEUR: 'Suppression d’un utilisateur',
  CREATION_CONTRIBUABLE: 'Création d’un contribuable',
  MODIFICATION_CONTRIBUABLE: 'Modification d’un contribuable',
  CREATION_TYPE_IMPOT: 'Création d’un type d’impôt',
  MODIFICATION_TYPE_IMPOT: 'Modification d’un type d’impôt',
  CREATION_OBLIGATION: 'Génération d’une obligation',
  AFFECTATION_OBLIGATION: 'Affectation d’une obligation',
  DEPOT_DECLARATION: 'Dépôt d’une déclaration',
  VALIDATION_DECLARATION: 'Validation d’une déclaration',
  REJET_DECLARATION: 'Rejet d’une déclaration',
  ENREGISTREMENT_PAIEMENT: 'Enregistrement d’un paiement',
  MODIFICATION_PARAMETRE: 'Modification d’un paramètre fiscal',
};

const TACHES = [
  {
    nom: 'detection-retards',
    titre: 'Détecter les retards',
    description: 'Marque en retard les obligations échues non déposées.',
  },
  {
    nom: 'rappels-echeances',
    titre: 'Générer les rappels d’échéance',
    description: 'Prépare les rappels J-7, J-1, J+1 et J+8.',
  },
  {
    nom: 'suivi-recouvrement',
    titre: 'Lancer le suivi du recouvrement',
    description: 'Met à jour les statuts des comptes non soldés.',
  },
  {
    nom: 'generer-obligations-mensuelles',
    titre: 'Générer les obligations mensuelles',
    description: 'Crée les obligations des impôts à périodicité mensuelle.',
  },
  {
    nom: 'generer-obligations-annuelles',
    titre: 'Générer les obligations annuelles',
    description: 'Crée les obligations des impôts annuels.',
  },
  {
    nom: 'generer-acomptes',
    titre: 'Générer les acomptes IR / IS',
    description: 'Crée les obligations d’acompte de l’exercice.',
  },
];

function libelleAction(action) {
  if (!action) return '—';
  return (
    LIBELLES_ACTIONS[action] ||
    String(action)
      .toLowerCase()
      .replaceAll('_', ' ')
      .replace(/^./, (lettre) => lettre.toUpperCase())
  );
}

export default function JournalAuditPage() {
  const { data, chargement, erreur, recharger } = useApiData(adminService.historique, []);
  const { notifier } = useToast();
  const confirmer = useConfirm();
  const [onglet, setOnglet] = useState('journal');
  const [tacheEnCours, setTacheEnCours] = useState(null);

  const historique = useMemo(() => data || [], [data]);
  const liste = useListView(historique, 15);
  const utilisateurs = useMemo(
    () => new Set(historique.map((entree) => entree.utilisateur).filter(Boolean)).size,
    [historique],
  );

  const declencher = async (tache) => {
    const confirme = await confirmer({
      titre: 'Déclencher cette tâche ?',
      message: `${tache.titre}. La tâche s’exécutera immédiatement et son résultat sera journalisé.`,
      libelleConfirmer: 'Déclencher',
    });
    if (!confirme) return;
    setTacheEnCours(tache.nom);
    try {
      const resultat = await adminService.declencherScheduler(tache.nom);
      notifier({
        titre: 'Tâche exécutée',
        message:
          resultat?.nombreGenerees !== undefined
            ? `${resultat.message} : ${resultat.nombreGenerees} élément(s).`
            : resultat?.message || tache.titre,
        variante: 'succes',
      });
      recharger();
    } catch (err) {
      notifier({ titre: 'Tâche en échec', message: err?.message, variante: 'danger' });
    } finally {
      setTacheEnCours(null);
    }
  };

  const colonnes = [
    {
      cle: 'createdAt',
      label: 'Date',
      render: (entree) => <span className="text-sm text-slate-700">{formatDateHeure(entree.createdAt)}</span>,
    },
    {
      cle: 'utilisateur',
      label: 'Utilisateur',
      render: (entree) => <span className="font-mono text-xs text-slate-700">{entree.utilisateur}</span>,
    },
    {
      cle: 'action',
      label: 'Action',
      render: (entree) => <span className="font-medium text-slate-800">{libelleAction(entree.action)}</span>,
    },
    {
      cle: 'details',
      label: 'Détails',
      render: (entree) => <span className="text-sm text-slate-600">{entree.details || '—'}</span>,
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Journal d’audit"
        description="Traçabilité des actions d’administration et déclenchement manuel des tâches planifiées."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Journal d’audit' }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard title="Actions journalisées" value={historique.length} icon={History} />
        <KpiCard title="Utilisateurs distincts" value={utilisateurs} icon={Users} />
        <KpiCard title="Tâches planifiées" value={TACHES.length} icon={CalendarClock} tone="success" />
      </div>

      <div className="mb-5">
        <Tabs
          actif={onglet}
          onChange={setOnglet}
          onglets={[
            { cle: 'journal', libelle: 'Journal d’audit', compteur: historique.length },
            { cle: 'taches', libelle: 'Tâches planifiées', compteur: TACHES.length },
          ]}
        />
      </div>

      {onglet === 'journal' && (
        <>
          {chargement && <LoadingState lignes={4} />}
          {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}
          {!chargement && !erreur && (
            <>
              <Alert variante="info" titre="Traçabilité" className="mb-5">
                Les connexions, créations, modifications et décisions sont conservées par le serveur. Les entrées les
                plus récentes apparaissent en premier.
              </Alert>
              <ListToolbar
                value={liste.query}
                onChange={liste.setQuery}
                placeholder="Rechercher un utilisateur, une action ou un détail…"
                count={liste.filteredCount}
              />
              <DataTable
                colonnes={colonnes}
                donnees={liste.items}
                pagination={liste.pagination}
                onPageChange={liste.setPage}
                rechercheActive={Boolean(liste.query)}
                onEffacerRecherche={liste.clear}
                titreVide="Aucune action journalisée"
                descriptionVide="Les actions d’administration apparaîtront ici."
                cleLigne={(entree) => entree.idHistorique}
              />
            </>
          )}
        </>
      )}

      {onglet === 'taches' && (
        <>
          <Alert variante="avertissement" titre="Exécution immédiate" className="mb-5">
            Ces tâches sont normalement exécutées par le planificateur. Le déclenchement manuel est réservé aux
            opérations de maintenance et aux rattrapages.
          </Alert>
          <div className="grid gap-4 lg:grid-cols-2">
            {TACHES.map((tache) => (
              <SectionCard key={tache.nom} titre={tache.titre} description={tache.description}>
                <Button
                  variant="ghost"
                  chargement={tacheEnCours === tache.nom}
                  disabled={Boolean(tacheEnCours) && tacheEnCours !== tache.nom}
                  onClick={() => declencher(tache)}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  {tacheEnCours === tache.nom ? 'Exécution…' : 'Déclencher maintenant'}
                </Button>
              </SectionCard>
            ))}
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <Activity className="h-4 w-4" aria-hidden="true" />
            Chaque déclenchement est enregistré dans le journal d’audit.
          </p>
        </>
      )}
    </div>
  );
}
