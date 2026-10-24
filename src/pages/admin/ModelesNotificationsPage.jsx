import { useMemo, useState } from 'react';
import { Copy, Eye, Mail, MessageSquare, Monitor } from 'lucide-react';
import useApiData, { useListView } from '../../hooks/useApiData';
import adminService from '../../services/adminService';
import { useToast } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import StatutBadge from '../../components/ui/StatutBadge';
import { libelle } from '../../utils/libelles';

const ICONES = {
  EMAIL: Mail,
  SMS: MessageSquare,
  PORTAIL: Monitor,
};

export default function ModelesNotificationsPage() {
  const { notifier } = useToast();
  const [canal, setCanal] = useState('TOUS');
  const [modeleSelectionne, setModeleSelectionne] = useState(null);

  const { data, chargement, erreur, recharger } = useApiData(
    () => adminService.modelesNotifications(),
    [],
    { valeurInitiale: [] },
  );

  const modeles = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const parCanal = useMemo(
    () => (canal === 'TOUS' ? modeles : modeles.filter((modele) => modele.canal === canal)),
    [modeles, canal],
  );

  const { query, setQuery, clear, setPage, items, filteredCount, pagination } = useListView(
    parCanal,
    10,
  );

  const onglets = [
    { cle: 'TOUS', libelle: 'Tous les modèles', compteur: modeles.length },
    { cle: 'EMAIL', libelle: 'E-mail', compteur: modeles.filter((m) => m.canal === 'EMAIL').length },
    { cle: 'SMS', libelle: 'SMS', compteur: modeles.filter((m) => m.canal === 'SMS').length },
    { cle: 'PORTAIL', libelle: 'Portail', compteur: modeles.filter((m) => m.canal === 'PORTAIL').length },
  ];

  const colonnes = [
    {
      cle: 'canal',
      label: 'Canal',
      render: (modele) => {
        const Icone = ICONES[modele.canal] || Mail;
        return (
          <span className="inline-flex items-center gap-2 text-slate-700">
            <Icone className="h-4 w-4 text-slate-400" aria-hidden="true" />
            {libelle('canal', modele.canal)}
          </span>
        );
      },
    },
    {
      cle: 'typeRelance',
      label: 'Type de notification',
      render: (modele) => (
        <StatutBadge famille="typeRelance" code={modele.typeRelance} variante="info" />
      ),
    },
    {
      cle: 'objet',
      label: 'Objet',
      render: (modele) => (
        <span className="block max-w-md truncate text-slate-700" title={modele.objet || ''}>
          {modele.objet || '—'}
        </span>
      ),
    },
    {
      cle: 'longueurCaracteres',
      label: 'Longueur',
      align: 'right',
      render: (modele) => (
        <span
          className={
            modele.canal === 'SMS' && modele.longueurCaracteres > 160
              ? 'font-semibold text-danger'
              : 'text-slate-600'
          }
        >
          {modele.longueurCaracteres} car.
        </span>
      ),
    },
    {
      cle: 'actions',
      label: 'Aperçu',
      align: 'right',
      render: (modele) => (
        <Button variant="ghost" size="sm" onClick={() => setModeleSelectionne(modele)}>
          <Eye className="h-4 w-4" aria-hidden="true" />
          Voir
        </Button>
      ),
    },
  ];

  const copier = async () => {
    if (!modeleSelectionne) return;
    const texte = `Objet : ${modeleSelectionne.objet}\n\n${modeleSelectionne.corps}`;
    try {
      await navigator.clipboard.writeText(texte);
      notifier({ titre: 'Modèle copié', variante: 'succes' });
    } catch {
      notifier({
        titre: 'Copie impossible',
        message: 'Votre navigateur a refusé l’accès au presse-papiers.',
        variante: 'danger',
      });
    }
  };

  return (
    <div>
      <PageHeader
        titre="Modèles de notifications"
        description="Aperçu des messages générés par la plateforme pour chaque type de relance et chaque canal. Ces modèles sont fournis par le serveur et ne sont pas modifiables depuis l’interface."
        fil={[{ libelle: 'Administration' }, { libelle: 'Modèles de notifications' }]}
      />

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs onglets={onglets} actif={canal} onChange={(valeur) => { setCanal(valeur); setPage(0); }} />
        </div>
        <div className="p-5">
          <ListToolbar
            value={query}
            onChange={setQuery}
            count={filteredCount}
            placeholder="Rechercher un modèle par objet ou par type…"
          />
          <DataTable
            colonnes={colonnes}
            donnees={items}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            pagination={pagination}
            onPageChange={setPage}
            rechercheActive={!!query}
            onEffacerRecherche={clear}
            titreVide="Aucun modèle"
            descriptionVide="Aucun modèle de notification ne correspond à ce filtre."
            cleLigne={(modele) => `${modele.typeRelance}-${modele.canal}`}
          />
        </div>
      </SectionCard>

      <Modal
        ouvert={!!modeleSelectionne}
        onClose={() => setModeleSelectionne(null)}
        titre="Aperçu du modèle"
        description={
          modeleSelectionne
            ? `${libelle('typeRelance', modeleSelectionne.typeRelance)} · ${libelle('canal', modeleSelectionne.canal)}`
            : ''
        }
        taille="lg"
        pied={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setModeleSelectionne(null)}>
              Fermer
            </Button>
            <Button onClick={copier}>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copier le modèle
            </Button>
          </div>
        }
      >
        {modeleSelectionne && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Objet</p>
              <p className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800">
                {modeleSelectionne.objet || '—'}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Corps du message</p>
              <pre className="mt-1 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white px-4 py-3 font-sans text-sm leading-relaxed text-slate-700">
                {modeleSelectionne.corps}
              </pre>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                Longueur : <strong className="text-slate-700">{modeleSelectionne.longueurCaracteres}</strong>{' '}
                caractères
              </span>
              {modeleSelectionne.canal === 'SMS' && (
                <span
                  className={
                    modeleSelectionne.longueurCaracteres > 160 ? 'font-semibold text-danger' : 'text-success'
                  }
                >
                  {modeleSelectionne.longueurCaracteres > 160
                    ? 'Dépasse la limite de 160 caractères d’un SMS'
                    : 'Compatible avec un SMS unique'}
                </span>
              )}
            </div>
            {modeleSelectionne.canal === 'SMS' && modeleSelectionne.longueurCaracteres > 160 && (
              <Alert variante="avertissement" titre="Modèle trop long">
                Ce message dépasserait un SMS unique. Vérifiez le gabarit côté serveur.
              </Alert>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
