const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function captureAnimations() {
  const screenshotsDir = '/opt/cursor/artifacts/screenshots';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: false,
    args: ['--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: '/opt/cursor/artifacts/',
      size: { width: 1920, height: 1080 }
    }
  });
  
  const page = await context.newPage();
  
  console.log('📹 Recording started...');
  console.log('🌐 Loading page...');
  
  await page.goto('http://localhost:8765/', { 
    waitUntil: 'networkidle',
    timeout: 15000
  });
  
  // Wait for animations to initialize
  await page.waitForTimeout(2000);
  
  console.log('📸 Capturing hero with animations...');
  await page.screenshot({
    path: path.join(screenshotsDir, 'hero-animated.png'),
    fullPage: false
  });
  
  // Wait to capture hero animations in video
  console.log('⏱️  Recording hero animations...');
  await page.waitForTimeout(5000);
  
  // Scroll to diagram section
  console.log('📸 Scrolling to diagram...');
  await page.evaluate(() => {
    const diagram = document.querySelector('#see-it') || document.querySelector('.scale-board');
    if (diagram) {
      diagram.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(3000);
  
  console.log('📸 Capturing diagram with animations...');
  await page.screenshot({
    path: path.join(screenshotsDir, 'diagram-animated.png'),
    fullPage: false
  });
  
  // Record diagram animations
  console.log('⏱️  Recording diagram animations...');
  await page.waitForTimeout(5000);
  
  // Capture video section
  console.log('📸 Capturing video section...');
  await page.evaluate(() => {
    const video = document.querySelector('#demo-video');
    if (video) {
      video.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(screenshotsDir, 'video-section.png'),
    fullPage: false
  });
  
  // Capture tiers with hover effects
  console.log('📸 Capturing tier cards...');
  await page.evaluate(() => {
    const tiers = document.querySelector('#tiers');
    if (tiers) {
      tiers.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(screenshotsDir, 'tiers-animated.png'),
    fullPage: false
  });
  
  // Test card hover
  console.log('🎯 Testing card hover effects...');
  const firstCard = await page.$('.tier-card');
  if (firstCard) {
    await firstCard.hover();
    await page.waitForTimeout(500);
  }
  
  // Mobile view
  console.log('📱 Capturing mobile view...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  await page.screenshot({
    path: path.join(screenshotsDir, 'mobile-full.png'),
    fullPage: true
  });
  
  console.log('⏹️  Stopping recording...');
  await context.close();
  
  // Get the video file
  const videoFiles = fs.readdirSync('/opt/cursor/artifacts/')
    .filter(f => f.endsWith('.webm'));
  
  if (videoFiles.length > 0) {
    const videoPath = path.join('/opt/cursor/artifacts/', videoFiles[0]);
    const stats = fs.statSync(videoPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Rename to a better name
    const newVideoPath = '/opt/cursor/artifacts/animation-demo.webm';
    fs.renameSync(videoPath, newVideoPath);
    
    console.log(`\n✅ Video recording saved: animation-demo.webm (${fileSizeMB} MB)`);
    
    // If video is too large, warn
    if (stats.size > 15 * 1024 * 1024) {
      console.log(`⚠️  Video is larger than 15MB - may need compression`);
    }
  }
  
  console.log('\n✅ Screenshots saved:');
  console.log('  - hero-animated.png');
  console.log('  - diagram-animated.png');
  console.log('  - video-section.png');
  console.log('  - tiers-animated.png');
  console.log('  - mobile-full.png');
  
  await browser.close();
}

captureAnimations().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
