# Prompt Transformation Lineage (P0 to P8)

- **Run ID**: `run-2026-11-02T04-43-47-814Z`

```text
P0 Original User Prompt
  ↓
P1 Normalized Prompt
  ↓
P2 Classification Input / Output
  ↓
P3 Context-Enriched Planner Input
  ↓
P4 Complete Assembled LLM Request
  ↓
P5 Actual LLM Completion
  ↓
P6 Validated Planner Output
  ↓
P7 Compiled Seedance Prompt
  ↓
P8 Actual Seedance Request Payload
```

---

### P0: Original User Prompt
```text
Create a new Instagram marketing ad campaign for Inkstall tutoring.
Use a persuasive but trustworthy tone. Target parents of school students, particularly parents concerned about their children's science understanding and marks.
Create an approximately 8-second vertical-friendly video advertisement.
Show a friendly Indian English-speaking tutor in a bright classroom.
Opening hook: A parent is worried because their child struggles to understand science concepts.
Emotional desire: Parents want their children to become confident learners who genuinely understand science.
Product reveal: Inkstall live tutoring.
Proof moment: Show a student experiencing a short “aha” moment while understanding a science concept at the whiteboard.
Call to action: Book a free demo on Inkstall.
Keep claims modest and truthful. Do not promise guaranteed marks, 100% results, guaranteed academic improvement or unsupported outcomes.
Use natural Indian English, realistic classroom interactions, a warm educational atmosphere and clear visual storytelling.
```

### P1: Normalized Prompt
- Whitespace normalized, non-breaking spaces replaced, trimmed to standard ASCII/Unicode string.

### P2: Classification Input / Output
- **Module**: `video/intentRouter.js` (`resolveVideoIntent`)
- **Output**:
  - `workflow`: "ads"
  - `intent`: "new_campaign"
  - `targetAudience`: "parents of school students" (literal preserved)
  - `audienceCategory`: "prospective_customers"
  - `tones`: ["persuasive", "fast"]

### P3: Context-Enriched Planner Input
- **Module**: `video/ads/creativeBrief.js` + `video/ads/brandBible.js`
- Injected default Inkstall Brand Bible: talent appearance (friendly adult host, warm medium-brown skin), clothing (navy or teal top), environment (modern campus/bright study space), modest claim policies.

### P4: Complete Assembled LLM Request
- **Module**: `video/ads/planner.js` (`planAdWithLlm`)
- Sent to `gemini-2.5-flash` with system instructions and JSON schema constraints.

### P5: Actual LLM Completion
- Structured JSON response containing 4 beats, dialogue ("Science confusing your child? Inkstall live tutoring builds real understanding. See the aha moment. Book free demo."), visualAction, and sceneSequence.

### P6: Validated Planner Output
- **Module**: `video/ads/validator.js` (`validateAdPlan`)
- Verified: no stock math tutoring replacement, persuasive benefit speech verified ("builds real understanding"), visual action distinct from dialogue.

### P7: Compiled Seedance Prompt
- Multi-beat structured prompt describing 8-second 9:16 vertical video, friendly Indian tutor, bright classroom, worried parent opening, aha moment at whiteboard, and CTA card.

### P8: Actual Seedance Request Payload
```json
{
  "model": "dreamina-seedance-2-5-260628",
  "content": [
    {
      "type": "text",
      "text": "Create an 8-second 9:16 vertical video advertisement for Inkstall tutoring.\nTalent: Friendly Indian English-speaking tutor in her early 30s with warm medium-brown skin, neat dark hair, wearing a smart teal top and dark trousers.\nSetting: Bright modern school science classroom with soft natural lighting, a clean whiteboard, and laboratory posters in the background.\nScene flow:\n0-2s Hook: A concerned parent watches their school student struggling with science homework at a desk. The friendly Indian tutor enters with a calm, reassuring smile.\n2-4s Action & Aha Moment: In the bright classroom, the tutor stands at the whiteboard explaining a science concept clearly. The student experiences an instant 'aha' moment, smiling as understanding clicks.\n4-6s Product: Clean demonstration of the Inkstall live tutoring platform showing interactive whiteboard learning.\n6-8s CTA: The tutor smiles warmly and speaks in clear, natural Indian English: \"Science confusing your child? Inkstall live tutoring builds real understanding. Book your free demo today!\" Clean end card displays: \"Book a Free Demo on Inkstall\".\nStyle: Cinematic, photorealistic lighting, natural human motion, warm educational atmosphere, modest and truthful claims."
    }
  ]
}
```
