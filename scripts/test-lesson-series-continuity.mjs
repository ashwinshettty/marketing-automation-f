import fs from 'node:fs';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2I3Yjg3ZmMwYTA4N2ZmY2RhZTVmZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzkzNTk0NzM5LCJleHAiOjE3OTM2ODExMzl9.IEeeT-Xhb4MwJKcDbOL6wr7WfWcgZGBGn6InorUEIZA';
const baseUrl = 'http://127.0.0.1:3000';

async function step1CreateSeries() {
  console.log('Step 1: Creating Inkstall Biology Series...');
  const seriesPayload = {
    title: 'Inkstall Biology Series: Plant Life and Growth',
    premise: 'A friendly Indian English tutor teaches school biology in a bright classroom.',
    genre: 'educational',
    objective: 'Teach core biology concepts clearly to school students.',
    character: {
      appearance: 'Friendly adult Indian science tutor in her early 30s, warm medium-brown skin, and a round approachable face.',
      faceRules: 'Dark brown eyes, gentle eyebrows, and a calm encouraging smile.',
      hairRules: 'Neat dark hair combed and tied back neatly, professional and clean.',
      clothingRules: 'Smart teal top with clean silhouette and dark trousers.',
      personality: 'Friendly, patient, encouraging, and articulate.',
      speakingStyle: 'Clear natural Indian English delivery, steady teaching pace, one clear concept at a time.',
      environmentPreferences: 'Bright modern science classroom with a whiteboard, laboratory posters, and soft natural lighting.',
      visualStyle: 'Realistic classroom lighting, medium framing, warm natural educational colors.',
      voiceDescription: 'Warm, clear Indian English accent, friendly and articulate teaching delivery.',
    },
  };

  const res = await fetch(`${baseUrl}/api/story/series`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(seriesPayload),
  });

  const body = await res.json();
  console.log('Create series response:', res.status, body.success);
  if (!body.success) {
    throw new Error(`Failed to create series: ${JSON.stringify(body)}`);
  }
  return body.data.series;
}

async function step2PlanFirstScene(seriesId) {
  console.log(`Step 2: Planning first lesson scene (Leaves & Photosynthesis) in series ${seriesId}...`);
  const planPayload = {
    seriesId,
    prompt: 'In this biology lesson, the tutor introduces leaves and photosynthesis, explaining how leaves help plants prepare food.',
    durationSeconds: 8,
    lessonTitle: 'Plant Biology: Leaves and Food Production',
  };

  const res = await fetch(`${baseUrl}/api/video/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-correlation-id': `lesson-scene1-${Date.now()}`,
    },
    body: JSON.stringify(planPayload),
  });

  const body = await res.json();
  console.log('Scene 1 plan response:', res.status, body.success, body.code || 'OK');
  if (!body.success) {
    console.error('Scene 1 planning error:', JSON.stringify(body, null, 2));
    throw new Error('Scene 1 planning failed');
  }
  return body.data;
}

async function step3PlanContinuityScene(seriesId) {
  console.log(`Step 3: Planning Prompt 2 continuity scene in series ${seriesId}...`);
  const prompt2 = `Continue the educational story with the exact same tutor character from the previous video.

The tutor is continuing the same biology lesson. She now explains how fruits develop from flowers and protect seeds.

At the beginning, naturally connect this topic to the previous lesson about leaves and photosynthesis. Include a brief reference equivalent to:

“Previously, we learnt how leaves help plants prepare food.”

Continue with a friendly, clear Indian English teaching style.

Preserve the same tutor's identity, face, clothing, hairstyle, voice, classroom, lighting, teaching personality and visual style.

Do not mention the time of day or suggest that this is a different teaching session.

Do not introduce a new tutor.

Create an approximately 8-second video.`;

  const payload = {
    seriesId,
    prompt: prompt2,
    continueStoryline: true,
    durationSeconds: 8,
    aspectRatio: '9:16',
  };

  const res = await fetch(`${baseUrl}/api/video/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-correlation-id': `lesson-continuity-${Date.now()}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await res.json();
  console.log('Prompt 2 continuity plan response:', res.status, body.success, body.code || 'OK');
  return body;
}

async function main() {
  const series = await step1CreateSeries();
  console.log(`Series created: ID=${series.id}, activeCharacterId=${series.activeCharacterId}`);

  const scene1Data = await step2PlanFirstScene(series.id);
  console.log('Scene 1 planned successfully! Scene ID:', scene1Data.scene?.id || scene1Data.manifest?.sceneId);

  const scene2Data = await step3PlanContinuityScene(series.id);
  console.log('Scene 2 continuity result:\n', JSON.stringify(scene2Data, null, 2));

  fs.writeFileSync('scripts/continuity-test-output.json', JSON.stringify(scene2Data, null, 2), 'utf8');
}

main().catch(console.error);
