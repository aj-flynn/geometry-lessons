import { createHash } from 'node:crypto';
import { existsSync, lstatSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { archiveCandidatePaths, check } from './check.mjs';

const reportPaths = new Set([
  'docs/SKILL-REFINEMENT.md', 'docs/LESSON-0001-REVIEW.md',
  'docs/ENGLISH-REVIEW.md', 'docs/CHEMISTRY-REVIEW.md'
]);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

function archivePaths(base) {
  if (existsSync(resolve(base, '.git'))) throw new Error('Use an explicit frozen archive of selected Git paths.');
  const paths = archiveCandidatePaths(base);
  if (paths.some(name => !lstatSync(resolve(base, name)).isFile())) {
    throw new Error('The frozen archive must contain regular files only.');
  }
  return paths;
}

function approvedReports(reports, files) {
  if (!Array.isArray(reports) || new Set(reports).size !== reports.length ||
      reports.some(name => !reportPaths.has(name) || !files.includes(name))) {
    throw new Error('Append-only outputs must be distinct, existing review reports from the approved list.');
  }
  return new Set(reports);
}

function inventory(base, paths) {
  return Object.fromEntries(paths.map(name => {
    const bytes = readFileSync(resolve(base, name));
    return [name, { bytes: bytes.length, sha256: hash(bytes) }];
  }));
}

export function createInputReceipt(base, reports = []) {
  const paths = archivePaths(base);
  const appendOnly = [...approvedReports(reports, paths)].sort();
  check(base);
  const files = inventory(base, paths);
  const treeSha256 = hash(JSON.stringify(files));
  return {
    version: 1, kind: 'review-input', appendOnly, files, treeSha256,
    receiptSha256: hash(JSON.stringify({ appendOnly, treeSha256 }))
  };
}

export function verifyPublicationEnvelope(base, receipt) {
  if (receipt?.version !== 1 || receipt.kind !== 'review-input' ||
      !receipt.files || hash(JSON.stringify(receipt.files)) !== receipt.treeSha256 ||
      hash(JSON.stringify({ appendOnly: receipt.appendOnly, treeSha256: receipt.treeSha256 })) !== receipt.receiptSha256) {
    throw new Error('Expected a valid private review-input receipt.');
  }
  const paths = archivePaths(base);
  const baseline = Object.keys(receipt.files);
  const appendOnly = approvedReports(receipt.appendOnly, baseline);
  if (paths.length !== baseline.length || paths.some(name => !Object.hasOwn(receipt.files, name))) {
    throw new Error('The frozen candidate file set changed. Freeze and review the new input set.');
  }
  const files = inventory(base, paths);
  const appendedReports = [];
  for (const name of paths) {
    const prior = receipt.files[name];
    const current = files[name];
    if (prior.sha256 === current.sha256 && prior.bytes === current.bytes) continue;
    if (!appendOnly.has(name)) throw new Error(`Frozen input changed: ${name}.`);
    if (!Number.isSafeInteger(prior.bytes) || prior.bytes < 0 || prior.bytes >= current.bytes ||
        hash(readFileSync(resolve(base, name)).subarray(0, prior.bytes)) !== prior.sha256) {
      throw new Error(`Existing review report bytes changed: ${name}.`);
    }
    appendedReports.push(name);
  }
  check(base);
  return {
    version: 1, kind: 'publication-envelope', inputReceiptSha256: receipt.receiptSha256,
    inputTreeSha256: receipt.treeSha256,
    appendedReports, files, treeSha256: hash(JSON.stringify(files))
  };
}

function privatePath(base, path, existing = false) {
  const absolute = resolve(path);
  const target = existing ? realpathSync(absolute) : resolve(realpathSync(dirname(absolute)), basename(absolute));
  const fromArchive = relative(base, target);
  if (!(isAbsolute(fromArchive) || fromArchive === '..' || fromArchive.startsWith('..' + sep))) {
    throw new Error('Keep receipts and publication envelopes outside the frozen archive.');
  }
  return target;
}

function main(args) {
  const [action, root, receiptPath, ...rest] = args;
  if (!root || !receiptPath || !['create', 'verify'].includes(action) || (action === 'verify' && rest.length !== 1)) {
    throw new Error('Usage: review-candidate.mjs create ROOT INPUT_RECEIPT [REPORT ...] or verify ROOT INPUT_RECEIPT PUBLICATION_ENVELOPE');
  }
  const base = realpathSync(root);
  if (action === 'create') {
    const output = privatePath(base, receiptPath);
    writeFileSync(output, JSON.stringify(createInputReceipt(base, rest), null, 2) + '\n', { flag: 'wx' });
  } else {
    const input = privatePath(base, receiptPath, true);
    const output = privatePath(base, rest[0]);
    const receipt = JSON.parse(readFileSync(input, 'utf8'));
    writeFileSync(output, JSON.stringify(verifyPublicationEnvelope(base, receipt), null, 2) + '\n', { flag: 'wx' });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
