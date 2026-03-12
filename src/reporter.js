/**
 * Report Generator Module
 * Generates forensic reports in various formats
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class ReportGenerator {
  constructor(outputDir = './output') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  /**
   * Ensure output directory exists
   */
  ensureOutputDir() {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate report in specified format
   * @param {Object} results - Analysis results
   * @param {string} format - Output format (json, markdown, html)
   * @returns {Promise<string>} Path to generated report
   */
  async generate(results, format = 'markdown') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let content;
    let extension;

    switch (format.toLowerCase()) {
      case 'json':
        content = this.generateJSON(results);
        extension = 'json';
        break;
      case 'html':
        content = this.generateHTML(results);
        extension = 'html';
        break;
      case 'markdown':
      default:
        content = this.generateMarkdown(results);
        extension = 'md';
        break;
    }

    const filename = `forensic-report-${timestamp}.${extension}`;
    const filepath = join(this.outputDir, filename);
    
    writeFileSync(filepath, content);
    
    return filepath;
  }

  /**
   * Generate JSON report
   * @param {Object} results - Analysis results
   * @returns {string} JSON string
   */
  generateJSON(results) {
    return JSON.stringify(results, null, 2);
  }

  /**
   * Generate Markdown report
   * @param {Object} results - Analysis results
   * @returns {string} Markdown string
   */
  generateMarkdown(results) {
    const lines = [
      '# Windows Toolchain Forensic Report',
      '',
      `**Generated:** ${results.timestamp}`,
      `**Target:** ${results.target}`,
      '',
      '## Executive Summary',
      '',
      'This report contains forensic analysis of the Windows development toolchain environment.',
      '',
      '## Analysis Results',
      '',
      '### Detected Toolchains',
      '',
      results.analysis?.detectedToolchains?.length > 0
        ? results.analysis.detectedToolchains.map(t => `- ${t}`).join('\n')
        : 'No toolchains detected',
      '',
      '### Environment Variables',
      '',
      '```',
      JSON.stringify(results.analysis?.environmentVariables || {}, null, 2),
      '```',
      '',
      '## Debug Information',
      '',
      '### System Information',
      '',
      '```json',
      JSON.stringify(results.debugInfo?.systemInfo || {}, null, 2),
      '```',
      '',
      '### Process Information',
      '',
      '```json',
      JSON.stringify(results.debugInfo?.processInfo || {}, null, 2),
      '```',
      '',
      '## Recommendations',
      '',
      results.analysis?.recommendations?.length > 0
        ? results.analysis.recommendations.map(r => `- ${r}`).join('\n')
        : 'No recommendations at this time',
      ''
    ];

    return lines.join('\n');
  }

  /**
   * Generate HTML report
   * @param {Object} results - Analysis results
   * @returns {string} HTML string
   */
  generateHTML(results) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Windows Toolchain Forensic Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
    .summary { background: #e7f3ff; padding: 15px; border-left: 4px solid #2196F3; }
    .timestamp { color: #888; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>Windows Toolchain Forensic Report</h1>
  <p class="timestamp">Generated: ${results.timestamp}</p>
  <p><strong>Target:</strong> ${results.target}</p>
  
  <div class="summary">
    <h2>Executive Summary</h2>
    <p>This report contains forensic analysis of the Windows development toolchain environment.</p>
  </div>
  
  <h2>Analysis Results</h2>
  <h3>Detected Toolchains</h3>
  <ul>
    ${results.analysis?.detectedToolchains?.map(t => `<li>${t}</li>`).join('') || '<li>No toolchains detected</li>'}
  </ul>
  
  <h2>Debug Information</h2>
  <h3>System Information</h3>
  <pre>${JSON.stringify(results.debugInfo?.systemInfo || {}, null, 2)}</pre>
  
  <h2>Recommendations</h2>
  <ul>
    ${results.analysis?.recommendations?.map(r => `<li>${r}</li>`).join('') || '<li>No recommendations at this time</li>'}
  </ul>
</body>
</html>`;
  }
}
