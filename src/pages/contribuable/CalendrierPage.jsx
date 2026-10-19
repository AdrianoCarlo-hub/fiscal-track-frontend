import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import calendrierService from '../../services/calendrierService';
import { libelleImpot } from '../../utils/fiscalConstants';

const statutDetails = (obligation) => {
  if (obligation.statutDeclaration === 'DEPOSE') return { label: 'Déclaration déposée', color: 'border-success bg-success text-white', dot: 'bg-success' };
  const due = new Date(`${String(obligation.dateLimiteReelle).slice(0, 10)}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const remaining = Math.ceil((due - today) / 86400000);
  if (remaining < 0 || obligation.statutDeclaration === 'RETARD') return { label: 'En retard', color: 'border-danger bg-danger text-white', dot: 'bg-danger' };
  if (remaining <= 7) return { label: 'Échéance proche', color: 'border-warning bg-amber-50 text-[#805E08]', dot: 'bg-warning' };
  return { label: 'À venir', color: 'border-primary bg-blue-50 text-primary', dot: 'bg-primary' };
};

const formatDate = (value, options = { day: 'numeric', month: 'long', year: 'numeric' }) =>
  value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', options) : 'Date non renseignée';

export default function CalendrierPage() {
  const { utilisateur } = useAuth();
  const [obligations, setObligations] = useState([]);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [chargement, setChargement] = useState(true);
  const [typeImpot, setTypeImpot] = useState('TOUS');
  const [moisFiltre, setMoisFiltre] = useState('TOUS');
  const [statutFiltre, setStatutFiltre] = useState('TOUS');
  const [selection, setSelection] = useState(null);

  useEffect(() => {
    Promise.resolve()
      .then(() => {
        setChargement(true);
        return calendrierService.parContribuableEtAnnee(utilisateur.identifiant, annee);
      })
      .then(setObligations)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant, annee]);

  const filtrerEtGrouperParMois = () => {
    const groupes = {};
    obligations.filter((o) => {
      const month = String(o.dateLimiteReelle).slice(5, 7);
      return (typeImpot === 'TOUS' || o.codeImpot === typeImpot)
        && (moisFiltre === 'TOUS' || month === moisFiltre)
        && (statutFiltre === 'TOUS' || statutDetails(o).label === statutFiltre);
    }).forEach((o) => {
      const mois = o.dateLimiteReelle.substring(0, 7);
      if (!groupes[mois]) groupes[mois] = [];
      groupes[mois].push(o);
    });
    return groupes;
  };

  const groupes = filtrerEtGrouperParMois();
  const prochaines = obligations.filter((o) => o.statutDeclaration !== 'DEPOSE' && new Date(`${String(o.dateLimiteReelle).slice(0, 10)}T00:00:00`) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => a.dateLimiteReelle.localeCompare(b.dateLimiteReelle)).slice(0, 5);
  const types = [...new Set(obligations.map((o) => o.codeImpot).filter(Boolean))].sort();
  const moisOptions = Array.from({ length: 12 }, (_, index) => ({ value: String(index + 1).padStart(2, '0'), label: new Date(2000, index, 1).toLocaleDateString('fr-FR', { month: 'long' }) }));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-sm text-slate-500">Dates limites, impôts et obligations à suivre</p><h1 className="fiscal-page-title mt-1 text-3xl font-semibold">Calendrier fiscal</h1></div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white p-1">
          <button aria-label="Année précédente" onClick={() => setAnnee((year) => year - 1)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100"><ChevronLeft className="h-4 w-4" /></button>
          <span className="min-w-14 text-center font-semibold text-primary">{annee}</span>
          <button aria-label="Année suivante" onClick={() => setAnnee((year) => year + 1)} className="rounded-md p-2 text-slate-600 hover:bg-slate-100"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </header>

      <div className="mb-5 flex flex-wrap gap-2" aria-label="Légende des statuts">
        {[
          ['bg-success', 'Déclaration déposée'], ['bg-primary', 'À venir'], ['bg-warning', 'Échéance proche'], ['bg-danger', 'En retard'],
        ].map(([color, label]) => <span key={label} className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"><i className={`h-2 w-2 rounded-full ${color}`} />{label}</span>)}
      </div>

      <section className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-3" aria-label="Filtres du calendrier">
        <label className="text-xs font-medium text-slate-600">Type d’impôt<select value={typeImpot} onChange={(event) => setTypeImpot(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="TOUS">Tous les impôts</option>{types.map((type) => <option key={type} value={type}>{libelleImpot(type)}</option>)}
        </select></label>
        <label className="text-xs font-medium text-slate-600">Mois<select value={moisFiltre} onChange={(event) => setMoisFiltre(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="TOUS">Toute l’année</option>{moisOptions.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
        </select></label>
        <label className="text-xs font-medium text-slate-600">Statut<select value={statutFiltre} onChange={(event) => setStatutFiltre(event.target.value)} className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option value="TOUS">Tous les statuts</option><option>À venir</option><option>Échéance proche</option><option>En retard</option><option>Déclaration déposée</option>
        </select></label>
      </section>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between"><div><h2 className="font-serif text-xl font-semibold text-primary">Prochaines échéances</h2><p className="text-sm text-slate-500">Les obligations non déposées les plus proches</p></div><CalendarDays className="h-5 w-5 text-primary" /></div>
        {prochaines.length === 0 ? <p className="py-3 text-sm text-slate-500">Aucune échéance à venir pour cette année.</p> : <ul className="divide-y divide-slate-100">{prochaines.map((item) => {
          const status = statutDetails(item);
          return <li key={item.idObligationFiscale}><button onClick={() => setSelection(item)} className="flex w-full flex-wrap items-center justify-between gap-2 py-3 text-left hover:bg-slate-50">
            <span className="flex items-center gap-3"><i className={`h-2.5 w-2.5 rounded-full ${status.dot}`} /><span><strong className="block text-sm text-primary">{libelleImpot(item.codeImpot)} · {item.periodeFiscale}</strong><span className="text-xs text-slate-500">{formatDate(item.dateLimiteReelle)}</span></span></span><span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>
          </button></li>;
        })}</ul>}
      </section>

      <div className="mb-3 flex items-end justify-between"><div><h2 className="font-serif text-xl font-semibold text-primary">Échéances par mois</h2><p className="text-sm text-slate-500">Sélectionnez une ligne pour consulter son détail.</p></div><span className="text-sm text-slate-500">{Object.values(groupes).flat().length} obligation(s)</span></div>

      {chargement ? <p>Chargement...</p> : Object.keys(groupes).length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucune echeance pour {annee}
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupes).sort().map(([mois, items]) => (
            <div key={mois} className="fiscal-card p-5">
              <h3 className="mb-3 font-serif text-lg font-semibold capitalize text-primary">
                {new Date(mois + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {items.map((o) => (
                  <button key={o.idObligationFiscale} onClick={() => setSelection(o)} className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3 text-left last:border-0 hover:bg-slate-50">
                    <span><strong className="block text-sm font-semibold text-primary">{libelleImpot(o.codeImpot)} · {o.periodeFiscale}</strong><span className="text-xs text-slate-500">Échéance : {formatDate(o.dateLimiteReelle)}</span></span>
                    <StatutBadge statut={o} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      {selection && <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#101936]/50 p-0 sm:items-center sm:p-4" onClick={() => setSelection(null)}>
        <section role="dialog" aria-modal="true" aria-labelledby="echeance-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
          <div className="mb-5 flex items-start justify-between"><div><p className="text-sm text-slate-500">Détail de l’obligation</p><h2 id="echeance-title" className="mt-1 font-serif text-2xl font-semibold text-primary">{libelleImpot(selection.codeImpot)}</h2></div><button onClick={() => setSelection(null)} aria-label="Fermer" className="rounded-md px-3 py-1 text-slate-500 hover:bg-slate-100">✕</button></div>
          <dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-slate-500">Période</dt><dd className="mt-1 font-medium text-primary">{selection.periodeFiscale || '—'}</dd></div><div><dt className="text-slate-500">Échéance</dt><dd className="mt-1 font-medium text-primary">{formatDate(selection.dateLimiteReelle)}</dd></div><div><dt className="text-slate-500">Statut</dt><dd className="mt-1"><StatutBadge statut={selection} /></dd></div><div><dt className="text-slate-500">Déclaration</dt><dd className="mt-1 font-medium text-primary">{selection.statutDeclaration === 'DEPOSE' ? 'Déposée' : 'Non déposée'}</dd></div></dl>
          {selection.statutDeclaration !== 'DEPOSE' && <Link to={`/contribuable/declarations/deposer/${selection.idObligationFiscale}`} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary/90">Déclarer cette obligation <ArrowRight className="h-4 w-4" /></Link>}
        </section>
      </div>}
    </div>
  );
}

function StatutBadge({ statut }) {
  const status = statutDetails(statut);
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-semibold ${status.color}`}>
      {status.label}
    </span>
  );
}
