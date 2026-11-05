#!/usr/bin/env node
// Refreshes the live parts of the profile: the weekly activity chart and the "Latest work" list.
// No dependencies and no outside service, only the GitHub GraphQL API.
const fs = require('fs');
const path = require('path');
const { light, dark, FONT } = require('./theme');

const LOGIN = 'ahmed-3m';
const ROOT = path.join(__dirname, '..');
const README = path.join(ROOT, 'README.md');
const START = '<!-- latest-work:start -->';
const END = '<!-- latest-work:end -->';
const LIST_LENGTH = 5;

// Only public, merged pull requests in this account's own repositories can reach the page.
const QUERY = `query($login: String!, $search: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { contributionCount date } }
      }
    }
  }
  search(query: $search, type: ISSUE, first: 50) {
    nodes {
      ... on PullRequest {
        title
        url
        number
        mergedAt
        repository { name isPrivate }
      }
    }
  }
}`;

// Housekeeping is left out, so the list shows work rather than release chores.
const HOUSEKEEPING = /^(chore|ci|build|test|tests|style|docs|release)\b|^\w+\(ci\)|^merge\b/i;

function latestWork(nodes) {
  return nodes
    .filter((pr) => pr.mergedAt && !pr.repository.isPrivate && pr.repository.name !== LOGIN)
    .filter((pr) => !HOUSEKEEPING.test(pr.title) && !/faultrix/i.test(pr.title))
    .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
    .slice(0, LIST_LENGTH)
    .map((pr) => {
      const date = new Date(pr.mergedAt).toLocaleString('en', {
        month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
      });
      const plain = pr.title
        .replace(/^\w+(\([^)]*\))?!?:\s*/, '')
        .replace(/\s*\([A-Z]+-\d+\)\s*$/, '')
        .replace(/[\\`*_[\]<>|]/g, '')
        .trim();
      const title = plain.charAt(0).toUpperCase() + plain.slice(1);
      return `- ${date}: ${title} ([${pr.repository.name} #${pr.number}](${pr.url}))`;
    });
}

function roundUp(value) {
  if (value <= 10) return 10;
  const step = 10 ** Math.floor(Math.log10(value));
  for (const factor of [1, 2, 2.5, 5, 10]) {
    if (factor * step >= value) return factor * step;
  }
  return 10 * step;
}

function chart(calendar, theme) {
  const width = 900;
  const height = 280;
  const left = 56;
  const right = 12;
  const top = 76;
  const bottom = 34;
  const weeks = calendar.weeks.map((week) => ({
    start: week.contributionDays[0].date,
    count: week.contributionDays.reduce((sum, day) => sum + day.contributionCount, 0),
  }));
  const busiest = Math.max(...weeks.map((week) => week.count));
  const busiestIndex = weeks.findIndex((week) => week.count === busiest);
  const yMax = roundUp(busiest);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const slot = plotWidth / weeks.length;
  const barWidth = Math.max(slot - 2, 2);
  const baseline = top + plotHeight;
  const y = (value) => baseline - (value / yMax) * plotHeight;
  const parts = [];

  for (const tick of [0, yMax / 2, yMax]) {
    parts.push(`<line x1="${left}" x2="${width - right}" y1="${y(tick)}" y2="${y(tick)}" stroke="${theme.rule}"/>`);
    parts.push(`<text x="${left - 8}" y="${y(tick) + 5}" text-anchor="end" font-size="16" fill="${theme.muted}">${tick}</text>`);
  }

  let lastMonth = null;
  weeks.forEach((week, index) => {
    const x = left + index * slot;
    if (week.count > 0) {
      const barHeight = Math.max((week.count / yMax) * plotHeight, 2);
      const radius = Math.min(4, barWidth / 2, barHeight);
      const topY = baseline - barHeight;
      parts.push(`<path fill="${theme.accent}" d="M${x.toFixed(1)} ${baseline}V${(topY + radius).toFixed(1)}Q${x.toFixed(1)} ${topY.toFixed(1)} ${(x + radius).toFixed(1)} ${topY.toFixed(1)}H${(x + barWidth - radius).toFixed(1)}Q${(x + barWidth).toFixed(1)} ${topY.toFixed(1)} ${(x + barWidth).toFixed(1)} ${(topY + radius).toFixed(1)}V${baseline}Z"/>`);
    }
    const date = new Date(`${week.start}T00:00:00Z`);
    const month = date.getUTCMonth();
    // The first partial month is skipped so its label cannot collide with the next one.
    // A label too close to the right edge is skipped so it cannot be clipped.
    const fits = x + 34 <= width - right;
    if (fits && month !== lastMonth && (lastMonth !== null || date.getUTCDate() <= 7)) {
      const label = date.toLocaleString('en', { month: 'short', timeZone: 'UTC' });
      parts.push(`<text x="${x.toFixed(1)}" y="${height - 8}" font-size="16" fill="${theme.muted}">${label}</text>`);
    }
    lastMonth = month;
  });

  const peakX = Math.min(left + busiestIndex * slot + barWidth / 2, width - right - 24);
  parts.push(`<text x="${peakX.toFixed(1)}" y="${(y(busiest) - 7).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="600" fill="${theme.ink}">${busiest}</text>`);

  const total = weeks.reduce((sum, week) => sum + week.count, 0);
  const title = `Bar chart of GitHub contributions per week over the last 12 months. The busiest week had ${busiest}.`;
  return {
    total,
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}">
<title>${title}</title>
<style>text{font-family:${FONT}}</style>
<text x="${left}" y="28" font-size="24" font-weight="600" fill="${theme.ink}">Contributions per week, last 12 months</text>
<text x="${left}" y="54" font-size="18" fill="${theme.muted}">Public and private work. Refreshed daily.</text>
${parts.join('\n')}
</svg>
`,
  };
}

function updateReadme(lines) {
  const readme = fs.readFileSync(README, 'utf8');
  const from = readme.indexOf(START);
  const to = readme.indexOf(END);
  if (from === -1 || to === -1) throw new Error('README is missing the latest-work markers');
  // A bad API answer must not blank the section that is already there.
  if (lines.length === 0) {
    console.log('No pull requests came back, so the list stays as it is');
    return;
  }
  const next = `${readme.slice(0, from)}${START}\n${lines.join('\n')}\n${readme.slice(to)}`;
  fs.writeFileSync(README, next);
}

async function main() {
  const token = process.env.GH_TOKEN;
  if (!token) throw new Error('GH_TOKEN is not set');
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'profile-update',
    },
    body: JSON.stringify({
      query: QUERY,
      variables: {
        login: LOGIN,
        search: `is:pr is:merged is:public author:${LOGIN} user:${LOGIN} sort:updated-desc`,
      },
    }),
  });
  if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
  const body = await response.json();
  if (body.errors) throw new Error(JSON.stringify(body.errors));

  const calendar = body.data.user.contributionsCollection.contributionCalendar;
  for (const [name, theme] of [['light', light], ['dark', dark]]) {
    const { svg, total } = chart(calendar, theme);
    fs.writeFileSync(path.join(ROOT, 'assets', `activity-${name}.svg`), svg);
    if (name === 'light') console.log(`Chart drawn from ${total} contributions`);
  }

  const lines = latestWork(body.data.search.nodes);
  updateReadme(lines);
  console.log(`Latest work: ${lines.length} entries`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
