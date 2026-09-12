import { Router, Request, Response } from 'express';
import { eventBusInstance, UserInteractionEvent } from '../../../events/EventBus';

export const eventRouter = Router();

// Ingest user telemetry interaction
eventRouter.post('/', (req: Request, res: Response) => {
  try {
    const {
      userId,
      sessionId = `sess-${Date.now()}`,
      eventType,
      productId,
      recommendationId,
      position,
      modelVersion = 'v5-hybrid-lightgbm-ranker',
      experimentId,
      variant,
      metadata = {}
    } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({ error: 'userId and eventType are required' });
    }

    const publishedEvent = eventBusInstance.publish({
      userId,
      sessionId,
      eventType,
      productId,
      recommendationId,
      position,
      modelVersion,
      experimentId,
      variant,
      metadata
    });

    res.status(201).json({
      status: 'accepted',
      event: publishedEvent,
      totalEvents: eventBusInstance.getEventCount()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to ingest event' });
  }
});

// Retrieve recent events
eventRouter.get('/', (req: Request, res: Response) => {
  const limit = Math.min(100, Number(req.query.limit) || 50);
  const filterType = req.query.type as any;
  const events = eventBusInstance.getRecentEvents(limit, filterType);

  res.json({
    events,
    count: events.length,
    totalIngested: eventBusInstance.getEventCount()
  });
});

// Server-Sent Events (SSE) live telemetry stream
eventRouter.get('/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const unsubscribe = eventBusInstance.subscribe('*', (event: UserInteractionEvent) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on('close', () => {
    unsubscribe();
  });
});
