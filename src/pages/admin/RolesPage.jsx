const ROLES_INFO = [
  { code: 'AGENT_GESTION', desc: 'Gere les dossiers contribuables, valide les declarations' },
  { code: 'AGENT_RECETTE', desc: 'Enregistre les paiements, suit le recouvrement' },
  { code: 'RESPONSABLE', desc: 'Consulte les indicateurs et rapports' },
  { code: 'ADMIN', desc: 'Administre les utilisateurs et les parametres' },
];

export default function RolesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Roles et permissions</h1>
      <div className="grid grid-cols-2 gap-4">
        {ROLES_INFO.map((r) => (
          <div key={r.code} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-sky-500">
            <h2 className="font-bold text-slate-800 mb-2">{r.code}</h2>
            <p className="text-sm text-slate-600">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
