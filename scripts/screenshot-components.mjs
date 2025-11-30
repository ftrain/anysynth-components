import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const STORYBOOK_URL = 'http://localhost:6006';
const OUTPUT_DIR = './screenshots';

// Components to screenshot with correct story IDs
const COMPONENTS = [
  { name: 'NestedSlider-Horizontal', path: 'controls-nestedslider-horizontal--oscillator' },
  { name: 'NestedSlider-Vertical', path: 'controls-nestedslider-horizontal--vertical-mixer' },
  { name: 'NestedSlider-Circular', path: 'controls-nestedslider-horizontal--circular-oscillator' },
  { name: 'NestedSlider-Grid', path: 'controls-nestedslider-horizontal--grid-macros' },
  { name: 'Sequencer', path: 'modules-sequencer--default' },
  { name: 'ADSR', path: 'modules-adsr--default' },
  { name: 'LFO', path: 'modules-lfo--default' },
  { name: 'PianoKeyboard', path: 'input-pianokeyboard--default' },
  { name: 'FractionPicker', path: 'musical-input-fractionpicker--default' },
  { name: 'DrumPad-Grid', path: 'drum-machine-drumpad--grid-4-x-4' },
  { name: 'DrumPad-Sequencer', path: 'drum-machine-drumpad--sequencer-16-step' },
  { name: 'ChordKnob', path: 'musical-input-chordknob--default' },
  { name: 'TimeKnob', path: 'musical-input-timeknob--default' },
  { name: 'WaveformSelector', path: 'oscillator-waveformselector--default' },
  { name: 'WavetableView', path: 'oscillator-waveformselector--wavetable-default' },
  { name: 'ModMatrix', path: 'modulation-modmatrix--default' },
  { name: 'FullSynth', path: 'layouts-complete-synth--full-synthesizer' },
  { name: 'MobileLayout', path: 'layouts-complete-synth--mobile-layout' },
];

async function screenshotComponents() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Mobile viewport (375px width)
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });

  // Screenshot each component
  for (const component of COMPONENTS) {
    const url = `${STORYBOOK_URL}/iframe.html?id=${component.path}&viewMode=story`;
    console.log(`Screenshotting ${component.name}...`);

    try {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });

      // Wait a bit for animations/renders
      await new Promise(r => setTimeout(r, 800));

      // Screenshot
      const screenshotPath = path.join(OUTPUT_DIR, `${component.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: false
      });

      console.log(`  ✓ Saved ${screenshotPath}`);
    } catch (error) {
      console.log(`  ✗ Failed: ${error.message}`);
    }
  }

  await browser.close();
  console.log('\nDone! Screenshots saved to ./screenshots/');
}

screenshotComponents().catch(console.error);
