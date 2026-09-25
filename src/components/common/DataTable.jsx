import Pagination from './Pagination';

/**
 * Tableau generique avec pagination integree.
 *
 * Props :
 *   colonnes : [{ cle, label, align?, render? }]
 *   donnees : array
 *   chargement : boolean
 *   erreur : string
 *   pagination : { page, totalPages, totalElements, size }
 *   onPageChange : (page) => void
 */
export default function DataTable({
  colonnes,
  donnees,
  chargement,
  erreur,
  pagination,
  onPageChange,
}) {
  if (chargement) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
        Chargement...
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">{erreur}</div>
    );
  }

  if (!donnees || donnees.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center text-slate-500">
        Aucune donnee
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 text-slate-600 text-sm">
          <tr>
            {colonnes.map((col) => (
              <th
                key={col.cle}
                className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {donnees.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50">
              {colonnes.map((col) => (
                <td
                  key={col.cle}
                  className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''}`}
                >
                  {col.render ? col.render(item) : item[col.cle]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          totalElements={pagination.totalElements}
          size={pagination.size}
          onChange={onPageChange}
        />
      )}
    </div>
  );
}
