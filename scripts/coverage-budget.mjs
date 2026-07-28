import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const budgets = {
  lines: 42.69,
  statements: 42.69,
  functions: 41.17,
  branches: 50,
};
const scope = [
  'api/render-meta.js',
  'src/lib/generatePDF.js',
];
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'connectize-frontend-coverage-'));
const coverage = spawnSync('npx', [
  'c8',
  ...scope.map(path => `--include=${path}`),
  '--reporter=json-summary',
  `--reports-dir=${temporaryDirectory}`,
  'node',
  '--test',
  'tests/seo-server.test.mjs',
  'tests/pdf-generation.test.mjs',
], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

process.stderr.write(coverage.stdout);
process.stderr.write(coverage.stderr);

let summary;
try {
  summary = JSON.parse(readFileSync(join(temporaryDirectory, 'coverage-summary.json'), 'utf8')).total;
} catch {
  rmSync(temporaryDirectory, { recursive: true, force: true });
  console.error('c8 produced no readable coverage summary.');
  process.exit(1);
}
rmSync(temporaryDirectory, { recursive: true, force: true });

const metrics = Object.fromEntries(
  Object.keys(budgets).map(name => [name, summary[name].pct]),
);
console.log(JSON.stringify({ scope, metrics, budgets }, null, 2));

const failures = Object.entries(budgets)
  .filter(([name, minimum]) => metrics[name] < minimum)
  .map(([name, minimum]) => `${name}: ${metrics[name]} is below ${minimum}`);
if (coverage.status !== 0) failures.push(`tests: exited with ${coverage.status}`);

if (failures.length > 0) {
  console.error(`Coverage budget failed:\n${failures.join('\n')}`);
  process.exit(1);
}