import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch, Plus } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { peut } from '../../auth/permissions';
import contribuableService from '../../services/contribuableService';
import { useListePaginee } from '../../hooks/useApiData';
import { useToast } from '../../context/notificationContext';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import Button from '../../components/ui/Button';
import StatutBadge from '../../components/ui/StatutBadge';
import ContribuableForm from '../../components/forms/ContribuableForm';
import { libelle } from '../../utils/libelles';

export default function DossiersPage() {
  const { utilisateur } = useAuth();
  const { notifier } = useToast();
  const [creationOuverte, setCreationOuverte] = useState(false);

  const liste = useListePaginee(
    (page, taille) => contribuableService.listerPagine(page, taille),
    () => contribuableService.lister(),
    {
      cleUrl: 'dossiers',
      champs: ['nif', 'raisonSociale', 'communeContribuable', 'formeJuridique'],
    },
  );

  const apresCreation = () => {
    setCreationOuverte(false);
    liste.recharger();
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
            {liste.total} dossier{liste.total > 1 ? 's' : ''}
          </div>
        </div>
        <div className="px-5 pb-5">
          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher par NIF, raison sociale ou commune…"
            count={liste.filteredCount}
            onReinitialiser={liste.reinitialiser}
          />
          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            chargement={liste.chargement}
            erreur={liste.erreur}
            onReessayer={liste.recharger}
            pagination={{
              ...liste.pagination,
              onTailleChange: liste.setTaille,
            }}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query)}
            onEffacerRecherche={liste.clear}
            titreVide="Aucun dossier ne correspond à cette recherche"
            descriptionVide={
              liste.query
                ? 'Vérifiez le NIF, la raison sociale ou la commune, puis relancez la recherche.'
                : 'Aucun contribuable n’est encore enregistré dans ce centre fiscal.'
            }
            cleLigne={(contribuable) => contribuable.nif}
          />
        </div>
      </SectionCard>

      {creationOuverte && (
        <ContribuableForm
          creation
          onClose={() => setCreationOuverte(false)}
          onSuccess={apresCreation}
        />
      )}
    </div>
  );
}
