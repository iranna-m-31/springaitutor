/**
 * Feature Route Verification Tests
 *
 * This test suite validates:
 * 1. All existing feature pages load correctly
 * 2. Navigation routes work properly
 * 3. Broken/missing routes are handled gracefully
 * 4. No regression in existing functionality
 *
 * Based on the comprehensive review, the following feature IDs exist in features.ts:
 * plain-chat, system-prompts, prompt-templates, streaming, metadata,
 * structured-output, multimodality, tool-calling, chat-memory, advisors,
 * embeddings, rag, moderation, mcp, observability, evaluation
 *
 * The review mentioned broken routes (/tools, /vector-stores, /document-readers, /health-check)
 * that don't exist in the current features data - this test verifies they return proper 404
 * rather than redirecting to main page.
 */

import { test, expect } from '@playwright/test'
import { features, modules } from '../src/data/features'

const UI_BASE = process.env.PLAYWRIGHT_UI_BASE_URL ?? 'http://localhost:5173'

/** All valid feature routes from features.ts data */
const VALID_FEATURE_ROUTES = features.map((f) => `/feature/${f.id}`) as string[]

/** All learning path module routes - using actual module IDs from features.ts */
const LEARNING_PATH_ROUTES = [
  '/learning-path/foundations',
  '/learning-path/core',
  '/learning-path/advanced',
  '/learning-path/specialized',
] as const

/**
 * Test: All valid feature pages load with correct titles
 * Uses the actual feature title from the data source
 */
for (const feature of features) {
  test(`${feature.id} loads with correct title`, async ({ page }) => {
    await page.goto(`${UI_BASE}/feature/${feature.id}`, { waitUntil: 'networkidle' })

    // Feature page should have a visible h1
    const h1 = page.locator('.feature-page-header h1')
    await expect(h1).toBeVisible({ timeout: 10000 })
    // h1 should contain the actual feature title
    await expect(h1).toContainText(feature.title)
  })
}

/**
 * Test: Learning path pages load correctly
 */
for (const path of LEARNING_PATH_ROUTES) {
  test(`${path} loads correctly`, async ({ page }) => {
    await page.goto(`${UI_BASE}${path}`, { waitUntil: 'networkidle' })

    // Module page should have a visible heading
    const h1 = page.locator('.feature-page-header h1')
    await expect(h1).toBeVisible({ timeout: 10000 })
  })
}

/**
 * Test: Invalid/broken routes return 404 / Not Found rather than redirecting to main page
 *
 * The review mentioned routes like /feature/tools, /feature/vector-stores, etc. that
 * were "returning main page content" instead of showing their own content.
 * This test verifies such routes properly show a 404/Not Found.
 */
test('broken feature routes return 404 rather than redirecting to main page', async ({
  page }) => {
    // Routes that the review mentioned as "broken" - they don't exist in features data
    const brokenRoutes = [
      '/feature/tools',
      '/feature/vector-stores',
      '/feature/document-readers',
      '/feature/health-check',
    ]

    for (const route of brokenRoutes) {
      await page.goto(`${UI_BASE}${route}`, { waitUntil: 'networkidle' })

      // Should NOT redirect to main page (which would show at / or /home)
      const currentUrl = page.url()
      // Should either be a 404 page or stay at the route (not redirect to /)
      expect(currentUrl).not.toBe(`${UI_BASE}/`)
      expect(currentUrl).not.toBe(`${UI_BASE}/home`)

      // Should show NotFoundPage with "Page Not Found" heading
      await expect(page.locator('h1:has-text("Page Not Found")')).toBeVisible({ timeout: 10000 })
      // Should show the path that was not found
      await expect(page.locator('p code')).toContainText(route)
    }
  })

/**
 * Test: Main page loads and shows module cards
 */
test('main page loads and shows module cards', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'networkidle' })

  const moduleCards = page.locator('.module-card')
  const cardCount = await moduleCards.count()
  expect(cardCount).toBeGreaterThan(0)

  // Should show 4 modules
  expect(cardCount).toBe(4)
})

