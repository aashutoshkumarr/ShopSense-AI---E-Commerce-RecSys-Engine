export type UserInteractionEventType =
  | 'view'
  | 'click'
  | 'search'
  | 'wishlist'
  | 'cart'
  | 'purchase'
  | 'recommendation_click'
  | 'recommendation_impression'
  | 'session_start';

export interface UserInteractionEvent {
  eventId: string;
  userId: string;
  sessionId: string;
  eventType: UserInteractionEventType;
  productId?: string;
  recommendationId?: string;
  position?: number;
  modelVersion: string;
  experimentId?: string;
  variant?: 'A' | 'B';
  timestamp: string;
  metadata?: Record<string, any>;
}

export type EventHandler = (event: UserInteractionEvent) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventLog: UserInteractionEvent[] = [];
  private maxLogSize: number = 10000;

  /**
   * Subscribe to specific event type or wildcard '*'
   */
  public subscribe(eventType: UserInteractionEventType | '*', handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);

    // Return unsubscribe callback
    return () => {
      this.handlers.get(eventType)?.delete(handler);
    };
  }

  /**
   * Publish an event onto the bus
   */
  public publish(event: Omit<UserInteractionEvent, 'eventId' | 'timestamp'> & { eventId?: string; timestamp?: string }): UserInteractionEvent {
    const fullEvent: UserInteractionEvent = {
      ...event,
      eventId: event.eventId || `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: event.timestamp || new Date().toISOString()
    };

    // Store in internal circular log
    this.eventLog.push(fullEvent);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.splice(0, this.eventLog.length - this.maxLogSize);
    }

    // Trigger exact type handlers
    const exactHandlers = this.handlers.get(fullEvent.eventType);
    if (exactHandlers) {
      exactHandlers.forEach(h => {
        try {
          h(fullEvent);
        } catch (err) {
          console.error(`[EventBus] Error in handler for ${fullEvent.eventType}:`, err);
        }
      });
    }

    // Trigger wildcard handlers
    const wildcardHandlers = this.handlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(h => {
        try {
          h(fullEvent);
        } catch (err) {
          console.error(`[EventBus] Error in wildcard handler:`, err);
        }
      });
    }

    return fullEvent;
  }

  /**
   * Returns recent events for telemetry and analytics
   */
  public getRecentEvents(limit: number = 50, filterType?: UserInteractionEventType): UserInteractionEvent[] {
    const filtered = filterType
      ? this.eventLog.filter(e => e.eventType === filterType)
      : this.eventLog;
    return filtered.slice(-limit).reverse();
  }

  public getEventCount(): number {
    return this.eventLog.length;
  }

  public clear(): void {
    this.eventLog = [];
  }
}

export const eventBusInstance = new EventBus();
