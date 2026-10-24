/**
 * Source unique des droits d'interface par role.
 * Le backend reste l'autorite : ces droits servent a masquer ou expliquer une
 * action, jamais a la proteger.
 */
export const PERMISSIONS = {
  CONTRIBUABLE: [
    'calendrier.consulter',
    'obligation.consulter',
    'declaration.consulter',
    'declaration.deposer',
    'paiement.consulter',
    'dette.consulter',
    'compte.consulter',
    'acompte.consulter',
    'notification.consulter',
    'notification.lire',
    'profil.modifier',
  ],
  AGENT_GESTION: [
    'dossier.consulter',
    'contribuable.gerer',
    'obligation.consulter',
    'obligation.generer',
    'obligation.affecter',
    'declaration.consulter',
    'declaration.instruire',
    'notification.consulter',
    'notification.generer',
    'notification.envoyer',
    'simulateur.utiliser',
    'compte.consulter',
  ],
  AGENT_RECETTE: [
    'dossier.consulter',
    'compte.consulter',
    'paiement.consulter',
    'paiement.enregistrer',
    'dette.consulter',
    'dette.suivre',
    'notification.consulter',
    'notification.envoyer',
    'retard.consulter',
  ],
  RESPONSABLE: [
    'dossier.consulter',
    'dashboard.consulter',
    'indicateurs.consulter',
    'retard.consulter',
    'recouvrement.suivre',
    'rapport.consulter',
    'declaration.consulter',
    'declaration.instruire',
    'notification.consulter',
    'notification.generer',
    'notification.envoyer',
    'simulateur.utiliser',
    'compte.consulter',
    'paiement.consulter',
  ],
  ADMIN: ['*'],
};

export function peut(role, permission) {
  if (!role) return false;
  const droits = PERMISSIONS[role] || [];
  return droits.includes('*') || droits.includes(permission);
}

/** Masque un bouton : renvoie null si le role n'a pas le droit. */
export function siPermission(role, permission, contenu) {
  return peut(role, permission) ? contenu : null;
}
