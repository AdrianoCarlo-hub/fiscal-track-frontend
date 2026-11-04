export function normaliser(texte) {
  return String(texte ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function termesRecherche(recherche) {
  return normaliser(recherche).split(/\s+/).filter(Boolean);
}

export function valeurChamp(item, champ) {
  if (typeof champ === 'function') return champ(item);
  return String(champ)
    .split('.')
    .reduce((valeur, cle) => (valeur == null ? '' : valeur[cle]), item);
}

export function correspondARecherche(item, recherche, champs = []) {
  const termes = termesRecherche(recherche);
  if (termes.length === 0) return true;
  const texte = normaliser(
    champs.length > 0
      ? champs.map((champ) => valeurChamp(item, champ)).join(' ')
      : JSON.stringify(item ?? {}),
  );
  return termes.every((terme) => texte.includes(terme));
}

export function filtrerListe(liste, recherche, champs = []) {
  return (Array.isArray(liste) ? liste : []).filter((item) =>
    correspondARecherche(item, recherche, champs),
  );
}

function construireIndex(texte) {
  const normalise = [];
  const index = [];
  for (let position = 0; position < texte.length; position += 1) {
    const caractere = texte[position];
    const decomposition = caractere.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (let sousIndex = 0; sousIndex < decomposition.length; sousIndex += 1) {
      normalise.push(decomposition[sousIndex].toLowerCase());
      index.push(position);
    }
  }
  return { normalise: normalise.join(''), index };
}

export function segmentsSurlignes(texte, recherche) {
  const valeur = String(texte ?? '');
  const termes = termesRecherche(recherche);
  if (!valeur || termes.length === 0) return [{ texte: valeur, surligne: false }];

  const { normalise, index } = construireIndex(valeur);
  const plages = [];
  termes.forEach((terme) => {
    let debut = normalise.indexOf(terme);
    while (debut !== -1) {
      plages.push([index[debut], index[debut + terme.length - 1] + 1]);
      debut = normalise.indexOf(terme, debut + terme.length);
    }
  });
  if (plages.length === 0) return [{ texte: valeur, surligne: false }];

  plages.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const fusionnees = [];
  plages.forEach((plage) => {
    const derniere = fusionnees[fusionnees.length - 1];
    if (derniere && plage[0] <= derniere[1]) {
      derniere[1] = Math.max(derniere[1], plage[1]);
    } else {
      fusionnees.push([...plage]);
    }
  });

  const segments = [];
  let position = 0;
  fusionnees.forEach(([debut, fin]) => {
    if (debut > position) segments.push({ texte: valeur.slice(position, debut), surligne: false });
    segments.push({ texte: valeur.slice(debut, fin), surligne: true });
    position = fin;
  });
  if (position < valeur.length) segments.push({ texte: valeur.slice(position), surligne: false });
  return segments;
}
