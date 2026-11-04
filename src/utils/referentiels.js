/**
 * Référentiel unique des codes techniques affichés dans l'interface.
 * Aucun écran ne doit redéfinir un libellé ou une liste de statuts.
 */

export const LIBELLES_ROLE = {
  CONTRIBUABLE: 'Contribuable',
  AGENT_GESTION: 'Agent de gestion',
  AGENT_RECETTE: 'Agent de recette',
  RESPONSABLE: 'Responsable',
  ADMIN: 'Administrateur',
};

export const LIBELLES_DIVISION = {
  ACCUEIL: 'Accueil',
  GESTION: 'Gestion',
  RECETTE: 'Recette',
  CONTROLE: 'Contrôle',
  DIRECTEUR: 'Direction',
};

export const LIBELLES_STATUT_DECLARATION = {
  ATTENTE: 'À déposer',
  DEPOSE: 'Déposée',
  RETARD: 'En retard',
  TITRE_EMIS: 'Titre de recouvrement émis',
  ATD_LANCE: 'Recouvrement forcé engagé',
  SOLDE: 'Soldée',
};

export const LIBELLES_STATUT_VALIDATION = {
  EN_ATTENTE_VALIDATION: 'En attente de validation',
  VALIDEE: 'Validée',
  REJETEE: 'Rejetée',
};

export const LIBELLES_STATUT_RECOUVREMENT = {
  NON_SOLDE: 'Non soldé',
  PARTIEL: 'Partiellement soldé',
  SOLDE: 'Soldé',
  TITRE_EMIS: 'Titre de recouvrement émis',
  ATD_LANCE: 'Recouvrement forcé engagé',
};

export const LIBELLES_STATUT_ENVOI = {
  EN_ATTENTE: "En attente d'envoi",
  ENVOYE: 'Envoyée',
  ECHEC: 'Échec (nouvelle tentative possible)',
  ECHEC_DEFINITIF: 'Échec définitif',
  IGNORE_PREFERENCE: 'Ignorée (préférence du contribuable)',
};

export const LIBELLES_CANAL = {
  EMAIL: 'E-mail',
  SMS: 'SMS',
  PORTAIL: 'Portail',
};

export const LIBELLES_TYPE_RELANCE = {
  'J-7': "Rappel d'échéance (J-7)",
  'J-1': "Rappel d'échéance (J-1)",
  'J+1': 'Avis de retard (J+1)',
  'J+8': 'Lettre de relance (J+8)',
  DECLARATION_VALIDEE: 'Déclaration validée',
  DECLARATION_REJETEE: 'Déclaration rejetée',
  PAIEMENT_RECU: 'Paiement reçu',
  PENALITE_APPLIQUEE: 'Pénalité appliquée',
  AMENDE_APPLIQUEE: 'Amende appliquée',
  MESSAGE_LIBRE: 'Message libre',
};

export const LIBELLES_MODE_PAIEMENT = {
  ESPECES: 'Espèces',
  CHEQUE: 'Chèque',
  VIREMENT: 'Virement bancaire',
  MOBILE_MONEY: 'Mobile money',
  CARTE: 'Carte bancaire',
};

export const LIBELLES_PERIODICITE = {
  MENSUELLE: 'Mensuelle',
  TRIMESTRIELLE: 'Trimestrielle',
  ANNUELLE: 'Annuelle',
  SEMESTRIELLE: 'Semestrielle',
  PONCTUELLE: 'Ponctuelle',
};

export const LIBELLES_FORME_JURIDIQUE = {
  ENTREPRISE_INDIVIDUELLE: 'Entreprise individuelle',
  SARL: 'SARL',
  SA: 'SA',
  SAS: 'SAS',
  SNC: 'SNC',
  SCS: 'SCS',
  GIE: 'GIE',
  ASSOCIATION: 'Association',
  ETABLISSEMENT_PUBLIC: 'Établissement public',
  COOPERATIVE: 'Coopérative',
  SUCCURSALE: 'Succursale',
  AUTRE: 'Autre',
};

export const LIBELLES_REGIME_IMPOSITION = {
  REEL: 'Régime réel',
  SYNTHETIQUE: 'Régime synthétique',
};

export const LIBELLES_OBLIGATION_COMPTABLE = {
  COMPLET: 'Comptabilité complète',
  SMT: 'Système minimal de trésorerie (SMT)',
  RECETTES_DEPENSES: 'Recettes et dépenses',
};

export const LIBELLES_STATUT_ACTIVITE = {
  ACTIF: 'Actif',
  VEILLEUSE: 'En veilleuse',
  RADIE: 'Radié',
  SUSPENDU: 'Suspendu',
};

