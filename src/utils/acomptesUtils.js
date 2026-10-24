import { echeancePeriodeAcompte } from './fiscalConstants';

export function nombreMontant(valeur) {
  const nombre = Number(valeur);
  return Number.isFinite(nombre) ? nombre : 0;
}

/** Statut d'un acompte a partir du montant du, du montant paye et de l'echeance. */
export function statutAcompte(ligne, aujourdhui = new Date()) {
  const du = nombreMontant(ligne?.montantDu ?? ligne?.montantAcompte);
  const paye = nombreMontant(ligne?.montantPaye);
  if (du > 0 && paye >= du) return 'PAYE';
  if (paye > 0 && paye < du) return 'PARTIEL';
  const echeance = ligne?.dateLimiteReelle || ligne?.echeance || echeancePeriodeAcompte(ligne?.periode);
  if (echeance) {
    const date = new Date(`${String(echeance).slice(0, 10)}T23:59:59`);
    if (!Number.isNaN(date.getTime()) && date < aujourdhui) return 'EN_RETARD';
  }
  return 'A_PAYER';
}

export function totalAPayer(lignes) {
  return (lignes || []).reduce((total, ligne) => {
    const du = nombreMontant(ligne?.montantDu ?? ligne?.montantAcompte);
    const paye = nombreMontant(ligne?.montantPaye);
    return total + Math.max(du - paye, 0);
  }, 0);
}
