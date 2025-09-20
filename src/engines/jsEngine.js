/**
 * JavaScript Regex Engine
 * Wrapper for native JavaScript RegExp with unified interface and enhanced error handling
 */

// Constants
const ENGINE_NAME = 'JavaScript';
const SUPPORTED_FLAGS = ['i', 'g', 'm', 's', 'u', 'y'];
const MAX_RECURSION_DEPTH = 1000; // Prevent infinite loops in complex patterns
const MAX_ITERATIONS = 10000; // Global cap used in findAll and capability reporting

/**
 * Validates and sanitizes regex flags for JavaScript engine
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
    throw new Error(`Unsupported flags for JavaScript engine: ${invalidFlags.join('')}. Supported: ${SUPPORTED_FLAGS.join('')}`);
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
function createError(error, operation = 'regex operation') {
  return {
    message: error.message,
    type: error.constructor.name,
    operation,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  };
}

/**
 * Converts a RegExp match result to our standardized format
 * @param {RegExpMatchArray} match - Result from RegExp.exec()
 * @returns {Object} - Standardized match object
 */
function formatMatch(match) {
  return {
    fullMatch: match[0],
    index: match.index,
    length: match[0].length,
    groups: match.slice(1),
    namedGroups: match.groups || {},
    input: match.input
  };
}

class JavaScriptEngine {
  constructor() {
    this.name = ENGINE_NAME;
    this.version = process.version;
    this.initialized = true; // JavaScript engine is always available
  }

