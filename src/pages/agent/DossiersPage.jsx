import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import contribuableService from '../../services/contribuableService';

export default function DossiersPage() {
  const [contribuables, setContribuables] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    contribuableService.lister()
      .then(setContribuables)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, []);

  const filtres = contribuables.filter((c) =>
    c.nif.toLowerCase().includes(recherche.toLowerCase()) ||
    c.raisonSociale.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dossiers contribuables</h1>

      <input
        type="text"
        placeholder="Rechercher par NIF ou raison sociale..."
        value={recherche}
        onChange={(e) => setRecherche(e.target.value)}
        className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg mb-6 focus:ring-2 focus:ring-sky-500 outline-none"
      />

      {chargement ? <p>Chargement...</p> : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">NIF</th>
                <th className="text-left px-4 py-3">Raison sociale</th>
                <th className="text-left px-4 py-3">Forme</th>
                <th className="text-left px-4 py-3">Regime</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-right px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtres.map((c) => (
                <tr key={c.nif} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{c.nif}</td>
                  <td className="px-4 py-3">{c.raisonSociale}</td>
                  <td className="px-4 py-3 text-sm">{c.formeJuridique}</td>
                  <td className="px-4 py-3 text-sm">{c.regimeImposition}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.statutActivite === 'ACTIF' ? 'bg-green-100 text-green-700' :
                      c.statutActivite === 'VEILLEUSE' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {c.statutActivite}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/agent/dossiers/${c.nif}`} className="text-sky-600 hover:underline text-sm">
                      Voir
                    </Link>
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
