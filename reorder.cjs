const fs = require('fs');

const categories = {
  "018-high-01.jpg": "silent_places",
  "057-high-01.jpg": "silent_beings",
  "058-high-01.jpg": "silent_beings",
  "081-high-01.jpg": "contrast",
  "098-high-01.jpg": "silent_beings",
  "115-high-01.jpg": "silent_beings",
  "bild-1-3.jpg": "contrast",
  "bild-10-2.jpg": "silent_beings",
  "bild-10-3.jpg": "silent_places",
  "bild-10-5.jpg": "silent_places",
  "bild-10.jpg": "fragments",
  "bild-12-2.jpg": "silent_beings",
  "bild-2-2.jpg": "silent_beings",
  "bild-2-4.jpg": "silent_places",
  "bild-3-2.jpg": "silent_places",
  "bild-4-1.jpg": "silent_places",
  "bild-4.jpg": "silent_beings",
  "bild-5-2-2.jpg": "silent_beings",
  "bild-6-2.jpg": "silent_beings",
  "bild-6-3-2.jpg": "silent_places",
  "bild-6-4.jpg": "silent_beings",
  "bild-7-2.jpg": "contrast",
  "bild-7-3.jpg": "silent_places",
  "bild-8-2.jpg": "fragments",
  "bild-9-2.jpg": "silent_beings",
  "bum-13.jpg": "silent_beings",
  "dscf0185-2.jpg": "contrast",
  "dscf1541.jpg": "silent_beings",
  "dscf1602.jpg": "silent_beings",
  "dscf6220.jpg": "silent_places",
  "roll1-008.jpg": "fragments",
  "roll1-026.jpg": "contrast"
};

const groups = {
  silent_places: [],
  silent_beings: [],
  contrast: [],
  fragments: []
};

for (const [file, cat] of Object.entries(categories)) {
  groups[cat].push(file);
}

function renderImages(list) {
  let html = '';
  list.forEach((img, index) => {
    let cls = 'photo-window reveal-on-scroll';
    // Create scattered vertical offsets (down and up relative to each other)
    if (index % 3 === 1) cls += ' photo-window--offset';
    
    html += `      <div class="${cls}" data-tilt>
        <div class="photo-window__frame">
          <img src="/photos/${img}" alt="Portfolio photography" loading="lazy" />
        </div>
      </div>\n`;
  });
  return html;
}

const newGalleries = `
  <!-- Gallery Chapter 1: Silent Places -->
  <section id="gallery-1" class="gallery-chapter">
    <div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.12">
      <div class="comic-doodle surreal-doodle doodle-void doodle-2"></div>
      <div class="comic-doodle doodle-eye doodle-g1a"></div>
      <div class="comic-doodle doodle-mouth doodle-g1b"></div>
    </div>

    <div class="gallery-chapter__title-wrapper reveal-on-scroll">
      <h2 class="gallery-chapter__title">SILENT MOMENTS</h2>
      <p class="gallery-chapter__subtitle">Architecture and Emptiness</p>
    </div>

    <div class="gallery-chapter__grid gallery-chapter__grid--scattered">
${renderImages(groups.silent_places)}    </div>
  </section>

  <!-- Interlude 1 -->
  <section class="interlude">
    <div class="interlude__strip parallax-layer" data-speed="0.2">
      <div class="comic-doodle doodle-face doodle-i1"></div>
      <div class="comic-doodle surreal-doodle doodle-swarm doodle-i2"></div>
      <div class="comic-doodle doodle-mouth doodle-i3"></div>
      <div class="comic-doodle doodle-teeth doodle-i4"></div>
    </div>
    <div class="interlude__text reveal-on-scroll">
      <span>THE NOISE NEVER STOPS</span>
    </div>
  </section>

  <!-- Gallery Chapter 2: Silent Beings -->
  <section id="gallery-2" class="gallery-chapter gallery-chapter--alt">
    <div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.2">
      <div class="comic-doodle doodle-mouth doodle-1"></div>
      <div class="comic-doodle surreal-doodle doodle-veins doodle-2"></div>
      <div class="comic-doodle doodle-eye doodle-g2c"></div>
    </div>

    <div class="gallery-chapter__title-wrapper reveal-on-scroll">
      <h2 class="gallery-chapter__title">SILENT MOMENTS</h2>
      <p class="gallery-chapter__subtitle">Figures in Stillness</p>
    </div>

    <div class="gallery-chapter__grid gallery-chapter__grid--scattered">
${renderImages(groups.silent_beings)}    </div>
  </section>

  <!-- Interlude 2 -->
  <section class="interlude interlude--dark">
    <div class="interlude__strip parallax-layer" data-speed="0.18">
      <div class="comic-doodle surreal-doodle doodle-maw doodle-j1"></div>
      <div class="comic-doodle doodle-teeth doodle-j2"></div>
      <div class="comic-doodle doodle-face doodle-j3"></div>
    </div>
    <div class="interlude__text reveal-on-scroll">
      <span>BUT IF YOU LOOK CLOSER...</span>
    </div>
  </section>

  <!-- Gallery Chapter 3: Contrasts -->
  <section id="gallery-3" class="gallery-chapter">
    <div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.1">
      <div class="comic-doodle surreal-doodle doodle-swarm doodle-1"></div>
      <div class="comic-doodle doodle-eye doodle-2"></div>
      <div class="comic-doodle surreal-doodle doodle-maw doodle-3"></div>
    </div>

    <div class="gallery-chapter__title-wrapper reveal-on-scroll">
      <h2 class="gallery-chapter__title">CONTRASTS</h2>
      <p class="gallery-chapter__subtitle">Light against shadow</p>
    </div>

    <div class="gallery-chapter__grid gallery-chapter__grid--scattered">
${renderImages(groups.contrast)}    </div>
  </section>

  <!-- Gallery Chapter 4: Fragments -->
  <section id="gallery-4" class="gallery-chapter gallery-chapter--alt">
    <div class="gallery-chapter__comic-bg parallax-layer" data-speed="0.25">
      <div class="comic-doodle doodle-eye doodle-1"></div>
      <div class="comic-doodle surreal-doodle doodle-melt doodle-2"></div>
      <div class="comic-doodle doodle-mouth doodle-3"></div>
    </div>

    <div class="gallery-chapter__title-wrapper reveal-on-scroll">
      <h2 class="gallery-chapter__title">FRAGMENTS</h2>
      <p class="gallery-chapter__subtitle">Pieces of a larger truth</p>
    </div>

    <div class="gallery-chapter__grid gallery-chapter__grid--scattered">
${renderImages(groups.fragments)}    </div>
  </section>
`;

let html = fs.readFileSync('index.html', 'utf8');
const startMatch = '<section id="gallery-1" class="gallery-chapter">';
const startIndex = html.indexOf(startMatch);

// Look for the footer line to properly replace
const endIndex = html.indexOf('  <!-- ============================================ -->\r\n  <!-- FOOTER') !== -1 
  ? html.indexOf('  <!-- ============================================ -->\r\n  <!-- FOOTER')
  : html.indexOf('  <!-- ============================================ -->\n  <!-- FOOTER');

if (startIndex !== -1 && endIndex !== -1) {
  const newHtml = html.substring(0, startIndex) + newGalleries.trim() + '\n\n' + html.substring(endIndex);
  fs.writeFileSync('index.html', newHtml);
  console.log('HTML rewritten successfully with --scattered!');
} else {
  console.log('Could not find boundaries', startIndex, endIndex);
}
