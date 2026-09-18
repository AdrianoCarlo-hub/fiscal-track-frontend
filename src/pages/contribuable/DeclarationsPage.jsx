import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import obligationService from '../../services/obligationService';
import declarationService from '../../services/declarationService';

export default function DeclarationsPage() {
  const { utilisateur } = useAuth();
  const [declarations, setDeclarations] = useState([]);
  const [chargement, setChargement] = useState(true);

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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes declarations</h1>

      {chargement ? <p>Chargement...</p> : declarations.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucune declaration deposee
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-right px-4 py-3">Chiffre d'affaires</th>
                <th className="text-right px-4 py-3">Impot calcule</th>
                <th className="text-left px-4 py-3">Soumission</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {declarations.map((d) => (
                <tr key={d.idDeclaration} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">#{d.idDeclaration}</td>
                  <td className="px-4 py-3 text-right">{formatMontant(d.chiffreAffairesDeclare)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMontant(d.impotPrincipalCalcule)}</td>
                  <td className="px-4 py-3 text-sm">{d.dateSoumission?.substring(0, 10)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      d.statutValidation === 'VALIDEE' ? 'bg-green-100 text-green-700' :
                      d.statutValidation === 'REJETEE' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {d.statutValidation}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
