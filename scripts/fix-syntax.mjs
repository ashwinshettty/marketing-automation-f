import fs from 'node:fs';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // replace unescaped child's in single quotes
  content = content.replaceAll("child's", "child\\'s");
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed child\\'s in ${filePath}`);
}

fixFile('C:/Users/admin/Desktop/Harshika/marketing-automation-b/tests/adsVideoQualityRegression.test.js');
fixFile('./scripts/deploy-ads-quality-hardening-v2.mjs');
