import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, Plus } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import contribuableService from '../../services/contribuableService';
import useApiData from '../../hooks/useApiData';
import { useToast } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import Button from '../../components/ui/Button';
import StatutBadge from '../../components/ui/StatutBadge';
import NouveauContribuableModal from '../../components/common/NouveauContribuableModal';
import { libelle } from '../../utils/libelles';

export default function DossiersPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const [page, setPage] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [creationOuverte, setCreationOuverte] = useState(false);
  const [rafraichir, setRafraichir] = useState(0);

  const { data, chargement, erreur, recharger } = useApiData(
    () =>
      recherche.trim()
        ? contribuableService.rechercherPagine(recherche.trim(), page, 10)
        : contribuableService.listerPagine(page, 10),
    [page, recherche, rafraichir],
  );

  const modifierRecherche = (valeur) => {
    setRecherche(valeur);
    setPage(0);
  };

  const apresCreation = () => {
    setCreationOuverte(false);
    setRafraichir((valeur) => valeur + 1);
    notifier({
      variante: 'succes',
      titre: 'Dossier créé',
      message: 'Le nouveau contribuable a bien été enregistré.',
    });
  };

  const colonnes = [
    {
      cle: 'nif',
      label: 'NIF',
      render: (contribuable) => (
        <span className="font-mono text-sm font-semibold text-slate-800">{contribuable.nif}</span>
      ),
    },
    {
      cle: 'raisonSociale',
      label: 'Raison sociale',
      render: (contribuable) => (
        <div>
          <p className="font-medium text-slate-800">{contribuable.raisonSociale}</p>
          <p className="text-xs text-slate-500">
            {contribuable.communeContribuable || 'Commune non renseignée'}
          </p>
        </div>
      ),
    },
    {
      cle: 'formeJuridique',
      label: 'Forme',
      render: (contribuable) => libelle('formeJuridique', contribuable.formeJuridique),
    },
    {
      cle: 'regimeImposition',
      label: 'Régime',
      render: (contribuable) => libelle('regimeImposition', contribuable.regimeImposition),
    },
    {
      cle: 'statutActivite',
      label: 'Statut',
      render: (contribuable) => (
        <StatutBadge famille="statutActivite" code={contribuable.statutActivite} />
      ),
    },
    {
      cle: 'action',
      label: 'Action',
      align: 'right',
      render: (contribuable) => (
        <Link
          to={`/agent/dossiers/${contribuable.nif}`}
          className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/15"
        >
          Ouvrir le dossier
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Dossiers contribuables"
        description="Recherchez un dossier fiscal, consultez sa situation et générez ses obligations."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Dossiers' }]}
        actions={
          peut(utilisateur?.role, 'contribuable.gerer') ? (
            <Button onClick={() => setCreationOuverte(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Nouveau contribuable
            </Button>
          ) : null
        }
      />

      <SectionCard padding={false}>
        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
            <FileSearch className="h-4 w-4" aria-hidden="true" />
            {data?.totalElements ?? 0} dossier{(data?.totalElements ?? 0) > 1 ? 's' : ''}
          </div>
        </div>
        <div className="px-5 pb-5">
          <ListToolbar
            value={recherche}
            onChange={modifierRecherche}
            placeholder="Rechercher par NIF, raison sociale ou commune…"
            count={data?.totalElements}
          />
          <DataTable
            colonnes={colonnes}
            donnees={data?.content || []}
            chargement={chargement}
            erreur={erreur}
            onReessayer={recharger}
            pagination={
              data
                ? {
                    page: data.number,
                    totalPages: data.totalPages,
                    totalElements: data.totalElements,
                    size: data.size,
                  }
                : null
            }
            onPageChange={setPage}
            rechercheActive={Boolean(recherche)}
            onEffacerRecherche={() => modifierRecherche('')}
            titreVide="Aucun dossier"
            descriptionVide={
              recherche
                ? 'Aucun contribuable ne correspond à cette recherche.'
                : 'Aucun contribuable n’est encore enregistré.'
            }
            cleLigne={(contribuable) => contribuable.nif}
          />
        </div>
      </SectionCard>

      {creationOuverte && (
        <NouveauContribuableModal
          isOpen={creationOuverte}
          onClose={() => setCreationOuverte(false)}
          onSuccess={apresCreation}
        />
      )}
    </div>
  );
}
