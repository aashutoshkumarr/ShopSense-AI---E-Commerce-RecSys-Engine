/**
 * ShopSense AI Commerce OS — Identity & RBAC API Routes
 */

import { Router, Request, Response } from 'express';
import { identityService } from './identityService';
import { UserRole } from '../../../types';

export const identityRouter = Router();

/**
 * GET /api/auth/me
 * Returns current authenticated session profile & permissions
 */
identityRouter.get('/me', (req: Request, res: Response) => {
  const user = identityService.getCurrentUser();
  res.json({
    success: true,
    user
  });
});

/**
 * GET /api/auth/roles
 * Lists available RBAC profiles
 */
identityRouter.get('/roles', (req: Request, res: Response) => {
  const roles = identityService.getAvailableRoles();
  res.json({
    success: true,
    roles
  });
});

/**
 * POST /api/auth/switch-role
 * Switches server identity to test specific persona privileges
 */
identityRouter.post('/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Missing required field: role' });
  }

  try {
    const user = identityService.switchRole(role as UserRole);
    res.json({
      success: true,
      message: `Switched active identity to ${role}`,
      user
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * POST /api/auth/login
 * Authenticate with email & password (or fallback email)
 */
identityRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  // If password provided or strict authentication
  if (password !== undefined) {
    const authResult = identityService.authenticate(email, password);
    if (!authResult.success) {
      return res.status(401).json({
        success: false,
        error: authResult.error || 'Login error: Not registered'
      });
    }
    return res.json({
      success: true,
      message: 'Logged in successfully',
      user: authResult.user
    });
  }

  // Legacy quick login
  const user = identityService.login(email);
  return res.json({
    success: true,
    message: 'Logged in successfully',
    user
  });
});

/**
 * POST /api/auth/register
 * Create a new customer account
 */
identityRouter.post('/register', (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const result = identityService.register(email, password, name);
  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  return res.status(201).json({
    success: true,
    message: 'Account created and authenticated successfully',
    user: result.user
  });
});

/**
 * POST /api/auth/social
 * Social OAuth / SSO authentication (Google, ORCID, IEEE, Apple, GitHub)
 */
identityRouter.post('/social', (req: Request, res: Response) => {
  const { provider, email } = req.body;
  if (!provider) {
    return res.status(400).json({ error: 'OAuth provider is required' });
  }

  const result = identityService.socialLogin(provider, email);
  return res.json({
    success: true,
    message: `Authenticated via ${provider}`,
    user: result.user
  });
});

/**
 * POST /api/auth/forgot-password
 * Password recovery request
 */
identityRouter.post('/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const result = identityService.forgotPassword(email);
  if (!result.success) {
    return res.status(404).json({ success: false, error: result.message });
  }

  return res.json({
    success: true,
    message: result.message
  });
});

