import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';
import { useListView } from '../../hooks/useApiData';
import { ListToolbar } from '../../components/common/DataTable';
import Pagination from '../../components/common/Pagination';

export default function NotificationsPage() {
  const { utilisateur } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [chargement, setChargement] = useState(true);
  const liste = useListView(notifications);

  useEffect(() => {
    notificationService.parContribuable(utilisateur.identifiant)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes notifications</h1>

      {chargement ? <div className="fiscal-card p-8 text-sm text-slate-500">Chargement des notifications…</div> : notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center text-slate-500">
          Aucune notification
        </div>
      ) : (
        <>
        <div className="mb-4"><ListToolbar value={liste.query} onChange={liste.setQuery} placeholder="Rechercher dans les notifications…" count={liste.filteredCount} /></div>
        <div className="space-y-3">
          {liste.items.map((n) => (
            <div key={n.idNotif} className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded">
                  {n.typeRelance}
                </span>
                <span className="text-xs text-slate-500">{n.dateEnvoiPrevue?.substring(0, 10)}</span>
              </div>
              <p className="text-slate-700">{n.messageContenu}</p>
              <div className="mt-2 flex gap-2 text-xs text-slate-500">
                <span>Canal : {n.canalEnvoi}</span>
                <span>|</span>
                <span>Statut : {n.statutEnvoi}</span>
              </div>
            </div>
          ))}
        </div>
        {liste.items.length === 0 && <p className="text-center text-sm text-slate-500">Aucun résultat. <button onClick={liste.clear} className="font-semibold text-primary underline">Effacer la recherche</button></p>}
        <Pagination page={liste.page} totalPages={liste.pagination?.totalPages || 0} totalElements={liste.filteredCount} size={10} onChange={liste.setPage} />
        </>
      )}
    </div>
  );
}
