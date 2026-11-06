import fs from 'node:fs';
import path from 'node:path';

// 1. Update intentRouter.js
const irPath = path.resolve('../marketing-automation-b/video/intentRouter.js');
let irCode = fs.readFileSync(irPath, 'utf8');

const updatedExtractAudience = `export const extractAudience = (prompt, workflow) => {
  const text = normalize(prompt);

  // Check for parents with specific grade, age, or school level
  const parentWithGrade = text.match(/\\bparents?\\s+of\\s+([a-z0-9\\-]+(?:\\s+[a-z0-9\\-]+){0,3}\\s*(?:students?|graders?|kids|children|teens?|teenagers?|school\\s+students?|olds?))\\b/i);
  if (parentWithGrade) {
    let desc = parentWithGrade[1].trim();
    if (!/students?|graders?|kids|children/i.test(desc)) {
      desc = desc.replace(/olds?$/i, 'year-olds');
    }
    const description = ('parents of ' + desc).toLowerCase();
    return {
      audienceCategory: workflow === 'lesson' ? 'learners' : 'prospective_customers',
      audienceDescription: description,
      targetAudience: description,
    };
  }

  const targetParents = text.match(/\\btarget(?:ing)?\\s+parents?\\b/i);
  if (targetParents) {
    return {
      audienceCategory: 'prospective_customers',
      audienceDescription: 'parents',
      targetAudience: 'parents',
    };
  }

  // Check for specific grade, age, or student level in targeting
  const targetStudent = text.match(/\\b(?:targeting|aimed\\s+at)\\s+([a-z0-9\\-]+(?:\\s+[a-z0-9\\-]+){0,3}\\s*(?:students?|learners?|kids|children|beginners?|graders?))\\b/i)
    || text.match(/\\bfor\\s+(?!inkstall\\b)([a-z0-9\\-]+(?:\\s+[a-z0-9\\-]+){0,3}\\s*(?:students?|learners?|kids|children|beginners?|graders?))\\b/i)
    || text.match(/\\b([a-z0-9\\-]+(?:\\s+[a-z0-9\\-]+){0,2}\\s*(?:grade|class|standard)\\s+students?)\\b/i);

  if (targetStudent) {
    const description = targetStudent[1].toLowerCase().trim();
    return {
      audienceCategory: 'learners',
      audienceDescription: description,
      targetAudience: description,
    };
  }

  const customers = text.match(/\\b(?:for|to)\\s+(customers?|buyers?|prospects?|followers?)\\b/i);
  if (customers) {
    const description = customers[1].toLowerCase();
    return {
      audienceCategory: 'prospective_customers',
      audienceDescription: description,
      targetAudience: description,
    };
  }

  if (workflow === 'ads') {
    return {
      audienceCategory: 'prospective_customers',
      audienceDescription: 'prospective customers',
      targetAudience: 'prospective customers',
    };
  }
  if (workflow === 'lesson') {
    return {
      audienceCategory: 'learners',
      audienceDescription: 'learners',
      targetAudience: 'learners',
    };
  }

  return {
    audienceCategory: 'prospective_customers',
    audienceDescription: 'prospective customers',
    targetAudience: 'prospective customers',
  };
};`;

irCode = irCode.replace(/export const extractAudience = [\s\S]*?^};/m, updatedExtractAudience);
fs.writeFileSync(irPath, irCode, 'utf8');

// 2. Update creativeIntelligence.js to dynamically extract grade/age and tailor audience segments
const ciPath = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let ciCode = fs.readFileSync(ciPath, 'utf8');

const dynamicAudienceFunction = `export const extractGradeAndAge = (text = '') => {
  const norm = String(text || '').toLowerCase();
  const gradeMatch = norm.match(/\\b(?:(?:grade|class|standard)\\s*(\\d{1,2}(?:st|nd|rd|th)?)|(\\d{1,2}(?:st|nd|rd|th)?)\\s*(?:grade|class|standard|grader))\\b/i);
  const ageMatch = norm.match(/\\b(?:(?:age|aged)\\s*(\\d{1,2})|(\\d{1,2})(?:\\s*-\\s*|\\s+)year(?:\\s*-\\s*|\\s+)olds?)\\b/i);
  return {
    grade: gradeMatch ? (gradeMatch[1] || gradeMatch[2]) : null,
    age: ageMatch ? (ageMatch[1] || ageMatch[2]) : null,
  };
};

export const identifyAudienceSegment = ({ prompt = '', creativeBrief = {} } = {}) => {
  const combined = (prompt + ' ' + (creativeBrief.targetAudience || '') + ' ' + (creativeBrief.campaignObjective || '')).toLowerCase();
  const { grade, age } = extractGradeAndAge(combined);

  // Check parent perspective
  const isParent = /\\b(parent|mother|father|child|kid|marks|score|report card)\\b/i.test(combined);

  // Dynamic tailored audience label if grade or age is found
  let audienceLabel = null;
  if (grade) {
    audienceLabel = isParent ? \`Parents of \${grade} Grade Students\` : \`\${grade} Grade Students\`;
  } else if (age) {
    audienceLabel = isParent ? \`Parents of \${age}-Year-Old Students\` : \`\${age}-Year-Old Students\`;
  }

  if (isParent) {
    return {
      ...AUDIENCE_SEGMENTS.parents_academic_anxiety,
      label: audienceLabel || AUDIENCE_SEGMENTS.parents_academic_anxiety.label,
      targetGrade: grade || null,
      targetAge: age || null,
    };
  }

  if (/\\b(crowded|batch|coaching|sixty|tuition center|hesitant|raise hand)\\b/i.test(combined)) {
    return {
      ...AUDIENCE_SEGMENTS.crowded_coaching_frustration,
      label: audienceLabel || AUDIENCE_SEGMENTS.crowded_coaching_frustration.label,
      targetGrade: grade || null,
      targetAge: age || null,
    };
  }

  if (/\\b(chemistry|reactions?|equations?|physics|derivations?|formulas?|concepts?|algebra|math)\\b/i.test(combined) && /\\b(student|grade|class|standard|kid|learner)\\b/i.test(combined)) {
    return {
      ...AUDIENCE_SEGMENTS.students_stem_confusion,
      label: audienceLabel || (grade ? \`\${grade} Grade Students (Concept & STEM Clarity)\` : AUDIENCE_SEGMENTS.students_stem_confusion.label),
      targetGrade: grade || null,
      targetAge: age || null,
    };
  }

  if (/\\b(board|exam|finals|prelims|countdown|pressure|stress|panic)\\b/i.test(combined)) {
    return {
      ...AUDIENCE_SEGMENTS.exam_board_stress,
      label: audienceLabel || AUDIENCE_SEGMENTS.exam_board_stress.label,
      targetGrade: grade || null,
      targetAge: age || null,
    };
  }

  return {
    ...AUDIENCE_SEGMENTS.parents_academic_anxiety,
    label: audienceLabel || AUDIENCE_SEGMENTS.parents_academic_anxiety.label,
    targetGrade: grade || null,
    targetAge: age || null,
  };
};`;

ciCode = ciCode.replace(/export const identifyAudienceSegment = [\s\S]*?^};/m, dynamicAudienceFunction);
fs.writeFileSync(ciPath, ciCode, 'utf8');

console.log('Successfully deployed dynamic grade/age targeting in intentRouter and creativeIntelligence');
