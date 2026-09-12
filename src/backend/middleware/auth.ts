import { Request, Response, NextFunction } from 'express';
import { UserRole, AuthUser } from '../../types';

export let currentServerAuthUser: AuthUser = {
  id: 'usr-customer-alex',
  email: 'alex.kumar@example.com',
  name: 'Alex Kumar',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  targetPersonaId: 'user-dev-alex',
  token: 'jwt.header.payload.signature_mock_token_2026',
  refreshToken: 'ref.mock_refresh_token_2026_xyz',
  permissions: ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations']
};

export function setServerAuthUser(user: AuthUser): void {
  currentServerAuthUser = user;
}

export function getServerAuthUser(): AuthUser {
  return currentServerAuthUser;
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  customer: ['browse', 'search', 'cart', 'wishlist', 'orders', 'recommendations', 'wallet', 'marketplace_buy', 'prescriptions_upload'],
  seller: ['seller_dashboard', 'manage_listings', 'pricing_tools', 'inventory', 'sales_analytics'],
  pharmacy_operator: ['pharmacy_audit', 'verify_prescriptions', 'substitute_review', 'schedule_h_dispatch'],
  delivery_partner: ['delivery_trips', 'dark_store_pickup', 'order_status_update', 'live_tracking'],
  ml_analyst: ['model_metrics', 'experiments', 'retraining', 'feature_attribution', 'event_stream', 'model_versions'],
  admin: ['products_crud', 'categories', 'inventory', 'users', 'ingestion', 'analytics', 'experiments', 'all']
};

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

/**
 * Authentication middleware that attaches current authenticated user to request
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // In production, verify JWT token from Authorization header.
  // In development/test mode, resolve current session user.
  req.user = currentServerAuthUser;
  next();
}

/**
 * RBAC authorization middleware checking if user holds one of the required roles
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'customer';
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: `Forbidden: Access requires one of [${allowedRoles.join(', ')}] roles. Current role: ${userRole}`,
        currentRole: userRole,
        requiredRoles: allowedRoles
      });
    }
    next();
  };
}

/**
 * Fine-grained permission checker middleware
 */
export function requirePermission(permission: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const permissions = req.user?.permissions || ROLE_PERMISSIONS[req.user?.role || 'customer'] || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({
        error: `Forbidden: Missing required permission "${permission}"`,
        grantedPermissions: permissions
      });
    }
    next();
  };
}
