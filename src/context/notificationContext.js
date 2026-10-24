import { createContext, useContext } from 'react';

export const ToastContext = createContext(null);

export function useToast() {
  const contexte = useContext(ToastContext);
  if (!contexte) throw new Error('useToast doit être utilisé dans un ToastProvider');
  return contexte;
}

export const ConfirmContext = createContext(null);

export function useConfirm() {
  const contexte = useContext(ConfirmContext);
  if (!contexte) throw new Error('useConfirm doit être utilisé dans un ConfirmProvider');
  return contexte;
}
