#!/usr/bin/env node
/**
 * Advanced CLI Feature Tests
 * Validates JSON output, quiet mode, benchmarking stats, x-flag warning (PCRE unavailable),
 * session schema migration to 2.0.0, and alias policy retrieval.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const SessionManager = require('./src/utils/sessionManager');
const RegexPlayApp = require('./src/app');

let passed = 0;
let total = 0;
function test(desc, cond) {
  total++;
  if (cond) {
    console.log(`✅ ${desc}`);
    passed++;
  } else {
    console.log(`❌ ${desc}`);
  }
}

function runCLI(args, options = {}) {
  const result = spawnSync(process.execPath, ['cli.js', ...args], { encoding: 'utf8', ...options });
  return { code: result.status, stdout: result.stdout, stderr: result.stderr };
}

(async () => {
  try {
    console.log('🧪 Advanced CLI Feature Tests');

    // 1. JSON output structure
    const jsonRun = runCLI(['--mode','cli','--regex','(foo)(bar)?','--text','foobar food','--flags','g','--json','--benchmark=5']);
    test('JSON run exit code is 0', jsonRun.code === 0);
    let parsed;
      try { parsed = JSON.parse(jsonRun.stdout); } catch (e) {
        // Intentionally ignored: test will assert parsed presence separately
      }
    test('JSON parsed successfully', !!parsed);
    if (parsed) {
      test('JSON includes pattern', parsed.pattern === '(foo)(bar)?');
      test('JSON includes matches array', Array.isArray(parsed.matches));
      test('Benchmark stats present when benchmark enabled', !!parsed.benchmark && typeof parsed.benchmark.iterations === 'number');
    }

    // 2. Quiet mode suppresses normal output (expect empty or minimal stdout)
    const quietRun = runCLI(['--mode','cli','--regex','foo','--text','foo','--quiet']);
    test('Quiet mode exit code 0', quietRun.code === 0);
    test('Quiet mode stdout minimal', quietRun.stdout.trim().length === 0);

    // 3. Benchmark without JSON still prints stats (look for p95)
    const benchRun = runCLI(['--mode','cli','--regex','foo','--text','foo','--benchmark=3']);
    test('Benchmark exit code 0', benchRun.code === 0);
    test('Benchmark output contains p95', /p95/i.test(benchRun.stdout));

    // 4. x flag warning when PCRE unavailable (pattern compiled with x flag)
    const xFlagRun = runCLI(['--mode','cli','--regex','foo','--text','foo','--flags','x']);
    test('x flag run exit code 0', xFlagRun.code === 0);
    test('x flag warning present (stdout or stderr)', /x flag/i.test(xFlagRun.stdout) || /x flag/i.test(xFlagRun.stderr));

    // 5. Session migration (simulate legacy v1 session file missing schemaVersion)
    const legacyDir = path.join(process.cwd(), '.regexplay-sessions');
    if (!fs.existsSync(legacyDir)) fs.mkdirSync(legacyDir);
    const legacySessionPath = path.join(legacyDir, 'legacy-v1.json');
    fs.writeFileSync(legacySessionPath, JSON.stringify({
      pattern: 'foo',
      flags: 'g',
      text: 'foo bar',
      engine: 'javascript'
    }, null, 2));
    const loadLegacy = runCLI(['--load','legacy-v1.json','--mode','cli','--regex','foo','--text','foo']);
    test('Legacy session load exit code 0', loadLegacy.code === 0);

    const sessionManager = new SessionManager();
    const migrated = await sessionManager.loadSession('legacy-v1.json');
    test('Migration injected schemaVersion', migrated.schemaVersion === '2.0.0');

    // 6. Alias policy retrieval via app API
    const app = new RegexPlayApp({ mode:'cli', regex:'foo', text:'foo' });
    await app.initialize();
    const policy = app.getAliasPolicy && app.getAliasPolicy();
    test('Alias policy method returns object', policy && typeof policy === 'object');
    if (policy) {
      test('Alias policy has mapping', policy.mapping && typeof policy.mapping === 'object');
    }

    console.log('\n📊 Summary:');
    console.log(`Passed: ${passed}/${total}`);
    if (passed === total) {
      console.log('🎉 Advanced CLI tests passed.');
      process.exit(0);
    } else {
      console.log('❌ Some advanced CLI tests failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('💥 Advanced CLI tests crashed:', err.stack || err.message);
    process.exit(1);
  }
})();
