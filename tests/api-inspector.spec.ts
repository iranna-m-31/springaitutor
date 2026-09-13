import { test, expect } from '@playwright/test';

test.describe('API Inspector', () => {
  test('should show different content for first two tabs', async ({ page }) => {
    // Navigate to a lesson page that has the API Inspector
    await page.goto('/lesson/what-is-llm');
    await page.waitForLoadState('networkidle');

    // Wait for the API Inspector to be visible
    const apiInspector = page.locator('.api-inspector');
    await expect(apiInspector).toBeVisible({ timeout: 10000 });

    // Check the tabs
    const localRequestTab = page.locator('.api-inspector-tab', { hasText: 'Local Request' });
    const springAiRequestTab = page.locator('.api-inspector-tab', { hasText: 'Spring AI Request' });
    const modelResponseTab = page.locator('.api-inspector-tab', { hasText: 'Model Response' });
    const requestFlowTab = page.locator('.api-inspector-tab', { hasText: 'Request Flow' });

    // Click Local Request tab and check content
    await localRequestTab.click();
    const localRequestContent = page.locator('.api-inspector-panel .code-container');
    await expect(localRequestContent).toContainText('POST /api/tutor/chat');

    // Click Spring AI Request tab and check content
    await springAiRequestTab.click();
    const springAiRequestContent = page.locator('.api-inspector-panel .code-container');
    await expect(springAiRequestContent).toContainText('ChatClient.builder(chatModel)');

    // Click Model Response tab and check content
    await modelResponseTab.click();
    const modelResponseContent = page.locator('.api-inspector-panel .code-container');
    await expect(modelResponseContent).toContainText('"choices"');

    // Click Request Flow tab and check the flow diagram
    await requestFlowTab.click();
    const flowContainer = page.locator('.flow-container');
    await expect(flowContainer).toBeVisible();

    // Check that there are 5 flow steps
    const flowSteps = page.locator('.flow-step');
    await expect(flowSteps).toHaveCount(5);

    // Check the first step has the number 1 and the globe icon
    const firstStepNumber = flowSteps.nth(0).locator('.flow-step-number');
    await expect(firstStepNumber).toHaveText('1');
    const firstStepIcon = flowSteps.nth(0).locator('.flow-icon');
    await expect(firstStepIcon).toHaveText('🌐');

    // Check the last step has the number 5 and the inbox icon
    const lastStepNumber = flowSteps.nth(4).locator('.flow-step-number');
    await expect(lastStepNumber).toHaveText('5');
    const lastStepIcon = flowSteps.nth(4).locator('.flow-icon');
    await expect(lastStepIcon).toHaveText('📥');
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone 6/7/8
    await page.goto('/lesson/what-is-llm');
    await page.waitForLoadState('networkidle');

    const apiInspector = page.locator('.api-inspector');
    await expect(apiInspector).toBeVisible({ timeout: 10000 });

    // Click the Request Flow tab
    await page.locator('.api-inspector-tab', { hasText: 'Request Flow' }).click();

    // On mobile, the flow steps should be stacked vertically
    const flowContainer = page.locator('.flow-container');
    await expect(flowContainer).toBeVisible();

    // Check the flow direction is column and arrow is down (not rotated)
    const flowArrow = page.locator('.flow-arrow').first();
    await expect(flowArrow).toHaveText('↓');

    // Also, the flow-step should be taking full width and aligned center
    const firstFlowStep = page.locator('.flow-step').first();
    await expect(firstFlowStep).toHaveCSS('align-items', 'center');
    await expect(firstFlowStep).toHaveCSS('text-align', 'center');
  });
});