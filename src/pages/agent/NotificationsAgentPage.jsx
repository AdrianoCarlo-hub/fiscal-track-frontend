import { useMemo, useState } from 'react';
import { BellRing, Mail, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import notificationService from '../../services/notificationService';
import useApiData, { useListView } from '../../hooks/useApiData';
import useAsyncAction from '../../hooks/useAsyncAction';
import { useToast, useConfirm } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import StatutBadge from '../../components/ui/StatutBadge';
import Tabs from '../../components/ui/Tabs';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import DetailList from '../../components/ui/DetailList';
import { formatDateHeure } from '../../utils/formatUtils';
import { libelle } from '../../utils/libelles';

export default function NotificationsAgentPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const confirmer = useConfirm();

  const [filtre, setFiltre] = useState('TOUTES');
  const [selection, setSelection] = useState(null);
  const [envoiId, setEnvoiId] = useState(null);

  const peutGenerer = peut(utilisateur?.role, 'notification.generer');
  const peutEnvoyer = peut(utilisateur?.role, 'notification.envoyer');

  const { data, chargement, erreur, recharger } = useApiData(
    () => notificationService.lister(),
    [],
    { valeurInitiale: [] },
  );

  const notifications = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const compteurs = useMemo(
    () => ({
      TOUTES: notifications.length,
      EN_ATTENTE: notifications.filter((notification) => notification.statutEnvoi === 'EN_ATTENTE').length,
      ENVOYE: notifications.filter((notification) => notification.statutEnvoi === 'ENVOYE').length,
      ECHEC: notifications.filter(
        (notification) =>
          notification.statutEnvoi === 'ECHEC' || notification.statutEnvoi === 'ECHEC_DEFINITIF',
      ).length,
    }),
    [notifications],
  );

  const filtrees = useMemo(() => {
    if (filtre === 'TOUTES') return notifications;
    if (filtre === 'ECHEC') {
      return notifications.filter(
        (notification) =>
          notification.statutEnvoi === 'ECHEC' || notification.statutEnvoi === 'ECHEC_DEFINITIF',
      );
    }
    return notifications.filter((notification) => notification.statutEnvoi === filtre);
  }, [notifications, filtre]);

  const vue = useListView(filtrees, 10);

  const generer = useAsyncAction(
    async () => {
      const confirme = await confirmer({
        titre: 'Générer les rappels J-7',
        message:
          'Le serveur créera les rappels d’échéance pour les obligations arrivant à terme dans 7 jours. Certains doublons peuvent être ignorés automatiquement.',
        libelleConfirmer: 'Générer',
      });
      if (!confirme) return null;
      return notificationService.genererRappels(7);
    },
    {
      onSucces: async (resultat) => {
        if (!resultat) return;
        notifier({
          variante: 'succes',
          titre: 'Rappels générés',
          message: resultat.message || 'Les rappels ont été créés.',
        });
        await recharger();
      },
    },
  );

  const envoyerEnAttente = useAsyncAction(
    async () => {
      const confirme = await confirmer({
        titre: 'Envoyer les notifications en attente',
        message:
          'Toutes les notifications en attente seront envoyées par e-mail et/ou SMS selon les préférences des contribuables.',
        libelleConfirmer: 'Envoyer',
      });
      if (!confirme) return null;
      return notificationService.envoyerEnAttente();
    },
    {
      onSucces: async (resultat) => {
        if (!resultat) return;
        notifier({
          variante: 'succes',
          titre: 'Envoi terminé',
          message: resultat.message || 'Les notifications en attente ont été traitées.',
        });
        await recharger();
      },
    },
  );

  const envoyerUne = async (notification) => {
    const confirme = await confirmer({
      titre: 'Envoyer cette notification',
      message: `Confirmez-vous l’envoi de la notification n°${notification.idNotif} à ${notification.nif} ?`,
      libelleConfirmer: 'Envoyer',
    });
    if (!confirme) return;
    setEnvoiId(notification.idNotif);
    try {
      const resultat = await notificationService.envoyerUne(notification.idNotif);
      notifier({
        variante: 'succes',
        titre: 'Notification traitée',
        message: resultat?.message || 'La notification a été envoyée.',
      });
      await recharger();
    } catch (err) {
      notifier({
        variante: 'danger',
        titre: 'Envoi impossible',
        message: err?.message || 'La notification n’a pas pu être envoyée.',
      });
    } finally {
      setEnvoiId(null);
    }
  };

  const colonnes = [
    {
      cle: 'nif',
      label: 'Contribuable',
      render: (notification) => (
        <div>
          <p className="font-mono text-sm font-medium text-slate-800">{notification.nif}</p>
          <p className="text-xs text-slate-500">
            {libelle('typeRelance', notification.typeRelance)}
          </p>
        </div>
      ),
    },
    {
      cle: 'objet',
      label: 'Objet',
      render: (notification) => (
        <div className="max-w-xs">
          <p className="truncate font-medium text-slate-800">
            {notification.objetEmail || libelle('typeRelance', notification.typeRelance)}
          </p>
          <p className="truncate text-xs text-slate-500">{notification.messageContenu}</p>
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
      cle: 'dateEnvoiPrevue',
      label: 'Envoi prévu',
      render: (notification) => formatDateHeure(notification.dateEnvoiPrevue),
    },
    {
      cle: 'statutEnvoi',
      label: 'Statut',
      render: (notification) => (
        <div>
          <StatutBadge famille="statutEnvoi" code={notification.statutEnvoi} />
          {notification.nbTentatives > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              {notification.nbTentatives} tentative{notification.nbTentatives > 1 ? 's' : ''}
            </p>
          )}
        </div>
      ),
    },
    {
      cle: 'actions',
      label: 'Actions',
      align: 'right',
      render: (notification) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelection(notification)}>
            Détail
          </Button>
          {peutEnvoyer &&
            ['EN_ATTENTE', 'ECHEC'].includes(notification.statutEnvoi) && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => envoyerUne(notification)}
                disabled={envoiId === notification.idNotif}
                chargement={envoiId === notification.idNotif}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Envoyer
              </Button>
            )}
        </div>
      ),
    },
  ];

  const erreurAction = generer.erreur || envoyerEnAttente.erreur;

  return (
    <div>
      <PageHeader
        titre="Notifications et rappels"
        description="Relances automatiques et messages adressés aux contribuables."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Notifications' }]}
        actions={
          <>
            {peutGenerer && (
              <Button
                variant="ghost"
                onClick={() => generer.executer()}
                chargement={generer.enCours}
              >
                <BellRing className="h-4 w-4" aria-hidden="true" />
                Générer les rappels J-7
              </Button>
            )}
            {peutEnvoyer && (
              <Button
                onClick={() => envoyerEnAttente.executer()}
                chargement={envoyerEnAttente.enCours}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Envoyer les notifications en attente
              </Button>
            )}
          </>
        }
      />

      {erreurAction && (
        <Alert variante="danger" titre="Action impossible" className="mb-5">
          {erreurAction.message}
        </Alert>
      )}

      {!peutGenerer && (
        <Alert variante="info" titre="Génération réservée" className="mb-5">
          Votre rôle permet de consulter et d’envoyer les notifications existantes, mais pas d’en
          générer de nouvelles. La génération est réservée aux agents de gestion, aux responsables
          et aux administrateurs.
        </Alert>
      )}

      <SectionCard padding={false}>
        <div className="px-5 pt-3">
          <Tabs
            actif={filtre}
            onChange={(valeur) => {
              setFiltre(valeur);
              vue.setPage(0);
            }}
            onglets={[
              { cle: 'TOUTES', libelle: 'Toutes', compteur: compteurs.TOUTES },
              { cle: 'EN_ATTENTE', libelle: 'En attente', compteur: compteurs.EN_ATTENTE },
              { cle: 'ENVOYE', libelle: 'Envoyées', compteur: compteurs.ENVOYE },
              { cle: 'ECHEC', libelle: 'Échecs', compteur: compteurs.ECHEC },
            ]}
          />
        </div>
        <div className="p-5">
          <ListToolbar
            value={vue.query}
            onChange={vue.setQuery}
            placeholder="Rechercher par NIF, objet, canal ou statut…"
            count={vue.filteredCount}
          />
          <DataTable
            colonnes={colonnes}
            donnees={vue.items}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            pagination={vue.pagination}
            onPageChange={vue.setPage}
            rechercheActive={!!vue.query}
            onEffacerRecherche={vue.clear}
            titreVide="Aucune notification"
            descriptionVide="Aucune notification ne correspond à ce filtre."
            cleLigne={(notification) => notification.idNotif}
          />
        </div>
      </SectionCard>

      <Modal
        ouvert={!!selection}
        onClose={() => setSelection(null)}
        titre={selection?.objetEmail || 'Notification'}
        description={selection ? libelle('typeRelance', selection.typeRelance) : ''}
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
          <div className="space-y-5">
            <DetailList
              colonnes={2}
              elements={[
                { libelle: 'Contribuable', valeur: selection.nif },
                { libelle: 'Canal', valeur: libelle('canal', selection.canalEnvoi) },
                {
                  libelle: 'Statut',
                  valeur: <StatutBadge famille="statutEnvoi" code={selection.statutEnvoi} />,
                },
                { libelle: 'Envoi prévu', valeur: formatDateHeure(selection.dateEnvoiPrevue) },
                {
                  libelle: 'Envoi effectif',
                  valeur: selection.dateEnvoiEffective
                    ? formatDateHeure(selection.dateEnvoiEffective)
                    : null,
                },
                {
                  libelle: 'Tentatives',
                  valeur: selection.nbTentatives ? String(selection.nbTentatives) : null,
                },
              ]}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Message</p>
              <div className="mt-1 whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                {selection.messageContenu || selection.messageSms || 'Aucun contenu disponible.'}
              </div>
            </div>
            {selection.erreurEnvoi && (
              <Alert variante="avertissement" titre="Dernière erreur d’envoi">
                {selection.erreurEnvoi}
              </Alert>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
