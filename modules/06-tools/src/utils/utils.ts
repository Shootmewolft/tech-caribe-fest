import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_DIR = process.cwd();

export function resolveSafe(relPath: string) {
  const abs = path.resolve(BASE_DIR, relPath);
  if (!abs.startsWith(path.resolve(BASE_DIR) + path.sep) && abs !== path.resolve(BASE_DIR)) {
    throw new Error('Ruta fuera del directorio permitido');
  }
  return abs;
}

export async function* walk(dir: string, currentDepth = 0, maxDepth = Infinity): AsyncGenerator<string> {
  if (currentDepth > maxDepth) return;
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    yield full;
    if (entry.isDirectory()) {
      yield* walk(full, currentDepth + 1, maxDepth);
    }
  }
}

export async function statEntry(absPath: string) {
  const st = await fs.lstat(absPath);
  return {
    name: path.basename(absPath),
    path: path.relative(BASE_DIR, absPath) || '.',
    type: st.isDirectory() ? 'dir' : st.isFile() ? 'file' : 'other',
    size: st.size,
    mtimeMs: st.mtimeMs,
  };
}