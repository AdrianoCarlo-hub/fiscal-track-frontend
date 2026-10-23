import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, ChevronLeft, ChevronRight, ListChecks } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import useApiData from '../../hooks/useApiData';
import calendrierService from '../../services/calendrierService';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import StatutBadge from '../../components/ui/StatutBadge';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import KpiCard from '../../components/ui/KpiCard';
import { formatDate, formatEcheanceRelative, joursAvantEcheance } from '../../utils/formatUtils';
import { libelleImpot } from '../../utils/fiscalConstants';

const echeanceDe = (obligation) => obligation.dateLimiteReelle || obligation.dateLimiteTheorique || null;

function etatEcheance(obligation) {
  const echeance = echeanceDe(obligation);
  if (obligation.statutDeclaration === 'DEPOSE') {
    return { filtre: 'DEPOSE', variante: 'success', texte: 'Déclaration déposée', famille: 'statutDeclaration', code: 'DEPOSE' };
  }
  const jours = joursAvantEcheance(echeance);
  if (obligation.statutDeclaration === 'RETARD' || (jours !== null && jours < 0)) {
    return { filtre: 'RETARD', variante: 'danger', texte: 'En retard', famille: 'statutDeclaration', code: 'RETARD' };
  }
  if (jours !== null && jours <= 7) {
    return { filtre: 'PROCHE', variante: 'warning', texte: 'Échéance proche', famille: 'statutDeclaration', code: 'ATTENTE' };
  }
  return { filtre: 'A_VENIR', variante: 'info', texte: 'À venir', famille: 'statutDeclaration', code: 'ATTENTE' };
}

const MOIS = Array.from({ length: 12 }, (_, index) => ({
  valeur: String(index + 1).padStart(2, '0'),
  libelle: new Date(2000, index, 1).toLocaleDateString('fr-FR', { month: 'long' }),
}));

const SELECT_CLASSE =
  'mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15';

