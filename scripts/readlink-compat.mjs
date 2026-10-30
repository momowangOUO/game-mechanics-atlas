import fs from 'node:fs';
import { syncBuiltinESMExports } from 'node:module';
import { getSystemErrorMap } from 'node:util';

const [invalidArgumentNumber] = [...getSystemErrorMap()].find(([, [name]]) => name === 'EINVAL');
const installed = new WeakSet();

function normalize(error, stats) {
  if (!stats.isSymbolicLink() && (stats.isFile() || stats.isDirectory())) {
    error.code = 'EINVAL';
    error.errno = invalidArgumentNumber;
    error.message = error.message.replace(/^EISDIR/, 'EINVAL').replace('illegal operation on a directory', 'invalid argument');
  }
  return error;
}

// Windows exFAT can report EISDIR even for ordinary files. File tracers expect
// EINVAL for non-links. Only normalize after lstat positively verifies the entry;
// never replace the original error if that verification itself fails.
export function installReadlinkCompat(fileSystem, platform) {
  if (platform !== 'win32' || installed.has(fileSystem)) return;
  installed.add(fileSystem);
  const originalSync = fileSystem.readlinkSync;
  const originalCallback = fileSystem.readlink;
  const originalPromise = fileSystem.promises.readlink;

  fileSystem.readlinkSync = function (...args) {
    try { return originalSync.apply(this, args); }
    catch (error) {
      if (error.code === 'EISDIR') {
        try { normalize(error, fileSystem.lstatSync(args[0])); } catch { /* Keep original failure. */ }
      }
      throw error;
    }
  };

  fileSystem.readlink = function (...args) {
    const callback = args.at(-1);
    // Leave invalid-argument validation to Node rather than changing its contract.
    if (typeof callback !== 'function') return originalCallback.apply(this, args);
    args[args.length - 1] = (error, value) => {
      if (error?.code !== 'EISDIR') return callback(error, value);
      fileSystem.lstat(args[0], (statError, stats) => {
        if (!statError) normalize(error, stats);
        callback(error, value);
      });
    };
    return originalCallback.apply(this, args);
  };

  fileSystem.promises.readlink = async function (...args) {
    try { return await originalPromise.apply(this, args); }
    catch (error) {
      if (error.code === 'EISDIR') {
        try { normalize(error, await fileSystem.promises.lstat(args[0])); } catch { /* Keep original failure. */ }
      }
      throw error;
    }
  };
}

installReadlinkCompat(fs, process.platform);
if (process.platform === 'win32') syncBuiltinESMExports();
