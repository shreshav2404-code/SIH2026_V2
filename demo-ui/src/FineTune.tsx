import { Card } from './ui'

/* The fine-tune is PLANNED, not run: this screen shows the configuration and the
 * gates the model must pass. The loss chart is an illustrative shape and says so. */

const STEPS = [
  { n: 1, t: 'Data', d: 'licensed public sets', s: 'Licences checked', c: '#2e7d3a' },
  { n: 2, t: 'Hindi', d: 'IndicTrans2 · 8 kHz phone audio', s: 'Planned', c: '#6f63cc' },
  { n: 3, t: 'Fine-tune', d: 'Gemma 4 E4B · QLoRA', s: 'Planned', c: '#5846b5' },
  { n: 4, t: 'Evaluate', d: 'vs clinician labels', s: 'Planned', c: '#44349f' },
  { n: 5, t: 'Ship', d: 'GGUF Q8_0 · llama.cpp', s: 'Planned', c: '#14375e' },
]
const DATA = [
  ['Reddit C-SSRS', '500 users, rated by 4 psychiatrists', 'CC BY 4.0', 'text · suicide-risk levels', 'ok'],
  ['CREMA-D', '7,442 acted clips, 91 actors', 'ODbL 1.0', 'voice · emotion', 'ok'],
  ['AI4Bharat Rasa', 'Assamese, Bengali, Tamil', 'CC BY 4.0', 'voice · Indian languages', 'ok'],
  ['RAVDESS', '7,356 acted files', 'CC BY-NC-SA', 'voice · fear, sadness', 'warn'],
  ['Dreaddit', '3.5K labelled segments', 'to confirm', 'text · stress', 'warn'],
  ['Synthetic Hindi calls', 'scripted with clinicians', 'ours', 'text + audio · labelled synthetic', 'ok'],
  ['DAIC-WOZ · UMD Reddit', 'clinical interviews · Reddit', 'gated', 'not used', 'no'],
]
const HP = [
  ['Base', 'google/gemma-4-E4B-it'], ['Quantisation', '4-bit NF4 (QLoRA)'], ['LoRA', 'r 16 · α 16 · dropout 0'],
  ['Layers', 'language only (vision, audio frozen)'], ['Max sequence', '1,024 tokens'], ['Batch', '1 × grad-accum 8'],
  ['Learning rate', '2e-4, linear decay'], ['Optimiser', 'adamw_8bit'], ['Epochs', '2'], ['Toolkit', 'Unsloth · PEFT · TRL'],
]
const GATES = [
  ['Sensitivity for clinician-rated High / Critical', '≥ 0.95', 'every miss reviewed'],
  ['Weighted κ, band vs blinded clinician', '≥ 0.6', 'ordinal bands'],
  ['Model-only suicide recall', '> rules-only baseline', 'held-out set'],
  ['Quote fidelity', '100% exact transcript spans', 'no paraphrase'],
  ['Errors by language, dialect, SC/ST, gender, age', 'reported', 'bias check'],
  ['Word error rate on consented 14566 audio', 'per language', 'ASR'],
]

