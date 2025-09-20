const SessionManager = require('./src/utils/sessionManager');

async function testSessionManager() {
  console.log('Testing Session Manager...');

  const sessionManager = new SessionManager();

  // Test save
  const testSession = {
    pattern: '\\d+',
    flags: 'g',
    text: 'Test 123 and 456 numbers',
    engine: 'javascript'
  };

  console.log('Saving test session...');
  const savedPath = await sessionManager.saveSession(testSession, 'test-session');
  console.log('✅ Saved to:', savedPath);

  // Test list
  console.log('\nListing sessions...');
  const sessions = await sessionManager.listSessions();
  console.log('Sessions found:', sessions);

  // Test load
  if (sessions.length > 0) {
    console.log('\nLoading first session...');
    const loaded = await sessionManager.loadSession(sessions[0]);
    console.log('✅ Loaded session:', loaded);

    // Test session info
    const info = await sessionManager.getSessionInfo(sessions[0]);
    console.log('✅ Session info:', info);
  }

  console.log('\n✅ Session manager test completed');
}

testSessionManager().catch(console.error);