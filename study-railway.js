const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Studying Railway.com animations...\n');
  
  try {
    await page.goto('https://railway.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
  } catch (e) {
    console.log('Navigation timeout, continuing anyway...');
  }
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(5000);
  
  console.log('=== ANIMATION ANALYSIS ===\n');
  
  // Check for canvas elements
  const canvasInfo = await page.evaluate(() => {
    const canvases = document.querySelectorAll('canvas');
    return {
      count: canvases.length,
      contexts: Array.from(canvases).map(c => {
        const ctx = c.getContext('2d') || c.getContext('webgl') || c.getContext('webgl2');
        return {
          width: c.width,
          height: c.height,
          type: c.getContext('2d') ? '2d' : (c.getContext('webgl') ? 'webgl' : 'webgl2')
        };
      })
    };
  });
  
  console.log('CANVAS ELEMENTS:', canvasInfo);
  
  // Check for animation libraries
  const libs = await page.evaluate(() => {
    const scripts = Array.from(document.scripts).map(s => s.src);
    return {
      hasThree: typeof window.THREE !== 'undefined',
      hasGSAP: typeof window.gsap !== 'undefined',
      hasFramer: typeof window.Framer !== 'undefined',
      scripts: scripts.filter(s => s.includes('three') || s.includes('gsap') || s.includes('framer'))
    };
  });
  
  console.log('\nLIBRARIES:', libs);
  
  // Check animation techniques
  const techniques = await page.evaluate(() => {
    const transforms = [];
    document.querySelectorAll('*').forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.transform && style.transform !== 'none') {
        transforms.push({
          tag: el.tagName,
          transform: style.transform,
          transition: style.transition
        });
      }
    });
    
    return {
      transformCount: transforms.length,
      sampleTransforms: transforms.slice(0, 5)
    };
  });
  
  console.log('\nANIMATION TECHNIQUES:', techniques);
  
  // Scroll and observe
  console.log('\nScrolling to observe effects...');
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(2000);
  
  await page.evaluate(() => window.scrollTo(0, 1000));
  await page.waitForTimeout(2000);
  
  // Take screenshots
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1000);
  
  await page.screenshot({ 
    path: '/opt/cursor/artifacts/screenshots/railway-hero.png',
    fullPage: false 
  });
  console.log('\n✓ Screenshot saved: railway-hero.png');
  
  await browser.close();
  console.log('\n✅ Analysis complete!');
})();
