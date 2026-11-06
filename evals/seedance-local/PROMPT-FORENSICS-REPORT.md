# Prompt Forensics & Lineage Report (P0 to P8 Hardened)

**Run ID**: `run-2026-11-02T04-43-47-814Z`  
**Status**: `CRYPTOGRAPHICALLY LINKED TO SCRIPT HASH`

---

## Lineage Stages

| Stage | Name | Input / Transformation | Output Artifact |
|:---:|:---|:---|:---|
| **P0** | Raw User Prompt | Original prompt requesting 8s vertical ad / lesson. | Prompt string |
| **P1** | Normalized Prompt | Whitespace trimmed, character normalization. | Normalized string |
| **P2** | Classification | Intent router classifies `ads` vs `lesson`. | Structured routing object |
| **P3** | Context Enriched | Injects Brand Bible / Character Bible and predecessor context. | Enriched planner context |
| **P4** | Assembled LLM Request | System instructions, schema rules, and formatted JSON prompt. | Provider payload |
| **P5** | LLM Completion | Gemini / Grok returns structured JSON plan. | Raw LLM completion |
| **P6** | Validated Script Lock | Script validated, speech rate verified (≤2.8 wps), SHA-256 hash locked. | **Canonical Script Object** |
| **P7** | Visual-Only Prompt | Dialogue moved to pacing context; negative typography constraints added. | Seedance visual prompt |
| **P8** | Seedance Request | JSON payload with clean surfaces submitted to Ark API. | Provider task payload |

---

## Script Hash Binding
Every P7 visual prompt and P8 request body is linked to the `scriptHash` generated at P6. If P7 diverges from P6, `assertScriptIntegrity` halts execution with an integrity violation.
