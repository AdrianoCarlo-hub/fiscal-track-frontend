import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

const ROLES_INFO = [
  { code: 'AGENT_GESTION', desc: 'Gere les dossiers contribuables, valide les declarations' },
  { code: 'AGENT_RECETTE', desc: 'Enregistre les paiements, suit le recouvrement' },
  { code: 'RESPONSABLE', desc: 'Consulte les indicateurs et rapports' },
  { code: 'ADMIN', desc: 'Administre les utilisateurs et les parametres' },
];

export default function RolesPage() {
  const liste = useListView(ROLES_INFO, 10);
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Roles et permissions</h1>
      <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un rôle ou une permission…" count={liste.filteredCount} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        {liste.items.map((r) => (
          <div key={r.code} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-sky-500">
            <h2 className="font-bold text-slate-800 mb-2">{r.code}</h2>
            <p className="text-sm text-slate-600">{r.desc}</p>
          </div>
        ))}
      </div>
      {liste.items.length === 0 && <p className="mt-4 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
      <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
    </div>
  );
}
