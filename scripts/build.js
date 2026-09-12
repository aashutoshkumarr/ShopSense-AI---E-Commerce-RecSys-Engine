import { build as viteBuild } from 'vite';
import * as esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function runBuild() {
  const startTime = Date.now();
  console.log('\n[Build] Starting ShopSense AI Production Build...');

  // 1. Build Client SPA via Vite
  console.log('[1/2] Building Vite Client (React 19 + Tailwind CSS 4)...');
  try {
    await viteBuild({
      root: rootDir,
      configFile: path.resolve(rootDir, 'vite.config.ts'),
      build: {
        outDir: path.resolve(rootDir, 'dist'),
        emptyOutDir: true,
      },
      logLevel: 'info',
    });
    console.log('[1/2] Vite Client build complete.');
  } catch (err) {
    console.error('[1/2] Vite Client build failed:', err);
    process.exit(1);
  }

  // 2. Build Server Bundle via esbuild
  console.log('[2/2] Bundling Server via esbuild (server.ts -> dist/server.cjs)...');
  try {
    await esbuild.build({
      entryPoints: [path.resolve(rootDir, 'server.ts')],
      outfile: path.resolve(rootDir, 'dist/server.cjs'),
      bundle: true,
      platform: 'node',
      format: 'cjs',
      packages: 'external',
      sourcemap: true,
      target: 'node20',
      logLevel: 'info',
    });
    console.log('[2/2] Server bundle build complete.');
  } catch (err) {
    console.error('[2/2] Server bundle build failed:', err);
    process.exit(1);
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`\n[Build] Full production build succeeded in ${durationSec}s!\n`);
}

runBuild();