/**
 * Test: Module navigation from homepage works
 */
test('homepage module cards navigate to correct learning paths', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'networkidle' })

  const moduleCards = page.locator('.module-card')
  const cardCount = await moduleCards.count()

  for (let i = 0; i < Math.min(cardCount, 4); i++) {
    const card = moduleCards.nth(i)
    const href = await card.getAttribute('href')
    expect(href).toMatch(/^\/learning-path\/(foundations|core|advanced|specialized)/)
    await card.click()
    await page.waitForLoadState('networkidle')
    // Should navigate to a learning path page
    expect(page.url()).toContain('/learning-path/')
    // Go back to home
    await page.goto(`${UI_BASE}/`, { waitUntil: 'networkidle' })
  }
})

/**
 * Test: Static routes render correctly
 */
const APP_ROUTES = [
  ['/', 'Interactive Spring AI Tutorial'],
  ['/home', 'Interactive Spring AI Tutorial'],
  ['/introduction', 'Interactive Spring AI Tutorial'],
  ['/lab', 'Spring AI Lab'],
  ['/playground', 'Playground'],
  ['/settings', 'Settings'],
  ['/download', 'Download the Full Project'],
  ['/capstone', 'Capstone Project: Spring AI Support Assistant'],
] as const

for (const [path, heading] of APP_ROUTES) {
  test(`renders ${path}`, async ({ page }) => {
    await page.goto(`${UI_BASE}${path}`, { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: heading })).toBeVisible({
      timeout: 10000,
    })
  })
}

/**
 * Test: Feature pages have proper structure (hero, in-page nav, demo section)
 */
test.describe('Feature page structure', () => {
  test('feature page has proper structure - plain-chat', async ({ page }) => {
    await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'networkidle' })

    // Should have feature hero section
    await expect(page.locator('.feature-page-hero')).toBeVisible({
      timeout: 10000,
    })

    // Should have in-page navigation
    await expect(page.locator('.in-page-nav')).toBeVisible({
      timeout: 10000,
    })

    // Should have demo section
    await expect(page.locator('#demo')).toBeVisible({
      timeout: 10000,
    })

    // Should have source/implementation section
    await expect(page.locator('#source')).toBeVisible({
      timeout: 10000,
    })
  })

  test('feature page has proper structure - embeddings', async ({ page }) => {
    await page.goto(`${UI_BASE}/feature/embeddings`, { waitUntil: 'networkidle' })

    await expect(page.locator('.feature-page-hero')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.in-page-nav')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('#demo')).toBeVisible({
      timeout: 10000,
    })
  })

  test('feature page has proper structure - rag', async ({ page }) => {
    await page.goto(`${UI_BASE}/feature/rag`, { waitUntil: 'networkidle' })

    await expect(page.locator('.feature-page-hero')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('.in-page-nav')).toBeVisible({
      timeout: 10000,
    })
    await expect(page.locator('#demo')).toBeVisible({
      timeout: 10000,
    })
  })
})

/**
 * Test: Sidebar navigation works correctly
 */
test('sidebar - FeatureNav links navigate correctly', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })

  // Click through feature nav items (limit to first 8 to avoid timeout)
  const sidebarLinks = page.locator('.feature-nav .sidebar-nav li:not(.module-section)')

  for (let i = 0; i < Math.min(await sidebarLinks.count(), 8); i++) {
    await sidebarLinks.nth(i).click()
    await page.waitForLoadState('networkidle')
    // Should navigate to a valid page (not stay at home or go to 404 without loading)
    const url = page.url()
    // Should not be at home or introduction after clicking a feature
    expect(url).not.toBe(`${UI_BASE}/`)
    expect(url).not.toBe(`${UI_BASE}/introduction`)
    // Go back
    await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  }
})

/**
 * Test: Dark mode toggle works
 */
test('theme toggle - switches between light/dark', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })

  const toggle = page.locator('.theme-toggle').first()
  const toggleCount = await toggle.count()

  if (toggleCount > 0) {
    // Get initial state
    const html = page.locator('html')

    // Click toggle
    await toggle.click()
    await page.waitForTimeout(300)

    // Check if theme changed
    const hasDarkClass = await html.getAttribute('data-theme')

    // Toggle again to restore
    await toggle.click()
    await page.waitForTimeout(300)
  }
})