export const LIBELLES_CATEGORIE_ACTIVITE = {
  AGRICOLE: 'Agricole',
  ARTISANAL: 'Artisanal',
  INDUSTRIEL: 'Industriel',
  MINIER: 'Minier',
  HOTELIER: 'Hôtelier',
  TOURISTIQUE: 'Touristique',
  COMMERCE: 'Commerce',
  SERVICE: 'Service',
  CARBURANT_DETAIL: 'Carburant au détail',
  EDUCATION: 'Éducation',
  SANTE: 'Santé',
  ASSOCIE_GERANT_SARL: 'Associé gérant de SARL',
  OSBL: 'Organisme sans but lucratif',
  AUTRE: 'Autre',
};

export const LIBELLES_SITUATION_IRSA = {
  CELIBATAIRE: 'Célibataire',
  MARIE: 'Marié(e)',
  DIVORCE: 'Divorcé(e)',
  VEUF: 'Veuf / veuve',
};

export const LIBELLES_NIVEAU_MAJORATION_TVA = {
  NORMAL: 'Taux normal',
  REDUIT: 'Taux réduit',
  EXONERE: 'Exonéré',
};

export const LIBELLES_STATUT_ACOMPTE = {
  A_PAYER: 'À payer',
  PARTIEL: 'Partiellement payé',
  PAYE: 'Payé',
  EN_RETARD: 'En retard',
};

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

export const CATEGORIES_ACTIVITE = Object.keys(LIBELLES_CATEGORIE_ACTIVITE);

export const CATEGORIES_ACTIVITE_IS = [
  'AGRICOLE',
  'ELEVEUR',
  'ARTISAN',
  'GARGOTIER',
  'PETIT_COMMERCANT',
  'COMMERCANT',
  'HOTELIER',
  'PRESTATAIRE',
  'PROFESSION_LIBERALE',
  'ACTIVITES_MULTIPLES',
];

export const MOIS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export const TAILLES_PAGE = [10, 25, 50];

const DICTIONNAIRES = {
  role: LIBELLES_ROLE,
  division: LIBELLES_DIVISION,
  statutDeclaration: LIBELLES_STATUT_DECLARATION,
  statutValidation: LIBELLES_STATUT_VALIDATION,
  statutRecouvrement: LIBELLES_STATUT_RECOUVREMENT,
  statutEnvoi: LIBELLES_STATUT_ENVOI,
  canal: LIBELLES_CANAL,
  typeRelance: LIBELLES_TYPE_RELANCE,
  modePaiement: LIBELLES_MODE_PAIEMENT,
  periodicite: LIBELLES_PERIODICITE,
  formeJuridique: LIBELLES_FORME_JURIDIQUE,
  regimeImposition: LIBELLES_REGIME_IMPOSITION,
  obligationComptable: LIBELLES_OBLIGATION_COMPTABLE,
  statutActivite: LIBELLES_STATUT_ACTIVITE,
  categorieActivite: LIBELLES_CATEGORIE_ACTIVITE,
  situationIrsa: LIBELLES_SITUATION_IRSA,
  niveauMajorationTva: LIBELLES_NIVEAU_MAJORATION_TVA,
  statutAcompte: LIBELLES_STATUT_ACOMPTE,
  impot: LIBELLES_IMPOT,
};

export const REFERENTIELS = DICTIONNAIRES;

export function libelle(famille, code) {
  if (code === null || code === undefined || code === '') return '—';
  const dictionnaire = DICTIONNAIRES[famille];
  if (!dictionnaire) return String(code);
  return dictionnaire[code] || String(code).replaceAll('_', ' ').toLowerCase();
}

export function options(famille) {
  const dictionnaire = DICTIONNAIRES[famille] || {};
  return Object.entries(dictionnaire)
    .map(([code, texte]) => ({ code, libelle: texte }))
    .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'));
}

export function libelleImpot(code) {
  return LIBELLES_IMPOT[code] || code || '—';
}

export function libelleCategorie(categorie) {
  if (!categorie) return '';
  return libelle('categorieActivite', categorie);
}

export function libelleStatutDeclaration(statut) {
  return LIBELLES_STATUT_DECLARATION[statut] || statut || '—';
}

export function libelleStatutAcompte(statut) {
  return LIBELLES_STATUT_ACOMPTE[statut] || statut || '—';
}

export function varianteStatut(code) {
  const danger = [
    'RETARD',
    'REJETEE',
    'ECHEC',
    'ECHEC_DEFINITIF',
    'NON_SOLDE',
    'ATD_LANCE',
    'EN_RETARD',
    'RADIE',
  ];
  const succes = ['VALIDEE', 'ENVOYE', 'SOLDE', 'PAYE', 'ACTIF'];
  const avertissement = [
    'ATTENTE',
    'EN_ATTENTE',
    'EN_ATTENTE_VALIDATION',
    'PARTIEL',
    'TITRE_EMIS',
    'VEILLEUSE',
    'A_PAYER',
    'SUSPENDU',
  ];
  if (danger.includes(code)) return 'danger';
  if (succes.includes(code)) return 'success';
  if (avertissement.includes(code)) return 'warning';
  return 'info';
}
