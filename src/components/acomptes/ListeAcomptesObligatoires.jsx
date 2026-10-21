import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, RefreshCw } from 'lucide-react';
import acomptesService, { messageErreurAcomptes } from '../../services/acomptesService';
import { libellePeriodeAcompte, libelleStatutAcompte } from '../../utils/fiscalConstants';
import {
  formatDate,
  formatMontant,
  formatTaux,
  getStatutAcompteColor,
} from '../../utils/formatUtils';
import { statutAcompte, totalAPayer } from '../../utils/acomptesUtils';

export default function ListeAcomptesObligatoires({
  nif,
  exercice = new Date().getFullYear(),
  titre = 'Mes acomptes obligatoires',
  afficherLienDepot = false,
  description,
}) {
  const [acomptes, setAcomptes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const charger = () => {
    setChargement(true);
    setErreur('');
    return acomptesService.lister(nif, exercice)
      .then((donnees) => setAcomptes(Array.isArray(donnees) ? donnees : []))
      .catch((err) => setErreur(messageErreurAcomptes(err)))
      .finally(() => setChargement(false));
  };

  useEffect(() => {
    if (!nif) return undefined;
    let actif = true;
    Promise.resolve()
      .then(() => {
        if (!actif) return null;
        setChargement(true);
        setErreur('');
        return acomptesService.lister(nif, exercice);
      })
      .then((donnees) => { if (actif && donnees) setAcomptes(Array.isArray(donnees) ? donnees : []); })
      .catch((err) => { if (actif) setErreur(messageErreurAcomptes(err)); })
      .finally(() => { if (actif) setChargement(false); });
    return () => { actif = false; };
  }, [nif, exercice]);

  const total = useMemo(() => totalAPayer(acomptes), [acomptes]);
  const lignesTriees = useMemo(() => [...acomptes].sort((a, b) =>
    String(a.periodeFiscale || '').localeCompare(String(b.periodeFiscale || ''))), [acomptes]);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-labelledby={`acomptes-${nif}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`acomptes-${nif}`} className="font-serif text-xl font-semibold text-primary">{titre}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {description || `Acomptes obligatoires de l’exercice ${exercice}, calculés par le serveur.`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total à payer</p>
            <p className="text-lg font-semibold text-primary">{formatMontant(total)}</p>
          </div>
          <button type="button" onClick={charger} disabled={chargement}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${chargement ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      {chargement && <p className="mt-5 text-sm text-slate-500">Chargement des acomptes…</p>}

      {!chargement && erreur && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {erreur}
        </div>
      )}

      {!chargement && !erreur && lignesTriees.length === 0 && (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
          <p className="font-medium text-slate-700">Aucun acompte pour le moment</p>
          <p className="mt-1">
            Les acomptes sont créés lorsqu’une déclaration IR ou IS validée d’un exercice antérieur existe.
            Déposez et faites valider votre déclaration pour l’exercice précédent.
          </p>
        </div>
      )}

      {!chargement && !erreur && lignesTriees.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="bg-[#F3F5F8] text-sm text-slate-600">
              <tr>
                <th className="px-4 py-3 text-left">Acompte</th>
                <th className="px-4 py-3 text-left">Échéance</th>
                <th className="px-4 py-3 text-left">Base</th>
                <th className="px-4 py-3 text-right">Taux</th>
                <th className="px-4 py-3 text-right">Montant dû</th>
                <th className="px-4 py-3 text-right">Payé</th>
                <th className="px-4 py-3 text-left">Statut</th>
                {afficherLienDepot && <th className="px-4 py-3 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lignesTriees.map((ligne) => {
                const statut = statutAcompte(ligne);
                const base = ligne.detail?.baseLibelle
                  || (ligne.baseAcompte != null
                    ? `Base : ${String(ligne.codeImpot || '').replace('ACOMPTE_', '')} = ${formatMontant(ligne.baseAcompte)}`
                    : (ligne.detail?.type === 'DEBUT_ACTIVITE' ? 'Forfait de démarrage' : '—'));
                return (
                  <tr key={ligne.idObligationFiscale} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{libellePeriodeAcompte(ligne.periodeFiscale)}</span>
                      <span className="block text-xs text-slate-500">{ligne.periodeFiscale}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">{formatDate(ligne.dateLimiteReelle)}</td>
                    <td className="px-4 py-3 text-sm">{base}</td>
                    <td className="px-4 py-3 text-right text-sm">{formatTaux(ligne.tauxAcompte)}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {ligne.disponible === false ? '—' : formatMontant(ligne.montantAcompte)}
                    </td>
                    <td className="px-4 py-3 text-right text-green-700">{formatMontant(ligne.montantPaye)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${getStatutAcompteColor(statut)}`}>
                        {libelleStatutAcompte(statut)}
                      </span>
                    </td>
                    {afficherLienDepot && (
                      <td className="px-4 py-3 text-right">
                        {statut !== 'PAYE' && ligne.idObligationFiscale && (
                          <Link to={`/contribuable/declarations/deposer/${ligne.idObligationFiscale}`}
                            className="text-sm font-medium text-primary hover:underline">
                            Déposer l’acompte
                          </Link>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {lignesTriees.some((ligne) => ligne.disponible === false) && (
            <p className="mt-3 flex items-start gap-2 text-xs text-amber-700">
              <CalendarClock className="mt-0.5 h-4 w-4 shrink-0" />
              Certains acomptes n’ont pas encore de montant : une déclaration validée antérieure est nécessaire.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
