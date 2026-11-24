import esbuild from 'esbuild';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outfile = path.join(__dirname, 'test-bundle.mjs');

async function run() {
  console.log('Compiling test suite with esbuild...');
  await esbuild.build({
    entryPoints: [path.join(__dirname, 'system.test.js')],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    outfile,
    packages: 'external',
    // Components import stylesheets; the tests only assert on markup, so skip CSS.
    loader: { '.css': 'empty' },
  });

  console.log('Running test bundle with Node.js test runner...\n');
  const child = spawn(process.execPath, ['--test', outfile], {
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    process.exit(code);
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
