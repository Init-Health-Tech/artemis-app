import { Line, LineChart, ResponsiveContainer } from 'recharts';

interface WeightSparklineProps {
  data: { fecha: string; peso: number }[];
  height?: number;
}

const WeightSparkline = ({ data, height = 80 }: WeightSparklineProps) => {
  if (data.length < 2) {
    return (
      <p className="text-sm text-on-surface-variant">
        Sin suficientes pesajes para mostrar tendencia (mínimo 2).
      </p>
    );
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart data={data}>
          <Line
            dataKey="peso"
            dot={false}
            stroke="#93d695"
            strokeWidth={2}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightSparkline;
