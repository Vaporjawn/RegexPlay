// Programmatic entry point for RegexPlay
// Provides access to the main application class so consumers can embed or extend functionality.
// Example:
//   const RegexPlayApp = require('regexplay');
//   const app = new RegexPlayApp({ mode: 'cli', regex: 'foo', text: 'foobar' });
//   await app.initialize();
//   const result = await app.runCLI();

const RegexPlayApp = require('./src/app');

module.exports = RegexPlayApp;
