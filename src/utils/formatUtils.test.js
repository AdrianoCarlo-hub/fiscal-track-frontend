import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatEcheanceRelative,
  formatMontant,
  formatMontantCourt,
  formatTaux,
  joursAvantEcheance,
} from './formatUtils';

const sansEspacesInsecables = (texte) => texte.replace(/\s/g, ' ');

describe('formatUtils', () => {
  it('formate un montant en ariary avec separateur de milliers', () => {
    expect(sansEspacesInsecables(formatMontant(1234000))).toBe('1 234 000 Ar');
    expect(formatMontant(0)).toBe('0 Ar');
    expect(formatMontant(null)).toBe('0 Ar');
  });

  it('formate un montant court pour les cartes de synthese', () => {
    expect(sansEspacesInsecables(formatMontantCourt(2500000))).toBe('2,5 M Ar');
  });

  it('formate une date ISO sans decalage de fuseau', () => {
    expect(formatDate('2026-03-05')).toBe('05/03/2026');
    expect(formatDate(null)).toBe('—');
  });

  it('convertit un taux decimal en pourcentage', () => {
    expect(formatTaux(0.2)).toBe('20 %');
    expect(formatTaux(0.075)).toBe('7,5 %');
  });

  it('calcule les jours restants avant echeance', () => {
    const reference = new Date('2026-03-05T10:00:00');
    expect(joursAvantEcheance('2026-03-10', reference)).toBe(5);
    expect(formatEcheanceRelative('2026-03-05', reference)).toBe("Aujourd'hui");
    expect(formatEcheanceRelative('2026-03-02', reference)).toBe('En retard de 3 jours');
    expect(formatEcheanceRelative('2026-03-07', reference)).toBe('Dans 2 jours');
  });
});
