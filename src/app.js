/**
 * RegexPlay Main Application
 * Orchestrates regex testing functionality with improved error handling and performance
 */

const fs = require('fs');
const path = require('path');
const EngineFactory = require('./engines/engineFactory');
const RegexPlayTUI = require('./ui/tui');
const SessionManager = require('./utils/sessionManager');

// Constants
const DEFAULT_ENGINE = 'javascript';
const SUPPORTED_MODES = ['tui', 'cli'];
const APP_VERSION = require('../package.json').version;

class RegexPlayApp {
  constructor(options = {}) {
    this.options = this.validateOptions(options);
    this.engineFactory = null;
    this.tui = null;
    this.sessionManager = null;
    this.initialized = false;
  }

  /**
   * Validate and normalize application options
   * @param {Object} options - Application configuration options
   * @returns {Object} - Validated options with defaults
   * @private
   */
  validateOptions(options) {
    const defaults = {
      engine: DEFAULT_ENGINE,
      mode: 'tui',
      timeout: 5000,
      debug: false,
      maxIterations: 10000
    };

    const normalized = { ...defaults, ...options };

    // Validate mode
    if (!SUPPORTED_MODES.includes(normalized.mode)) {
      throw new Error(`Invalid mode: ${normalized.mode}. Supported modes: ${SUPPORTED_MODES.join(', ')}`);
    }

    // Validate timeout
    if (typeof normalized.timeout !== 'number' || normalized.timeout <= 0) {
      throw new Error('Timeout must be a positive number');
    }

    // Validate maxIterations
    if (typeof normalized.maxIterations !== 'number' || normalized.maxIterations <= 0) {
      throw new Error('Max iterations must be a positive number');
    }

    return normalized;
  }

  /**
   * Initialize the application with comprehensive error handling
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      await this.initializeComponents();
      await this.validateEnvironment();
      this.setupErrorHandlers();
      this.initialized = true;

      if (this.options.debug) {
        console.log('RegexPlay initialized successfully');
        console.log(`Version: ${APP_VERSION}`);
        console.log(`Mode: ${this.options.mode}`);
        console.log(`Default Engine: ${this.options.engine}`);
      }
    } catch (error) {
      console.error('Failed to initialize RegexPlay:', error.message);
      if (this.options.debug) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Initialize core components
   * @private
   */
  async initializeComponents() {
    // Initialize engine factory with configuration
    this.engineFactory = new EngineFactory({
      timeout: this.options.timeout,
      maxIterations: this.options.maxIterations,
      debug: this.options.debug,
      quiet: this.options.quiet,
      json: this.options.json
    });

    // Ensure underlying engines are initialized
    if (typeof this.engineFactory.initialize === 'function') {
      await this.engineFactory.initialize();
    }

    // Initialize session manager
    this.sessionManager = new SessionManager();

    // Initialize TUI if needed
    if (this.options.mode === 'tui') {
      this.tui = new RegexPlayTUI(this.engineFactory);
    }
  }

  /**
   * Validate runtime environment
   * @private
   */
  async validateEnvironment() {
    // Check if default engine is available
    const availableEngines = this.engineFactory.getAvailableEngines();
    if (!availableEngines.includes(this.options.engine)) {
      console.warn(`Warning: Default engine '${this.options.engine}' not available. Using 'javascript'.`);
      this.options.engine = 'javascript';
    }

    // Validate engines are working
    try {
      const testResult = await this.engineFactory.test(this.options.engine, 'test', 'test');
      if (!testResult.success) {
        throw new Error(`Default engine '${this.options.engine}' failed validation`);
      }
    } catch (error) {
      throw new Error(`Engine validation failed: ${error.message}`);
    }
  }

