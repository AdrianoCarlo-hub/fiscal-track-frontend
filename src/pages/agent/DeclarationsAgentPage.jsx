import { useEffect, useState } from 'react';
import declarationService from '../../services/declarationService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';
import { formatMontant } from '../../utils/formatUtils';

const FILTRES = [
  { code: 'EN_ATTENTE_VALIDATION', libelle: 'En attente' },
  { code: 'VALIDEE', libelle: 'Validées' },
  { code: 'REJETEE', libelle: 'Rejetées' },
];

export default function DeclarationsAgentPage() {
  const [declarations, setDeclarations] = useState([]);
  const [filtre, setFiltre] = useState('EN_ATTENTE_VALIDATION');
  const [chargement, setChargement] = useState(true);
  const liste = useListView(declarations.filter((d) => d.statutValidation === filtre));

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

  useEffect(() => {
    Promise.resolve().then(charger);
  }, []);

  const valider = async (id) => {
    try {
      await declarationService.valider(id);
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const rejeter = async (id) => {
    const motif = window.prompt('Motif du rejet (obligatoire) — il sera affiché au contribuable :');
    if (motif === null) return;
    if (!motif.trim()) {
      alert('Le motif du rejet est obligatoire.');
      return;
    }
    try {
      await declarationService.rejeter(id, motif.trim());
      charger();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Instruction des declarations</h1>

      <div className="flex gap-2 mb-6">
        {FILTRES.map((f) => (
          <button key={f.code} onClick={() => setFiltre(f.code)}
            className={`px-4 py-2 rounded-lg text-sm ${
              filtre === f.code ? 'bg-sky-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'
            }`}>
            {f.libelle}
          </button>
        ))}
      </div>

      {!chargement && <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher par déclaration, obligation ou date…" count={liste.filteredCount} /></div>}
      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des déclarations…</div> : liste.filteredCount === 0 ? (
        <div className="fiscal-card p-8 text-center text-sm text-slate-500">
          {liste.query ? <>Aucun résultat pour cette recherche. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></> : 'Aucune déclaration dans cette catégorie.'}
        </div>
      ) : (
        <div className="space-y-3">
          {liste.items.map((d) => (
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
                }`}>
                  {d.statutValidation === 'VALIDEE' ? 'Validée'
                    : d.statutValidation === 'REJETEE' ? 'Rejetée' : 'En attente'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Chiffre d’affaires</p>
                  <p className="font-medium">{formatMontant(d.chiffreAffairesDeclare)}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Impôt calculé</p>
                  <p className="font-medium">{formatMontant(d.impotPrincipalCalcule)}</p>
                </div>
              </div>
              {d.motifRejet && (
                <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  Motif du rejet : {d.motifRejet}
                </p>
              )}
              {d.detailCalcul && (
                <details className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                  <summary className="cursor-pointer font-medium">Détail du calcul</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{d.detailCalcul}</pre>
                </details>
              )}
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
      {!chargement && liste.filteredCount > 0 && <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />}
    </div>
  );
}
