import { useState } from 'react';
import { Link } from 'react-router-dom';
import contribuableService from '../../services/contribuableService';
import DataTable from '../../components/common/DataTable';
import { useApiData } from '../../hooks/useApiData';

export default function DossiersPage() {
  const [page, setPage] = useState(0);
  const [recherche, setRecherche] = useState('');

  const { data, chargement, erreur, recharger } = useApiData(
    () => contribuableService.listerPagine(page, 5),
    [page]
  );

  const colonnes = [
    { cle: 'nif', label: 'NIF', render: (c) => <span className="font-mono text-sm">{c.nif}</span> },
    { cle: 'raisonSociale', label: 'Raison sociale' },
    { cle: 'formeJuridique', label: 'Forme' },
    { cle: 'regimeImposition', label: 'Regime' },
    {
      cle: 'statutActivite',
      label: 'Statut',
      render: (c) => (
        <span className={`text-xs px-2 py-1 rounded ${
          c.statutActivite === 'ACTIF' ? 'bg-green-100 text-green-700' :
          c.statutActivite === 'VEILLEUSE' ? 'bg-yellow-100 text-yellow-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {c.statutActivite}
        </span>
      ),
    },
    {
      cle: 'action',
      label: 'Action',
      align: 'right',
      render: (c) => (
        <Link to={`/agent/dossiers/${c.nif}`} className="text-sky-600 hover:underline text-sm">
          Voir
        </Link>
      ),
    },
  ];

  const donneesAffichees = recherche
    ? (data?.content || []).filter((c) =>
        c.nif.toLowerCase().includes(recherche.toLowerCase()) ||
        c.raisonSociale.toLowerCase().includes(recherche.toLowerCase()))
    : data?.content;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dossiers contribuables</h1>

      <input
        type="text"
        placeholder="Rechercher par NIF ou raison sociale..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-sky-500 outline-none"
      />

      <DataTable
        colonnes={colonnes}
        donnees={donneesAffichees}
        chargement={chargement}
        erreur={erreur}
        pagination={data ? {
          page: data.number,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          size: data.size,
        } : null}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
}
