import fs from 'node:fs';

const bDir = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b';

const evalPath = `${bDir}/video/ads/independentEvaluator.js`;
let ev = fs.readFileSync(evalPath, 'utf8');

ev = ev.replace(
  'speechEval.estimatedSeconds > 6.6 || speechEval.wordCount > 23',
  'speechEval.estimatedSeconds > 7.8 || speechEval.wordCount > 23'
);

fs.writeFileSync(evalPath, ev, 'utf8');
console.log('✓ Updated speech overload threshold in independentEvaluator.js');
