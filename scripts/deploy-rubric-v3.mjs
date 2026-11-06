import fs from 'node:fs';

const vqPath = 'C:/Users/admin/Desktop/Harshika/marketing-automation-b/video/render/visualQualityRubric.js';
let vq = fs.readFileSync(vqPath, 'utf8');

const oldReturn = `  return {
    aggregateScore,
    dimensionScores: scores,
    passed: aggregateScore >= 8.0 && scores.clean_surfaces >= 8 && scores.text_artifact_risk >= 8,
    issues,
    offlineValidationOnly: true,
    note: 'Scores are based on prompt inspection only. Actual visual quality requires human review of the Seedance-generated video frames.',
  };`;

const newReturn = `  return {
    aggregateScore,
    dimensionScores: scores,
    passed: aggregateScore >= 8.0 && scores.clean_surfaces >= 8 && scores.text_artifact_risk >= 8,
    issues,
    offlineValidationOnly: true,
    note: 'Scores are based on prompt inspection only. Actual visual quality requires human review of the Seedance-generated video frames.',
    readiness: {
      level1_creativeBriefReadiness: {
        score: aggregateScore,
        passed: aggregateScore >= 8.0,
      },
      level2_productionReadiness: {
        score: scores.clean_surfaces >= 8 && scores.text_artifact_risk >= 8 ? 10 : 4,
        cleanSurfacesVerified: scores.clean_surfaces >= 8,
        textArtifactRiskClean: scores.text_artifact_risk >= 8,
        ctaHoldWindowSeconds: ctaHold,
      },
      level3_actualVideoQuality: {
        status: 'NOT_MEASURED',
        evaluationType: 'INDEPENDENT_HUMAN_REVIEW_REQUIRED',
        reason: 'Awaiting human review of actual generated video artifacts. Offline prompt rubric cannot measure rendered diffusion video quality.',
      },
    },
  };`;

if (vq.includes(oldReturn)) {
  vq = vq.replace(oldReturn, newReturn);
  fs.writeFileSync(vqPath, vq, 'utf8');
  console.log('✓ Successfully updated visualQualityRubric.js with readiness tiers');
} else {
  console.log('⏭ visualQualityRubric.js already updated');
}
