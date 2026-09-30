import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contribuableService from '../../services/contribuableService';
import obligationService from '../../services/obligationService';
import compteCourantService from '../../services/compteCourantService';
import ObligationForm from '../../components/forms/ObligationForm';
import { formatMontant } from '../../utils/formatUtils';

export default function DossierDetailPage() {
  const { nif } = useParams();
  const navigate = useNavigate();
  const [contribuable, setContribuable] = useState(null);
  const [obligations, setObligations] = useState([]);
  const [comptes, setComptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [modalOuvert, setModalOuvert] = useState(false);

  const charger = () => {
    setChargement(true);
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
  };

  useEffect(() => {
    charger();
  }, [nif]);

  if (chargement) return <p>Chargement...</p>;
  if (!contribuable) return <p>Contribuable introuvable</p>;

  return (
    <div>
      <button onClick={() => navigate('/agent/dossiers')}
        className="text-sky-600 hover:underline mb-4 text-sm">← Retour</button>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{contribuable.raisonSociale}</h1>
            <p className="text-slate-500 font-mono">{contribuable.nif}</p>
          </div>
          <button
            onClick={() => setModalOuvert(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            + Generer une obligation
          </button>
        </div>
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
                <td className="px-4 py-3 text-sm">
                  <span className={`text-xs px-2 py-1 rounded ${
                    o.statutDeclaration === 'DEPOSE' ? 'bg-green-100 text-green-700' :
                    o.statutDeclaration === 'RETARD' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {o.statutDeclaration}
                  </span>
                </td>
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

      {modalOuvert && (
        <ObligationForm
          nif={nif}
          onClose={() => setModalOuvert(false)}
          onSuccess={() => {
            setModalOuvert(false);
            charger();
          }}
        />
      )}
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
