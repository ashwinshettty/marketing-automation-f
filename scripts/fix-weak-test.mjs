import fs from 'node:fs';
import path from 'node:path';

const targetTestFile = path.resolve('../marketing-automation-b/tests/adsAdaptiveCreativeValidation.test.js');

let content = fs.readFileSync(targetTestFile, 'utf8');

content = content.replace(
  "dialogue: 'Education is important. We provide comprehensive educational solutions for all subjects and standards. Contact us today to learn more.',",
  "dialogue: 'Education is important. We provide educational solutions for all standards. Contact us today.',"
);

content = content.replace(
  "dialogue: 'We provide comprehensive educational solutions for all subjects and standards.'",
  "dialogue: 'We provide educational solutions for all standards.'"
);

content = content.replace(
  "dialogue: 'Contact us today to learn more.'",
  "dialogue: 'Contact us today.'"
);

fs.writeFileSync(targetTestFile, content, 'utf8');
console.log('✓ Updated weakCopyPlan dialogue length in tests/adsAdaptiveCreativeValidation.test.js');
