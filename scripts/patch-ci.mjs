import fs from 'node:fs';

function patch(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(
    /\{\s*pattern:\s*\/\\d\+%\s*\\\(\?:success\|pass\|marks\?\|score\|students\?\|results\?\\\)\/i,\s*label:\s*'Fabricated success statistic'\s*\}/,
    "{ pattern: /\\d+%\\s*(?:of\\s+)?(?:all\\s+|our\\s+)?(?:students?|success|pass|marks?|score|results?|improvement)/i, label: 'Fabricated success statistic' }"
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${filePath}`);
}

patch('C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/ads/creativeIntelligence.js');
patch('./scripts/deploy-ads-quality-hardening-v2.mjs');
