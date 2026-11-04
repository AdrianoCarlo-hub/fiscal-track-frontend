import { useEffect, useRef, useState } from 'react';
import { Champ } from './FormControls';

function formaterNombre(nombre) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 2 }).format(nombre);
}

function formaterSaisie(texte) {
  const nettoye = String(texte ?? '')
    .replace(/\s/g, '')
    .replace(',', '.');
  if (!/^-?\d*\.?\d{0,2}$/.test(nettoye)) return null;

  const negatif = nettoye.startsWith('-');
  const sansSigne = nettoye.replace('-', '');
  const [partieEntiere, partieDecimale] = sansSigne.split('.');
  const entiere = (partieEntiere || '').replace(/^0+(?=\d)/, '');
  const groupee = entiere.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const separateur = sansSigne.includes('.') ? ',' : '';
  return `${negatif ? '-' : ''}${groupee}${separateur}${partieDecimale ?? ''}`;
}

function nombreDepuisSaisie(texte) {
  const nettoye = String(texte ?? '')
    .replace(/\s/g, '')
    .replace(',', '.');
  if (nettoye === '' || nettoye === '-') return null;
  const nombre = Number(nettoye);
  return Number.isFinite(nombre) ? nombre : null;
}

export default function MontantInput({
  id,
  label,
  valeur,
  onChange,
  obligatoire = false,
  erreur,
  aide,
  className = '',
  disabled = false,
  placeholder = '0',
  nom,
  onBlur,
}) {
  const inputRef = useRef(null);
  const [texte, setTexte] = useState(() =>
    valeur === null || valeur === undefined || valeur === '' ? '' : formaterNombre(Number(valeur)),
  );

  useEffect(() => {
    if (document.activeElement === inputRef.current) return;
    setTexte(
      valeur === null || valeur === undefined || valeur === ''
        ? ''
        : formaterNombre(Number(valeur)),
    );
  }, [valeur]);

  const surChangement = (evenement) => {
    const formate = formaterSaisie(evenement.target.value);
    if (formate === null) return;
    setTexte(formate);
    onChange?.(nombreDepuisSaisie(formate));
  };

  const surBlur = () => {
    const nombre = nombreDepuisSaisie(texte);
    onChange?.(nombre);
    setTexte(nombre === null ? '' : formaterNombre(nombre));
    onBlur?.();
  };

  return (
    <Champ id={id} label={label} obligatoire={obligatoire} erreur={erreur} aide={aide} className={className}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          name={nom}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={disabled}
          required={obligatoire}
          value={texte}
          placeholder={placeholder}
          onChange={surChangement}
          onBlur={surBlur}
          aria-invalid={erreur ? 'true' : undefined}
          aria-describedby={erreur ? `${id}-erreur` : aide ? `${id}-aide` : undefined}
          className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-10 text-right font-mono text-sm tabular-nums text-slate-800 placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
          Ar
        </span>
      </div>
    </Champ>
  );
}
