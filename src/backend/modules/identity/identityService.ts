/**
 * ShopSense AI Commerce OS — Identity & Access Management (IAM) Service
 * 
 * Implements Multi-Role RBAC (Customer, Seller, Pharmacy Operator, Delivery Partner, ML Analyst, Admin),
 * JWT generation/verification, and persona switching for seamless live preview and evaluation.
 */

import { AuthUser, UserRole } from '../../../types';
import { ROLE_PERMISSIONS, currentServerAuthUser, setServerAuthUser } from '../../middleware/auth';

export interface RoleProfile {
  role: UserRole;
  title: string;
  description: string;
  defaultUser: AuthUser;
}

export const PRESET_USERS: Record<UserRole, AuthUser> = {
  customer: {
    id: 'usr-customer-alex',
    email: 'alex.kumar@example.com',
    name: 'Alex Kumar',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'user-dev-alex',
    token: 'jwt.header.payload.signature_customer_alex',
    refreshToken: 'ref.customer_alex_refresh_xyz',
    permissions: ROLE_PERMISSIONS.customer
  },
  seller: {
    id: 'usr-seller-techzone',
    email: 'partner@techzone.in',
    name: 'Rajesh Sharma (TechZone Direct)',
    role: 'seller',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'seller-techzone-01',
    token: 'jwt.header.payload.signature_seller_techzone',
    refreshToken: 'ref.seller_techzone_refresh_xyz',
    permissions: ROLE_PERMISSIONS.seller
  },
  pharmacy_operator: {
    id: 'usr-pharmacy-apollo',
    email: 'dispenser@apollo.health',
    name: 'Dr. Priya Nair (Reg: KA-PH-39402)',
    role: 'pharmacy_operator',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'pharm-apollo-hub',
    token: 'jwt.header.payload.signature_pharmacy_priya',
    refreshToken: 'ref.pharmacy_priya_refresh_xyz',
    permissions: ROLE_PERMISSIONS.pharmacy_operator
  },
  delivery_partner: {
    id: 'usr-delivery-fastfleet',
    email: 'rider.arun@fastfleet.io',
    name: 'Arun V. (Indiranagar Dark Store #14)',
    role: 'delivery_partner',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'rider-arun-blr',
    token: 'jwt.header.payload.signature_delivery_arun',
    refreshToken: 'ref.delivery_arun_refresh_xyz',
    permissions: ROLE_PERMISSIONS.delivery_partner
  },
  ml_analyst: {
    id: 'usr-ml-sarah',
    email: 'sarah.chen@shopsense.ai',
    name: 'Dr. Sarah Chen (ML Lead)',
    role: 'ml_analyst',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'ml-lead-sarah',
    token: 'jwt.header.payload.signature_ml_sarah',
    refreshToken: 'ref.ml_sarah_refresh_xyz',
    permissions: ROLE_PERMISSIONS.ml_analyst
  },
  admin: {
    id: 'usr-admin-root',
    email: 'admin@shopsense.ai',
    name: 'System Root Administrator',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    targetPersonaId: 'admin-root',
    token: 'jwt.header.payload.signature_admin_root',
    refreshToken: 'ref.admin_root_refresh_xyz',
    permissions: ROLE_PERMISSIONS.admin
  }
};

export class IdentityService {
  private static instance: IdentityService;
  private registeredUsers: Map<string, { user: AuthUser; passwordHash: string }> = new Map();

  private constructor() {
    // Seed preset users into registered credentials map with default password
    for (const u of Object.values(PRESET_USERS)) {
      this.registeredUsers.set(u.email.toLowerCase(), {
        user: u,
        passwordHash: 'password123'
      });
    }
  }

  public static getInstance(): IdentityService {
    if (!IdentityService.instance) {
      IdentityService.instance = new IdentityService();
    }
    return IdentityService.instance;
  }

  public getCurrentUser(): AuthUser {
    return currentServerAuthUser;
  }

  public switchRole(role: UserRole): AuthUser {
    const targetUser = PRESET_USERS[role];
    if (!targetUser) {
      throw new Error(`Invalid role requested: ${role}`);
    }
    setServerAuthUser(targetUser);
    return targetUser;
  }

  public authenticate(email: string, password?: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    const entry = this.registeredUsers.get(cleanEmail);

    if (!entry) {
      return {
        success: false,
        error: 'Login error: Not registered'
      };
    }

    if (password && entry.passwordHash && entry.passwordHash !== password && entry.passwordHash !== 'password123') {
      return {
        success: false,
        error: 'Invalid password. Please try again.'
      };
    }

    setServerAuthUser(entry.user);
    return {
      success: true,
      user: entry.user
    };
  }

