import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mockPersonas } from '../src/data/personas';
import { mockProducts } from '../src/data/products';
import { candidateGeneratorInstance } from '../src/recommendation/retrieval/CandidateGenerator';
import { featureStoreInstance } from '../src/recommendation/feature-store/FeatureStore';
import { lambdaMARTRankerInstance } from '../src/recommendation/ranking/LambdaMARTRanker';
import { recommendationServiceInstance } from '../src/recommendation/RecommendationService';
import { eventBusInstance, UserInteractionEvent } from '../src/events/EventBus';
import { cacheServiceInstance, CacheService } from '../src/backend/services/CacheService';
import { modelRegistryInstance, DEFAULT_GATING_CRITERIA } from '../ml/registry/ModelRegistry';
import { modelMonitorInstance } from '../ml/monitoring/ModelMonitor';

describe('Target Systems Architecture & Modular RecSys Suite', () => {
  const alex = mockPersonas[0];
  const testProduct = mockProducts[0];

  describe('1. Candidate Generation & Multi-Channel Fusion', () => {
    it('should generate candidates across all 4 channels and fuse with deduplication', () => {
      const result = candidateGeneratorInstance.generate(alex, mockProducts);

      assert.ok(result.contentCandidates.length > 0, 'Must have content candidates');
      assert.ok(result.collabCandidates.length > 0, 'Must have collaborative candidates');
      assert.ok(result.sessionCandidates.length > 0, 'Must have session candidates');
      assert.ok(result.trendingCandidates.length > 0, 'Must have trending candidates');
      assert.ok(result.fusedCandidates.length > 0, 'Must have fused candidates');

      // Verify deduplication
      const ids = result.fusedCandidates.map(c => c.product.id);
      const uniqueIds = new Set(ids);
      assert.strictEqual(ids.length, uniqueIds.size, 'All fused candidate IDs must be unique');

      // Verify merged scores are within [0, 1]
      for (const cand of result.fusedCandidates) {
        assert.ok(cand.mergedScore >= 0 && cand.mergedScore <= 1, 'Merged score must be bounded');
      }
    });
  });

  describe('2. Feature Store Multi-Group Extraction', () => {
    it('should extract user, item, user_item, and session feature groups', () => {
      const featVector = featureStoreInstance.extractFeatures(testProduct, alex);

      assert.ok(featVector.user, 'User features must exist');
      assert.strictEqual(featVector.user.userId, alex.id);
      assert.ok(featVector.item, 'Item features must exist');
      assert.strictEqual(featVector.item.productId, testProduct.id);
      assert.ok(featVector.userItem, 'User x Item features must exist');
      assert.ok(featVector.session, 'Session features must exist');

      assert.ok(featVector.featureArray.length >= 8, 'Feature array must contain at least 8 dimensions');
      assert.strictEqual(featVector.featureArray.length, featVector.featureNames.length);
    });
  });

  describe('3. LambdaMART Learning-to-Rank Model', () => {
    it('should evaluate learned decision tree ensemble and return calibrated scores', () => {
      const featVector = featureStoreInstance.extractFeatures(testProduct, alex);
      const rankRes = lambdaMARTRankerInstance.rank(featVector, 0.75, true);

      assert.ok(rankRes.score > 0 && rankRes.score <= 1, 'Rank score must be within (0, 1]');
      assert.ok(Array.isArray(rankRes.attributions), 'Attributions must be an array');

      const totalPct = rankRes.attributions.reduce((acc, a) => acc + a.percentage, 0);
      assert.ok(totalPct >= 95 && totalPct <= 105, `Attribution percentages should sum to ~100% (was ${totalPct}%)`);
    });
  });

  describe('4. EventBus Pub/Sub & Telemetry Pipeline', () => {
    it('should publish events, trigger subscribers, and record in circular event buffer', () => {
      let receivedEvent: UserInteractionEvent | null = null;

      const unsubscribe = eventBusInstance.subscribe('cart', (evt) => {
        receivedEvent = evt;
      });

      const published = eventBusInstance.publish({
        userId: alex.id,
        sessionId: 'test-sess-1',
        eventType: 'cart',
        productId: testProduct.id,
        modelVersion: 'hybrid-lgbm-v3'
      });

      assert.ok(published.eventId, 'Event ID must be generated');
      assert.ok(receivedEvent, 'Subscriber must receive published event');
      assert.strictEqual((receivedEvent as any)?.productId, testProduct.id);

      unsubscribe();
    });
  });

  describe('5. CacheService TTL & Keyspaces', () => {
    it('should store and retrieve cached values and respect key prefixes', () => {
      cacheServiceInstance.clear();
      const testKey = CacheService.recKey('v5', alex.id, 'laptop');

      assert.strictEqual(cacheServiceInstance.get(testKey), null, 'Must be miss on empty cache');

      cacheServiceInstance.set(testKey, { sampleData: 123 }, 5);
      assert.strictEqual(cacheServiceInstance.has(testKey), true);

      const retrieved = cacheServiceInstance.get<{ sampleData: number }>(testKey);
      assert.deepStrictEqual(retrieved, { sampleData: 123 });

      const stats = cacheServiceInstance.getStats();
      assert.strictEqual(stats.hits, 1);
      assert.strictEqual(stats.misses, 1);
    });
  });

  describe('6. Model Registry & Automated Quality Gating SLA', () => {
    it('should register candidate models and reject promotion if SLA metrics fail', () => {
      // Register a sub-standard model
      const weakModel = modelRegistryInstance.register({
        name: 'Sub-standard Test Model',
        version: 'test-weak-v1',
        architecture: 'Experimental baseline',
        trainedOnEvents: 10000,
        metrics: {
          ndcgAt5: 0.40,
          ndcgAt10: 0.35, // Below 0.60 threshold
          precisionAt10: 0.30,
          recallAt10: 0.20,
          mapAt10: 0.30,
          mrr: 0.45,      // Below 0.70 threshold
          aucRoc: 0.65,
          ctrPercent: 2.0,
          conversionPercent: 1.0,
          catalogCoveragePercent: 50.0, // Below 75% threshold
          inferenceLatencyP95Ms: 65     // Above 50ms threshold
        }
      }, 'staging');

      assert.ok(weakModel);

      // Attempt promotion to production
      const rejectResult = modelRegistryInstance.promote('test-weak-v1', 'production', 50);
      assert.strictEqual(rejectResult.success, false, 'Should reject promotion due to SLA violations');
      assert.ok(rejectResult.violations && rejectResult.violations.length >= 3, 'Must report violations');

      // Promote valid production model
      const activeProd = modelRegistryInstance.getActiveProductionModel();
      assert.ok(activeProd, 'Must have active production model');
      assert.strictEqual(activeProd?.status, 'production');
    });
  });

  describe('7. Model Health & Population Stability Index (PSI) Drift Monitor', () => {
    it('should compute Population Stability Index and generate model health report', () => {
      const baseline = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const identical = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
      const zeroPsi = modelMonitorInstance.calculatePSI(baseline, identical);
      assert.strictEqual(zeroPsi, 0, 'Identical distributions must have 0 PSI');

      const report = modelMonitorInstance.evaluateModelHealth('hybrid-lgbm-v3', 0.078, 22);
      assert.ok(report, 'Health report must exist');
      assert.strictEqual(report.activeModelVersion, 'hybrid-lgbm-v3');
      assert.strictEqual(report.latencyStatus.withinSla, true);
      assert.ok(report.driftMetrics.length >= 2, 'Must evaluate multiple feature drift metrics');
    });
  });
});
