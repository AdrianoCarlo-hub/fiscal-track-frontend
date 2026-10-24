/**
 * Libelles lisibles utilises dans toute l'interface (code -> texte clair).
 */

/** Seuil minimum de chiffre d'affaires HT pour declarer l'IR (regle metier). */
export const SEUIL_MINIMUM_CA_IR = 400000000;

export const LIBELLES_IMPOT = {
  IR: 'Impôt sur le revenu (IR)',
  IS: 'Impôt sur les sociétés (IS)',
  TVA: 'Taxe sur la valeur ajoutée (TVA)',
  IRSA: 'Impôt sur les revenus salariaux (IRSA)',
  ACOMPTE_IR: 'Acompte provisionnel sur l’IR',
  ACOMPTE_IS: 'Acompte provisionnel sur l’IS',
  IRCM: 'Impôt sur le revenu des commerçants miniers (IRCM)',
  IPVI: 'Impôt provisionnel sur les valeurs immobilières (IPVI)',
  IMP: 'Impôt minimum provisionnel (IMP)',
};

export function libelleImpot(code) {
  return LIBELLES_IMPOT[code] || code;
}

/** Categories d'activite (miroir du dossier contribuable, enum backend). */
export const CATEGORIES_ACTIVITE = [
  'AGRICOLE', 'ARTISANAL', 'INDUSTRIEL', 'MINIER', 'HOTELIER',
  'TOURISTIQUE', 'COMMERCE', 'SERVICE', 'CARBURANT_DETAIL',
  'EDUCATION', 'SANTE', 'ASSOCIE_GERANT_SARL', 'OSBL', 'AUTRE',
];

/**
 * Categories IS telles qu'attendues par le moteur de calcul (CDI 01.02.05)
 * pour appliquer le minimum categoriel. Les codes sont envoyes tels quels au
 * backend (aucun libelle).
 */
export const CATEGORIES_ACTIVITE_IS = [
  'AGRICOLE', 'ELEVEUR',
  'ARTISAN', 'GARGOTIER', 'PETIT_COMMERCANT',
  'COMMERCANT', 'HOTELIER', 'PRESTATAIRE',
  'PROFESSION_LIBERALE', 'ACTIVITES_MULTIPLES',
];


export function libelleCategorie(categorie) {
  if (!categorie) return '';
  const mots = categorie.split('_');
  return mots.map((m) => m.charAt(0) + m.slice(1).toLowerCase()).join(' ');
}

export const LIBELLES_STATUT_DECLARATION = {
  ATTENTE: 'À déposer',
  DEPOSE: 'Déposée',
  RETARD: 'En retard',
  TITRE_EMIS: 'Titre de recouvrement émis',
  ATD_LANCE: 'Recouvrement forcé engagé',
  SOLDE: 'Soldée',
};

export function libelleStatutDeclaration(statut) {
  return LIBELLES_STATUT_DECLARATION[statut] || statut;
}

export const MOIS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];


/** Statuts d'un acompte obligatoire (calcules a partir des paiements). */
export const LIBELLES_STATUT_ACOMPTE = {
  A_PAYER: 'À payer',
  PARTIEL: 'Partiellement payé',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
};

export function libelleStatutAcompte(statut) {
  return LIBELLES_STATUT_ACOMPTE[statut] || statut || '—';
}

/** Libelle lisible de la periode d'un acompte ("2026-AC1", "2026-DEBUT"). */
export function libellePeriodeAcompte(periode) {
  const texte = String(periode || '');
  if (texte.toUpperCase().includes('DEBUT')) return 'Acompte de démarrage';
  if (texte.toUpperCase().endsWith('AC1')) return 'Acompte AC1 (31 mars)';
  if (texte.toUpperCase().endsWith('AC2')) return 'Acompte AC2 (30 juin)';
  return texte || 'Acompte';
}

/** Code court AC1 / AC2 / DEBUT utilise dans les messages. */
export function codePeriodeAcompte(periode) {
  const texte = String(periode || '').toUpperCase();
  if (texte.includes('DEBUT')) return 'de démarrage';
  if (texte.endsWith('AC1')) return 'AC1';
  if (texte.endsWith('AC2')) return 'AC2';
  return texte;
}

/** Echeance indicative d'un acompte (les dates serveur restent prioritaires). */
export function echeancePeriodeAcompte(periode) {
  const texte = String(periode || '');
  const annee = Number(texte.slice(0, 4));
  if (!annee) return null;
  if (texte.toUpperCase().endsWith('AC1')) return `${annee}-03-31`;
  if (texte.toUpperCase().endsWith('AC2')) return `${annee}-06-30`;
  return null;
}
