import MontantInput from '../ui/MontantInput';
import { Input } from '../ui/FormControls';

/** Champ monétaire des simulateurs : événement compatible avec les formulaires existants. */
export function ChampMontant({ label, name, value, onChange, required, aide }) {
  return (
    <MontantInput
      id={name}
      nom={name}
      label={label}
      valeur={value === '' ? null : value}
      obligatoire={required}
      aide={aide}
      onChange={(valeur) => onChange({ target: { name, type: 'number', value: valeur } })}
    />
  );
}

/** Champ numérique sans devise (mois, nombre de personnes à charge, etc.). */
export function ChampNombre({ label, name, value, onChange, required, min, max, aide }) {
  return (
    <Input
      id={name}
      name={name}
      type="number"
      label={label}
      value={value}
      obligatoire={required}
      min={min}
      max={max}
      aide={aide}
      onChange={onChange}
    />
  );
}
