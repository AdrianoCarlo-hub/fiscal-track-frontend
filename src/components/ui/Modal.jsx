import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const TAILLES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export default function Modal({ ouvert = true, onClose, titre, description, children, pied, taille = 'md' }) {
  const titreId = useId();
  const panneauRef = useRef(null);

  useEffect(() => {
    if (!ouvert) return undefined;
    const precedemmentFocalise = document.activeElement;
    panneauRef.current?.focus();
    const surTouche = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', surTouche);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = '';
      if (precedemmentFocalise instanceof HTMLElement) precedemmentFocalise.focus();
    };
  }, [ouvert, onClose]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        onClick={onClose}
        className="absolute inset-0 bg-[#101936]/60 backdrop-blur-sm"
      />
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none animate-[fadeIn_180ms_ease-out] ${TAILLES[taille] || TAILLES.md}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titreId} className="fiscal-page-title text-lg font-semibold">
              {titre}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {pied && <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">{pied}</div>}
      </div>
    </div>
  );
}
