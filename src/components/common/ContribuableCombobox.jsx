import Combobox from '../ui/Combobox';
import contribuableService from '../../services/contribuableService';
import { segmentsSurlignes } from '../../utils/recherche';

const TAILLE_PAGE = 10;

async function rechercherContribuables(requete, { page = 0, signal } = {}) {
  const resultat = await contribuableService.rechercherPagine(requete, page, TAILLE_PAGE, signal);
  const contenu = Array.isArray(resultat) ? resultat : resultat?.content || [];
  const totalPages = resultat?.totalPages ?? 1;
  return {
    options: contenu,
    hasMore: page + 1 < totalPages,
  };
}

export default function ContribuableCombobox(props) {
  return (
    <Combobox
      {...props}
      chargerOptions={rechercherContribuables}
      getValeur={(contribuable) => contribuable.nif}
      getLibelle={(contribuable) =>
        [contribuable.raisonSociale, contribuable.nif].filter(Boolean).join(' — ')
      }
      getRecherche={[
        (contribuable) => contribuable.nif,
        (contribuable) => contribuable.raisonSociale,
        (contribuable) => contribuable.communeContribuable,
      ]}
      placeholder={props.placeholder || 'Rechercher par NIF ou raison sociale…'}
      renderOption={(contribuable, recherche) => {
        const segments = segmentsSurlignes(
          [contribuable.raisonSociale, contribuable.nif].filter(Boolean).join(' — '),
          recherche,
        );
        return (
          <span>
            {segments.map((segment, index) =>
              segment.surligne ? (
                <mark key={index} className="rounded-sm bg-accent/25 px-0.5 text-inherit">
                  {segment.texte}
                </mark>
              ) : (
                <span key={index}>{segment.texte}</span>
              ),
            )}
            {contribuable.communeContribuable && (
              <span className="mt-0.5 block text-xs text-slate-500">{contribuable.communeContribuable}</span>
            )}
          </span>
        );
      }}
    />
  );
}
