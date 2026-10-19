import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import obligationService from '../../services/obligationService';
import Pagination from '../../components/common/Pagination';
import { ListToolbar } from '../../components/common/DataTable';
import { useListView } from '../../hooks/useApiData';
import { libelleImpot, libelleStatutDeclaration } from '../../utils/fiscalConstants';

export default function ObligationsPage() {
  const { utilisateur } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [filtre, setFiltre] = useState('TOUS');
  const [chargement, setChargement] = useState(true);
  const liste = useListView(obligations.filter((o) => filtre === 'TOUS' || o.statutDeclaration === filtre));

  useEffect(() => {
    obligationService.parContribuable(utilisateur.identifiant)
      .then(setObligations)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  return (
    <div>
      <h1 className="fiscal-page-title mb-6 text-3xl font-semibold">Mes obligations fiscales</h1>

      <div className="mb-5 flex flex-wrap gap-2">
        {[
          ['TOUS', 'Toutes'],
          ['ATTENTE', 'À déposer'],
          ['DEPOSE', 'Déposées'],
          ['RETARD', 'En retard'],
        ].map(([code, libelle]) => (
          <button key={code} onClick={() => setFiltre(code)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filtre === code ? 'bg-primary text-white' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {libelle}
          </button>
        ))}
      </div>

      {!chargement && <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher un impôt, une période ou un statut…" count={liste.filteredCount} /></div>}
      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des obligations…</div> : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto"><table className="w-full min-w-[650px]">
            <thead className="bg-[#F3F5F8] text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Impot</th>
                <th className="text-left px-4 py-3">Periode</th>
                <th className="text-left px-4 py-3">Echeance</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {liste.items.map((o) => (
                <tr key={o.idObligationFiscale} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{libelleImpot(o.codeImpot)}</td>
                  <td className="px-4 py-3">{o.periodeFiscale}</td>
                  <td className="px-4 py-3 text-sm">{o.dateLimiteReelle}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md ${
                      o.statutDeclaration === 'DEPOSE' ? 'bg-[#2F7A4F] text-white' :
                      o.statutDeclaration === 'RETARD' ? 'bg-[#B23A33] text-white ring-1 ring-[#B23A33] ring-offset-1' :
                      'bg-amber-50 text-[#8A6200] border border-[#B8860B]/40'
                    }`}>
                      {libelleStatutDeclaration(o.statutDeclaration)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.statutDeclaration !== 'DEPOSE' && (
                      <Link to={`/contribuable/declarations/deposer/${o.idObligationFiscale}`}
                        className="text-primary hover:underline text-sm">
                        Declarer
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {liste.items.length === 0 && <tr><td colSpan="5" className="px-4 py-10 text-center text-sm text-slate-500">Aucun résultat.{liste.query && <button className="ml-1 font-semibold text-primary underline" onClick={liste.clear}> Effacer la recherche</button>}</td></tr>}
            </tbody>
          </table></div>
        </div>
      )}
      {!chargement && <Pagination {...(liste.pagination || {})} pagination={undefined} page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />}
    </div>
  );
}
