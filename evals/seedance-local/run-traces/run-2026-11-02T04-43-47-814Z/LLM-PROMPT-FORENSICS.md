# LLM Prompt Forensics

- **Run ID**: `run-2026-11-02T04-43-47-814Z`
- **Calling Modules**: `video/ads/planner.js` (Ads) & `story/planner.js` (Lesson Continuity)

---

## Invocation 1: Ads Planning Phase

### 1. Provider & Model Configuration
- **Provider**: Google Gemini
- **Model**: `gemini-2.5-flash`
- **Parameters**: `temperature: 0.7`, `maxOutputTokens: 2048`, `responseMimeType: application/json`
- **Fallback Chain**: `gemini-2.5-flash` → `gpt-4o-mini` → `grok-4.3`
- **Provider Used**: `gemini-2.5-flash` (direct success, no fallback needed for ad)

### 2. System Instructions
```text
You are an expert video advertising creative director and scriptwriter.
Create short, high-performing vertical video ads optimized for social media platforms.
Ensure dialogue is conversational, natural, and fits comfortably within the requested duration.
All output must be valid JSON adhering strictly to the requested schema.
```

### 3. Assembled User Message
```text
Plan a 8-second 9:16 video advertisement for Inkstall.
User Prompt: Create a new Instagram marketing ad campaign for Inkstall tutoring.
Use a persuasive but trustworthy tone. Target parents of school students, particularly parents concerned about their children's science understanding and marks.
Create an approximately 8-second vertical-friendly video advertisement.
Show a friendly Indian English-speaking tutor in a bright classroom.
Opening hook: A parent is worried because their child struggles to understand science concepts.
Emotional desire: Parents want their children to become confident learners who genuinely understand science.
Product reveal: Inkstall live tutoring.
Proof moment: Show a student experiencing a short "aha" moment while understanding a science concept at the whiteboard.
Call to action: Book a free demo on Inkstall.
Keep claims modest and truthful. Do not promise guaranteed marks, 100% results, guaranteed academic improvement or unsupported outcomes.
Use natural Indian English, realistic classroom interactions, a warm educational atmosphere and clear visual storytelling.

Brand Context:
- Talent: Friendly adult host, warm medium-brown skin, neat professional attire.
- Clothing: Smart-casual brand colors — navy or teal top, clean silhouette, no busy patterns.
- Voice: Warm, clear, and trustworthy — parent and student friendly without hype.
- Visual style: Bright campus and product moments, clean UI overlays, high-contrast CTA end cards.
- Environment: Modern campus or bright study space with soft natural light.
```

### 4. Actual LLM Response
```json
{
  "hook": "Exam week does not have to feel like a free fall.",
  "problem": "Parent worried because child struggles with science concepts.",
  "desire": "Parents want confident learners who genuinely understand science.",
  "productReveal": "Inkstall live tutoring builds real understanding.",
  "proof": "Student experiences aha moment at the whiteboard.",
  "cta": "Book free demo.",
  "visualAction": "Friendly Indian English-speaking tutor in teal top stands at whiteboard in bright classroom, gesturing to equations while parent watches from side; quick cuts to student nodding, ending on phone screen CTA overlay.",
  "dialogue": "Science confusing your child? Inkstall live tutoring builds real understanding. See the aha moment. Book free demo.",
  "sceneSequence": [
    {
      "beat": "hook",
      "visualAction": "Close-up of concerned parent watching child at desk, tutor enters frame smiling.",
      "dialogue": "Exam week does not have to feel like a free fall."
    },
    {
      "beat": "product_reveal",
      "visualAction": "Clean product reveal of the Inkstall UI filling the frame.",
      "dialogue": "Inkstall live tutoring builds real understanding."
    },
    {
      "beat": "proof",
      "visualAction": "Student smiles and writes correct answer, parent nods approvingly.",
      "dialogue": "Inkstall - exam confidence, practiced before test day."
    },
    {
      "beat": "cta",
      "visualAction": "Screen shows Inkstall app booking button with phone in hand.",
      "dialogue": "Book free demo."
    }
  ]
}
```

### 5. Validation and Normalization
- Parsed via `zod` schema (`adPlanSchema`).
- Visual action and persuasive speech validated without starvation.
- Claim safety verified: no guaranteed outcomes or unsupported loan claims.
- Status: `VALID`.

---

## Invocation 2: Lesson Continuity Planning Phase

### 1. Provider & Model Configuration
- **Requested Provider**: Google Gemini (`gemini-2.5-flash`) → rate limit
- **Fallback 1**: OpenAI (`gpt-4o-mini`) → rate limit
- **Fallback 2**: xAI Grok (`grok-4.3`) → **SUCCEEDED**
- **Tokens**: Input 2761, Output 521, Total 3282. Latency: 33,006 ms.

### 2. Retrieved Continuity Context
- Previous Scene: Scene 1 (`19eb5929-7b9d-4975-8031-ecf4ed5d13cd`) — Leaves and photosynthesis for food production.
- Semantic Relatedness Score: `0.7735` ("strong" topical connection).
- Character Bible: Friendly adult Indian science tutor in teal top, dark trousers, warm Indian English voice.

### 3. Actual LLM Output (Grok-4.3)
- **Scene Objective**: Connect leaves and photosynthesis to the new topic and explain how fruits develop from flowers to protect seeds.
- **Visual Action**: Tutor gestures toward a simple flower-to-fruit diagram on the whiteboard.
- **Dialogue**: "Fruits grow from flowers and protect the seeds inside."
- **Constraints Applied**: Preserve face, hairstyle, clothing (teal top), classroom environment.
