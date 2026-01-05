import { useMemo } from "react";
import { ResponsiveContainer, ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { DataPoint, FlareParams, calculateIntensity } from "@/lib/flare-model";

interface SolarChartProps {
  data: DataPoint[];
  currentParams: FlareParams;
  iteration: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/90 backdrop-blur border border-primary/20 p-3 rounded font-mono text-xs shadow-xl">
        <p className="text-muted-foreground mb-1">Time: {Number(label).toFixed(2)}s</p>
        <p className="text-primary font-bold">
          Model: {payload.find((p: any) => p.dataKey === "yestimated")?.value.toFixed(4)}
        </p>
        <p className="text-accent">
          Sensor: {payload.find((p: any) => p.dataKey === "ydata")?.value.toFixed(4)}
        </p>
      </div>
    );
  }
  return null;
};

export function SolarChart({ data, currentParams, iteration }: SolarChartProps) {
  // Generate the "Estimated" line based on current MCMC parameters
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      yestimated: calculateIntensity(point.t, currentParams)
    }));
  }, [data, currentParams]);

  return (
    <div className="w-full h-[400px] glass-panel rounded-lg p-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-2 opacity-50 font-mono text-xs text-primary/70">
        ITERATION: {iteration.toString().padStart(6, '0')}
      </div>
      
      <h3 className="text-lg font-display text-primary mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
        Signal Recovery
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEstimated" x1="0" y1="0" x2="1" y2="0">
              <stop offset="5%" stopColor="hsl(35 92% 50%)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="t" 
            stroke="rgba(255,255,255,0.3)" 
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(val) => val.toFixed(1)}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            tick={{ fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
          
          {/* Noisy Sensor Data */}
          <Scatter 
            name="Sensor Data" 
            dataKey="ydata" 
            fill="hsl(199 89% 48%)" 
            opacity={0.4}
            shape="circle" 
          />
          
          {/* Recovered Signal */}
          <Line 
            type="monotone" 
            dataKey="yestimated" 
            stroke="url(#colorEstimated)" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: "hsl(35 92% 50%)" }}
            animationDuration={300}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