export default function CalendrierPage() {
  const { utilisateur } = useAuth();
  const anneeCourante = new Date().getFullYear();
  const [annee, setAnnee] = useState(anneeCourante);
  const [typeImpot, setTypeImpot] = useState('TOUS');
  const [moisFiltre, setMoisFiltre] = useState('TOUS');
  const [statutFiltre, setStatutFiltre] = useState('TOUS');
  const [selection, setSelection] = useState(null);

  const { data, chargement, erreur, recharger } = useApiData(
    () => calendrierService.parContribuableEtAnnee(utilisateur.identifiant, annee),
    [utilisateur.identifiant, annee],
    { valeurInitiale: [] },
  );

  const obligations = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const types = useMemo(
    () => [...new Set(obligations.map((obligation) => obligation.codeImpot).filter(Boolean))].sort(),
    [obligations],
  );

  const compteurs = useMemo(() => {
    const base = { total: obligations.length, depose: 0, retard: 0, proche: 0 };
    obligations.forEach((obligation) => {
      const etat = etatEcheance(obligation);
      if (etat.filtre === 'DEPOSE') base.depose += 1;
      if (etat.filtre === 'RETARD') base.retard += 1;
      if (etat.filtre === 'PROCHE') base.proche += 1;
    });
    return base;
  }, [obligations]);

  const prochaines = useMemo(
    () =>
      obligations
        .filter((obligation) => {
          const echeance = echeanceDe(obligation);
          const etat = etatEcheance(obligation);
          return etat.filtre !== 'DEPOSE' && echeance && (joursAvantEcheance(echeance) ?? 0) >= 0;
        })
        .sort((a, b) => String(echeanceDe(a)).localeCompare(String(echeanceDe(b))))
        .slice(0, 5),
    [obligations],
  );

  const groupes = useMemo(() => {
    const resultat = {};
    obligations
      .filter((obligation) => {
        const echeance = echeanceDe(obligation);
        const etat = etatEcheance(obligation);
        return (
          (!echeance || typeImpot === 'TOUS' || obligation.codeImpot === typeImpot) &&
          (moisFiltre === 'TOUS' || String(echeance).slice(5, 7) === moisFiltre) &&
          (statutFiltre === 'TOUS' || etat.filtre === statutFiltre)
        );
      })
      .forEach((obligation) => {
        const echeance = echeanceDe(obligation);
        const cle = echeance ? String(echeance).slice(0, 7) : 'sans-echeance';
        if (!resultat[cle]) resultat[cle] = [];
        resultat[cle].push(obligation);
      });
    return resultat;
  }, [obligations, typeImpot, moisFiltre, statutFiltre]);

  const nombreAffiche = Object.values(groupes).reduce((total, items) => total + items.length, 0);
  const annees = Array.from({ length: 6 }, (_, index) => anneeCourante + 1 - index);

  return (
    <div>
      <PageHeader
        titre="Calendrier fiscal"
        description="Visualisez vos échéances par mois, identifiez celles qui arrivent à terme et déclarez directement en ligne."
        fil={[{ libelle: 'Mon espace fiscal' }, { libelle: 'Calendrier fiscal' }]}
        actions={
          <>
            <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white p-1">
              <button
                type="button"
                aria-label="Année précédente"
                onClick={() => setAnnee((valeur) => valeur - 1)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <select
                value={annee}
                onChange={(evenement) => setAnnee(Number(evenement.target.value))}
                aria-label="Année du calendrier"
                className="rounded-md border-0 bg-transparent px-2 py-1 text-sm font-semibold text-primary focus:outline-none"
              >
                {annees.map((valeur) => (
                  <option key={valeur} value={valeur}>
                    {valeur}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label="Année suivante"
                onClick={() => setAnnee((valeur) => valeur + 1)}
                className="rounded-md p-2 text-slate-600 hover:bg-slate-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link
              to="/contribuable/acomptes"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/15"
            >
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Mes acomptes
            </Link>
          </>
        }
      />

      {erreur ? (
        <ErrorState erreur={erreur} onReessayer={recharger} />
      ) : chargement ? (
        <LoadingState message="Chargement du calendrier…" />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard title="Obligations de l’année" value={compteurs.total} icon={CalendarDays} />
            <KpiCard title="Déclarations déposées" value={compteurs.depose} icon={CalendarDays} tone="success" />
            <KpiCard title="Échéances proches" value={compteurs.proche} icon={CalendarDays} tone="warning" />
            <KpiCard title="En retard" value={compteurs.retard} icon={CalendarDays} tone={compteurs.retard > 0 ? 'danger' : 'success'} />
          </div>

          <SectionCard
            titre="Prochaines échéances"
            description="Les obligations non déposées les plus proches de leur date limite."
            className="mb-6"
          >
            {prochaines.length === 0 ? (
              <p className="text-sm text-slate-500">Aucune échéance à venir pour l’année {annee}.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {prochaines.map((obligation) => {
                  const etat = etatEcheance(obligation);
                  const echeance = echeanceDe(obligation);
                  return (
                    <li key={obligation.idObligationFiscale}>
                      <button
                        type="button"
                        onClick={() => setSelection(obligation)}
                        className="flex w-full flex-wrap items-center justify-between gap-3 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-primary">
                            {libelleImpot(obligation.codeImpot)} · {obligation.periodeFiscale}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatDate(echeance)} — {formatEcheanceRelative(echeance)}
                          </span>
                        </span>
                        <StatutBadge
                          famille={etat.famille}
                          code={etat.code}
                          variante={etat.variante}
                          texte={etat.texte}
                        />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </SectionCard>

          <SectionCard titre="Filtrer les échéances" className="mb-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="text-xs font-medium text-slate-600">
                Type d’impôt
                <select value={typeImpot} onChange={(evenement) => setTypeImpot(evenement.target.value)} className={SELECT_CLASSE}>
                  <option value="TOUS">Tous les impôts</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {libelleImpot(type)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Mois
                <select value={moisFiltre} onChange={(evenement) => setMoisFiltre(evenement.target.value)} className={SELECT_CLASSE}>
                  <option value="TOUS">Toute l’année</option>
                  {MOIS.map((mois) => (
                    <option key={mois.valeur} value={mois.valeur}>
                      {mois.libelle}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-slate-600">
                Statut
                <select value={statutFiltre} onChange={(evenement) => setStatutFiltre(evenement.target.value)} className={SELECT_CLASSE}>
                  <option value="TOUS">Tous les statuts</option>
                  <option value="A_VENIR">À venir</option>
                  <option value="PROCHE">Échéance proche</option>
                  <option value="RETARD">En retard</option>
                  <option value="DEPOSE">Déclaration déposée</option>
                </select>
              </label>
            </div>
          </SectionCard>

          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl font-semibold text-primary">Échéances par mois</h2>
              <p className="text-sm text-slate-500">Sélectionnez une obligation pour afficher son détail.</p>
            </div>
            <span className="text-sm text-slate-500">{nombreAffiche} obligation(s) affichée(s)</span>
          </div>

          {Object.keys(groupes).length === 0 ? (
            <div className="fiscal-card p-8 text-center text-sm text-slate-500">
              Aucune échéance ne correspond à ces filtres pour l’année {annee}.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupes)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([mois, items]) => (
                  <SectionCard
                    key={mois}
                    titre={
                      mois === 'sans-echeance'
                        ? 'Échéance non définie'
                        : new Date(`${mois}-01T00:00:00`).toLocaleDateString('fr-FR', {
                            month: 'long',
                            year: 'numeric',
                          })
                    }
                    padding={false}
                  >
                    <ul className="divide-y divide-slate-100">
                      {items.map((obligation) => {
                        const etat = etatEcheance(obligation);
                        const echeance = echeanceDe(obligation);
                        return (
                          <li key={obligation.idObligationFiscale}>
                            <button
                              type="button"
                              onClick={() => setSelection(obligation)}
                              className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-slate-50"
                            >
                              <span className="min-w-0">
                                <span className="block text-sm font-semibold text-primary">
                                  {libelleImpot(obligation.codeImpot)} · {obligation.periodeFiscale}
                                </span>
                                <span className="text-xs text-slate-500">
                                  Échéance : {formatDate(echeance)}
                                </span>
                              </span>
                              <StatutBadge
                                famille={etat.famille}
                                code={etat.code}
                                variante={etat.variante}
                                texte={etat.texte}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </SectionCard>
                ))}
            </div>
          )}
        </>
      )}

      <Modal
        ouvert={!!selection}
        onClose={() => setSelection(null)}
        titre={selection ? libelleImpot(selection.codeImpot) : ''}
        description="Détail de l’obligation fiscale"
        pied={
          selection && selection.statutDeclaration !== 'DEPOSE' ? (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setSelection(null)}>
                Fermer
              </Button>
              <Link
                to={`/contribuable/declarations/deposer/${selection.idObligationFiscale}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                Déclarer cette obligation
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <Button variant="ghost" onClick={() => setSelection(null)}>
              Fermer
            </Button>
          )
        }
      >
        {selection && (
          <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Période fiscale</dt>
              <dd className="mt-1 font-medium text-slate-800">{selection.periodeFiscale || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Date limite</dt>
              <dd className="mt-1 font-medium text-slate-800">{formatDate(echeanceDe(selection))}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Statut</dt>
              <dd className="mt-1">
                <StatutBadge
                  famille={etatEcheance(selection).famille}
                  code={etatEcheance(selection).code}
                  variante={etatEcheance(selection).variante}
                  texte={etatEcheance(selection).texte}
                />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Déclaration</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {selection.statutDeclaration === 'DEPOSE' ? 'Déposée' : 'Non déposée'}
              </dd>
            </div>
          </dl>
        )}
      </Modal>
    </div>
  );
}
