export interface DriftMetric {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  psiScore: number;
  driftStatus: 'STABLE' | 'MODERATE_DRIFT' | 'SEVERE_DRIFT';
}

export interface ModelHealthReport {
  timestamp: string;
  activeModelVersion: string;
  overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  driftMetrics: DriftMetric[];
  ctrStatus: {
    baselineCtr: number;
    currentCtr: number;
    degradationPct: number;
    isAlarming: boolean;
  };
  latencyStatus: {
    p95LatencyMs: number;
    slaLimitMs: number;
    withinSla: boolean;
  };
  recommendations: string[];
}

export class ModelMonitor {
  /**
   * Calculates Population Stability Index (PSI) between baseline and production distributions
   * PSI < 0.1: No significant change (STABLE)
   * 0.1 <= PSI < 0.25: Moderate change (MODERATE_DRIFT)
   * PSI >= 0.25: Significant change (SEVERE_DRIFT)
   */
  public calculatePSI(baseline: number[], production: number[], bins: number = 5): number {
    if (baseline.length === 0 || production.length === 0) return 0;

    let psi = 0;
    const binStep = 1.0 / bins;

    for (let i = 0; i < bins; i++) {
      const low = i * binStep;
      const high = (i + 1) * binStep;

      const baseCount = baseline.filter(v => v >= low && v < high).length;
      const prodCount = production.filter(v => v >= low && v < high).length;

      const basePct = Math.max(0.0001, baseCount / baseline.length);
      const prodPct = Math.max(0.0001, prodCount / production.length);

      psi += (prodPct - basePct) * Math.log(prodPct / basePct);
    }

    return Math.round(psi * 1000) / 1000;
  }

  /**
   * Generates real-time Model Health & Drift Report
   */
  public evaluateModelHealth(
    activeModelVersion: string = 'hybrid-lgbm-v3',
    currentCtr: number = 0.074,
    currentLatencyP95: number = 24
  ): ModelHealthReport {
    // Simulated synthetic distributions for feature drift analysis
    const baselineFeatures = Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1);
    const prodFeatures = Array.from({ length: 200 }, () => Math.random() * 0.75 + 0.15);

    const psi1 = this.calculatePSI(baselineFeatures, prodFeatures);
    const psi2 = this.calculatePSI(
      baselineFeatures,
      baselineFeatures.map(v => Math.min(0.99, v * 1.05))
    );

    const driftMetrics: DriftMetric[] = [
      {
        metricName: 'User Persona Category Affinity',
        baselineValue: 0.62,
        currentValue: 0.64,
        psiScore: psi1,
        driftStatus: psi1 >= 0.25 ? 'SEVERE_DRIFT' : psi1 >= 0.1 ? 'MODERATE_DRIFT' : 'STABLE'
      },
      {
        metricName: 'Semantic Vector Cosine Similarity',
        baselineValue: 0.78,
        currentValue: 0.76,
        psiScore: psi2,
        driftStatus: psi2 >= 0.25 ? 'SEVERE_DRIFT' : psi2 >= 0.1 ? 'MODERATE_DRIFT' : 'STABLE'
      },
      {
        metricName: 'Historical Product CTR Prior',
        baselineValue: 0.065,
        currentValue: 0.071,
        psiScore: 0.042,
        driftStatus: 'STABLE'
      }
    ];

    const baselineCtr = 0.080;
    const degradation = Math.round(((baselineCtr - currentCtr) / baselineCtr) * 1000) / 10;
    const isAlarming = degradation > 15.0; // Alert if CTR drops >15%

    const slaLimit = 50;
    const withinSla = currentLatencyP95 <= slaLimit;

    const hasSevereDrift = driftMetrics.some(d => d.driftStatus === 'SEVERE_DRIFT');
    const hasModerateDrift = driftMetrics.some(d => d.driftStatus === 'MODERATE_DRIFT');

    let overallHealth: 'HEALTHY' | 'DEGRADED' | 'CRITICAL' = 'HEALTHY';
    if (isAlarming || hasSevereDrift || !withinSla) {
      overallHealth = 'CRITICAL';
    } else if (hasModerateDrift || degradation > 8.0) {
      overallHealth = 'DEGRADED';
    }

    const recommendations: string[] = [];
    if (overallHealth === 'HEALTHY') {
      recommendations.push('Model ranking distribution is statistically aligned with baseline training dataset.');
      recommendations.push('Online inference latency is well within the 50ms SLA boundary.');
    } else {
      if (hasSevereDrift) recommendations.push('Trigger automated retraining pipeline on recent interaction window.');
      if (isAlarming) recommendations.push('Consider falling back to staging model or increasing exploration rate.');
      if (!withinSla) recommendations.push('Inspect feature store calculation latency or scale candidate cache.');
    }

    return {
      timestamp: new Date().toISOString(),
      activeModelVersion,
      overallHealth,
      driftMetrics,
      ctrStatus: {
        baselineCtr,
        currentCtr,
        degradationPct: degradation,
        isAlarming
      },
      latencyStatus: {
        p95LatencyMs: currentLatencyP95,
        slaLimitMs: slaLimit,
        withinSla
      },
      recommendations
    };
  }
}

export const modelMonitorInstance = new ModelMonitor();