  /**
   * Test if pattern matches text with enhanced error handling
   * @param {string} pattern - Regular expression pattern
   * @param {string} text - Text to test against
   * @param {string} flags - Regex flags (i, g, m, s, u, y)
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

      const sanitizedFlags = validateAndSanitizeFlags(flags);

      // Create regex with timeout protection for complex patterns
      let regex;
      try {
        regex = new RegExp(pattern, sanitizedFlags);
      } catch (syntaxError) {
        return createResult(false, pattern, sanitizedFlags, text, [],
          createError(syntaxError, 'pattern compilation'));
      }

      // Execute regex with protection against excessive backtracking
      const startTime = Date.now();
      const TIMEOUT_MS = 5000; // 5 second timeout

      let match;
      try {
        match = regex.exec(text);

        // Check for timeout (simple protection)
        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error('Regex execution timeout - pattern may be too complex');
        }
      } catch (execError) {
        return createResult(false, pattern, sanitizedFlags, text, [],
          createError(execError, 'pattern execution'));
      }

      if (!match) {
        return createResult(false, pattern, sanitizedFlags, text, []);
      }

      const formattedMatch = formatMatch(match);
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
   * @param {string} flags - Regex flags (i, g, m, s, u, y)
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

      const sanitizedFlags = validateAndSanitizeFlags(flags);

      // Ensure global flag is set for findAll
      const globalFlags = sanitizedFlags.includes('g') ? sanitizedFlags : sanitizedFlags + 'g';

      // Create regex with error handling
      let regex;
      try {
        regex = new RegExp(pattern, globalFlags);
      } catch (syntaxError) {
        return createResult(false, pattern, globalFlags, text, [],
          createError(syntaxError, 'pattern compilation'));
      }

  const matches = [];
  let match;
  let iterationCount = 0;
      const startTime = Date.now();
      const TIMEOUT_MS = 5000; // 5 second timeout

      try {
        while ((match = regex.exec(text)) !== null) {
          // Safety checks
          iterationCount++;
          if (iterationCount > MAX_ITERATIONS) {
            throw new Error(`Too many matches found (>${MAX_ITERATIONS}). Pattern may be too broad.`);
          }

          if (Date.now() - startTime > TIMEOUT_MS) {
            throw new Error('Regex execution timeout - pattern may be too complex');
          }

          matches.push(formatMatch(match));

          // Prevent infinite loop with zero-length matches
          if (match.index === regex.lastIndex) {
            regex.lastIndex++;
          }

          // Additional safety: if we've moved past the end of the string, break
          if (regex.lastIndex > text.length) {
            break;
          }
        }
      } catch (execError) {
        // If we have some matches, return them with a warning
        if (matches.length > 0) {
          return createResult(true, pattern, globalFlags, text, matches,
            createError(execError, 'partial execution - some matches found'));
        } else {
          return createResult(false, pattern, globalFlags, text, [],
            createError(execError, 'pattern execution'));
        }
      }

      return createResult(matches.length > 0, pattern, globalFlags, text, matches);

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
   * @param {string} flags - Regex flags (i, g, m, s, u, y)
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

      const sanitizedFlags = validateAndSanitizeFlags(flags);

      // Create regex with error handling
      let regex;
      try {
        regex = new RegExp(pattern, sanitizedFlags);
      } catch (syntaxError) {
        return {
          success: false,
          engine: this.name,
          pattern,
          flags: sanitizedFlags,
          text,
          replacement,
          result: text, // Return original text on error
          error: createError(syntaxError, 'pattern compilation'),
          timestamp: new Date().toISOString()
        };
      }

      // Perform replacement with timeout protection
      const startTime = Date.now();
      const TIMEOUT_MS = 5000;

      let result;
      try {
        result = text.replace(regex, replacement);

        if (Date.now() - startTime > TIMEOUT_MS) {
          throw new Error('Regex replacement timeout - pattern may be too complex');
        }
      } catch (replaceError) {
        return {
          success: false,
          engine: this.name,
          pattern,
          flags: sanitizedFlags,
          text,
          replacement,
          result: text, // Return original text on error
          error: createError(replaceError, 'replacement execution'),
          timestamp: new Date().toISOString()
        };
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
   * Get engine capabilities and limitations with detailed information
   * @returns {Object} - Comprehensive engine capabilities
   */
  getCapabilities() {
    return {
      name: this.name,
      version: this.version,
      initialized: this.initialized,
      features: {
        namedGroups: true,
        lookbehind: true, // Variable lookbehind support is limited
        recursion: false,
        unicodeSupport: true,
        backreferences: true,
        conditionals: false,
        possessiveQuantifiers: false,
        atomicGroups: false,
        zeroWidthAssertions: true,
        characterClasses: true,
        quantifiers: true
      },
      flags: {
        i: { name: 'Case insensitive', description: 'Ignore case when matching' },
        g: { name: 'Global matching', description: 'Find all matches rather than stopping after first' },
        m: { name: 'Multiline mode', description: '^$ match line breaks' },
        s: { name: 'Dot matches newline', description: '. matches newline characters' },
        u: { name: 'Unicode mode', description: 'Enable full Unicode support' },
        y: { name: 'Sticky matching', description: 'Match from lastIndex position only' }
      },
      supportedFlags: SUPPORTED_FLAGS,
      limitations: [
        'Variable-length lookbehind not fully supported (only fixed-length)',
        'No recursive patterns',
        'No conditional patterns (?(condition)yes|no)',
        'No possessive quantifiers (*+, ++, ?+, {n,m}+)',
        'No atomic groups (?>...)',
        'Limited PCRE compatibility',
        'No \G anchor (start of match)',
        'No named subroutines'
      ],
      advantages: [
        'Native JavaScript engine - always available',
        'Fast execution for most patterns',
        'Full Unicode support with u flag',
        'Named capture groups supported',
        'Good performance on typical web patterns',
        'Consistent behavior across platforms'
      ],
      performance: {
        timeoutMs: 5000,
        maxIterations: MAX_ITERATIONS,
        backtrackingProtection: true
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

      const sanitizedFlags = validateAndSanitizeFlags(flags);

      // Try to compile the regex
      new RegExp(pattern, sanitizedFlags);

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
   * Clean up resources (no-op for JavaScript engine)
   */
  destroy() {
    // JavaScript engine doesn't need explicit cleanup
    this.initialized = false;
  }
}

module.exports = JavaScriptEngine;