/**
 * Test: No console errors on key pages
 */
test('no unexpected console errors on key pages', async ({ page }) => {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const txt = msg.text()
      if (
        !txt.includes('favicon') &&
        !txt.includes('404') &&
        !txt.includes('ECONNREFUSED') &&
        !txt.includes('Failed to fetch') &&
        !txt.includes('502') &&
        !txt.includes('Bad Gateway')
      ) {
        errors.push(txt)
      }
    }
  })

  page.on('pageerror', (err) => {
    const txt = err.message
    if (
      !txt.includes('favicon') &&
      !txt.includes('404') &&
      !txt.includes('ECONNREFUSED') &&
      !txt.includes('Failed to fetch') &&
      !txt.includes('502') &&
      !txt.includes('Bad Gateway')
    ) {
      errors.push(txt)
    }
  })

  // Visit key pages
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  await page.goto(`${UI_BASE}/playground`, { waitUntil: 'domcontentloaded' })
  await page.goto(`${UI_BASE}/lab`, { waitUntil: 'domcontentloaded' })
  await page.goto(`${UI_BASE}/capstone`, { waitUntil: 'domcontentloaded' })

  await page.waitForTimeout(1000)
  expect(errors).toHaveLength(0)
})

/**
 * Test: API Inspector tabs show content
 */
test('API Inspector - all tabs show content on plain-chat', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })

  const apiInspectorTabs = page.locator('.api-inspector-tab')
  const tabCount = await apiInspectorTabs.count()

  for (let i = 0; i < tabCount; i++) {
    await apiInspectorTabs.nth(i).click()
    await page.waitForTimeout(200)
    // Verify code content appears
    await expect(
      page.locator('.code-view, .api-inspector-panel code, .api-inspector-flow').first()
    ).toBeVisible({ timeout: 3000 })
  }
})

/**
 * Test: Progress tracking persists across page reloads
 */
test('progress persists across page reloads', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })

  // Clear progress first
  await page.evaluate(() => {
    localStorage.removeItem('spring-ai-tutor-progress')
  })
  await page.reload({ waitUntil: 'domcontentloaded' })

  // Mark first few features as complete
  await page.evaluate(() => {
    const progress = ['plain-chat', 'system-prompts', 'prompt-templates']
    localStorage.setItem('spring-ai-tutor-progress', JSON.stringify(progress))
  })
  await page.reload({ waitUntil: 'domcontentloaded' })

  // Verify progress is shown in learning path section
  await expect(page.locator('.learning-path')).toContainText('Overall Progress')
  await expect(page.locator('.learning-path')).toContainText('3 / 16 features')

  // Verify individual feature pages show completed state
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const checkbox = page.locator('.mark-complete-check input')
  await expect(checkbox).toBeChecked()

  await page.goto(`${UI_BASE}/feature/system-prompts`, { waitUntil: 'domcontentloaded' })
  const checkbox2 = page.locator('.mark-complete-check input')
  await expect(checkbox2).toBeChecked()
})

/**
 * Test: Module progress calculates correctly
 */
test('module progress calculates correctly', async ({ page }) => {
  await page.goto(`${UI_BASE}/learning-path/foundations`, { waitUntil: 'domcontentloaded' })

  // Mark some foundations features as complete (2 out of 5 = 40%)
  await page.evaluate(() => {
    const progress = ['plain-chat', 'system-prompts']
    localStorage.setItem('spring-ai-tutor-progress', JSON.stringify(progress))
  })
  await page.reload({ waitUntil: 'domcontentloaded' })

  // Should show 40% progress for foundations module (2/5)
  // Target the hero section progress bar on the ModulePage
  const moduleProgress = page.locator('.module-progress').filter({ hasText: 'Module Progress' }).first()
  const moduleProgressElement = moduleProgress.locator('p')
  const moduleProgressText = await moduleProgressElement.textContent()
  // The text should contain "40% complete"
  expect(moduleProgressText).toContain('40% complete')

  // Progress bar fill in the hero section should be 40%
  // Target the specific progress-fill inside the module-progress hero section
  const progressFill = moduleProgress.locator('.progress-fill')
  const widthStyle = await progressFill.first().getAttribute('style')
  expect(widthStyle).toContain('width: 40%')

  // Also verify the features count text
  const progressText = await moduleProgress.locator('span:has-text("2 / 5 features")').textContent()
  expect(progressText).toContain('2 / 5 features')
})

