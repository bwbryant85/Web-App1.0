const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push({type:'pageerror', message: e.message}));
  page.on('console', msg => { if (msg.type() === 'error') errors.push({type:'console', text: msg.text()}); });
  await page.goto('http://127.0.0.1:8000');
  await page.waitForSelector('.app-icon');
  const gamesIcon = await page.locator('.app-icon', { hasText: 'Games' }).first();
  if (!gamesIcon) { console.log('games icon not found'); await browser.close(); return; }
  await gamesIcon.click();
  await page.waitForTimeout(500);
  const names = ['Snake','Flappy','Pong','Breakout','Simon','Reaction','Colors','2048','Pac-Man','Casino'];
  for (const name of names) {
    const row = page.locator('.games98-item', { hasText: name }).first();
    if (!(await row.count())) { console.log('missing row', name); continue; }
    console.log('clicking', name);
    await row.click();
    await page.waitForTimeout(500);
    const openWin = await page.$('.win98-window');
    if (openWin) {
      console.log('opened', name);
      await page.click('.win-close').catch(() => {});
      await page.waitForTimeout(200);
    } else {
      console.log('failed to open', name);
    }
  }
  console.log('errors', JSON.stringify(errors, null, 2));
  await browser.close();
})();