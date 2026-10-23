import { libelle, varianteStatut } from '../../utils/libelles';

const STYLES = {
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
  info: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/10 text-success border border-success/25',
  warning: 'bg-[#FFF8E1] text-[#7A5600] border border-[#B8860B]/35',
  danger: 'bg-danger/10 text-danger border border-danger/25',
};

/**
 * Affiche toujours le libelle francais d'un code technique.
 * @param {{famille: string, code: string, variante?: string}} props
 */
export default function StatutBadge({ famille, code, variante, className = '' }) {
  if (!code) return <span className="text-slate-400">—</span>;
  const ton = variante || varianteStatut(code);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold ${STYLES[ton] || STYLES.default} ${className}`}
    >
      {libelle(famille, code)}
    </span>
  );
}
