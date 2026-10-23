/**
 * Formatage des dates, montants et taux. Une seule implementation pour toute
 * l'application : les pages ne formatent jamais a la main.
 */

const NOMBRE_MONTANT = new Intl.NumberFormat('fr-FR', {
  style: 'decimal',
  maximumFractionDigits: 0,
});

const NOMBRE_DECIMAL = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
});

export function estNombre(valeur) {
  if (valeur === null || valeur === undefined || valeur === '') return false;
  return Number.isFinite(Number(valeur));
}

/** 1234000 -> "1 234 000 Ar" */
export function formatMontant(montant) {
  if (!estNombre(montant)) return '0 Ar';
  return `${NOMBRE_MONTANT.format(Number(montant))} Ar`;
}

/** 1234000 -> "1,23 M Ar" (pour les cartes de synthese). */
export function formatMontantCourt(montant) {
  if (!estNombre(montant)) return '0 Ar';
  const valeur = Number(montant);
  if (Math.abs(valeur) >= 1_000_000_000) {
    return `${NOMBRE_DECIMAL.format(valeur / 1_000_000_000)} Md Ar`;
  }
  if (Math.abs(valeur) >= 1_000_000) {
    return `${NOMBRE_DECIMAL.format(valeur / 1_000_000)} M Ar`;
  }
  return formatMontant(valeur);
}

export function formatNombre(valeur) {
  if (!estNombre(valeur)) return '0';
  return NOMBRE_MONTANT.format(Number(valeur));
}

/** Date ISO -> "12/03/2026" (sans decalage de fuseau). */
export function formatDate(date) {
  if (!date) return '—';
  const texte = String(date);
  const jour = texte.slice(0, 10);
  const correspondance = jour.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (correspondance) {
    return `${correspondance[3]}/${correspondance[2]}/${correspondance[1]}`;
  }
  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return '—';
  return valeur.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Date ISO -> "12/03/2026 à 14:05" */
export function formatDateHeure(date) {
  if (!date) return '—';
  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return '—';
  return `${valeur.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })} à ${valeur.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

/** Alias historique utilise par les pages existantes. */
export const formatDateTime = formatDateHeure;

/** 0.25 -> "25 %" */
export function formatTaux(taux) {
  if (!estNombre(taux)) return '—';
  return `${NOMBRE_DECIMAL.format(Number(taux) * 100)} %`;
}

/** Taux deja exprime en pourcentage (25 -> "25 %"). */
export function formatPourcentage(valeur) {
  if (!estNombre(valeur)) return '—';
  return `${NOMBRE_DECIMAL.format(Number(valeur))} %`;
}

/** Nombre de jours entre aujourd'hui et une date (negatif = en retard). */
export function joursAvantEcheance(echeance, aujourdhui = new Date()) {
  if (!echeance) return null;
  const cible = new Date(`${String(echeance).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(cible.getTime())) return null;
  const reference = new Date(aujourdhui);
  reference.setHours(0, 0, 0, 0);
  return Math.round((cible.getTime() - reference.getTime()) / 86_400_000);
}

/** "Dans 5 jours", "Aujourd'hui", "En retard de 3 jours". */
export function formatEcheanceRelative(echeance, aujourdhui = new Date()) {
  const jours = joursAvantEcheance(echeance, aujourdhui);
  if (jours === null) return '—';
  if (jours === 0) return "Aujourd'hui";
  if (jours > 0) return `Dans ${jours} jour${jours > 1 ? 's' : ''}`;
  const retard = Math.abs(jours);
  return `En retard de ${retard} jour${retard > 1 ? 's' : ''}`;
}

export function tronquer(texte, longueur = 80) {
  if (!texte) return '';
  const valeur = String(texte);
  return valeur.length > longueur ? `${valeur.slice(0, longueur - 1)}…` : valeur;
}

/** Nom de fichier d'export : "declarations-2026-03-12.csv" */
export function nomFichierExport(prefixe, extension = 'csv') {
  const date = new Date().toISOString().slice(0, 10);
  return `${prefixe}-${date}.${extension}`;
}

/* --- Compatibilite avec les ecrans historiques (retires au fil de la refonte) --- */

export function libelleStatutRecouvrement(statut) {
  const libelles = {
    NON_SOLDE: 'Non soldé',
    PARTIEL: 'Partiellement soldé',
    SOLDE: 'Soldé',
    TITRE_EMIS: 'Titre de recouvrement émis',
    ATD_LANCE: 'Recouvrement forcé engagé',
  };
  return libelles[statut] || '—';
}

export function getStatutAcompteColor(statut) {
  const couleurs = {
    PAYE: 'bg-green-100 text-green-700',
    PARTIEL: 'bg-yellow-100 text-yellow-700',
    A_PAYER: 'bg-sky-100 text-sky-700',
    EN_RETARD: 'bg-red-100 text-red-700',
  };
  return couleurs[statut] || 'bg-slate-100 text-slate-700';
}

export function getStatutColor(statut) {
  const couleurs = {
    ACTIF: 'bg-green-100 text-green-700',
    VEILLEUSE: 'bg-yellow-100 text-yellow-700',
    RADIE: 'bg-slate-100 text-slate-700',
    ATTENTE: 'bg-yellow-100 text-yellow-700',
    DEPOSE: 'bg-green-100 text-green-700',
    RETARD: 'bg-red-100 text-red-700',
    SOLDE: 'bg-green-100 text-green-700',
    PARTIEL: 'bg-yellow-100 text-yellow-700',
    NON_SOLDE: 'bg-red-100 text-red-700',
    TITRE_EMIS: 'bg-orange-100 text-orange-700',
    ATD_LANCE: 'bg-red-100 text-red-700',
    EN_ATTENTE_VALIDATION: 'bg-yellow-100 text-yellow-700',
    VALIDEE: 'bg-green-100 text-green-700',
    REJETEE: 'bg-red-100 text-red-700',
    ENVOYE: 'bg-green-100 text-green-700',
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700',
    ECHEC: 'bg-red-100 text-red-700',
  };
  return couleurs[statut] || 'bg-slate-100 text-slate-700';
}
