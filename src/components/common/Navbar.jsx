import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { utilisateur, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-slate-800">Fiscal-Track</h1>
        <span className="text-xs text-slate-400">|</span>
        <span className="text-sm text-slate-500">Centre Fiscal</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800">{utilisateur?.identifiant}</p>
          <p className="text-xs text-slate-500">{utilisateur?.role}</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition"
        >
          Deconnexion
        </button>
      </div>
    </header>
  );
}
