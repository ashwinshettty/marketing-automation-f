# Code Path Index

- **Run ID**: `run-2026-11-02T04-43-47-814Z`

| Component | File Path | Key Functions Executed |
|:---|:---|:---|
| Frontend Generator | `src/pages/VideoGenerator.jsx` | `handleSubmit`, `handleResetSession` |
| Video HTTP Routes | `video/routes.js` | `createVideoRouter`, `wrap`, `send` |
| Video Dispatcher | `video/dispatch.js` | `createVideoDispatcher`, `createRequest` |
| Intent Router | `video/intentRouter.js` | `resolveVideoIntent`, `extractAudience`, `extractTones` |
| Ads Orchestrator | `video/ads/orchestrator.js` | `createAdsOrchestrator`, `plan` |
| Ads Campaign Manager | `video/ads/campaign.js` | `resolveCampaignContinuity` |
| Brand Bible | `video/ads/brandBible.js` | `establishBrandBible`, `inferBrandSeedFromRequest` |
| Creative Brief | `video/ads/creativeBrief.js` | `buildCreativeBrief` |
| Ads LLM Planner | `video/ads/planner.js` | `planAdWithLlm` |
| Ads Validator | `video/ads/validator.js` | `validateAdPlan`, `ensureMeaningfulVisualActions`, `ensurePersuasiveBenefitSpeech` |
| Run Trace Logger | `video/runTrace.js` | `createRunTrace`, `buildSeedanceCandidatePrompt` |
| Seedance Generation 1 | `scripts/generate-video-1.mjs` | Task creation, Polling loop, Video download |
| Seedance Generation 2 | `scripts/generate-video-2.mjs` | Task creation, Polling loop, Continuity video download |
