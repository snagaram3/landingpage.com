/**
 * Railway-inspired animations for Alineplane
 * Pure vanilla JS/SVG approach - no heavy libraries
 * GPU-accelerated transforms, IntersectionObserver pausing, prefers-reduced-motion support
 */

(function() {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // === 1. ANIMATED HERO BACKGROUND (Blueprint Grid with Pulses) ===
  
  function initHeroAnimation() {
    if (prefersReducedMotion) return;
    
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    // Create animated SVG background
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('hero-animated-bg');
    svg.setAttribute('aria-hidden', 'true');
    
    // Add subtle animated lines
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'line-gradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '0%');
    gradient.innerHTML = `
      <stop offset="0%" style="stop-color:#8FB59A;stop-opacity:0" />
      <stop offset="50%" style="stop-color:#8FB59A;stop-opacity:0.3" />
      <stop offset="100%" style="stop-color:#8FB59A;stop-opacity:0" />
    `;
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Create animated lines
    for (let i = 0; i < 3; i++) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '-100%');
      line.setAttribute('y1', `${20 + i * 30}%`);
      line.setAttribute('x2', '0%');
      line.setAttribute('y2', `${20 + i * 30}%`);
      line.setAttribute('stroke', 'url(#line-gradient)');
      line.setAttribute('stroke-width', '2');
      line.classList.add('hero-line');
      line.style.animationDelay = `${i * 1.5}s`;
      svg.appendChild(line);
    }
    
    hero.insertBefore(svg, hero.firstChild);
  }
  
  // === 2. INTERACTIVE ANIMATED ARCHITECTURE DIAGRAM ===
  
  function initArchitectureDiagram() {
    const container = document.querySelector('#see-it') || document.querySelector('.scale-board');
    if (!container || prefersReducedMotion) return;
    
    const diagramWrapper = document.createElement('div');
    diagramWrapper.className = 'architecture-diagram';
    diagramWrapper.innerHTML = `
      <svg viewBox="0 0 800 400" class="arch-svg" aria-labelledby="arch-title">
        <title id="arch-title">Alineplane Architecture: Control plane connecting to AWS, Azure, and GCP</title>
        <defs>
          <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#C8693B;stop-opacity:0" />
            <stop offset="50%" style="stop-color:#C8693B;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#C8693B;stop-opacity:0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Control Plane (center) -->
        <g class="node control-plane" transform="translate(400, 200)">
          <circle r="40" fill="#0F1A17" stroke="#8FB59A" stroke-width="2"/>
          <circle class="pulse-ring" r="40" fill="none" stroke="#8FB59A" stroke-width="2" opacity="0"/>
          <text y="5" text-anchor="middle" fill="#F2EDE3" font-size="12" font-weight="600">Control</text>
          <text y="20" text-anchor="middle" fill="#F2EDE3" font-size="12" font-weight="600">Plane</text>
        </g>
        
        <!-- AWS Node (left) -->
        <g class="node cloud-node" transform="translate(120, 120)" data-cloud="aws">
          <rect x="-35" y="-25" width="70" height="50" rx="4" fill="#0F1A17" stroke="#8FB59A" stroke-width="2"/>
          <text y="5" text-anchor="middle" fill="#F2EDE3" font-size="14" font-weight="500">AWS</text>
        </g>
        
        <!-- Azure Node (top) -->
        <g class="node cloud-node" transform="translate(400, 60)" data-cloud="azure">
          <rect x="-35" y="-25" width="70" height="50" rx="4" fill="#0F1A17" stroke="#8FB59A" stroke-width="2"/>
          <text y="5" text-anchor="middle" fill="#F2EDE3" font-size="14" font-weight="500">Azure</text>
        </g>
        
        <!-- GCP Node (right) -->
        <g class="node cloud-node" transform="translate(680, 120)" data-cloud="gcp">
          <rect x="-35" y="-25" width="70" height="50" rx="4" fill="#0F1A17" stroke="#8FB59A" stroke-width="2"/>
          <text y="5" text-anchor="middle" fill="#F2EDE3" font-size="14" font-weight="500">GCP</text>
        </g>
        
        <!-- Connection Lines -->
        <line class="connection" x1="360" y1="180" x2="155" y2="135" stroke="#8FB59A" stroke-width="1.5" opacity="0.4"/>
        <line class="connection" x1="400" y1="160" x2="400" y2="110" stroke="#8FB59A" stroke-width="1.5" opacity="0.4"/>
        <line class="connection" x1="440" y1="180" x2="645" y2="135" stroke="#8FB59A" stroke-width="1.5" opacity="0.4"/>
        
        <!-- Animated Flow Packets -->
        <circle class="packet" r="4" fill="#C8693B" filter="url(#glow)">
          <animateMotion dur="3s" repeatCount="indefinite">
            <mpath href="#path-aws"/>
          </animateMotion>
        </circle>
        <circle class="packet" r="4" fill="#C8693B" filter="url(#glow)">
          <animateMotion dur="2.5s" repeatCount="indefinite">
            <mpath href="#path-azure"/>
          </animateMotion>
        </circle>
        <circle class="packet" r="4" fill="#C8693B" filter="url(#glow)">
          <animateMotion dur="3.2s" repeatCount="indefinite">
            <mpath href="#path-gcp"/>
          </animateMotion>
        </circle>
        
        <!-- Hidden paths for animation -->
        <path id="path-aws" d="M 360 180 L 155 135" fill="none"/>
        <path id="path-azure" d="M 400 160 L 400 110" fill="none"/>
        <path id="path-gcp" d="M 440 180 L 645 135" fill="none"/>
      </svg>
    `;
    
    // Insert before first heading in section
    const target = container.querySelector('h2') || container.querySelector('.container');
    if (target) {
      target.parentNode.insertBefore(diagramWrapper, target);
    }
    
    // Animate pulse rings
    const pulseRing = diagramWrapper.querySelector('.pulse-ring');
    if (pulseRing) {
      let pulseActive = false;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !pulseActive) {
            pulseActive = true;
            pulseDiagram();
          }
        });
      }, { threshold: 0.3 });
      
      observer.observe(diagramWrapper);
      
      function pulseDiagram() {
        if (!pulseActive) return;
        pulseRing.style.animation = 'pulse-ring 2s ease-out';
        setTimeout(() => {
          if (pulseActive) {
            pulseRing.style.animation = 'none';
            setTimeout(() => pulseDiagram(), 3000);
          }
        }, 2000);
      }
    }
    
    // Interactive hover on nodes
    const nodes = diagramWrapper.querySelectorAll('.cloud-node');
    nodes.forEach(node => {
      node.style.cursor = 'pointer';
      node.addEventListener('mouseenter', () => {
        if (!prefersReducedMotion) {
          node.style.transform = `${node.getAttribute('transform')} scale(1.05)`;
        }
      });
      node.addEventListener('mouseleave', () => {
        node.style.transform = node.getAttribute('transform');
      });
    });
  }
  
  // === 3. ENHANCED SCROLL REVEALS (Staggered) ===
  
  function enhanceScrollReveals() {
    if (prefersReducedMotion) return;
    
    const reveals = document.querySelectorAll('.reveal:not(.revealed)');
    if (!reveals.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, index * 80); // Stagger by 80ms
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });
    
    reveals.forEach(el => observer.observe(el));
  }
  
  // === 4. CARD HOVER LIFT ===
  
  function initCardHoverEffects() {
    if (prefersReducedMotion) return;
    
    const cards = document.querySelectorAll('.tier-card, .point-card, .metric-item');
    
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-4px)';
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
      });
    });
  }
  
  // === 5. ANIMATED COUNTERS ===
  
  function animateCounters() {
    if (prefersReducedMotion) return;
    
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const target = parseInt(element.dataset.counter, 10);
          const duration = 2000;
          const start = performance.now();
          
          function updateCounter(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            
            element.textContent = element.dataset.counterPrefix 
              ? element.dataset.counterPrefix + current 
              : current;
            
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          }
          
          requestAnimationFrame(updateCounter);
          observer.unobserve(element);
        }
      });
    }, { threshold: 0.5 });
    
    counters.forEach(el => observer.observe(el));
  }
  
  // === INIT ALL ===
  
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    initHeroAnimation();
    initArchitectureDiagram();
    enhanceScrollReveals();
    initCardHoverEffects();
    animateCounters();
  }
  
  init();
})();
