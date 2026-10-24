import { describe, expect, it } from 'vitest';
import { libelle, options, varianteStatut } from './libelles';

describe('libelles', () => {
  it('traduit les codes techniques en francais accentue', () => {
    expect(libelle('statutValidation', 'VALIDEE')).toBe('Validée');
    expect(libelle('statutValidation', 'EN_ATTENTE_VALIDATION')).toBe('En attente de validation');
    expect(libelle('canal', 'EMAIL')).toBe('E-mail');
    expect(libelle('statutRecouvrement', 'ATD_LANCE')).toBe('Recouvrement forcé engagé');
  });

  it('affiche un tiret pour une valeur absente', () => {
    expect(libelle('canal', null)).toBe('—');
    expect(libelle('canal', '')).toBe('—');
  });

  it('ne renvoie jamais un code avec des underscores', () => {
    const texte = libelle('canal', 'CODE_INCONNU');
    expect(texte).not.toContain('_');
    expect(texte).toBe('code inconnu');
  });

  it('trie les options par libelle francais', () => {
    const liste = options('canal');
    expect(liste.map((element) => element.libelle)).toEqual(['E-mail', 'Portail', 'SMS']);
  });

  it('choisit une variante de couleur stable par statut', () => {
    expect(varianteStatut('VALIDEE')).toBe('success');
    expect(varianteStatut('RETARD')).toBe('danger');
    expect(varianteStatut('EN_ATTENTE')).toBe('warning');
    expect(varianteStatut('INCONNU')).toBe('info');
  });
});
