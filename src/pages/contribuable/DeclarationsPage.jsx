import { useEffect, useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import obligationService from '../../services/obligationService';
import declarationService from '../../services/declarationService';
import StatusBadge from '../../components/ui/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { ListToolbar } from '../../components/common/DataTable';
import { useListView } from '../../hooks/useApiData';

export default function DeclarationsPage() {
  const { utilisateur } = useAuth();
  const [declarations, setDeclarations] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(declarations);

  useEffect(() => {
    const charger = async () => {
      try {
        const obligations = await obligationService.parContribuable(utilisateur.identifiant);
        const decls = await Promise.all(
          obligations
            .filter((o) => o.statutDeclaration === 'DEPOSE')
            .map((o) => declarationService.parObligation(o.idObligationFiscale).catch(() => null))
        );
        setDeclarations(decls.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setChargement(false);
      }
    };
    charger();
  }, [utilisateur.identifiant]);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Déclarations</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-800">Mes déclarations</h1>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-2 text-sm font-medium text-success">
          <ShieldCheck className="h-4 w-4" />
          Déclarations soumises
        </div>
      </div>

      {chargement ? (
        <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des déclarations...</div>
      ) : declarations.length === 0 ? (
        <div className="fiscal-card flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileText className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">Aucune déclaration déposée</h2>
          <p className="mt-2 text-sm text-slate-500">Aucun élément n’est disponible pour le moment.</p>
        </div>
      ) : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par référence, statut ou date…" count={liste.filteredCount} /></div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">Référence</th>
                  <th className="px-4 py-3 text-right">Chiffre d’affaires</th>
                  <th className="px-4 py-3 text-right">Impôt calculé</th>
                  <th className="px-4 py-3">Soumission</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {liste.items.map((d) => (
                  <tr key={d.idDeclaration} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">#{d.idDeclaration}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{formatMontant(d.chiffreAffairesDeclare)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatMontant(d.impotPrincipalCalcule)}</td>
                    <td className="px-4 py-3 text-slate-600">{d.dateSoumission?.substring(0, 10)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          d.statutValidation === 'VALIDEE'
                            ? 'success'
                            : d.statutValidation === 'REJETEE'
                              ? 'danger'
                              : 'warning'
                        }
                      >
                        {d.statutValidation}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {liste.items.length === 0 && <p className="mt-3 text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
