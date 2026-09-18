import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contribuableService from '../../services/contribuableService';
import obligationService from '../../services/obligationService';
import compteCourantService from '../../services/compteCourantService';

export default function DossierDetailPage() {
  const { nif } = useParams();
  const navigate = useNavigate();
  const [contribuable, setContribuable] = useState(null);
  const [obligations, setObligations] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      contribuableService.parNif(nif),
      obligationService.parContribuable(nif),
      compteCourantService.parContribuable(nif),
    ])
      .then(([c, o, cc]) => {
        setContribuable(c);
        setObligations(o);
        setComptes(cc);
      })
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [nif]);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  if (chargement) return <p>Chargement...</p>;
  if (!contribuable) return <p>Contribuable introuvable</p>;

  return (
    <div>
      <button onClick={() => navigate('/agent/dossiers')}
        className="text-sky-600 hover:underline mb-4 text-sm">← Retour</button>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{contribuable.raisonSociale}</h1>
        <p className="text-slate-500 font-mono">{contribuable.nif}</p>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <Info label="Forme juridique" value={contribuable.formeJuridique} />
          <Info label="Regime" value={contribuable.regimeImposition} />
          <Info label="Obligation comptable" value={contribuable.obligationComptable} />
          <Info label="Email" value={contribuable.emailContribuable} />
          <Info label="Telephone" value={contribuable.telephoneContribuable} />
          <Info label="Statut" value={contribuable.statutActivite} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-3">Obligations ({obligations.length})</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="text-left px-4 py-3">Impot</th>
              <th className="text-left px-4 py-3">Periode</th>
              <th className="text-left px-4 py-3">Echeance</th>
              <th className="text-left px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {obligations.map((o) => (
              <tr key={o.idObligationFiscale}>
                <td className="px-4 py-3">{o.codeImpot}</td>
                <td className="px-4 py-3">{o.periodeFiscale}</td>
                <td className="px-4 py-3 text-sm">{o.dateLimiteReelle}</td>
                <td className="px-4 py-3 text-sm">{o.statutDeclaration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-bold text-slate-800 mb-3">Compte courant ({comptes.length})</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="text-right px-4 py-3">Total du</th>
              <th className="text-right px-4 py-3">Paye</th>
              <th className="text-right px-4 py-3">Reste</th>
              <th className="text-left px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comptes.map((c) => (
              <tr key={c.idCompte}>
                <td className="px-4 py-3 text-right">{formatMontant(c.montantTotalDu)}</td>
                <td className="px-4 py-3 text-right text-green-600">{formatMontant(c.montantPaye)}</td>
                <td className="px-4 py-3 text-right font-bold text-red-600">{formatMontant(c.resteARecouvrer)}</td>
                <td className="px-4 py-3 text-sm">{c.statutRecouvrement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-slate-500 text-xs uppercase">{label}</p>
      <p className="font-medium text-slate-800 mt-1">{value || '-'}</p>
    </div>
  );
}
