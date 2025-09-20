#!/usr/bin/env node

/**
 * Comprehensive RegexPlay Functionality Test
 * Tests all major components and features
 */

const path = require('path');
const fs = require('fs');
const RegexPlayApp = require('./src/app');
const SessionManager = require('./src/utils/sessionManager');

async function runComprehensiveTest() {
  console.log('🚀 Starting comprehensive RegexPlay functionality test...\n');

  let testsPassed = 0;
  let testsTotal = 0;

  function test(description, condition) {
    testsTotal++;
    if (condition) {
      console.log(`✅ ${description}`);
      testsPassed++;
    } else {
      console.log(`❌ ${description}`);
    }
  }

  try {
    // Test 1: App Initialization
    console.log('📋 Testing Application Initialization...');
    const app = new RegexPlayApp();
    await app.initialize();
    test('App initializes successfully', app.initialized);
    test('EngineFactory is available', !!app.engineFactory);
    test('JavaScript engine is available', app.engineFactory.getAvailableEngines().includes('javascript'));

    // Test 2: Engine Functionality
    console.log('\n🔧 Testing Engine Functionality...');
    const jsEngine = app.engineFactory.getEngine('javascript');
    test('JavaScript engine can be retrieved', !!jsEngine);

    const testResult = await jsEngine.test('\\d+', 'Test 123 numbers', 'g');
    test('JavaScript engine can execute regex', testResult.success);
    test('JavaScript engine finds matches', testResult.matches && testResult.matches.length > 0);

    // Test 3: Session Management
    console.log('\n💾 Testing Session Management...');
    const sessionManager = new SessionManager();

    const testSession = {
      pattern: '\\w+@\\w+\\.\\w+',
      flags: 'gi',
      text: 'Contact us at info@example.com or support@test.org',
      engine: 'javascript'
    };

    const savedPath = await sessionManager.saveSession(testSession, 'comprehensive-test');
    test('Session can be saved', !!savedPath);
    test('Session file exists', fs.existsSync(savedPath));

    const sessions = await sessionManager.listSessions();
    test('Sessions can be listed', sessions.length > 0);

    const loadedSession = await sessionManager.loadSession('comprehensive-test.json');
    test('Session can be loaded', !!loadedSession);
    test('Loaded session matches saved data', loadedSession.pattern === testSession.pattern);

    // Test 4: CLI Functionality
    console.log('\n⚡ Testing CLI Functionality...');

    // Test direct regex execution
    const cliApp = new RegexPlayApp({
      regex: '\\d+',
      text: 'Numbers 123 and 456',
      engine: 'javascript'
    });

    await cliApp.initialize();
    test('CLI app initializes with options', cliApp.initialized);

    // Test 5: TUI Components
    console.log('\n🖥️  Testing TUI Components...');
    const RegexPlayTUI = require('./src/ui/tui');
    const tui = new RegexPlayTUI(app.engineFactory);
    test('TUI can be instantiated', !!tui);
    test('TUI has engine factory reference', !!tui.engineFactory);

    // Test 6: Available Engines
    console.log('\n🚗 Testing Available Engines...');
    const availableEngines = app.engineFactory.getAllEngineNames(); // Use getAllEngineNames() to include aliases
    test('JavaScript engine is available', availableEngines.includes('javascript'));
    test('JS alias is available', availableEngines.includes('js'));

    // Note: PCRE is temporarily disabled
    console.log('\n⚠️  Note: PCRE engine is temporarily disabled due to ES module compatibility issues');

    // Clean up test session
    console.log('\n🧹 Cleaning up test files...');
    try {
      fs.unlinkSync(savedPath);
      test('Test session file cleaned up', !fs.existsSync(savedPath));
    } catch (error) {
      test('Test session file cleaned up', false);
    }

    // Final Results
    console.log('\n📊 Test Results Summary:');
    console.log(`Passed: ${testsPassed}/${testsTotal} tests`);

    if (testsPassed === testsTotal) {
      console.log('🎉 All tests passed! RegexPlay is fully functional.');
      console.log('\n🚀 Ready for use:');
      console.log('   • CLI: node cli.js --regex "\\d+" --text "test 123"');
      console.log('   • TUI: node cli.js (interactive mode)');
      console.log('   • Load session: node cli.js --load session-name.json');
      process.exit(0);
    } else {
      console.log(`❌ ${testsTotal - testsPassed} tests failed. Please review the issues above.`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Comprehensive test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

runComprehensiveTest();
