import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import compteCourantService from '../../services/compteCourantService';

export default function DettesPage() {
  const { utilisateur } = useAuth();
  const [dettes, setDettes] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    compteCourantService.parContribuable(utilisateur.identifiant)
      .then((data) => setDettes(data.filter((c) => c.resteARecouvrer > 0)))
      .catch(() => {})
      .finally(() => setChargement(false));
  }, [utilisateur.identifiant]);

  const formatMontant = (m) =>
    new Intl.NumberFormat('fr-MG', { style: 'currency', currency: 'MGA', maximumFractionDigits: 0 })
      .format(m || 0);

  const total = dettes.reduce((acc, d) => acc + Number(d.resteARecouvrer || 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes dettes fiscales</h1>

      <div className="bg-red-500 text-white p-6 rounded-xl shadow-sm mb-6">
        <p className="text-sm uppercase text-red-100">Total a payer</p>
        <p className="text-3xl font-bold mt-2">{formatMontant(total)}</p>
      </div>

      {chargement ? <p>Chargement...</p> : dettes.length === 0 ? (
        <div className="bg-green-50 text-green-700 p-6 rounded-xl text-center">
          Aucune dette en cours. Bravo !
        </div>
      ) : (
        <div className="space-y-3">
          {dettes.map((d) => (
            <div key={d.idCompte} className="bg-white p-5 rounded-xl shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium">Compte #{d.idCompte}</p>
                <p className="text-xs text-slate-500">Statut : {d.statutRecouvrement}</p>
              </div>
              <p className="text-xl font-bold text-red-600">{formatMontant(d.resteARecouvrer)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
