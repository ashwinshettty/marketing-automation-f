# End-to-End Pre-Test Check Report

**Timestamp:** 2026-11-02T04:22:00Z  
**Release Gate Status:** BLOCKED (Formal release gate remains strictly blocked; local testing does not alter gate status)  
**Execution Mode:** Local execution only. No commits, tags, pushes, or production mutations.

---

## 1. Repository State & Environment

- **Frontend:** `marketing-automation-f` (React 19, Vite 8, TailwindCSS 4, Base UI, Lucide)
  - Active Port: `http://localhost:5173` (HTTP 200 OK verified)
  - Working tree: Clean git status preserved; no changes staged or committed.
- **Backend:** `marketing-automation-b` (Express 5, Mongoose 9, Node.js v24.11.0)
  - Active Port: `http://127.0.0.1:3000` (HTTP 200 OK verified)
  - Working tree: Unstaged and modified files strictly preserved.
- **Database:** MongoDB over SSH tunnel to remote `3.109.251.240` (database `aibot` & `inkstallofficial`).
  - Tunnel Host: `127.0.0.1:27017` (verified active with `ssh -i blioz2-openssh`).
  - Safety Isolation: Destructive commands (`dropDatabase`, `deleteMany({})`, collection wipes) are strictly barred. Non-destructive scoping verified.

---

## 2. Key Modules & Entry Points Inspected

| Component | Path | Inspection Status |
|---|---|---|
| Frontend Video Generator | `src/video-generator/VideoGeneratorPage.jsx` | Submits to `/api/video/requests` with `workflowHint: "ads"`. Verified session storage clearing and form state handling. |
| Story Plan Preview | `src/video-generator/StoryPlanPreview.jsx` | Displays candidate prompt, scene beats, and validation warnings. |
| Frontend API Client | `src/api/videoApi.js` | Axio client posting to `/video/requests`. |
| Central Video Routes | `video/routes.js` | Mounts `POST /requests`, `GET /requests/:id`, `GET /status`. |
| Unified Intent Router | `video/intentRouter.js` | `resolveVideoIntent` classifies workflow (`ads` vs `lesson`), continuity mode, tones, and audience. |
| Unified Dispatcher | `video/dispatch.js` | `dispatchVideoRequest` routes to ads or lesson planner and writes execution traces. |
| Ads Classifier | `video/ads/classifier.js` | `classifyAdsRequest` classifies `NEW_CAMPAIGN`, `CONTINUE_CAMPAIGN`, `REVISE_AD`, etc. |
| Ads Orchestrator | `video/ads/orchestrator.js` | `planAndCommitAdCampaign` coordinates creative brief, brand bible, LLM planner, and Mongo persistence. |
| Ads Planner | `video/ads/planner.js` | Assembles system/user prompts, calls LLM adapter, validates schema, and handles repair loops. |
| Story Classifier & Orchestrator | `story/classifier.js`, `story/orchestrator.js` | Educational lesson flow for subject explanations. |
| LLM Adapter | `story/llmAdapter.js` | Dual provider adapter: Gemini primary (`gemini-2.5-flash`), OpenAI fallback (`gpt-4o-mini`). |
| Video Adapter | `story/videoAdapter.js` | Currently contains `createDisabledVideoAdapter()`, which throws `VIDEO_GENERATION_DISABLED`. |
| Run Trace Reporter | `video/runTrace.js` | Generates side-by-side markdown and JSON execution traces. |

---

## 3. Database Safety Verification

- Direct probe verified that `127.0.0.1:27017` routes to the production/staging database `aibot`.
- A full database wipe request was previously refused (`DB-WIPE-REFUSAL.md`).
- To guarantee isolation:
  - No existing records are deleted or modified.
  - New test requests create fresh campaign IDs using `startNewCampaign: true` and UUIDs.
  - SessionStorage keys `ads-campaign-id` and `story-series-id` are reset before tests.

---

## 4. Seedance Readiness & Verification

- **API Key:** `SEEDANCE_API_KEY` is loaded from local `.env` (length: 179 characters; prefix verified). Never printed or exposed.
- **Provider Connectivity:**
  - Stage 1 connectivity test (`seedance-stage1-connectivity.mjs`) verified: PASS.
  - Endpoint `https://ark.ap-southeast.bytepluses.com/api/v3` returned HTTP 200 on task list.
- **Model Verification:**
  - Model `dreamina-seedance-2-5-260628` is active and activated on BytePlus Ark API (verified via live probe).
  - Probe test confirmed HTTP 200 creation and successful generation (`status: "succeeded"`).
  - Generation output format: MP4 video (`720p`, `9:16`, `5s`/`8s`, with audio).
- **Authorization Limits:**
  - Exactly 1 initial ad video generation authorized.
  - Exactly 1 continuation video generation authorized.
  - Max billable generations: 2. No automatic retries on failure.

---

## 5. Automated Test Suite Status

- Executed `node --test tests/**/*.test.js` in backend.
- Results:
  - Total tests: 206
  - Passed: 206
  - Failed: 0
  - Duration: 11.01s
- Frontend linting inspected: Existing warnings present in legacy components, but core video generator syntax is intact.

---

## 6. Pre-Test Readiness Assessment

| Requirement | Status | Evidence / Notes |
|---|---|---|
| Local isolation verified | PASS | No git push/commit; no production infrastructure altered. |
| Database safety verified | PASS | Non-destructive test harness; tunnel verified without wipe. |
| Backend running | PASS | Express running on port 3000; connected to Mongo. |
| Frontend running | PASS | Vite running on port 5173. |
| LLM configuration verified | PASS | Gemini primary + OpenAI fallback configured. |
| Seedance API verified | PASS | BytePlus Ark verified, key loaded, model `dreamina-seedance-2-5-260628` ready. |
| Automated tests passing | PASS | 206/206 tests passing. |
| Release gate status | BLOCKED | Formal gate remains blocked as required. |
