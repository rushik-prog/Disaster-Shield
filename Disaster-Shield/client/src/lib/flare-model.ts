
export interface FlareParams {
  A: number; // Amplitude: 0 < A < 2
  tau: number; // Quench Time: 1 < tau < 10
  omega: number; // Angular Frequency: 1 < omega < 20
}

export const INITIAL_PARAMS: FlareParams = {
  A: 1.0,
  tau: 5.0,
  omega: 10.0,
};

// S(t) = A · e^t · {1 − tanh[2(t − τ )]} · sin(ωt)
export function calculateIntensity(t: number, params: FlareParams): number {
  const { A, tau, omega } = params;
  const term1 = A * Math.exp(t);
  const term2 = 1 - Math.tanh(2 * (t - tau));
  const term3 = Math.sin(omega * t);
  
  return term1 * term2 * term3;
}

export interface DataPoint {
  t: number;
  ydata: number; // Noisy observation
  ymodel: number; // True underlying signal
  sigma: number; // Error
}

export function generateSyntheticData(
  trueParams: FlareParams, 
  points: number = 100, 
  tMax: number = 10
): DataPoint[] {
  const data: DataPoint[] = [];
  const dt = tMax / points;

  for (let i = 0; i < points; i++) {
    const t = i * dt;
    const ymodel = calculateIntensity(t, trueParams);
    
    // Noise model: sigma = 0.2 * |ydata| (approximate as 0.2 * |ymodel| for generation)
    const sigma = 0.2 * Math.abs(ymodel) + 0.01; // Add small base noise to avoid 0 sigma
    const noise = (Math.random() - 0.5) * 2 * sigma; // Uniform-ish noise for simplicity
    
    data.push({
      t,
      ydata: ymodel + noise,
      ymodel,
      sigma
    });
  }
  
  return data;
}

// Metropolis-Hastings Bayesian Parameter Estimation
export function performMCMCStep(
  currentParams: FlareParams, 
  data: DataPoint[],
  stepSize: number = 0.05
): { nextParams: FlareParams; accepted: boolean } {
  // Reproducibility note: In a real system we would use a seeded PRNG
  
  // Proposal: Random walk in parameter space
  const propose = (val: number, range: [number, number], scale: number) => {
    const proposal = val + (Math.random() - 0.5) * scale;
    return Math.max(range[0], Math.min(range[1], proposal));
  };

  const proposal: FlareParams = {
    A: propose(currentParams.A, [0, 2], stepSize * 0.2),
    tau: propose(currentParams.tau, [1, 10], stepSize * 1.0),
    omega: propose(currentParams.omega, [1, 20], stepSize * 2.0),
  };

  const calculateLogLikelihood = (p: FlareParams) => {
    let logL = 0;
    for (const point of data) {
      const ymodel = calculateIntensity(point.t, p);
      const sigma = 0.2 * Math.abs(point.ydata) + 0.01;
      logL -= Math.pow(point.ydata - ymodel, 2) / (2 * Math.pow(sigma, 2));
    }
    return logL;
  };

  const logLCurrent = calculateLogLikelihood(currentParams);
  const logLProposal = calculateLogLikelihood(proposal);

  const acceptanceRatio = Math.exp(logLProposal - logLCurrent);
  
  if (Math.random() < acceptanceRatio) {
    return { nextParams: proposal, accepted: true };
  }
  
  return { nextParams: currentParams, accepted: false };
}
