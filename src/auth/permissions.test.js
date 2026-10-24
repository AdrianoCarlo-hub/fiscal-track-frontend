import { describe, expect, it } from 'vitest';
import { peut, siPermission } from './permissions';

describe('permissions', () => {
  it('autorise le contribuable a deposer et consulter ses donnees', () => {
    expect(peut('CONTRIBUABLE', 'declaration.deposer')).toBe(true);
    expect(peut('CONTRIBUABLE', 'notification.lire')).toBe(true);
  });

  it('interdit au contribuable les actions reservees aux agents', () => {
    expect(peut('CONTRIBUABLE', 'declaration.instruire')).toBe(false);
    expect(peut('CONTRIBUABLE', 'contribuable.gerer')).toBe(false);
  });

  it('donne tous les droits a l administrateur', () => {
    expect(peut('ADMIN', 'declaration.instruire')).toBe(true);
    expect(peut('ADMIN', 'rapport.consulter')).toBe(true);
    expect(peut('ADMIN', 'nimporte.quelle.action')).toBe(true);
  });

  it('respecte le perimetre de la recette', () => {
    expect(peut('AGENT_RECETTE', 'paiement.enregistrer')).toBe(true);
    expect(peut('AGENT_RECETTE', 'contribuable.gerer')).toBe(false);
  });

  it('retourne null quand le droit est absent', () => {
    expect(siPermission('CONTRIBUABLE', 'paiement.enregistrer', 'bouton')).toBeNull();
    expect(siPermission('ADMIN', 'paiement.enregistrer', 'bouton')).toBe('bouton');
  });
});
