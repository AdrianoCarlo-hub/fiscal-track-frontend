import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CATEGORIES_ACTIVITE, CATEGORIES_ACTIVITE_IS, SEUIL_MINIMUM_CA_IR, libelleCategorie } from '../../utils/fiscalConstants';

/**
 * Formulaire de declaration adapte au type d'impot de l'obligation.
 * Les champs sont declares par le contribuable, mais aucun montant d'impot
 * n'est saisi ici : il est toujours calcule par le serveur (previsualisation).
 *
 * Les valeurs sont stockees en chaine de caracteres ; la conversion en
 * nombres se fait dans utils/declarationUtils avant l'envoi.
 */
export default function FormulaireDeclaration({ codeImpot, valeurs, onChange }) {
  const maj = (champ, valeur) => onChange({ ...valeurs, [champ]: valeur });

  switch (codeImpot) {
    case 'IS':
      return <FormIS valeurs={valeurs} maj={maj} />;
    case 'TVA':
      return <FormTva valeurs={valeurs} maj={maj} />;
    case 'IR':
      return <FormIr valeurs={valeurs} onChange={onChange} maj={maj} />;
    case 'IRSA':
      return <FormIrsa valeurs={valeurs} onChange={onChange} />;
    case 'ACOMPTE_IR':
    case 'ACOMPTE_IS':
      return <FormAcompte codeImpot={codeImpot} />;
    default:
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Aucun formulaire n’est disponible pour ce type d’impôt.
          Contactez votre agent du centre fiscal.
        </div>
      );
  }
}

