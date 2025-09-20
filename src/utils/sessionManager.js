/**
 * RegexPlay Session Management
 * Save and load regex testing sessions with validation and safety features
 */

const fs = require('fs').promises;
const path = require('path');

// Constants
// Session schema versioning. Increment when structure changes in a non-backwards compatible way.
const SESSION_VERSION = '2.0.0';
const SESSION_FILE_EXTENSION = '.json';
const MAX_FILENAME_LENGTH = 255;
const MAX_SESSION_SIZE = 10 * 1024 * 1024; // 10MB limit

// Error messages
const ERRORS = {
  INVALID_SESSION: 'Invalid session data format',
  FILENAME_TOO_LONG: `Filename too long (max ${MAX_FILENAME_LENGTH} characters)`,
  SESSION_TOO_LARGE: `Session file too large (max ${MAX_SESSION_SIZE / 1024 / 1024}MB)`,
  INVALID_FILENAME: 'Invalid filename characters',
  FILE_NOT_FOUND: 'Session file not found',
  PERMISSION_DENIED: 'Permission denied accessing session file',
  CORRUPTED_SESSION: 'Session file appears to be corrupted'
};

/**
 * Validates session data structure
 * @param {Object} session - Session data to validate
 * @returns {boolean} - True if valid
 * @throws {Error} - If session data is invalid
 */
function validateSessionData(session) {
  if (!session || typeof session !== 'object') {
    throw new Error(ERRORS.INVALID_SESSION);
  }

  // Required fields validation
  const requiredFields = ['pattern'];
  const optionalFields = ['flags', 'text', 'engine', 'timestamp', 'version', 'schemaVersion', 'description', 'tags'];

  for (const field of requiredFields) {
    if (session[field] === undefined || session[field] === null) {
      throw new Error(`Session missing required field: ${field}`);
    }
  }

  // Type validation
  if (typeof session.pattern !== 'string') {
    throw new Error('Session pattern must be a string');
  }

  if (session.flags !== undefined && typeof session.flags !== 'string') {
    throw new Error('Session flags must be a string');
  }

  if (session.text !== undefined && typeof session.text !== 'string') {
    throw new Error('Session text must be a string');
  }

  if (session.engine !== undefined && typeof session.engine !== 'string') {
    throw new Error('Session engine must be a string');
  }

  if (session.description !== undefined && typeof session.description !== 'string') {
    throw new Error('Session description must be a string');
  }

  if (session.tags !== undefined) {
    if (!Array.isArray(session.tags) || !session.tags.every(t => typeof t === 'string')) {
      throw new Error('Session tags must be an array of strings');
    }
  }

  return true;
}

/**
 * Sanitizes filename for cross-platform compatibility
 * @param {string} filename - Original filename
 * @returns {string} - Sanitized filename
 * @throws {Error} - If filename is invalid
 */
