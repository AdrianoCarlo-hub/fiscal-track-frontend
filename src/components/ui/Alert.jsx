import { CheckCircle2, Info, TriangleAlert, X, XCircle } from 'lucide-react';

const VARIANTES = {
  info: { classes: 'border-primary/25 bg-primary/5 text-primary', Icone: Info, titre: 'Information' },
  succes: { classes: 'border-success/25 bg-success/5 text-success', Icone: CheckCircle2, titre: 'Opération réussie' },
  avertissement: { classes: 'border-[#B8860B]/35 bg-[#FFF8E1] text-[#7A5600]', Icone: TriangleAlert, titre: 'Attention' },
  danger: { classes: 'border-danger/25 bg-danger/5 text-danger', Icone: XCircle, titre: 'Erreur' },
};

export default function Alert({ variante = 'info', titre, children, onFermer, className = '', role }) {
  const config = VARIANTES[variante] || VARIANTES.info;
  const Icone = config.Icone;

  return (
    <div
      role={role || (variante === 'danger' ? 'alert' : 'status')}
      className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${config.classes} ${className}`}
    >
      <Icone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{titre || config.titre}</p>
        {children && <div className="mt-1 leading-relaxed opacity-90">{children}</div>}
      </div>
      {onFermer && (
        <button
          type="button"
          onClick={onFermer}
          aria-label="Fermer le message"
          className="rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
