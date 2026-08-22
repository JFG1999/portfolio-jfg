const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'style.css');
let css = fs.readFileSync(filePath, 'utf8');

const startIndex = css.indexOf('/* ========================================== */\n/* COMIC DOODLES (CSS-drawn grotesques)       */');
const endIndex = css.indexOf('/* ========================================== */\n/* HERO SECTION                               */');

if (startIndex !== -1 && endIndex !== -1) {
  const newStyles = `/* ========================================== */
/* SURREAL ENTITIES (Intoxication & Escapism) */
/* ========================================== */
.surreal-entity {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  mix-blend-mode: screen;
  filter: url(#liquid-distortion) blur(12px);
  will-change: transform, opacity;
  border-radius: 50%;
  transition: opacity 1s ease-in-out;
}

/* Aura: A pulsating, glowing light blur */
.entity-aura {
  width: clamp(200px, 40vw, 600px);
  height: clamp(200px, 40vw, 600px);
  background: radial-gradient(circle at center, rgba(138, 43, 226, 0.4) 0%, rgba(255, 20, 147, 0.1) 40%, transparent 70%);
}

/* Haze: A flowing, fog-like shape with liquid distortion */
.entity-haze {
  width: clamp(300px, 50vw, 800px);
  height: clamp(200px, 30vw, 500px);
  background: linear-gradient(120deg, rgba(255, 69, 0, 0.15) 0%, rgba(138, 43, 226, 0.2) 50%, transparent 100%);
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
}

/* Pulse: Soft overlapping color rings */
.entity-pulse {
  width: clamp(250px, 35vw, 550px);
  height: clamp(250px, 35vw, 550px);
  background: 
    radial-gradient(circle at 40% 40%, rgba(0, 255, 255, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 60% 60%, rgba(255, 20, 147, 0.2) 0%, transparent 50%);
}

/* Drift: A soft color gradient dragging lazily across */
.entity-drift {
  width: clamp(400px, 60vw, 900px);
  height: clamp(150px, 25vw, 400px);
  background: linear-gradient(90deg, transparent 0%, rgba(255, 0, 128, 0.2) 30%, rgba(75, 0, 130, 0.3) 70%, transparent 100%);
  border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
}

/* Initial randomish position classes for drifting logic */
.entity-pos-1 { top: -10%; left: -5%; }
.entity-pos-2 { top: 40%; right: -10%; }
.entity-pos-3 { bottom: -20%; left: 20%; }
.entity-pos-4 { top: 10%; right: 20%; }
.entity-pos-5 { top: -20%; left: 30%; }
.entity-pos-6 { bottom: 10%; right: 10%; }
.entity-pos-7 { top: 30%; left: -15%; }
.entity-pos-8 { bottom: -5%; right: 30%; }
.entity-pos-9 { top: 15%; left: 40%; }
.entity-pos-10 { bottom: 20%; right: -5%; }

`;

  css = css.substring(0, startIndex) + newStyles + css.substring(endIndex);
  fs.writeFileSync(filePath, css);
  console.log('style.css updated successfully.');
} else {
  console.log('Could not find start or end index in CSS.', startIndex, endIndex);
}
