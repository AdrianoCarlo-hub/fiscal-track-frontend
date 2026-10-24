import { useMemo, useState } from 'react';
import { CalendarRange, Pencil, Scale, Settings2 } from 'lucide-react';
import adminService from '../../services/adminService';
import { useApiData, useListView } from '../../hooks/useApiData';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { useToast } from '../../context/notificationContext';
import DataTable, { ListToolbar } from '../../components/common/DataTable';
import PageHeader from '../../components/ui/PageHeader';
import KpiCard from '../../components/ui/KpiCard';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { Input, Textarea } from '../../components/ui/FormControls';
import { formatDecimal } from '../../utils/formatUtils';

const ANNEE_COURANTE = new Date().getFullYear();

export default function ParametresPage() {
  const { data, chargement, erreur, recharger } = useApiData(adminService.listerParametres, []);
  const { notifier } = useToast();
  const [secteur, setSecteur] = useState('');
  const [enEdition, setEnEdition] = useState(null);

  const parametres = useMemo(
    () => [...(data || [])].sort((a, b) => String(a.code).localeCompare(String(b.code))),
    [data],
  );
  const secteurs = useMemo(
    () => [...new Set(parametres.map((parametre) => parametre.secteur).filter(Boolean))].sort(),
    [parametres],
  );
  const parametresAffiches = secteur
    ? parametres.filter((parametre) => parametre.secteur === secteur)
    : parametres;
  const liste = useListView(parametresAffiches);

  const actifs = parametres.filter(
    (parametre) => !parametre.anneeFin || Number(parametre.anneeFin) >= ANNEE_COURANTE,
  ).length;

  const colonnes = [
    {
      cle: 'code',
      label: 'Paramètre',
      render: (parametre) => (
        <div>
          <p className="font-mono text-xs font-semibold text-slate-800">{parametre.code}</p>
          {parametre.description && <p className="mt-0.5 text-xs text-slate-500">{parametre.description}</p>}
        </div>
      ),
    },
    {
      cle: 'valeur',
      label: 'Valeur',
      align: 'right',
      render: (parametre) => (
        <span className="font-semibold text-slate-800">{formatDecimal(parametre.valeur)}</span>
      ),
    },
    {
      cle: 'annees',
      label: 'Période',
      render: (parametre) =>
        parametre.anneeDebut || parametre.anneeFin
          ? `${parametre.anneeDebut ?? '…'} – ${parametre.anneeFin ?? 'en cours'}`
          : 'Permanent',
    },
    {
      cle: 'baseLegale',
      label: 'Base légale',
      render: (parametre) => parametre.baseLegale || '—',
    },
    {
      cle: 'secteur',
      label: 'Secteur',
      render: (parametre) => parametre.secteur || 'Tous',
    },
    {
      cle: 'actions',
      label: 'Actions',
      align: 'right',
      render: (parametre) => (
        <Button variant="ghost" size="sm" onClick={() => setEnEdition(parametre)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Paramètres fiscaux"
        description="Valeurs de référence utilisées par le moteur de calcul (seuils, taux, plafonds)."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Paramètres fiscaux' }]}
      />

      {chargement && <LoadingState lignes={3} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <KpiCard title="Paramètres" value={parametres.length} icon={Settings2} />
            <KpiCard title="En vigueur" value={actifs} icon={CalendarRange} tone="success" />
            <KpiCard title="Secteurs spécifiques" value={secteurs.length} icon={Scale} />
          </div>

          <Alert variante="avertissement" titre="Valeurs réglementaires" className="mb-5">
            Chaque modification est enregistrée dans le journal d’audit et s’applique aux prochains calculs. Vérifiez
            la base légale avant de changer une valeur.
          </Alert>

          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher un code, une base légale ou un secteur…"
            count={liste.filteredCount}
            actions={
              <select
                aria-label="Filtrer par secteur"
                value={secteur}
                onChange={(event) => setSecteur(event.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              >
                <option value="">Tous les secteurs</option>
                {secteurs.map((valeur) => (
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
            rechercheActive={Boolean(liste.query || secteur)}
            onEffacerRecherche={() => {
              liste.clear();
              setSecteur('');
            }}
            titreVide="Aucun paramètre"
            descriptionVide="Aucune valeur ne correspond à ce filtre."
            cleLigne={(parametre) => parametre.code}
          />
        </>
      )}

      <Modal
        ouvert={Boolean(enEdition)}
        onClose={() => setEnEdition(null)}
        titre="Modifier le paramètre"
        description={enEdition?.code}
      >
        {enEdition && (
          <FormulaireParametre
            parametre={enEdition}
            onFermer={() => setEnEdition(null)}
            onEnregistre={(message) => {
              setEnEdition(null);
              notifier({ titre: 'Paramètre mis à jour', message, variante: 'succes' });
              recharger();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function FormulaireParametre({ parametre, onFermer, onEnregistre }) {
  const [form, setForm] = useState({
    valeur: parametre.valeur ?? '',
    anneeDebut: parametre.anneeDebut ?? '',
    anneeFin: parametre.anneeFin ?? '',
    baseLegale: parametre.baseLegale ?? '',
    secteur: parametre.secteur ?? '',
    description: parametre.description ?? '',
  });
  const [erreursLocales, setErreursLocales] = useState({});

  const { executer, enCours, erreur, champs } = useAsyncAction(
    () =>
      adminService.modifierParametre(parametre.code, {
        valeur: Number(String(form.valeur).replace(',', '.')),
        anneeDebut: form.anneeDebut === '' ? null : Number(form.anneeDebut),
        anneeFin: form.anneeFin === '' ? null : Number(form.anneeFin),
        baseLegale: form.baseLegale.trim() || null,
        secteur: form.secteur.trim() || null,
        description: form.description.trim() || null,
      }),
    { onSucces: () => onEnregistre(`La valeur de ${parametre.code} a été enregistrée.`) },
  );

  const modifier = (champ, valeur) => setForm((precedent) => ({ ...precedent, [champ]: valeur }));

  const soumettre = (event) => {
    event.preventDefault();
    const erreurs = {};
    const valeur = Number(String(form.valeur).replace(',', '.'));
    if (form.valeur === '' || Number.isNaN(valeur)) erreurs.valeur = 'Saisissez une valeur numérique.';
    if (form.anneeDebut && !/^\d{4}$/.test(String(form.anneeDebut))) {
      erreurs.anneeDebut = 'Année sur 4 chiffres.';
    }
    if (form.anneeFin && !/^\d{4}$/.test(String(form.anneeFin))) erreurs.anneeFin = 'Année sur 4 chiffres.';
    if (form.anneeDebut && form.anneeFin && Number(form.anneeFin) < Number(form.anneeDebut)) {
      erreurs.anneeFin = 'L’année de fin doit suivre l’année de début.';
    }
    setErreursLocales(erreurs);
    if (Object.keys(erreurs).length > 0) return;
    executer();
  };

  const erreurDe = (champ) => erreursLocales[champ] || champs[champ];

  return (
    <form onSubmit={soumettre} className="space-y-4" noValidate>
      {erreur && (
        <Alert variante="danger" titre="Enregistrement impossible">
          {erreur.message}
        </Alert>
      )}

      {parametre.description && (
        <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{parametre.description}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="valeur"
          label="Valeur"
          obligatoire
          inputMode="decimal"
          value={form.valeur}
          onChange={(event) => modifier('valeur', event.target.value)}
          erreur={erreurDe('valeur')}
          aide={parametre.code ? `Valeur actuelle : ${formatDecimal(parametre.valeur)}` : undefined}
        />
        <Input
          id="baseLegale"
          label="Base légale"
          value={form.baseLegale}
          onChange={(event) => modifier('baseLegale', event.target.value)}
          erreur={erreurDe('baseLegale')}
          placeholder="Loi de finances 2026, article…"
        />
        <Input
          id="anneeDebut"
          type="number"
          min="1900"
          max="2200"
          label="Année de début"
          value={form.anneeDebut}
          onChange={(event) => modifier('anneeDebut', event.target.value)}
          erreur={erreurDe('anneeDebut')}
          aide="Vide si le paramètre est permanent."
        />
        <Input
          id="anneeFin"
          type="number"
          min="1900"
          max="2200"
          label="Année de fin"
          value={form.anneeFin}
          onChange={(event) => modifier('anneeFin', event.target.value)}
          erreur={erreurDe('anneeFin')}
          aide="Vide si le paramètre est toujours en vigueur."
        />
        <Input
          id="secteur"
          label="Secteur"
          value={form.secteur}
          onChange={(event) => modifier('secteur', event.target.value)}
          erreur={erreurDe('secteur')}
          aide="Vide si le paramètre s’applique à tous les secteurs."
        />
      </div>

      <Textarea
        id="description"
        label="Description"
        rows={3}
        value={form.description}
        onChange={(event) => modifier('description', event.target.value)}
        erreur={erreurDe('description')}
      />

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onFermer} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" chargement={enCours}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
