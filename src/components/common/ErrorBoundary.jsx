import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { erreur: null };
  }

  static getDerivedStateFromError(erreur) {
    return { erreur };
  }

  componentDidCatch(erreur, informations) {
    if (import.meta.env.DEV) {
      console.error('Erreur inattendue dans l’interface', erreur, informations);
    }
  }

  reessayer = () => {
    this.setState({ erreur: null });
  };

  render() {
    if (!this.state.erreur) return this.props.children;

    return (
      <div className="mx-auto max-w-xl py-16" role="alert">
        <div className="fiscal-card p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-primary">
            Une erreur inattendue est survenue
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Cette page n’a pas pu être affichée. Vos données n’ont pas été modifiées. Vous pouvez
            réessayer ou rejoindre le tableau de bord.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={this.reessayer}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Réessayer
            </button>
            <a
              href="/"
              className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Revenir à l’accueil
            </a>
          </div>
        </div>
      </div>
    );
  }
}
