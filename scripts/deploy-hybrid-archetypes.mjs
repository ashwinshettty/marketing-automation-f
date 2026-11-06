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
  }`;

const replacement = `  // 1. Humor & Hybrid Humorous Demonstration
  if (tones.includes('funny') || tones.includes('playful') || /\\b(funny|humor|joke|hate|hating|laugh|sarcas|comic)\\b/i.test(text)) {
    if (/\\b(demonstrat|show\\s+how|whiteboard|mechanism|solves?)\\b/i.test(text)) {
      return {
        id: 'humorous_demonstration',
        name: 'Humorous Product Demonstration',
        description: 'Comic student struggle or skepticism resolved through an intuitive visual whiteboard demonstration.',
        visualFocus: 'Comic student confusion transitioning to clear interactive whiteboard breakthrough.',
        pacing: 'Comic setup (0-2s) -> Visual whiteboard reveal (2-5.5s) -> Confident CTA (5.5-8.0s).',
        narrativeStructure: 'PRODUCT_DEMONSTRATION',
      };
    }
    return {
      id: 'relatable_humor',
      name: 'Relatable Humor',
      description: 'Playful student perspective on difficult topics with comic turn and quick payoff.',
      visualFocus: 'Comic student struggle or self-deprecating study moment transitioning to cheerful clarity.',
      pacing: 'Comic setup (0-2s) -> Humorous realization (2-5s) -> Confident CTA (5-8s).',
      narrativeStructure: 'HUMOR_RELIEF',
    };
  }

  // 1b. Parent-focused academic concern & exam anxiety
  if (/\\b(parent|mother|father|mom|dad|family|daughter|son)\\b/i.test(text) && /\\b(worry|worried|anxious|anxiety|stress|falling\\s+behind|marks|grade|struggl)/i.test(text)) {
    return {
      ...CREATIVE_ANGLES.emotional_relief,
      narrativeStructure: 'EMOTIONAL_PROGRESSION',
    };
  }`;

if (!code.includes(target)) {
  console.error('Target not found in creativeIntelligence.js');
  process.exit(1);
}

code = code.replace(target, replacement);
fs.writeFileSync(filePath, code, 'utf8');
console.log('Successfully added hybrid humorous demonstration and parent-concern routing to selectCreativeAngle.');
