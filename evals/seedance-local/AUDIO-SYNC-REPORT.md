# Audio Synchronization & Lip-Sync Hardening Report

**Audit Target**: Spoken Dialogue Fidelity & Audio-Video Synchronization  
**Status**: `EVIDENCE-GROUNDED (Nuances Separated)`

---

## 1. Key Finding on Seedance Raw Audio

In Seedance 2.5 (`dreamina-seedance-2-5-260628`), the API parameter `generate_audio: true` instructs the model's audio diffusion branch to synthesize ambient sound and speech.

However:
- The generated audio does not guarantee 100% word-for-word fidelity to long, complex prompts.
- Lip synchronization is coarse and can exhibit micro-phoneme drift during fast speech.

---

## 2. Decoupled Evaluation Criteria

To avoid subjective inflation, the evaluation system now strictly separates:

| Dimension | Evaluation Method | System Status |
|:---|:---|:---:|
| **1. Audio Stream Presence** | Container inspection (AAC / MP4 audio stream detection) | **PASS** |
| **2. Speech Timing & Duration** | Word count speech rate check (≤ 2.8 words/second) | **PASS** |
| **3. Verbatim Script Fidelity** | Deterministic comparison against canonical locked script | **REQUIRES_DETERMINISTIC_TTS** |
| **4. Phoneme Lip-Sync** | Computer vision viseme tracking (e.g. SyncNet) | **UNVERIFIED_IN_SEEDANCE_RAW** |

---

## 3. Production Recommendation for Lip-Sync

For direct-to-camera teaching:
1. **Primary**: Use clean, focused voice-over narration paired with teaching gestures, student reactions, whiteboard animations, and classroom cutaways where exact lip-sync is not required.
2. **Secondary**: When on-camera speech is mandatory, pass the canonical script to a dedicated neural TTS engine (e.g. ElevenLabs Indian English voice) and use dedicated lip-sync compositing (e.g. Wav2Lip / SadTalker) during assembly.
