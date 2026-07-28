import { spawnSync } from 'node:child_process';

const budgets = {
  critical: 2,
  high: 9,
  total: 15,
};

const audit = spawnSync('npm', ['audit', '--omit=dev', '--json'], {
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

if (audit.error) {
  console.error(`Unable to run npm audit: ${audit.error.message}`);
  process.exit(1);
}

let report;
try {
  report = JSON.parse(audit.stdout);
} catch {
  console.error(audit.stderr || audit.stdout || 'npm audit produced no readable output.');
  process.exit(1);
}

const metrics = report.metadata?.vulnerabilities;
if (!metrics) {
  console.error('npm audit did not return vulnerability metadata.');
  process.exit(1);
}

console.log(JSON.stringify({ metrics, budgets }, null, 2));

const failures = Object.entries(budgets)
  .filter(([severity, budget]) => metrics[severity] > budget)
  .map(([severity, budget]) => `${severity}: ${metrics[severity]} exceeds ${budget}`);

if (failures.length > 0) {
  console.error(`Dependency risk budget failed:\n${failures.join('\n')}`);
  process.exit(1);
}
