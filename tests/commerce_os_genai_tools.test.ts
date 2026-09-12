import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { genAiAgent } from '../src/backend/modules/ai/genAiAgentService';

describe('ShopSense AI Commerce OS - Phase 16 GenAI Agent & Tool-Calling Gateway Suite', () => {

  test('should declare complete schemas for all registered autonomous tools', () => {
    const tools = genAiAgent.getAvailableTools();
    assert.ok(tools.length >= 5, `Expected >= 5 registered tools, got ${tools.length}`);

    const toolNames = tools.map(t => t.name);
    assert.ok(toolNames.includes('searchCatalog'), 'Missing searchCatalog tool');
    assert.ok(toolNames.includes('checkDarkStoreDelivery'), 'Missing checkDarkStoreDelivery tool');
    assert.ok(toolNames.includes('verifyPrescriptionStatus'), 'Missing verifyPrescriptionStatus tool');
    assert.ok(toolNames.includes('calculateBazaarDiscount'), 'Missing calculateBazaarDiscount tool');
    assert.ok(toolNames.includes('getOrderStatus'), 'Missing getOrderStatus tool');

    // Verify parameter structure
    for (const tool of tools) {
      assert.ok(tool.description, `Tool ${tool.name} must have description`);
      assert.ok(typeof tool.parameters === 'object', `Tool ${tool.name} must define parameters`);
    }
  });

  test('should invoke checkDarkStoreDelivery tool on quick-commerce pincode queries', async () => {
    const response = await genAiAgent.processQuery('How fast can groceries be delivered to pincode 560038?');
    
    assert.strictEqual(response.intent, 'dark_store_check');
    assert.ok(response.toolsInvoked.length > 0);
    assert.strictEqual(response.toolsInvoked[0].tool, 'checkDarkStoreDelivery');
    assert.strictEqual(response.toolsInvoked[0].parameters.pincode, '560038');
    assert.ok(response.toolsInvoked[0].result.deliverySlaMinutes <= 10, 'SLA should be <= 10 min');
    assert.ok(response.message.includes('Indiranagar Dark Store #14'));
    assert.ok(response.suggestedActions.length > 0);
  });

  test('should invoke verifyPrescriptionStatus on pharmacy and Schedule H queries', async () => {
    const response = await genAiAgent.processQuery('Do I need a doctor prescription for Amoxicillin 500mg?');
    
    assert.strictEqual(response.intent, 'pharmacy_verification');
    assert.ok(response.toolsInvoked.length > 0);
    assert.strictEqual(response.toolsInvoked[0].tool, 'verifyPrescriptionStatus');
    assert.ok(response.message.includes('KA-PH-39402') || response.message.includes('Schedule H'));
    assert.ok(response.suggestedActions.some(a => a.action === 'open_prescription_modal'));
  });

  test('should invoke calculateBazaarDiscount on multi-buy volume pricing queries', async () => {
    const response = await genAiAgent.processQuery('What are the discounts in Bazaar if I buy multiple items?');
    
    assert.strictEqual(response.intent, 'bazaar_savings');
    assert.ok(response.toolsInvoked.length > 0);
    assert.strictEqual(response.toolsInvoked[0].tool, 'calculateBazaarDiscount');
    assert.ok(response.toolsInvoked[0].result.discountAmountINR > 0, 'Discount must be positive');
    assert.ok(response.message.includes('extra 10%') || response.message.includes('extra 15%'));
  });

  test('should invoke searchCatalog tool with hybrid RRF retrieval on product queries', async () => {
    const response = await genAiAgent.processQuery('Show me Apple MacBook Pro M3 laptops');
    
    assert.strictEqual(response.intent, 'product_search');
    assert.ok(response.toolsInvoked.length > 0);
    assert.strictEqual(response.toolsInvoked[0].tool, 'searchCatalog');
    assert.ok(response.toolsInvoked[0].result.length > 0, 'Should find products');
    assert.ok(response.message.includes('MacBook') || response.message.includes('Apple'));
  });

});
