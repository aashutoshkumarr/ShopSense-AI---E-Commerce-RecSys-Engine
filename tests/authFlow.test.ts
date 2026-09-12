import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { identityService, PRESET_USERS } from '../src/backend/modules/identity/identityService';

describe('ShopSense AI Authentication & Sign In / Log In Suite', () => {

  test('should return "Login error: Not registered" for unknown email on login', () => {
    const result = identityService.authenticate('nonexistent.user@unknown.com', 'mypassword123');
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.error, 'Login error: Not registered');
    assert.strictEqual(result.user, undefined);
  });

  test('should authenticate seeded preset customer with default password', () => {
    const result = identityService.authenticate('alex.kumar@example.com', 'password123');
    assert.strictEqual(result.success, true);
    assert.ok(result.user);
    assert.strictEqual(result.user?.role, 'customer');
    assert.strictEqual(result.user?.name, 'Alex Kumar');
  });

  test('should register a new customer account successfully and prevent duplicates', () => {
    const testEmail = `new.shopper.${Date.now()}@example.org`;
    const regResult = identityService.register(testEmail, 'SecurePass99!', 'Sneha Rao');
    assert.strictEqual(regResult.success, true);
    assert.ok(regResult.user);
    assert.strictEqual(regResult.user?.email, testEmail.toLowerCase());
    assert.strictEqual(regResult.user?.name, 'Sneha Rao');
    assert.strictEqual(regResult.user?.role, 'customer');

    // Duplicate registration attempt
    const dupResult = identityService.register(testEmail, 'AnotherPass!', 'Duplicate User');
    assert.strictEqual(dupResult.success, false);
    assert.ok(dupResult.error?.includes('already exists'));

    // Authenticate with the registered credentials
    const loginResult = identityService.authenticate(testEmail, 'SecurePass99!');
    assert.strictEqual(loginResult.success, true);
    assert.strictEqual(loginResult.user?.name, 'Sneha Rao');
  });

  test('should reject incorrect password for registered user', () => {
    const testEmail = `auth.test.${Date.now()}@example.org`;
    identityService.register(testEmail, 'CorrectPassword123', 'Test User');

    const failedLogin = identityService.authenticate(testEmail, 'WrongPassword!');
    assert.strictEqual(failedLogin.success, false);
    assert.ok(failedLogin.error?.includes('Invalid password'));
  });

  test('should authenticate via social SSO providers (Google, ORCID, IEEE)', () => {
    // 1. Google OAuth
    const googleAuth = identityService.socialLogin('google', 'test.google.user@gmail.com');
    assert.strictEqual(googleAuth.success, true);
    assert.ok(googleAuth.user.token.includes('sso_google'));
    assert.strictEqual(googleAuth.user.email, 'test.google.user@gmail.com');

    // 2. ORCID Researcher SSO
    const orcidAuth = identityService.socialLogin('orcid');
    assert.strictEqual(orcidAuth.success, true);
    assert.ok(orcidAuth.user.token.includes('sso_orcid'));
    assert.strictEqual(orcidAuth.user.name, 'ORCID Researcher');

    // 3. IEEE Member SSO
    const ieeeAuth = identityService.socialLogin('ieee');
    assert.strictEqual(ieeeAuth.success, true);
    assert.ok(ieeeAuth.user.token.includes('sso_ieee'));
    assert.strictEqual(ieeeAuth.user.name, 'IEEE Member');
  });

  test('should handle forgot password recovery requests', () => {
    const failResult = identityService.forgotPassword('nonexistent.user@random.org');
    assert.strictEqual(failResult.success, false);
    assert.strictEqual(failResult.message, 'Login error: Not registered');

    const successResult = identityService.forgotPassword('alex.kumar@example.com');
    assert.strictEqual(successResult.success, true);
    assert.ok(successResult.message.includes('Password reset instructions'));
  });

});
