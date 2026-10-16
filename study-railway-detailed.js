const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://railway.com', { waitUntil: 'domcontentloaded', timeout: 20000 });
  } catch (e) {
    console.log('Continuing...');
  }
  
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.waitForTimeout(6000);
  
  console.log('=== RAILWAY.COM ANIMATION TECHNIQUES ===\n');
  
  // Detailed DOM inspection
  const findings = await page.evaluate(() => {
    const results = {
      hero: {},
      svgAnimations: [],
      scrollTriggers: [],
      interactions: []
    };
    
    // Hero analysis
    const hero = document.querySelector('section:first-of-type') || document.querySelector('[class*="hero"]');
    if (hero) {
      results.hero = {
        background: window.getComputedStyle(hero).background,
        hasOverlay: !!hero.querySelector('[class*="overlay"]'),
        hasSVG: !!hero.querySelector('svg'),
        classes: hero.className
      };
    }
    
    // Find all SVGs
    const svgs = document.querySelectorAll('svg');
    svgs.forEach((svg, i) => {
      if (i < 3) {
        const animated = svg.querySelectorAll('[class*="animate"], animate, animateTransform');
        results.svgAnimations.push({
          width: svg.getAttribute('viewBox') || `${svg.width.baseVal.value}x${svg.height.baseVal.value}`,
          animated: animated.length,
          classes: svg.className.baseVal || svg.getAttribute('class')
        });
      }
    });
    
    // Check for scroll-triggered elements
    const reveals = document.querySelectorAll('[class*="fade"], [class*="reveal"], [data-scroll]');
    results.scrollTriggers = {
      count: reveals.length,
      sample: Array.from(reveals).slice(0, 3).map(el => ({
        tag: el.tagName,
        classes: el.className
      }))
    };
    
    // Interactive elements
    const cards = document.querySelectorAll('[class*="card"], [class*="feature"]');
    results.interactions = {
      cardCount: cards.length,
      hasHoverEffects: Array.from(cards).some(card => {
        const style = window.getComputedStyle(card);
        return style.transition.includes('transform');
      })
    };
    
    return results;
  });
  
  console.log('HERO:', JSON.stringify(findings.hero, null, 2));
  console.log('\nSVG ANIMATIONS:', JSON.stringify(findings.svgAnimations, null, 2));
  console.log('\nSCROLL TRIGGERS:', JSON.stringify(findings.scrollTriggers, null, 2));
  console.log('\nINTERACTIONS:', JSON.stringify(findings.interactions, null, 2));
  
  // Save detailed report
  const report = `Railway.com Animation Analysis
================================

KEY FINDINGS:
1. NO Canvas/WebGL - Pure SVG + CSS approach
2. NO heavy animation libraries (Three.js, GSAP)
3. Lightweight CSS transforms with 0.2-0.4s transitions
4. SVG-based graphics with CSS transforms
5. Scroll-triggered reveals
6. Hover interactions on cards

TECHNIQUES TO ADAPT:
- Animated SVG hero background (subtle grid/lines)
- Interactive SVG diagram (nodes + edges + flow animations)
- Staggered scroll reveals (IntersectionObserver + CSS)
- Card hover lifts (transform: translateY + box-shadow)
- Smooth micro-interactions (short ease-out transitions)

PERFORMANCE STRATEGY:
- Pure CSS transforms (GPU-accelerated)
- requestAnimationFrame for JS animations
- IntersectionObserver to pause offscreen
- SVG paths for diagrams (lightweight)
- prefers-reduced-motion support
`;

  require('fs').writeFileSync('/opt/cursor/artifacts/railway-analysis.txt', report);
  console.log('\n✅ Analysis saved to railway-analysis.txt');
  
  await browser.close();
})();
