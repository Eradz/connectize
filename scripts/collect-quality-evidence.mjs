import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const outputPath = process.argv[2] || 'reports/quality/evidence.json';
const reportPaths = {
  security: 'reports/quality/security.json',
  securityStderr: 'reports/quality/security.stderr.log',
  bundle: 'reports/quality/bundle.json',
  bundleStderr: 'reports/quality/bundle.stderr.log',
  seo: 'reports/quality/seo.log',
  pdf: 'reports/quality/pdf.log',
  build: 'reports/quality/build.log',
  coverage: 'reports/quality/coverage.json',
  coverageLog: 'reports/quality/coverage.log',
};

const evidenceErrors = [];
const run = (command, args) => {
  try {
    return execFileSync(command, args, { encoding: 'utf8' }).trim();
  } catch (error) {
    evidenceErrors.push(`${command} ${args.join(' ')}: ${error.message}`);
    return null;
  }
};
const sha256 = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const availableReports = Object.fromEntries(
  Object.entries(reportPaths)
    .filter(([, path]) => existsSync(path))
    .map(([name, path]) => [name, { path, sha256: sha256(path) }]),
);
const tryReadJson = (name, path) => {
  if (!existsSync(path)) return null;
  try {
    return readJson(path);
  } catch (error) {
    evidenceErrors.push(`${name}: ${error.message}`);
    return null;
  }
};
const commandPassed = (name, fallbackPath) => {
  const exitPath = `reports/quality/${name}.exit`;
  return existsSync(exitPath)
    && readFileSync(exitPath, 'utf8').trim() === '0'
    && existsSync(fallbackPath);
};

const security = tryReadJson('security', reportPaths.security);
const bundle = tryReadJson('bundle', reportPaths.bundle);
const coverage = tryReadJson('coverage', reportPaths.coverage);
const commit = run('git', ['rev-parse', 'HEAD']);
const branch = process.env.GITHUB_REF_NAME || run('git', ['branch', '--show-current']);
const workingTreeStatus = run('git', ['status', '--porcelain']);
const evidence = {
  schemaVersion: 1,
  schema: {
    name: 'connectize-quality-evidence',
    version: 1,
  },
  project: 'Connectize-Frontend',
  generatedAt: new Date().toISOString(),
  source: {
    commit,
    branch,
    repository: process.env.GITHUB_REPOSITORY || null,
    workflowRunId: process.env.GITHUB_RUN_ID || null,
    workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT || null,
    context: process.env.GITHUB_RUN_ID ? 'github-actions' : 'local',
    workingTreeClean: workingTreeStatus === '',
  },
  environment: {
    node: process.version,
    platform: process.platform,
    architecture: process.arch,
  },
  inputs: {
    packageLockSha256: sha256('package-lock.json'),
  },
  checks: {
    sourceProvenance: commit !== null && branch !== null && workingTreeStatus !== null,
    dependencyBudget: security !== null && commandPassed('security', reportPaths.security),
    seoTests: commandPassed('seo', reportPaths.seo),
    pdfTests: commandPassed('pdf', reportPaths.pdf),
    productionBuild: commandPassed('build', reportPaths.build),
    bundleBudget: bundle !== null && commandPassed('bundle', reportPaths.bundle),
    scopedCoverageBudget: coverage !== null && commandPassed('coverage', reportPaths.coverage),
  },
  metrics: {
    vulnerabilities: security?.metrics ?? null,
    vulnerabilityBudgets: security?.budgets ?? null,
    bundle: bundle?.metrics ?? null,
    bundleBudgets: bundle?.budgets ?? null,
    scopedCoverage: coverage?.metrics ?? null,
    scopedCoverageBudgets: coverage?.budgets ?? null,
    scopedCoverageFiles: coverage?.scope ?? null,
  },
  reports: availableReports,
  errors: evidenceErrors,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify(evidence, null, 2));

if (Object.values(evidence.checks).some(check => !check)) {
  console.error('Quality evidence is incomplete or contains failed checks.');
  process.exit(1);
}