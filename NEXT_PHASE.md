# SAMVEDNA · Next phase: from scripted demo to working prototype

This file is the build guide for the next phase. Read it top to bottom before writing code.

| Phase | What | Status |
|---|---|---|
| 0 · Idea | Deck, verified facts, scripted UI demo | **done** (this repo) |
| 1 · Prototype | Real pipeline on one machine, synthetic callers, measured against the gates | **next — this document** |
| 2 · Pilot | One State NHAA cell, ethics-committee approval, clinicians, consented calls | later |
| 3 · Scale | All States, Tele-MANAS link agreed with MoHFW, dashboards | later |
| 4 · Sustain | Retrain on consented data, yearly audit | later |

**Goal of phase 1:** a caller speaks or types into the UI, and the answer comes from the real pipeline: Whisper → voice features → our fine-tuned Gemma 4 → SVI and override rules → PoA rules → counsellor console. Everything runs locally, and it is measured on a frozen test set.

---

## 0 · Ground rules (read first)

1. **No real victim data.** Use only public, licence-checked datasets and synthetic calls clearly labelled as synthetic. Real calls come in phase 2, with ethics approval and a separate opt-in for training.
2. **Never commit** datasets, audio, model weights, `.gguf` files, API keys or `.env` files. `ml/data/`, `ml/out/` and `*.gguf` stay in `.gitignore`.
3. **Every number shown to judges must come from `eval/results/`**, alongside the command that produced it. Until a gate is measured, it stays a *target*.
4. **The AI never makes the final call.** Overrides are rules, the score is arithmetic, and a counsellor decides.
5. Commit as the team (`shreshav2404-code`). Push only this repository.

## 1 · Target repository layout

```
demo-ui/                    React 19 UI (exists) - wire it to the API in step 8
backend/
  app/main.py               FastAPI app + WebSocket
  app/pipeline/asr.py       faster-whisper
  app/pipeline/voice.py     Silero VAD + eGeMAPS + XGBoost (ONNX)
  app/pipeline/llm.py       llama.cpp client, JSON-constrained output
  app/scoring/svi.py        SVI formula + bands
  app/scoring/overrides.py  C-SSRS skip logic, crisis phrases, override table
  app/rules/poa_rules.yaml  trigger -> action -> legal basis
  app/rules/crisis/{hi,en,bho,awa}.txt
  app/audit.py              hash-chained ledger (event hashes only)
  app/db.py                 SQLite
  tests/
ml/
  data/                     (git-ignored) raw + processed datasets
  build_dataset.py          -> JSONL in the output contract below
  translate.py              IndicTrans2 (Hindi)
  train_lora.py             Unsloth QLoRA
  export_gguf.md            merge + GGUF Q8_0 steps
  voice_features.py         eGeMAPS extraction
  train_voice.py            XGBoost -> ONNX
eval/
  run_eval.py
  results/YYYY-MM-DD.md     measured numbers + exact commands
```

## 2 · Environment (RTX 4060 laptop, 8 GB)

- **Use WSL2 (Ubuntu) for training.** Unsloth and bitsandbytes are most reliable on Linux. The backend and UI can run on Windows.
- Python 3.11 in a virtual environment, with a PyTorch build for your CUDA version.
- Training: `unsloth transformers peft trl datasets bitsandbytes accelerate`
- Speech and voice: `faster-whisper opensmile silero-vad xgboost onnx onnxmltools onnxruntime`
- Backend: `fastapi uvicorn[standard] pydantic`
- Serving: a llama.cpp CUDA release build (`llama-server`).
- Check before training: `nvidia-smi` shows the 4060, and `python -c "import torch; print(torch.cuda.is_available())"` prints `True`.

## 3 · Data (ml/)

| Dataset | Use | Licence | Decision |
|---|---|---|---|
| Reddit C-SSRS (Zenodo 2667859) — 500 users, 4 psychiatrists | text · suicide-risk levels | CC BY 4.0 | **use** |
| CREMA-D — 7,442 acted clips, 91 actors | voice · emotion | ODbL 1.0 | **use** |
| AI4Bharat Rasa — Assamese, Bengali, Tamil | voice · Indian languages | CC BY 4.0 | **use** |
| RAVDESS — 7,356 acted files | voice · fear, sadness | CC BY-NC-SA | research only; clear the licence before any deployment |
| Dreaddit — 3.5K labelled segments | text · stress | not stated | **do not use** until the licence is confirmed |
| DAIC-WOZ, UMD Reddit | clinical interviews / Reddit | gated (academic / IRB) | **not used** |
| Synthetic Hindi calls | text + audio | ours | write with a clinician; tag `label_source: synthetic` |

**Output contract** (one JSONL row per example — the model is trained to produce `target`):

