import { useEffect, useState } from 'react';
import declarationService from '../../services/declarationService';

export default function DeclarationsAgentPage() {
  const [declarations, setDeclarations] = useState([]);
  const [filtre, setFiltre] = useState('EN_ATTENTE_VALIDATION');
  const [chargement, setChargement] = useState(true);

  const charger = async () => {
    setChargement(true);
    try {
      const data = await declarationService.lister();
      setDeclarations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => { charger(); }, []);

  const valider = async (id) => {
    try {
      await declarationService.valider(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const rejeter = async (id) => {
    if (!window.confirm('Rejeter cette declaration ?')) return;
    try {
      await declarationService.rejeter(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const filtrees = declarations.filter((d) => d.statutValidation === filtre);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Instruction des declarations</h1>

      <div className="flex gap-2 mb-6">
        {['EN_ATTENTE_VALIDATION', 'VALIDEE', 'REJETEE'].map((f) => (
          <button key={f} onClick={() => setFiltre(f)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filtre === f ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {chargement ? <p>Chargement...</p> : filtrees.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucune declaration dans cette categorie
        </div>
      ) : (
        <div className="space-y-3">
          {filtrees.map((d) => (
            <div key={d.idDeclaration} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold">Declaration #{d.idDeclaration}</p>
                  <p className="text-xs text-slate-500">
                    Obligation #{d.idObligationFiscale} | {d.dateSoumission?.substring(0, 10)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  d.statutValidation === 'VALIDEE' ? 'bg-green-100 text-green-700' :
                  d.statutValidation === 'REJETEE' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>{d.statutValidation}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Chiffre d'affaires</p>
                  <p className="font-medium">{Number(d.chiffreAffairesDeclare).toLocaleString('fr-MG')} Ar</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Impot calcule</p>
                  <p className="font-medium">{Number(d.impotPrincipalCalcule).toLocaleString('fr-MG')} Ar</p>
                </div>
              </div>
              {d.statutValidation === 'EN_ATTENTE_VALIDATION' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => valider(d.idDeclaration)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm">
                    Valider
                  </button>
                  <button onClick={() => rejeter(d.idDeclaration)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm">
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
