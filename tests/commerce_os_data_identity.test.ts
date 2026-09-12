import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { db } from '../src/backend/infrastructure/database/dbConnection';
import { redis, RedisKeyspaceService } from '../src/backend/infrastructure/cache/redisService';
import { identityService, PRESET_USERS } from '../src/backend/modules/identity/identityService';
import { ROLE_PERMISSIONS } from '../src/backend/middleware/auth';
import { UserRole } from '../src/types';

describe('ShopSense AI Commerce OS - Phase 2 & 3 Data & Identity Suite', () => {

  // ==========================================================================
  // Phase 2: Core Data Architecture & Storage Layer
  // ==========================================================================
  describe('Phase 2: Database Connection & Redis Keyspaces', () => {
    test('should report healthy database connection pool status with pgvector support', async () => {
      const health = await db.getHealth();
      assert.strictEqual(health.status, 'healthy');
      assert.strictEqual(health.database, 'shopsense_commerce_os');
      assert.strictEqual(health.pgvectorAvailable, true);
      assert.ok(health.poolSize > 0, 'Pool size must be positive');
      assert.ok(health.latencyMs >= 0, 'Latency must be non-negative');
    });

    test('should execute simulated relational queries and return populated rows', async () => {
      const result = await db.query('SELECT * FROM products');
      assert.ok(result.rowCount > 200, `Expected >200 catalog products, got ${result.rowCount}`);
      assert.ok(result.durationMs >= 0);

      const darkStores = await db.query('SELECT * FROM dark_stores');
      assert.strictEqual(darkStores.rowCount, 3, 'Expected 3 seeded dark stores');
    });

    test('should adhere to standard hierarchical Redis keyspaces', () => {
      assert.strictEqual(
        RedisKeyspaceService.keyspace.rec('user-101', 'grocery'),
        'recs:user-101:grocery'
      );
      assert.strictEqual(
        RedisKeyspaceService.keyspace.session('sess-xyz'),
        'session:sess-xyz:state'
      );
      assert.strictEqual(
        RedisKeyspaceService.keyspace.darkStoreStock('ds-blr-01', 'prod-milk-01'),
        'stock:ds-blr-01:prod-milk-01'
      );
    });

    test('should perform Redis get, set, atomic incr and TTL expiration', async () => {
      const testKey = 'test:counter:phase2';
      await redis.set(testKey, 10, 60);

      const val1 = await redis.get<number>(testKey);
      assert.strictEqual(val1, 10);

      const incVal = await redis.incr(testKey);
      assert.strictEqual(incVal, 11);

      const ttl = await redis.ttl(testKey);
      assert.ok(ttl > 0 && ttl <= 60, `TTL should be within (0, 60], got ${ttl}`);

      // Hashes
      await redis.hset('cart:hash:test', 'item1', JSON.stringify({ qty: 2 }));
      const hashVal = await redis.hget('cart:hash:test', 'item1');
      assert.ok(hashVal);
      assert.strictEqual(JSON.parse(hashVal).qty, 2);
    });
  });

  // ==========================================================================
  // Phase 3: Identity & Multi-Role User Architecture (RBAC)
  // ==========================================================================
  describe('Phase 3: Multi-Role RBAC Identity System', () => {
    test('should define complete permissions for all 6 Commerce OS roles', () => {
      const roles: UserRole[] = [
        'customer',
        'seller',
        'pharmacy_operator',
        'delivery_partner',
        'ml_analyst',
        'admin'
      ];

      for (const role of roles) {
        assert.ok(ROLE_PERMISSIONS[role], `Permissions missing for role: ${role}`);
        assert.ok(ROLE_PERMISSIONS[role].length > 0, `Permissions empty for role: ${role}`);
      }

      // Check specific role capabilities
      assert.ok(ROLE_PERMISSIONS.seller.includes('seller_dashboard'));
      assert.ok(ROLE_PERMISSIONS.pharmacy_operator.includes('verify_prescriptions'));
      assert.ok(ROLE_PERMISSIONS.delivery_partner.includes('dark_store_pickup'));
      assert.ok(ROLE_PERMISSIONS.ml_analyst.includes('model_metrics'));
      assert.ok(ROLE_PERMISSIONS.admin.includes('all'));
    });

    test('should switch active server identity across roles and personas', () => {
      // Switch to seller
      const seller = identityService.switchRole('seller');
      assert.strictEqual(seller.role, 'seller');
      assert.strictEqual(identityService.getCurrentUser().role, 'seller');
      assert.ok(seller.permissions.includes('pricing_tools'));

      // Switch to pharmacy operator
      const pharmacist = identityService.switchRole('pharmacy_operator');
      assert.strictEqual(pharmacist.role, 'pharmacy_operator');
      assert.ok(pharmacist.permissions.includes('schedule_h_dispatch'));

      // Switch to delivery partner
      const rider = identityService.switchRole('delivery_partner');
      assert.strictEqual(rider.role, 'delivery_partner');
      assert.ok(rider.permissions.includes('order_status_update'));

      // Switch back to customer
      const customer = identityService.switchRole('customer');
      assert.strictEqual(customer.role, 'customer');
      assert.strictEqual(customer.email, PRESET_USERS.customer.email);
    });

    test('should return all available role profiles for the switch-role UI', () => {
      const profiles = identityService.getAvailableRoles();
      assert.strictEqual(profiles.length, 6);
      const roleNames = profiles.map(p => p.role);
      assert.ok(roleNames.includes('customer'));
      assert.ok(roleNames.includes('seller'));
      assert.ok(roleNames.includes('pharmacy_operator'));
      assert.ok(roleNames.includes('delivery_partner'));
      assert.ok(roleNames.includes('ml_analyst'));
      assert.ok(roleNames.includes('admin'));
    });
  });

});
