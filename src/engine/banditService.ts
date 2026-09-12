import { BanditArm, BanditTelemetry, Product } from '../types';
import { mockProducts } from '../data/products';

// Standard Beta distribution pseudo-random sampler using Box-Muller / Gamma approximation
function sampleGamma(shape: number): number {
  if (shape < 1) {
    return sampleGamma(shape + 1) * Math.pow(Math.random(), 1 / shape);
  }
  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    let u: number, v: number, x: number;
    do {
      x = (Math.random() * 2 - 1) + (Math.random() * 2 - 1);
    } while (x * x >= 1);
    const z = Math.sqrt(-2 * Math.log(Math.random())) * (x / Math.sqrt(x * x + 0.0001));
    v = 1 + c * z;
    if (v <= 0) continue;
    v = v * v * v;
    u = Math.random();
    if (u < 1 - 0.0331 * (z * z) * (z * z)) return d * v;
    if (Math.log(u) < 0.5 * z * z + d * (1 - v + Math.log(v))) return d * v;
  }
}

export function sampleBeta(alpha: number, beta: number): number {
  const g1 = sampleGamma(Math.max(0.1, alpha));
  const g2 = sampleGamma(Math.max(0.1, beta));
  if (g1 + g2 === 0) return 0.5;
  return g1 / (g1 + g2);
}

// Default candidate arms initialized from top product verticals
let banditArms: BanditArm[] = [
  {
    id: 'arm-laptops',
    name: 'High-Performance Laptops',
    category: 'Laptops',
    alpha: 28,
    beta: 72,
    pulls: 100,
    rewards: 28,
    estimatedCtr: 0.28,
    variance: (28 * 72) / (Math.pow(100, 2) * 101)
  },
  {
    id: 'arm-audio',
    name: 'Studio & ANC Audio',
    category: 'Audio',
    alpha: 34,
    beta: 66,
    pulls: 100,
    rewards: 34,
    estimatedCtr: 0.34,
    variance: (34 * 66) / (Math.pow(100, 2) * 101)
  },
  {
    id: 'arm-smartphones',
    name: 'Flagship Smartphones',
    category: 'Smartphones',
    alpha: 22,
    beta: 78,
    pulls: 100,
    rewards: 22,
    estimatedCtr: 0.22,
    variance: (22 * 78) / (Math.pow(100, 2) * 101)
  },
  {
    id: 'arm-gaming',
    name: 'Gaming Rigs & Peripherals',
    category: 'Gaming',
    alpha: 31,
    beta: 69,
    pulls: 100,
    rewards: 31,
    estimatedCtr: 0.31,
    variance: (31 * 69) / (Math.pow(100, 2) * 101)
  },
  {
    id: 'arm-smarthome',
    name: 'Smart Home & Ambient Lighting',
    category: 'Smart Home',
    alpha: 19,
    beta: 81,
    pulls: 100,
    rewards: 19,
    estimatedCtr: 0.19,
    variance: (19 * 81) / (Math.pow(100, 2) * 101)
  },
  {
    id: 'arm-wearables',
    name: 'Biometric Wearables',
    category: 'Wearables',
    alpha: 25,
    beta: 75,
    pulls: 100,
    rewards: 25,
    estimatedCtr: 0.25,
    variance: (25 * 75) / (Math.pow(100, 2) * 101)
  }
];

let totalRounds = 600;
let cumulativeReward = 159;
let explorationRate = 0.20; // 20% exploration, 80% exploitation

const regretHistory: { round: number; cumulativeRegret: number; empiricalCtr: number }[] = [
  { round: 50, cumulativeRegret: 4.2, empiricalCtr: 0.24 },
  { round: 100, cumulativeRegret: 7.1, empiricalCtr: 0.26 },
  { round: 200, cumulativeRegret: 11.4, empiricalCtr: 0.29 },
  { round: 300, cumulativeRegret: 14.8, empiricalCtr: 0.31 },
  { round: 400, cumulativeRegret: 17.5, empiricalCtr: 0.32 },
  { round: 500, cumulativeRegret: 19.9, empiricalCtr: 0.33 },
  { round: 600, cumulativeRegret: 21.8, empiricalCtr: 0.34 }
];

// Perform Thompson Sampling round across arms
export const selectBanditArm = (forcedExplorationRate?: number): { selectedArm: BanditArm; samples: Record<string, number>; isExploratory: boolean } => {
  const currentExplore = forcedExplorationRate !== undefined ? forcedExplorationRate : explorationRate;
  const isExploratory = Math.random() < currentExplore;

  const samples: Record<string, number> = {};

  banditArms.forEach((arm) => {
    const sample = sampleBeta(arm.alpha, arm.beta);
    arm.lastSampledValue = Math.round(sample * 1000) / 1000;
    samples[arm.id] = arm.lastSampledValue;
  });

  let selectedArm: BanditArm;

  if (isExploratory) {
    // Epsilon exploration: Pick random arm
    const randIdx = Math.floor(Math.random() * banditArms.length);
    selectedArm = banditArms[randIdx];
  } else {
    // Thompson sampling: Pick arm with highest sample from posterior Beta distribution
    selectedArm = [...banditArms].sort((a, b) => (b.lastSampledValue || 0) - (a.lastSampledValue || 0))[0];
  }

  return { selectedArm, samples, isExploratory };
};

// Record reward for selected arm (click = +1, purchase = +2, bounce/skip = failure)
export const recordBanditReward = (armId: string, rewardType: 'click' | 'cart' | 'purchase' | 'skip') => {
  const arm = banditArms.find(a => a.id === armId);
  if (!arm) return;

  totalRounds++;
  arm.pulls++;

  let rewardValue = 0;
  if (rewardType === 'click') {
    arm.alpha += 1;
    arm.rewards += 1;
    rewardValue = 1;
  } else if (rewardType === 'cart') {
    arm.alpha += 2;
    arm.rewards += 2;
    rewardValue = 2;
  } else if (rewardType === 'purchase') {
    arm.alpha += 3;
    arm.rewards += 3;
    rewardValue = 3;
  } else {
    arm.beta += 1;
  }

  cumulativeReward += rewardValue;

  // Recompute estimated CTR & variance
  arm.estimatedCtr = Math.round((arm.alpha / (arm.alpha + arm.beta)) * 1000) / 1000;
  arm.variance = (arm.alpha * arm.beta) / (Math.pow(arm.alpha + arm.beta, 2) * (arm.alpha + arm.beta + 1));

  // Compute regret against optimal arm (Audio @ 0.34)
  const optimalCtr = 0.35;
  const roundRegret = Math.max(0, optimalCtr - arm.estimatedCtr);
  const lastRegret = regretHistory[regretHistory.length - 1]?.cumulativeRegret || 20;

  if (totalRounds % 20 === 0) {
    regretHistory.push({
      round: totalRounds,
      cumulativeRegret: Math.round((lastRegret + roundRegret) * 10) / 10,
      empiricalCtr: Math.round((cumulativeReward / totalRounds) * 1000) / 1000
    });
  }
};

export const getBanditTelemetry = (): BanditTelemetry => {
  return {
    totalRounds,
    cumulativeReward,
    cumulativeRegret: regretHistory[regretHistory.length - 1]?.cumulativeRegret || 21.8,
    explorationRate,
    arms: [...banditArms].sort((a, b) => b.estimatedCtr - a.estimatedCtr),
    regretHistory
  };
};

export const setExplorationRate = (rate: number) => {
  explorationRate = Math.max(0, Math.min(1.0, rate));
  return explorationRate;
};
