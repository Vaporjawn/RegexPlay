/**
 * Command-line argument parser for RegexPlay
 * Provides robust argument parsing with validation and error handling
 */

// Constants for configuration
const SUPPORTED_ENGINES = ['js', 'javascript', 'pcre'];
const SUPPORTED_MODES = ['tui', 'cli'];
const VALID_FLAGS = ['i', 'g', 'm', 's', 'u', 'y', 'x'];
const DEFAULT_ENGINE = 'javascript';

// Error messages
const ERROR_MESSAGES = {
  INVALID_ENGINE: (engine) => `Invalid engine: ${engine}. Supported engines: ${SUPPORTED_ENGINES.join(', ')}`,
  MISSING_VALUE: (option) => `${option} requires a value`,
  INVALID_FLAGS: (invalid) => `Invalid regex flags: ${invalid}. Valid flags: ${VALID_FLAGS.join(', ')}`,
  UNKNOWN_OPTION: (option) => `Unknown option: ${option}. Use --help for usage information`
};

/**
 * Validates regex flags string
 * @param {string} flags - Regex flags to validate
 * @returns {string} - Validated flags string
 * @throws {Error} - If flags contain invalid characters
 */
function validateFlags(flags) {
  if (!flags) return '';

  const flagArray = flags.split('');
  const invalidFlags = flagArray.filter(flag => !VALID_FLAGS.includes(flag));

  if (invalidFlags.length > 0) {
    throw new Error(ERROR_MESSAGES.INVALID_FLAGS(invalidFlags.join('')));
  }

  // Remove duplicates and return
  return [...new Set(flagArray)].join('');
}

/**
 * Validates and normalizes engine name
 * @param {string} engine - Engine name to validate
 * @returns {string} - Normalized engine name
 * @throws {Error} - If engine is not supported
 */
function validateEngine(engine) {
  const normalizedEngine = engine.toLowerCase();

  if (!SUPPORTED_ENGINES.includes(normalizedEngine)) {
    throw new Error(ERROR_MESSAGES.INVALID_ENGINE(engine));
  }

  // Normalize 'js' to 'javascript' for consistency
  return normalizedEngine === 'js' ? 'javascript' : normalizedEngine;
}

/**
 * Validates file path (basic check)
 * @param {string} filePath - File path to validate
 * @returns {string} - Validated file path
 * @throws {Error} - If file path is invalid
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('File path must be a non-empty string');
  }

  // Basic validation - check for obviously invalid characters
  const invalidChars = filePath.match(/[<>:"|?*]/);
  if (invalidChars) {
    throw new Error(`File path contains invalid characters: ${invalidChars.join('')}`);
  }

  return filePath.trim();
}

/**
 * Parse command-line arguments with comprehensive validation
 * @param {Array<string>} args - Array of command-line arguments
 * @returns {Object} - Parsed arguments object
 * @throws {Error} - If arguments are invalid
 */