function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Filename must be a non-empty string');
  }

  // Remove or replace invalid characters
  const sanitized = filename
    .trim()
    .replace(/[<>:"|?*\x00-\x1f]/g, '_') // Replace invalid chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .replace(/\s+/g, '_'); // Replace spaces with underscores

  if (sanitized.length === 0) {
    throw new Error(ERRORS.INVALID_FILENAME);
  }

  if (sanitized.length > MAX_FILENAME_LENGTH) {
    throw new Error(ERRORS.FILENAME_TOO_LONG);
  }

  return sanitized;
}

/**
 * Generates a unique timestamp-based filename
 * @param {string} prefix - Optional prefix for filename
 * @returns {string} - Generated filename
 */
function generateTimestampFilename(prefix = 'regexplay') {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${sanitizeFilename(prefix)}-${timestamp}${SESSION_FILE_EXTENSION}`;
}

class SessionManager {
  constructor(sessionDir = null) {
    this.sessionDir = sessionDir || path.join(process.cwd(), '.regexplay-sessions');
  }

  /**
   * Ensure session directory exists with proper error handling
   * @private
   */
  async ensureSessionDir() {
    try {
      await fs.access(this.sessionDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        try {
          await fs.mkdir(this.sessionDir, { recursive: true });
        } catch (mkdirError) {
          if (mkdirError.code === 'EACCES') {
            throw new Error(ERRORS.PERMISSION_DENIED);
          }
          throw mkdirError;
        }
      } else if (error.code === 'EACCES') {
        throw new Error(ERRORS.PERMISSION_DENIED);
      } else {
        throw error;
      }
    }
  }

  /**
   * Save a session to file with comprehensive validation
   * @param {Object} session - Session data
   * @param {string} filename - Optional filename (will generate if not provided)
   * @returns {Promise<string>} - Path to saved file
   * @throws {Error} - If save fails
   */
  async saveSession(session, filename = null) {
    // Validate session data
    validateSessionData(session);

    await this.ensureSessionDir();

    // Generate filename if not provided
    if (!filename) {
      filename = generateTimestampFilename();
    } else {
      filename = sanitizeFilename(filename);

      // Ensure .json extension
      if (!filename.endsWith(SESSION_FILE_EXTENSION)) {
        filename += SESSION_FILE_EXTENSION;
      }
    }

    // Prepare session data with metadata
    const sessionData = {
      ...session,
      timestamp: new Date().toISOString(),
      version: SESSION_VERSION, // legacy field retained for backward compat display
      schemaVersion: SESSION_VERSION,
      savedBy: 'RegexPlay'
    };

    // Convert to JSON and check size
    const jsonData = JSON.stringify(sessionData, null, 2);
    if (jsonData.length > MAX_SESSION_SIZE) {
      throw new Error(ERRORS.SESSION_TOO_LARGE);
    }

    const filePath = path.join(this.sessionDir, filename);

    try {
      await fs.writeFile(filePath, jsonData, { encoding: 'utf8', mode: 0o644 });
      return filePath;
    } catch (error) {
      if (error.code === 'EACCES') {
        throw new Error(ERRORS.PERMISSION_DENIED);
      }
      throw error;
    }
  }

  /**
   * Load a session from file with validation
   * @param {string} filename - Session filename
   * @returns {Promise<Object>} - Session data
   * @throws {Error} - If load fails
   */
  async loadSession(filename) {
    await this.ensureSessionDir();

    let filePath;

    // Determine file path
    if (path.isAbsolute(filename)) {
      filePath = filename;
    } else {
      // Look in session directory first
      filePath = path.join(this.sessionDir, filename);

      // Check if file exists, otherwise try current directory
      try {
        await fs.access(filePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          filePath = path.resolve(filename);
        } else {
          throw error;
        }
      }
    }

    try {
      // Check file size before reading
      const stats = await fs.stat(filePath);
      if (stats.size > MAX_SESSION_SIZE) {
        throw new Error(ERRORS.SESSION_TOO_LARGE);
      }

      const data = await fs.readFile(filePath, 'utf8');

      let sessionData;
      try {
        sessionData = JSON.parse(data);
      } catch (parseError) {
        throw new Error(ERRORS.CORRUPTED_SESSION);
      }

      // Migration handling: add schemaVersion if missing
      if (!sessionData.schemaVersion) {
        // Migration: assign current schema version while preserving original version if present
        const previous = sessionData.version || '1.0.0';
        sessionData.previousSchemaVersion = previous !== SESSION_VERSION ? previous : undefined;
        sessionData.schemaVersion = SESSION_VERSION;
      }

      validateSessionData(sessionData);

      return sessionData;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(ERRORS.FILE_NOT_FOUND);
      } else if (error.code === 'EACCES') {
        throw new Error(ERRORS.PERMISSION_DENIED);
      }
      throw error;
    }
  }

  /**
   * List available sessions with error handling
   * @returns {Promise<Array>} - Array of session filenames
   */
  async listSessions() {
    try {
      await this.ensureSessionDir();
      const files = await fs.readdir(this.sessionDir);

      // Filter for JSON files and sort by modification time (newest first)
      const sessionFiles = [];

      for (const file of files) {
        if (file.endsWith(SESSION_FILE_EXTENSION)) {
          try {
            const filePath = path.join(this.sessionDir, file);
            const stats = await fs.stat(filePath);
            sessionFiles.push({
              name: file,
              mtime: stats.mtime
            });
          } catch (error) {
            // Skip files we can't access
            continue;
          }
        }
      }

      // Sort by modification time, newest first
      sessionFiles.sort((a, b) => b.mtime - a.mtime);

      return sessionFiles.map(f => f.name);
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'EACCES') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Delete a session with safety checks
   * @param {string} filename - Session filename
   * @returns {Promise<void>}
   * @throws {Error} - If deletion fails
   */
  async deleteSession(filename) {
    await this.ensureSessionDir();

    const sanitizedFilename = sanitizeFilename(filename);
    const filePath = path.join(this.sessionDir, sanitizedFilename);

    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(ERRORS.FILE_NOT_FOUND);
      } else if (error.code === 'EACCES') {
        throw new Error(ERRORS.PERMISSION_DENIED);
      }
      throw error;
    }
  }

  /**
   * Get session info without loading full content
   * @param {string} filename - Session filename
   * @returns {Promise<Object>} - Session metadata
   * @throws {Error} - If info retrieval fails
   */
  async getSessionInfo(filename) {
    try {
      const session = await this.loadSession(filename);

      return {
        filename,
        timestamp: session.timestamp,
        pattern: session.pattern || 'No pattern',
        engine: session.engine || 'unknown',
        flags: session.flags || '',
        preview: session.text ?
          (session.text.length > 50 ? session.text.slice(0, 50) + '...' : session.text) :
          'No text',
        version: session.version || 'unknown',
        schemaVersion: session.schemaVersion || session.version || 'unknown',
        description: session.description || '',
        tags: session.tags || []
      };
    } catch (error) {
      // Return error info instead of throwing
      return {
        filename,
        timestamp: 'Unknown',
        pattern: 'Error loading',
        engine: 'Unknown',
        flags: '',
        preview: `Error: ${error.message}`,
        version: 'unknown',
        schemaVersion: 'unknown',
        error: true
      };
    }
  }

  /**
   * Create a backup of the entire sessions directory
   * @returns {Promise<string>} - Path to backup file
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(process.cwd(), `regexplay-sessions-backup-${timestamp}.tar`);

    // This would require additional implementation with tar/zip libraries
    // For now, just create a simple JSON backup of all sessions
    const sessions = await this.listSessions();
    const backup = {};

    for (const sessionFile of sessions) {
      try {
        backup[sessionFile] = await this.loadSession(sessionFile);
      } catch (error) {
        backup[sessionFile] = { error: error.message };
      }
    }

    const backupData = JSON.stringify(backup, null, 2);
    await fs.writeFile(backupPath.replace('.tar', '.json'), backupData);

    return backupPath.replace('.tar', '.json');
  }
}

module.exports = SessionManager;
