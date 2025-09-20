const RegexPlayTUI = require('./src/ui/tui');
const EngineFactory = require('./src/engines/engineFactory');

async function testHighlighting() {
  console.log('Testing match highlighting system...');

  // Create engine factory and TUI
  const engineFactory = new EngineFactory();
  await engineFactory.initialize();

  const tui = new RegexPlayTUI(engineFactory);

  // Test the highlighting function directly
  const testText = "Contact us at info@example.com or support@test.org for help";
  const testMatches = [
    {
      fullMatch: "info@example.com",
      index: 14,
      length: 16,
      groups: ["info", "example.com"],
      namedGroups: {}
    },
    {
      fullMatch: "support@test.org",
      index: 34,
      length: 16,
      groups: ["support", "test.org"],
      namedGroups: {}
    }
  ];

  console.log('Original text:');
  console.log(testText);
  console.log('\nHighlighted text:');

  const highlighted = tui.highlightMatches(testText, testMatches);
  console.log(highlighted);

  console.log('\n✅ Highlighting test completed');
}

testHighlighting().catch(console.error);