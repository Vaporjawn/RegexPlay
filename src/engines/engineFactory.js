/**
 * Regex Engine Factory
 * Manages multiple regex engines and provides unified access with validation
 */

const JavaScriptEngine = require('./jsEngine');
// PCRE engine temporarily disabled due to ES module compatibility issues
// const PCREEngine = require('./pcreEngine');

// Constants
const ENGINE_ALIASES = {
  'javascript': ['javascript', 'js'],
  'pcre': ['pcre', 'perl']
};

const DEFAULT_ENGINE = 'javascript';

/**
 * Validates engine name and returns normalized form
 * @param {string} name - Engine name to validate
 * @returns {string} - Normalized engine name
 * @throws {Error} - If engine name is invalid
 */
function normalizeEngineName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Engine name must be a non-empty string');
  }

  const normalizedName = name.toLowerCase().trim();

  // Find the canonical name for this alias
  for (const [canonical, aliases] of Object.entries(ENGINE_ALIASES)) {
    if (aliases.includes(normalizedName)) {
      return canonical;
    }
  }

  throw new Error(`Unknown engine: ${name}. Available engines: ${Object.keys(ENGINE_ALIASES).join(', ')}`);
}

/**
 * Validates regex pattern (basic validation)
 * @param {string} pattern - Regex pattern to validate
 * @throws {Error} - If pattern is invalid
 */
function validatePattern(pattern) {
  if (pattern === null || pattern === undefined) {
    throw new Error('Pattern cannot be null or undefined');
  }

  if (typeof pattern !== 'string') {
    throw new Error('Pattern must be a string');
  }
}

/**
 * Validates text input
 * @param {string} text - Text to validate
 * @throws {Error} - If text is invalid
 */
function validateText(text) {
  if (text === null || text === undefined) {
    throw new Error('Text cannot be null or undefined');
  }

  if (typeof text !== 'string') {
    throw new Error('Text must be a string');
  }
}

/**
 * Validates flags string
 * @param {string} flags - Flags to validate
 * @throws {Error} - If flags are invalid
 */
function validateFlags(flags = '') {
  if (flags === null || flags === undefined) {
    return '';
  }

  if (typeof flags !== 'string') {
    throw new Error('Flags must be a string');
  }

  return flags;
}

class EngineFactory {
  constructor(options = {}) {
    this.engines = new Map();
    this.initialized = false;
    this.initializationErrors = [];
    this.lazyEnabled = { pcreTried: false };
    this.options = {
      quiet: false,
      json: false,
      debug: false,
      ...options
    };
  }

