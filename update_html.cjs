const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(filePath, 'utf8');

// SVG Filters to add right after <body>
const svgFilters = `
  <!-- SVG Filters for Surreal Distortion -->
  <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
    <filter id="liquid-distortion">
      <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="30" xChannelSelector="R" yChannelSelector="G" />
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </svg>
`;

// Insert the SVG filter after <body>
if (!html.includes('id="liquid-distortion"')) {
  html = html.replace('<body>', '<body>\n' + svgFilters);
}

// Replacement for hero layer
html = html.replace(/<div class="hero__comic-bg parallax-layer" data-speed="0\.15">([\s\S]*?)<\/div>/, `<div class="hero__comic-bg parallax-layer" data-speed="0.15">
      <div class="surreal-entity entity-aura entity-pos-1"></div>
      <div class="surreal-entity entity-haze entity-pos-2"></div>
      <div class="surreal-entity entity-pulse entity-pos-3"></div>
      <div class="surreal-entity entity-drift entity-pos-4"></div>
    </div>`);

// Replacement for manifesto strip
html = html.replace(/<div class="manifesto__comic-strip parallax-layer" data-speed="0\.1">([\s\S]*?)<\/div>/, `<div class="manifesto__comic-strip parallax-layer" data-speed="0.1">
      <div class="surreal-entity entity-haze entity-pos-5"></div>
      <div class="surreal-entity entity-aura entity-pos-6"></div>
    </div>`);

// Replacement for gallery-1 bg
html = html.replace(/<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0\.12">([\s\S]*?)<\/div>/, `<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.12">
      <div class="surreal-entity entity-pulse entity-pos-7"></div>
      <div class="surreal-entity entity-drift entity-pos-8"></div>
    </div>`);

// Replacement for interlude 1
html = html.replace(/<div class="interlude__strip parallax-layer" data-speed="0\.2">([\s\S]*?)<\/div>/, `<div class="interlude__strip parallax-layer" data-speed="0.2">
      <div class="surreal-entity entity-aura entity-pos-9"></div>
      <div class="surreal-entity entity-haze entity-pos-10"></div>
    </div>`);

// Replacement for gallery-2 bg
html = html.replace(/<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0\.2">([\s\S]*?)<\/div>/, `<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.2">
      <div class="surreal-entity entity-drift entity-pos-1"></div>
      <div class="surreal-entity entity-pulse entity-pos-2"></div>
    </div>`);

// Replacement for interlude 2
html = html.replace(/<div class="interlude__strip parallax-layer" data-speed="0\.18">([\s\S]*?)<\/div>/, `<div class="interlude__strip parallax-layer" data-speed="0.18">
      <div class="surreal-entity entity-haze entity-pos-3"></div>
      <div class="surreal-entity entity-aura entity-pos-4"></div>
    </div>`);

// Replacement for gallery-3 bg
html = html.replace(/<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0\.1">([\s\S]*?)<\/div>/, `<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.1">
      <div class="surreal-entity entity-pulse entity-pos-5"></div>
      <div class="surreal-entity entity-drift entity-pos-6"></div>
    </div>`);

// Replacement for gallery-4 bg
html = html.replace(/<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0\.25">([\s\S]*?)<\/div>/, `<div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.25">
      <div class="surreal-entity entity-aura entity-pos-7"></div>
      <div class="surreal-entity entity-haze entity-pos-8"></div>
    </div>`);

// Replacement for footer bg
html = html.replace(/<div class="footer__comic-bg parallax-layer" data-speed="0\.08">([\s\S]*?)<\/div>/, `<div class="footer__comic-bg parallax-layer" data-speed="0.08">
      <div class="surreal-entity entity-drift entity-pos-9"></div>
      <div class="surreal-entity entity-pulse entity-pos-10"></div>
    </div>`);

fs.writeFileSync(filePath, html);
console.log('index.html updated successfully with surreal entities.');
