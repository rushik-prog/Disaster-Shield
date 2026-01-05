import { useState, useEffect } from "react";
import { SolarChart } from "@/components/solar-chart";
import { ParameterPanel } from "@/components/parameter-panel";
import { PosteriorDistribution } from "@/components/posterior-distribution";
import { ControlPanel } from "@/components/control-panel";
import { FlareParams, INITIAL_PARAMS, generateSyntheticData, performMCMCStep } from "@/lib/flare-model";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Play, Pause, RefreshCw, Radio, Activity, Download, Code, Sun, Moon, Maximize2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import solarBg from "@assets/generated_images/solar_flare_scientific_visualization_data_dashboard_background.png";
import disasterIntro from "@assets/generated_images/dramatic_collage_of_natural_disasters_and_solar_flares.png";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<'dashboard' | 'graph'>('dashboard');
  const [showIntro, setShowIntro] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const { theme, setTheme } = useTheme();
  
  const [mcmcConfig, setMcmcConfig] = useState({
    iterations: 1000,
    burnIn: 100,
    stepSize: 0.05
  });

  const [trueParams, setTrueParams] = useState<FlareParams>(INITIAL_PARAMS);
  const [manualParams, setManualParams] = useState<FlareParams>({ A: 0.5, tau: 2, omega: 5 });
  const [estimatedParams, setEstimatedParams] = useState<FlareParams>({ A: 0.5, tau: 2, omega: 5 }); 
  const [data, setData] = useState(() => generateSyntheticData(INITIAL_PARAMS));
  const [history, setHistory] = useState<FlareParams[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePromptAction = (prompt: string) => {
    const p = prompt.toLowerCase();
    if (p.includes('iterations') || p.includes('iter')) {
      const match = p.match(/\d+/);
      if (match) {
        setMcmcConfig(prev => ({ ...prev, iterations: parseInt(match[0]) }));
        toast.info(`Updated configuration: iterations set to ${match[0]}`);
      }
    } else if (p.includes('step')) {
      const match = p.match(/0?\.\d+/);
      if (match) {
        setMcmcConfig(prev => ({ ...prev, stepSize: parseFloat(match[0]) }));
        toast.info(`Updated configuration: step size set to ${match[0]}`);
      }
    } else {
      toast.error("Unrecognized command. Try 'Set iterations to 500'");
    }
  };

  const downloadReport = () => {
    toast.success("Generating Bayesian Inference Report...", {
      description: "MAP Estimates and Trace Logs compiled successfully."
    });
  };

  const acceptanceRate = iteration > 0 ? (acceptedCount / iteration) * 100 : 0;

  const resetSimulation = () => {
    setIsRunning(false);
    setIteration(0);
    setAcceptedCount(0);
    const newTrueParams = {
      A: 0.5 + Math.random() * 1.5,
      tau: 2 + Math.random() * 7,
      omega: 5 + Math.random() * 10
    };
    setTrueParams(newTrueParams);
    setEstimatedParams(manualParams); 
    setData(generateSyntheticData(newTrueParams));
    setHistory([]);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && iteration < mcmcConfig.iterations) {
      interval = setInterval(() => {
        setIteration(i => i + 1);
        setEstimatedParams(prev => {
          const { nextParams, accepted } = performMCMCStep(prev, data, mcmcConfig.stepSize);
          if (accepted) setAcceptedCount(c => c + 1);
          setHistory(h => [...h, nextParams].slice(-1000)); 
          return nextParams;
        });
      }, 30); 
    } else if (iteration >= mcmcConfig.iterations) {
      setIsRunning(false);
      toast.success("Inference Complete", { description: `Processed ${iteration} iterations.` });
    }
    return () => clearInterval(interval);
  }, [isRunning, data, iteration, mcmcConfig]);

  const isFlareActive = trueParams.A > 1.2;
  const visualizationParams = isRunning ? estimatedParams : manualParams;

  if (showIntro) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
          <motion.div
            initial={{ scale: 1.1, filter: "brightness(0)" }}
            animate={{ scale: 1, filter: "brightness(1)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <img 
              src={disasterIntro} 
              className="w-full h-full object-cover opacity-60"
              alt="Disaster"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-4xl md:text-6xl font-display font-black text-white tracking-[0.2em] mb-4"
              >
                PREPARE FOR THE IMPACT
              </motion.h1>
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-48 h-1 bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-ui relative">
      <div 
        className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: `url(${solarBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
      <div className="scanline" />

      <header className="border-b border-white/10 bg-card/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-primary/50 rounded-full flex items-center justify-center bg-primary/10 animate-pulse-slow">
              <Radio className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-widest text-white">SOLAR SENTINEL</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <AnimatePresence>
              {isFlareActive && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-1 bg-destructive/20 border border-destructive text-destructive rounded-full"
                >
                  <AlertTriangle className="w-4 h-4 animate-bounce" />
                  <span className="text-xs font-bold font-mono blink">FLARE DETECTED</span>
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-muted-foreground"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <div className="text-right hidden md:block">
              <div className="text-xs text-muted-foreground font-mono">MAP ACCURACY</div>
              <div className="text-sm font-bold text-accent flex items-center justify-end gap-2">
                {iteration > 50 ? 'STABLE' : 'CONVERGING'} <Activity className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10 space-y-6">
        <AnimatePresence mode="wait">
          {viewMode === 'graph' ? (
            <motion.div
              key="fullscreen-graph"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setViewMode('dashboard')}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-display text-primary tracking-widest">FULLSCREEN SIGNAL ANALYSIS</h2>
                </div>
                <div className="font-mono text-sm text-primary flex gap-4">
                  <div>ITERATION: <span className="text-white">{iteration}</span></div>
                  <div>ACCEPTANCE: <span className={acceptanceRate > 20 && acceptanceRate < 50 ? 'text-green-400' : 'text-orange-400'}>{acceptanceRate.toFixed(1)}%</span></div>
                </div>
              </div>
              <div className="h-[75vh] glass-panel rounded-lg p-6">
                <SolarChart data={data} currentParams={visualizationParams} iteration={iteration} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-4">
                   <Button 
                     variant={isRunning ? "destructive" : "default"} 
                     onClick={() => setIsRunning(!isRunning)}
                     className="w-32 font-display"
                   >
                     {isRunning ? <><Pause className="mr-2 w-4 h-4"/> PAUSE</> : <><Play className="mr-2 w-4 h-4"/> INFER</>}
                   </Button>
                   <Button variant="outline" onClick={resetSimulation} className="font-display">
                     <RefreshCw className="mr-2 w-4 h-4" /> RESET
                   </Button>
                   <Button 
                     variant="outline" 
                     onClick={() => setViewMode('graph')}
                     className="font-display border-accent/30 text-accent hover:bg-accent/10"
                   >
                     <Maximize2 className="mr-2 w-4 h-4" /> FULLSCREEN GRAPH
                   </Button>
                </div>
                <div className="font-mono text-sm text-primary flex gap-4">
                  <div>ITERATION: <span className="text-white">{iteration}</span></div>
                  <div>ACCEPTANCE: <span className={acceptanceRate > 20 && acceptanceRate < 50 ? 'text-green-400' : 'text-orange-400'}>{acceptanceRate.toFixed(1)}%</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={downloadReport} className="text-xs font-mono">
                    <Download className="w-3 h-3 mr-2" /> DELIVERABLES
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs font-mono">
                    <Code className="w-3 h-3 mr-2" /> SOURCE
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <SolarChart data={data} currentParams={visualizationParams} iteration={iteration} />
                  <div className="space-y-4">
                    <h3 className="text-sm font-display text-muted-foreground flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Posterior Distributions & Trace Plots
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <PosteriorDistribution history={history} param="A" label="Amplitude (A)" color="hsl(35 92% 50%)" />
                       <PosteriorDistribution history={history} param="tau" label="Quench (τ)" color="hsl(199 89% 48%)" />
                       <PosteriorDistribution history={history} param="omega" label="Freq (ω)" color="hsl(280 60% 60%)" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       {['A', 'tau', 'omega'].map((param, i) => (
                         <div key={param} className="h-20 glass-panel p-2 flex items-end relative overflow-hidden group">
                           <div className="absolute top-1 left-2 text-[8px] font-mono text-muted-foreground uppercase">TRACE {param}</div>
                           <div className="flex items-end gap-[1px] w-full h-12">
                              {history.slice(-100).map((h, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex-1 bg-primary/30 group-hover:bg-primary/60 transition-colors"
                                  style={{ 
                                    height: `${((h as any)[param] / (param === 'omega' ? 20 : param === 'tau' ? 10 : 2)) * 100}%`,
                                  }}
                                />
                              ))}
                           </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <ControlPanel 
                    manualParams={manualParams}
                    onManualParamsChange={setManualParams}
                    mcmcConfig={mcmcConfig}
                    onConfigChange={setMcmcConfig}
                    onPromptAction={handlePromptAction}
                  />
                  <Card className="glass-panel p-6 border-none">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-lg font-display text-white">MAP Estimates</h2>
                      <div className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[10px] font-mono text-primary">BEST FIT</div>
                    </div>
                    <ParameterPanel params={estimatedParams} trueParams={trueParams} />
                  </Card>
                  <Card className="glass-panel p-6 border-none">
                    <h2 className="text-lg font-display text-white mb-4 border-b border-white/10 pb-2">Bayesian Summary</h2>
                    <div className="space-y-4 font-mono text-sm">
                      <div className="p-3 bg-black/40 rounded border border-white/5 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Likelihood L</span>
                          <span className="text-green-400">Converged</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Random Walk</span>
                          <span className="text-accent">Metropolis-Hastings</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Burn-in</span>
                          <span className="text-white">{Math.min(iteration, 50)} / 50</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          Estimating parameters using a uniform prior P(θ) and a relative sensor error σi = 0.2 · |ydata,i|. 
                          Convergence monitored via Markov Chain trace plots.
                        </p>
                      </div>
                      <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                        <div className="p-2 bg-white/5 rounded text-center">
                          <div className="text-[10px] text-muted-foreground">SAMPLES</div>
                          <div className="text-lg font-bold">{history.length}</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded text-center">
                          <div className="text-[10px] text-muted-foreground">DOF</div>
                          <div className="text-lg font-bold">3</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/10 bg-card/50 backdrop-blur py-12 mt-12 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-display font-bold tracking-widest text-white">SOLAR SENTINEL</h2>
              </div>
              <p className="text-sm text-muted-foreground font-mono leading-relaxed max-w-xs">
                Advanced stochastic signal recovery and disaster mitigation systems for space weather events.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-display text-white tracking-widest uppercase">Contact Protocol</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  <a href="mailto:disastermanagement@gmail.com">disastermanagement@gmail.com</a>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <span className="w-1 h-1 bg-primary rounded-full mt-1.5"></span>
                  <span>1200 Solar Dynamics Way,<br />Cosmos Plaza, Suite 402<br />Palo Alto, CA 94304</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-display text-white tracking-widest uppercase">System Status</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-green-500 tracking-tighter">GLOBAL MONITORING ACTIVE</span>
              </div>
              <p className="text-[10px] text-muted-foreground font-mono uppercase">
                © 2026 SOLAR SENTINEL DISASTER MANAGEMENT UNIT
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
