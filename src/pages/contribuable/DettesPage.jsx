import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import compteCourantService from '../../services/compteCourantService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { libelleStatutRecouvrement } from '../../utils/formatUtils';

export default function DettesPage() {
  const { utilisateur } = useAuth();
  const [dettes, setDettes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(dettes);

  useEffect(() => {
    compteCourantService.parContribuable(utilisateur.identifiant)
      .then((data) => setDettes(data.filter((c) => c.resteARecouvrer > 0)))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  const total = dettes.reduce((acc, d) => acc + Number(d.resteARecouvrer || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes dettes fiscales</h1>

      <div className="mb-6 rounded-xl border-l-4 border-danger bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Total à payer</p>
        <p className="fiscal-money mt-2 text-3xl font-semibold text-danger">{formatMontant(total)}</p>
      </div>

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des dettes…</div> : dettes.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
          Aucune dette en cours. Bravo !
        </div>
      ) : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un compte ou un statut…" count={liste.filteredCount} /></div>
        <div className="space-y-3">
          {liste.items.map((d) => (
            <div key={d.idCompte} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium">Compte #{d.idCompte}</p>
                <p className="text-xs text-slate-500">Statut : {libelleStatutRecouvrement(d.statutRecouvrement)}</p>
              </div>
              <p className="text-xl font-bold text-red-600">{formatMontant(d.resteARecouvrer)}</p>
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
