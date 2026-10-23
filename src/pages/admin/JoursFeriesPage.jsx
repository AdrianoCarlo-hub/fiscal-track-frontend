import { useMemo, useState } from 'react';
import { CalendarCheck2, CalendarDays, Trash2 } from 'lucide-react';
import adminService from '../../services/adminService';
import { useApiData, useListView } from '../../hooks/useApiData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useConfirm, useToast } from '../../context/notificationContext';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import SectionCard from '../../components/ui/SectionCard';
import KpiCard from '../../components/ui/KpiCard';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Input } from '../../components/ui/FormControls';
import { formatDate } from '../../utils/formatUtils';

const AUJOURDHUI = new Date().toISOString().slice(0, 10);

export default function JoursFeriesPage() {
  const { data, chargement, erreur, recharger } = useApiData(adminService.listerJoursFeries, []);
  const { notifier } = useToast();
  const confirmer = useConfirm();
  const [annee, setAnnee] = useState('');
  const [suppressionEnCours, setSuppressionEnCours] = useState(null);

  const jours = useMemo(
    () => [...(data || [])].sort((a, b) => String(b.dateFerie).localeCompare(String(a.dateFerie))),
    [data],
  );
  const annees = useMemo(
    () => [...new Set(jours.map((jour) => String(jour.dateFerie).slice(0, 4)))].sort((a, b) => b.localeCompare(a)),
    [jours],
  );
  const joursAffiches = annee ? jours.filter((jour) => String(jour.dateFerie).startsWith(annee)) : jours;
  const liste = useListView(joursAffiches);

  const anneeCourante = String(new Date().getFullYear());
  const dansAnneeCourante = jours.filter((jour) => String(jour.dateFerie).startsWith(anneeCourante)).length;
  const aVenir = jours.filter((jour) => String(jour.dateFerie) >= AUJOURDHUI).length;

  const supprimer = async (jour) => {
    const confirme = await confirmer({
      titre: 'Supprimer ce jour férié ?',
      message: `${formatDate(jour.dateFerie)}${jour.description ? ` — ${jour.description}` : ''} ne sera plus exclu des échéances.`,
      libelleConfirmer: 'Supprimer',
      variante: 'danger',
    });
    if (!confirme) return;
    setSuppressionEnCours(jour.idJourFerie);
    try {
      await adminService.supprimerJourFerie(jour.idJourFerie);
      notifier({ titre: 'Jour férié supprimé', message: formatDate(jour.dateFerie), variante: 'succes' });
      recharger();
    } catch (err) {
      notifier({ titre: 'Suppression impossible', message: err?.message, variante: 'danger' });
    } finally {
      setSuppressionEnCours(null);
    }
  };

  const colonnes = [
    {
      cle: 'dateFerie',
      label: 'Date',
      render: (jour) => (
        <div>
          <p className="font-medium text-slate-800">{formatDate(jour.dateFerie)}</p>
          <p className="text-xs text-slate-500">
            {new Date(`${jour.dateFerie}T00:00:00`).toLocaleDateString('fr-FR', { weekday: 'long' })}
          </p>
        </div>
      ),
    },
    { cle: 'description', label: 'Description', render: (jour) => jour.description || '—' },
    {
      cle: 'actions',
      label: 'Action',
      align: 'right',
      render: (jour) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-danger hover:bg-danger/5"
          chargement={suppressionEnCours === jour.idJourFerie}
          onClick={() => supprimer(jour)}
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Supprimer
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Jours fériés"
        description="Dates non ouvrables exclues du calcul des échéances légales."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Jours fériés' }]}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <KpiCard title="Jours fériés enregistrés" value={jours.length} icon={CalendarDays} />
        <KpiCard title={`Année ${anneeCourante}`} value={dansAnneeCourante} icon={CalendarCheck2} tone="success" />
        <KpiCard title="À venir" value={aVenir} icon={CalendarDays} tone="warning" />
      </div>

      <div className="mb-5">
        <SectionCard
          titre="Ajouter un jour férié"
          description="La date doit être unique. Le report des échéances est appliqué automatiquement."
        >
          <FormulaireJourFerie
            onAjoute={(jour) => {
              notifier({
                titre: 'Jour férié ajouté',
                message: `${formatDate(jour.dateFerie)}${jour.description ? ` — ${jour.description}` : ''}`,
                variante: 'succes',
              });
              recharger();
            }}
          />
        </SectionCard>
      </div>

      {chargement && <LoadingState lignes={3} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher une date ou une description…"
            count={liste.filteredCount}
            actions={
              <select
                aria-label="Filtrer par année"
                value={annee}
                onChange={(event) => setAnnee(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Toutes les années</option>
                {annees.map((valeur) => (
                  <option key={valeur} value={valeur}>
                    {valeur}
                  </option>
                ))}
              </select>
            }
          />

          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            pagination={liste.pagination}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query || annee)}
            onEffacerRecherche={() => {
              liste.clear();
              setAnnee('');
            }}
            titreVide="Aucun jour férié"
            descriptionVide="Ajoutez les jours non ouvrables pour ajuster les échéances."
            cleLigne={(jour) => jour.idJourFerie}
          />
        </>
      )}
    </div>
  );
}

function FormulaireJourFerie({ onAjoute }) {
  const [form, setForm] = useState({ dateFerie: '', description: '' });
  const [erreursLocales, setErreursLocales] = useState({});

  const { executer, enCours, erreur, champs, reinitialiser } = useAsyncAction(
    () => adminService.ajouterJourFerie({ dateFerie: form.dateFerie, description: form.description.trim() || null }),
    {
      onSucces: (jour) => {
        setForm({ dateFerie: '', description: '' });
        setErreursLocales({});
        reinitialiser();
        onAjoute(jour);
      },
    },
  );

  const soumettre = (event) => {
    event.preventDefault();
    const erreurs = {};
    if (!form.dateFerie) erreurs.dateFerie = 'La date est obligatoire.';
    if (form.description.length > 150) erreurs.description = '150 caractères maximum.';
    setErreursLocales(erreurs);
    if (Object.keys(erreurs).length > 0) return;
    executer();
  };

  return (
    <form onSubmit={soumettre} className="space-y-4" noValidate>
      {erreur && (
        <Alert variante="danger" titre="Ajout impossible">
          {erreur.message}
        </Alert>
      )}
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_2fr_auto]">
        <Input
          id="dateFerie"
          type="date"
          label="Date"
          obligatoire
          value={form.dateFerie}
          onChange={(event) => setForm({ ...form, dateFerie: event.target.value })}
          erreur={erreursLocales.dateFerie || champs.dateFerie}
        />
        <Input
          id="descriptionJourFerie"
          label="Description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          placeholder="Fête nationale, jour férié légal…"
          erreur={erreursLocales.description || champs.description}
          aide="Facultative, utile pour identifier le jour férié."
        />
        <Button type="submit" chargement={enCours} className="sm:mb-6">
          Ajouter
        </Button>
      </div>
    </form>
  );
}
