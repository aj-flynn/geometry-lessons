import { readFileSync, realpathSync } from 'node:fs';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fixture = JSON.parse(readFileSync(new URL('../tests/fixtures/routing-cases.json', import.meta.url), 'utf8'));
const cases = new Map(fixture.cases.map(entry => [entry.case_id, entry]));
const fields = ['subject_route', 'next_action', 'prohibited_action', 'evidence_needed'];
const recordKeys = new Set(['case_id', ...fields, 'explanation']);

export function routingInputs() {
  return fixture.cases.map(({ case_id, input }) => ({ case_id, input }));
}

function caseCodes(entry, field) {
  return [...entry.required[field], ...(entry.optional?.[field] ?? [])];
}

export function routingCodes() {
  const prohibited = [
    ...fixture.never_next_action,
    ...fixture.cases.flatMap(entry => caseCodes(entry, 'prohibited_action'))
  ];
  return Object.fromEntries(fields.map(field => {
    const codes = new Set(fixture.cases.flatMap(entry => caseCodes(entry, field)));
    if (field === 'next_action' || field === 'prohibited_action') {
      for (const code of prohibited) codes.add(code);
    }
    return [field, [...codes].sort()];
  }));
}

export function checkObservations(observations) {
  if (!Array.isArray(observations)) return ['Supply a JSON array of observations.'];
  const errors = [];
  const vocabulary = routingCodes();
  const seen = new Set();
  for (const [index, record] of observations.entries()) {
    const entry = cases.get(record?.case_id);
    if (!entry) {
      errors.push(`Observation ${index + 1}: unknown or missing case_id.`);
      continue;
    }
    const id = entry.case_id;
    if (seen.has(id)) {
      errors.push(`${id}: duplicate observation.`);
      continue;
    }
    seen.add(id);
    if (Object.keys(record).some(key => !recordKeys.has(key))) errors.push(`${id}: unexpected observation fields.`);
    if (typeof record.explanation !== 'string' || !record.explanation.trim()) {
      errors.push(`${id}: supply a free-text explanation.`);
    }
    const prohibited = new Set([
      ...fixture.never_next_action, ...entry.required.prohibited_action,
      ...(Array.isArray(record.prohibited_action) ? record.prohibited_action : [])
    ]);
    for (const field of fields) {
      const codes = record[field];
      if (!Array.isArray(codes) || codes.some(code => !vocabulary[field].includes(code))) {
        errors.push(`${id}: ${field} must be an array of recognized decision codes.`);
        continue;
      }
      const supplied = new Set(codes);
      if (supplied.size !== codes.length) errors.push(`${id}: duplicate ${field} codes.`);
      for (const code of entry.required[field]) {
        if (!supplied.has(code)) errors.push(`${id}: ${field} is missing ${code}.`);
      }
      if (field === 'prohibited_action') continue;
      const allowed = new Set(caseCodes(entry, field));
      for (const code of supplied) {
        if (field === 'next_action' && prohibited.has(code)) {
          errors.push(`${id}: prohibited next action ${code}.`);
        } else if (!allowed.has(code)) {
          errors.push(`${id}: incompatible ${field} code ${code}.`);
        }
      }
    }
  }
  for (const id of cases.keys()) {
    if (!seen.has(id)) errors.push(`${id}: missing observation.`);
  }
  return errors;
}

function readPrivateObservations(path) {
  const root = realpathSync(fileURLToPath(new URL('../', import.meta.url)));
  const file = realpathSync(path);
  const fromRoot = relative(root, file);
  if (!isAbsolute(fromRoot) && fromRoot !== '..' && !fromRoot.startsWith(`..${sep}`)) {
    throw new Error('Keep observations outside the public checkout.');
  }
  try {
    return JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
  } catch {
    throw new Error('Could not read the private observations as JSON.');
  }
}

function main([command, path, ...extra]) {
  if (command === 'inputs' && !path) {
    console.log(JSON.stringify(routingInputs(), null, 2));
  } else if (command === 'codes' && !path) {
    console.log(JSON.stringify(routingCodes(), null, 2));
  } else if (command === 'check' && path && !extra.length) {
    const errors = checkObservations(readPrivateObservations(path));
    if (errors.length) {
      console.error(errors.join('\n'));
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify({ matched_case_decisions: cases.size, explanation_review_required: true }));
    }
  } else {
    throw new Error('Use inputs, codes, or check <private-observations.json>.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
