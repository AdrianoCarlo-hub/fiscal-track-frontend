import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const TAILLES = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const SELECTEUR_FOCUS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  ouvert = true,
  onClose,
  titre,
  description,
  children,
  pied,
  taille = 'md',
  verrouille = false,
}) {
  const titreId = useId();
  const panneauRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const verrouilleRef = useRef(verrouille);

  useEffect(() => {
    onCloseRef.current = onClose;
    verrouilleRef.current = verrouille;
  });

  useEffect(() => {
    if (!ouvert) return undefined;
    const precedemmentFocalise = document.activeElement;
    const overflowPrecedent = document.body.style.overflow;
    const panneau = panneauRef.current;
    const premierChamp = panneau?.querySelector(SELECTEUR_FOCUS);
    (premierChamp || panneau)?.focus();

    const surTouche = (evenement) => {
      if (evenement.key === 'Escape' && !verrouilleRef.current) {
        evenement.preventDefault();
        onCloseRef.current?.();
        return;
      }
      if (evenement.key !== 'Tab' || !panneau) return;
      const focusables = [...panneau.querySelectorAll(SELECTEUR_FOCUS)].filter(
        (element) => element.offsetParent !== null,
      );
      if (focusables.length === 0) {
        evenement.preventDefault();
        panneau.focus();
        return;
      }
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault();
        dernier.focus();
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault();
        premier.focus();
      }
    };

    document.addEventListener('keydown', surTouche);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', surTouche);
      document.body.style.overflow = overflowPrecedent;
      if (precedemmentFocalise instanceof HTMLElement) precedemmentFocalise.focus();
    };
  }, [ouvert]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Fermer la fenêtre"
        onClick={verrouille ? undefined : onClose}
        disabled={verrouille}
        className="absolute inset-0 bg-[#101936]/60 disabled:cursor-wait"
      />
      <div
        ref={panneauRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titreId}
        aria-busy={verrouille ? 'true' : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg outline-none ${TAILLES[taille] || TAILLES.md}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2 id={titreId} className="fiscal-page-title text-lg font-semibold">
              {titre}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            disabled={verrouille}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-wait disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {pied && <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">{pied}</div>}
      </div>
    </div>
  );
}
