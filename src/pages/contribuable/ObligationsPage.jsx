import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import obligationService from '../../services/obligationService';

export default function ObligationsPage() {
  const { utilisateur } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [filtre, setFiltre] = useState('TOUS');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    obligationService.parContribuable(utilisateur.identifiant)
      .then(setObligations)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  const filtrees = filtre === 'TOUS'
    ? obligations
    : obligations.filter((o) => o.statutDeclaration === filtre);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes obligations fiscales</h1>

      <div className="flex gap-2 mb-6">
        {['TOUS', 'ATTENTE', 'DEPOSE', 'RETARD'].map((f) => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-2 rounded-lg text-sm transition ${
              filtre === f ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">Impot</th>
                <th className="text-left px-4 py-3">Periode</th>
                <th className="text-left px-4 py-3">Echeance</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtrees.map((o) => (
                <tr key={o.idObligationFiscale} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{o.codeImpot}</td>
                  <td className="px-4 py-3">{o.periodeFiscale}</td>
                  <td className="px-4 py-3 text-sm">{o.dateLimiteReelle}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      o.statutDeclaration === 'DEPOSE' ? 'bg-green-100 text-green-700' :
                      o.statutDeclaration === 'RETARD' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {o.statutDeclaration}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {o.statutDeclaration !== 'DEPOSE' && (
                      <Link to={`/contribuable/declarations/deposer/${o.idObligationFiscale}`}
                        className="text-sky-600 hover:underline text-sm">
                        Declarer
                      </Link>
                    )}
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