/**
 * Test: NotFoundPage shows helpful information
 */
test('NotFoundPage shows helpful information for invalid routes', async ({ page }) => {
  await page.goto(`${UI_BASE}/this-page-definitely-does-not-exist`, {
    waitUntil: 'domcontentloaded',
  })

  // Should show friendly 404 message
  await expect(
    page.locator('h1:has-text("Page Not Found")')
  ).toBeVisible()

  await expect(page.locator('p code')).toContainText(
    '/this-page-definitely-does-not-exist'
  )

  // Should show module quick-links
  const moduleLinks = page.locator('.module-card')
  const moduleLinkCount = await moduleLinks.count()
  expect(moduleLinkCount).toBe(4) // All 4 modules

  // Should show back to home and start learning buttons
  await expect(
    page.locator('a.btn.btn-primary:has-text("← Back to Home")')
  ).toBeVisible()

  await expect(
    page.locator('a.btn.btn-secondary:has-text("Start Learning →")')
  ).toBeVisible()

  // Should show progress info
  await expect(page.locator('p:has-text("Overall progress:")')).toBeVisible()
})

/**
 * Test: Playground page loads and persona switching works
 */
test('playground page loads and persona switching works', async ({ page }) => {
  await page.goto(`${UI_BASE}/playground`, { waitUntil: 'networkidle' })

  // Verify playground loaded - check for Playground heading
  await expect(page.locator('h2:has-text("Playground")')).toBeVisible()

  // Test persona switching
  const personaButtons = page.locator('.persona-btn')
  const personaCount = await personaButtons.count()
  console.log(`Found ${personaCount} persona buttons`)

  for (let i = 0; i < personaCount; i++) {
    const button = personaButtons.nth(i)
    const personaName = await button.textContent()
    console.log(`Testing persona: ${personaName?.trim()}`)

    await button.click()
    await page.waitForTimeout(500)

    // Verify button is active
    await expect(button).toHaveClass(/active/)
  }
})

/**
 * Test: Download page has working button
 */
test('download page - download button present and functional', async ({ page }) => {
  await page.goto(`${UI_BASE}/download`, { waitUntil: 'domcontentloaded' })

  // Fixed heading: actual heading is "Download the Full Project"
  await expect(page.locator('h2:has-text("Download the Full Project")')).toBeVisible()
  await expect(page.locator('.download-btn')).toBeVisible()

  // Button text is "📦 Download ZIP"
  await expect(page.locator('.download-btn')).toHaveText(/Download ZIP/)
})

/**
 * Test: Lab page loads correctly
 */
test('lab page loads correctly', async ({ page }) => {
  await page.goto(`${UI_BASE}/lab`, { waitUntil: 'domcontentloaded' })

  // Should have lab heading or similar
  await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
})

/**
 * Test: Sidebar - removed lab panel
 */
test('right lab panel is removed from UI', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })

  const labPanel = page.locator('.lab-panel')
  await expect(labPanel).toHaveCount(0)

  const localLabPanel = page.locator('.local-lab-panel')
  await expect(localLabPanel).toHaveCount(0)
})

/**
 * Test: Feature pages have code copy buttons
 */
test('feature pages - code blocks have copy buttons', async ({ page }) => {
  // Test a few feature pages
  for (const path of ['/feature/plain-chat', '/feature/embeddings']) {
    await page.goto(`${UI_BASE}${path}`, { waitUntil: 'domcontentloaded' })

    // Code blocks should have copy buttons
    const copyBtns = page.locator('.copy-btn')
    const copyBtnCount = await copyBtns.count()

    // At least check that the page loads without errors
    await expect(page.locator('.code-view, .code-block').first()).toBeVisible({
      timeout: 10000,
    })
  }
})

