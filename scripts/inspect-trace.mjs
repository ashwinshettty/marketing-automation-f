import fs from 'node:fs';

const tracePath = '../marketing-automation-b/evals/seedance-local/run-traces/run-2026-11-02T04-43-47-814Z.json';
const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'));

console.log('correlationId:', trace.correlationId);
console.log('selectedWorkflow:', trace.selectedWorkflow);
console.log('routing:', trace.routing);
console.log('storyOrCampaign:', trace.storyOrCampaign);
console.log('llmOptimizedPromptForSeedance:\n', trace.llmOptimizedPromptForSeedance);
console.log('resultRefs:', trace.resultRefs);
console.log('steps count:', trace.steps?.length);
console.log('llmInvocations count:', trace.llmInvocations?.length);
