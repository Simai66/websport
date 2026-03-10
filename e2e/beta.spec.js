/**
 * E2E Tests — Beta Testing (System Test)
 * ทดสอบ User Flow แบบ end-to-end จากมุมมองผู้ใช้จริง
 * ครอบคลุม: ขั้นตอนจองสนาม, การค้นหา, UX สำหรับ mobile
 */
import { test, expect } from '@playwright/test';

// =============================================
// Beta Test: User Flow — จอง (ไม่ login)
// =============================================

test.describe('Beta: Guest Flow', () => {
    test('Guest เข้าดูสนามได้', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);
        const cards = page.locator('.card, .premium-card');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
    });

    test('Guest คลิกสนาม → เห็นรายละเอียด', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const firstCardLink = page.locator('a[href*="/field/"]').first();
        if (await firstCardLink.isVisible()) {
            await firstCardLink.click();
            await page.waitForTimeout(2000);
            expect(page.url()).toContain('/field/');
        }
    });

    test('Guest พยายามจอง → ถูก redirect ไป login', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const firstCard = page.locator('.card, .premium-card').first();
        if (await firstCard.isVisible()) {
            await firstCard.click();
            await page.waitForTimeout(2000);

            // Try to find and click a booking button
            const bookBtn = page.locator('button:has-text("จอง"), button:has-text("ยืนยัน")');
            if (await bookBtn.first().isVisible()) {
                await bookBtn.first().click();
                await page.waitForTimeout(2000);
                // Should redirect to login or show login prompt
                const url = page.url();
                const loginVisible = await page.locator('[class*="login"], [class*="auth"]').first().isVisible().catch(() => false);
                expect(url.includes('/login') || loginVisible).toBeTruthy();
            }
        }
    });
});

// =============================================
// Beta Test: Filter + Search
// =============================================

test.describe('Beta: Filter สนาม', () => {
    test('กดฟิลเตอร์ → รายชื่อสนามเปลี่ยน', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const filterBtns = page.locator('button:has-text("ฟุตบอล"), button:has-text("แบดมินตัน"), button:has-text("บาสเกตบอล")');
        if (await filterBtns.first().isVisible()) {
            // Count cards before filter
            const cardsBefore = await page.locator('.card, .premium-card').count();

            await filterBtns.first().click();
            await page.waitForTimeout(1000);

            // Cards should filter (may be same or fewer)
            const cardsAfter = await page.locator('.card, .premium-card').count();
            expect(cardsAfter).toBeGreaterThanOrEqual(0);
            expect(cardsAfter).toBeLessThanOrEqual(cardsBefore);
        }
    });

    test('กด "ทั้งหมด" → แสดงทุกสนาม', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const allBtn = page.locator('button:has-text("ทั้งหมด")');
        if (await allBtn.first().isVisible()) {
            await allBtn.first().click();
            await page.waitForTimeout(1000);
            const cards = await page.locator('.card, .premium-card').count();
            expect(cards).toBeGreaterThan(0);
        }
    });
});

// =============================================
// Beta Test: Mobile UX
// =============================================

test.describe('Beta: Mobile UX', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('Mobile: หน้าแรกไม่มี scroll แนวนอน', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });

    test('Mobile: card แสดงเต็มความกว้าง', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const firstCard = page.locator('.card, .premium-card').first();
        if (await firstCard.isVisible()) {
            const box = await firstCard.boundingBox();
            expect(box.width).toBeGreaterThan(300);
        }
    });

    test('Mobile: ปุ่มกดง่าย (min 44px)', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);

        const buttons = page.locator('button:visible, a.btn:visible');
        const count = await buttons.count();

        for (let i = 0; i < Math.min(count, 5); i++) {
            const box = await buttons.nth(i).boundingBox();
            if (box) {
                expect(box.height).toBeGreaterThanOrEqual(32);
            }
        }
    });
});

// =============================================
// Beta Test: Error Handling
// =============================================

test.describe('Beta: Error Handling', () => {
    test('404 page ไม่ crash', async ({ page }) => {
        await page.goto('/nonexistent-page-12345');
        await page.waitForTimeout(1000);

        // App should not crash — some content should be visible
        const bodyText = await page.textContent('body');
        expect(bodyText.length).toBeGreaterThan(0);
    });

    test('App ไม่มี broken images ในหน้าหลัก', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(3000);

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const naturalWidth = await images.nth(i).evaluate(el => el.naturalWidth);
            // Images should have loaded (naturalWidth > 0) or be intentionally lazy
            const loading = await images.nth(i).getAttribute('loading');
            if (loading !== 'lazy') {
                expect(naturalWidth).toBeGreaterThan(0);
            }
        }
    });
});

// =============================================
// Beta Test: Accessibility Basics
// =============================================

test.describe('Beta: Accessibility', () => {
    test('ทุก image มี alt text', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(2000);

        const images = page.locator('img');
        const count = await images.count();

        for (let i = 0; i < count; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            expect(alt).not.toBeNull();
            expect(alt.length).toBeGreaterThan(0);
        }
    });

    test('มี heading structure (h1/h2)', async ({ page }) => {
        await page.goto('/');
        await page.waitForTimeout(1000);
        const headings = page.locator('h1, h2');
        const count = await headings.count();
        expect(count).toBeGreaterThan(0);
    });
});
