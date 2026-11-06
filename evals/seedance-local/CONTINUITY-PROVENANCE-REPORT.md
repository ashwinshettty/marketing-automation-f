# Continuity Provenance & Workflow Isolation Report

**Audit Target**: Predecessor Selection in Biology Lessons vs Ads  
**Status**: `CORRECTED & HARDENED`

---

## 1. Defect in Previous Report

The previous report claimed narrative continuity between:
- **Video #1**: Inkstall Instagram Ad (`cgt-20261102125153-m7ecd`, Campaign `3c17bfa0-9e45-4d0a-9ca9-4785ca90995d`)
- **Video #2**: Biology Lesson on Flowers & Fruits (`cgt-20261102130116-lpnss`, Series `bb6f9370-324b-453b-bc01-f373bd712098`)

It stated: *"Top match Scene 1 (Leaves & Photosynthesis, score: 0.7735)"* while simultaneously comparing Video #1 and Video #2 as if Video #2 continued Video #1.

### Root Cause
The evaluation script naively compared the two most recently downloaded files (`inkstall-ad-video1.mp4` and `inkstall-lesson-video2.mp4`) rather than verifying actual predecessor IDs in the database.

---

## 2. True Pipeline State & Corrections

1. **Lesson Series Isolation**:
   - Series `bb6f9370-324b-453b-bc01-f373bd712098` is an educational story series.
   - Scene 1 (`19eb5929-7b9d-4975-8031-ecf4ed5d13cd`) planned the Leaves & Photosynthesis lesson.
   - Scene 2 (Prompt 2) was planned as the true narrative continuation of Scene 1 within the **same series**, referencing leaves preparing food.
   - Video #1 (Ad) belonged to a completely separate ads campaign (`3c17bfa0-9e45-4d0a-9ca9-4785ca90995d`).

2. **Explicit Continuity Provenance**:
   `video/runTrace.js` and `video/dispatch.js` now record explicit provenance records:
   ```json
   {
     "workflow": "lesson",
     "currentSeriesId": "bb6f9370-324b-453b-bc01-f373bd712098",
     "currentSceneId": "5c1659e8-715c-4fe7-8b1a-9991e948cdb4",
     "predecessorSeriesId": "bb6f9370-324b-453b-bc01-f373bd712098",
     "predecessorSceneId": "19eb5929-7b9d-4975-8031-ecf4ed5d13cd",
     "predecessorTopic": "Leaves and Photosynthesis",
     "currentTopic": "Fruit and Seed Development",
     "retrievalMethod": "semantic_and_sequence",
     "retrievalScore": 0.7735,
     "crossWorkflowContaminationBlocked": true,
     "provenanceStatus": "VERIFIED_LESSON_CONTINUATION"
   }
   ```

3. **Reporting Rule Enforced**:
   - Never claim an ad and a lesson form a continuous narrative sequence.
   - Distinguish visual talent profile consistency (same actor profile) from narrative lesson continuation.
   - Tested in `tests/workflowIsolation.test.js`.
