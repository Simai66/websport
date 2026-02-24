const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://localhost:5173/login');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/panuwatwoeiram/.gemini/antigravity/brain/500b5cd6-d600-47ed-857a-8755c96ef812/login_page_fixed.png', fullPage: true });
  await page.goto('http://localhost:5173/register');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/panuwatwoeiram/.gemini/antigravity/brain/500b5cd6-d600-47ed-857a-8755c96ef812/register_page_fixed.png', fullPage: true });
  await browser.close();
})();
