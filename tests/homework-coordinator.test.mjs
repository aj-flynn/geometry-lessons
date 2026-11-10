import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

test('private homework coordinator recovery and concurrency tests', () => {
  const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const result = spawnSync(python, ['-m', 'unittest', 'discover', '-s', 'tests', '-p', 'test_homework_job.py', '-v'], {
    cwd: fileURLToPath(new URL('..', import.meta.url)), encoding: 'utf8', timeout: 60000,
  });
  assert.equal(result.status, 0, String(result.error || '') + result.stdout + result.stderr);
});
