import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const env = { ...process.env };
const args = process.argv.slice(2);
if (args.includes('--pages')) env.PAGES_BASE_PATH ??= '/game-mechanics-atlas';
if (process.platform === 'win32') {
  // NODE_OPTIONS is local to this child and inherited by Next's build workers.
  // A file URL safely handles spaces and non-ASCII workspace paths.
  const preload = new URL('./readlink-compat.mjs', import.meta.url).href;
  env.NODE_OPTIONS = `${env.NODE_OPTIONS ?? ''} --import=${preload}`.trim();
}
const cli = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url));
const child = spawn(process.execPath, [cli, 'build', '--webpack', ...args.filter(arg => arg !== '--pages')], { env, stdio: 'inherit' });
child.on('error', error => { console.error(error); process.exitCode = 1; });
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
