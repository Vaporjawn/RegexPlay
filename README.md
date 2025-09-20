# RegexPlay 🎯

A powerful, interactive command-line regex playground for testing and learning regular expressions with real-time feedback and comprehensive session management.

[![NPM Version](https://img.shields.io/npm/v/regexplay.svg)](https://www.npmjs.com/package/regexplay)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/Vaporjawn/RegexPlay/workflows/Node.js%20CI/badge.svg)](https://github.com/Vaporjawn/RegexPlay/actions)
[![codecov](https://codecov.io/gh/Vaporjawn/RegexPlay/branch/main/graph/badge.svg)](https://codecov.io/gh/Vaporjawn/RegexPlay)

> **Perfect for developers, data scientists, and anyone working with text patterns!**

## ✨ Key Features

- 🖥️ **Interactive Terminal UI** - Real-time regex testing with live match highlighting
- 💾 **Session Management** - Save and load regex patterns for later use
- 🚀 **Multiple Modes** - CLI for quick tests, TUI for interactive exploration
- ⚡ **Fast & Lightweight** - Built with Node.js for speed and portability
- 🎨 **Visual Feedback** - Instant match highlighting and error detection
- 📁 **Session Persistence** - Automatically save your work
- 🔧 **Multiple Engines** - JavaScript and PCRE regex engine support
- 📚 **Learning Tools** - Built-in examples and educational features

## 🚀 Quick Start

### Installation

```bash
# Install globally for CLI access
npm install -g regexplay

# Or run without installing
npx regexplay
```

### First Pattern

Launch RegexPlay and try your first regex:

```bash
regexplay
```

1. **Pattern**: Enter `\d+` (finds numbers)
2. **Text**: Enter `I have 42 apples and 7 oranges`
3. **Result**: See `42` and `7` highlighted instantly!

### Command Line Usage

```bash
# Direct one-off test (auto-detects CLI mode)
regexplay --regex "\d+" --text "Find 123 numbers"

# Explicit non-interactive CLI mode
regexplay --mode cli --regex "[A-Z]+" --text "ABC def" --flags g

# Read test text from a file
regexplay --mode cli --regex "TODO" --file ./CHANGELOG.md

# Pipe input via stdin
echo "Order #123" | regexplay --mode cli --regex "#(\d+)"

# Load a saved session
regexplay --load my-regex.json

# Enable verbose debug logging
regexplay --mode cli --regex "foo" --text "bar" --debug

# Show help
regexplay --help
```

### Modes

RegexPlay now distinguishes between interactive and direct execution:

| Mode | Description | When Used |
|------|-------------|-----------|
| `tui` | Full-screen interactive terminal UI | Default when no pattern/text supplied |
| `cli` | One-shot non-interactive execution (prints results then exits) | Automatically selected if you pass `--regex`, `--text`, `--file`, or `--load` |

Use `--mode` to explicitly choose; omit it to let RegexPlay auto-select.

### Debug Logging
Add `--debug` to surface initialization details, internal validation logs, and stack traces for easier troubleshooting.

## 📚 Complete Documentation

📖 **[Read the Full Documentation](docs/README.md)** - Comprehensive guides, tutorials, and examples

### Quick Links

| 🎯 **Getting Started** | 🛠️ **Usage** | 💡 **Learning** |
|------------------------|---------------|------------------|
| [📥 Installation Guide](docs/guides/installation.md) | [⚡ Quick Start](docs/guides/quick-start.md) | [🎓 Beginner Tutorial](docs/guides/beginner-tutorial.md) |
| [🏃 Quick Start](docs/guides/quick-start.md) | [📖 User Guide](docs/guides/user-guide.md) | [🚀 Advanced Tutorial](docs/guides/advanced-tutorial.md) |
| [🎓 Beginner Tutorial](docs/guides/beginner-tutorial.md) | [💾 Session Management](docs/api/session-management.md) | [📋 Common Patterns](docs/examples/common-patterns.md) |

## 🎮 Interactive Mode Walkthrough

Launch `regexplay` for the interactive terminal interface:

### The Interface

```
┌─ RegexPlay - Interactive Regex Testing ─┐
│                                          │
│ Pattern: \d+                            │
│ Text: I have 42 apples and 7 oranges    │
│                                          │
│ ✅ 2 matches found                       │
│ Results: [42] [7]                        │
│                                          │
│ F1: Help  Ctrl+S: Save  Ctrl+L: Load   │
└──────────────────────────────────────────┘
```

### Essential Keyboard Shortcuts

| Key | Action | Description |
|-----|--------|-------------|
| `Tab` | Switch fields | Move between pattern and text input |
| `Ctrl+S` | Save session | Save current pattern and text |
| `Ctrl+L` | Load session | Load previously saved session |
| `Ctrl+E` | Switch engine | Toggle between JavaScript and PCRE |
| `F1` | Show help | Display help and shortcuts |
| `Ctrl+C` | Exit | Quit RegexPlay |

## 🧪 Step-by-Step Examples

### Example 1: Email Validation
**Learn to build a regex pattern step by step**

```bash
# Start with simple pattern
Pattern: \w+@\w+
Text: user@example

# Add domain extension
Pattern: \w+@\w+\.\w+
Text: user@example.com

# Handle complex emails
Pattern: [\w.-]+@[\w.-]+\.\w{2,}
Text: test.email@sub.domain.org
```

### Example 2: Extract Data from Text
**Parse structured information**

```bash
# Extract phone numbers
Pattern: \(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}
Text: Call (555) 123-4567 or 555.987.6543

# Extract prices
Pattern: \$\d+\.\d{2}
Text: Product A costs $29.99 and B is $15.50

# Extract hashtags
Pattern: #\w+
Text: Love #regex and #programming tutorials!
```

### Example 3: Data Validation
**Validate user input formats**

```bash
# US ZIP codes
Pattern: \d{5}(-\d{4})?
Text: 12345 or 12345-6789

# Strong passwords (8+ chars, mixed case, number)
Pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$
Text: MyPassword123

# ISO dates
Pattern: \d{4}-\d{2}-\d{2}
Text: 2023-12-25
```

## 💾 Session Management

Save and organize your regex patterns for future use:

### Quick Save/Load
```bash
# In interactive mode:
# Ctrl+S → Enter filename → Saved!
# Ctrl+L → Select session → Loaded!

# From command line:
regexplay --load email-validator.json
```

### Session Organization
```
.regexplay-sessions/
├── email-validator.json
├── phone-numbers.json
├── log-parser.json
└── data-extraction.json
```

📖 **[Complete Session Guide](docs/api/session-management.md)** - Advanced session management techniques

## 🔧 Advanced Features

### Multiple Regex Engines
- **JavaScript Engine** (default): ES2018+ features, lookaheads, named groups
- **PCRE Engine**: Perl-compatible patterns (when available)

### Regex Flags Support
- `g` - Global (find all matches)
- `i` - Case insensitive
- `m` - Multiline mode
- `s` - Dot matches newlines
- `u` - Unicode support
- `y` - Sticky matching

### Real-time Features
- ✅ **Live Match Highlighting** - See matches as you type
- 📊 **Match Statistics** - Count, positions, groups
- 🚨 **Error Detection** - Syntax error highlighting
- 📋 **Match Details** - Captured groups and named groups
- 🎯 **Visual Feedback** - Color-coded results

## 🛠️ Command Line Reference

### Basic Commands
```bash
regexplay                                    # Interactive mode
regexplay --regex "\d+" --text "Find 123"   # Direct test
regexplay --load session.json               # Load session
regexplay --help                             # Show help
```

### All Options
```bash
Options:
  --regex <pattern>        Regular expression pattern
  --text <string>          Text to test against
  --flags <flags>          Regex flags (g, i, m, s, u, y)
  --engine <engine>        Regex engine (javascript, pcre)
  --load <file>            Load saved session (JSON)
  --file <file>            Read test text from file
  --mode <tui|cli>         Force interactive (tui) or direct (cli) mode
  --json                   Output structured JSON (suppresses colored text output)
  --quiet, -q              Suppress normal output (exit codes still indicate status)
  --benchmark[=N]          Run pattern N times (default 50) and report timing stats
  --color / --no-color     Force enable/disable ANSI color output (auto by default)
  --debug                  Enable verbose debug logging
  --help                   Show help information
  --version                Show version number
```

### JSON Output
Use `--json` for machine-readable results (ideal for scripting / CI):

```bash
regexplay --mode cli --regex "(foo)(bar)?" --text "foobar food" --flags g --json
```

Example (truncated) JSON structure:
```json
{
  "pattern": "(foo)(bar)?",
  "text": "foobar food",
  "flags": "g",
  "engine": "javascript",
  "success": true,
  "matchCount": 2,
  "matches": [
    { "match": "foobar", "index": 0, "groups": ["foo", "bar"], "groupsNamed": {} },
    { "match": "foo", "index": 7, "groups": ["foo", null], "groupsNamed": {} }
  ],
  "warnings": [],
  "benchmark": { "iterations": 50, "minMs": 0.015, "meanMs": 0.020, "p95Ms": 0.030, "maxMs": 0.035 }
}
```

### Quiet Mode
`--quiet` (or `-q`) suppresses normal human-readable output but still sets exit codes:
- 0 = execution success (match or no-match)
- 1 = handled failure (e.g., no match when expecting a match) – current behavior treats no match as non-success
- 2 = runtime/internal error

Combine with `--json` for structured scripting, or use alone for timing with `--benchmark`.

### Benchmarking
`--benchmark` (optional `=N`) runs the test multiple times and reports statistics (nanosecond precision internally):

```bash
regexplay --regex "foo|bar" --text "foo bar baz" --flags g --benchmark=200
```

Reported metrics: min, max, mean, p95 (95th percentile) in milliseconds plus iteration count.

### Color Control
Force color on or off regardless of TTY detection:
```bash
regexplay --regex foo --text foo --no-color
regexplay --regex foo --text foo --color
```

### Exit Codes
| Code | Meaning |
|------|---------|
| 0 | Successful execution (pattern processed) |
| 1 | Non-fatal failure (e.g., no match) |
| 2 | Internal or runtime error |

> NOTE: Exit code semantics may evolve; JSON output includes explicit `success` boolean and `matchCount` for clarity.

📖 **[Complete CLI Reference](docs/api/cli-reference.md)** - All commands and options

## 🎯 Real-World Use Cases

### For Developers
- **Input Validation** - Email, phone, password validation
- **Log Analysis** - Extract errors, parse timestamps
- **Data Extraction** - URLs, IPs, file paths from text
- **Code Review** - Find patterns in source code

### For Data Scientists
- **Data Cleaning** - Format phone numbers, extract entities
- **Text Analysis** - Find mentions, hashtags, patterns
- **Log Mining** - Parse server logs, extract metrics
- **Data Validation** - Ensure data format consistency

### For System Administrators
- **Log Analysis** - Filter error messages, extract IPs
- **File Processing** - Match file patterns, extract data
- **Security** - Detect patterns in security logs
- **Automation** - Pattern matching in scripts

📖 **[Complete Use Cases Guide](docs/examples/use-cases.md)** - Detailed scenarios and solutions

## 🏗️ Architecture & Development

RegexPlay is designed with modularity and extensibility in mind:

```
RegexPlay/
├── cli.js                    # CLI entry point
├── src/
│   ├── app.js               # Main application logic
│   ├── engines/             # Regex engine implementations
│   │   ├── engineFactory.js # Engine management
│   │   ├── jsEngine.js      # JavaScript engine
│   │   └── pcreEngine.js    # PCRE engine
│   ├── ui/
│   │   └── tui.js          # Terminal user interface
│   └── utils/
│       ├── argParser.js     # Command line parsing (--mode/--debug aware)
│       └── sessionManager.js # Session persistence
├── docs/                    # Complete documentation
├── test/                    # Test files
└── .regexplay-sessions/     # Saved user sessions
```

### Core Technologies
- **Node.js** - Cross-platform JavaScript runtime
- **Blessed** - Terminal interface library
- **@syntropiq/libpcre-ts** - PCRE regex engine bindings

📖 **[Development Guide](docs/guides/development.md)** - Setting up development environment
📖 **[Architecture Details](docs/guides/architecture.md)** - Detailed system design
📖 **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

## 🧪 Testing & Quality

RegexPlay includes comprehensive testing:

### Test Coverage
```bash
npm test                    # Run all tests
npm run test:sessions       # Test session management
npm run test:highlighting   # Test visual features
node test/test-app-cli.js    # Tests new CLI compatibility wrappers
```

### Quality Assurance
- ✅ **Unit Tests** - Core functionality testing
- ✅ **Integration Tests** - End-to-end workflow testing
- ✅ **Engine Tests** - Regex engine compatibility
- ✅ **Session Tests** - Save/load functionality
- ✅ **UI Tests** - Terminal interface testing

📖 **[Testing Guide](docs/guides/testing.md)** - Running and writing tests

## 🧩 Engine Support

### JavaScript Engine ✅ (Default)
- **ES2018+ Features** - Latest JavaScript regex capabilities
- **Named Capture Groups** - `(?<name>pattern)` syntax
- **Lookbehind Assertions** - `(?<=pattern)` and `(?<!pattern)`
- **Unicode Property Escapes** - `\p{Property}` support
- **All Standard Flags** - g, i, m, s, u, y

### PCRE Engine ⚠️ (Experimental / Temporarily Disabled)
- **Perl-Compatible** - Designed for full PCRE feature set
- **Advanced Features** - Recursive patterns, conditionals (planned)
- **Performance** - Intended for complex patterns
- **Current Status** - Temporarily disabled pending ESM/CommonJS compatibility resolution
- **`x` Flag Handling** - If you specify the extended whitespace flag (`x`) while PCRE is unavailable a warning is emitted

> A lazy loader placeholder is in place; future versions may re-enable PCRE once a compatible distribution strategy is finalized.

📖 **[Engine Comparison](docs/api/regex-engines.md)** - Detailed feature comparison

## 🛠️ Installation & Setup

### Requirements
- **Node.js** 14.0.0 or higher
- **npm** 6.0.0 or higher
- **Supported OS**: macOS, Linux, Windows (including WSL)

### Quick Install
```bash
npm install -g regexplay
```

### Verify Installation
```bash
regexplay --version
regexplay --help
```

📖 **[Complete Installation Guide](docs/guides/installation.md)** - Platform-specific instructions and troubleshooting

## 🤝 Contributing

We welcome contributions! RegexPlay is open source and thrives on community input.

### Quick Start Contributing
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/RegexPlay.git`
3. **Install** dependencies: `npm install`
4. **Make** your changes
5. **Test** your changes: `npm test`
6. **Submit** a pull request

### Ways to Contribute
- 🐛 **Bug Reports** - Found an issue? Let us know!
- ✨ **Feature Requests** - Have an idea? We'd love to hear it!
- 📝 **Documentation** - Help improve our guides and examples
- 🧪 **Testing** - Add test cases and improve coverage
- 🎨 **UI/UX** - Enhance the terminal interface
- 🔧 **Code** - Fix bugs and implement features

### Development Setup
```bash
git clone https://github.com/Vaporjawn/RegexPlay.git
cd RegexPlay
npm install
npm test
node cli.js  # Test locally
```

📖 **[Complete Contributing Guide](CONTRIBUTING.md)** - Detailed contribution guidelines
📖 **[Development Guide](docs/guides/development.md)** - Setting up your environment
📖 **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines

### Recognition
Contributors are featured in our [Contributors List](https://github.com/Vaporjawn/RegexPlay/graphs/contributors) and [Changelog](CHANGELOG.md).

## 📋 Project Status

### Current Version: 1.0.0
- ✅ **Stable** - Production ready
- ✅ **Active Development** - Regular updates
- ✅ **Community Driven** - Open to contributions
- ✅ **Well Documented** - Comprehensive guides

### Roadmap
- 🔄 **PCRE Engine** - Full Perl-compatible support
- 🌐 **Web Interface** - Browser-based version
- 📱 **Mobile Support** - Touch-friendly interface
- 🔌 **Plugin System** - Extensible architecture
- 🎓 **Educational Mode** - Interactive tutorials

📖 **[Changelog](CHANGELOG.md)** - Version history and updates
📖 **[Project Board](https://github.com/Vaporjawn/RegexPlay/projects)** - Current development status

## 🆘 Getting Help & Support

### Documentation
- 📖 **[Complete Documentation](docs/README.md)** - Comprehensive guides and references
- 🎓 **[Beginner Tutorial](docs/guides/beginner-tutorial.md)** - Step-by-step learning path
- 📋 **[FAQ](docs/guides/faq.md)** - Frequently asked questions
- 💡 **[Common Patterns](docs/examples/common-patterns.md)** - Ready-to-use regex patterns

### Community Support
- 💬 **[GitHub Discussions](https://github.com/Vaporjawn/RegexPlay/discussions)** - Q&A and community help
- 🐛 **[GitHub Issues](https://github.com/Vaporjawn/RegexPlay/issues)** - Bug reports and feature requests
- 📧 **[Email Support](mailto:support@regexplay.dev)** - Direct support contact

### Quick Help
```bash
# In-app help
regexplay --help        # CLI help
regexplay               # Then press F1 for interactive help

# Online resources
https://regex101.com/   # Online regex tester
https://regexone.com/   # Interactive regex tutorial
```

## 📄 License & Legal

### License
RegexPlay is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Security
Security is important to us. Please report security vulnerabilities responsibly:
- 📧 **Email**: [security@regexplay.dev](mailto:security@regexplay.dev)
- 📋 **Policy**: [Security Policy](SECURITY.md)

### Privacy
RegexPlay respects your privacy:
- 🗂️ **Local Storage** - Sessions saved locally only
- 🚫 **No Tracking** - No analytics or data collection
- 🔐 **Offline Capable** - Works without internet connection

## 🙏 Acknowledgments

RegexPlay is built with and inspired by amazing open source projects:

### Core Dependencies
- **[blessed](https://github.com/chjj/blessed)** - Terminal interface magic
- **[Node.js](https://nodejs.org/)** - JavaScript runtime excellence
- **[@syntropiq/libpcre-ts](https://github.com/syntropiq/libpcre-ts)** - PCRE engine bindings

### Inspiration
- **[regex101](https://regex101.com/)** - Web-based regex testing
- **[regexr](https://regexr.com/)** - Interactive regex learning
- **[The Regex Community](https://stackoverflow.com/questions/tagged/regex)** - Endless knowledge sharing

### Contributors
Thanks to all contributors who make RegexPlay better! 🎉

[![Contributors](https://contrib.rocks/image?repo=Vaporjawn/RegexPlay)](https://github.com/Vaporjawn/RegexPlay/graphs/contributors)

---

**Start your regex journey today!** 🚀

```bash
npm install -g regexplay
regexplay
```

*Built with ❤️ for the developer community*