export default function FineTune() {
  return (
    <div className="grid h-full grid-cols-[1fr_1fr_1fr] content-start gap-4 overflow-y-auto">
      <div className="col-span-3 flex items-center gap-3 rounded-xl border border-[#e7c68d] bg-[#fdf2dc] px-4 py-2.5 text-[13px] text-[#6b4300]">
        <span className="rounded bg-amber px-2 py-0.5 text-[11px] font-bold text-white">RUN #0 · PLANNED</span>
        Idea stage — configuration and acceptance gates are fixed; no training has run yet, so no results are shown.
      </div>

      {[
        ['Base model', 'Gemma 4 E4B', '4.5B effective · Apache 2.0 · 35+ languages', '#5846b5'],
        ['Method', 'QLoRA fine-tune', '4-bit · language layers · Unsloth', '#1f63b5'],
        ['Hardware', 'RTX 4060 · 8 GB', 'E4B needs 10 GB → 16 GB cloud GPU fallback', '#b76e00'],
      ].map(([k, v, d, c]) => (
        <Card key={k}>
          <div className="text-[11px] font-bold tracking-wide text-muted uppercase">{k}</div>
          <div className="text-xl font-extrabold" style={{ color: c }}>{v}</div>
          <div className="text-[12.5px] text-muted">{d}</div>
        </Card>
      ))}

      <Card title="Pipeline" className="col-span-3">
        <div className="flex items-stretch gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-xl border-2 p-3" style={{ borderColor: s.c }}>
                <div className="flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full text-[13px] font-bold text-white" style={{ background: s.c }}>{s.n}</span>
                  <span className="font-bold" style={{ color: s.c }}>{s.t}</span>
                  <span className={`ml-auto rounded px-1.5 py-0.5 text-[10.5px] font-bold ${s.s === 'Planned' ? 'bg-[#e9eff5] text-muted' : 'bg-[#e6f3e8] text-low'}`}>{s.s}</span>
                </div>
                <div className="mt-1 text-[12px] text-muted">{s.d}</div>
              </div>
              {i < STEPS.length - 1 && <span className="text-lg text-[#e8a33d]">▶</span>}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Training data · licences" className="col-span-2">
        <table className="w-full text-[12.5px]">
          <thead><tr className="text-left text-[11px] text-muted uppercase"><th className="pb-1">Dataset</th><th>Size</th><th>Licence</th><th>Used for</th></tr></thead>
          <tbody>
            {DATA.map(([n, s, l, u, st]) => (
              <tr key={n} className="border-t border-line">
                <td className="py-1.5 font-semibold">{n}</td><td className="text-muted">{s}</td>
                <td><span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${st === 'ok' ? 'bg-[#e6f3e8] text-low' : st === 'warn' ? 'bg-[#fdf2dc] text-amber' : 'bg-[#fbe8e6] text-crit'}`}>{l}</span></td>
                <td className="text-muted">{u}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Hyper-parameters · planned">
        <table className="w-full text-[12.5px]">
          <tbody>{HP.map(([k, v]) => <tr key={k} className="border-t border-line first:border-0"><td className="py-1 text-muted">{k}</td><td className="py-1 text-right font-semibold">{v}</td></tr>)}</tbody>
        </table>
      </Card>

      <Card title="Loss curve" right={<span className="rounded bg-[#e9eff5] px-1.5 py-0.5 text-[10.5px] font-bold text-muted">ILLUSTRATIVE SHAPE · NOT A RESULT</span>}>
        <svg viewBox="0 0 300 150" className="w-full">
          {[0, 1, 2, 3].map(i => <line key={i} x1={30} x2={290} y1={20 + i * 35} y2={20 + i * 35} stroke="#e3e8ee" />)}
          <path d="M30,24 C70,70 110,96 150,108 S250,120 290,122" stroke="#5846b5" strokeWidth={2.5} fill="none" strokeDasharray="5 4" />
          <path d="M30,28 C70,76 110,100 150,112 S250,118 290,116" stroke="#0e7c86" strokeWidth={2.5} fill="none" strokeDasharray="5 4" />
          <text x={34} y={145} fontSize={10} fill="#5b6b7c">steps →</text>
          <text x={200} y={40} fontSize={10} fill="#5846b5">train</text><text x={200} y={54} fontSize={10} fill="#0e7c86">validation</text>
          <text x={160} y={80} fontSize={18} fontWeight={800} fill="#c4ccd8" textAnchor="middle" transform="rotate(-10 160 80)">no run yet</text>
        </svg>
      </Card>

      <Card title="Acceptance gates · must pass before shipping" className="col-span-2">
        <table className="w-full text-[12.5px]">
          <thead><tr className="text-left text-[11px] text-muted uppercase"><th className="pb-1">Metric</th><th>Target</th><th>Note</th><th className="text-right">Status</th></tr></thead>
          <tbody>
            {GATES.map(([m, tg, n]) => (
              <tr key={m} className="border-t border-line">
                <td className="py-1.5 font-semibold">{m}</td><td className="font-bold text-navy">{tg}</td><td className="text-muted">{n}</td>
                <td className="text-right"><span className="rounded bg-[#e9eff5] px-1.5 py-0.5 text-[11px] font-bold text-muted">pending</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Model output contract" className="col-span-2">
        <pre className="overflow-x-auto rounded-lg bg-[#0f2440] p-3 text-[11.5px] leading-relaxed text-[#cfe3ff]">{`{
  "indicators": [
    { "sign": "suicidal_ideation", "quote": "मैंने तय कर लिया है, अब और नहीं जीना", "start_ms": 372400 },
    { "sign": "intimidation",      "quote": "वो रोज़ धमकी देते हैं, गवाही मत देना", "start_ms": 277100 }
  ],
  "language": "hi"
}   // quotes must be exact transcript spans; the score is computed outside the model`}</pre>
      </Card>
      <Card title="Ship">
        <ul className="space-y-1.5 text-[12.5px]">
          <li>▸ Merge LoRA → export <b>GGUF Q8_0</b> (Q4 broke an earlier fine-tune)</li>
          <li>▸ Serve with <b>llama.cpp</b> on the centre’s GPU server</li>
          <li>▸ Voice model → <b>ONNX</b></li>
          <li>▸ Nothing leaves the premises</li>
        </ul>
      </Card>
    </div>
  )
}
