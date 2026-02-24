import { test, expect } from '@playwright/test';

// Use a randomized email to ensure a fresh test run
const testEmail = `testuser_${Date.now()}@example.com`;
const testPassword = 'Password123!';
const testName = 'E2E Test User';

test.describe('End-to-End Booking Flow', () => {

    test('User Workflow: Register, Login, Book Field, Pay', async ({ page, context }) => {
        // Step 1: Register and Login
        await page.goto('http://localhost:5173/login');

        // Go to Register
        await page.click('text=ยังไม่มีบัญชี? สมัครสมาชิก');
        await page.waitForURL('**/register');

        // Fill register form
        await page.fill('input[type="text"]', testName);
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.fill('input[placeholder="ยืนยันรหัสผ่าน"]', testPassword);

        // Ensure to accept terms if required (optional based on your UI)
        // await page.click('label:has-text("ยอมรับข้อตกลงและเงื่อนไข")'); 

        await page.click('button[type="submit"]');

        // Typically it redirects to login or logs directly in. Wait for URL change
        await page.waitForURL('**/login', { timeout: 10000 }).catch(() => { });
        // If it redirected to login, login
        if (page.url().includes('login')) {
            await page.fill('input[type="email"]', testEmail);
            await page.fill('input[type="password"]', testPassword);
            await page.click('button[type="submit"]');
        }

        await page.waitForURL('http://localhost:5173/');
        console.log('✅ Registered and logged in successfully');

        // Step 2: Test Booking
        await page.click('text=จองสนาม');
        await page.waitForURL('**/fields');

        // Click first available field to book
        await page.click('.btn-primary >> text=จองเลย');

        // Fill booking form
        await page.fill('input[name="customerName"]', testName);
        await page.fill('input[name="customerPhone"]', '0899999999');
        await page.type('input[type="date"]', '2026-10-10'); // Ensure a future date
        await page.selectOption('select[name="timeSlot"]', '17:00 - 18:00');

        await page.click('button[type="submit"]');

        // Redirects to payment page
        await page.waitForURL('**/payment');
        console.log('✅ Booking created, on Payment page');

        // Step 3: Payment
        // Normally we upload a slip here via an input file
        // Since it's E2E, we can mock an upload
        const inputFile = page.locator('input[type="file"]');

        // We'll upload a tiny base64 dummy image if file exists, 
        // OR bypass it if it's strictly a front-end test.
        // Let's create a temporary file first for upload.
    });

});