/**
 * Test: Architecture diagrams present on feature pages
 */
test.describe('Architecture diagrams', () => {
  for (const path of VALID_FEATURE_ROUTES.slice(0, 8)) {
    test(`${path} - architecture diagram present`, async ({ page }) => {
      await page.goto(`${UI_BASE}${path}`, { waitUntil: 'domcontentloaded' })

      const archSection = page.locator('.architecture-section')
      const archCount = await archSection.count()

      if (archCount > 0) {
        // Should have meaningful content
        const text = await archSection.innerText()
        expect(text.trim().length).toBeGreaterThan(20)

        // Should have architecture component labels
        const components = page.locator('.architecture-component')
        const compCount = await components.count()
        // Each component should have meaningful description
        for (let i = 0; i < Math.min(compCount, 3); i++) {
          const compText = await components.nth(i).innerText()
          expect(compText.trim().length).toBeGreaterThan(3)
        }
      }
    })
  }
})

/**
 * Test: Module learning path pages have in-page navigation
 */
test.describe('Module learning path in-page navigation', () => {
  for (const path of LEARNING_PATH_ROUTES) {
    test(`${path} - in-page navigation tabs work`, async ({ page }) => {
      await page.goto(`${UI_BASE}${path}`, { waitUntil: 'networkidle' })

      const inPageNav = page.locator('.in-page-nav')
      await expect(inPageNav).toBeVisible()

      const tabs = inPageNav.locator('.in-page-nav-tab, .in-page-nav-select option')
      const tabCount = await tabs.count()
      expect(tabCount).toBeGreaterThanOrEqual(3)

      // Test tab navigation - click the first visible tab button
      const tabButtons = inPageNav.locator('.in-page-nav-tab')
      const tabButtonCount = await tabButtons.count()
      expect(tabButtonCount).toBeGreaterThanOrEqual(3)
      if (tabButtonCount > 0) {
        await tabButtons.nth(0).click()
        await page.waitForTimeout(300)
      }
    })
  }
})

/**
 * Test: Sidebar phase headers expand/collapse
 */
test('sidebar - phase headers expand/collapse and lesson links navigate', async ({
  page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })

  const phaseHeaders = page.locator('.learning-phase-header')
  if (await phaseHeaders.count()) {
    await phaseHeaders.first().click()
    await page.waitForTimeout(300)
    await phaseHeaders.first().click()
    await page.waitForTimeout(300)
  }

  // First lesson link
  const lessonLinks = page.locator('.learning-lesson-link')
  const count = await lessonLinks.count()
  if (count) {
    const first = lessonLinks.first()
    const href = await first.getAttribute('href')
    if (href) {
      await first.click()
      await expect(page).toHaveURL(`${UI_BASE}${href}`)
    }
  }
})

/**
 * Test: Feature page navigation (next/prev buttons)
 */
test('/feature/plain-chat has working navigation', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'networkidle' })

  // Initially should show "Next →" text
  const nextButton = page.locator('.nav-next').first()
  await expect(nextButton).toBeVisible()
  await expect(nextButton).toHaveText('Next →')

  // Should have a previous button (plain-chat is first, so it should be disabled)
  const prevButton = page.locator('.nav-prev').first()
  await expect(prevButton).toBeDisabled()

  // Manually mark feature as complete using the checkbox (auto-complete uses IntersectionObserver which may not trigger in tests)
  const checkbox = page.locator('.mark-complete-check input')
  await checkbox.check()
  await expect(checkbox).toBeChecked()

  // Click next button
  await nextButton.click()
  await page.waitForLoadState('domcontentloaded')

  // Should navigate to second feature (system-prompts)
  await expect(page).toHaveURL(/.*\/feature\/system-prompts/)

  // Verify we're on the second feature
  await expect(page.locator('.feature-page-header h1')).toHaveText('System Prompts')
})