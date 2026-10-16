import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#2F7A4F', '#B8860B', '#B23A33'];

export default function ConformiteChart({ data }) {
  const chartData = [
    { name: 'Conformes', value: data.obligationsDeposees },
    { name: 'En attente', value: data.obligationsEnAttente },
    { name: 'En retard', value: data.obligationsEnRetard },
  ];

  if (chartData.every((entry) => !Number(entry.value))) {
    return <div className="flex h-[260px] items-center justify-center text-sm text-slate-500">Aucune donnée d’obligation à afficher.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} obligation(s)`, 'Nombre']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
