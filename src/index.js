/**
 * Windows Toolchain Forensics - Main Entry Point
 * Production-Ready Forensic Debugger for Fragmented Windows Development Environments
 */

import { ToolchainAnalyzer } from './analyzer.js';
import { ForensicDebugger } from './debugger.js';
import { ReportGenerator } from './reporter.js';

export class WindowsToolchainForensics {
  constructor(options = {}) {
    this.options = {
      verbose: false,
      outputDir: './output',
      ...options
    };
    
    this.analyzer = new ToolchainAnalyzer();
    this.debugger = new ForensicDebugger();
    this.reporter = new ReportGenerator(this.options.outputDir);
  }

  /**
   * Analyze a Windows toolchain environment
   * @param {string} targetPath - Path to analyze
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(targetPath) {
    console.log(`Starting forensic analysis of: ${targetPath}`);
    
    const analysisResults = await this.analyzer.analyze(targetPath);
    const debugInfo = await this.debugger.collectDebugInfo(analysisResults);
    
    return {
      timestamp: new Date().toISOString(),
      target: targetPath,
      analysis: analysisResults,
      debugInfo: debugInfo
    };
  }

  /**
   * Generate a forensic report
   * @param {Object} results - Analysis results
   * @param {string} format - Output format (json, markdown, html)
   * @returns {Promise<string>} Path to generated report
   */
  async generateReport(results, format = 'markdown') {
    return await this.reporter.generate(results, format);
  }

  /**
   * Run complete forensic workflow
   * @param {string} targetPath - Path to analyze
   * @param {string} reportFormat - Desired report format
   * @returns {Promise<Object>} Complete workflow results
   */
  async run(targetPath, reportFormat = 'markdown') {
    const results = await this.analyze(targetPath);
    const reportPath = await this.generateReport(results, reportFormat);
    
    return {
      ...results,
      reportPath
    };
  }
}

// Export individual components for advanced usage
export { ToolchainAnalyzer };
export { ForensicDebugger };
export { ReportGenerator };

// Default export
export default WindowsToolchainForensics;
