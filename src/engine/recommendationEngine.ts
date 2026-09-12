import {
  Product,
  UserPersona,
  PipelineConfig,
  PipelineExecutionResult,
  UserEvent,
  StructuredIntent
} from '../types';
import { dynamicProductCatalog } from './ingestionService';
import { mockProducts } from '../data/products';
import {
  RecommendationService,
  defaultPipelineConfig,
  recommendationServiceInstance
} from '../recommendation/RecommendationService';

export { defaultPipelineConfig, RecommendationService };

/**
 * RecommendationEngine forwards to the modular RecommendationService architecture
 * preserving full backward compatibility with all UI components and tests.
 */
export class RecommendationEngine {
  private service: RecommendationService;

  constructor(products: Product[] = dynamicProductCatalog, config: PipelineConfig = defaultPipelineConfig) {
    this.service = new RecommendationService(products, config);
  }

  public setCatalog(products: Product[]) {
    this.service.setCatalog(products);
  }

  public updateConfig(newConfig: Partial<PipelineConfig>) {
    this.service.updateConfig(newConfig);
  }

  public getConfig(): PipelineConfig {
    return this.service.getConfig();
  }

  public executePipeline(
    user: UserPersona,
    sessionEvents: UserEvent[] = [],
    intent?: StructuredIntent | null,
    forceRefresh: boolean = false,
    catalogOverride?: Product[]
  ): PipelineExecutionResult {
    return this.service.executePipeline(user, sessionEvents, intent, forceRefresh, catalogOverride);
  }
}

export const recommendationEngineInstance = new RecommendationEngine(
  dynamicProductCatalog.length > 0 ? dynamicProductCatalog : mockProducts,
  defaultPipelineConfig
);
