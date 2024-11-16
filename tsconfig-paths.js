// tsconfig-paths.js
import { resolve } from 'path';
import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function resolve(specifier, context, defaultResolve) {
  if (specifier.startsWith('@/')) {
    const path = specifier.replace('@/', `${resolve(__dirname, 'src')}/`);
    specifier = pathToFileURL(path).href;
  }
  return defaultResolve(specifier, context, defaultResolve);
}