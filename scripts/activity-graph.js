#!/usr/bin/env node
// Draws assets/activity.svg: contributions per week over the last 12 months.
// No dependencies and no outside service, only the GitHub GraphQL API.
const fs = require('fs');
const path = require('path');

const LOGIN = 'ahmed-3m';
const OUT = path.join(__dirname, '..', 'assets', 'activity.svg');
const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
}`;

const WIDTH = 860;
const HEIGHT = 240;
const LEFT = 44;
const RIGHT = 12;
const TOP = 52;
const BOTTOM = 28;
// Mid-tone colours stay readable on both GitHub's light and dark themes.
const TEXT = '#8b949e';
const GRID = '#8b949e';
const BAR = '#3fb950';

function roundUp(value) {
  if (value <= 10) return 10;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    if (factor * step >= value) return factor * step;
  }
  return 10 * step;
}

function render(calendar) {
  const weeks = calendar.weeks.map((week) => ({
    start: week.contributionDays[0].date,
    count: week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
  }));
  const busiest = Math.max(...weeks.map((week) => week.count));
  const yMax = roundUp(busiest);
  const plotWidth = WIDTH - LEFT - RIGHT;
  const plotHeight = HEIGHT - TOP - BOTTOM;
  const slot = plotWidth / weeks.length;
  const barWidth = Math.max(slot - 3, 2);
  const baseline = TOP + plotHeight;
  const y = (value) => baseline - (value / yMax) * plotHeight;
  const parts = [];

  for (const tick of [0, yMax / 2, yMax]) {
    parts.push(`<line x1="${LEFT}" x2="${WIDTH - RIGHT}" y1="${y(tick)}" y2="${y(tick)}" stroke="${GRID}" stroke-opacity="0.25"/>`);
    parts.push(`<text x="${LEFT - 8}" y="${y(tick) + 4}" text-anchor="end" class="small">${tick}</text>`);
  }

  let lastMonth = null;
  weeks.forEach((week, index) => {
    const x = LEFT + index * slot;
    const height = (week.count / yMax) * plotHeight;
    if (week.count > 0) {
      parts.push(`<rect x="${x.toFixed(1)}" y="${(baseline - height).toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}" rx="1.5" fill="${BAR}"/>`);
    }
    const date = new Date(`${week.start}T00:00:00Z`);
    const month = date.getUTCMonth();
    // The first partial month is skipped so its label cannot collide with the next one.
    if (month !== lastMonth && (lastMonth !== null || date.getUTCDate() <= 7)) {
      const label = date.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
      parts.push(`<text x="${x.toFixed(1)}" y="${HEIGHT - 8}" class="small">${label}</text>`);
    }
    lastMonth = month;
  });

  const total = calendar.totalContributions.toLocaleString('en-US');
  const title = `Contributions per week, last 12 months: ${total} in total, busiest week ${busiest}.`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${title}">
<title>${title}</title>
<style>text{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;fill:${TEXT}}.head{font-size:15px;font-weight:600}.small{font-size:11px}</style>
<text x="${LEFT}" y="22" class="head">Contributions per week, last 12 months</text>
<text x="${LEFT}" y="40" class="small">${total} in total, busiest week ${busiest}</text>
${parts.join('\n')}
</svg>
`;
}

async function main() {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is not set');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'activity-graph',
    },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const body = await response.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));
  const calendar = body.data.user.contributionsCollection.contributionCalendar;
  fs.writeFileSync(OUT, render(calendar));
  console.log(`Wrote ${OUT}: ${calendar.totalContributions} contributions`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
