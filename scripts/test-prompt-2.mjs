import fs from 'node:fs';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhM2I3Yjg3ZmMwYTA4N2ZmY2RhZTVmZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzkzNTk0NzM5LCJleHAiOjE3OTM2ODExMzl9.IEeeT-Xhb4MwJKcDbOL6wr7WfWcgZGBGn6InorUEIZA';

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
  prompt: prompt2,
  durationSeconds: 8,
  aspectRatio: '9:16',
};

console.log('Sending Prompt 2 to POST /api/video/requests...');

const res = await fetch('http://127.0.0.1:3000/api/video/requests', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'x-correlation-id': `continuity-test-${Date.now()}`,
  },
  body: JSON.stringify(payload),
});

const body = await res.json();
console.log('Response HTTP status:', res.status);
console.log('Response body:', JSON.stringify(body, null, 2));

fs.writeFileSync('scripts/prompt2-response.json', JSON.stringify({ status: res.status, body }, null, 2), 'utf8');
