const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'main.js');
let js = fs.readFileSync(filePath, 'utf8');

const startIndex = js.indexOf('/* ========================================== */\n/* DOODLE OPACITY ON SCROLL                   */');
const endIndex = js.indexOf('/* ========================================== */\n/* INITIALIZE EVERYTHING                      */');

if (startIndex !== -1 && endIndex !== -1) {
  const newJs = `/* ========================================== */
/* SURREAL ENTITY DRIFT (Intoxication & Escapism) */
/* ========================================== */
function initSurrealEntities() {
  const entities = document.querySelectorAll('.surreal-entity');
  if (!entities.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Give each entity a random phase and speed
  entities.forEach((el, i) => {
    el._driftData = {
      phaseX: Math.random() * Math.PI * 2,
      phaseY: Math.random() * Math.PI * 2,
      phaseR: Math.random() * Math.PI * 2,
      speedX: 0.0003 + Math.random() * 0.0004,
      speedY: 0.0002 + Math.random() * 0.0005,
      speedR: 0.0001 + Math.random() * 0.0003,
      ampX: 60 + Math.random() * 80,
      ampY: 40 + Math.random() * 100,
      ampR: 15 + Math.random() * 30
    };
  });

  function update(time) {
    const vh = window.innerHeight;

    entities.forEach((el) => {
      // 1. Calculate base opacity based on scroll proximity
      const rect = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const proximity = Math.abs(centerY - vh / 2) / (vh / 2);
      
      // Fade in towards center of screen (max opacity 0.8)
      const baseOpacity = 0.2;
      const opacity = baseOpacity + (1 - Math.min(proximity, 1)) * 0.6;
      
      // 2. Calculate organic drift using sine waves and time
      const d = el._driftData;
      const x = Math.sin(time * d.speedX + d.phaseX) * d.ampX;
      const y = Math.cos(time * d.speedY + d.phaseY) * d.ampY;
      const r = Math.sin(time * d.speedR + d.phaseR) * d.ampR;

      el.style.opacity = opacity.toFixed(3);
      el.style.transform = \`translate3d(\${x}px, \${y}px, 0) rotate(\${r}deg)\`;
    });

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

`;

  js = js.substring(0, startIndex) + newJs + js.substring(endIndex);
  js = js.replace('initDoodleIntensity();', 'initSurrealEntities();');
  
  fs.writeFileSync(filePath, js);
  console.log('main.js updated successfully.');
} else {
  console.log('Could not find start or end index in JS.');
}
