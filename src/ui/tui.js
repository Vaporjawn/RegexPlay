/**
 * RegexPlay Interactive TUI Interface
 * Real-time regex testing with live match highlighting and performance optimization
 */

const blessed = require('blessed');
const SessionManager = require('../utils/sessionManager');

// Constants
const DEBOUNCE_DELAY = 150; // Debounce delay for real-time updates
const MAX_DISPLAY_MATCHES = 50; // Limit displayed matches for performance
const HELP_CONTENT_CACHE = Symbol('helpContentCache');
const UI_THEMES = {
  default: {
    header: { fg: 'white', bg: 'blue' },
    border: { fg: 'blue' },
    input: { fg: 'white', bg: 'black', border: { fg: 'green' } },
    focus: { border: { fg: 'cyan' } },
    results: { fg: 'white', bg: 'black', border: { fg: 'blue' } },
    status: { fg: 'white', bg: 'blue' },
    label: { fg: 'yellow' }
  }
};

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Escape text for blessed tags
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeText(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

class RegexPlayTUI {
  constructor(engineFactory) {
    this.engineFactory = engineFactory;
    this.sessionManager = new SessionManager();
    this.currentEngine = 'javascript';
    this.screen = null;
    this.widgets = {};
    this.activeWidget = 'pattern';

    // State management
    this.state = {
      pattern: '',
      text: '',
      flags: '',
      lastResults: null,
      isProcessing: false
    };

    // Performance optimization
    this.debouncedUpdateMatches = debounce(this.updateMatches.bind(this), DEBOUNCE_DELAY);
    this.theme = UI_THEMES.default;

    // Cache for computed values
    this[HELP_CONTENT_CACHE] = null;
  }

  /**
   * Initialize and start the TUI with error handling
   * @returns {Promise<void>}
   */
  async start() {
    try {
      this.createScreen();
      this.createWidgets();
      this.bindEvents();
      this.updateStatus();
      this.screen.render();

      // Focus on pattern input initially
      this.widgets.patternInput.focus();
    } catch (error) {
      console.error('Failed to start TUI:', error);
      process.exit(1);
    }
  }

  /**
   * Create the main screen with enhanced configuration
   * @private
   */
  createScreen() {
    this.screen = blessed.screen({
      smartCSR: true,
      title: 'RegexPlay - Interactive Regex Playground',
      fullUnicode: true,
      dockBorders: true,
      ignoreLocked: ['C-c'] // Ensure Ctrl+C always works
    });

    // Global key bindings with error handling
    this.screen.key(['escape', 'q', 'C-c'], () => {
      this.cleanup();
      process.exit(0);
    });

    this.screen.key(['f1'], () => {
      this.showHelp();
    });

    // Handle screen resize
    this.screen.on('resize', () => {
      this.handleResize();
    });

    // Error handling for screen events
    this.screen.on('error', (error) => {
      console.error('Screen error:', error);
    });
  }

  /**
   * Create all UI widgets with improved styling and organization
   * @private
   */
  createWidgets() {
    this.createHeaderWidgets();
    this.createInputWidgets();
    this.createResultWidgets();
    this.createStatusWidgets();

    // Add all widgets to screen
    Object.values(this.widgets).forEach(widget => {
      this.screen.append(widget);
    });
  }

  /**
   * Create header widgets
   * @private
   */
  createHeaderWidgets() {
    this.widgets.header = blessed.box({
      top: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: ' RegexPlay - Interactive Regex Playground',
      tags: true,
      border: { type: 'line' },
      style: {
        ...this.theme.header,
        border: this.theme.border
      }
    });
  }

  /**
   * Create input widgets with enhanced styling
   * @private
   */
  createInputWidgets() {
    // Pattern input section
    this.widgets.patternLabel = blessed.box({
      top: 3,
      left: 0,
      width: '100%',
      height: 1,
      content: ' Pattern (F2 to switch engines, Tab to switch input):',
      style: this.theme.label
    });

    this.widgets.patternInput = blessed.textbox({
      top: 4,
      left: 0,
      width: '70%',
      height: 3,
      border: { type: 'line' },
      style: {
        ...this.theme.input,
        focus: this.theme.focus
      },
      inputOnFocus: true,
      keys: true,
      mouse: true
    });

    // Flags input
    this.widgets.flagsLabel = blessed.box({
      top: 3,
      left: '70%',
      width: '30%',
      height: 1,
      content: ' Flags (g,i,m,s,u,x):',
      style: this.theme.label
    });

    this.widgets.flagsInput = blessed.textbox({
      top: 4,
      left: '70%',
      width: '30%',
      height: 3,
      border: { type: 'line' },
      style: {
        ...this.theme.input,
        focus: this.theme.focus
      },
      inputOnFocus: true,
      keys: true,
      mouse: true
    });

    // Text input section
    this.widgets.textLabel = blessed.box({
      top: 7,
      left: 0,
      width: '100%',
      height: 1,
      content: ' Test Text:',
      style: this.theme.label
    });

    this.widgets.textInput = blessed.textarea({
      top: 8,
      left: 0,
      width: '100%',
      height: 8,
      border: { type: 'line' },
      style: {
        ...this.theme.input,
        focus: this.theme.focus
      },
      inputOnFocus: true,
      keys: true,
      mouse: true,
      scrollable: true,
      alwaysScroll: true
    });
  }

  /**
   * Create result widgets
   * @private
   */
  createResultWidgets() {
    this.widgets.resultsLabel = blessed.box({
      top: 16,
      left: 0,
      width: '100%',
      height: 1,
      content: ' Results:',
      style: this.theme.label
    });

    this.widgets.results = blessed.box({
      top: 17,
      left: 0,
      width: '100%',
      height: '100%-20',
      border: { type: 'line' },
      style: this.theme.results,
      scrollable: true,
      alwaysScroll: true,
      keys: true,
      mouse: true,
      tags: true
    });
  }

  /**
   * Create status widgets
   * @private
   */
  createStatusWidgets() {
    this.widgets.status = blessed.box({
      bottom: 0,
      left: 0,
      width: '100%',
      height: 3,
      content: '',
      tags: true,
      border: { type: 'line' },
      style: {
        ...this.theme.status,
        border: this.theme.border
      }
    });
  }

  /**
   * Bind event handlers with performance optimization
   * @private
   */
  bindEvents() {
    this.bindNavigationEvents();
    this.bindInputEvents();
    this.bindSessionEvents();
  }

  /**
   * Bind navigation and global events
   * @private
   */
  bindNavigationEvents() {
    // Tab key to switch between inputs
    this.screen.key(['tab'], () => {
      this.switchInput();
    });

    // F2 to switch engines
    this.screen.key(['f2'], () => {
      this.switchEngine();
    });
  }

  /**
   * Bind input events with debouncing
   * @private
   */
  bindInputEvents() {
    // Pattern input events
    this.widgets.patternInput.on('submit', () => {
      this.updateStateFromInput('pattern');
      this.updateMatches();
    });

    this.widgets.patternInput.key(['enter'], () => {
      this.updateStateFromInput('pattern');
      this.updateMatches();
    });

    // Real-time pattern updates with debouncing
    this.widgets.patternInput.on('keypress', () => {
      setTimeout(() => {
        this.updateStateFromInput('pattern');
        this.debouncedUpdateMatches();
      }, 10); // Small immediate delay to get the value
    });

    // Flags input events
    this.widgets.flagsInput.on('submit', () => {
      this.updateStateFromInput('flags');
      this.updateMatches();
    });

    this.widgets.flagsInput.on('keypress', () => {
      setTimeout(() => {
        this.updateStateFromInput('flags');
        this.debouncedUpdateMatches();
      }, 10);
    });

    // Text input events
    this.widgets.textInput.on('submit', () => {
      this.updateStateFromInput('text');
      this.updateMatches();
    });

    this.widgets.textInput.on('keypress', () => {
      setTimeout(() => {
        this.updateStateFromInput('text');
        this.debouncedUpdateMatches();
      }, 10);
    });
  }

  /**
   * Bind session management events
   * @private
   */
  bindSessionEvents() {
    // Ctrl+S to save
    this.screen.key(['C-s'], () => {
      this.saveSession();
    });

    // Ctrl+L to load
    this.screen.key(['C-l'], () => {
      this.loadSession();
    });
  }

  /**
   * Update state from input widgets
   * @param {string} field - Field to update (pattern, flags, text)
   * @private
   */
  updateStateFromInput(field) {
    switch (field) {
      case 'pattern':
        this.state.pattern = this.widgets.patternInput.getValue() || '';
        break;
      case 'flags':
        this.state.flags = this.widgets.flagsInput.getValue() || '';
        break;
      case 'text':
        this.state.text = this.widgets.textInput.getValue() || '';
        break;
    }
  }

  /**
   * Switch input focus between pattern, flags, and text with visual feedback
   * @private
   */
  switchInput() {
    const inputs = ['pattern', 'flags', 'text'];
    const currentIndex = inputs.indexOf(this.activeWidget);
    const nextIndex = (currentIndex + 1) % inputs.length;
    this.activeWidget = inputs[nextIndex];

    const widgetMap = {
      pattern: this.widgets.patternInput,
      flags: this.widgets.flagsInput,
      text: this.widgets.textInput
    };

    const widget = widgetMap[this.activeWidget];
    if (widget) {
      widget.focus();
      this.updateStatus();
      this.screen.render();
    }
  }

  /**
   * Switch between available regex engines with validation
   * @private
   */
  switchEngine() {
    try {
      const engines = this.engineFactory.getAvailableEngines()
        .filter(name => !['js', 'perl'].includes(name)); // Skip aliases

      if (engines.length <= 1) {
        this.showTemporaryMessage('Only one engine available', 'yellow');
        return;
      }

      const currentIndex = engines.indexOf(this.currentEngine);
      const nextIndex = (currentIndex + 1) % engines.length;
      this.currentEngine = engines[nextIndex];

      this.updateStatus();
      this.updateMatches();
    } catch (error) {
      this.showTemporaryMessage(`Error switching engine: ${error.message}`, 'red');
    }
  }

  /**
   * Update match results in real-time with performance optimization
   * @private
   */
  async updateMatches() {
    // Prevent concurrent updates
    if (this.state.isProcessing) {
      return;
    }

    if (!this.state.pattern || !this.state.text) {
      this.widgets.results.setContent('Enter a pattern and test text to see matches...');
      this.screen.render();
      return;
    }

    this.state.isProcessing = true;
    this.showProcessingIndicator();

    try {
      // Use findAll for global flag, otherwise use test
      const useGlobal = this.state.flags.includes('g');
      const result = useGlobal
        ? await this.engineFactory.findAll(this.currentEngine, this.state.pattern, this.state.text, this.state.flags)
        : await this.engineFactory.test(this.currentEngine, this.state.pattern, this.state.text, this.state.flags);

      this.state.lastResults = result;
      this.displayResults(result);
    } catch (error) {
      this.widgets.results.setContent(`{red-fg}Error: ${escapeText(error.message)}{/red-fg}`);
    } finally {
      this.state.isProcessing = false;
      this.hideProcessingIndicator();
      this.screen.render();
    }
  }

  /**
   * Display match results with highlighting and performance optimization
   * @param {Object} result - Match result from engine
   * @private
   */
  displayResults(result) {
    if (result.error) {
      this.widgets.results.setContent(
        `{red-fg}${escapeText(result.error.type || 'Error')}: ${escapeText(result.error.message)}{/red-fg}`
      );
      return;
    }

    if (!result.success || result.matches.length === 0) {
      this.widgets.results.setContent('{yellow-fg}No matches found{/yellow-fg}');
      return;
    }

    // Limit displayed matches for performance
    const displayMatches = result.matches.slice(0, MAX_DISPLAY_MATCHES);
    const hasMoreMatches = result.matches.length > MAX_DISPLAY_MATCHES;

    let content = `{green-fg}✅ Found ${result.matches.length} match(es)`;
    if (hasMoreMatches) {
      content += ` (showing first ${MAX_DISPLAY_MATCHES})`;
    }
    content += ':{/green-fg}\n\n';

    // Display highlighted text with matches
    content += this.highlightMatches(this.state.text, displayMatches);
    content += '\n\n';

    // Display detailed match information
    displayMatches.forEach((match, index) => {
      content += this.formatMatchDetails(match, index);
    });

    if (hasMoreMatches) {
      content += `\n{yellow-fg}... and ${result.matches.length - MAX_DISPLAY_MATCHES} more matches{/yellow-fg}`;
    }

    this.widgets.results.setContent(content);
  }

  /**
   * Format detailed match information
   * @param {Object} match - Match object
   * @param {number} index - Match index
   * @returns {string} - Formatted match details
   * @private
   */
  formatMatchDetails(match, index) {
    let content = `{cyan-fg}Match ${index + 1}:{/cyan-fg}\n`;
    content += `  Full match: "{bold}${escapeText(match.fullMatch)}{/bold}"\n`;
    content += `  Position: ${match.index}-${match.index + match.length - 1}\n`;
    content += `  Length: ${match.length}\n`;

    if (match.groups && match.groups.length > 0) {
      content += `  Groups:\n`;
      match.groups.forEach((group, groupIndex) => {
        if (group !== undefined) {
          content += `    $${groupIndex + 1}: "{yellow-fg}${escapeText(group)}{/yellow-fg}"\n`;
        }
      });
    }

    if (match.namedGroups && Object.keys(match.namedGroups).length > 0) {
      content += `  Named groups:\n`;
      for (const [name, value] of Object.entries(match.namedGroups)) {
        content += `    ${escapeText(name)}: "{yellow-fg}${escapeText(value)}{/yellow-fg}"\n`;
      }
    }

    content += '\n';
    return content;
  }

  /**
   * Highlight matches in text with performance optimization
   * @param {string} text - Original text
   * @param {Array} matches - Array of match objects
   * @returns {string} - Text with highlighted matches
   * @private
   */
  highlightMatches(text, matches) {
    if (!matches || matches.length === 0) return escapeText(text);

    // Limit text length for performance
    const maxTextLength = 2000;
    const displayText = text.length > maxTextLength
      ? text.slice(0, maxTextLength) + '...'
      : text;

    let highlighted = '';
    let lastIndex = 0;

    // Sort matches by position and filter those within display range
    const sortedMatches = [...matches]
      .filter(match => match.index < maxTextLength)
      .sort((a, b) => a.index - b.index);

    for (const match of sortedMatches) {
      // Adjust for text truncation
      const matchStart = Math.min(match.index, displayText.length);
      const matchEnd = Math.min(match.index + match.length, displayText.length);

      // Add text before match
      highlighted += escapeText(displayText.slice(lastIndex, matchStart));

      // Add highlighted match
      highlighted += `{inverse}${escapeText(displayText.slice(matchStart, matchEnd))}{/inverse}`;

      lastIndex = matchEnd;
    }

    // Add remaining text
    highlighted += escapeText(displayText.slice(lastIndex));

    return `Text with highlights:\n{gray-fg}${highlighted}{/gray-fg}`;
  }

  /**
   * Update status bar with current state
   * @private
   */
  updateStatus() {
    try {
      const engineInfo = this.engineFactory.getEngineInfo()
        .find(info => info.name.toLowerCase() === this.currentEngine.toLowerCase());

      const activeIndicator = this.activeWidget ? `Active: ${this.activeWidget}` : '';

      const content = ` Engine: {cyan-fg}${this.currentEngine}{/cyan-fg} | ${activeIndicator} | ` +
                     `Tab: Switch Input | F2: Switch Engine | Ctrl+S: Save | Ctrl+L: Load | F1: Help | Esc: Exit`;

      this.widgets.status.setContent(content);
    } catch (error) {
      this.widgets.status.setContent(` Error updating status: ${error.message}`);
    }
  }

  /**
   * Show processing indicator
   * @private
   */
  showProcessingIndicator() {
    this.widgets.resultsLabel.setContent(' Results: {yellow-fg}Processing...{/yellow-fg}');
  }

  /**
   * Hide processing indicator
   * @private
   */
  hideProcessingIndicator() {
    this.widgets.resultsLabel.setContent(' Results:');
  }

  /**
   * Show temporary status message
   * @param {string} message - Message to show
   * @param {string} color - Color for the message
   * @private
   */
  showTemporaryMessage(message, color = 'green') {
    const originalContent = this.widgets.status.getContent();
    this.widgets.status.setContent(` {${color}-fg}${escapeText(message)}{/${color}-fg}`);
    this.screen.render();

    setTimeout(() => {
      this.widgets.status.setContent(originalContent);
      this.screen.render();
    }, 3000);
  }

  /**
   * Show help dialog with cached content
   * @private
   */
  showHelp() {
    if (!this[HELP_CONTENT_CACHE]) {
      this[HELP_CONTENT_CACHE] = this.generateHelpContent();
    }

    const helpBox = blessed.box({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '80%',
      content: this[HELP_CONTENT_CACHE],
      tags: true,
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'cyan' }
      },
      scrollable: true,
      alwaysScroll: true,
      keys: true
    });

    this.screen.append(helpBox);
    helpBox.focus();

    helpBox.key(['escape', 'enter', 'space'], () => {
      this.screen.remove(helpBox);
      this.widgets.patternInput.focus();
      this.screen.render();
    });

    this.screen.render();
  }

  /**
   * Generate help content
   * @returns {string} - Help content
   * @private
   */
  generateHelpContent() {
    return `
{bold}{cyan-fg}RegexPlay Interactive Help{/cyan-fg}{/bold}

{yellow-fg}Keyboard Shortcuts:{/yellow-fg}
  Tab         - Switch between pattern, flags, and text input
  F2          - Switch regex engine
  Ctrl+S      - Save current session
  Ctrl+L      - Load session
  F1          - Show this help
  Esc/Ctrl+C  - Exit

{yellow-fg}Usage:{/yellow-fg}
• Enter a regex pattern in the top field
• Optionally add flags (g, i, m, s, u, x) in the flags field
• Enter test text in the large text area
• Matches will be highlighted in real-time
• Detailed match information appears in the results panel

{yellow-fg}Performance Features:{/yellow-fg}
• Real-time updates with debouncing for smooth typing
• Automatic limiting of displayed matches for large result sets
• Text truncation for very long inputs
• Processing indicators for complex operations

{yellow-fg}Available Engines:{/yellow-fg}
${this.engineFactory.getEngineInfo().map(info =>
  `• ${info.name} (aliases: ${info.aliases.join(', ')})`
).join('\n')}

Press any key to close this help...
`;
  }

  /**
   * Handle screen resize events
   * @private
   */
  handleResize() {
    // Force re-render on resize
    this.screen.render();
  }

  /**
   * Save current session to file with enhanced error handling
   * @private
   */
  async saveSession() {
    const session = {
      pattern: this.state.pattern,
      flags: this.state.flags,
      text: this.state.text,
      engine: this.currentEngine,
      timestamp: new Date().toISOString()
    };

    try {
      const filePath = await this.sessionManager.saveSession(session);
      const filename = require('path').basename(filePath);

      this.showTemporaryMessage(`✅ Session saved to ${filename}`, 'green');
    } catch (error) {
      this.showTemporaryMessage(`❌ Error saving session: ${error.message}`, 'red');
    }
  }

  /**
   * Load session from file with enhanced UI
   * @private
   */
  async loadSession() {
    try {
      const sessions = await this.sessionManager.listSessions();

      if (sessions.length === 0) {
        this.showTemporaryMessage('No saved sessions found', 'yellow');
        return;
      }

      await this.showSessionDialog(sessions);
    } catch (error) {
      this.showTemporaryMessage(`❌ Error loading sessions: ${error.message}`, 'red');
    }
  }

  /**
   * Show session selection dialog with enhanced display
   * @param {Array} sessions - List of session filenames
   * @private
   */
  async showSessionDialog(sessions) {
    const sessionInfo = [];

    // Get session info for display
    for (const session of sessions) {
      try {
        const info = await this.sessionManager.getSessionInfo(session);
        sessionInfo.push(info);
      } catch (error) {
        sessionInfo.push({
          filename: session,
          timestamp: 'Unknown',
          pattern: 'Error loading',
          engine: 'Unknown',
          preview: 'Could not load session'
        });
      }
    }

    // Create list dialog
    const list = blessed.list({
      top: 'center',
      left: 'center',
      width: '80%',
      height: '60%',
      border: { type: 'line' },
      style: {
        fg: 'white',
        bg: 'black',
        border: { fg: 'cyan' },
        selected: { bg: 'blue' }
      },
      keys: true,
      vi: true,
      items: sessionInfo.map(info => {
        const pattern = truncateText(info.pattern || 'No pattern', 30);
        const timestamp = info.timestamp || 'Unknown';
        return `${info.filename} - ${pattern} (${info.engine}) - ${timestamp}`;
      }),
      label: ' Load Session (Enter to select, Esc to cancel) '
    });

    this.screen.append(list);
    list.focus();

    return new Promise((resolve) => {
      list.key(['escape', 'q'], () => {
        this.screen.remove(list);
        this.widgets.patternInput.focus();
        this.screen.render();
        resolve();
      });

      list.key(['enter'], async () => {
        const selectedIndex = list.selected;
        if (selectedIndex >= 0 && selectedIndex < sessionInfo.length) {
          await this.loadSessionFromInfo(sessionInfo[selectedIndex]);
        }

        this.screen.remove(list);
        this.widgets.patternInput.focus();
        this.screen.render();
        resolve();
      });

      this.screen.render();
    });
  }

  /**
   * Load session from session info
   * @param {Object} sessionInfo - Session information
   * @private
   */
  async loadSessionFromInfo(sessionInfo) {
    try {
      const session = await this.sessionManager.loadSession(sessionInfo.filename);

      // Update state
      this.state.pattern = session.pattern || '';
      this.state.flags = session.flags || '';
      this.state.text = session.text || '';
      this.currentEngine = session.engine || 'javascript';

      // Update UI widgets
      this.widgets.patternInput.setValue(this.state.pattern);
      this.widgets.flagsInput.setValue(this.state.flags);
      this.widgets.textInput.setValue(this.state.text);

      this.updateStatus();
      this.updateMatches();

      this.showTemporaryMessage(`✅ Loaded session: ${sessionInfo.filename}`, 'green');

    } catch (error) {
      this.showTemporaryMessage(`❌ Error loading session: ${error.message}`, 'red');
    }
  }

  /**
   * Clean up resources with comprehensive cleanup
   * @private
   */
  cleanup() {
    try {
      // Clear any pending timeouts
      if (this.debouncedUpdateMatches) {
        this.debouncedUpdateMatches.cancel?.();
      }

      // Clear cache
      this[HELP_CONTENT_CACHE] = null;

      // Clear state
      this.state.isProcessing = false;
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  /**
   * Clean up resources and destroy screen
   */
  destroy() {
    this.cleanup();

    if (this.screen) {
      this.screen.destroy();
      this.screen = null;
    }
  }
}

module.exports = RegexPlayTUI;
