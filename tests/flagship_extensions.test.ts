import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { 
  initializeBuyBoxListings, 
  evaluateBuyBoxWinner, 
  getProductBuyBox, 
  simulateDynamicRepricing 
} from '../src/engine/buyBoxService';
import { 
  selectBanditArm, 
  recordBanditReward, 
  getBanditTelemetry, 
  setExplorationRate, 
  sampleBeta 
} from '../src/engine/banditService';
import { runRecSysBenchmark } from '../src/engine/benchmarkService';
import { getSmartProductBundle, getAllCatalogBundles } from '../src/engine/bundleService';
import { mockProducts } from '../src/data/products';

describe('Enterprise Commerce Flagship Extensions Test Suite', () => {

  // 1. Amazon-Grade Buy Box & Dynamic Repricer
  describe('Amazon-Grade Multi-Seller Buy Box & Dynamic Repricer', () => {
    test('should initialize verified seller listings and compute valid Buy Box scores', () => {
      initializeBuyBoxListings(mockProducts);
      const testProduct = mockProducts[0];
      const buyBox = getProductBuyBox(testProduct);

      assert.ok(buyBox, 'BuyBox result should exist');
      assert.ok(buyBox.winner, 'BuyBox must designate a winner');
      assert.ok(buyBox.winner.isWinner, 'Winner listing must have isWinner = true');
      assert.ok(buyBox.winner.buyBoxScore > 0, 'Winner score must be greater than 0');
      assert.ok(buyBox.competingListings.length >= 2, 'Should have competing seller listings');
    });

    test('should prioritize Prime fast shipping and high seller rating in winner selection', () => {
      const testProduct = mockProducts[0];
      const buyBox = getProductBuyBox(testProduct);

      assert.ok(buyBox.winner.deliveryDays <= 2, 'Winner should provide 1-2 day express delivery');
      assert.ok(buyBox.winner.seller.rating >= 4.5, 'Winner seller rating should be top-tier');
    });

    test('should simulate automated dynamic repricing auction round', () => {
      const testProduct = mockProducts[0];
      const initialBuyBox = getProductBuyBox(testProduct);
      const initialWinnerPrice = initialBuyBox.winner.priceINR;

      const repriced = simulateDynamicRepricing(testProduct.id);
      assert.ok(repriced, 'Repriced BuyBox result should exist');
      assert.ok(repriced.winner.priceINR <= initialWinnerPrice, 'Repricer should maintain or undercut competitive price');
    });
  });

  // 2. Contextual Thompson Sampling Multi-Armed Bandit
  describe('Contextual Thompson Sampling Multi-Armed Bandit Engine', () => {
    test('should draw valid Beta distribution samples within [0, 1]', () => {
      for (let i = 0; i < 20; i++) {
        const sample = sampleBeta(20, 80);
        assert.ok(sample >= 0 && sample <= 1, `Sample ${sample} must be bounded between 0 and 1`);
      }
    });

    test('should sample recommendation rounds and track posterior arm values', () => {
      const result = selectBanditArm(0.0); // pure Thompson sampling (0% random exploration)
      assert.ok(result.selectedArm, 'Should select an arm');
      assert.ok(typeof result.isExploratory === 'boolean', 'isExploratory flag must be boolean');
      assert.ok(Object.keys(result.samples).length >= 4, 'Must have samples for all candidate arms');
    });

    test('should update Alpha on positive rewards and increase estimated CTR', () => {
      const telemetryBefore = getBanditTelemetry();
      const arm = telemetryBefore.arms[0];
      const initialAlpha = arm.alpha;
      const initialPulls = arm.pulls;

      recordBanditReward(arm.id, 'purchase');
      const telemetryAfter = getBanditTelemetry();
      const updatedArm = telemetryAfter.arms.find(a => a.id === arm.id);

      assert.ok(updatedArm, 'Arm must exist');
      assert.ok(updatedArm.alpha > initialAlpha, 'Purchase reward must increment alpha');
      assert.ok(updatedArm.pulls > initialPulls, 'Pulls count must increment');
    });

    test('should maintain sub-linear cumulative regret telemetry', () => {
      const telemetry = getBanditTelemetry();
      assert.ok(telemetry.totalRounds >= 100, 'Should have interaction rounds recorded');
      assert.ok(telemetry.cumulativeRegret > 0, 'Cumulative regret should be positive');
      assert.ok(telemetry.regretHistory.length >= 3, 'Should have regret history timeline points');
    });
  });

  // 3. RecSys Systems Latency & Throughput Benchmark
  describe('Production Systems Latency & Throughput Benchmark Simulator', () => {
    test('should simulate high-concurrency workloads and return SLA percentiles', () => {
      const report = runRecSysBenchmark({
        concurrency: 50,
        totalRequests: 500,
        cacheEnabled: true,
        diversityEnabled: true
      });

      assert.ok(report, 'Benchmark report must exist');
      assert.ok(report.throughputQps > 100, 'Throughput should exceed 100 QPS');
      assert.ok(report.p50Ms > 0, 'p50 latency must be positive');
      assert.ok(report.p50Ms <= report.p90Ms, 'p50 <= p90');
      assert.ok(report.p90Ms <= report.p95Ms, 'p90 <= p95');
      assert.ok(report.p95Ms <= report.p99Ms, 'p95 <= p99');
      assert.ok(report.p99Ms <= 20, 'p99 latency should satisfy SLA target (< 20ms)');
    });

    test('should break down execution across all 6 pipeline waterfall stages', () => {
      const report = runRecSysBenchmark({
        concurrency: 20,
        totalRequests: 200,
        cacheEnabled: true,
        diversityEnabled: true
      });

      assert.equal(report.stages.length, 6, 'Must report all 6 execution stages');
      const stageNames = report.stages.map(s => s.stageName);
      assert.ok(stageNames.some(s => s.includes('HNSW Vector Embedding')), 'Must include HNSW retrieval stage');
      assert.ok(stageNames.some(s => s.includes('LightGBM LambdaMART')), 'Must include GBDT ranking stage');
      assert.ok(stageNames.some(s => s.includes('MMR Diversity')), 'Must include MMR diversity stage');
    });

    test('should compute valid latency histogram bins', () => {
      const report = runRecSysBenchmark({
        concurrency: 20,
        totalRequests: 200,
        cacheEnabled: true,
        diversityEnabled: true
      });

      const totalBinCount = report.latencyHistogram.reduce((sum, b) => sum + b.count, 0);
      assert.equal(totalBinCount, 200, 'Histogram bins must sum to totalRequests');
    });
  });

  // 4. Amazon "Frequently Bought Together" & Smart Bundles
  describe('Frequently Bought Together Smart Accessory Bundle Builder', () => {
    test('should generate complementary ecosystem bundle for primary product', () => {
      const laptop = mockProducts.find(p => p.category === 'Laptops') || mockProducts[0];
      const bundle = getSmartProductBundle(laptop, mockProducts);

      assert.ok(bundle, 'Bundle must be generated');
      assert.equal(bundle.primaryProduct.id, laptop.id, 'Primary product must match');
      assert.ok(bundle.bundleProducts.length >= 1, 'Should include complementary accessory products');
      assert.notEqual(bundle.bundleProducts[0].category, laptop.category, 'Complementary item should not duplicate primary category');
    });

    test('should calculate accurate 12% bundle savings and discounted price', () => {
      const audio = mockProducts.find(p => p.category === 'Audio') || mockProducts[1];
      const bundle = getSmartProductBundle(audio, mockProducts);

      const expectedSavings = Math.round(bundle.totalOriginalPriceINR * 0.12);
      assert.equal(bundle.savingsINR, expectedSavings, 'Savings INR should equal 12% of total raw price');
      assert.equal(bundle.bundlePriceINR, bundle.totalOriginalPriceINR - expectedSavings, 'Bundle price should subtract savings');
      assert.equal(bundle.savingsPct, 12, 'Savings pct must be 12%');
    });

    test('should generate catalog bundles across multiple verticals', () => {
      const bundles = getAllCatalogBundles(mockProducts);
      assert.ok(bundles.length >= 4, 'Should generate multiple catalog bundles');
      bundles.forEach(b => {
        assert.ok(b.bundlePriceINR < b.totalOriginalPriceINR, 'Every bundle must provide discount');
      });
    });
  });

});
