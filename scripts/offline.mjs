import { readdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const files = await readdir('dist/client', {
  recursive: true,
  withFileTypes: true,
});
const assets = files
  .filter(
    (f) =>
      f.isFile() &&
      !f.name.endsWith('.map') &&
      !f.name.startsWith('.') &&
      f.name !== 'sw.js' &&
      f.name !== 'offline-assets.json' &&
      f.name !== '_headers' &&
      f.name !== '_redirects' &&
      !f.parentPath.replaceAll('\\', '/').includes('/.vite'),
  )
  .map(
    (f) =>
      '/' +
      (f.parentPath + '/' + f.name)
        .replaceAll('\\', '/')
        .replace(/^dist\/client\//, ''),
  );
const version = createHash('sha256')
  .update(JSON.stringify(assets))
  .digest('hex')
  .slice(0, 12);
const source = await readFile('public/sw.js', 'utf8');
await writeFile('dist/client/sw.js', source.replace('__VERSION__', version));
await writeFile(
  'dist/client/offline-assets.json',
  JSON.stringify(['/', '/council', '/receipt', ...assets]),
);
console.log(`Offline manifest: ${assets.length} assets.`);
