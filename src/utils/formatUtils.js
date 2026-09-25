/**
 * Utilitaires de formatage (dates, montants, statuts).
 */

export function formatMontant(montant) {
  if (montant === null || montant === undefined) return '0 Ar';
  return new Intl.NumberFormat('fr-MG', {
    style: 'currency',
    currency: 'MGA',
    maximumFractionDigits: 0,
  }).format(montant);
}

export function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatutColor(statut) {
  const colors = {
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
  return colors[statut] || 'bg-slate-100 text-slate-700';
}
