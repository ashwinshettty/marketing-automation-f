# Route Decision Report

- **Run ID**: `run-2026-11-02T04-43-47-814Z`

## Routing Analysis

- **Input Prompt**: "Create a new Instagram marketing ad campaign for Inkstall tutoring..."
- **Detected Intent**: `new_campaign`
- **Selected Workflow**: `ads`
- **Routing Confidence**: `0.99`
- **Routing Mechanism**: **Deterministic** (`routerVersion: video-intent-router-v1`)

### Why was `ads` selected?
1. The request payload provided `workflowHint: "ads"`.
2. The prompt contained strong advertising signals: "marketing ad campaign", "Instagram", "Call to action", "CTA".

### Alternatives Considered & Rejected:
- **Lesson Workflow**: Rejected because although the setting is a classroom and tutor, the core objective is user acquisition and booking a free demo.
- **Clarification Required**: Rejected because the intent was unambiguous with 99% confidence.
