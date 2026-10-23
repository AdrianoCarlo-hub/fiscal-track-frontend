import { useCallback, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Info, TriangleAlert, XCircle, X } from 'lucide-react';
import { ToastContext } from './notificationContext';

const VARIANTES = {
  succes: { classes: 'border-success/30 bg-white text-slate-800', icone: CheckCircle2, couleur: 'text-success' },
  info: { classes: 'border-primary/30 bg-white text-slate-800', icone: Info, couleur: 'text-primary' },
  avertissement: { classes: 'border-[#B8860B]/40 bg-white text-slate-800', icone: TriangleAlert, couleur: 'text-[#8A6200]' },
  danger: { classes: 'border-danger/30 bg-white text-slate-800', icone: XCircle, couleur: 'text-danger' },
};

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);
  const compteur = useRef(0);

  const fermer = useCallback((id) => {
    setMessages((liste) => liste.filter((message) => message.id !== id));
  }, []);

  const notifier = useCallback(
    ({ titre, message, variante = 'info', duree = 6000 }) => {
      compteur.current += 1;
      const id = compteur.current;
      setMessages((liste) => [...liste, { id, titre, message, variante }]);
      if (duree > 0) {
        window.setTimeout(() => fermer(id), duree);
      }
      return id;
    },
    [fermer],
  );

  const valeur = useMemo(() => ({ notifier, fermer }), [notifier, fermer]);

  return (
    <ToastContext.Provider value={valeur}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:top-6"
      >
        {messages.map((item) => {
          const config = VARIANTES[item.variante] || VARIANTES.info;
          const Icone = config.icone;
          return (
            <div
              key={item.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg ${config.classes}`}
            >
              <Icone className={`mt-0.5 h-5 w-5 shrink-0 ${config.couleur}`} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                {item.titre && <p className="text-sm font-semibold">{item.titre}</p>}
                {item.message && <p className="mt-0.5 text-sm text-slate-600">{item.message}</p>}
              </div>
              <button
                type="button"
                onClick={() => fermer(item.id)}
                aria-label="Fermer la notification"
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
