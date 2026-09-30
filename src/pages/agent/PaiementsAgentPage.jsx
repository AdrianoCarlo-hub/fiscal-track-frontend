import { useState } from 'react';
import paiementService from '../../services/paiementService';
import { useApiData } from '../../hooks/useApiData';
import { formatMontant, formatDate } from '../../utils/formatUtils';
import PaiementForm from '../../components/forms/PaiementForm';

export default function PaiementsAgentPage() {
  const [modalOuvert, setModalOuvert] = useState(false);
  const { data: paiements, chargement, erreur, recharger } = useApiData(
    () => paiementService.lister(),
    []
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Paiements enregistres</h1>
          <p className="text-slate-500 text-sm mt-1">
            {paiements ? `${paiements.length} paiement(s)` : ''}
          </p>
        </div>
        <button
          onClick={() => setModalOuvert(true)}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg transition"
        >
          + Nouveau paiement
        </button>
      </div>

      {chargement && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
          Chargement...
        </div>
      )}

      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>}

      {!chargement && !erreur && paiements && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Compte</th>
                <th className="text-right px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Reference</th>
                <th className="text-left px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paiements.map((p) => (
                <tr key={p.idPaiement} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">#{p.idPaiement}</td>
                  <td className="px-4 py-3">#{p.idCompte}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatMontant(p.montantVerse)}</td>
                  <td className="px-4 py-3 text-sm">{p.modePaiement}</td>
                  <td className="px-4 py-3 text-sm font-mono">{p.referenceTransaction || '-'}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(p.datePaiement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOuvert && (
        <PaiementForm
          onClose={() => setModalOuvert(false)}
          onSuccess={() => {
            setModalOuvert(false);
            recharger();
          }}
        />
      )}
    </div>
  );
}
