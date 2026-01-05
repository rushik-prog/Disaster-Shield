import { motion } from "framer-motion";
import { FlareParams } from "@/lib/flare-model";
import { Progress } from "@/components/ui/progress";

interface ParameterPanelProps {
  params: FlareParams;
  trueParams: FlareParams | null; // Null if blind test
}

export function ParameterPanel({ params, trueParams }: ParameterPanelProps) {
  const getError = (key: keyof FlareParams) => {
    if (!trueParams) return 0;
    return Math.abs((params[key] - trueParams[key]) / trueParams[key]) * 100;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ParamCard 
        label="Intensity Scale (A)" 
        value={params.A} 
        unit="AU" 
        min={0} 
        max={2} 
        color="text-chart-1"
        error={trueParams ? getError('A') : undefined}
      />
      <ParamCard 
        label="Quench Time (τ)" 
        value={params.tau} 
        unit="s" 
        min={1} 
        max={10} 
        color="text-chart-2"
        error={trueParams ? getError('tau') : undefined}
      />
      <ParamCard 
        label="Angular Freq (ω)" 
        value={params.omega} 
        unit="rad/s" 
        min={1} 
        max={20} 
        color="text-chart-4"
        error={trueParams ? getError('omega') : undefined}
      />
    </div>
  );
}

function ParamCard({ label, value, unit, min, max, color, error }: any) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="glass-panel p-4 rounded-lg tech-border">
      <div className="flex justify-between items-start mb-2">
        <span className="text-muted-foreground text-xs font-mono uppercase tracking-widest">{label}</span>
        {error !== undefined && (
          <span className={`text-xs font-mono ${error < 5 ? 'text-green-400' : 'text-orange-400'}`}>
            ERR: {error.toFixed(1)}%
          </span>
        )}
      </div>
      
      <div className="flex items-end gap-2 mb-2">
        <motion.span 
          className={`text-2xl font-display font-bold ${color}`}
          initial={false}
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {value.toFixed(4)}
        </motion.span>
        <span className="text-sm text-muted-foreground font-mono mb-1">{unit}</span>
      </div>
      
      <Progress value={percentage} className="h-1 bg-white/5" />
      <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
