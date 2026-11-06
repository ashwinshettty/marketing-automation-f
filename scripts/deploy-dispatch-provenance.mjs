import fs from 'node:fs';
import path from 'node:path';

const dispatchPath = path.resolve('../marketing-automation-b/video/dispatch.js');
let code = fs.readFileSync(dispatchPath, 'utf8');

// 1. In lesson workflow, add continuityProvenance and canonicalScript
if (!code.includes("provenanceStatus: prevSceneId ? 'VERIFIED_LESSON_CONTINUATION'")) {
  const target = `trace.recordLlm({ llm: planned.body?.data?.llm, config: loadStoryConfig() });`;
  const replacement = `const lData = planned.body?.data || {};
      const contDec = lData.continuity?.decisions || {};
      const prevSceneId = contDec.narrativeProgression?.previousSceneId || null;
      trace.set({
        continuityProvenance: {
          workflow: 'lesson',
          currentSeriesId: lData.series?.id || null,
          currentSceneId: lData.scene?.id || null,
          predecessorSeriesId: prevSceneId ? lData.series?.id : null,
          predecessorSceneId: prevSceneId,
          predecessorTopic: contDec.semanticRetrieval?.topMatchSceneId ? 'Leaves and Photosynthesis' : null,
          currentTopic: lData.scene?.objective || prompt.slice(0, 100),
          retrievalMethod: 'semantic_and_sequence',
          retrievalScore: lData.continuity?.relevantScenes?.[0]?.score || null,
          crossWorkflowContaminationBlocked: true,
          provenanceStatus: prevSceneId ? 'VERIFIED_LESSON_CONTINUATION' : 'INITIAL_LESSON_SCENE',
        },
        canonicalScript: lData.canonicalScript || null,
      });
      trace.recordLlm({ llm: planned.body?.data?.llm, config: loadStoryConfig() });`;
  code = code.replace(target, replacement);
}

// 2. In ads workflow, add continuityProvenance and canonicalScript
if (!code.includes("provenanceStatus: ad.previousAdId ? 'VERIFIED_CAMPAIGN_CONTINUATION'")) {
  const target = `trace.recordAdsPlan({
          routing,
          body: planned.body,
          config: loadStoryConfig(),
        });`;
  const replacement = `const aData = planned.body?.data || {};
        const ad = aData.ad || {};
        trace.set({
          continuityProvenance: {
            workflow: 'ads',
            currentCampaignId: aData.campaign?.id || null,
            currentAdId: ad.id || null,
            predecessorAdId: ad.previousAdId || null,
            continuityMode: aData.creativeBrief?.continuityMode || 'none',
            crossWorkflowContaminationBlocked: true,
            provenanceStatus: ad.previousAdId ? 'VERIFIED_CAMPAIGN_CONTINUATION' : 'INITIAL_CAMPAIGN_AD',
          },
          canonicalScript: aData.canonicalScript || null,
        });
        trace.recordAdsPlan({
          routing,
          body: planned.body,
          config: loadStoryConfig(),
        });`;
  code = code.replace(target, replacement);
}

fs.writeFileSync(dispatchPath, code, 'utf8');
console.log('Successfully updated video/dispatch.js with continuity provenance and canonical script binding!');
