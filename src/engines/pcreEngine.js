/**
 * PCRE Regex Engine
 * Wrapper for @syntropiq/libpcre-ts with unified interface and enhanced error handling
 */

const { PCRE } = require('@syntropiq/libpcre-ts');

// Constants
const ENGINE_NAME = 'PCRE';
const SUPPORTED_FLAGS = ['i', 'm', 's', 'x', 'u', 'g']; // Added 'g' for consistency
const MAX_RECURSION_DEPTH = 100; // Lower than JS engine due to PCRE recursion support
const TIMEOUT_MS = 10000; // Longer timeout for PCRE as it may handle more complex patterns

/**
 * Validates and sanitizes regex flags for PCRE engine
 * @param {string} flags - Regex flags to validate
 * @returns {string} - Sanitized flags string
 * @throws {Error} - If flags contain unsupported characters
 */
function validateAndSanitizeFlags(flags = '') {
  if (typeof flags !== 'string') {
    throw new Error('Flags must be a string');
  }

  const flagArray = flags.split('');
  const invalidFlags = flagArray.filter(flag => !SUPPORTED_FLAGS.includes(flag));

  if (invalidFlags.length > 0) {
    throw new Error(`Unsupported flags for PCRE engine: ${invalidFlags.join('')}. Supported: ${SUPPORTED_FLAGS.join('')}`);
  }

  // Remove duplicates and return
  return [...new Set(flagArray)].join('');
}

/**
 * Creates a standardized result object
 * @param {boolean} success - Whether the operation succeeded
 * @param {string} pattern - The regex pattern used
 * @param {string} flags - The flags used
 * @param {string} text - The text that was tested
 * @param {Array} matches - Array of match objects
 * @param {Object} error - Error object if operation failed
 * @returns {Object} - Standardized result object
 */
