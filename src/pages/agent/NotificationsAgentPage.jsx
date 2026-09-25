import { useState } from 'react';
import notificationService from '../../services/notificationService';
import { useApiData } from '../../hooks/useApiData';
import { formatDate } from '../../utils/formatUtils';

export default function NotificationsAgentPage() {
  const [message, setMessage] = useState('');
  const { data: notifications, chargement, erreur, recharger } = useApiData(
    () => notificationService.lister(),
    []
  );

  const genererRappels = async () => {
    try {
      const res = await notificationService.genererRappels(7);
      setMessage(`${res.nombreRappelsGeneres} rappel(s) J-7 genere(s)`);
      recharger();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  const envoyerEnAttente = async () => {
    try {
      const res = await notificationService.envoyerEnAttente();
      setMessage(`${res.nombreEnvoyes} notification(s) envoyee(s)`);
      recharger();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Notifications et rappels</h1>
        <div className="flex gap-2">
          <button onClick={genererRappels}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm">
            Generer rappels J-7
          </button>
          <button onClick={envoyerEnAttente}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg text-sm">
            Envoyer en attente
          </button>
        </div>
      </div>

      {message && <div className="bg-sky-50 text-sky-700 p-3 rounded-lg mb-4 text-sm">{message}</div>}
      {erreur && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{erreur}</div>}

      {chargement ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">Chargement...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 text-slate-600 text-sm">
              <tr>
                <th className="text-left px-4 py-3">NIF</th>
                <th className="text-left px-4 py-3">Type</th>
                <th className="text-left px-4 py-3">Canal</th>
                <th className="text-left px-4 py-3">Envoi prevu</th>
                <th className="text-left px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {notifications.map((n) => (
                <tr key={n.idNotif} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-sm">{n.nif}</td>
                  <td className="px-4 py-3">
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded">{n.typeRelance}</span>
                  </td>
                  <td className="px-4 py-3 text-sm">{n.canalEnvoi}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(n.dateEnvoiPrevue)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      n.statutEnvoi === 'ENVOYE' ? 'bg-green-100 text-green-700' :
                      n.statutEnvoi === 'ECHEC' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{n.statutEnvoi}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
