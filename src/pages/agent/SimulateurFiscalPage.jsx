import { useState } from 'react';
import { Calculator, ChartColumnBig, CircleDollarSign, Landmark, ReceiptText, Gavel, Building2, Coins } from 'lucide-react';
import CalculIrForm from '../../components/forms/CalculIrForm';
import CalculIsForm from '../../components/forms/CalculIsForm';
import CalculIrsaForm from '../../components/forms/CalculIrsaForm';
import CalculTvaForm from '../../components/forms/CalculTvaForm';
import CalculImpForm from '../../components/forms/CalculImpForm';
import CalculIpviForm from '../../components/forms/CalculIpviForm';
import CalculIrcmForm from '../../components/forms/CalculIrcmForm';
import ResultatCalculCard from '../../components/common/ResultatCalculCard';

const ONGLETS = [
  { code: 'IR', label: 'IR', description: 'Impôt sur les revenus', icon: Calculator },
  { code: 'IS', label: 'IS', description: 'Impôt synthétique', icon: ChartColumnBig },
  { code: 'IRSA', label: 'IRSA', description: 'Revenus salariaux', icon: ReceiptText },
  { code: 'TVA', label: 'TVA', description: 'Taxe sur la valeur ajoutée', icon: Landmark },
  { code: 'IMP', label: 'IMP', description: 'Impôt sur les marchés publics', icon: Gavel },
  { code: 'IPVI', label: 'IPVI', description: 'Plus-values immobilières', icon: Building2 },
  { code: 'IRCM', label: 'IRCM', description: 'Revenus des capitaux mobiliers', icon: Coins },
];

export default function SimulateurFiscalPage() {
  const [ongletActif, setOngletActif] = useState('IR');
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState('');

  const handleOngletChange = (code) => {
    setOngletActif(code);
    setResultat(null);
    setErreur('');
  };

  const handleResultat = (r) => {
    setResultat(r);
    setErreur('');
  };

  const handleErreur = (msg) => {
    setErreur(msg);
    setResultat(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Simulateur</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-800">Simulateur fiscal</h1>
        <p className="mt-2 text-sm text-slate-500">
          Calculez un impôt sans persistance. Le calcul n’affecte aucune donnée en base.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2">
        {ONGLETS.map((o) => {
          const Icon = o.icon;
          const actif = ongletActif === o.code;
          return (
            <button
              key={o.code}
              onClick={() => handleOngletChange(o.code)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                actif ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={o.description}
            >
              <Icon className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="fiscal-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Données du calcul {ongletActif}</h2>
            <div className="rounded-full bg-primary/10 p-2 text-primary">
              <CircleDollarSign className="h-4 w-4" />
            </div>
          </div>

          {erreur && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {erreur}
            </div>
          )}

          {ongletActif === 'IR' && <CalculIrForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IS' && <CalculIsForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IRSA' && <CalculIrsaForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'TVA' && <CalculTvaForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IMP' && <CalculImpForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IPVI' && <CalculIpviForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IRCM' && <CalculIrcmForm onResultat={handleResultat} onErreur={handleErreur} />}
        </div>

        <div>
          {resultat ? (
            <ResultatCalculCard resultat={resultat} />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-400">
              <div>
                <Calculator className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                <p className="text-lg font-medium text-slate-500">Le résultat du calcul apparaîtra ici</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
