const assert = require('assert');
const path = require('path');
const fs = require('fs');
const RegexPlayApp = require('../src/app');

(async () => {
  // Prepare a temporary file for file test
  const tmpFile = path.join(__dirname, 'tmp-test-file.txt');
  fs.writeFileSync(tmpFile, 'File Number 987\nSecond line');

  const app = new RegexPlayApp({ mode: 'cli', debug: false });
  await app.initialize();

  // runDirectTest without global flag
  const single = await app.runDirectTest('Number', 'File Number 987');
  assert(single.success === true, 'Expected a match for pattern Number');
  assert(single.matches[0].fullMatch === 'Number');

  // runDirectTest with global flag triggering findAll
  const all = await app.runDirectTest('\n', 'A\nB\nC', 'g');
  assert(all.success === true, 'Expected newline matches');
  assert(all.matches.length === 2, 'Expected two newline matches');

  // runFileTest reading file content
  // Use escaped digit pattern to correctly match numbers in the file
  const fileRes = await app.runFileTest(tmpFile, '\\d+', 'g');
  assert(fileRes.success === true, 'Expected digits found in file');
  assert(fileRes.matches.length === 1, 'Expected one numeric match');
  assert(fileRes.matches[0].fullMatch === '987');

  // Display result should not throw
  app.displayResult(single, false);
  app.displayResult(all, true);

  fs.unlinkSync(tmpFile);
  console.log('test-app-cli.js passed');
})();
