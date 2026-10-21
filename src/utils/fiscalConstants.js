/**
 * Libelles lisibles utilises dans toute l'interface (code -> texte clair).
 */

export const LIBELLES_IMPOT = {
  IR: 'Impôt sur le revenu (IR)',
  IS: 'Impôt sur les sociétés (IS)',
  TVA: 'Taxe sur la valeur ajoutée (TVA)',
  IRSA: 'Impôt sur les revenus salariaux (IRSA)',
  ACOMPTE_IR: 'Acompte provisionnel sur l’IR',
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
