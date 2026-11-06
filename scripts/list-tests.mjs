import fs from 'node:fs';

const content = fs.readFileSync('../marketing-automation-b/tests/video/orchestration.test.js', 'utf8');
const lines = content.split('\n');
for (const line of lines) {
  if (line.includes("test('") || line.includes('test("')) {
    console.log(line.trim());
  }
}
