import fs from 'node:fs';
import path from 'node:path';

const filePath = path.resolve('../marketing-automation-b/video/ads/creativeIntelligence.js');
let code = fs.readFileSync(filePath, 'utf8');

const target = `  // 1. Humor / Comic Turn / Student Relatable Frustration
  if (tones.includes('funny') || tones.includes('playful') || /\\b(funny|humor|joke|hate|hating|laugh|sarcas|comic)\\b/i.test(text)) {
    return {
      id: 'relatable_humor',
      name: 'Relatable Humor',
      description: 'Playful student perspective on difficult topics with comic turn and quick payoff.',
      visualFocus: 'Comic student struggle or self-deprecating study moment transitioning to cheerful clarity.',
      pacing: 'Comic setup (0-2s) -> Humorous realization (2-5s) -> Confident CTA (5-8s).',
      narrativeStructure: 'HUMOR_RELIEF',
    };
  }

  // 2. Product Demonstration / Visual Demonstration / Conceptual Clarity
  if (tones.includes('educational') || /\\b(show|how|makes?|demonstrat|easier|visual|whiteboard|understand|mechanism|explain|diagram)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.product_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }

  // 3. Misconception / Rote memorization
  if (/\\b(memoriz|rote|cram|forget|fade)/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.misconception_correction,
      narrativeStructure: 'UNEXPECTED_REVEAL',
    };
  }

  // 4. Batch vs 1-on-1 Contrast
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.before_after_contrast,
      narrativeStructure: 'VISUAL_CONTRAST',
    };
  }

  // 5. Emotional Relief / Board Pressure
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.emotional_relief,
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
    };
  }

  // 6. Direct Value Prop / Doubt clearing
  if (/\\b(countdown|score|target|doubt)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.specific_differentiator,
      narrativeStructure: 'DIRECT_VALUE_PROP',
    };
  }

  return {
    ...CREATIVE_ANGLES.problem_recognition,
    narrativeStructure: 'EMOTIONAL_PROGRESSION',
  };`;

const replacement = `  // 1. Humor / Comic Turn / Student Relatable Frustration
  if (tones.includes('funny') || tones.includes('playful') || /\\b(funny|humor|joke|hate|hating|laugh|sarcas|comic)\\b/i.test(text)) {
    return {
      id: 'relatable_humor',
      name: 'Relatable Humor',
      description: 'Playful student perspective on difficult topics with comic turn and quick payoff.',
      visualFocus: 'Comic student struggle or self-deprecating study moment transitioning to cheerful clarity.',
      pacing: 'Comic setup (0-2s) -> Humorous realization (2-5s) -> Confident CTA (5-8s).',
      narrativeStructure: 'HUMOR_RELIEF',
    };
  }

  // 2. Educational / Chemical reaction / Formula transformation
  if (tones.includes('educational') || /\\b(reaction|equation|puzzle|chemical)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.unexpected_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }

  // 3. Misconception / Rote memorization
  if (/\\b(memoriz|rote|cram|forget|fade)/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.misconception_correction,
      narrativeStructure: 'UNEXPECTED_REVEAL',
    };
  }

  // 4. Batch vs 1-on-1 Contrast
  if (/\\b(crowded|batch|60|personal|1-on-1|individual)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.before_after_contrast,
      narrativeStructure: 'VISUAL_CONTRAST',
    };
  }

  // 5. Product Demonstration / Conceptual Clarity
  if (/\\b(demo|interactive|live tutor|easier|makes?|demonstrat|visual|whiteboard|understand)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.product_demonstration,
      narrativeStructure: 'PRODUCT_DEMONSTRATION',
    };
  }

  // 6. Emotional Relief / Board Pressure
  if (tones.includes('cinematic') || /\\b(pressure|exam|board|anxiety|stress)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.emotional_relief,
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
    };
  }

  // 7. Direct Value Prop / Doubt clearing
  if (/\\b(countdown|score|target|doubt)\\b/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.specific_differentiator,
      narrativeStructure: 'DIRECT_VALUE_PROP',
    };
  }

  return {
    ...CREATIVE_ANGLES.problem_recognition,
    narrativeStructure: 'EMOTIONAL_PROGRESSION',
  };`;

if (!code.includes(target)) {
  console.error('Target not found in creativeIntelligence.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Fixed selectCreativeAngle order.');