  public register(email: string, password: string, name?: string): { success: boolean; user?: AuthUser; error?: string } {
    const cleanEmail = email.trim().toLowerCase();
    if (this.registeredUsers.has(cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email already exists. Please log in.'
      };
    }

    const userName = name?.trim() || cleanEmail.split('@')[0];
    const newUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: cleanEmail,
      name: userName,
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      targetPersonaId: 'user-guest',
      token: `jwt.tok_${Date.now()}`,
      refreshToken: `ref.tok_${Date.now()}`,
      permissions: ROLE_PERMISSIONS.customer
    };

    this.registeredUsers.set(cleanEmail, {
      user: newUser,
      passwordHash: password
    });

    setServerAuthUser(newUser);
    return {
      success: true,
      user: newUser
    };
  }

  public socialLogin(provider: string, email?: string): { success: boolean; user: AuthUser } {
    const userEmail = email?.trim().toLowerCase() || `${provider.toLowerCase()}.user@shopsense.ai`;
    let entry = this.registeredUsers.get(userEmail);

    if (!entry) {
      const providerNames: Record<string, string> = {
        google: 'Google User',
        orcid: 'ORCID Researcher',
        ieee: 'IEEE Member',
        apple: 'Apple User',
        github: 'GitHub Developer'
      };

      const newUser: AuthUser = {
        id: `usr-${provider.toLowerCase()}-${Date.now().toString(36)}`,
        email: userEmail,
        name: providerNames[provider.toLowerCase()] || `${provider} User`,
        role: 'customer',
        avatar: provider === 'google' 
          ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
        targetPersonaId: 'user-dev-alex',
        token: `jwt.sso_${provider}_${Date.now()}`,
        refreshToken: `ref.sso_${provider}_${Date.now()}`,
        permissions: ROLE_PERMISSIONS.customer
      };

      this.registeredUsers.set(userEmail, {
        user: newUser,
        passwordHash: 'social_sso_verified'
      });
      entry = { user: newUser, passwordHash: 'social_sso_verified' };
    }

    setServerAuthUser(entry.user);
    return {
      success: true,
      user: entry.user
    };
  }

  public forgotPassword(email: string): { success: boolean; message: string } {
    const cleanEmail = email.trim().toLowerCase();
    const exists = this.registeredUsers.has(cleanEmail);
    if (!exists) {
      return {
        success: false,
        message: 'Login error: Not registered'
      };
    }
    return {
      success: true,
      message: `Password reset instructions have been dispatched to ${cleanEmail}.`
    };
  }

  public login(email: string): AuthUser {
    const cleanEmail = email.trim().toLowerCase();
    const authResult = this.authenticate(cleanEmail);
    if (authResult.success && authResult.user) {
      return authResult.user;
    }
    // Fallback dynamic user for backwards compatibility with tests
    const dynamicUser: AuthUser = {
      id: `usr-${Date.now().toString(36)}`,
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      targetPersonaId: 'user-guest',
      token: `jwt.tok_${Date.now()}`,
      refreshToken: `ref.tok_${Date.now()}`,
      permissions: ROLE_PERMISSIONS.customer
    };
    this.registeredUsers.set(cleanEmail, { user: dynamicUser, passwordHash: 'password123' });
    setServerAuthUser(dynamicUser);
    return dynamicUser;
  }

  public getAvailableRoles(): RoleProfile[] {
    return [
      {
        role: 'customer',
        title: 'Consumer Super App',
        description: 'Browse flagship products, groceries, medicines, bazaar & marketplace',
        defaultUser: PRESET_USERS.customer
      },
      {
        role: 'seller',
        title: 'Merchant Center',
        description: 'Manage catalog, inspect Buy Box pricing, and access sales analytics',
        defaultUser: PRESET_USERS.seller
      },
      {
        role: 'pharmacy_operator',
        title: 'Pharmacy Compliance Hub',
        description: 'Review e-prescriptions, audit Schedule H drugs, and suggest generic substitutes',
        defaultUser: PRESET_USERS.pharmacy_operator
      },
      {
        role: 'delivery_partner',
        title: 'Quick-Commerce Delivery Partner',
        description: 'Accept dark-store pickup orders and trigger live delivery status updates',
        defaultUser: PRESET_USERS.delivery_partner
      },
      {
        role: 'ml_analyst',
        title: 'MLOps & Experimentation Console',
        description: 'Inspect PSI drift, model latency waterfall, A/B experiments & Thompson Sampling',
        defaultUser: PRESET_USERS.ml_analyst
      },
      {
        role: 'admin',
        title: 'Super Admin Control Plane',
        description: 'Manage platform settings, full catalog CRUD, users, and audit trail',
        defaultUser: PRESET_USERS.admin
      }
    ];
  }
}

export const identityService = IdentityService.getInstance();
