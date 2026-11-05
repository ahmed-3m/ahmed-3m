#!/usr/bin/env node
// Draws the artwork that does not depend on live data: the hero and the thesis chart.
// Run it by hand after changing a number or a colour. The output is committed.
const fs = require('fs');
const path = require('path');
const { light, dark, FONT } = require('./theme');

const ASSETS = path.join(__dirname, '..', 'assets');

// Small seeded generator, so a rebuild draws the same picture.
function randomFrom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function hero(theme) {
  const width = 900;
  const height = 220;
  const random = randomFrom(7);
  const lanes = [62, 110, 158];
  const left = 500;
  const right = 872;
  const dots = [];

  // Scattered points on the left settle into three clean lines on the right.
  for (let i = 0; i < 150; i += 1) {
    const progress = i / 149;
    const x = left + progress * (right - left);
    const lane = lanes[i % lanes.length];
    const scatterY = 18 + random() * (height - 36);
    const pull = progress ** 1.6;
    const y = scatterY + (lane - scatterY) * pull;
    const opacity = 0.22 + 0.78 * pull;
    const radius = 2.4 + 1.6 * pull;
    const fromX = (random() - 0.5) * 70;
    const fromY = scatterY - y;
    dots.push(
      `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius.toFixed(1)}" opacity="${opacity.toFixed(2)}" style="--x:${fromX.toFixed(1)}px;--y:${fromY.toFixed(1)}px"/>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Ahmed Mohammed, AI/ML Engineer">
<title>Ahmed Mohammed, AI/ML Engineer</title>
<style>
text{font-family:${FONT}}
.dots circle{fill:${theme.accent};animation:settle 1.8s cubic-bezier(.2,.7,.2,1) both}
@keyframes settle{from{transform:translate(var(--x),var(--y))}to{transform:none}}
@media (prefers-reduced-motion:reduce){.dots circle{animation:none}}
</style>
<rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="12" fill="${theme.surface}" stroke="${theme.rule}" stroke-width="2"/>
<text x="40" y="100" font-size="52" font-weight="700" fill="${theme.ink}">Ahmed Mohammed</text>
<text x="40" y="144" font-size="28" font-weight="500" fill="${theme.accent}">AI/ML Engineer</text>
<text x="40" y="180" font-size="20" fill="${theme.muted}">Linz, Austria  ·  M.Sc. AI, JKU Linz</text>
<g class="dots">
${dots.join('\n')}
</g>
</svg>
`;
}

function thesis(theme) {
  const width = 900;
  const height = 270;
  const plotLeft = 40;
  const plotRight = 860;
  const axisMin = 70;
  const axisMax = 100;
  const x = (value) => plotLeft + ((value - axisMin) / (axisMax - axisMin)) * (plotRight - plotLeft);
  const rows = [
    { y: 112, label: 'Baseline', mean: 92.52, sd: 11.07, colour: theme.neutral },
    { y: 186, label: 'With separation loss', mean: 99.03, sd: 0.07, colour: theme.accent },
  ];
  const parts = [];

  for (const tick of [70, 80, 90, 100]) {
    parts.push(`<line x1="${x(tick)}" x2="${x(tick)}" y1="84" y2="216" stroke="${theme.rule}"/>`);
    parts.push(`<text x="${x(tick)}" y="242" font-size="18" text-anchor="middle" fill="${theme.muted}">${tick}%</text>`);
  }
  for (const row of rows) {
    const low = x(Math.max(row.mean - row.sd, axisMin));
    const high = x(Math.min(row.mean + row.sd, axisMax));
    parts.push(`<text x="${plotLeft}" y="${row.y - 14}" font-size="20" font-weight="600" fill="${theme.ink}" stroke="${theme.surface}" stroke-width="8" paint-order="stroke">${row.label}: ${row.mean.toFixed(2)} ± ${row.sd.toFixed(2)}%</text>`);
    parts.push(`<line x1="${low.toFixed(1)}" x2="${high.toFixed(1)}" y1="${row.y}" y2="${row.y}" stroke="${row.colour}" stroke-width="4" stroke-linecap="round"/>`);
    parts.push(`<circle cx="${x(row.mean).toFixed(1)}" cy="${row.y}" r="8" fill="${row.colour}" stroke="${theme.surface}" stroke-width="2"/>`);
  }

  const title = 'Separation loss raised mean AUROC from 92.52% to 99.03% and cut the spread between seeds from 11.07 to 0.07.';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
<title>${title}</title>
<style>text{font-family:${FONT}}</style>
<text x="${plotLeft}" y="32" font-size="24" font-weight="600" fill="${theme.ink}">Higher accuracy, and far less luck</text>
<text x="${plotLeft}" y="60" font-size="18" fill="${theme.muted}">AUROC on CIFAR-10, mean ± SD over three seeds. Range cut off at 100%.</text>
${parts.join('\n')}
</svg>
`;
}

for (const [name, theme] of [['light', light], ['dark', dark]]) {
  fs.writeFileSync(path.join(ASSETS, `hero-${name}.svg`), hero(theme));
  fs.writeFileSync(path.join(ASSETS, `thesis-${name}.svg`), thesis(theme));
}
console.log('Wrote hero and thesis artwork');