  /**
   * Initialize all available engines with comprehensive error handling
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;

    this.initializationErrors = [];

    try {
      // Initialize JavaScript engine (synchronous)
      if (!this._silent()) console.log('Initializing JavaScript regex engine...');
      const jsEngine = new JavaScriptEngine();

      // Register with all aliases
      for (const alias of ENGINE_ALIASES.javascript) {
        this.engines.set(alias, jsEngine);
      }

      if (!this._silent()) console.log('✅ JavaScript engine initialized successfully');
    } catch (error) {
      if (!this._silent()) console.error('❌ Failed to initialize JavaScript engine:', error.message);
      this.initializationErrors.push({
        engine: 'javascript',
        error: error.message
      });
    }

    // Initialize PCRE engine (asynchronous) - TEMPORARILY DISABLED
    try {
      if (!this._silent()) console.log('PCRE engine initialization skipped (ES module compatibility issues)');
      // Uncomment when PCRE compatibility is resolved:
      /*
      console.log('Initializing PCRE regex engine...');
      const PCREEngine = require('./pcreEngine');
      const pcreEngine = new PCREEngine();
      await pcreEngine.initialize();

      // Register with all aliases
      for (const alias of ENGINE_ALIASES.pcre) {
        this.engines.set(alias, pcreEngine);
      }

      console.log('✅ PCRE engine initialized successfully');
      */
    } catch (error) {
      if (!this._silent()) {
        console.warn(`⚠️  Could not initialize PCRE engine: ${error.message}`);
        console.warn('PCRE functionality will not be available.');
      }
      this.initializationErrors.push({
        engine: 'pcre',
        error: error.message
      });
    }

    // Check if at least one engine is available
    if (this.engines.size === 0) {
      throw new Error('No regex engines could be initialized');
    }

    this.initialized = true;
    if (!this._silent()) console.log(`🎉 Engine factory initialized with ${this.getAvailableEngines().length} engine(s)`);
  }

  /**
   * Attempt lazy loading of an optional engine (e.g., PCRE) if not already loaded.
   * Currently a placeholder until ES module compatibility is resolved.
   * @param {string} name
   * @returns {boolean} whether load attempt was made
   */
  async maybeLazyLoadEngine(name) {
    const target = name.toLowerCase();
    if (target !== 'pcre') return false;
    if (this.isEngineAvailable('pcre')) return false;
    if (this.lazyEnabled.pcreTried) return false;
    this.lazyEnabled.pcreTried = true;
    try {
      // Placeholder: dynamic import commented out
      // const PCREEngine = require('./pcreEngine');
      // const pcreEngine = new PCREEngine();
      // await pcreEngine.initialize();
      // for (const alias of ENGINE_ALIASES.pcre) this.engines.set(alias, pcreEngine);
      // console.log('✅ PCRE engine lazily loaded');
      console.warn('PCRE lazy load attempted (placeholder) - engine still disabled pending compatibility.');
      return false;
    } catch (error) {
      this.initializationErrors.push({ engine: 'pcre', error: error.message });
      return false;
    }
  }

  /**
   * Get an engine by name with validation
   * @param {string} name - Engine name ('javascript', 'js', 'pcre', 'perl')
   * @returns {Object} - Engine instance
   * @throws {Error} - If engine not found or factory not initialized
   */
  getEngine(name) {
    if (!this.initialized) {
      throw new Error('EngineFactory not initialized. Call initialize() first.');
    }

    const normalizedName = normalizeEngineName(name);
    const engine = this.engines.get(normalizedName);

    if (!engine) {
      const available = this.getAvailableEngines();
      throw new Error(`Engine '${name}' not available. Available engines: ${available.join(', ')}`);
    }

    return engine;
  }

  /**
   * Get list of available engine names (canonical names only)
   * @returns {Array<string>} - Array of canonical engine names
   */
  getAvailableEngines() {
    if (!this.initialized) return [];

    const canonicalNames = new Set();

    for (const [name] of this.engines.entries()) {
      const canonical = normalizeEngineName(name);
      canonicalNames.add(canonical);
    }

    return Array.from(canonicalNames);
  }

  /**
   * Get all engine aliases
   * @returns {Array<string>} - Array of all engine names including aliases
   */
  getAllEngineNames() {
    if (!this.initialized) return [];
    return Array.from(this.engines.keys());
  }

  /**
   * Get detailed information about all engines
   * @returns {Array<Object>} - Array of engine capability objects
   */
  getEngineInfo() {
    if (!this.initialized) return [];

    const engines = [];
    const seen = new Set();

    for (const [name, engine] of this.engines.entries()) {
      if (!seen.has(engine)) {
        seen.add(engine);
        engines.push({
          name: engine.name,
          aliases: this._getAliases(engine),
          capabilities: engine.getCapabilities(),
          status: 'available'
        });
      }
    }

    // Add information about failed engines
    for (const error of this.initializationErrors) {
      engines.push({
        name: error.engine,
        aliases: ENGINE_ALIASES[error.engine] || [error.engine],
        capabilities: null,
        status: 'unavailable',
        error: error.error
      });
    }

    return engines;
  }

  /**
   * Get alias policy description and mapping.
   * @returns {{policy: string, engines: Array<{name:string, aliases:string[]}>}}
   */
  getAliasPolicy() {
    const info = this.getEngineInfo();
    const mapping = {};
    info.forEach(e => { mapping[e.name] = e.aliases; });
    return {
      policy: 'Aliases are case-insensitive. The first listed alias is the canonical name. Future engines may add additional aliases; canonical names remain stable.',
      engines: info.map(e => ({ name: e.name, aliases: e.aliases })),
      mapping
    };
  }

  /**
   * Get aliases for an engine
   * @param {Object} targetEngine - Engine to find aliases for
   * @returns {Array<string>} - Array of alias names
   * @private
   */
  _getAliases(targetEngine) {
    const aliases = [];
    for (const [name, engine] of this.engines.entries()) {
      if (engine === targetEngine) {
        aliases.push(name);
      }
    }
    return aliases;
  }

  /**
   * Test a pattern against text using specified engine with validation
   * @param {string} engineName - Name of engine to use
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to test against
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - Match result object
   */
  async test(engineName, pattern, text, flags = '') {
    // Input validation
    validatePattern(pattern);
    validateText(text);
    const validatedFlags = validateFlags(flags);

    const engine = this.getEngine(engineName);

    try {
      return await engine.test(pattern, text, validatedFlags);
    } catch (error) {
      return {
        success: false,
        engine: engine.name,
        pattern,
        flags: validatedFlags,
        text,
        matches: [],
        error: {
          message: error.message,
          type: error.constructor.name
        }
      };
    }
  }

  /**
   * Find all matches using specified engine with validation
   * @param {string} engineName - Name of engine to use
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to search in
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - Match result object with all matches
   */
  async findAll(engineName, pattern, text, flags = '') {
    // Input validation
    validatePattern(pattern);
    validateText(text);
    const validatedFlags = validateFlags(flags);

    const engine = this.getEngine(engineName);

    try {
      return await engine.findAll(pattern, text, validatedFlags);
    } catch (error) {
      return {
        success: false,
        engine: engine.name,
        pattern,
        flags: validatedFlags,
        text,
        matches: [],
        error: {
          message: error.message,
          type: error.constructor.name
        }
      };
    }
  }

  /**
   * Replace matches using specified engine with validation
   * @param {string} engineName - Name of engine to use
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to search in
   * @param {string} replacement - Replacement string
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - Replacement result object
   */
  async replace(engineName, pattern, text, replacement, flags = '') {
    // Input validation
    validatePattern(pattern);
    validateText(text);
    const validatedFlags = validateFlags(flags);

    if (replacement === null || replacement === undefined) {
      throw new Error('Replacement cannot be null or undefined');
    }

    if (typeof replacement !== 'string') {
      throw new Error('Replacement must be a string');
    }

    const engine = this.getEngine(engineName);

    try {
      return await engine.replace(pattern, text, replacement, validatedFlags);
    } catch (error) {
      return {
        success: false,
        engine: engine.name,
        pattern,
        flags: validatedFlags,
        text,
        replacement,
        result: text,
        error: {
          message: error.message,
          type: error.constructor.name
        }
      };
    }
  }

  /**
   * Compare pattern results across all engines with validation
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to test against
   * @param {string} flags - Regex flags
   * @returns {Promise<Object>} - Comparison results from all engines
   */
  async compare(pattern, text, flags = '') {
    // Input validation
    validatePattern(pattern);
    validateText(text);
    const validatedFlags = validateFlags(flags);

    const results = {};
    const engineNames = this.getAvailableEngines();

    for (const engineName of engineNames) {
      try {
        results[engineName] = await this.test(engineName, pattern, text, validatedFlags);
      } catch (error) {
        results[engineName] = {
          success: false,
          engine: engineName,
          pattern,
          flags: validatedFlags,
          text,
          matches: [],
          error: {
            message: error.message,
            type: 'EngineError'
          }
        };
      }
    }

    return results;
  }

  /**
   * Check if a specific engine is available
   * @param {string} engineName - Name of engine to check
   * @returns {boolean} - True if engine is available
   */
  isEngineAvailable(engineName) {
    try {
      const normalizedName = normalizeEngineName(engineName);
      return this.engines.has(normalizedName);
    } catch (error) {
      return false;
    }
  }

  /**
   * Get initialization errors
   * @returns {Array<Object>} - Array of initialization error objects
   */
  getInitializationErrors() {
    return [...this.initializationErrors];
  }

  /**
   * Cleanup all engines
   */
  destroy() {
    const cleanedEngines = new Set();

    for (const [name, engine] of this.engines.entries()) {
      if (!cleanedEngines.has(engine)) {
        cleanedEngines.add(engine);
        if (typeof engine.destroy === 'function') {
          try {
            engine.destroy();
          } catch (error) {
            console.warn(`Warning: Error destroying engine ${engine.name}: ${error.message}`);
          }
        }
      }
    }

    this.engines.clear();
    this.initialized = false;
    this.initializationErrors = [];
  }

  /**
   * Determine if logging should be silenced (quiet or json without debug)
   * @returns {boolean}
   * @private
   */
  _silent() {
    return (this.options.quiet || this.options.json) && !this.options.debug;
  }
}

module.exports = EngineFactory;
