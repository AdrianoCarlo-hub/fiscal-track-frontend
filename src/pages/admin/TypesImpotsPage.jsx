import { useState } from 'react';
import { CalendarDays, Pencil, Plus, ReceiptText } from 'lucide-react';
import typeImpotService from '../../services/typeImpotService';
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
import { Input, Select } from '../../components/ui/FormControls';
import { libelle, options } from '../../utils/libelles';

const PERIODICITES = options('periodicite');

export default function TypesImpotsPage() {
  const { data, chargement, erreur, recharger } = useApiData(typeImpotService.lister, []);
  const liste = useListView(data || []);
  const { notifier } = useToast();
  const [modal, setModal] = useState(null);

  const types = data || [];
  const mensuels = types.filter((type) => type.periodicite === 'MENSUELLE').length;
  const annuels = types.filter((type) => type.periodicite === 'ANNUELLE').length;

  const colonnes = [
    {
      cle: 'codeImpot',
      label: 'Code',
      render: (type) => <span className="font-mono text-xs font-semibold">{type.codeImpot}</span>,
    },
    { cle: 'nomImpot', label: 'Impôt' },
    { cle: 'periodicite', label: 'Périodicité', render: (type) => libelle('periodicite', type.periodicite) },
    {
      cle: 'echeance',
      label: 'Échéance théorique',
      render: (type) =>
        type.echeanceTheoriqueMois > 0
          ? `${type.echeanceTheoriqueJour} du mois ${type.echeanceTheoriqueMois}`
          : `Jour ${type.echeanceTheoriqueJour}`,
    },
    {
      cle: 'actions',
      label: 'Actions',
      align: 'right',
      render: (type) => (
        <Button variant="ghost" size="sm" onClick={() => setModal(type)}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Modifier
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        titre="Types d’impôts"
        description="Paramétrez les impôts gérés, leur périodicité et leur échéance théorique."
        fil={[{ libelle: 'Espace administrateur' }, { libelle: 'Types d’impôts' }]}
        actions={
          <Button onClick={() => setModal({})}>
            <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau type
          </Button>
        }
      />

      {chargement && <LoadingState lignes={3} />}

      {!chargement && erreur && <ErrorState erreur={erreur} onReessayer={recharger} />}

      {!chargement && !erreur && (
        <>
          <div className="mb-5 grid gap-3 sm:grid-cols-3">
            <KpiCard title="Types d’impôts" value={types.length} icon={ReceiptText} />
            <KpiCard title="Périodicité mensuelle" value={mensuels} icon={CalendarDays} />
            <KpiCard title="Périodicité annuelle" value={annuels} icon={CalendarDays} tone="success" />
          </div>

          <Alert variante="avertissement" titre="Impact sur les obligations" className="mb-5">
            Modifier une échéance change le calcul des prochaines obligations. Les obligations déjà générées ne
            sont pas recalculées.
          </Alert>

          <ListToolbar
            value={liste.query}
            onChange={liste.setQuery}
            placeholder="Rechercher un code, un impôt ou une périodicité…"
            count={liste.filteredCount}
          />

          <DataTable
            colonnes={colonnes}
            donnees={liste.items}
            pagination={liste.pagination}
            onPageChange={liste.setPage}
            rechercheActive={Boolean(liste.query)}
            onEffacerRecherche={liste.clear}
            titreVide="Aucun type d’impôt"
            descriptionVide="Ajoutez un premier type d’impôt pour permettre la génération des obligations."
            cleLigne={(type) => type.codeImpot}
          />
        </>
      )}

      <Modal
        ouvert={Boolean(modal)}
        onClose={() => setModal(null)}
        titre={modal?.codeImpot ? 'Modifier le type d’impôt' : 'Nouveau type d’impôt'}
        description={modal?.codeImpot ? `Impôt ${modal.codeImpot}` : 'Le code doit être unique et stable.'}
      >
        {modal && (
          <FormulaireType
            type={modal.codeImpot ? modal : null}
            onFermer={() => setModal(null)}
            onEnregistre={(message) => {
              setModal(null);
              notifier({ titre: 'Type d’impôt enregistré', message, variante: 'succes' });
              recharger();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function FormulaireType({ type, onFermer, onEnregistre }) {
  const edition = Boolean(type);
  const [form, setForm] = useState({
    codeImpot: type?.codeImpot || '',
    nomImpot: type?.nomImpot || '',
    periodicite: type?.periodicite || 'MENSUELLE',
    echeanceTheoriqueJour: type?.echeanceTheoriqueJour || 1,
    echeanceTheoriqueMois: type?.echeanceTheoriqueMois || '',
  });
  const [erreursLocales, setErreursLocales] = useState({});

  const { executer, enCours, erreur, champs } = useAsyncAction(
    async () => {
      const payload = {
        codeImpot: form.codeImpot.trim().toUpperCase(),
        nomImpot: form.nomImpot.trim(),
        periodicite: form.periodicite,
        echeanceTheoriqueJour: Number(form.echeanceTheoriqueJour),
        echeanceTheoriqueMois: form.echeanceTheoriqueMois === '' ? null : Number(form.echeanceTheoriqueMois),
      };
      if (edition) {
        delete payload.codeImpot;
        return typeImpotService.modifier(type.codeImpot, payload);
      }
      return typeImpotService.creer(payload);
    },
    {
      onSucces: () =>
        onEnregistre(
          edition ? `L’impôt ${type.nomImpot} a été mis à jour.` : `L’impôt ${form.nomImpot} a été créé.`,
        ),
    },
  );

  const modifier = (champ, valeur) => setForm((precedent) => ({ ...precedent, [champ]: valeur }));

  const soumettre = (event) => {
    event.preventDefault();
    const erreurs = {};
    if (!/^[A-Z0-9]{2,10}$/.test(form.codeImpot.trim().toUpperCase())) {
      erreurs.codeImpot = '2 à 10 caractères alphanumériques, sans espace.';
    }
    if (!form.nomImpot.trim()) erreurs.nomImpot = 'Le nom est obligatoire.';
    if (!Number.isInteger(Number(form.echeanceTheoriqueJour)) || Number(form.echeanceTheoriqueJour) < 1 || Number(form.echeanceTheoriqueJour) > 31) {
      erreurs.echeanceTheoriqueJour = 'Le jour doit être compris entre 1 et 31.';
    }
    if (
      form.echeanceTheoriqueMois !== '' &&
      (!Number.isInteger(Number(form.echeanceTheoriqueMois)) ||
        Number(form.echeanceTheoriqueMois) < 1 ||
        Number(form.echeanceTheoriqueMois) > 12)
    ) {
      erreurs.echeanceTheoriqueMois = 'Le mois doit être compris entre 1 et 12.';
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="codeImpot"
          label="Code de l’impôt"
          obligatoire
          value={form.codeImpot}
          onChange={(e) => modifier('codeImpot', e.target.value.toUpperCase())}
          disabled={edition}
          placeholder="TVA"
          erreur={erreurDe('codeImpot')}
          aide={edition ? 'Le code ne peut pas être modifié.' : 'Lettres et chiffres, sans espace.'}
        />
        <Input
          id="nomImpot"
          label="Nom de l’impôt"
          obligatoire
          value={form.nomImpot}
          onChange={(e) => modifier('nomImpot', e.target.value)}
          placeholder="Taxe sur la valeur ajoutée"
          erreur={erreurDe('nomImpot')}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          id="periodicite"
          label="Périodicité"
          obligatoire
          value={form.periodicite}
          onChange={(e) => modifier('periodicite', e.target.value)}
          erreur={erreurDe('periodicite')}
        >
          {PERIODICITES.map((periodicite) => (
            <option key={periodicite.code} value={periodicite.code}>
              {periodicite.libelle}
            </option>
          ))}
        </Select>
        <Input
          id="echeanceTheoriqueJour"
          type="number"
          min="1"
          max="31"
          label="Jour d’échéance"
          obligatoire
          value={form.echeanceTheoriqueJour}
          onChange={(e) => modifier('echeanceTheoriqueJour', e.target.value)}
          erreur={erreurDe('echeanceTheoriqueJour')}
        />
        <Input
          id="echeanceTheoriqueMois"
          type="number"
          min="1"
          max="12"
          label="Mois d’échéance"
          value={form.echeanceTheoriqueMois}
          onChange={(e) => modifier('echeanceTheoriqueMois', e.target.value)}
          erreur={erreurDe('echeanceTheoriqueMois')}
          aide="Vide si l’échéance est relative au mois de dépôt."
        />
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button type="button" variant="ghost" onClick={onFermer} disabled={enCours}>
          Annuler
        </Button>
        <Button type="submit" chargement={enCours}>
          {edition ? 'Enregistrer' : 'Créer le type'}
        </Button>
      </div>
    </form>
  );
}