  /**
   * Setup global error handlers
   * @private
   */
  setupErrorHandlers() {
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error.message);
      if (this.options.debug) {
        console.error('Stack trace:', error.stack);
      }
      this.cleanup();
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      if (this.options.debug) {
        console.error('Stack trace:', reason?.stack);
      }
      this.cleanup();
      process.exit(1);
    });

    // Handle SIGINT (Ctrl+C)
    process.on('SIGINT', () => {
      console.log('\nReceived SIGINT. Cleaning up...');
      this.cleanup();
      process.exit(0);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM. Cleaning up...');
      this.cleanup();
      process.exit(0);
    });
  }

  /**
   * Run the application based on mode
   * @returns {Promise<void>}
   */
  async run() {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      switch (this.options.mode) {
        case 'tui':
          await this.runTUI();
          break;
        case 'cli':
          await this.runCLI();
          break;
        default:
          throw new Error(`Unsupported mode: ${this.options.mode}`);
      }
    } catch (error) {
      console.error(`Failed to run in ${this.options.mode} mode:`, error.message);
      if (this.options.debug) {
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }

  /**
   * Run in TUI mode with enhanced error handling
   * @private
   */
  async runTUI() {
    if (!this.tui) {
      throw new Error('TUI not initialized');
    }

    try {
      await this.tui.start();
    } catch (error) {
      console.error('TUI error:', error.message);
      this.cleanup();
      throw error;
    }
  }

  /**
   * Run in CLI mode (for future implementation)
   * @private
   */
  async runCLI() {
    const { regex, text, flags = '', engine = this.options.engine, file, load, json, quiet, color = true, benchmark = 0 } = this.options;

    // If no actionable input provided, show summary (respect quiet/json)
    if (!regex && !load) {
      if (json) {
        const engineInfo = this.engineFactory.getEngineInfo();
        return {
          summary: true,
          engines: engineInfo,
          success: true
        };
      }
      if (!quiet) this._printEngineSummary({ color });
      return;
    }

    const timings = [];
    const iterations = benchmark && benchmark > 0 ? benchmark : 1;

    // Helper for color output (simple, no external dep)
    const useColor = color && process.stdout.isTTY;
    const c = {
      green: (s) => useColor ? `\x1b[32m${s}\x1b[0m` : s,
      red: (s) => useColor ? `\x1b[31m${s}\x1b[0m` : s,
      yellow: (s) => useColor ? `\x1b[33m${s}\x1b[0m` : s,
      dim: (s) => useColor ? `\x1b[2m${s}\x1b[0m` : s
    };

    try {
      let workingPattern = regex;
      let workingText = text;
      let workingFlags = flags || '';
      let workingEngine = engine;
      const warnings = [];

      // Warn if x flag used but engine not PCRE (PCRE disabled currently)
      let executionFlags = workingFlags;
      if (workingFlags.includes('x') && workingEngine !== 'pcre') {
  warnings.push("x flag requested (extended mode) but PCRE engine is unavailable. Whitespace/comments will NOT be ignored (flag ignored).");
        // Remove x flag for actual JS execution to avoid SyntaxError
        executionFlags = workingFlags.replace(/x/g, '');
      }

      // Load session if requested
      if (load) {
        const session = await this.loadSession(load);
        if (!workingPattern && session.pattern) workingPattern = session.pattern;
        if (!workingText && session.text) workingText = session.text;
        if (!workingFlags && session.flags) workingFlags = session.flags;
      }

      if (load && !workingPattern) {
        throw new Error('Loaded session did not contain a pattern');
      }

      // Read text from file if provided
      if (!workingText && file) {
        workingText = await this._readFileSafe(file);
      }

      // If still no text and stdin is piped, read stdin
      if (!workingText && !process.stdin.isTTY) {
        workingText = await this._readStdin();
      }

      if (!workingPattern) {
        throw new Error('No regex pattern provided (use --regex or include in session file)');
      }
      if (workingText === undefined || workingText === null) {
        throw new Error('No test text provided (use --text, --file, pipe via stdin, or include in session)');
      }

  const useFindAll = executionFlags.includes('g');
      let finalResult = null;

      for (let i = 0; i < iterations; i++) {
        const start = process.hrtime.bigint();
        const result = useFindAll
          ? await this.findAllMatches(workingEngine, workingPattern, workingText, executionFlags)
          : await this.testPattern(workingEngine, workingPattern, workingText, executionFlags);
        const end = process.hrtime.bigint();
        const durationNs = Number(end - start);
        timings.push(durationNs);
        finalResult = result; // last iteration result
      }

      const stats = this._computeTimingStats(timings);

      if (json) {
        return {
          success: finalResult.success,
          mode: useFindAll ? 'findAll' : 'test',
          pattern: workingPattern,
          flags: workingFlags,
          engine: workingEngine,
          iterations,
          benchmark: {
            enabled: iterations > 1,
            iterations,
            stats,
            timingsNs: timings
          },
          matches: finalResult.matches,
          error: finalResult.error || null,
          warnings
        };
      }

      if (!quiet) {
        if (warnings.length) {
          warnings.forEach(w => console.warn(c.yellow('Warning: ') + w));
        }
        if (iterations > 1) {
          console.log(c.dim(`Benchmark: ${iterations} iteration(s)`));
          console.log(c.dim(`Time (ns): min=${stats.min} max=${stats.max} mean=${stats.mean} p95=${stats.p95}`));
        }
        this._displayResultColored(finalResult, { findAll: useFindAll, color: useColor, colors: c });
      }
      return finalResult;
    } catch (error) {
      if (json) {
        return {
          success: false,
          error: { message: error.message, type: error.constructor.name },
          pattern: regex || null,
          flags: flags || '',
          engine: engine,
          iterations: 0
        };
      }
      if (!quiet) {
        console.error('CLI execution error:', error.message);
        if (this.options.debug && error.stack) {
          console.error(error.stack);
        }
      }
      throw error; // allow upstream exit code logic
    }
  }

  /**
   * Test a regex pattern with enhanced error handling and validation
   * @param {string} engine - Engine name
   * @param {string} pattern - Regex pattern
   * @param {string} text - Test text
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - Test result
   */
  async testPattern(engine, pattern, text, flags = '') {
    if (!this.initialized) {
      await this.initialize();
    }

    // Input validation
    if (typeof pattern !== 'string' || typeof text !== 'string') {
      throw new Error('Pattern and text must be strings');
    }

    if (typeof flags !== 'string') {
      throw new Error('Flags must be a string');
    }

    if (pattern.length === 0) {
      throw new Error('Pattern cannot be empty');
    }

    try {
      const result = await this.engineFactory.test(engine, pattern, text, flags);

      if (this.options.debug) {
        console.log('Test result:', {
          engine,
          pattern: pattern.slice(0, 50) + (pattern.length > 50 ? '...' : ''),
          text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          flags,
          success: result.success,
          matchCount: result.matches?.length || 0
        });
      }

      return result;
    } catch (error) {
      const enhancedError = new Error(`Pattern test failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.context = { engine, pattern, flags };
      throw enhancedError;
    }
  }

  /**
   * Find all matches with enhanced error handling
   * @param {string} engine - Engine name
   * @param {string} pattern - Regex pattern
   * @param {string} text - Test text
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - FindAll result
   */
  async findAllMatches(engine, pattern, text, flags = '') {
    if (!this.initialized) {
      await this.initialize();
    }

    // Input validation
    if (typeof pattern !== 'string' || typeof text !== 'string') {
      throw new Error('Pattern and text must be strings');
    }

    if (typeof flags !== 'string') {
      throw new Error('Flags must be a string');
    }

    if (pattern.length === 0) {
      throw new Error('Pattern cannot be empty');
    }

    try {
      const result = await this.engineFactory.findAll(engine, pattern, text, flags);

      if (this.options.debug) {
        console.log('FindAll result:', {
          engine,
          pattern: pattern.slice(0, 50) + (pattern.length > 50 ? '...' : ''),
          text: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
          flags,
          success: result.success,
          matchCount: result.matches?.length || 0
        });
      }

      return result;
    } catch (error) {
      const enhancedError = new Error(`FindAll failed: ${error.message}`);
      enhancedError.originalError = error;
      enhancedError.context = { engine, pattern, flags };
      throw enhancedError;
    }
  }

  /**
   * Get information about available engines
   * @returns {Array} - Array of engine information objects
   */
  getEngineInfo() {
    if (!this.engineFactory) {
      throw new Error('Application not initialized');
    }

    return this.engineFactory.getEngineInfo();
  }

  /**
   * Get engine alias policy and mapping
   * @returns {Object}
   */
  getAliasPolicy() {
    if (!this.engineFactory) {
      throw new Error('Application not initialized');
    }
    if (typeof this.engineFactory.getAliasPolicy === 'function') {
      return this.engineFactory.getAliasPolicy();
    }
    return { policy: 'Alias policy unavailable', engines: [] };
  }

  /**
   * Get list of available engine names
   * @returns {Array<string>} - Array of available engine names
   */
  getAvailableEngines() {
    if (!this.engineFactory) {
      throw new Error('Application not initialized');
    }

    return this.engineFactory.getAvailableEngines();
  }

  /**
   * Save current session data
   * @param {Object} sessionData - Session data to save
   * @returns {Promise<string>} - Path to saved session file
   */
  async saveSession(sessionData) {
    if (!this.sessionManager) {
      throw new Error('Session manager not initialized');
    }

    // Validate session data
    if (!sessionData || typeof sessionData !== 'object') {
      throw new Error('Invalid session data');
    }

    const requiredFields = ['pattern', 'text'];
    for (const field of requiredFields) {
      if (!(field in sessionData)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    try {
      const filePath = await this.sessionManager.saveSession(sessionData);

      if (this.options.debug) {
        console.log('Session saved:', filePath);
      }

      return filePath;
    } catch (error) {
      throw new Error(`Failed to save session: ${error.message}`);
    }
  }

  /**
   * Load session from file
   * @param {string} filename - Session filename
   * @returns {Promise<Object>} - Loaded session data
   */
  async loadSession(filename) {
    if (!this.sessionManager) {
      throw new Error('Session manager not initialized');
    }

    if (typeof filename !== 'string' || filename.length === 0) {
      throw new Error('Filename must be a non-empty string');
    }

    try {
      const sessionData = await this.sessionManager.loadSession(filename);

      if (this.options.debug) {
        console.log('Session loaded:', filename);
      }

      return sessionData;
    } catch (error) {
      throw new Error(`Failed to load session: ${error.message}`);
    }
  }

  /**
   * List available sessions
   * @returns {Promise<Array<string>>} - Array of session filenames
   */
  async listSessions() {
    if (!this.sessionManager) {
      throw new Error('Session manager not initialized');
    }

    try {
      return await this.sessionManager.listSessions();
    } catch (error) {
      throw new Error(`Failed to list sessions: ${error.message}`);
    }
  }

  /**
   * Get application version
   * @returns {string} - Application version
   */
  getVersion() {
    return APP_VERSION;
  }

  /**
   * Get application configuration
   * @returns {Object} - Current configuration options
   */
  getConfiguration() {
    return { ...this.options };
  }

  /**
   * Update configuration options
   * @param {Object} newOptions - New configuration options
   */
  updateConfiguration(newOptions) {
    if (!newOptions || typeof newOptions !== 'object') {
      throw new Error('Configuration must be an object');
    }

    const validatedOptions = this.validateOptions({ ...this.options, ...newOptions });
    this.options = validatedOptions;

    if (this.options.debug) {
      console.log('Configuration updated:', this.options);
    }
  }

  /**
   * Clean up resources with comprehensive cleanup
   * @private
   */
  cleanup() {
    try {
      if (this.tui) {
        this.tui.destroy();
        this.tui = null;
      }

      this.engineFactory = null;
      this.sessionManager = null;
      this.initialized = false;

      if (this.options?.debug) {
        console.log('Application cleanup completed');
      }
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  /**
   * Shutdown the application gracefully
   * @returns {Promise<void>}
   */
  async shutdown() {
    try {
      if (this.options?.debug) {
        console.log('Shutting down RegexPlay...');
      }

      this.cleanup();

      if (this.options?.debug) {
        console.log('RegexPlay shutdown complete');
      }
    } catch (error) {
      console.error('Error during shutdown:', error.message);
      throw error;
    }
  }

  /**
   * Check if the application is initialized
   * @returns {boolean} - True if initialized
   */
  isInitialized() {
    return this.initialized;
  }

  /**
   * Validate the current state of the application
   * @returns {Promise<boolean>} - True if valid state
   */
  async validateState() {
    try {
      if (!this.initialized) {
        return false;
      }

      if (!this.engineFactory) {
        return false;
      }

      // Test engine functionality
      const availableEngines = this.engineFactory.getAvailableEngines();
      if (availableEngines.length === 0) {
        return false;
      }

      // Quick validation test
      const testResult = await this.engineFactory.test('javascript', 'test', 'test');
      return testResult.success;

    } catch (error) {
      if (this.options?.debug) {
        console.warn('State validation failed:', error.message);
      }
      return false;
    }
  }

  /* ---------------------------- Helper Functions --------------------------- */

  /**
   * Print summary of engines when no direct CLI action specified
   * @private
   */
  _printEngineSummary() {
    console.log('RegexPlay CLI Mode');
    console.log(`Version: ${APP_VERSION}`);
    console.log('\nAvailable engines:');

    const engineInfo = this.engineFactory.getEngineInfo();
    engineInfo.forEach(info => {
      const status = info.status === 'available' ? '✅' : '❌';
      console.log(`  ${status} ${info.name} (aliases: ${info.aliases.join(', ')})` + (info.error ? ` - ${info.error}` : ''));
    });

    console.log('\nExamples:');
    console.log('  regexplay --mode cli --regex "\\d+" --text "Order #123"');
    console.log('  regexplay --mode cli --regex "[A-Z]+" --file README.md --flags g');
    console.log('  echo "Some Input" | regexplay --mode cli --regex "input" -f i');
    console.log('\nUse --mode tui for interactive mode');
  }

  /**
   * Read entire stdin stream
   * @returns {Promise<string>} Collected stdin data
   * @private
   */
  _readStdin() {
    return new Promise(resolve => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', chunk => (data += chunk));
      process.stdin.on('end', () => resolve(data));
    });
  }

  /**
   * Safely read file content
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File contents
   * @private
   */
  async _readFileSafe(filePath) {
    const resolved = path.resolve(process.cwd(), filePath);
    return new Promise((resolve, reject) => {
      fs.readFile(resolved, 'utf8', (err, data) => {
        if (err) return reject(new Error(`Failed to read file '${filePath}': ${err.message}`));
        resolve(data);
      });
    });
  }

  /**
   * Display formatted result in CLI
   * @param {Object} result - Result object from engine
   * @param {Object} options - Display options
   * @param {boolean} options.findAll - Whether result came from findAll
   * @private
   */
  _displayResult(result, { findAll = false } = {}) {
    if (!result) {
      console.log('No result to display');
      return;
    }

    if (result.error && !result.success) {
      console.log('❌ No match');
      console.log('Error:', result.error.message);
      return;
    }

    if (!result.success) {
      console.log('❌ No match');
      return;
    }

    if (findAll) {
      const count = result.matches?.length || 0;
      console.log(`✅ ${count} match${count === 1 ? '' : 'es'} found`);
      result.matches.slice(0, 50).forEach((m, idx) => {
        console.log(`  [${idx}] '${m.fullMatch}' at index ${m.index} (len=${m.length})`);
        if (m.groups && m.groups.length > 0) {
          m.groups.forEach((g, gIdx) => console.log(`      Group ${gIdx + 1}: ${g}`));
        }
        const namedKeys = Object.keys(m.namedGroups || {});
        if (namedKeys.length > 0) {
          namedKeys.forEach(k => console.log(`      ${k}: ${m.namedGroups[k]}`));
        }
      });
      if (result.matches.length > 50) {
        console.log(`  ...and ${result.matches.length - 50} more`);
      }
    } else {
      const first = result.matches && result.matches[0];
      if (!first) {
        console.log('❌ No match');
        return;
      }
      console.log('✅ Match found');
      console.log(`  '${first.fullMatch}' at index ${first.index} (len=${first.length})`);
      if (first.groups && first.groups.length > 0) {
        first.groups.forEach((g, gIdx) => console.log(`    Group ${gIdx + 1}: ${g}`));
      }
      const namedKeys = Object.keys(first.namedGroups || {});
      if (namedKeys.length > 0) {
        namedKeys.forEach(k => console.log(`    ${k}: ${first.namedGroups[k]}`));
      }
    }
  }

  /* -------------------- Backward Compatibility Wrappers -------------------- */
  /**
   * Backward compatible direct test API (single match unless 'g' in flags)
   * @param {string} pattern
   * @param {string} text
   * @param {string} flags
   * @param {string} engine
   * @returns {Promise<Object>} result
   */
  async runDirectTest(pattern, text, flags = '', engine = this.options.engine) {
    const useFindAll = flags.includes('g');
    return useFindAll
      ? this.findAllMatches(engine, pattern, text, flags)
      : this.testPattern(engine, pattern, text, flags);
  }

  /**
   * Backward compatible file test API
   * @param {string} filePath
   * @param {string} pattern
   * @param {string} flags
   * @param {string} engine
   * @returns {Promise<Object>} result
   */
  async runFileTest(filePath, pattern, flags = '', engine = this.options.engine) {
    const text = await this._readFileSafe(filePath);
    return this.runDirectTest(pattern, text, flags, engine);
  }

  /**
   * Backward compatible result display helper
   * @param {Object} result
   * @param {boolean} findAll
   */
  displayResult(result, findAll = false) {
    this._displayResult(result, { findAll });
  }

  /**
   * Colored display wrapper honoring color toggle
   * @param {Object} result
   * @param {Object} options
   * @param {boolean} options.findAll
   * @param {boolean} options.color
   * @param {Object} options.colors
   * @private
   */
  _displayResultColored(result, { findAll = false, color = false, colors } = {}) {
    if (!color) return this._displayResult(result, { findAll });
    if (!result) {
      console.log(colors.red('No result to display'));
      return;
    }
    if (result.error && !result.success) {
      console.log(colors.red('❌ No match'));
      console.log(colors.red('Error: ') + result.error.message);
      return;
    }
    if (!result.success) {
      console.log(colors.red('❌ No match'));
      return;
    }
    if (findAll) {
      const count = result.matches?.length || 0;
      console.log(colors.green(`✅ ${count} match${count === 1 ? '' : 'es'} found`));
      result.matches.slice(0, 50).forEach((m, idx) => {
        console.log(colors.green(`  [${idx}] '${m.fullMatch}' at index ${m.index} (len=${m.length})`));
        if (m.groups && m.groups.length > 0) {
          m.groups.forEach((g, gIdx) => console.log(colors.dim(`      Group ${gIdx + 1}: ${g}`)));
        }
        const namedKeys = Object.keys(m.namedGroups || {});
        if (namedKeys.length > 0) {
          namedKeys.forEach(k => console.log(colors.dim(`      ${k}: ${m.namedGroups[k]}`)));
        }
      });
      if (result.matches.length > 50) {
        console.log(colors.dim(`  ...and ${result.matches.length - 50} more`));
      }
    } else {
      const first = result.matches && result.matches[0];
      if (!first) {
        console.log(colors.red('❌ No match'));
        return;
      }
      console.log(colors.green('✅ Match found'));
      console.log(colors.green(`  '${first.fullMatch}' at index ${first.index} (len=${first.length})`));
      if (first.groups && first.groups.length > 0) {
        first.groups.forEach((g, gIdx) => console.log(colors.dim(`    Group ${gIdx + 1}: ${g}`)));
      }
      const namedKeys = Object.keys(first.namedGroups || {});
      if (namedKeys.length > 0) {
        namedKeys.forEach(k => console.log(colors.dim(`    ${k}: ${first.namedGroups[k]}`)));
      }
    }
  }

  /**
   * Compute timing statistics (nanoseconds)
   * @param {number[]} timings
   * @returns {{min:number,max:number,mean:number,p95:number}}
   * @private
   */
  _computeTimingStats(timings) {
    if (!timings.length) return { min: 0, max: 0, mean: 0, p95: 0 };
    const sorted = [...timings].sort((a,b)=>a-b);
    const min = sorted[0];
    const max = sorted[sorted.length-1];
    const mean = Math.round(sorted.reduce((s,v)=>s+v,0)/sorted.length);
    const p95Index = Math.min(sorted.length -1, Math.floor(sorted.length*0.95)-1);
    const p95 = sorted[p95Index];
    return { min, max, mean, p95 };
  }
}

module.exports = RegexPlayApp;