```json
{
  "id": "syn-hi-0042",
  "lang": "hi",
  "label_source": "synthetic | reddit_cssrs | ...",
  "transcript": "...full caller text...",
  "target": {
    "indicators": [
      { "sign": "suicidal_ideation", "quote": "<exact substring of transcript>" },
      { "sign": "intimidation", "quote": "<exact substring>" }
    ],
    "language": "hi"
  }
}
```

- `sign` must be one of: `trauma, fear, depression, suicidal_ideation, intimidation, social_isolation, extreme_vulnerability`.
- `build_dataset.py` **rejects any row whose quote is not an exact substring** of the transcript.
- Split 80 / 10 / 10 by source and speaker, so no speaker appears in two splits. **Freeze the test split** and never train on it.
- Hindi: translate English text with IndicTrans2, then have a Hindi speaker fix idioms of distress (e.g. "ghabrahat", "tension", "neend nahin aati"). Keep the quotes exact after translation.

**Done when:** the train, val and test JSONL files validate against the contract with zero rejected rows, and `ml/data/README.md` lists the source and licence of every file.

## 4 · Our language model — Gemma 4 E4B QLoRA (ml/train_lora.py)

These are the settings shown on the fine-tune dashboard; keep them in sync.

| Setting | Value |
|---|---|
| Base | `google/gemma-4-E4B-it` (Unsloth: `unsloth/gemma-4-E4B-it`) |
| Quantisation | 4-bit NF4 (QLoRA) |
| LoRA | r 16 · α 16 · dropout 0 · language layers only (vision and audio frozen) |
| Max sequence | 1,024 tokens |
| Batch | 1 × gradient accumulation 8 |
| Learning rate | 2e-4, linear decay · optimiser `adamw_8bit` |
| Epochs | 2 · train on responses only (mask the prompt) |

- **Memory:** Unsloth lists 10 GB for E4B, and the 4060 has 8 GB. Try the settings above with gradient checkpointing (`"unsloth"`). If it runs out of memory, train on a free 16 GB cloud GPU (Kaggle or Colab), **using public and synthetic data only**. Switch to E2B only if the team agrees.
- **Export:** merge the LoRA → convert to **GGUF Q8_0** → serve with `llama-server`. Do not ship Q4_0: it broke a previous fine-tune of ours.
- **Serving:** force JSON output with llama.cpp's JSON-schema / grammar option, using the contract above. Temperature 0.

**Done when:** on the frozen test set the model returns valid JSON for 100% of rows, and 100% of quotes are exact spans. Log both in `eval/results/`.

## 5 · Speech to text (backend/app/pipeline/asr.py)

- Use `faster-whisper` with **large-v3-turbo**. Phone audio is 8 kHz, so resample to 16 kHz before decoding.
- Keep word-level confidence scores. The language-model term is **down-weighted when ASR confidence is low**.
- Measure **word error rate per language**. Hindi telephone speech is the hard case: even an Indic Whisper fine-tune reaches 26.8% WER on GramVaani (Vistaar, Interspeech 2023). Report the baseline, then decide whether to fine-tune on Vistaar or use IndicWhisper.

**Done when:** `eval/results/` has a WER table per language on a named test set.

## 6 · Voice cues (backend/app/pipeline/voice.py, ml/train_voice.py)

- Silero VAD gives pauses and speech rate; openSMILE eGeMAPS gives the 88 features (pitch, jitter, shimmer, loudness).
- XGBoost trained on CREMA-D, Rasa (and RAVDESS for research runs) → export to ONNX. Call the output **"acoustic arousal (uncalibrated)"**, not "distress".
- **Weight V = 0 until calibrated** on consented pilot calls; after that, at most 10%. Voice can raise concern, but it **never** sets a suicide flag or clears a caller.
- **Licence:** openSMILE is free for research only. Before deployment, buy a commercial licence or rebuild the features with Parselmouth (GPL-3.0) + librosa (ISC).

## 7 · Scoring, overrides and law (deterministic — 100% unit-tested)

**SVI:** `SVI = 0.40·S + 0.35·L + 0.10·V + 0.15·C`, each term 0–100. Bands: Low 0–24 · Moderate 25–49 · High 50–74 · Critical 75–100. The weights are provisional; clinicians set them in the pilot.

- **S** — screeners asked in the call, never inferred: PHQ-2 and GAD-2 (positive at ≥ 3) plus the C-SSRS level.
- **L** — model indicators · **V** — voice (0 for now) · **C** — context: offence, age, disability, repeat threats.

**Overrides** (rules only, checked before and after scoring):

| Condition | Result |
|---|---|
| C-SSRS item 4 (intent), 5 (plan), or 6 (behaviour) within the past 3 months | **CRITICAL** |
| Crisis phrase matched (list per language) | **CRITICAL** |
| Imminent threat reported | **CRITICAL** |
| Model quotes a suicidal thought | at least **HIGH**, and the operator asks the C-SSRS |
| Language we cannot score | at least **MODERATE**, handed to a person |

