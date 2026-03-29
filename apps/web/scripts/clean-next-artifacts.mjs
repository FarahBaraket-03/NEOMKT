import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const target = path.join(process.cwd(), '.next');

if (!existsSync(target)) {
  process.exit(0);
}

async function removeWithNodeFs() {
  await rm(target, {
    recursive: true,
    force: true,
    maxRetries: 3,
    retryDelay: 200,
  });
}

function removeWithShellFallback() {
  if (process.platform === 'win32') {
    const result = spawnSync('cmd.exe', ['/c', 'rmdir', '/s', '/q', '.next'], {
      cwd: process.cwd(),
      stdio: 'inherit',
    });

    if (result.status !== 0) {
      throw new Error('Failed to remove .next via cmd rmdir fallback');
    }
    return;
  }

  const result = spawnSync('rm', ['-rf', '.next'], {
    cwd: process.cwd(),
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error('Failed to remove .next via rm fallback');
  }
}

try {
  await removeWithNodeFs();
} catch {
  removeWithShellFallback();
}
