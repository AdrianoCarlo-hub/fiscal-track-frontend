/**
 * Utilitaires des formulaires de declaration (partie A « formulaires »).
 * Les valeurs sont stockees en chaine de caracteres : l'utilisateur peut
 * effacer un champ, le serveur reste seul maitre du montant final.
 */

import { SEUIL_MINIMUM_CA_IR } from './fiscalConstants';

export const VALEURS_INITIALES_PAR_TYPE = {
  IS: {
    caBrut: '',
    adherentCga: false,
    achatsConformes: '',
    chargesSalariales: '',
    acomptesDouane: '',
    acomptesMarchesPublics: '',
    categorieActiviteIs: '',
  },
  TVA: {
    caLocal: '',
    caExportation: '',
    gazButane: false,
    tvaDeductibleBiens: '',
    tvaDeductibleImmobilisations: '',
    creditTvaAnterieur: '',
  },
  IR: {
    caHT: '',
    chargesDeductibles: '',
    reintegrations: '',
    deductions: '',
    acomptesDouane: '',
    acomptesMarchesPublics: '',
    categorieActivite: '',
    moisActifs: '',
    deficits: [],
  },
  IRSA: {
    salaries: [{
      nom: '', salaireBrut: '', cotisationsSociales: '',
      avantageLogement: '', avantageVehicule: '', avantageTelephone: '',
      personnesCharge: '',
    }],
  },
  ACOMPTE_IR: {},
  ACOMPTE_IS: {},
};

export function valeursInitiales(codeImpot) {
  const modele = VALEURS_INITIALES_PAR_TYPE[codeImpot] || {};
  return JSON.parse(JSON.stringify(modele));
}

/**
 * Convertit une saisie en nombre sans perte de precision.
 * Accepte les espaces (dont insecables) comme separateur de milliers et la
 * virgule comme separateur decimal. Le resultat est arrondi au centime, ce
 * qui garantit qu'un montant entier saisi (ex. 5000000) est transmis tel quel.
 */
function nombre(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return null;
  const texte = String(valeur)
    .replace(/[\s\u00a0\u202f]/g, '')
    .replace(',', '.');
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(texte)) return null;
  const n = Number(texte);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100) / 100;
}

function nombreRequis(valeur) {
  const n = nombre(valeur);
  return n === null ? 0 : n;
}

/** Champs envoyes au serveur pour le type d'impot de l'obligation. */
export function champsSaisis(codeImpot, valeurs) {
  const v = valeurs || {};
  switch (codeImpot) {
    case 'IS':
      return {
        caBrut: nombre(v.caBrut),
        adherentCga: !!v.adherentCga,
        achatsConformes: nombre(v.achatsConformes),
        chargesSalariales: nombre(v.chargesSalariales),
        acomptesDouane: nombre(v.acomptesDouane),
        acomptesMarchesPublics: nombre(v.acomptesMarchesPublics),
        categorieActiviteIs: v.categorieActiviteIs || null,
      };
    case 'TVA':
      return {
        caLocal: nombre(v.caLocal),
        caExportation: nombre(v.caExportation),
        gazButane: !!v.gazButane,
        tvaDeductibleBiens: nombre(v.tvaDeductibleBiens),
        tvaDeductibleImmobilisations: nombre(v.tvaDeductibleImmobilisations),
        creditTvaAnterieur: nombre(v.creditTvaAnterieur),
      };
    case 'IR':
      return {
        caHT: nombre(v.caHT),
        chargesDeductibles: nombre(v.chargesDeductibles),
        reintegrations: nombre(v.reintegrations),
        deductions: nombre(v.deductions),
        acomptesDouane: nombre(v.acomptesDouane),
        acomptesMarchesPublics: nombre(v.acomptesMarchesPublics),
        categorieActivite: v.categorieActivite || null,
        moisActifs: nombre(v.moisActifs),
        deficits: (v.deficits || []).map((d) => ({
          anneeOrigine: nombreRequis(d.anneeOrigine),
          montant: nombre(d.montant),
        })),
      };
    case 'IRSA':
      return {
        salaries: (v.salaries || []).map((l) => ({
          nom: l.nom || null,
          salaireBrut: nombre(l.salaireBrut),
          cotisationsSociales: nombre(l.cotisationsSociales),
          avantageLogement: nombre(l.avantageLogement),
          avantageVehicule: nombre(l.avantageVehicule),
          avantageTelephone: nombre(l.avantageTelephone),
          personnesCharge: nombre(l.personnesCharge),
        })),
      };
    default:
      return {};
  }
}

/** Corps envoye a l'API (previsualisation ou depot). */
export function construireCorps(codeImpot, idObligation, valeurs, impotCalcule) {
  return {
    idObligationFiscale: Number(idObligation),
    impotPrincipalCalcule: impotCalcule ?? 0,
    ...champsSaisis(codeImpot, valeurs),
  };
}

/** Vrai si tous les champs obligatoires du type sont renseignes. */
export function pretPourPrevisualisation(codeImpot, valeurs) {
  const v = valeurs || {};
  const renseigne = (x) => nombre(x) !== null;
  switch (codeImpot) {
    case 'IS':
      return renseigne(v.caBrut) && nombre(v.caBrut) >= 0;
    case 'TVA':
      return renseigne(v.caLocal) && nombre(v.caLocal) >= 0;
    case 'IR':
      return renseigne(v.caHT) && nombre(v.caHT) >= SEUIL_MINIMUM_CA_IR;
    case 'IRSA':
      return (v.salaries || []).length > 0
        && v.salaries.every((l) => renseigne(l.salaireBrut) && nombre(l.salaireBrut) >= 0);
    default:
      return true;
  }
}


/**
 * Impot du avant deduction des acomptes et du credit, a partir du resultat
 * du serveur. IR : MAX(theorique, minimum). IS : MAX(theorique - reductions,
 * plancher).
 */
export function impotAvantAcomptes(resultat, codeImpot) {
  if (!resultat) return 0;
  const nombre = (valeur) => {
    const n = Number(valeur);
    return Number.isFinite(n) ? n : 0;
  };
  const theorique = nombre(resultat.montantBrut);
  const minimum = nombre(resultat.montantMinimum);
  if (codeImpot === 'IS') {
    return Math.max(theorique - nombre(resultat.reductions), minimum);
  }
  return Math.max(theorique, minimum);
}

/** Acomptes verses (paiements + douane + marches publics) depuis detailAcomptes. */
export function acomptesVerses(detail) {
  const nombre = (valeur) => {
    const n = Number(valeur);
    return Number.isFinite(n) ? n : 0;
  };
  return nombre(detail?.acomptesPayes) + nombre(detail?.autresAcomptes);
}