**C-SSRS skip logic:** always ask items 1, 2 and 6; ask 3–5 only if item 2 is yes.

**Law — `poa_rules.yaml`** (every action must carry a basis, and a lawyer reviews the file before the pilot):

| Trigger | Action | Basis |
|---|---|---|
| Intimidation reported | police must record the complaint (free copy) | SC/ST (PoA) Act s.15A(9); State duty s.15A(1) |
| Witness threatened | apply to the Special Court for protection / relocation | s.15A(6), s.15A(8)(c) |
| Rape or assault | medical aid; relief within 7 days (Annexure-I) | PoA Rules, Rule 12(4) |
| Court dates | travel, diet, daily allowance | Rule 11 |
| Needs a lawyer | free legal aid if they must file or defend a case; NALSA 15100 | LSA Act s.12(a), s.13(1) |
| Suicide risk | Tele-MANAS 14416 warm transfer; 112 only if imminent | C-SSRS protocol (clinical, not a PoA entitlement) |

**Done when:** every scenario in `demo-ui/src/data.ts` is a unit test with its expected band and actions, and all of them pass.

## 8 · Backend API (FastAPI) and UI wiring

| Endpoint | Purpose |
|---|---|
| `POST /sessions` `{channel, lang}` | start a session |
| `POST /sessions/{id}/consent` `{given, by}` | record consent (by a person) |
| `WS /sessions/{id}/stream` | send audio chunks or text turns; receive `{transcript, indicators, svi, band, override, actions}` events |
| `GET /cases?order=risk` | counsellor queue |
| `POST /cases/{id}/ack` `{counsellor}` | acknowledge a Critical alert by name |
| `POST /cases/{id}/bot` `{ai, takeover, transfer}` | bot controls |
| `GET /audit` | ledger view (event hashes only) |

- **Storage:** SQLite now, PostgreSQL in deployment. Transcripts go in an encrypted table with a retention limit.
- **Audit:** the hash chain holds event IDs and hashes only, so an entry can be erased without breaking the chain.
- **Roles:** `operator`, `counsellor`, `supervisor`, `district`. The district role sees actions only, never quotes or scores.
- **UI:** replace the `SCRIPTS` playback in `Chat.tsx` with the WebSocket, and keep `?play=` as an offline demo mode. Add a mic button (MediaRecorder → WebSocket). Point `Console.tsx` at `/cases`.

**Done when:** a synthetic caller can type or speak in the UI, and the band, quotes and actions shown come from the backend. A Critical case appears in the console and can be acknowledged by name.

## 9 · Evaluation gates (eval/run_eval.py)

Run on the frozen test set and write `eval/results/YYYY-MM-DD.md` with the exact commands.

| Gate | Target |
|---|---|
| Sensitivity for High and Critical callers | ≥ 0.95, with every miss reviewed |
| Weighted κ, band vs labels (a blinded clinician in the pilot) | ≥ 0.6 |
| Model-only suicide recall | above the rules-only baseline |
| Quote fidelity | 100% exact transcript spans |
| Error breakdown | by language, dialect, SC/ST, gender and age |
| Word error rate | reported per language |
| Latency | full SVI < 60 s; overrides fire at once |

A gate that is not met stays a target in the deck, and we say so.

## 10 · Privacy and ethics checklist

- [ ] Consent is asked by a person, in the caller's language (DPDP Act 2023 s.6). If declined, no AI runs.
- [ ] Life at risk: a person acts at once (DPDP s.7(f)).
- [ ] Under 18: no AI. A disclosed sexual offence is reported under POCSO s.19.
- [ ] Clinical notes stay on the counsellor console (Mental Healthcare Act s.23). District and police see actions only.
- [ ] PII is masked before storage. RBAC and encryption at rest are in place.
- [ ] No real calls without ethics-committee approval and a separate training opt-in.
- [ ] Breach runbook is ready: DPDP Rules 2025, Rule 7 — a detailed report within 72 hours (in force from 2027).

## 11 · Milestones

| # | Milestone | Done when |
|---|---|---|
| M1 | Rules + SVI engine | all scenario tests pass (step 7) |
| M2 | Dataset | contract-valid JSONL, frozen test split (step 3) |
| M3 | ASR + voice | WER table; ONNX voice model with V weight 0 (steps 5–6) |
| M4 | Gemma 4 LoRA | valid JSON and exact quotes at 100%; GGUF Q8_0 served (step 4) |
| M5 | Backend + UI wired | end-to-end synthetic call in the UI (step 8) |
| M6 | Evaluation | `eval/results/` filled; the deck updated with measured numbers only (step 9) |

**Next-round demo:** a live synthetic call in Hindi — spoken into the UI, scored by the real pipeline, overridden to Critical by a crisis phrase, and acknowledged by name in the console — followed by the `eval/results/` table.
