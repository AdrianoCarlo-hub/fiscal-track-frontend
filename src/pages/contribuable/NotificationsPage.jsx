import { useMemo, useState } from 'react';
import { Bell, CheckCheck, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData, { useListView } from '../../hooks/useApiData';
import useAsyncAction from '../../hooks/useAsyncAction';
import notificationService from '../../services/notificationService';
import { EVENEMENT_NOTIFICATIONS_LUES } from '../../services/notificationService';
import { useToast } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import { formatDateHeure } from '../../utils/formatUtils';
import { libelle } from '../../utils/libelles';

export default function NotificationsPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const [filtre, setFiltre] = useState('TOUTES');
  const [selection, setSelection] = useState(null);
  const [enCoursIds, setEnCoursIds] = useState([]);

  const { data, chargement, erreur, recharger } = useApiData(
    () => notificationService.parPortail(utilisateur.identifiant),
    [utilisateur.identifiant],
    { valeurInitiale: [] },
  );

  const notifications = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const nonLues = useMemo(() => notifications.filter((n) => !n.lu), [notifications]);

  const filtrees = useMemo(
    () => (filtre === 'NON_LUES' ? nonLues : notifications),
    [filtre, notifications, nonLues],
  );

  const { query, setQuery, clear, setPage, items, filteredCount, pagination } = useListView(
    filtrees,
    10,
  );

  const marquerLue = async (notification) => {
    if (notification.lu) return;
    setEnCoursIds((ids) => [...ids, notification.idNotif]);
    try {
      await notificationService.marquerLue(notification.idNotif);
      window.dispatchEvent(new Event(EVENEMENT_NOTIFICATIONS_LUES));
      await recharger();
    } catch {
      notifier({
        variante: 'danger',
        titre: 'Marquage impossible',
        message: 'La notification n’a pas pu être marquée comme lue. Réessayez.',
      });
    } finally {
      setEnCoursIds((ids) => ids.filter((id) => id !== notification.idNotif));
    }
  };

  const toutMarquer = useAsyncAction(
    async () => {
      await Promise.all(nonLues.map((notification) => notificationService.marquerLue(notification.idNotif)));
      window.dispatchEvent(new Event(EVENEMENT_NOTIFICATIONS_LUES));
      await recharger();
    },
    {
      onSucces: () => {
        notifier({
          variante: 'succes',
          titre: 'Notifications mises à jour',
          message: 'Toutes vos notifications ont été marquées comme lues.',
        });
      },
    },
  );

  const ouvrir = (notification) => {
    setSelection(notification);
    marquerLue(notification);
  };

  const colonnes = [
    {
      cle: 'date',
      label: 'Reçue le',
      render: (notification) => (
        <div>
          <p>{formatDateHeure(notification.dateEnvoiEffective || notification.dateEnvoiPrevue)}</p>
          <p className="text-xs text-slate-500">{libelle('typeRelance', notification.typeRelance)}</p>
        </div>
      ),
    },
    {
      cle: 'objet',
      label: 'Notification',
      render: (notification) => (
        <div className="flex items-start gap-2">
          {!notification.lu && (
            <span
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
              aria-label="Non lue"
            />
          )}
          <div className="min-w-0">
            <p className={`truncate ${notification.lu ? 'text-slate-700' : 'font-semibold text-slate-900'}`}>
              {notification.objetEmail || libelle('typeRelance', notification.typeRelance)}
            </p>
            <p className="truncate text-xs text-slate-500">{notification.messageContenu}</p>
          </div>
        </div>
      ),
    },
    {
      cle: 'canalEnvoi',
      label: 'Canal',
      render: (notification) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
          {notification.canalEnvoi === 'SMS' ? (
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Mail className="h-4 w-4" aria-hidden="true" />
          )}
          {libelle('canal', notification.canalEnvoi)}
        </span>
      ),
    },
    {
      cle: 'statutEnvoi',
      label: 'Envoi',
      render: (notification) => (
        <StatutBadge famille="statutEnvoi" code={notification.statutEnvoi} />
      ),
    },
    {
      cle: 'actions',
      label: 'Action',
      align: 'right',
      render: (notification) => (
        <Button variant="ghost" size="sm" onClick={() => ouvrir(notification)}>
          Lire
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Mes notifications"
        description="Messages et relances adressés à votre dossier par l’administration fiscale."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Mes notifications' }]}
        actions={
          nonLues.length > 0 ? (
            <Button
              variant="secondary"
              onClick={() => toutMarquer.executer()}
              chargement={toutMarquer.enCours}
            >
              <CheckCheck className="h-4 w-4" aria-hidden="true" />
              Tout marquer comme lu
            </Button>
          ) : null
        }
      />

      {toutMarquer.erreur && (
        <Alert variante="danger" titre="Action impossible" className="mb-4">
          {toutMarquer.erreur.message}
        </Alert>
      )}

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={filtre}
            onChange={(valeur) => {
              setFiltre(valeur);
              setPage(0);
            }}
            onglets={[
              { cle: 'TOUTES', libelle: 'Toutes', compteur: notifications.length },
              { cle: 'NON_LUES', libelle: 'Non lues', compteur: nonLues.length },
            ]}
          />
        </div>
        <div className="p-5">
          <ListToolbar
            value={query}
            onChange={setQuery}
            placeholder="Rechercher par objet, message ou type…"
            count={filteredCount}
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
            titreVide="Aucune notification"
            descriptionVide="Vous n’avez reçu aucun message de l’administration fiscale pour le moment."
            cleLigne={(notification) => notification.idNotif}
          />
        </div>
      </SectionCard>

      <Modal
        ouvert={!!selection}
        onClose={() => setSelection(null)}
        titre={selection?.objetEmail || 'Notification'}
        description={
          selection
            ? `${libelle('typeRelance', selection.typeRelance)} · ${formatDateHeure(
                selection.dateEnvoiEffective || selection.dateEnvoiPrevue,
              )}`
            : ''
        }
        taille="lg"
        pied={
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setSelection(null)}>
              Fermer
            </Button>
          </div>
        }
      >
        {selection && (
          <div className="space-y-4 text-sm text-slate-700">
            <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 leading-relaxed">
              {selection.messageContenu || selection.messageSms || 'Aucun contenu disponible.'}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Bell className="h-4 w-4" aria-hidden="true" />
                Canal : {libelle('canal', selection.canalEnvoi)}
              </span>
              <StatutBadge famille="statutEnvoi" code={selection.statutEnvoi} />
              {selection.nbTentatives > 0 && <span>Tentatives : {selection.nbTentatives}</span>}
            </div>
            {selection.erreurEnvoi && (
              <Alert variante="avertissement" titre="Information d’acheminement">
                {selection.erreurEnvoi}
              </Alert>
            )}
            {enCoursIds.includes(selection.idNotif) && (
              <p className="text-xs text-slate-500">Marquage comme lue…</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
