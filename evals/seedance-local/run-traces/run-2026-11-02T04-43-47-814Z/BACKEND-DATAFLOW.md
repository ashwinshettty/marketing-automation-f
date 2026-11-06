# Backend Dataflow Report

- **Run ID**: `run-2026-11-02T04-43-47-814Z`

```text
Client (Browser / Script)
    │  POST /api/video/requests (Bearer JWT)
    ▼
Express Route Dispatcher (video/routes.js)
    │  engine.createRequest
    ▼
Video Intent Router (video/intentRouter.js)
    │  resolveVideoIntent -> { workflow: 'ads', intent: 'new_campaign' }
    ▼
Ads Orchestrator (video/ads/orchestrator.js)
    │  resolveCampaignContinuity -> Campaign Created (ID: 3c17bfa0-9e45-4d0a-9ca9-4785ca90995d)
    │  buildCreativeBrief -> Format: 9:16, 8s, Tone: persuasive, fast
    ▼
Ads LLM Planner (video/ads/planner.js)
    │  callLlm -> Gemini 2.5 Flash -> Structured JSON
    ▼
Plan Validator (video/ads/validator.js)
    │  validateAdPlan -> status: VALID, errors: []
    ▼
Prompt Compiler (video/runTrace.js)
    │  buildSeedanceCandidatePrompt -> Multi-beat compiled prompt
    ▼
Seedance Adapter (scripts/generate-video-1.mjs)
    │  POST https://ark.ap-southeast.bytepluses.com/api/v3/contents/generations/tasks
    │  Task ID: cgt-20261102125153-m7ecd
    │  Polling: 17 attempts (176s) -> status: succeeded
    ▼
Video Storage Engine
    │  GET TOS Presigned URL -> evals/seedance-local/videos/inkstall-ad-video1.mp4 (6.09 MB)
```
