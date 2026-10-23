import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import paiementService from '../../services/paiementService';
import useApiData, { useListView } from '../../hooks/useApiData';
import { useToast } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import PaiementForm from '../../components/forms/PaiementForm';
import { formatDateHeure, formatMontant } from '../../utils/formatUtils';
import { libelle } from '../../utils/libelles';

export default function PaiementsAgentPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const [modalOuvert, setModalOuvert] = useState(false);
  const peutEnregistrer = peut(utilisateur?.role, 'paiement.enregistrer');

  const { data, chargement, erreur, recharger } = useApiData(
    () => paiementService.lister(),
    [],
    { valeurInitiale: [] },
  );

  const paiements = Array.isArray(data) ? data : [];
  const vue = useListView(paiements, 10);
  const total = paiements.reduce((somme, paiement) => somme + Number(paiement.montantVerse || 0), 0);

  const colonnes = [
    {
      cle: 'datePaiement',
      label: 'Date',
      render: (paiement) => formatDateHeure(paiement.datePaiement),
    },
    {
      cle: 'compte',
      label: 'Compte',
      render: (paiement) => (
        <div>
          <p className="font-medium text-slate-800">Compte n°{paiement.idCompte}</p>
          <p className="text-xs text-slate-500">Paiement n°{paiement.idPaiement}</p>
        </div>
      ),
    },
    {
      cle: 'modePaiement',
      label: 'Mode',
      render: (paiement) => libelle('modePaiement', paiement.modePaiement),
    },
    {
      cle: 'referenceTransaction',
      label: 'Référence',
      render: (paiement) =>
        paiement.referenceTransaction ? (
          <span className="font-mono text-xs text-slate-600">{paiement.referenceTransaction}</span>
        ) : (
          <span className="text-slate-400">—</span>
        ),
    },
    {
      cle: 'montantVerse',
      label: 'Montant versé',
      align: 'right',
      render: (paiement) => (
        <span className="fiscal-money font-semibold text-slate-800">
          {formatMontant(paiement.montantVerse)}
        </span>
      ),
    },
  ];

  const apresEnregistrement = () => {
    setModalOuvert(false);
    notifier({
      variante: 'succes',
      titre: 'Paiement enregistré',
      message: 'Le compte courant fiscal a été mis à jour.',
    });
    recharger();
  };

  return (
    <div>
      <PageHeader
        titre="Paiements enregistrés"
        description="Versements reçus et imputés aux comptes courants fiscaux."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Paiements' }]}
        actions={
          peutEnregistrer ? (
            <Button onClick={() => setModalOuvert(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouveau paiement
            </Button>
          ) : null
        }
      />

      {!peutEnregistrer && (
        <Alert variante="info" titre="Enregistrement réservé" className="mb-5">
          Votre rôle permet de consulter les paiements, mais l’enregistrement d’un versement est
          réservé aux agents de recette et aux administrateurs.
        </Alert>
      )}

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <SectionCard>
          <p className="text-sm text-slate-500">Paiements enregistrés</p>
          <p className="mt-1 text-3xl font-semibold text-slate-800">{paiements.length}</p>
        </SectionCard>
        <SectionCard>
          <p className="text-sm text-slate-500">Montant total versé</p>
          <p className="fiscal-money mt-1 text-2xl font-semibold text-success">
            {formatMontant(total)}
          </p>
        </SectionCard>
      </div>

      <SectionCard padding={false}>
        <div className="p-5">
          <ListToolbar
            value={vue.query}
            onChange={vue.setQuery}
            placeholder="Rechercher par compte, mode, référence ou montant…"
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
            titreVide="Aucun paiement"
            descriptionVide="Aucun versement n’a encore été enregistré."
            cleLigne={(paiement) => paiement.idPaiement}
          />
        </div>
      </SectionCard>

      {modalOuvert && (
        <PaiementForm onClose={() => setModalOuvert(false)} onSuccess={apresEnregistrement} />
      )}
    </div>
  );
}
