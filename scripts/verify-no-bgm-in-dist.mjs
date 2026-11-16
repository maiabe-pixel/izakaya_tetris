import fs from 'node:fs';
import path from 'node:path';

const distAudio = path.resolve('dist/audio');
const distRoot = path.resolve('dist');

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

if (!fs.existsSync(distRoot)) {
  console.error('FAIL: dist/ missing — run npm run build first');
  process.exit(1);
}

const mp3s = walk(distRoot).filter((p) => p.endsWith('.mp3'));
if (mp3s.length > 0) {
  console.error('FAIL: mp3 found in dist:');
  for (const p of mp3s) console.error(' -', path.relative(process.cwd(), p));
  process.exit(1);
}

if (fs.existsSync(distAudio)) {
  const leftover = fs.readdirSync(distAudio).filter((n) => n.endsWith('.mp3'));
  if (leftover.length) {
    console.error('FAIL: dist/audio still has mp3', leftover);
    process.exit(1);
  }
}

console.log('PASS: no mp3 BGM in dist');
