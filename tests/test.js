/**
 * Basic Test Suite for Windows Toolchain Forensics
 */

import { WindowsToolchainForensics } from '../src/index.js';

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  Error: ${error.message}`);
    failed++;
  }
}

async function runTests() {
  console.log('Running Windows Toolchain Forensics Tests\n');
  console.log('=' .repeat(50));

  // Test 1: Module instantiation
  test('Should instantiate WindowsToolchainForensics', () => {
    const forensics = new WindowsToolchainForensics();
    if (!forensics) throw new Error('Failed to instantiate');
  });

  // Test 2: Default options
  test('Should use default options', () => {
    const forensics = new WindowsToolchainForensics();
    if (forensics.options.verbose !== false) {
      throw new Error('Default verbose should be false');
    }
    if (forensics.options.outputDir !== './output') {
      throw new Error('Default outputDir should be ./output');
    }
  });

  // Test 3: Custom options
  test('Should accept custom options', () => {
    const forensics = new WindowsToolchainForensics({ 
      verbose: true, 
      outputDir: './custom-output' 
    });
    if (forensics.options.verbose !== true) {
      throw new Error('Custom verbose option not applied');
    }
    if (forensics.options.outputDir !== './custom-output') {
      throw new Error('Custom outputDir option not applied');
    }
  });

  // Test 4: Analyze method exists
  test('Should have analyze method', () => {
    const forensics = new WindowsToolchainForensics();
    if (typeof forensics.analyze !== 'function') {
      throw new Error('analyze method not found');
    }
  });

  // Test 5: GenerateReport method exists
  test('Should have generateReport method', () => {
    const forensics = new WindowsToolchainForensics();
    if (typeof forensics.generateReport !== 'function') {
      throw new Error('generateReport method not found');
    }
  });

  // Test 6: Run method exists
  test('Should have run method', () => {
    const forensics = new WindowsToolchainForensics();
    if (typeof forensics.run !== 'function') {
      throw new Error('run method not found');
    }
  });

  // Test 7: Analyze returns expected structure
  test('Analyze should return expected structure', async () => {
    const forensics = new WindowsToolchainForensics();
    const results = await forensics.analyze('./test-path');
    
    if (!results.timestamp) throw new Error('Missing timestamp');
    if (!results.target) throw new Error('Missing target');
    if (!results.analysis) throw new Error('Missing analysis');
    if (!results.debugInfo) throw new Error('Missing debugInfo');
  });

  console.log('=' .repeat(50));
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
