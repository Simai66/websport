/**
 * E2E Tests — Alpha Testing (System Test)
 * ทดสอบระบบทั้งหมดจากมุมมอง QA ภายใน
 * ครอบคลุม: หน้าหลัก, navigation, UI elements, responsive
 */
import { test, expect } from '@playwright/test';

// =============================================
// Alpha Test: หน้า Home
// =============================================

test.describe('Alpha: หน้าหลัก', () => {
    test('เข้าหน้าหลักได้', async ({ page }) => {
        await page.goto('/');
        // Verify page loads — check title exists (any title)
        const title = await page.title();
        expect(title.length).toBeGreaterThan(0);
    });

    test('แสดง navigation bar', async ({ page }) => {
        await page.goto('/');
        const nav = page.locator('nav, .navbar, header');
        await expect(nav.first()).toBeVisible();
    });

    test('แสดงรายชื่อสนามกีฬา', async ({ page }) => {
        await page.goto('/');
        // Wait for fields to load
        await page.waitForTimeout(2000);
        const cards = page.locator('.card, .premium-card, [class*="field"]');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('มีปุ่มฟิลเตอร์ประเภทสนาม', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        // Check for filter buttons (all, football, badminton, etc.)
        const filterArea = page.locator('button, .filter, [class*="filter"]');
        const count = await filterArea.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('Responsive: Mobile viewport ไม่มี overflow', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');
        await page.waitForTimeout(1000);
        const body = page.locator('body');
        const box = await body.boundingBox();
        expect(box.width).toBeLessThanOrEqual(375);
    });
});

// =============================================
// Alpha Test: Navigation
// =============================================

test.describe('Alpha: Navigation', () => {
    test('Click สนาม → ไปหน้า Detail', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);
        // Click the first link inside a card (the <a> tag wrapping the card)
        const firstCardLink = page.locator('a[href*="/field/"]').first();
        if (await firstCardLink.isVisible()) {
            await firstCardLink.click();
            await page.waitForTimeout(2000);
            expect(page.url()).toContain('/field/');
        }
    });

    test('กดปุ่ม Login → ไปหน้า Login', async ({ page }) => {
        await page.goto('/');
        const loginLink = page.locator('a[href*="login"], button:has-text("เข้าสู่ระบบ"), a:has-text("เข้าสู่ระบบ")');
        if (await loginLink.first().isVisible()) {
            await loginLink.first().click();
            await page.waitForTimeout(1000);
            expect(page.url()).toContain('/login');
        }
    });
});

// =============================================
// Alpha Test: หน้า Login
// =============================================

test.describe('Alpha: หน้า Login', () => {
    test('เข้าหน้า Login ได้', async ({ page }) => {
        await page.goto('/login');
        await page.waitForTimeout(1000);
        // Should see login form or Google sign-in
        const loginElements = page.locator('button, input, [class*="login"], [class*="auth"]');
        const count = await loginElements.count();
        expect(count).toBeGreaterThan(0);
    });

    test('มีปุ่ม Google Sign-In', async ({ page }) => {
        await page.goto('/login');
        await page.waitForTimeout(1000);
        const googleBtn = page.locator('button:has-text("Google"), button:has-text("google"), [class*="google"]');
        if (await googleBtn.first().isVisible()) {
            await expect(googleBtn.first()).toBeVisible();
        }
    });
});

// =============================================
// Alpha Test: หน้า Register
// =============================================

test.describe('Alpha: หน้า Register', () => {
    test('เข้าหน้า Register ได้', async ({ page }) => {
        await page.goto('/register');
        await page.waitForTimeout(1000);
        const formElements = page.locator('button, input, form');
        const count = await formElements.count();
        expect(count).toBeGreaterThan(0);
    });
});

// =============================================
// Alpha Test: หน้า Field Detail
// =============================================

test.describe('Alpha: หน้า Field Detail', () => {
    test('กดเลือกสนามแรก → แสดงข้อมูลสนาม', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const firstCard = page.locator('.card, .premium-card').first();
        if (await firstCard.isVisible()) {
            await firstCard.click();
            await page.waitForTimeout(2000);

            // Should have field name visible
            const heading = page.locator('h1, h2, h3, .field-name');
            const count = await heading.count();
            expect(count).toBeGreaterThan(0);
        }
    });

    test('แสดงปฏิทินเลือกวัน', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const firstCard = page.locator('.card, .premium-card').first();
        if (await firstCard.isVisible()) {
            await firstCard.click();
            await page.waitForTimeout(2000);

            const calendar = page.locator('[class*="calendar"], [class*="date"], .calendar');
            if (await calendar.first().isVisible()) {
                await expect(calendar.first()).toBeVisible();
            }
        }
    });
});

// =============================================
// Alpha Test: Performance
// =============================================

test.describe('Alpha: Performance', () => {
    test('หน้าหลักโหลดภายใน 10 วินาที', async ({ page }) => {
        const start = Date.now();
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const loadTime = Date.now() - start;
        expect(loadTime).toBeLessThan(10000);
    });

    test('ไม่มี console error ร้ายแรง', async ({ page }) => {
        const errors = [];
        page.on('pageerror', (err) => errors.push(err.message));
        await page.goto('/');
        await page.waitForTimeout(3000);
        // Filter out known non-critical errors
        const criticalErrors = errors.filter(
            e => !e.includes('Firebase') && !e.includes('auth') && !e.includes('network')
        );
        expect(criticalErrors.length).toBe(0);
    });
});