function FormIS({ valeurs, maj }) {
  return (
    <div className="space-y-5">
      <Section titre="Chiffre d’affaires de l’exercice">
        <Champ label="Chiffre d’affaires brut encaissé" name="caBrut" required
          value={valeurs.caBrut} onChange={(v) => maj('caBrut', v)}
          aide="Montant TTC encaissé sur l’exercice, avant déduction des charges." />
        <div className="flex flex-wrap gap-4 pt-1">
          <Case label="Adhérent à la CGA (centre de gestion agréé)"
            checked={valeurs.adherentCga} onChange={(v) => maj('adherentCga', v)}
            aide="Vous bénéficiez du régime du résultat net réel simplifié." />
        </div>
        <Champ label="Achats et charges conformes (Ar)" name="achatsConformes"
          value={valeurs.achatsConformes} onChange={(v) => maj('achatsConformes', v)}
          aide="Uniquement si vous êtes adhérent à la CGA." />
      </Section>

      <Section titre="Charges et autres acomptes">
        <Champ label="Charges salariales de l’exercice (Ar)" name="chargesSalariales"
          value={valeurs.chargesSalariales} onChange={(v) => maj('chargesSalariales', v)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Acomptes perçus en douane (Ar)" name="acomptesDouane"
            value={valeurs.acomptesDouane} onChange={(v) => maj('acomptesDouane', v)}
            aide="Montant facultatif déjà versé à la douane au titre de cet impôt."
            erreur={erreurNegatif(valeurs.acomptesDouane)} />
          <Champ label="Acomptes marchés publics (Ar)" name="acomptesMarchesPublics"
            value={valeurs.acomptesMarchesPublics} onChange={(v) => maj('acomptesMarchesPublics', v)}
            aide="Montant facultatif retenu sur les marchés publics."
            erreur={erreurNegatif(valeurs.acomptesMarchesPublics)} />
        </div>
      </Section>

      <Section titre="Catégorie d’activité">
        <SelecteurCategorie value={valeurs.categorieActiviteIs}
          onChange={(v) => maj('categorieActiviteIs', v)}
          categories={CATEGORIES_ACTIVITE_IS} />
      </Section>
    </div>
  );
}

function FormTva({ valeurs, maj }) {
  return (
    <div className="space-y-5">
      <Section titre="Opérations de la période">
        <Champ label="Chiffre d’affaires imposable localement (Ar)" name="caLocal" required
          value={valeurs.caLocal} onChange={(v) => maj('caLocal', v)}
          aide="Ventes et prestations réalisées à Madagascar (taux normal 20 %)." />
        <Champ label="Chiffre d’affaires à l’exportation (Ar)" name="caExportation"
          value={valeurs.caExportation} onChange={(v) => maj('caExportation', v)}
          aide="Exportations : TVA à 0 %, elles ne produisent aucune TVA collectée." />
        <Case label="Livraisons de gaz butane (taux réduit)"
          checked={valeurs.gazButane} onChange={(v) => maj('gazButane', v)} />
      </Section>

      <Section titre="TVA déductible">
        <Champ label="TVA déductible sur les biens et services (Ar)" name="tvaDeductibleBiens"
          value={valeurs.tvaDeductibleBiens} onChange={(v) => maj('tvaDeductibleBiens', v)}
          aide="TVA facturée par vos fournisseurs sur les achats courants." />
        <Champ label="TVA déductible sur les immobilisations (Ar)" name="tvaDeductibleImmobilisations"
          value={valeurs.tvaDeductibleImmobilisations}
          onChange={(v) => maj('tvaDeductibleImmobilisations', v)}
          aide="TVA sur les équipements et constructions acquis." />
        <Champ label="Crédit de TVA antérieur (Ar)" name="creditTvaAnterieur"
          value={valeurs.creditTvaAnterieur} onChange={(v) => maj('creditTvaAnterieur', v)}
          aide="Crédit reporté des périodes précédentes." />
      </Section>
    </div>
  );
}

function FormIr({ valeurs, onChange, maj }) {
  const [erreurSaisie, setErreurSaisie] = useState('');

  const saisirCaHT = (brut) => {
    const texte = String(brut ?? '');
    if (texte === '') {
      setErreurSaisie('');
      maj('caHT', '');
      return;
    }
    if (!saisieCaIrAutorisee(texte)) {
      setErreurSaisie('Saisie refusée : le chiffre d’affaires HT doit être supérieur ou égal à 400 000 000 Ar.');
      return;
    }
    setErreurSaisie('');
    maj('caHT', texte);
  };

  const quitterCaHT = () => {
    const montant = nombreCaIr(valeurs.caHT);
    if (montant !== null && montant < SEUIL_MINIMUM_CA_IR) {
      maj('caHT', '');
      setErreurSaisie('Chiffre d’affaires HT inférieur à 400 000 000 Ar : le champ a été vidé.');
    }
  };

  const majDeficit = (index, champ, valeur) => {
    const deficits = valeurs.deficits.map((d, i) => (i === index ? { ...d, [champ]: valeur } : d));
    onChange({ ...valeurs, deficits });
  };

  return (
    <div className="space-y-5">
      <Section titre="Résultat de l’exercice">
        <Champ label="Chiffre d’affaires hors taxes (Ar)" name="caHT" required
          value={valeurs.caHT} onChange={saisirCaHT} onBlur={quitterCaHT}
          min={String(SEUIL_MINIMUM_CA_IR)}
          aide="Recettes de l’exercice, hors taxes. Minimum requis : 400 000 000 Ar."
          erreur={erreurSaisie || erreurCaIr(valeurs.caHT)} />
        <Champ label="Charges déductibles (Ar)" name="chargesDeductibles"
          value={valeurs.chargesDeductibles} onChange={(v) => maj('chargesDeductibles', v)}
          aide="Charges réellement supportées et justifiées." />
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Réintégrations extra-comptables (Ar)" name="reintegrations"
            value={valeurs.reintegrations} onChange={(v) => maj('reintegrations', v)}
            aide="Charges comptabilisées non déductibles (voir § réintégrations du guide IR)." />
          <Champ label="Déductions extra-comptables (Ar)" name="deductions"
            value={valeurs.deductions} onChange={(v) => maj('deductions', v)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Champ label="Acomptes perçus en douane (Ar)" name="acomptesDouane"
            value={valeurs.acomptesDouane} onChange={(v) => maj('acomptesDouane', v)}
            aide="Montant facultatif déjà versé à la douane au titre de cet impôt."
            erreur={erreurNegatif(valeurs.acomptesDouane)} />
          <Champ label="Acomptes marchés publics (Ar)" name="acomptesMarchesPublics"
            value={valeurs.acomptesMarchesPublics} onChange={(v) => maj('acomptesMarchesPublics', v)}
            aide="Montant facultatif retenu sur les marchés publics."
            erreur={erreurNegatif(valeurs.acomptesMarchesPublics)} />
        </div>
      </Section>

      <Section titre="Situation du dossier">
        <div className="grid gap-4 sm:grid-cols-2">
          <SelecteurCategorie value={valeurs.categorieActivite}
            onChange={(v) => maj('categorieActivite', v)} />
          <Champ label="Mois d’activité de l’exercice" name="moisActifs" type="number" min="1" max="12"
            value={valeurs.moisActifs} onChange={(v) => maj('moisActifs', v)}
            aide="De 1 à 12. Laisser vide pour un exercice complet." />
        </div>
      </Section>

      <Section titre="Déficits reportables">
        {valeurs.deficits.length === 0 && (
          <p className="text-sm text-slate-500">
            Aucun déficit à signaler. Ajoutez une ligne pour chaque exercice en déficit (report possible sur 5 exercices).
          </p>
        )}
        {valeurs.deficits.map((d, i) => (
          <div key={`def-${i}`} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-3">
            <div className="w-32">
              <Champ label="Exercice d’origine" name={`deficit-annee-${i}`} type="number"
                value={d.anneeOrigine} onChange={(v) => majDeficit(i, 'anneeOrigine', v)} />
            </div>
            <div className="flex-1 min-w-40">
              <Champ label="Montant du déficit (Ar)" name={`deficit-montant-${i}`}
                value={d.montant} onChange={(v) => majDeficit(i, 'montant', v)} />
            </div>
            <button type="button" aria-label="Supprimer la ligne"
              onClick={() => onChange({ ...valeurs, deficits: valeurs.deficits.filter((_, j) => j !== i) })}
              className="p-2 text-slate-400 hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button type="button"
          onClick={() => onChange({ ...valeurs, deficits: [...valeurs.deficits, { anneeOrigine: '', montant: '' }] })}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
          <Plus className="h-4 w-4" /> Ajouter un déficit
        </button>
      </Section>
    </div>
  );
}

function FormIrsa({ valeurs, onChange }) {
  const majLigne = (index, champ, valeur) => {
    const salaries = valeurs.salaries.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l));
    onChange({ ...valeurs, salaries });
  };

  const ajouter = () => onChange({
    ...valeurs,
    salaries: [...valeurs.salaries, {
      nom: '', salaireBrut: '', cotisationsSociales: '',
      avantageLogement: '', avantageVehicule: '', avantageTelephone: '',
      personnesCharge: '',
    }],
  });

  const retirer = (index) => onChange({
    ...valeurs,
    salaries: valeurs.salaries.filter((_, i) => i !== index),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Déclarez chaque salarié de la période. L’IRSA de chaque ligne est calculé par le serveur,
          puis les montants sont additionnés.
        </p>
        <span className="text-xs text-slate-500">{valeurs.salaries.length} / 50</span>
      </div>

      {valeurs.salaries.map((ligne, i) => (
        <div key={`sal-${i}`} className="rounded-xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Salarié n°{i + 1}</p>
            {valeurs.salaries.length > 1 && (
              <button type="button" onClick={() => retirer(i)} aria-label={`Retirer le salarié ${i + 1}`}
                className="p-1 text-slate-400 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Champ label="Nom du salarié" name={`nom-${i}`} type="text" value={ligne.nom}
              onChange={(v) => majLigne(i, 'nom', v)} />
            <Champ label="Salaire brut mensuel (Ar)" name={`brut-${i}`} required
              value={ligne.salaireBrut} onChange={(v) => majLigne(i, 'salaireBrut', v)} />
            <Champ label="Cotisations sociales (Ar)" name={`cotis-${i}`}
              value={ligne.cotisationsSociales} onChange={(v) => majLigne(i, 'cotisationsSociales', v)}
              aide="Part salariale retenue sur le bulletin de paie." />
            <Champ label="Personnes à charge" name={`charge-${i}`} type="number" min="0"
              value={ligne.personnesCharge} onChange={(v) => majLigne(i, 'personnesCharge', v)} />
          </div>

          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Avantages en nature</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <Champ label="Logement (Ar)" name={`logement-${i}`}
              value={ligne.avantageLogement} onChange={(v) => majLigne(i, 'avantageLogement', v)} />
            <Champ label="Véhicule (Ar)" name={`vehicule-${i}`}
              value={ligne.avantageVehicule} onChange={(v) => majLigne(i, 'avantageVehicule', v)} />
            <Champ label="Téléphone (Ar)" name={`telephone-${i}`}
              value={ligne.avantageTelephone} onChange={(v) => majLigne(i, 'avantageTelephone', v)} />
          </div>
        </div>
      ))}

      <button type="button" onClick={ajouter} disabled={valeurs.salaries.length >= 50}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50">
        <Plus className="h-4 w-4" /> Ajouter un salarié
      </button>
    </div>
  );
}

function FormAcompte({ codeImpot }) {
  const impot = codeImpot === 'ACOMPTE_IS' ? 'l’IS' : 'l’IR';
  return (
    <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
      <p className="font-semibold">Aucune donnée à saisir.</p>
      <p className="mt-1">
        L’acompte provisionnel est calculé par le serveur à partir de {impot} de l’exercice précédent
        (ou du forfait de démarrage). Le montant, la base et le taux s’affichent en lecture seule ci-dessous.
      </p>
    </div>
  );
}

/**
 * Le CA HT de l'IR ne peut pas etre saisi sous 400 000 000 Ar.
 * Une saisie est acceptee tant qu'elle peut encore devenir valide
 * (prefixe d'un montant >= 400 000 000) ; au-dela de 9 chiffres, tout
 * montant est automatiquement superieur au seuil.
 */
function saisieCaIrAutorisee(texte) {
  const compact = String(texte).replace(/[\s\u00a0]/g, '').replace(',', '.');
  if (compact === '' || compact === '-') return true;
  if (!/^\d*(\.\d*)?$/.test(compact)) return true;
  const [entier] = compact.split('.');
  if (entier.length === 0) return true;
  if (entier.length >= 10) return true;
  if (entier.length === 9) return entier >= String(SEUIL_MINIMUM_CA_IR);
  return entier[0] >= '4';
}

function nombreCaIr(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return null;
  const compact = String(valeur).replace(/[\s\u00a0]/g, '').replace(',', '.');
  if (!/^\d*(\.\d*)?$/.test(compact) || compact === '' || compact === '.') return null;
  const n = Number(compact);
  return Number.isFinite(n) ? n : null;
}

function erreurCaIr(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return '';
  const n = Number(String(valeur).replace(/[\s\u00a0]/g, '').replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return '';
  if (n >= SEUIL_MINIMUM_CA_IR) return '';
  return 'Le chiffre d’affaires HT doit être supérieur ou égal à 400 000 000 Ar pour déclarer l’IR.';
}

function erreurNegatif(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return '';
  const nombre = Number(String(valeur).replace(/\s/g, '').replace(',', '.'));
  if (!Number.isFinite(nombre)) return 'Saisissez un montant valide.';
  if (nombre < 0) return 'Le montant ne peut pas être négatif.';
  return '';
}

function Section({ titre, children }) {
  return (
    <section className="space-y-4">
      <h3 className="border-b border-slate-200 pb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        {titre}
      </h3>
      {children}
    </section>
  );
}

function Champ({ label, name, value, onChange, onBlur, required, aide, type = 'number', min = '0', step, erreur }) {
  const estNombre = type === 'number';
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={name}
        type={type}
        min={estNombre ? min : undefined}
        step={estNombre ? (step || '0.01') : undefined}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none text-sm"
      />
      {aide && <p className="mt-1 text-xs text-slate-500">{aide}</p>}
      {erreur && <p className="mt-1 text-xs font-medium text-red-600">{erreur}</p>}
    </div>
  );
}

function Case({ label, checked, onChange, aide }) {
  return (
    <div>
      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4" />
        <span>{label}</span>
      </label>
      {aide && <p className="ml-6 mt-1 text-xs text-slate-500">{aide}</p>}
    </div>
  );
}

function SelecteurCategorie({ value, onChange, categories = CATEGORIES_ACTIVITE }) {
  return (
    <div>
      <label htmlFor="categorie-activite" className="block text-sm font-medium text-slate-700 mb-1">
        Catégorie d’activité
      </label>
      <select id="categorie-activite" value={value || ''} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/30 outline-none text-sm">
        <option value="">— Renseignée dans votre dossier —</option>
        {categories.map((c) => (
          <option key={c} value={c}>{libelleCategorie(c)}</option>
        ))}
      </select>
      <p className="mt-1 text-xs text-slate-500">
        La catégorie de votre dossier est utilisée si vous ne choisissez rien.
      </p>
    </div>
  );
}
