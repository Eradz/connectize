import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const assetsDirectory = 'build/client/assets';
const htmlPath = 'build/client/index.html';
const budgets = {
  totalRawBytes: 7_430_000,
  totalGzipBytes: 2_045_000,
  startupRawBytes: 1_760_000,
  startupGzipBytes: 575_000,
  largestRawBytes: 1_150_000,
  largestGzipBytes: 373_000,
};

if (!existsSync(assetsDirectory) || !existsSync(htmlPath)) {
  console.error('Bundle output is missing. Run npm run build first.');
  process.exit(1);
}

const chunks = readdirSync(assetsDirectory)
  .filter(fileName => fileName.endsWith('.js'))
  .map(fileName => {
    const filePath = join(assetsDirectory, fileName);
    const content = readFileSync(filePath);
    return {
      fileName,
      rawBytes: statSync(filePath).size,
      gzipBytes: gzipSync(content).length,
    };
  })
  .sort((left, right) => right.rawBytes - left.rawBytes);

if (chunks.length === 0) {
  console.error(`No JavaScript chunks found in ${assetsDirectory}.`);
  process.exit(1);
}

const html = readFileSync(htmlPath, 'utf8');
const startupFileNames = [...html.matchAll(/(?:src|href)=["']\/assets\/([^"']+\.js)["']/g)]
  .map(match => match[1]);
const startupChunks = startupFileNames.map(fileName => {
  const chunk = chunks.find(candidate => candidate.fileName === fileName);
  if (!chunk) {
    console.error(`Startup chunk referenced by HTML is missing: ${fileName}`);
    process.exit(1);
  }
  return chunk;
});

const metrics = {
  chunks: chunks.length,
  totalRawBytes: chunks.reduce((total, chunk) => total + chunk.rawBytes, 0),
  totalGzipBytes: chunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
  startupRawBytes: startupChunks.reduce((total, chunk) => total + chunk.rawBytes, 0),
  startupGzipBytes: startupChunks.reduce((total, chunk) => total + chunk.gzipBytes, 0),
  largestRawBytes: chunks[0].rawBytes,
  largestGzipBytes: Math.max(...chunks.map(chunk => chunk.gzipBytes)),
};

console.log(JSON.stringify({
  metrics,
  budgets,
  startupChunks,
  largestChunks: chunks.slice(0, 5),
}, null, 2));

const failures = Object.entries(budgets)
  .filter(([metric, budget]) => metrics[metric] > budget)
  .map(([metric, budget]) => `${metric}: ${metrics[metric]} exceeds ${budget}`);

if (failures.length > 0) {
  console.error(`Bundle budget failed:\n${failures.join('\n')}`);
  process.exit(1);
}
