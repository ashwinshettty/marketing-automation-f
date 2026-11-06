# Script Fidelity Report

**Audit Target**: Comparison of Planner Output, Scene Beats, and Seedance Prompts  
**Status**: `HARDENED & LOCKED`

---

## 1. Observed Defects in Previous Trace (`run-2026-11-02T04-43-47-814Z`)

In the initial ads generation trace:
- **Top-Level Dialogue**: *"Science confusing your child? Inkstall live tutoring builds real understanding. See the aha moment. Book free demo."*
- **Scene Beat 1 Dialogue**: *"Exam week does not have to feel like a free fall."*
- **Scene Beat 2 Dialogue**: *"Inkstall live tutoring builds real understanding."*
- **Scene Beat 3 Dialogue**: *"Inkstall - exam confidence, practiced before test day."*
- **Scene Beat 4 Dialogue**: *"Book free demo."*
- **Seedance Prompt Dialogue**: *"Science confusing your child? Inkstall live tutoring builds real understanding. Book your free demo today!"*

Notice the discrepancies:
1. Scene Beat 1 introduced "Exam week does not have to feel like a free fall", which was absent in top-level dialogue.
2. Seedance prompt introduced "Book your free demo today!" whereas top-level dialogue had "Book free demo."

---

## 2. Root Cause Analysis

1. **No Single Script Object**: The planner returned `ad.dialogue` and `ad.sceneSequence[].dialogue` as unlinked fields.
2. **Ad-Hoc Prompt Compilation**: Prompt assembly in `runTrace.js` and runner scripts stitched together strings from different properties without hashing or equality checks.
3. **No Speech Rate Gating**: Dialogue was not checked against duration limits prior to generation.

---

## 3. Implemented Hardening & Verification

1. **Single Source of Truth**: `createCanonicalScript` requires one authoritative dialogue string and enforces that individual beat dialogue fragments align with duration budgets.
2. **Speech Rate Verification**: Speech rate is constrained to ≤ 2.8 words/second. An 8-second video cannot contain more than 22 words.
3. **Cryptographic Lock**: SHA-256 hash binds dialogue, narration, beats, and text assets into `scriptHash`.
4. **Verified via Tests**:
   - `tests/canonicalScript.test.js` (4 tests pass):
     - Valid hash calculation
     - Immediate rejection of speech rates > 2.8 wps
     - Tampering detection throwing `ScriptIntegrityError`
