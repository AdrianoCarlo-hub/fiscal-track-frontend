import { describe, expect, it } from 'vitest';
import { sessionDepuisToken } from './authService';

function jeton(payload) {
  const encoder = (objet) =>
    btoa(JSON.stringify(objet)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${encoder({ alg: 'HS256', typ: 'JWT' })}.${encoder(payload)}.signature`;
}

describe('sessionDepuisToken', () => {
  it('lit le role et l identifiant dans le JWT signe', () => {
    const session = sessionDepuisToken(
      jeton({ sub: '0000000001', role: 'CONTRIBUABLE', exp: Math.floor(Date.now() / 1000) + 3600 }),
    );
    expect(session).toMatchObject({ identifiant: '0000000001', role: 'CONTRIBUABLE' });
  });

  it('refuse un jeton expire', () => {
    const session = sessionDepuisToken(
      jeton({ sub: 'AG0001', role: 'ADMIN', exp: Math.floor(Date.now() / 1000) - 60 }),
    );
    expect(session).toBeNull();
  });

  it('refuse un jeton sans role ou illisible', () => {
    expect(sessionDepuisToken(jeton({ sub: 'AG0001' }))).toBeNull();
    expect(sessionDepuisToken('jeton-invalide')).toBeNull();
    expect(sessionDepuisToken(null)).toBeNull();
  });
});
