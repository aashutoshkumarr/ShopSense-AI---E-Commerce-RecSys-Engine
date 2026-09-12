/**
 * ShopSense AI Commerce OS — GenAI Assistant & Tool-Calling API Routes
 */

import { Router, Request, Response } from 'express';
import { genAiAgent } from './genAiAgentService';

export const aiRouter = Router();

/**
 * GET /api/ai/tools
 * List all registered autonomous tools for the Commerce OS Agent
 */
aiRouter.get('/tools', (req: Request, res: Response) => {
  const tools = genAiAgent.getAvailableTools();
  res.json({
    success: true,
    count: tools.length,
    tools
  });
});

/**
 * POST /api/ai/chat
 * Multi-domain concierge query with tool invocation and reasoning trace
 */
aiRouter.post('/chat', async (req: Request, res: Response) => {
  const { query, userId } = req.body;
  if (!query) {
    return res.status(400).json({ error: 'Missing required field: query' });
  }

  try {
    const response = await genAiAgent.processQuery(query, userId || 'user-dev-alex');
    res.json({
      success: true,
      ...response
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Agent processing failed' });
  }
});
