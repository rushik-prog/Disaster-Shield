import { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface PosteriorProps {
  history: any[];
  param: 'A' | 'tau' | 'omega';
  label: string;
  color: string;
}

export function PosteriorDistribution({ history, param, label, color }: PosteriorProps) {
  const { distributionData, credibleInterval } = useMemo(() => {
    if (history.length < 10) return { distributionData: [], credibleInterval: { low: 0, high: 0 } };
    
    const values = history.map(h => h[param]).sort((a, b) => a - b);
    const min = values[0];
    const max = values[values.length - 1];
    const bins = 20;
    const step = (max - min) / bins || 0.001;
    
    const histogram = Array.from({ length: bins }, (_, i) => ({
      bin: min + (i * step),
      count: 0
    }));

    values.forEach(v => {
      const binIdx = Math.min(Math.floor((v - min) / step), bins - 1);
      if (binIdx >= 0) histogram[binIdx].count++;
    });

    // 68% Credible Interval
    const lowIdx = Math.floor(values.length * 0.16);
    const highIdx = Math.floor(values.length * 0.84);

    return { 
      distributionData: histogram, 
      credibleInterval: { low: values[lowIdx], high: values[highIdx] } 
    };
  }, [history, param]);

  return (
    <div className="h-48 glass-panel p-3 rounded-lg relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2">
        <div className="text-[10px] font-mono text-muted-foreground uppercase">{label} Posterior</div>
        <div className="text-[9px] font-mono text-accent">68% CI: [{credibleInterval.low.toFixed(2)}, {credibleInterval.high.toFixed(2)}]</div>
      </div>
      <ResponsiveContainer width="100%" height="70%">
        <BarChart data={distributionData}>
          <Bar dataKey="count" fill={color} radius={[2, 2, 0, 0]} opacity={0.8} />
          <XAxis dataKey="bin" hide />
          <YAxis hide />
          <Tooltip 
            labelFormatter={(val) => `${label}: ${Number(val).toFixed(3)}`}
            contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
          />
        </BarChart>
      </ResponsiveContainer>
      <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[8px] font-mono text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <span>MIN: {distributionData[0]?.bin.toFixed(2)}</span>
        <span>MAX: {distributionData[distributionData.length-1]?.bin.toFixed(2)}</span>
      </div>
    </div>
  );
}
