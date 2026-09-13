import { test, expect, devices } from '@playwright/test'

const UI_BASE = process.env.PLAYWRIGHT_UI_BASE_URL ?? ''
const API_BASE = process.env.PLAYWRIGHT_API_BASE_URL ?? 'http://localhost:8080'

type BackendStatus = 'ready' | 'unavailable' | 'checking'

/** Helper: check backend health */
async function checkBackend(page: Page): Promise<BackendStatus> {
  try {
    const resp = await page.request.get(`${API_BASE}/api/tutor/health`, { timeout: 3000 })
    if (resp.ok()) {
      const data = await resp.json()
      return data.status === 'ready' ? 'ready' : 'unavailable'
    }
  } catch {}
  return 'unavailable'
}

/** Top‑level use of the iPhone 13 viewport so all tests below run at phone size */
test.use({ ...devices['iPhone 13'] })

test('mobile home page has no horizontal overflow', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('mobile menu toggle is visible', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.menu-toggle')).toBeVisible()
})

test('mobile menu opens and shows navigation', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('.menu-toggle').click()
  await expect(page.locator('.top-nav-mobile-menu')).toBeVisible()
  await expect(page.locator('.top-nav-mobile-menu button:has-text("Home")')).toBeVisible()
  await expect(page.locator('.top-nav-mobile-menu button:has-text("Learn")')).toBeVisible()
  await expect(page.locator('.top-nav-mobile-menu button:has-text("Lab")')).toBeVisible()
})

test('mobile menu navigation to Lab works', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  await page.locator('.menu-toggle').click()
  await page.locator('.top-nav-mobile-menu button:has-text("Lab")').click()
  await expect(page).toHaveURL(/\/lab/)
})

test('module cards stack vertically on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  const cards = page.locator('.module-card')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)
  if (count >= 2) {
    const firstBox = await cards.nth(0).boundingBox()
    const secondBox = await cards.nth(1).boundingBox()
    expect(firstBox?.y).toBeLessThan(secondBox?.y)
  }
})

test('Try It button is at least 44 px tall on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const btn = page.locator('.try-btn').first()
  if (await btn.count()) {
    const { height } = await btn.boundingBox()
    expect(height).toBeGreaterThanOrEqual(44)
  }
})

test('demo form fields stack vertically on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const fields = page.locator('.demo-form .form-field')
  const count = await fields.count()
  if (count >= 2) {
    const first = await fields.nth(0).boundingBox()
    const second = await fields.nth(1).boundingBox()
    expect(first?.y).toBeLessThan(second?.y)
  }
})

test('form inputs have a touch‑friendly height (≥ 36 px)', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const inputs = page.locator('.demo-form input, .demo-form select, .demo-form textarea')
  const count = await inputs.count()
  for (let i = 0; i < Math.min(count, 3); i++) {
    const { height } = await inputs.nth(i).boundingBox()
    expect(height).toBeGreaterThanOrEqual(36)
  }
})

test('feature page content fits within viewport on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
  await expect(page.locator('.feature-page h1')).toBeVisible({ timeout: 10000 })
})

test('sidebar navigation is hidden on mobile (replaced by mobile menu)', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  const sidebar = page.locator('.learning-sidebar')
  const isHidden = await sidebar.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return style.display === 'none' || el.offsetWidth === 0
  })
  expect(isHidden).toBe(true)
})

test('code blocks are horizontally scrollable on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/feature/plain-chat`, { waitUntil: 'domcontentloaded' })
  const codeBlock = page.locator('.code-block, .code-view').first()
  if (await codeBlock.count()) {
    // Code block should be visible and not break the page layout on mobile
    await expect(codeBlock).toBeVisible()
    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  }
})

/** Playground mobile tests */
test('Playground page loads on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/playground`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('h2:has-text("Playground")')).toBeVisible()
  const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth)
  expect(overflow).toBe(false)
})

test('persona buttons are touch‑friendly on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/playground`, { waitUntil: 'domcontentloaded' })
  const btns = page.locator('.persona-btn')
  const count = await btns.count()
  for (let i = 0; i < count; i++) {
    const { height } = await btns.nth(i).boundingBox()
    expect(height).toBeGreaterThanOrEqual(44)
  }
})

test('Playground form is vertically stacked on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/playground`, { waitUntil: 'domcontentloaded' })
  const form = page.locator('.playground-form')
  if (await form.count()) {
    const input = form.locator('input')
    const button = form.locator('button')
    if (await input.count() && await button.count()) {
      const ibox = await input.boundingBox()
      const bbox = await button.boundingBox()
      expect(ibox?.y).toBeLessThan(bbox?.y)
    }
  }
})

/** Connectivity status on mobile */
test('TopNav health pill is visible on mobile', async ({ page }) => {
  await page.goto(`${UI_BASE}/`, { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.health-pill')).toBeVisible()
})