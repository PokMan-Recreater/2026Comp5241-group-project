import { mkdir, cp, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(resolve(root, 'dist'), { recursive: true });
await cp(resolve(root, 'public'), resolve(root, 'dist'), { recursive: true });
const html = await readFile(resolve(root, 'dist/index.html'), 'utf8');
if (!html.includes('lang="en"') || !html.includes('app.js')) throw new Error('Invalid application entry point');
console.log('Forma built successfully → dist/');
