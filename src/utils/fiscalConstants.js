import { libelle } from './referentiels';

export {
  LIBELLES_IMPOT,
  LIBELLES_STATUT_DECLARATION,
  LIBELLES_STATUT_ACOMPTE,
  CATEGORIES_ACTIVITE,
  CATEGORIES_ACTIVITE_IS,
  MOIS_FR,
  libelleImpot,
  libelleCategorie,
  libelleStatutDeclaration,
  libelleStatutAcompte,
} from './referentiels';

/** Seuil minimum de chiffre d'affaires HT pour déclarer l'IR (règle métier). */
export const SEUIL_MINIMUM_CA_IR = 400000000;

/** Libellé lisible de la période d'un acompte ("2026-AC1", "2026-DEBUT"). */
export function libellePeriodeAcompte(periode) {
  const texte = String(periode || '');
  if (texte.toUpperCase().includes('DEBUT')) return 'Acompte de démarrage';
  if (texte.toUpperCase().endsWith('AC1')) return 'Acompte AC1 (31 mars)';
  if (texte.toUpperCase().endsWith('AC2')) return 'Acompte AC2 (30 juin)';
  return texte || 'Acompte';
}

/** Code court AC1 / AC2 / DEBUT utilisé dans les messages. */
export function codePeriodeAcompte(periode) {
  const texte = String(periode || '').toUpperCase();
  if (texte.includes('DEBUT')) return 'de démarrage';
  if (texte.endsWith('AC1')) return 'AC1';
  if (texte.endsWith('AC2')) return 'AC2';
  return texte;
}

/** Échéance indicative d'un acompte (les dates serveur restent prioritaires). */
export function echeancePeriodeAcompte(periode) {
  const texte = String(periode || '');
  const annee = Number(texte.slice(0, 4));
  if (!annee) return null;
  if (texte.toUpperCase().endsWith('AC1')) return `${annee}-03-31`;
  if (texte.toUpperCase().endsWith('AC2')) return `${annee}-06-30`;
  return null;
}

export function categorieLisible(code) {
  return libelle('categorieActivite', code);
}
