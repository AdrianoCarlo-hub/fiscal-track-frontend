import { nomFichierExport } from './formatUtils';

function echapper(valeur) {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur);
  return `"${texte.replace(/"/g, '""')}"`;
}

/**
 * Genere et telecharge un CSV (separateur point-virgule, BOM UTF-8 pour Excel).
 * @param {string} prefixe nom de fichier sans extension
 * @param {{cle: string, libelle: string, valeur?: (ligne: object) => unknown}[]} colonnes
 * @param {object[]} lignes
 */
export function exporterCsv(prefixe, colonnes, lignes) {
  const entetes = colonnes.map((colonne) => echapper(colonne.libelle)).join(';');
  const contenu = lignes.map((ligne) =>
    colonnes
      .map((colonne) => echapper(colonne.valeur ? colonne.valeur(ligne) : ligne[colonne.cle]))
      .join(';'),
  );
  const csv = `\uFEFF${[entetes, ...contenu].join('\r\n')}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichierExport(prefixe);
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}

export default exporterCsv;
