/**
 * Example usage of Windows Toolchain Forensics
 */

import { WindowsToolchainForensics } from '../src/index.js';

async function main() {
  console.log('Windows Toolchain Forensics - Example Usage\n');
  
  // Initialize with default options
  const forensics = new WindowsToolchainForensics({
    verbose: true,
    outputDir: './output'
  });

  try {
    // Run complete forensic workflow
    console.log('Running forensic analysis...');
    const results = await forensics.run('./sample-target', 'markdown');
    
    console.log('\nAnalysis Complete!');
    console.log('Timestamp:', results.timestamp);
    console.log('Target:', results.target);
    console.log('Report generated at:', results.reportPath);
    
    // Display summary
    console.log('\n--- Summary ---');
    console.log('Detected Toolchains:', results.analysis.detectedToolchains.length);
    console.log('Environment Variables:', Object.keys(results.analysis.environmentVariables).length);
    
  } catch (error) {
    console.error('Error during analysis:', error.message);
  }
}

main();
