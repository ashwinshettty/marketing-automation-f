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

const userAdPrompt = `Create an 8-second 9:16 vertical video advertisement for Inkstall tutoring targeting Indian parents of 10th grade students.
Talent: Concerned Indian mother and father in their early 40s in neat contemporary attire, observing their 10th-grade teenage son at his study desk. A patient, specialist Inkstall tutor appears with a warm, encouraging smile.
Setting: Warm, authentic Indian family living room and quiet study space transitioning to a premium digital tutoring environment with interactive digital tablet/whiteboard.
Scene flow:
0-2s Emotional Hook: Late evening in a calm home. A 10th-grade student sits frustrated at a desk surrounded by heavy textbooks and open notebooks, rubbing his forehead. His concerned parents watch quietly from the doorway, sharing anxious looks over hours spent studying without clarity.
2-4s Transformation: The student connects live with a friendly Inkstall subject-specialist tutor on an interactive screen. The tutor patiently guides him step-by-step through a complex algebra problem, and the student's face lights up with relief as the concept finally clicks.
4-6s Value Proposition: Cut to clean, premium visual showcasing Inkstall's personalized 1-on-1 and small-group tuition, tailored learning pace, and constructive weekly parent feedback.
6-8s Call to Action: The mother smiles with genuine peace of mind as her son studies confidently. Professional voiceover in clear, warm Indian English: "Help your child learn with confidence at their own pace. Explore Inkstall and book your 1-on-1 demo today." Clean, minimalist typography card: "Book a 1-on-1 Demo • inkstall.com".
Style: Premium cinematic realism, authentic Indian household warmth, emotionally empathetic, natural lighting, trustworthy educational brand, no exaggerated or unrealistic promises.`;

console.log('=== SEEDANCE VIDEO GENERATION #3: INKSTALL 10TH GRADE PARENTS AD ===');
console.log('Model:', model);
console.log('Base URL:', baseUrl);
console.log('Prompt length:', userAdPrompt.length);

async function run() {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Submitting generation task...`);

  const taskPayload = {
    model: model,
    content: [
      {
        type: 'text',
        text: userAdPrompt,
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

  let videoUrl = null;
  if (completedTask?.status === 'succeeded') {
    if (completedTask.content?.video_url) {
      videoUrl = completedTask.content.video_url;
    } else if (Array.isArray(completedTask.content)) {
      for (const item of completedTask.content) {
        if (item.video_url) videoUrl = item.video_url;
        if (item.type === 'video' && item.video?.video_url) videoUrl = item.video.video_url;
        if (item.type === 'video' && item.url) videoUrl = item.url;
      }
    }
  }

  console.log('Video URL detected:', videoUrl ? videoUrl.slice(0, 100) + '...' : 'NONE');

  if (videoUrl) {
    console.log('Downloading video #3 to disk...');
    const vidRes = await fetch(videoUrl);
    if (vidRes.ok) {
      const arrayBuf = await vidRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuf);
      
      const outDirPublic = path.resolve('./public/videos');
      const outDirVideos = path.resolve('./videos');
      const outDirBackend = path.resolve('../marketing-automation-b/evals/seedance-local/videos');
      fs.mkdirSync(outDirPublic, { recursive: true });
      fs.mkdirSync(outDirVideos, { recursive: true });
      fs.mkdirSync(outDirBackend, { recursive: true });

      fs.writeFileSync(path.join(outDirPublic, 'inkstall-parents-10th-grade-ad.mp4'), buffer);
      fs.writeFileSync(path.join(outDirVideos, 'inkstall-parents-10th-grade-ad.mp4'), buffer);
      fs.writeFileSync(path.join(outDirBackend, 'inkstall-parents-10th-grade-ad.mp4'), buffer);
      console.log(`SUCCESS: Video saved to public/videos/inkstall-parents-10th-grade-ad.mp4 (${buffer.length} bytes)`);
    } else {
      console.error(`Failed to download video: HTTP ${vidRes.status}`);
    }
  }

  const resultData = {
    runId: `run-${new Date().toISOString().replace(/[:.]/g, '-')}`,
    taskId,
    model,
    prompt: userAdPrompt,
    status: completedTask?.status || 'timed_out',
    videoUrl,
    submittedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    latencySeconds: durationSec,
    pollHistory,
    completedTask,
  };

  const traceOutDir = path.resolve('../marketing-automation-b/evals/seedance-local/run-traces');
  fs.mkdirSync(traceOutDir, { recursive: true });
  fs.writeFileSync(
    path.join(traceOutDir, 'generation-3-result.json'),
    JSON.stringify(resultData, null, 2),
    'utf8'
  );
  console.log('Trace saved to generation-3-result.json');
}

run().catch((e) => {
  console.error('Fatal error in generation script:', e);
  process.exit(1);
});
