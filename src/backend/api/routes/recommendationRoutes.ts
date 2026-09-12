import { Router, Request, Response } from 'express';
import { recommendationServiceInstance } from '../../../recommendation/RecommendationService';
import { mockPersonas } from '../../../data/personas';
import { getProductCatalog } from '../../../engine/ingestionService';
import { parseNaturalLanguageIntent, generateRecommendationExplanation } from '../../../engine/semanticIntentService';
import {
  selectBanditArm,
  recordBanditReward,
  getBanditTelemetry,
  setExplorationRate
} from '../../../engine/banditService';
import { runRecSysBenchmark } from '../../../engine/benchmarkService';
import { activeExperiment } from './experimentRoutes';
import { BenchmarkConfig } from '../../../types';

export const recommendationRouter = Router();

// Main Recommendation Pipeline Execution
recommendationRouter.post('/recommendations', (req: Request, res: Response) => {
  try {
    const {
      userId = 'user-dev-alex',
      intent = null,
      sessionEvents = [],
      configOverride = null,
      forceRefresh = false
    } = req.body;

    if (configOverride) {
      recommendationServiceInstance.updateConfig(configOverride);
    }

    const user = mockPersonas.find(p => p.id === userId) || mockPersonas[0];
    const result = recommendationServiceInstance.executePipeline(
      user,
      sessionEvents,
      intent,
      forceRefresh,
      getProductCatalog()
    );

    // Record impressions for A/B testing
    if (result.topKResults.length > 0) {
      activeExperiment.variantB.impressions += result.topKResults.length;
      activeExperiment.variantA.impressions += result.topKResults.length;
    }

    res.json(result);
  } catch (error: any) {
    console.error('[recommendationRouter] Pipeline error:', error);
    res.status(500).json({ error: error.message || 'Pipeline execution failed' });
  }
});

// Explain Recommendation Candidate
recommendationRouter.post('/explain-recommendation', (req: Request, res: Response) => {
  try {
    const { product, userPersona, scoreData } = req.body;
    if (!product || !userPersona) {
      return res.status(400).json({ error: 'product and userPersona are required' });
    }

    const explanation = generateRecommendationExplanation(product, userPersona, scoreData);
    res.json(explanation);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate explanation' });
  }
});

// Natural Language Intent Parsing
recommendationRouter.post('/parse-intent', (req: Request, res: Response) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query string required' });
  }

  const intent = parseNaturalLanguageIntent(query);
  res.json({ intent });
});

// Contextual Multi-Armed Bandit
recommendationRouter.post('/bandit/select', (req: Request, res: Response) => {
  try {
    const { context = {} } = req.body;
    const selection = selectBanditArm(context);
    res.json(selection);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to sample bandit arm' });
  }
});

recommendationRouter.post('/bandit/reward', (req: Request, res: Response) => {
  try {
    const { armId, rewardType = 'click' } = req.body;
    if (!armId) {
      return res.status(400).json({ error: 'armId is required' });
    }

    const validTypes = ['click', 'cart', 'purchase', 'skip'] as const;
    const validReward = validTypes.includes(rewardType) ? rewardType : 'click';

    recordBanditReward(armId, validReward);
    const telemetry = getBanditTelemetry();
    res.json({ status: 'success', telemetry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record bandit reward' });
  }
});

recommendationRouter.get('/bandit/telemetry', (req: Request, res: Response) => {
  const telemetry = getBanditTelemetry();
  res.json(telemetry);
});

recommendationRouter.post('/bandit/rate', (req: Request, res: Response) => {
  const { rate } = req.body;
  if (rate === undefined || Number(rate) < 0 || Number(rate) > 1) {
    return res.status(400).json({ error: 'Rate must be a float between 0.0 and 1.0' });
  }

  const updated = setExplorationRate(Number(rate));
  res.json({ status: 'success', explorationRate: updated });
});

// RecSys Systems Latency & Throughput Benchmark
recommendationRouter.post('/benchmark/run', (req: Request, res: Response) => {
  try {
    const { concurrency = 50, totalRequests = 500, cacheEnabled = true, diversityEnabled = true } = req.body;
    const config: BenchmarkConfig = {
      concurrency: Number(concurrency),
      totalRequests: Number(totalRequests),
      cacheEnabled: Boolean(cacheEnabled),
      diversityEnabled: Boolean(diversityEnabled)
    };
    const result = runRecSysBenchmark(config);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Benchmark run failed' });
  }
});
