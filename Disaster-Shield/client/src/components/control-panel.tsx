import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { FlareParams } from "@/lib/flare-model";
import { Settings2, Terminal, Info } from "lucide-react";

interface ControlPanelProps {
  manualParams: FlareParams;
  onManualParamsChange: (params: FlareParams) => void;
  mcmcConfig: {
    iterations: number;
    burnIn: number;
    stepSize: number;
  };
  onConfigChange: (config: any) => void;
  onPromptAction: (action: string) => void;
}

export function ControlPanel({ 
  manualParams, 
  onManualParamsChange, 
  mcmcConfig, 
  onConfigChange,
  onPromptAction
}: ControlPanelProps) {
  const [prompt, setPrompt] = useState("");

  const handleSliderChange = (key: keyof FlareParams, val: number[]) => {
    onManualParamsChange({ ...manualParams, [key]: val[0] });
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onPromptAction(prompt);
    setPrompt("");
  };

  return (
    <div className="space-y-6">
      {/* AI/Prompt Box */}
      <Card className="glass-panel p-4 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-2 mb-3 text-primary">
          <Terminal className="w-4 h-4" />
          <span className="text-xs font-display tracking-widest uppercase">Command Interface</span>
        </div>
        <form onSubmit={handlePromptSubmit} className="relative">
          <Input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.target.value = 'Run MCMC with 500 iterations'..."
            className="bg-black/40 border-white/10 font-mono text-xs pr-20 h-10"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1.5 px-3 py-1 bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-mono rounded border border-primary/30 transition-colors"
          >
            EXECUTE
          </button>
        </form>
        <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1">
          <Info className="w-3 h-3" /> Try: "Increase step size to 0.1" or "Set iterations to 1000"
        </p>
      </Card>

      {/* Manual Fitting Sliders */}
      <Card className="glass-panel p-4">
        <div className="flex items-center gap-2 mb-4 text-white">
          <Settings2 className="w-4 h-4" />
          <span className="text-xs font-display tracking-widest uppercase">Manual Curve Fitting</span>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Amplitude (A)</Label>
              <span className="text-primary">{manualParams.A.toFixed(2)}</span>
            </div>
            <Slider 
              value={[manualParams.A]} 
              min={0} max={2} step={0.01} 
              onValueChange={(v) => handleSliderChange('A', v)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Quench (τ)</Label>
              <span className="text-accent">{manualParams.tau.toFixed(2)}s</span>
            </div>
            <Slider 
              value={[manualParams.tau]} 
              min={1} max={10} step={0.1} 
              onValueChange={(v) => handleSliderChange('tau', v)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs font-mono">
              <Label className="text-muted-foreground">Frequency (ω)</Label>
              <span className="text-chart-3">{manualParams.omega.toFixed(2)}</span>
            </div>
            <Slider 
              value={[manualParams.omega]} 
              min={1} max={20} step={0.1} 
              onValueChange={(v) => handleSliderChange('omega', v)}
            />
          </div>
        </div>
      </Card>

      {/* MCMC Configuration */}
      <Card className="glass-panel p-4">
        <h3 className="text-[10px] font-display text-muted-foreground uppercase tracking-widest mb-4">Algorithm Config</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Iterations</Label>
            <Input 
              type="number" 
              value={mcmcConfig.iterations}
              onChange={(e) => onConfigChange({ ...mcmcConfig, iterations: parseInt(e.target.value) })}
              className="h-8 bg-white/5 border-white/10 text-xs font-mono"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Step Size</Label>
            <Input 
              type="number" 
              step="0.01"
              value={mcmcConfig.stepSize}
              onChange={(e) => onConfigChange({ ...mcmcConfig, stepSize: parseFloat(e.target.value) })}
              className="h-8 bg-white/5 border-white/10 text-xs font-mono"
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
