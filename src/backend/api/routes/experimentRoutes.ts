import { Router, Request, Response } from 'express';
import { ABExperiment } from '../../../types';
import { requireRole } from '../../middleware/auth';

export const experimentRouter = Router();

// In-memory experiment state
export const activeExperiment: ABExperiment = {
  id: 'exp-recsys-v5-lgbm',
  name: 'LightGBM LambdaMART LTR vs Baseline Hybrid',
  hypothesis: 'Evaluating learned decision tree ranking vs candidate merge score baseline',
  status: 'active',
  startDate: '2026-08-15T00:00:00.000Z',
  totalSessions: 97300,
  confidenceLevel: 99.2,
  pValue: 0.008,
  statisticallySignificant: true,
  winnerVariantId: 'variant_b',
  variantA: {
    id: 'variant_a',
    name: 'Control (Variant A)',
    description: 'Heuristic multi-channel candidate fusion without tree scoring',
    modelConfig: 'v4-baseline-hybrid',
    trafficAllocation: 50,
    impressions: 48200,
    clicks: 2795,
    addToCarts: 1890,
    purchases: 1060,
    revenueINR: 5141000,
    ctr: 0.058,
    cartRate: 0.039,
    conversionRate: 0.022,
    revenuePerSession: 106.6
  },
  variantB: {
    id: 'variant_b',
    name: 'Treatment (Variant B)',
    description: 'LightGBM LambdaMART GBDT Ranker + TreeSHAP attributions',
    modelConfig: 'v5-hybrid-lightgbm-ranker',
    trafficAllocation: 50,
    impressions: 49100,
    clicks: 4026,
    addToCarts: 2840,
    purchases: 1816,
    revenueINR: 8807600,
    ctr: 0.082,
    cartRate: 0.057,
    conversionRate: 0.037,
    revenuePerSession: 179.3
  }
};

/**
 * 32-bit FNV-1a hash function for deterministic variant assignment
 */
function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0);
}

// Assign user to variant deterministically
experimentRouter.post('/assign', (req: Request, res: Response) => {
  const { userId, experimentId = activeExperiment.id } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const combinedKey = `${userId}:${experimentId}`;
  const hashVal = fnv1aHash(combinedKey) % 100;
  const variant: 'A' | 'B' = hashVal < 50 ? 'A' : 'B';
  const assignedModel = variant === 'A' ? 'v4-baseline-hybrid' : 'v5-hybrid-lightgbm-ranker';

  res.json({
    experimentId,
    userId,
    variant,
    assignedModel,
    hashBucket: hashVal,
    splitRatio: '50/50'
  });
});

// Retrieve experiment status and metrics
experimentRouter.get('/', (req: Request, res: Response) => {
  const vA = activeExperiment.variantA;
  const vB = activeExperiment.variantB;

  vA.ctr = vA.impressions > 0 ? Math.round((vA.clicks / vA.impressions) * 1000) / 1000 : 0.058;
  vA.conversionRate = vA.clicks > 0 ? Math.round((vA.purchases / vA.clicks) * 1000) / 1000 : 0.022;

  vB.ctr = vB.impressions > 0 ? Math.round((vB.clicks / vB.impressions) * 1000) / 1000 : 0.082;
  vB.conversionRate = vB.clicks > 0 ? Math.round((vB.purchases / vB.clicks) * 1000) / 1000 : 0.037;

  const ctrUplift = vA.ctr > 0 ? Math.round(((vB.ctr - vA.ctr) / vA.ctr) * 1000) / 10 : 41.4;
  const convUplift = vA.conversionRate > 0 ? Math.round(((vB.conversionRate - vA.conversionRate) / vA.conversionRate) * 1000) / 10 : 68.2;

  res.json({
    experiment: activeExperiment,
    uplift: {
      ctrUpliftPct: ctrUplift,
      conversionUpliftPct: convUplift
    }
  });
});

// Reset or toggle experiment (requires ML Analyst or Admin)
experimentRouter.post('/status', requireRole(['admin', 'ml_analyst']), (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['active', 'completed', 'draft'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be active, completed, or draft.' });
  }

  activeExperiment.status = status as 'active' | 'completed' | 'draft';
  res.json({ status: 'success', experiment: activeExperiment });
});
