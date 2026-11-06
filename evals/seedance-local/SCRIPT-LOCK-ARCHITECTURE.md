# Script Lock Architecture & Immutable Pipeline

**Version**: `v1.0.0-hardened`  
**Target Module**: `video/script/canonicalScript.js`  
**System Status**: `IMPLEMENTED & TESTED (214/214 Tests Passing)`

---

## 1. Architectural Philosophy

Prior to this hardening, script text drifted across three uncoordinated locations:
1. `ad.dialogue` or `scene.dialogue` (top-level planner string)
2. `sceneSequence[].dialogue` (individual scene beat strings)
3. Hand-crafted or compiler-assembled prompt text sent to Seedance

This lack of a canonical source-of-truth permitted subtle dialogue divergence, unverified speech rates, hallucinated on-screen text, and unverified audio tracks.

The **Canonical Script Architecture** establishes:
```text
User Prompt
    ↓
Intent Router (Ads vs Lesson Isolation)
    ↓
LLM Planner (Beats, Visual Actions, Spoken Script)
    ↓
Script Validation & Speech-Rate Gating (≤ 2.8 wps)
    ↓
Canonical Script Creation & Locking (SHA-256 Hash, Frozen Object)
    │
    ├── Visual-Only Prompt Compiler (Negative Typography Constraints)
    │       ↓
    │   Seedance Visual Generation (Clean Blank Surfaces, No Text)
    │
    ├── Deterministic Typography Engine (Inter Font, Safe Areas)
    │       ↓
    │   Compositing Manifest & Subtitles (SRT / WebVTT / FFmpeg drawtext)
    │
    └── Exact Audio Narration Track (100% Verbatim Script Match)
```

---

## 2. Canonical Script Schema

Each canonical script is governed by `canonicalScriptSchema` (`video/script/canonicalScript.js`):
- `scriptId`: Unique UUID
- `scriptVersion`: Integer (starts at 1; revisions increment version)
- `workflowType`: `'ads' | 'lesson'`
- `language`: `'en-IN'`
- `targetAudience`: Specific audience description (e.g. `parents of school students`)
- `durationSeconds`: Number (e.g. 8)
- `dialogue`: Exact canonical spoken dialogue string
- `narration`: Exact voice-over narration string
- `visualBeats`: Array of structured visual actions with individual duration budgets
- `subtitleSegments`: Timestamped word chunks for exact subtitle synchronization
- `textAssets`: Array of structured typography assets (brand watermark, CTA end card, focus label)
- `continuityReferences`: Predecessor series, scene, and topic IDs
- `validationStatus`: `'LOCKED'`
- `lockedAt`: ISO timestamp
- `scriptHash`: 64-character SHA-256 hash computed over normalized canonical fields

---

## 3. Immutability & Tamper Detection

The script object is frozen using `Object.freeze`. Before prompt compilation or final video assembly, the pipeline executes:
```javascript
assertScriptIntegrity(canonicalScript, expectedHash);
```
If any downstream component attempts to modify dialogue, duration, or visual beats, `assertScriptIntegrity` recalculates the SHA-256 hash, detects the mismatch, and throws `ScriptIntegrityError (SCRIPT_INTEGRITY_VIOLATION)`.

---

## 4. Visual Prompt & Typography Separation

Seedance 2.5 is restricted to generating **Visuals Only**:
- Character appearance, facial expressions, attire, natural human motion.
- Modern classroom environment with soft natural lighting.
- All whiteboards, screens, tablets, and background charts must be **clean, blank, or abstractly illustrated**.

All typography (Inkstall logo, CTA "Book a Free Demo on Inkstall", whiteboard diagram labels, and subtitles) is rendered **outside Seedance** using deterministic compositing specifications (`video/render/deterministicText.js`).