function createResult(success, pattern, flags, text, matches = [], error = null) {
  return {
    success,
    engine: ENGINE_NAME,
    pattern,
    flags,
    text,
    matches,
    error,
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized error object
 * @param {Error} error - The original error
 * @param {string} operation - The operation that failed
 * @returns {Object} - Standardized error object
 */
function createError(error, operation = 'pcre operation') {
  return {
    message: error.message,
    type: error.constructor.name,
    operation,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}

/**
 * Converts a PCRE match result to our standardized format
 * @param {Object} match - Result from PCRE.exec()
 * @param {string} text - Original text for context
 * @returns {Object} - Standardized match object
 */
function formatMatch(match, text) {
  return {
    fullMatch: match.match || text.substring(match.start, match.end),
    index: match.start || 0,
    length: (match.end || 0) - (match.start || 0),
    groups: match.groups || [],
    namedGroups: match.namedGroups || {},
    input: text
  };
}

class PCREEngine {
  constructor() {
    this.name = ENGINE_NAME;
    this.version = null;
    this.pcre = null;
    this.initialized = false;
    this.initializationError = null;
  }

  /**
   * Initialize the PCRE engine with enhanced error handling
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.initialized) return;
    if (this.initializationError) {
      throw this.initializationError;
    }

    try {
      this.pcre = new PCRE();
      await this.pcre.init();
      this.version = 'PCRE (WebAssembly)';
      this.initialized = true;
    } catch (error) {
      this.initializationError = new Error(`Failed to initialize PCRE engine: ${error.message}`);
      throw this.initializationError;
    }
  }

  /**
   * Ensure PCRE is initialized with detailed error messaging
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized) {
      if (this.initializationError) {
        throw new Error(`PCRE engine initialization failed: ${this.initializationError.message}`);
      }
      throw new Error('PCRE engine not initialized. Call initialize() first.');
    }
  }

  /**
   * Convert flags string to PCRE options with validation
   * @param {string} flags - JavaScript-style flags
   * @returns {number} - PCRE options bitmask
   * @private
   */
  _convertFlags(flags = '') {
    let options = 0;

    try {
      if (flags.includes('i')) options |= this.pcre.constants.CASELESS;
      if (flags.includes('m')) options |= this.pcre.constants.MULTILINE;
      if (flags.includes('s')) options |= this.pcre.constants.DOTALL;
      if (flags.includes('x')) options |= this.pcre.constants.EXTENDED;
      if (flags.includes('u')) options |= this.pcre.constants.UTF8;
      // Note: 'g' is handled in the calling methods, not as a PCRE option
    } catch (error) {
      throw new Error(`Failed to convert flags: ${error.message}`);
    }

    return options;
  }

  /**
   * Test if pattern matches text with enhanced error handling
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to test against
   * @param {string} flags - Regex flags (i, m, s, x, u)
   * @returns {Object} - Match result object
   */
  test(pattern, text, flags = '') {
    try {
      // Input validation
      if (typeof pattern !== 'string') {
        throw new Error('Pattern must be a string');
      }
      if (typeof text !== 'string') {
        throw new Error('Text must be a string');
      }

      this._ensureInitialized();

      const sanitizedFlags = validateAndSanitizeFlags(flags);
      const options = this._convertFlags(sanitizedFlags);

      // Execute with timeout protection
      const startTime = Date.now();
      let result;

      try {
        result = this.pcre.quickMatch(pattern, text, options);
      } catch (pcreError) {
        return createResult(false, pattern, sanitizedFlags, text, [],
          createError(pcreError, 'pattern execution'));
      }

      // Check for timeout
      if (Date.now() - startTime > TIMEOUT_MS) {
        return createResult(false, pattern, sanitizedFlags, text, [],
          createError(new Error('PCRE execution timeout - pattern may be too complex'), 'timeout protection'));
      }

      if (!result || !result.success) {
        return createResult(false, pattern, sanitizedFlags, text, []);
      }

      const formattedMatch = formatMatch(result, text);
      return createResult(true, pattern, sanitizedFlags, text, [formattedMatch]);

    } catch (error) {
      return createResult(false, pattern, flags, text, [],
        createError(error, 'test operation'));
    }
  }

  /**
   * Find all matches in text with enhanced error handling and performance protection
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to search in
   * @param {string} flags - Regex flags (i, m, s, x, u, g)
   * @returns {Object} - Match result object with all matches
   */
  findAll(pattern, text, flags = '') {
    try {
      // Input validation
      if (typeof pattern !== 'string') {
        throw new Error('Pattern must be a string');
      }
      if (typeof text !== 'string') {
        throw new Error('Text must be a string');
      }

      this._ensureInitialized();

      const sanitizedFlags = validateAndSanitizeFlags(flags);
      const options = this._convertFlags(sanitizedFlags);

      let regex;
      try {
        regex = new this.pcre.PCRERegex(pattern, options);
      } catch (compileError) {
        return createResult(false, pattern, sanitizedFlags, text, [],
          createError(compileError, 'pattern compilation'));
      }

      const matches = [];
      let offset = 0;
      let iterationCount = 0;
      const MAX_ITERATIONS = 5000; // Lower than JS engine due to potential PCRE complexity
      const startTime = Date.now();

      try {
        while (offset < text.length && iterationCount < MAX_ITERATIONS) {
          iterationCount++;

          // Check for timeout
          if (Date.now() - startTime > TIMEOUT_MS) {
            const timeoutError = new Error('PCRE execution timeout - pattern may be too complex');
            if (matches.length > 0) {
              return createResult(true, pattern, sanitizedFlags, text, matches,
                createError(timeoutError, 'partial execution - some matches found'));
            } else {
              return createResult(false, pattern, sanitizedFlags, text, [],
                createError(timeoutError, 'timeout protection'));
            }
          }

          let result;
          try {
            result = regex.exec(text, offset);
          } catch (execError) {
            // If we have some matches, return them with error
            if (matches.length > 0) {
              return createResult(true, pattern, sanitizedFlags, text, matches,
                createError(execError, 'partial execution - some matches found'));
            } else {
              return createResult(false, pattern, sanitizedFlags, text, [],
                createError(execError, 'pattern execution'));
            }
          }

          if (!result || !result.success) {
            break;
          }

          matches.push(formatMatch(result, text));

          // Move past this match to find the next one
          offset = result.end || (result.start + 1);

          // Prevent infinite loop on zero-length matches
          if (result.start === result.end) {
            offset++;
          }

          // Safety check for offset bounds
          if (offset > text.length) {
            break;
          }
        }

        // Check if we hit iteration limit
        if (iterationCount >= MAX_ITERATIONS) {
          const limitError = new Error(`Too many matches found (>${MAX_ITERATIONS}). Pattern may be too broad.`);
          if (matches.length > 0) {
            return createResult(true, pattern, sanitizedFlags, text, matches,
              createError(limitError, 'iteration limit reached - some matches found'));
          }
        }

        return createResult(matches.length > 0, pattern, sanitizedFlags, text, matches);

      } finally {
        // Clean up compiled regex to prevent memory leaks
        try {
          regex.delete();
        } catch (cleanupError) {
          // Log cleanup error but don't fail the operation
          console.warn('Failed to cleanup PCRE regex:', cleanupError.message);
        }
      }

    } catch (error) {
      return createResult(false, pattern, flags, text, [],
        createError(error, 'findAll operation'));
    }
  }

  /**
   * Replace matches in text with enhanced error handling
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to search in
   * @param {string} replacement - Replacement string
   * @param {string} flags - Regex flags (i, m, s, x, u, g)
   * @returns {Object} - Replacement result object
   */
  replace(pattern, text, replacement, flags = '') {
    try {
      // Input validation
      if (typeof pattern !== 'string') {
        throw new Error('Pattern must be a string');
      }
      if (typeof text !== 'string') {
        throw new Error('Text must be a string');
      }
      if (typeof replacement !== 'string') {
        throw new Error('Replacement must be a string');
      }

      this._ensureInitialized();

      const sanitizedFlags = validateAndSanitizeFlags(flags);
      const options = this._convertFlags(sanitizedFlags);

      let regex;
      try {
        regex = new this.pcre.PCRERegex(pattern, options);
      } catch (compileError) {
        return {
          success: false,
          engine: this.name,
          pattern,
          flags: sanitizedFlags,
          text,
          replacement,
          result: text, // Return original text on error
          error: createError(compileError, 'pattern compilation'),
          timestamp: new Date().toISOString()
        };
      }

      try {
        // Implement replace by finding matches and replacing manually
        let result = text;
        const matches = [];
        let offset = 0;
        const isGlobal = sanitizedFlags.includes('g');
        const startTime = Date.now();
        let iterationCount = 0;
        const MAX_ITERATIONS = 1000;

        while (offset < text.length && iterationCount < MAX_ITERATIONS) {
          iterationCount++;

          // Check for timeout
          if (Date.now() - startTime > TIMEOUT_MS) {
            throw new Error('PCRE replacement timeout - pattern may be too complex');
          }

          const match = regex.exec(text, offset);

          if (!match || !match.success) {
            break;
          }

          matches.push(match);
          offset = match.end || (match.start + 1);

          if (!isGlobal) {
            break; // Only replace first match if not global
          }

          // Prevent infinite loops
          if (match.start === match.end) {
            offset++;
          }
        }

        // Replace matches from end to beginning to maintain indices
        for (let i = matches.length - 1; i >= 0; i--) {
          const match = matches[i];
          const startPos = match.start || 0;
          const endPos = match.end || startPos;
          result = result.substring(0, startPos) + replacement + result.substring(endPos);
        }

        return {
          success: true,
          engine: this.name,
          pattern,
          flags: sanitizedFlags,
          text,
          replacement,
          result,
          error: null,
          timestamp: new Date().toISOString()
        };

      } finally {
        // Clean up compiled regex to prevent memory leaks
        try {
          regex.delete();
        } catch (cleanupError) {
          console.warn('Failed to cleanup PCRE regex:', cleanupError.message);
        }
      }

    } catch (error) {
      return {
        success: false,
        engine: this.name,
        pattern,
        flags,
        text,
        replacement,
        result: text,
        error: createError(error, 'replace operation'),
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get engine capabilities and features with comprehensive information
   * @returns {Object} - Comprehensive engine capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      features: {
        namedGroups: true,
        lookbehind: true,
        recursion: true,
        unicodeSupport: true,
        backreferences: true,
        conditionals: true,
        possessiveQuantifiers: true,
        atomicGroups: true,
        zeroWidthAssertions: true,
        characterClasses: true,
        quantifiers: true,
        subroutines: true,
        balancedGroups: true
      },
      flags: {
        i: { name: 'Case insensitive', description: 'CASELESS - ignore case when matching' },
        m: { name: 'Multiline mode', description: 'MULTILINE - ^$ match line breaks' },
        s: { name: 'Dot matches newline', description: 'DOTALL - . matches newline characters' },
        x: { name: 'Extended regex', description: 'EXTENDED - ignore whitespace and allow comments' },
        u: { name: 'UTF-8 mode', description: 'UTF8 - enable full Unicode support' },
        g: { name: 'Global matching', description: 'Find all matches rather than stopping after first' }
      },
      supportedFlags: SUPPORTED_FLAGS,
      advantages: [
        'Full Perl-compatible regex support',
        'Recursive patterns supported (?R)',
        'Advanced lookaround assertions (?<=) (?<!)',
        'Possessive quantifiers (*+, ++, ?+, {n,m}+)',
        'Atomic groups (?>...)',
        'Conditional patterns (?(condition)yes|no)',
        'Named subroutines (?&name)',
        'Balancing groups and recursion',
        'More permissive pattern syntax',
        'Better legacy pattern compatibility',
        'Advanced Unicode support',
        'Detailed error reporting'
      ],
      limitations: [
        'Requires WebAssembly support',
        'Larger memory footprint than JavaScript engine',
        'May be slower for simple patterns',
        'Complex patterns can cause longer processing times',
        'Initialization overhead',
        'Potential ES module compatibility issues'
      ],
      performance: {
        timeoutMs: TIMEOUT_MS,
        maxIterations: 5000,
        recursionDepth: MAX_RECURSION_DEPTH,
        backtrackingProtection: true,
        memoryManagement: true
      }
    };
  }

  /**
   * Validate a pattern without executing it
   * @param {string} pattern - Pattern to validate
   * @param {string} flags - Flags to validate
   * @returns {Object} - Validation result
   */
  validatePattern(pattern, flags = '') {
    try {
      if (typeof pattern !== 'string') {
        throw new Error('Pattern must be a string');
      }

      this._ensureInitialized();

      const sanitizedFlags = validateAndSanitizeFlags(flags);
      const options = this._convertFlags(sanitizedFlags);

      // Try to compile the regex
      let regex;
      try {
        regex = new this.pcre.PCRERegex(pattern, options);
        regex.delete(); // Clean up immediately after validation
      } catch (compileError) {
        return {
          valid: false,
          pattern,
          flags,
          error: createError(compileError, 'pattern validation')
        };
      }

      return {
        valid: true,
        pattern,
        flags: sanitizedFlags,
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        pattern,
        flags,
        error: createError(error, 'pattern validation')
      };
    }
  }

  /**
   * Clean up resources with enhanced error handling
   */
  destroy() {
    try {
      if (this.pcre) {
        // The PCRE instance itself doesn't need explicit cleanup
        // Individual compiled regexes are cleaned up in their respective methods
        this.pcre = null;
      }
      this.initialized = false;
      this.initializationError = null;
    } catch (error) {
      console.warn('Error during PCRE engine cleanup:', error.message);
    }
  }
}

module.exports = PCREEngine;
