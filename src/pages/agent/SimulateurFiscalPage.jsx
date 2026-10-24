import { useState } from 'react';
import { CircleDollarSign } from 'lucide-react';
import CalculIrForm from '../../components/forms/CalculIrForm';
import CalculIsForm from '../../components/forms/CalculIsForm';
import CalculIrsaForm from '../../components/forms/CalculIrsaForm';
import CalculTvaForm from '../../components/forms/CalculTvaForm';
import CalculImpForm from '../../components/forms/CalculImpForm';
import CalculIpviForm from '../../components/forms/CalculIpviForm';
import CalculIrcmForm from '../../components/forms/CalculIrcmForm';
import ResultatCalculCard from '../../components/common/ResultatCalculCard';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import Tabs from '../../components/ui/Tabs';
import Alert from '../../components/ui/Alert';

const ONGLETS = [
  { code: 'IR', label: 'IR', description: 'Impôt sur les revenus' },
  { code: 'IS', label: 'IS', description: 'Impôt synthétique' },
  { code: 'IRSA', label: 'IRSA', description: 'Revenus salariaux' },
  { code: 'TVA', label: 'TVA', description: 'Taxe sur la valeur ajoutée' },
  { code: 'IMP', label: 'IMP', description: 'Impôt sur les marchés publics' },
  { code: 'IPVI', label: 'IPVI', description: 'Plus-values immobilières' },
  { code: 'IRCM', label: 'IRCM', description: 'Revenus des capitaux mobiliers' },
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

  const ongletActifConfig = ONGLETS.find((onglet) => onglet.code === ongletActif);

  return (
    <div>
      <PageHeader
        titre="Simulateur fiscal"
        description="Calculez un impôt sans écriture en base. Le calcul est effectué par le serveur avec les règles en vigueur."
        fil={[{ libelle: 'Espace agent' }, { libelle: 'Simulateur' }]}
      />

      <div className="mb-5">
        <Tabs
          actif={ongletActif}
          onChange={handleOngletChange}
          onglets={ONGLETS.map((onglet) => ({ cle: onglet.code, libelle: onglet.label }))}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          titre={`Données du calcul ${ongletActif}`}
          description={ongletActifConfig?.description}
        >
          {erreur && (
            <Alert variante="danger" titre="Calcul impossible" className="mb-4">
              {erreur}
            </Alert>
          )}

          {ongletActif === 'IR' && <CalculIrForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IS' && <CalculIsForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IRSA' && <CalculIrsaForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'TVA' && <CalculTvaForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IMP' && <CalculImpForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IPVI' && <CalculIpviForm onResultat={handleResultat} onErreur={handleErreur} />}
          {ongletActif === 'IRCM' && <CalculIrcmForm onResultat={handleResultat} onErreur={handleErreur} />}
        </SectionCard>

        <div>
          {resultat ? (
            <ResultatCalculCard resultat={resultat} />
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <div>
                <CircleDollarSign className="mx-auto mb-4 h-10 w-10 text-slate-300" aria-hidden="true" />
                <p className="text-lg font-medium text-slate-500">
                  Le résultat du calcul apparaîtra ici
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  Aucun résultat n’est enregistré : il s’agit d’une simulation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
