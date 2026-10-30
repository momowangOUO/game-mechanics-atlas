import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import { installReadlinkCompat } from './readlink-compat.mjs';

const file = new URL('../package.json', import.meta.url);
const directory = new URL('../src/', import.meta.url);
const symlink = { isSymbolicLink: () => true, isFile: () => false, isDirectory: () => false };
const special = { isSymbolicLink: () => false, isFile: () => false, isDirectory: () => false };

function fixture({ code = 'EISDIR', stats, statError, result } = {}) {
  const error = Object.assign(new Error(`${code}: readlink`), { code, errno: -4068, syscall: 'readlink', path: file });
  let statCalls = 0;
  const calls = [];
  const getStats = (path) => {
    statCalls++;
    if (statError) throw statError;
    return stats ?? fs.lstatSync(path);
  };
  const system = {
    readlinkSync(path, options) { calls.push([path, options]); if (result !== undefined) return result; throw error; },
    readlink(path, options, callback) {
      if (typeof options === 'function') { callback = options; options = undefined; }
      calls.push([path, options]);
      queueMicrotask(() => callback(result === undefined ? error : null, result));
    },
    lstatSync: getStats,
    lstat(path, callback) { queueMicrotask(() => { let value; try { value = getStats(path); } catch (error) { callback(error); return; } callback(null, value); }); },
    promises: {
      async readlink(path, options) { calls.push([path, options]); if (result !== undefined) return result; throw error; },
      async lstat(path) { return getStats(path); },
    },
  };
  return { system, error, calls, statCalls: () => statCalls };
}

const callers = {
  sync: async (system, path, options) => system.readlinkSync(path, options),
  callback: (system, path, options) => new Promise((resolve, reject) => system.readlink(path, options, (error, value) => error ? reject(error) : resolve(value))),
  promise: (system, path, options) => system.promises.readlink(path, options),
};

for (const [api, read] of Object.entries(callers)) {
  for (const path of [file, directory]) {
    test(`${api}: normalize Windows EISDIR for verified ${path === file ? 'file' : 'directory'}`, async () => {
      const f = fixture();
      installReadlinkCompat(f.system, 'win32');
      await assert.rejects(read(f.system, path), error => {
        assert.equal(error.code, 'EINVAL');
        assert.equal(error.syscall, 'readlink');
        assert.equal(error.path, f.error.path);
        assert.equal(error, f.error);
        return true;
      });
      assert.equal(f.statCalls(), 1);
    });
  }
  for (const [name, config] of Object.entries({ symlink: { stats: symlink }, special: { stats: special }, inaccessible: { statError: new Error('permission denied') }, unrelated: { code: 'EACCES' } })) {
    test(`${api}: preserve ${name} error`, async () => {
      const f = fixture(config);
      installReadlinkCompat(f.system, 'win32');
      await assert.rejects(read(f.system, file), error => error === f.error && error.code === (config.code ?? 'EISDIR'));
      if (config.code) assert.equal(f.statCalls(), 0);
    });
  }
  test(`${api}: preserve successful link result, path and encoding`, async () => {
    const result = Buffer.from('../target');
    const f = fixture({ result });
    installReadlinkCompat(f.system, 'win32');
    assert.equal(await read(f.system, file, 'buffer'), result);
    assert.deepEqual(f.calls, [[file, 'buffer']]);
    assert.equal(f.statCalls(), 0);
  });
}

test('non-Windows leaves every API untouched', () => {
  const f = fixture();
  const originals = [f.system.readlink, f.system.readlinkSync, f.system.promises.readlink];
  installReadlinkCompat(f.system, 'linux');
  assert.deepEqual([f.system.readlink, f.system.readlinkSync, f.system.promises.readlink], originals);
});

test('callback overload works without options and is called exactly once', async () => {
  const f = fixture();
  installReadlinkCompat(f.system, 'win32');
  let callbacks = 0;
  const error = await new Promise(resolve => f.system.readlink(file, error => { callbacks++; resolve(error); }));
  assert.equal(error.code, 'EINVAL');
  assert.equal(callbacks, 1);
});

test('preload reaches child and grandchild Node processes, including ESM builtins', { skip: process.platform !== 'win32' }, () => {
  const preload = new URL('./readlink-compat.mjs', import.meta.url).href;
  const probe = `
    import assert from 'node:assert/strict';
    import { readlinkSync, readlink } from 'node:fs';
    import { readlink as promiseReadlink } from 'node:fs/promises';
    const file = new URL(${JSON.stringify(file.href)});
    assert.throws(() => readlinkSync(file), { code: 'EINVAL' });
    await assert.rejects(promiseReadlink(file), { code: 'EINVAL' });
    await assert.rejects(new Promise((resolve, reject) => readlink(file, (error, value) => error ? reject(error) : resolve(value))), { code: 'EINVAL' });
  `;
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    ${probe}
    const { spawnSync } = await import('node:child_process');
    const child = spawnSync(process.execPath, ['--input-type=module', '-e', ${JSON.stringify(probe)}], { encoding: 'utf8' });
    assert.equal(child.status, 0, child.stderr);
  `], { encoding: 'utf8', env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --import=${preload}`.trim() } });
  assert.equal(result.status, 0, result.stderr);
});