function parseArgs(args) {
  if (!Array.isArray(args)) {
    throw new Error('Arguments must be an array');
  }

  const parsed = {
    help: false,
    engine: DEFAULT_ENGINE,
    load: null,
    regex: null,
    text: null,
    flags: '',
    file: null,
    mode: 'tui',
    debug: false,
    json: false,
    quiet: false,
    color: true,
    benchmark: 0
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Support --benchmark=NUMBER (equals syntax) and treat as if provided as separate arg
    if (arg.startsWith('--benchmark=')) {
      const value = arg.split('=')[1];
      if (!value) {
        throw new Error('Invalid benchmark count: (empty)');
      }
      const count = parseInt(value, 10);
      if (isNaN(count) || count <= 0) {
        throw new Error(`Invalid benchmark count: ${value}`);
      }
      parsed.benchmark = count;
      continue;
    }

    // Handle combined short flags (like -lr)
    if (arg.startsWith('-') && !arg.startsWith('--') && arg.length > 2) {
      // Split combined flags and process individually
      const flags = arg.slice(1).split('');
      const flagArgs = flags.map(f => `-${f}`);

      // Insert the split flags back into the args array
      args.splice(i, 1, ...flagArgs);
      continue; // Reprocess from the same index
    }

    switch (arg) {
      case '--help':
      case '-h':
        parsed.help = true;
        break;

      case '--engine':
      case '-e':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--engine'));
        }
        parsed.engine = validateEngine(args[++i]);
        break;

      case '--load':
      case '-l':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--load'));
        }
        parsed.load = validateFilePath(args[++i]);
        break;

      case '--regex':
      case '-r':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--regex'));
        }
        parsed.regex = args[++i]; // Don't validate regex pattern here, let engine handle it
        break;

      case '--text':
      case '-t':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--text'));
        }
        parsed.text = args[++i];
        break;

      case '--flags':
      case '-f':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--flags'));
        }
        parsed.flags = validateFlags(args[++i]);
        break;

      case '--file':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--file'));
        }
        parsed.file = validateFilePath(args[++i]);
        break;

      case '--mode':
        if (i + 1 >= args.length) {
          throw new Error(ERROR_MESSAGES.MISSING_VALUE('--mode'));
        }
        {
          const modeCandidate = args[++i].toLowerCase();
          if (!SUPPORTED_MODES.includes(modeCandidate)) {
            throw new Error(`Invalid mode: ${modeCandidate}. Supported modes: ${SUPPORTED_MODES.join(', ')}`);
          }
          parsed.mode = modeCandidate;
        }
        break;

      case '--debug':
        parsed.debug = true;
        break;

      case '--json':
        parsed.json = true;
        break;

      case '--quiet':
      case '-q':
        parsed.quiet = true;
        break;

      case '--no-color':
        parsed.color = false;
        break;

      case '--color':
        parsed.color = true;
        break;

      case '--benchmark':
        // Optional numeric arg (iterations); default to 1 if not provided or invalid
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          const countRaw = args[++i];
          const count = parseInt(countRaw, 10);
            if (!isNaN(count) && count > 0) {
              parsed.benchmark = count;
            } else {
              throw new Error(`Invalid benchmark count: ${countRaw}`);
            }
        } else {
          parsed.benchmark = 1; // run once to capture timing
        }
        break;

      default:
        if (arg.startsWith('-')) {
          throw new Error(ERROR_MESSAGES.UNKNOWN_OPTION(arg));
        } else {
          // If it's not a flag and no file is set, treat it as a file to load text from
          if (!parsed.file) {
            parsed.file = validateFilePath(arg);
          }
        }
        break;
    }
  }

  // Post-processing validation
  // Allow both --regex and --load: explicit --regex overrides session pattern if both provided

  if (parsed.file && parsed.text) {
    throw new Error('Cannot specify both --file and --text options');
  }

  return parsed;
}

/**
 * Get detailed help text for argument parsing
 * @returns {string} - Formatted help text
 */
function getHelpText() {
  return `RegexPlay - Command-line regex playground

Usage:
  regexplay [options]                     # Start interactive mode (default)
  regexplay --regex <pattern> --text <text> [options]  # Direct test
  regexplay --load <file> [options]       # Load a saved session
  regexplay --help                        # Show this help

Options:
  -h, --help              Show this help message
  -e, --engine <engine>   Regex engine to use (${SUPPORTED_ENGINES.join(', ')})
  -r, --regex <pattern>   Regular expression pattern to test
  -t, --text <text>       Text to test the pattern against
  -f, --flags <flags>     Regex flags (${VALID_FLAGS.join('')})
  -l, --load <file>       Load a saved session from file
  --file <file>           Load text from file instead of --text
  --mode <tui|cli>        Run in interactive TUI or non-interactive CLI mode
  --debug                 Enable verbose debug logging
  --json                  Output result as JSON (overrides quiet)
  -q, --quiet             Suppress normal output (exit code only)
  --benchmark [count]     Run pattern evaluation multiple times to measure performance
  --color / --no-color    Force enable/disable colored output (default: auto)

Interactive Commands:
  Tab         Switch between pattern and text input
  Ctrl+S      Save current session
  Ctrl+L      Load session
  Ctrl+E      Switch regex engine
  F2          Switch regex engine
  F1          Help
  Ctrl+C      Exit

Examples:
  regexplay --engine javascript --regex "\\d+" --text "test 123"
  regexplay --load my-regex-test.json
  regexplay -e pcre -r "(?<digit>\\d+)" -t "number 42" -f "g"
  regexplay --mode cli --regex "[A-Z]+" --text "ABC def" --flags "g"
  echo "test text" | regexplay

Supported Engines:
  javascript  Native JavaScript RegExp (default)
  js          Alias for javascript
  pcre        Perl Compatible Regular Expressions

Supported Flags:
  i  Case insensitive matching
  g  Global matching (find all matches)
  m  Multiline mode
  s  Dot matches newline
  u  Unicode mode
  y  Sticky matching
  x  Extended mode (PCRE only - ignore whitespace)

For more information: https://github.com/Vaporjawn/RegexPlay`;
}

module.exports = {
  parseArgs,
  validateFlags,
  validateEngine,
  validateFilePath,
  getHelpText,
  SUPPORTED_ENGINES,
  VALID_FLAGS,
  DEFAULT_ENGINE
};
