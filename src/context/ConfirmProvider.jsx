import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { ConfirmContext } from './notificationContext';
import Button from '../components/ui/Button';

/**
 * Remplace window.confirm : `await confirmer({titre, message, libelleConfirmer, variante})`
 * renvoie true si l'utilisateur confirme.
 */
export function ConfirmProvider({ children }) {
  const [demande, setDemande] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const resoudreRef = useRef(null);
  const panneauRef = useRef(null);
  const boutonAnnulerRef = useRef(null);

  const confirmer = useCallback((options) => {
    return new Promise((resolve) => {
      resoudreRef.current = resolve;
      setDemande(typeof options === 'string' ? { message: options } : options);
    });
  }, []);

  const fermer = useCallback((resultat) => {
    if (resoudreRef.current) resoudreRef.current(resultat);
    resoudreRef.current = null;
    setDemande(null);
    setEnCours(false);
  }, []);

  useEffect(() => {
    if (!demande) return undefined;
    const precedemmentFocalise = document.activeElement;
    const overflowPrecedent = document.body.style.overflow;
    const panneau = panneauRef.current;
    boutonAnnulerRef.current?.focus();

    const surTouche = (event) => {
      if (event.key === 'Escape') {
        fermer(false);
        return;
      }
      if (event.key !== 'Tab' || !panneau) return;
      const focusables = [...panneau.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((element) => element.offsetParent !== null);
      if (focusables.length === 0) {
        event.preventDefault();
        panneau.focus();
        return;
      }
      const premier = focusables[0];
      const dernier = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === premier) {
        event.preventDefault();
        dernier.focus();
      } else if (!event.shiftKey && document.activeElement === dernier) {
        event.preventDefault();
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
  }, [demande, fermer]);

  const valeur = useMemo(() => confirmer, [confirmer]);

  return (
    <ConfirmContext.Provider value={valeur}>
      {children}
      {demande && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer la confirmation"
            onClick={() => fermer(false)}
            className="absolute inset-0 bg-[#101936]/60 backdrop-blur-sm"
          />
          <div
            ref={panneauRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirmation-titre"
            aria-describedby="confirmation-message"
            tabIndex={-1}
            className="relative w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-lg outline-none animate-[fadeIn_150ms_ease-out]"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8E1] text-[#8A6200]">
                <TriangleAlert className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 id="confirmation-titre" className="text-lg font-semibold text-slate-800">
                  {demande.titre || 'Confirmer l’opération'}
                </h2>
                <p id="confirmation-message" className="mt-2 text-sm leading-relaxed text-slate-600">
                  {demande.message}
                </p>
                {demande.details && <div className="mt-3 text-sm text-slate-700">{demande.details}</div>}
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button ref={boutonAnnulerRef} variant="ghost" onClick={() => fermer(false)} disabled={enCours}>
                {demande.libelleAnnuler || 'Annuler'}
              </Button>
              <Button
                variant={demande.variante === 'danger' ? 'danger' : 'primary'}
                disabled={enCours}
                onClick={() => {
                  setEnCours(true);
                  fermer(true);
                }}
              >
                {demande.libelleConfirmer || 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export default ConfirmProvider;
