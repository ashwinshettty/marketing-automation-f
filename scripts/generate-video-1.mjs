import fs from 'node:fs';
import path from 'node:path';

// Load .env
const envPath = path.resolve('../marketing-automation-b/.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const apiKey = process.env.SEEDANCE_API_KEY;
if (!apiKey) {
  console.error('ERROR: SEEDANCE_API_KEY is not defined in .env');
  process.exit(1);
}

const baseUrl = 'https://ark.ap-southeast.bytepluses.com/api/v3';
const model = 'dreamina-seedance-2-5-260628';

// Candidate prompt from the ads planner run-2026-11-02T04-43-47-814Z
const plannedAdPrompt = `Create an 8-second 9:16 vertical video advertisement for Inkstall tutoring.
Talent: Friendly Indian English-speaking tutor in her early 30s with warm medium-brown skin, neat dark hair, wearing a smart teal top and dark trousers.
Setting: Bright modern school science classroom with soft natural lighting, a clean whiteboard, and laboratory posters in the background.
Scene flow:
0-2s Hook: A concerned parent watches their school student struggling with science homework at a desk. The friendly Indian tutor enters with a calm, reassuring smile.
2-4s Action & Aha Moment: In the bright classroom, the tutor stands at the whiteboard explaining a science concept clearly. The student experiences an instant 'aha' moment, smiling as understanding clicks.
4-6s Product: Clean demonstration of the Inkstall live tutoring platform showing interactive whiteboard learning.
6-8s CTA: The tutor smiles warmly and speaks in clear, natural Indian English: "Science confusing your child? Inkstall live tutoring builds real understanding. Book your free demo today!" Clean end card displays: "Book a Free Demo on Inkstall".
Style: Cinematic, photorealistic lighting, natural human motion, warm educational atmosphere, modest and truthful claims.`;

console.log('=== SEEDANCE VIDEO GENERATION #1: INKSTALL AD ===');
console.log('Model:', model);
console.log('Base URL:', baseUrl);
console.log('Prompt length:', plannedAdPrompt.length);
console.log('API Key length:', apiKey.length);

async function run() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Submitting generation task...`);

  const taskPayload = {
    model: model,
    content: [
      {
        type: 'text',
        text: plannedAdPrompt,
      },
    ],
  };

  const createRes = await fetch(`${baseUrl}/contents/generations/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskPayload),
  });

  const createJson = await createRes.json();
  console.log('Create response status:', createRes.status);
  console.log('Create response body:', JSON.stringify(createJson, null, 2));

  if (!createRes.ok || !createJson.id) {
    console.error('Task creation failed!');
    process.exit(1);
  }

  const taskId = createJson.id;
  console.log(`Task ID: ${taskId}`);

  const pollHistory = [];
  let completedTask = null;
  const pollInterval = 10000;
  const maxPolls = 60; // Up to 10 minutes

  for (let poll = 1; poll <= maxPolls; poll++) {
    await new Promise((r) => setTimeout(r, pollInterval));
    const pollTime = Date.now();

    try {
      const getRes = await fetch(`${baseUrl}/contents/generations/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const getJson = await getRes.json();
      const status = getJson.status || getJson.task_status || 'unknown';
      const entry = {
        poll,
        elapsedSec: Math.round((pollTime - startTime) / 1000),
        status,
        timestamp: new Date().toISOString(),
      };
      pollHistory.push(entry);
      console.log(`[Poll #${poll} - ${entry.elapsedSec}s] Status: ${status}`);

      if (status === 'succeeded' || status === 'completed' || status === 'SUCCESS') {
        completedTask = getJson;
        break;
      } else if (status === 'failed' || status === 'FAILED' || status === 'canceled') {
        completedTask = getJson;
        console.error('Task failed during execution:', JSON.stringify(getJson, null, 2));
        break;
      }
    } catch (err) {
      console.warn(`Poll error: ${err.message}`);
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log(`Finished after ${durationSec}s.`);

  // Save trace data
  const resultData = {
    runId: 'run-2026-11-02T04-43-47-814Z',
    taskId,
    model,
    prompt: plannedAdPrompt,
    status: completedTask?.status || 'timed_out',
    submittedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    latencySeconds: durationSec,
    pollHistory,
    completedTask,
  };

  const videoOutDir = path.resolve('../marketing-automation-b/evals/seedance-local/videos');
  const traceOutDir = path.resolve('../marketing-automation-b/evals/seedance-local/run-traces/run-2026-11-02T04-43-47-814Z');
  fs.mkdirSync(videoOutDir, { recursive: true });
  fs.mkdirSync(traceOutDir, { recursive: true });

  fs.writeFileSync(
    path.join(traceOutDir, 'generation-1-result.json'),
    JSON.stringify(resultData, null, 2),
    'utf8'
  );

  if (completedTask?.status === 'succeeded') {
    // Extract video url
    let videoUrl = null;
    if (completedTask.content?.video_url) {
      videoUrl = completedTask.content.video_url;
    } else if (Array.isArray(completedTask.content)) {
      for (const item of completedTask.content) {
        if (item.video_url) videoUrl = item.video_url;
        if (item.type === 'video' && item.video?.video_url) videoUrl = item.video.video_url;
        if (item.type === 'video' && item.url) videoUrl = item.url;
      }
    }

    console.log('Video URL detected:', videoUrl ? videoUrl.slice(0, 100) + '...' : 'NONE');

    if (videoUrl) {
      console.log('Downloading video #1 to disk...');
      const vidRes = await fetch(videoUrl);
      if (vidRes.ok) {
        const arrayBuf = await vidRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuf);
        const vidFile = path.join(videoOutDir, 'inkstall-ad-video1.mp4');
        fs.writeFileSync(vidFile, buffer);
        console.log(`SUCCESS: Video saved to ${vidFile} (${buffer.length} bytes)`);

        // Also copy to frontend videos dir
        const feVidDir = path.resolve('./evals/seedance-local/videos');
        fs.mkdirSync(feVidDir, { recursive: true });
        fs.writeFileSync(path.join(feVidDir, 'inkstall-ad-video1.mp4'), buffer);
      } else {
        console.error(`Failed to download video: HTTP ${vidRes.status}`);
      }
    }
  }
}

run().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
