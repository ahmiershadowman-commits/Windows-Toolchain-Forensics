# Windows Toolchain Forensics

**Production-Ready Forensic Debugger for Fragmented Windows Development Environments**

## Overview

Windows Toolchain Forensics is a comprehensive analysis tool designed to debug and analyze fragmented Windows development environments. It helps identify toolchain conflicts, misconfigurations, and provides actionable recommendations for optimizing your Windows development setup.

## Features

- **Toolchain Detection**: Automatically detects installed compilers and build tools (Visual Studio, MinGW, Clang, .NET, Windows SDK)
- **Conflict Identification**: Identifies conflicts between multiple toolchain installations
- **Environment Analysis**: Comprehensive analysis of environment variables and system state
- **Forensic Debugging**: Collects detailed debugging information about toolchain state
- **Multi-format Reports**: Generates reports in JSON, Markdown, and HTML formats
- **Extensible Architecture**: Modular design allows for easy extension and customization

## Installation

```bash
npm install windows-toolchain-forensics
```

Or clone the repository:

```bash
git clone https://github.com/yourusername/windows-toolchain-forensics.git
cd windows-toolchain-forensics
npm install
```

## Usage

### Basic Usage

```javascript
import { WindowsToolchainForensics } from 'windows-toolchain-forensics';

// Initialize with default options
const forensics = new WindowsToolchainForensics();

// Run complete forensic workflow
const results = await forensics.run('./target-path', 'markdown');

console.log('Report generated at:', results.reportPath);
```

### Advanced Usage

```javascript
import { 
  WindowsToolchainForensics,
  ToolchainAnalyzer,
  ForensicDebugger 
} from 'windows-toolchain-forensics';

// Initialize with custom options
const forensics = new WindowsToolchainForensics({
  verbose: true,
  outputDir: './reports'
});

// Run analysis only
const analysisResults = await forensics.analyze('./target-path');

// Generate report in specific format
const reportPath = await forensics.generateReport(analysisResults, 'html');
```

### Command Line

```bash
# Run analysis
npm start

# Run tests
npm test

# Lint code
npm run lint
```

## API Reference

### WindowsToolchainForensics

#### Constructor

```javascript
new WindowsToolchainForensics(options?: Object)
```

**Options:**
- `verbose` (boolean): Enable verbose logging (default: `false`)
- `outputDir` (string): Directory for output reports (default: `'./output'`)

#### Methods

##### `analyze(targetPath: string): Promise<Object>`

Analyzes a Windows toolchain environment.

**Parameters:**
- `targetPath`: Path to analyze

**Returns:** Analysis results object

##### `generateReport(results: Object, format?: string): Promise<string>`

Generates a forensic report.

**Parameters:**
- `results`: Analysis results from `analyze()`
- `format`: Output format - `'json'`, `'markdown'`, or `'html'` (default: `'markdown'`)

**Returns:** Path to generated report

##### `run(targetPath: string, reportFormat?: string): Promise<Object>`

Runs complete forensic workflow (analysis + report generation).

**Parameters:**
- `targetPath`: Path to analyze
- `reportFormat`: Desired report format (default: `'markdown'`)

**Returns:** Complete workflow results including report path

### ToolchainAnalyzer

Analyzes Windows development toolchain configurations and artifacts.

```javascript
const analyzer = new ToolchainAnalyzer();
const results = await analyzer.analyze('./target-path');
```

### ForensicDebugger

Collects detailed debugging information about toolchain state.

```javascript
const debugger = new ForensicDebugger();
const debugInfo = await debugger.collectDebugInfo(analysisResults);
```

## Project Structure

```
windows-toolchain-forensics/
├── src/
│   ├── index.js          # Main entry point
│   ├── analyzer.js       # Toolchain analysis module
│   ├── debugger.js       # Forensic debugging module
│   └── reporter.js       # Report generation module
├── tests/
│   └── test.js           # Test suite
├── examples/
│   └── basic-usage.js    # Usage examples
├── docs/                 # Documentation
├── package.json
├── README.md
└── LICENSE
```

## Report Formats

### JSON
Machine-readable format suitable for programmatic processing.

### Markdown
Human-readable format with proper formatting for documentation.

### HTML
Styled report suitable for sharing and presentation.

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm or yarn

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

For issues and feature requests, please open an issue on the GitHub repository.

## Acknowledgments

- Windows development community
- Contributors and maintainers
