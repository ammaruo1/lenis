import { readdir, mkdir, copyFile } from 'node:fs/promises';
const source = new URL('../../public/', import.meta.url);
const destination = new URL('../../admin/public/', import.meta.url);
await mkdir(destination, { recursive: true });
for (const file of await readdir(source)) {
  if (/^(LinaRound-.*\.otf|MPLUSRounded1c-.*\.ttf)$/.test(file)) await copyFile(new URL(file, source), new URL(file, destination));
}
