import { useMemo } from 'react';
import { KeyRound, ShieldCheck, UserCog } from 'lucide-react';
import { PERMISSIONS } from '../../auth/permissions';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import Alert from '../../components/ui/Alert';
import { libelle } from '../../utils/libelles';

const ROLES = [
  {
    code: 'AGENT_GESTION',
    description: 'Gère les dossiers contribuables, génère les obligations et instruit les déclarations.',
  },
  {
    code: 'AGENT_RECETTE',
    description: 'Enregistre les paiements, suit les dettes et peut envoyer les relances.',
  },
  {
    code: 'RESPONSABLE',
    description: 'Pilote l’activité : tableau de bord, retards, recouvrement et rapports.',
  },
  {
    code: 'ADMIN',
    description: 'Administre les utilisateurs, les types d’impôts, les jours fériés et les paramètres fiscaux.',
  },
];

const LIBELLES_PERMISSIONS = {
  'calendrier.consulter': 'Consulter le calendrier fiscal',
  'obligation.consulter': 'Consulter les obligations',
  'obligation.generer': 'Générer des obligations',
  'obligation.affecter': 'Affecter une obligation à un agent',
  'declaration.consulter': 'Consulter les déclarations',
  'declaration.deposer': 'Déposer une déclaration',
  'declaration.instruire': 'Valider ou rejeter une déclaration',
  'paiement.consulter': 'Consulter les paiements',
  'paiement.enregistrer': 'Enregistrer un paiement',
  'dette.consulter': 'Consulter les dettes',
  'dette.suivre': 'Suivre le recouvrement des dettes',
  'compte.consulter': 'Consulter les comptes courants',
  'acompte.consulter': 'Consulter les acomptes',
  'notification.consulter': 'Consulter les notifications',
  'notification.lire': 'Marquer les notifications comme lues',
  'notification.generer': 'Générer les rappels automatiques',
  'notification.envoyer': 'Envoyer des notifications',
  'profil.modifier': 'Modifier ses préférences de contact',
  'dossier.consulter': 'Consulter les dossiers contribuables',
  'contribuable.gerer': 'Créer et modifier des contribuables',
  'simulateur.utiliser': 'Utiliser le simulateur fiscal',
  'dashboard.consulter': 'Consulter le tableau de bord',
  'indicateurs.consulter': 'Consulter les indicateurs',
  'retard.consulter': 'Consulter les obligations en retard',
  'recouvrement.suivre': 'Suivre le recouvrement',
  'rapport.consulter': 'Consulter les rapports et exports',
};

export default function RolesPage() {
  const roles = useMemo(
    () =>
      ROLES.map((role) => {
        const permissions = PERMISSIONS[role.code] || [];
        return {
          ...role,
          permissions,
          descriptionPermissions:
            role.code === 'ADMIN'
              ? 'Toutes les permissions'
              : permissions.map((permission) => LIBELLES_PERMISSIONS[permission] || permission).join(' '),
        };
      }),
    [],
  );
  const liste = useListView(roles, 10);

  return (
    <div>
      <PageHeader
        titre="Rôles et permissions"
        description="Référentiel des droits accordés à chaque profil. Les contrôles sont appliqués par le serveur."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Rôles' }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard title="Rôles applicatifs" value={roles.length} icon={UserCog} />
        <KpiCard title="Permissions déclarées" value={Object.keys(LIBELLES_PERMISSIONS).length} icon={KeyRound} />
        <KpiCard title="Contrôle d’accès" value="Serveur" icon={ShieldCheck} tone="success" />
      </div>

      <Alert variante="info" titre="Référentiel en lecture seule" className="mb-5">
        Les rôles sont définis par le modèle de sécurité du backend et ne se modifient pas depuis l’interface. Un
        administrateur peut changer le rôle d’un agent dans la page Utilisateurs.
      </Alert>

      <ListToolbar
        value={liste.query}
        onChange={liste.setQuery}
        placeholder="Rechercher un rôle ou une permission…"
        count={liste.filteredCount}
      />

      {liste.filteredCount === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          Aucun rôle ne correspond à cette recherche.{' '}
          <button type="button" onClick={liste.clear} className="font-semibold text-primary underline">
            Effacer la recherche
          </button>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {liste.items.map((role) => (
            <section key={role.code} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-800">{libelle('role', role.code)}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{role.description}</p>
                </div>
                <span className="shrink-0 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {role.code === 'ADMIN' ? 'Accès complet' : `${role.permissions.length} droits`}
                </span>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {role.code === 'ADMIN' ? 'Permissions' : `${role.permissions.length} permission(s)`}
                </p>
                {role.code === 'ADMIN' ? (
                  <p className="text-sm text-slate-700">Accès complet à toutes les fonctionnalités.</p>
                ) : (
                  <ul className="flex flex-wrap gap-1.5">
                    {role.permissions.map((permission) => (
                      <li
                        key={permission}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                      >
                        {LIBELLES_PERMISSIONS[permission] || permission}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
