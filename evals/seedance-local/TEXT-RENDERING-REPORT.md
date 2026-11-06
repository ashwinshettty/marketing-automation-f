# Text Rendering & Typography Hardening Report

**Objective**: Eliminate AI-generated gibberish from video frames  
**Implementation**: `video/render/deterministicText.js`  
**Status**: `IMPLEMENTED & VERIFIED`

---

## 1. Problem Statement: AI Diffusion Text Hallucination

Video diffusion models (including Seedance 2.5) struggle with rendering exact typographic glyphs. When prompted with instructions such as *"Tutor writes physics formulas on whiteboard"* or *"Screen shows Inkstall app booking button"*, the model outputs distorted, misspelled pseudo-text, warped letters, and garbled symbols.

---

## 2. Hardening Strategy: Visuals in Seedance, Typography in Compositor

### A. Negative Typography Constraints in Seedance
Both `story/compiler.js` and `video/runTrace.js` now automatically inject mandatory negative constraints into every compiled Seedance prompt:
```text
[Mandatory Negative Typography Constraints / Clean Surfaces]:
- Do not render readable text, letters, numbers, symbols, words, or typography on any surface.
- Do not render subtitles, captions, lower-thirds, or end cards in the generated video.
- All whiteboards, screens, signs, notebooks, and background charts must remain clean, blank, or abstractly illustrated without legible writing.
- Do not generate AI logos, brand watermarks, or end cards.
- All typography, brand names, and subtitles are rendered deterministically outside generation.
```

### B. Deterministic Text Asset Specification
Structured text overlays are defined as external compositor assets:
- **Brand Watermark**: "Inkstall" (Inter Bold, 22px, white text on dark translucent pill, top-left, mobile safe area).
- **CTA End Card**: "Book a Free Demo on Inkstall" (Inter Bold, 28px, white on #0284C7 brand blue, centered at bottom for final 2.5s).
- **Whiteboard Topic Overlay**: Optional high-contrast title pill (Inter 600, 24px) positioned above the clean whiteboard.

### C. Subtitle Generation
Subtitles are generated directly from the locked canonical script into standard formats:
- **SRT Format**: Standard `00:00:00,000 --> 00:00:02,500` timestamps.
- **WebVTT Format**: For modern HTML5 video players.

### D. Verification via Automated Tests
- `tests/deterministicText.test.js` verified:
  - Precise SRT/VTT timestamp calculations
  - Mobile 9:16 safe area margin validation
  - FFmpeg `drawtext` compositing layer generation
