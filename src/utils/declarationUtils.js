/**
 * Utilitaires des formulaires de declaration (partie A « formulaires »).
 * Les valeurs sont stockees en chaine de caracteres : l'utilisateur peut
 * effacer un champ, le serveur reste seul maitre du montant final.
 */

export const VALEURS_INITIALES_PAR_TYPE = {
  IS: {
    caBrut: '',
    adherentCga: false,
    achatsConformes: '',
    chargesSalariales: '',
    acomptes: '',
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
    acomptes: '',
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
};

export function valeursInitiales(codeImpot) {
  const modele = VALEURS_INITIALES_PAR_TYPE[codeImpot] || {};
  return JSON.parse(JSON.stringify(modele));
}

function nombre(valeur) {
  if (valeur === '' || valeur === null || valeur === undefined) return null;
  const n = Number(valeur);
  return Number.isNaN(n) ? null : n;
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
        acomptes: nombre(v.acomptes),
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
        acomptes: nombre(v.acomptes),
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
  const renseigne = (x) => x !== '' && x !== null && x !== undefined && !Number.isNaN(Number(x));
  switch (codeImpot) {
    case 'IS':
      return renseigne(v.caBrut) && Number(v.caBrut) >= 0;
    case 'TVA':
      return renseigne(v.caLocal) && Number(v.caLocal) >= 0;
    case 'IR':
      return renseigne(v.caHT) && Number(v.caHT) >= 0;
    case 'IRSA':
      return (v.salaries || []).length > 0
        && v.salaries.every((l) => renseigne(l.salaireBrut) && Number(l.salaireBrut) >= 0);
    default:
      return true;
  }
}
