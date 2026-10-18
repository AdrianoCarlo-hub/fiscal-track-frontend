import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import contribuableService from '../../services/contribuableService';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import { useApiData } from '../../hooks/useApiData';
import StatusBadge from '../../components/ui/StatusBadge';
import Toast from '../../components/ui/Toast';
import NouveauContribuableModal from '../../components/common/NouveauContribuableModal';

export default function DossiersPage() {
  const [page, setPage] = useState(0);
  const [recherche, setRecherche] = useState('');
  const [modalCreationOuvert, setModalCreationOuvert] = useState(false);
  const [rafraichir, setRafraichir] = useState(0);
  const [toast, setToast] = useState(null);

  const { data, chargement, erreur } = useApiData(
    () => recherche.trim() ? contribuableService.rechercherPagine(recherche.trim(), page, 5) : contribuableService.listerPagine(page, 5),
    [page, recherche, rafraichir]
  );

  const colonnes = [
    { cle: 'nif', label: 'NIF', render: (c) => <span className="font-mono text-sm font-semibold">{c.nif}</span> },
    { cle: 'raisonSociale', label: 'Raison sociale' },
    { cle: 'formeJuridique', label: 'Forme' },
    { cle: 'regimeImposition', label: 'Regime' },
    {
      cle: 'statutActivite',
      label: 'Statut',
      render: (c) => {
        const variant = c.statutActivite === 'ACTIF' ? 'success' : c.statutActivite === 'VEILLEUSE' ? 'warning' : 'default';
        return <StatusBadge variant={variant}>{c.statutActivite}</StatusBadge>;
      },
    },
    {
      cle: 'action',
      label: 'Action',
      align: 'right',
      render: (c) => (
        <Link to={`/agent/dossiers/${c.nif}`} className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-primary/15">
          Voir
        </Link>
      ),
    },
  ];

  const modifierRecherche = (value) => { setRecherche(value); setPage(0); };

  const handleCreation = () => {
    setModalCreationOuvert(false);
    setRafraichir((n) => n + 1);
    setToast({ title: 'Contribuable cree', message: 'Le nouveau dossier a bien ete enregistre.' });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed right-4 top-4 z-[60]">
          <Toast title={toast.title} message={toast.message} variant="success" onClose={() => setToast(null)} />
        </div>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Dossiers contribuables</h1>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setModalCreationOuvert(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm transition"
          >
            + Nouveau contribuable
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-medium text-primary">
            <FileSearch className="h-4 w-4" />
            {data?.totalElements ?? 0} dossiers
          </div>
        </div>
      </div>

      <div className="fiscal-card p-4"><ListToolbar value={recherche} onChange={modifierRecherche} placeholder="Rechercher par NIF ou raison sociale..." count={data?.totalElements ?? 0} /></div>

      <DataTable
        colonnes={colonnes}
        donnees={data?.content || []}
        chargement={chargement}
        erreur={erreur}
        pagination={data ? {
          page: data.number,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          size: data.size,
        } : null}
        onPageChange={(p) => setPage(p)}
        rechercheActive={Boolean(recherche)}
        onEffacerRecherche={() => modifierRecherche('')}
      />

      <NouveauContribuableModal
        isOpen={modalCreationOuvert}
        onClose={() => setModalCreationOuvert(false)}
        onSuccess={handleCreation}
      />
    </div>
  );
}
