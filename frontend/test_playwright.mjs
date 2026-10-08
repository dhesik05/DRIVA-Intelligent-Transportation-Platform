import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('pageerror', error => {
    console.error('PAGE ERROR:', error.message);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('CONSOLE ERROR:', msg.text());
    }
  });

  await page.goto('http://localhost:5173');
  
  // Login
  try {
    await page.click('button:has-text("Sign In")', { timeout: 3000 });
  } catch (e) {}
  await page.waitForTimeout(1000);
  
  // Go to create request
  try {
    await page.click('a:has-text("Create Request")', { timeout: 3000 });
  } catch (e) {}
  await page.waitForTimeout(1000);
  
  // Click Next until Step 4
  await page.click('button:has-text("Continue to Cargo Details")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Continue to Vehicle & Priority")');
  await page.waitForTimeout(500);
  await page.click('button:has-text("Review Requirement")');
  await page.waitForTimeout(500);
  
  // Click Find Best Transport
  await page.click('button:has-text("Find Best Transport")');
  await page.waitForTimeout(4000); // wait for ML
  
  const text = await page.textContent('body');
  if (text.includes('TOP RECOMMENDED CARRIER ALLOCATION')) {
    console.log("SUCCESS! Matched successfully.");
  } else if (text.includes('Matching Failed') || text.includes('No Suitable Vehicles')) {
    console.log("RENDERED GRACEFULLY.");
  } else {
    console.log("FAILED OR BLANK SCREEN.");
  }

  await browser.close();
})();
