import fs from 'node:fs';
import path from 'node:path';

const required = ['tetris.mp3', 'izakaya.mp3'];
const distAudio = path.resolve('dist/audio');
const distRoot = path.resolve('dist');

if (!fs.existsSync(distRoot)) {
  console.error('FAIL: dist/ missing — run npm run build first');
  process.exit(1);
}

if (!fs.existsSync(distAudio)) {
  console.error('FAIL: dist/audio missing — expected shipped BGM');
  process.exit(1);
}

const missing = required.filter((name) => !fs.existsSync(path.join(distAudio, name)));
if (missing.length) {
  console.error('FAIL: missing BGM in dist/audio:', missing.join(', '));
  process.exit(1);
}

for (const name of required) {
  const st = fs.statSync(path.join(distAudio, name));
  if (st.size < 1000) {
    console.error(`FAIL: ${name} looks empty (${st.size} bytes)`);
    process.exit(1);
  }
}

console.log('PASS: BGM present in dist/audio:', required.join(', '));
