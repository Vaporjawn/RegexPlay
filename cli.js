#!/usr/bin/env node

/**
 * RegexPlay - Command-line regex playground
 * Real-time regex testing with multiple engines
 */

const RegexPlayApp = require('./src/app');
const { parseArgs, getHelpText } = require('./src/utils/argParser');

async function main() {
  try {
    const args = parseArgs(process.argv.slice(2));

    if (args.help) {
      console.log(getHelpText());
      return process.exit(0);
    }

    // Auto mode: if user supplied regex or load, prefer cli, otherwise tui
    let mode = args.mode;
    if (!mode || mode === 'tui' || mode === 'cli') {
      // Respect explicit selection; else decide below
    }
    // We haven't introduced 'auto' exposed yet but treat unspecified logic here
    if (!mode) {
      mode = (args.regex || args.load || args.file || args.text) ? 'cli' : 'tui';
    }

    const appOptions = { ...args, mode };
    const app = new RegexPlayApp(appOptions);

    try {
      await app.initialize();
      if (mode === 'tui') {
        await app.run();
        return;
      }

      const result = await app.runCLI();
      // If JSON flag requested, serialize structured result
      if (args.json && result) {
        try {
          console.log(JSON.stringify(result, null, 2));
        } catch (e) {
          console.error('Failed to serialize JSON output:', e.message);
        }
      }

      // Determine exit code:
      // 0 -> success (match found OR no-match treated as logical result when allowNoMatch?)
      // For regex tools, a "no match" is often non-error; keep previous behavior: success flag true => 0, else 1.
      // If internal error occurred earlier runError block will return 2.
      if (!result) {
        return process.exit(0); // summary only
      }
      if (result.success) {
        return process.exit(0);
      }
      return process.exit(1);
    } catch (runError) {
      if (args.debug) {
        console.error('Debug stack:', runError.stack);
      }
      return process.exit(2);
    }
  } catch (error) {
    console.error('Error starting RegexPlay:', error.message);
    process.exit(1);
  }
}

main();
