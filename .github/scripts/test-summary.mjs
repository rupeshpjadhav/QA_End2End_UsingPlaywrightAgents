// Writes a Markdown summary of a Playwright run (from the JSON reporter) to
// the GitHub Actions job summary. Usage: node test-summary.mjs <results.json>
import { readFileSync, appendFileSync, existsSync } from 'node:fs';

const [resultsPath = 'test-results/results.json'] = process.argv.slice(2);
const out = process.env.GITHUB_STEP_SUMMARY;
const write = text => (out ? appendFileSync(out, text + '\n') : console.log(text));

if (!existsSync(resultsPath)) {
  write(`## Playwright test results\n\n:warning: No results found at \`${resultsPath}\` — the test run did not complete.`);
  process.exit(0);
}

const report = JSON.parse(readFileSync(resultsPath, 'utf8'));
const { expected, unexpected, flaky, skipped, duration } = report.stats;

// Walk nested suites and collect tests that failed or were flaky.
const problems = [];
const walk = suite => {
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests) {
      if (t.status === 'unexpected' || t.status === 'flaky') {
        const last = t.results.at(-1);
        const error = (last?.error?.message ?? '').replace(/\u001b\[[0-9;]*m/g, '').split('\n')[0];
        problems.push({ status: t.status, project: t.projectName, title: `${spec.file} › ${spec.title}`, error });
      }
    }
  }
  (suite.suites ?? []).forEach(walk);
};
report.suites.forEach(walk);

const icon = unexpected > 0 ? ':x:' : ':white_check_mark:';
const lines = [
  `## ${icon} Playwright test results`,
  '',
  '| Passed | Failed | Flaky | Skipped | Duration |',
  '|---|---|---|---|---|',
  `| ${expected} | ${unexpected} | ${flaky} | ${skipped} | ${(duration / 1000).toFixed(0)}s |`,
  '',
];
if (problems.length) {
  lines.push('| Status | Project | Test | Error |', '|---|---|---|---|');
  for (const p of problems) {
    const err = p.error.replace(/\|/g, '\\|').slice(0, 200);
    lines.push(`| ${p.status === 'flaky' ? 'flaky' : '**failed**'} | ${p.project} | ${p.title} | ${err} |`);
  }
  lines.push('');
}
lines.push('Download the **playwright-report** artifact below and open `index.html` — failed tests include their screenshot, video and trace.');
write(lines.join('\n'));
