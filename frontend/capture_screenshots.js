import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const screenshotsDir = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Find Chrome path on Windows
const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
];

let executablePath = '';
for (const p of chromePaths) {
  if (fs.existsSync(p)) {
    executablePath = p;
    break;
  }
}

if (!executablePath) {
  console.error('No Chrome or Edge executable found.');
  process.exit(1);
}

console.log('Using browser executable at:', executablePath);

async function clickButtonWithText(page, textToMatch) {
  const clicked = await page.evaluate((text) => {
    const buttons = Array.from(document.querySelectorAll('button'));
    for (const b of buttons) {
      if (b.innerText && b.innerText.includes(text)) {
        b.click();
        return true;
      }
    }
    return false;
  }, textToMatch);

  if (!clicked) {
    console.warn(`Could not find button with text: ${textToMatch}`);
  }
  return clicked;
}

async function captureAll() {
  const browser = await puppeteer.launch({
    executablePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    defaultViewport: { width: 1440, height: 900 },
  });

  const page = await browser.newPage();
  console.log('Navigating to http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await sleep(3000);

  console.log('Capturing 1. Mission Overview...');
  await page.screenshot({ path: path.join(screenshotsDir, '01_mission_overview.png') });

  console.log('Capturing 2. 3D Constellation Mesh...');
  await clickButtonWithText(page, '3D Constellation');
  await sleep(3000);
  await page.screenshot({ path: path.join(screenshotsDir, '02_satellite_constellation_3d.png') });

  console.log('Capturing 3. Layer 1 Consensus (Valid Command)...');
  await clickButtonWithText(page, 'L1: Consensus');
  await sleep(1000);
  await clickButtonWithText(page, 'SEND VALID COMMAND');
  await sleep(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '03_consensus_approved.png') });

  console.log('Capturing 4. Layer 1 Consensus (Unauthorized Rejection)...');
  await clickButtonWithText(page, 'INJECT UNAUTHORIZED COMMAND');
  await sleep(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '04_consensus_rejected.png') });

  console.log('Capturing 5. Layer 2 Wavelet Filtering & SNR Gain...');
  await clickButtonWithText(page, 'L2: Wavelet DWT');
  await sleep(1000);
  await clickButtonWithText(page, 'INJECT NOISE & JAMMING');
  await sleep(1500);
  await clickButtonWithText(page, 'APPLY WAVELET FILTER');
  await sleep(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '05_wavelet_filtering_snr.png') });

  console.log('Capturing 6. Layer 3 Homomorphic Telemetry Vault...');
  await clickButtonWithText(page, 'L3: Crypto Vault');
  await sleep(1000);
  await clickButtonWithText(page, '2. ENCRYPT TELEMETRY');
  await sleep(1000);
  await clickButtonWithText(page, '3. COMPUTE ON ENCRYPTED DATA');
  await sleep(1000);
  await clickButtonWithText(page, '4. DECRYPT & VERIFY RESULT');
  await sleep(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '06_homomorphic_cryptographic_vault.png') });

  console.log('Capturing 7. Layer 4 Emergency Safe Mode...');
  await clickButtonWithText(page, 'L4: Safe Mode');
  await sleep(1000);
  await clickButtonWithText(page, 'ACTIVATE SAFE MODE');
  await sleep(2500);
  await page.screenshot({ path: path.join(screenshotsDir, '07_emergency_safemode.png') });

  console.log('Capturing 8. System Architecture...');
  await clickButtonWithText(page, 'Architecture');
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '08_system_architecture.png') });

  console.log('Capturing 9. 5-Minute Presentation Mode HUD...');
  await clickButtonWithText(page, 'PRESENTATION MODE');
  await sleep(1500);
  await page.screenshot({ path: path.join(screenshotsDir, '09_presentation_mode.png') });

  await browser.close();
  console.log('>>> ALL 9 SCREENSHOTS CAPTURED SUCCESSFULLY IN screenshots/ <<<');
}

captureAll().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
