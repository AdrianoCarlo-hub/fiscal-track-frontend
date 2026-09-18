import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#22c55e', '#eab308', '#ef4444'];

export default function ConformiteChart({ data }) {
  const chartData = [
    { name: 'Conformes', value: data.obligationsDeposees },
    { name: 'En attente', value: data.obligationsEnAttente },
    { name: 'En retard', value: data.obligationsEnRetard },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
          {chartData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
