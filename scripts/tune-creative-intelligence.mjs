import fs from 'node:fs';
import path from 'node:path';

const bVideoAdsDir = path.resolve('../marketing-automation-b/video/ads');
const ciPath = path.join(bVideoAdsDir, 'creativeIntelligence.js');
let ciCode = fs.readFileSync(ciPath, 'utf8');

// 1. In identifyAudienceSegment, check parents first if parent/child is mentioned
const updatedAudienceFunc = `export const identifyAudienceSegment = ({ prompt = '', creativeBrief = {} } = {}) => {
  const combined = (prompt + ' ' + (creativeBrief.targetAudience || '') + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  if (/\\b(parent|mother|father|child|kid|marks|score|report card|math)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.parents_academic_anxiety;
  }
  if (/\\b(crowded|batch|coaching|sixty|tuition center|hesitant|raise hand)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.crowded_coaching_frustration;
  }
  if (/\\b(chemistry|reactions?|equations?|physics|derivations?|formulas?|concepts?)\\b/i.test(combined) && /\\b(student|10th|12th|grade|class)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.students_stem_confusion;
  }
  if (/\\b(board|exam|finals|prelims|countdown|pressure|stress|panic)\\b/i.test(combined)) {
    return AUDIENCE_SEGMENTS.exam_board_stress;
  }

  return AUDIENCE_SEGMENTS.parents_academic_anxiety;
};`;

ciCode = ciCode.replace(/export const identifyAudienceSegment = [\s\S]*?^};/m, updatedAudienceFunc);

// 2. In selectCreativeAngle, check memorization/misconception before general formula/concepts
const updatedAngleFunc = `export const selectCreativeAngle = ({ prompt = '', creativeBrief = {}, audienceSegment = null } = {}) => {
  const tones = Array.isArray(creativeBrief.tone) ? creativeBrief.tone : [];
  const text = (prompt + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();

  if (/\\b(memoriz|rote|cram|forget|fades?)\\b/i.test(text)) {
    return CREATIVE_ANGLES.misconception_correction;
  }
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return CREATIVE_ANGLES.before_after_contrast;
  }
  if (tones.includes('educational') || /\\b(concept|visual|whiteboard|understand|reaction|equation)\\b/i.test(text)) {
    return CREATIVE_ANGLES.unexpected_demonstration;
  }
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return CREATIVE_ANGLES.emotional_relief;
  }
  if (/\\b(demo|interactive|live tutor)\\b/i.test(text)) {
    return CREATIVE_ANGLES.product_demonstration;
  }

  return CREATIVE_ANGLES.problem_recognition;
};`;

ciCode = ciCode.replace(/export const selectCreativeAngle = [\s\S]*?^};/m, updatedAngleFunc);

fs.writeFileSync(ciPath, ciCode, 'utf8');
console.log('Successfully refined identifyAudienceSegment and selectCreativeAngle');
