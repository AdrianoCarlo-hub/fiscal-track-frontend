import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import compteCourantService from '../../services/compteCourantService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function PaiementsPage() {
  const { utilisateur } = useAuth();
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(comptes);

  useEffect(() => {
    compteCourantService.parContribuable(utilisateur.identifiant)
      .then(setComptes)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes paiements</h1>

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des paiements…</div> : comptes.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucun compte courant fiscal
        </div>
      ) : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un compte ou un statut…" count={liste.filteredCount} /></div>
        <div className="grid gap-4">
          {liste.items.map((c) => (
            <div key={c.idCompte} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-bold text-slate-800">Compte #{c.idCompte}</p>
                  <p className="text-xs text-slate-500">Cree le {c.dateCreationLigne?.substring(0, 10)}</p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  c.statutRecouvrement === 'SOLDE' ? 'bg-green-100 text-green-700' :
                  c.statutRecouvrement === 'PARTIEL' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {c.statutRecouvrement}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                <Info label="Principal" value={formatMontant(c.montantPrincipal)} />
                <Info label="Penalites" value={formatMontant(c.montantPenalites)} />
                <Info label="Paye" value={formatMontant(c.montantPaye)} />
                <Info label="Reste" value={formatMontant(c.resteARecouvrer)} highlight />
              </div>
            </div>
          ))}
        </div>
        {liste.items.length === 0 && <p className="text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className={`font-medium mt-1 ${highlight ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
    </div>
  );
}
