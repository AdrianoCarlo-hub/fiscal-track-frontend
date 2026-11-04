import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { Champ } from './FormControls';
import { useDebounce } from '../../hooks/useDebounce';
import { correspondARecherche, segmentsSurlignes } from '../../utils/recherche';

function valeurDe(option, getValeur) {
  return String(getValeur(option) ?? '');
}

function libelleDe(option, getLibelle) {
  return String(getLibelle(option) ?? '');
}

function TexteSurligne({ texte, recherche }) {
  return segmentsSurlignes(texte, recherche).map((segment, index) =>
    segment.surligne ? (
      <mark key={index} className="rounded-sm bg-accent/25 px-0.5 text-inherit">
        {segment.texte}
      </mark>
    ) : (
      <span key={index}>{segment.texte}</span>
    ),
  );
}

export default function Combobox({
  id,
  label,
  valeur = '',
  onChange,
  options = [],
  chargerOptions,
  placeholder = 'Rechercher…',
  obligatoire = false,
  erreur,
  aide,
  disabled = false,
  className = '',
  optionVide = null,
  permettreEffacement = true,
  getValeur = (option) => option.code ?? option.value ?? option.id,
  getLibelle = (option) => option.libelle ?? option.label ?? option.nom ?? '',
  getRecherche,
  renderOption,
  nom,
}) {
  const idGenere = useId();
  const champId = id || `combobox-${idGenere}`;
  const listeId = `${champId}-liste`;
  const racineRef = useRef(null);
  const inputRef = useRef(null);
  const [ouvert, setOuvert] = useState(false);
  const [texte, setTexte] = useState('');
  const [indexActif, setIndexActif] = useState(-1);
  const [optionsServeur, setOptionsServeur] = useState([]);
  const [pageServeur, setPageServeur] = useState(0);
  const [plusDisponible, setPlusDisponible] = useState(false);
  const [chargement, setChargement] = useState(false);
  const requeteDebouncee = useDebounce(texte, 250);
  const modeServeur = typeof chargerOptions === 'function';

  const champsRecherche = useMemo(() => {
    if (typeof getRecherche === 'function') {
      return (option) => getRecherche(option);
    }
    const champs = getRecherche || [getLibelle, getValeur];
    return (option) => champs.map((champ) => (typeof champ === 'function' ? champ(option) : option?.[champ])).join(' ');
  }, [getLibelle, getRecherche, getValeur]);

  const optionsAffichees = useMemo(() => {
    if (modeServeur) return optionsServeur;
    const liste = (Array.isArray(options) ? options : []).filter((option) =>
      correspondARecherche(champsRecherche(option), texte, [(valeur) => valeur]),
    );
    return liste.slice(0, 50);
  }, [champsRecherche, modeServeur, options, optionsServeur, texte]);

  const optionSelectionnee = useMemo(
    () =>
      (Array.isArray(options) ? options : []).find(
        (option) => valeurDe(option, getValeur) === String(valeur),
      ) || null,
    [getValeur, options, valeur],
  );
  const libelleSelectionne = optionSelectionnee ? libelleDe(optionSelectionnee, getLibelle) : '';

  const charger = useCallback(
    async (requete, page, signal) => {
      if (!modeServeur) return;
      setChargement(true);
      try {
        const resultat = await chargerOptions(requete, { page, signal });
        if (signal?.aborted) return;
        const liste = Array.isArray(resultat) ? resultat : resultat?.options || resultat?.content || [];
        setOptionsServeur((precedentes) => (page === 0 ? liste : [...precedentes, ...liste]));
        setPlusDisponible(Boolean(resultat?.hasMore ?? resultat?.totalPages > page + 1));
        setPageServeur(page);
      } catch (error) {
        if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
          setOptionsServeur([]);
          setPlusDisponible(false);
        }
      } finally {
        if (!signal?.aborted) setChargement(false);
      }
    },
    [chargerOptions, modeServeur],
  );

  useEffect(() => {
    if (!ouvert || !modeServeur) return undefined;
    const controleur = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement asynchrone annulable
    charger(requeteDebouncee, 0, controleur.signal);
    return () => controleur.abort();
  }, [charger, modeServeur, ouvert, requeteDebouncee]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const surClicExterieur = (evenement) => {
      if (!racineRef.current?.contains(evenement.target)) {
        setOuvert(false);
        setTexte('');
      }
    };
    document.addEventListener('pointerdown', surClicExterieur);
    return () => document.removeEventListener('pointerdown', surClicExterieur);
  }, [ouvert]);

  const choisir = (option) => {
    onChange?.(valeurDe(option, getValeur), option);
    setOuvert(false);
    setTexte('');
    setIndexActif(-1);
  };

  const effacer = () => {
    onChange?.('', null);
    setTexte('');
    setIndexActif(-1);
    inputRef.current?.focus();
  };

  const ouvrir = () => {
    if (disabled) return;
    setOuvert(true);
  };

  const surTouche = (evenement) => {
    if (evenement.key === 'ArrowDown') {
      evenement.preventDefault();
      if (!ouvert) {
        ouvrir();
        return;
      }
      setIndexActif((index) => Math.min(optionsAffichees.length - 1, index + 1));
    } else if (evenement.key === 'ArrowUp') {
      evenement.preventDefault();
      setIndexActif((index) => Math.max(0, index - 1));
    } else if (evenement.key === 'Enter') {
      if (ouvert && indexActif >= 0 && optionsAffichees[indexActif]) {
        evenement.preventDefault();
        choisir(optionsAffichees[indexActif]);
      }
    } else if (evenement.key === 'Escape') {
      if (ouvert) {
        evenement.preventDefault();
        setOuvert(false);
        setTexte('');
      }
    } else if (evenement.key === 'Tab') {
      setOuvert(false);
      setTexte('');
    }
  };

  const afficherListe = ouvert && !disabled;
  const afficherEffacement = permettreEffacement && String(valeur) !== '' && !disabled;
  const valeurAffichee = ouvert ? texte : libelleSelectionne;

  return (
    <Champ
      id={champId}
      label={label}
      obligatoire={obligatoire}
      erreur={erreur}
      aide={aide}
      className={className}
    >
      <div ref={racineRef} className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={champId}
          name={nom}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={afficherListe}
          aria-controls={listeId}
          aria-activedescendant={
            afficherListe && indexActif >= 0 ? `${champId}-option-${indexActif}` : undefined
          }
          aria-invalid={erreur ? 'true' : undefined}
          aria-describedby={erreur ? `${champId}-erreur` : aide ? `${champId}-aide` : undefined}
          autoComplete="off"
          disabled={disabled}
          required={obligatoire}
          value={valeurAffichee}
          placeholder={placeholder}
          onFocus={ouvrir}
          onClick={ouvrir}
          onChange={(evenement) => {
            setTexte(evenement.target.value);
            setIndexActif(-1);
            setOuvert(true);
          }}
          onKeyDown={surTouche}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-16 text-sm text-slate-800 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
          {chargement && <Loader2 className="h-4 w-4 animate-spin text-slate-500" aria-hidden="true" />}
          {afficherEffacement && (
            <button
              type="button"
              onClick={effacer}
              aria-label="Effacer la sélection"
              className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => (ouvert ? setOuvert(false) : ouvrir())}
            aria-label={ouvert ? 'Fermer les options' : 'Ouvrir les options'}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-primary"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${ouvert ? 'rotate-180' : ''}`} aria-hidden="true" />
          </button>
        </div>

        {afficherListe && (
          <div className="absolute z-40 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
            <ul
              id={listeId}
              role="listbox"
              aria-label={`${label} — options`}
              className="max-h-64 overflow-y-auto py-1"
            >
              {optionVide && (
                <li>
                  <button
                    type="button"
                    role="option"
                    aria-label={libelleDe(optionVide, getLibelle)}
                    aria-selected={String(valeur) === ''}
                    onClick={() => choisir(optionVide)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    <span>{libelleDe(optionVide, getLibelle)}</span>
                    {String(valeur) === '' && <Check className="h-4 w-4 text-accent" aria-hidden="true" />}
                  </button>
                </li>
              )}
              {optionsAffichees.map((option, index) => {
                const code = valeurDe(option, getValeur);
                const selectionnee = code === String(valeur);
                return (
                  <li key={`${code}-${index}`}>
                    <button
                      type="button"
                      id={`${champId}-option-${index}`}
                      role="option"
                      aria-label={libelleDe(option, getLibelle)}
                      aria-selected={selectionnee}
                      onClick={() => choisir(option)}
                      onMouseEnter={() => setIndexActif(index)}
                      className={[
                        'flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm',
                        index === indexActif ? 'bg-primary/5' : '',
                        selectionnee ? 'font-medium text-primary' : 'text-slate-700',
                      ].join(' ')}
                    >
                      <span className="min-w-0">
                        {renderOption ? (
                          renderOption(option, texte)
                        ) : (
                          <TexteSurligne texte={libelleDe(option, getLibelle)} recherche={texte} />
                        )}
                      </span>
                      {selectionnee && <Check className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {optionsAffichees.length === 0 && !chargement && (
              <p className="px-3 py-3 text-sm text-slate-600">
                Aucun résultat pour « {texte || 'cette recherche'} ».
              </p>
            )}
            {plusDisponible && (
              <button
                type="button"
                onClick={() => charger(requeteDebouncee, pageServeur + 1)}
                className="w-full border-t border-slate-200 px-3 py-2 text-left text-sm font-medium text-primary hover:bg-slate-50"
              >
                Afficher plus de résultats
              </button>
            )}
          </div>
        )}
      </div>
    </Champ>
  );
}
