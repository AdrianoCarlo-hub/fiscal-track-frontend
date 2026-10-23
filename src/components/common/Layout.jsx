import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
  const [menuMobile, setMenuMobile] = useState(false);

  return (
    <div className="flex min-h-dvh bg-[#FAFAFA] text-slate-800">
      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Aller au contenu principal
      </a>

      <Sidebar mobileOpen={menuMobile} onClose={() => setMenuMobile(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOuvrirMenu={() => setMenuMobile(true)} />
        <main id="contenu-principal" className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
        <footer className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          Fiscal-Track · Direction Générale des Impôts — République de Madagascar
        </footer>
      </div>
    </div>
  );
}
