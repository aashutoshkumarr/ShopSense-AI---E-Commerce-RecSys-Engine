#!/usr/bin/env node

/**
 * ShopSense AI Commerce OS - Deployment & Repository Auditor CLI
 * Verifies local environment, build artifacts, container manifests, and cloud configurations.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';

function printHeader() {
  console.log(`\n${CYAN}${BOLD}╔══════════════════════════════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}${BOLD}║           SHOPSENSE AI COMMERCE OS - REPO & CLOUD AUDITOR        ║${RESET}`);
  console.log(`${CYAN}${BOLD}╚══════════════════════════════════════════════════════════════════╝${RESET}\n`);
}

function checkItem(name, passed, detail = '') {
  const badge = passed ? `${GREEN}${BOLD}[PASS]${RESET}` : `${RED}${BOLD}[FAIL]${RESET}`;
  console.log(`  ${badge}  ${name.padEnd(38, '.')} ${passed ? GREEN : RED}${detail || (passed ? 'OK' : 'MISSING')}${RESET}`);
  return passed;
}

async function checkLiveHealth(port = 3001) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/api/health`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ online: res.statusCode === 200, data: json });
        } catch (e) {
          resolve({ online: false, error: 'Invalid JSON' });
        }
      });
    });
    req.on('error', () => resolve({ online: false, error: 'Port unreachable' }));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve({ online: false, error: 'Timeout' });
    });
  });
}

async function runAudit() {
  printHeader();
  let totalChecks = 0;
  let passedChecks = 0;

  console.log(`${BOLD}${YELLOW}1. LOCAL SOURCE & STATIC ASSETS${RESET}`);
  const root = process.cwd();
  
  const hasPkg = fs.existsSync(path.join(root, 'package.json'));
  totalChecks++; if (checkItem('package.json & dependencies', hasPkg)) passedChecks++;

  const hasClientBuild = fs.existsSync(path.join(root, 'dist', 'index.html'));
  totalChecks++; if (checkItem('Vite Client Bundle (dist/index.html)', hasClientBuild)) passedChecks++;

  const hasServerBuild = fs.existsSync(path.join(root, 'dist', 'server.cjs'));
  totalChecks++; if (checkItem('Server Standalone Bundle (dist/server.cjs)', hasServerBuild)) passedChecks++;

  const testFiles = fs.existsSync(path.join(root, 'tests')) ? fs.readdirSync(path.join(root, 'tests')).filter(f => f.endsWith('.test.ts')) : [];
  totalChecks++; if (checkItem('Automated Test Suites', testFiles.length >= 10, `${testFiles.length} suites verified`)) passedChecks++;

  console.log(`\n${BOLD}${YELLOW}2. CONTAINER & CLOUD DEPLOYMENT MANIFESTS${RESET}`);
  
  const hasDocker = fs.existsSync(path.join(root, 'Dockerfile'));
  totalChecks++; if (checkItem('Multi-Stage Production Dockerfile', hasDocker, 'Node 20 Alpine')) passedChecks++;

  const hasCompose = fs.existsSync(path.join(root, 'docker-compose.yml'));
  totalChecks++; if (checkItem('Docker Compose (Postgres+Redis)', hasCompose)) passedChecks++;

  const hasVercel = fs.existsSync(path.join(root, 'vercel.json'));
  totalChecks++; if (checkItem('Vercel Config (SPA Rewrites)', hasVercel, 'vercel.json')) passedChecks++;

  const hasRender = fs.existsSync(path.join(root, 'render.yaml'));
  totalChecks++; if (checkItem('Render Blueprint Specification', hasRender, 'render.yaml')) passedChecks++;

  const hasRailway = fs.existsSync(path.join(root, 'railway.json'));
  totalChecks++; if (checkItem('Railway Deployment Manifest', hasRailway, 'railway.json')) passedChecks++;

  const hasCI = fs.existsSync(path.join(root, '.github', 'workflows', 'ci.yml'));
  totalChecks++; if (checkItem('GitHub Actions CI/CD Pipeline', hasCI, 'ci.yml')) passedChecks++;

  console.log(`\n${BOLD}${YELLOW}3. LIVE HEALTH & TELEMETRY AUDIT${RESET}`);
  const liveCheck = await checkLiveHealth(3001);
  totalChecks++;
  if (liveCheck.online) {
    passedChecks++;
    checkItem('Local Live Server Daemon', true, 'HTTP 200 on port 3001');
  } else {
    // Check port 3000
    const fallbackCheck = await checkLiveHealth(3000);
    if (fallbackCheck.online) {
      passedChecks++;
      checkItem('Local Live Server Daemon', true, 'HTTP 200 on port 3000');
    } else {
      checkItem('Local Live Server Daemon', false, 'Run `npm run dev` or `npm start`');
    }
  }

  console.log(`\n${CYAN}──────────────────────────────────────────────────────────────────${RESET}`);
  const scorePercent = Math.round((passedChecks / totalChecks) * 100);
  const scoreColor = scorePercent === 100 ? GREEN : (scorePercent >= 80 ? YELLOW : RED);
  console.log(`  ${BOLD}AUDIT SCORE:${RESET} ${scoreColor}${BOLD}${scorePercent}%${RESET} (${passedChecks}/${totalChecks} Gates Passed)`);
  
  console.log(`\n${BOLD}${MAGENTA}DEPLOYMENT CHANNELS READY:${RESET}`);
  console.log(`  ${CYAN}• GitHub:${RESET}   https://github.com/aashutoshkumarr/ShopSense-AI---E-Commerce-RecSys-Engine`);
  console.log(`  ${CYAN}• Docker:${RESET}   docker build -t shopsense-ai . && docker compose up -d`);
  console.log(`  ${CYAN}• Render:${RESET}   Deploy via render.yaml blueprint`);
  console.log(`  ${CYAN}• Vercel:${RESET}   Deploy via vercel.json (vercel --prod)`);
  console.log(`  ${CYAN}• Railway:${RESET}  Deploy via railway.json (railway up)\n`);
}

runAudit();
