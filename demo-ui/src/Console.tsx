import { useState } from 'react'
import { QUEUE, SIGNS, type Case } from './data'
import { BandChip, Card, Gauge, KIND_STYLE, SviBar } from './ui'

export default function Console({ start, acked }: { start?: string; acked?: boolean }) {
  const [sel, setSel] = useState<Case>(QUEUE.find(c => c.id === start) ?? QUEUE[0])
  const [ack, setAck] = useState(!!acked)
  const [bot, setBot] = useState({ ai: true, voice: false, handoff: true, lang: 'Auto-detect' })

  return (
    <div className="grid h-full grid-cols-[300px_1fr_300px] gap-4">
      {/* ------------ queue ------------ */}
      <Card title="Risk queue" right={<span className="text-[11px] text-muted">{QUEUE.length} open · highest first</span>} className="min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {QUEUE.map(c => (
            <button key={c.id} onClick={() => { setSel(c); setAck(false) }}
              className={`w-full rounded-lg border p-2.5 text-left transition ${sel.id === c.id ? 'border-navy bg-[#e9f1fb] ring-1 ring-navy' : 'border-line bg-white hover:bg-[#f4f6f9]'}`}>
              <div className="flex items-center gap-2">
                <BandChip band={c.band} />
                <span className="font-semibold">{c.id}</span>
                <span className="ml-auto text-[15px] font-extrabold" style={{ color: c.band === 'MODERATE' ? '#8a5a00' : undefined }}>
                  <span className={c.band === 'CRITICAL' ? 'text-crit' : c.band === 'HIGH' ? 'text-high' : c.band === 'LOW' ? 'text-low' : ''}>{c.svi}</span>
                </span>
              </div>
              <div className="mt-1 text-[12px] text-ink">{c.summary}</div>
              <div className="mt-1 flex gap-2 text-[11px] text-muted"><span>{c.lang}</span>·<span>{c.channel}</span><span className="ml-auto">waiting {c.wait}</span></div>
            </button>
          ))}
        </div>
      </Card>

      {/* ------------ selected case ------------ */}
      <div className="grid min-h-0 grid-cols-2 content-start gap-4 overflow-y-auto">
        <Card className="col-span-2">
          <div className="flex items-center gap-3">
            <div className={`grid size-11 place-items-center rounded-full text-white ${sel.band === 'CRITICAL' ? 'pulse bg-crit' : 'bg-navy'}`}>
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M12 4a4 4 0 1 1 0 8a4 4 0 1 1 0-8z M4 21a8 8 0 0 1 16 0" /></svg>
            </div>
            <div>
              <div className="text-lg font-bold text-navy">Caller {sel.id} <BandChip band={sel.band} /></div>
              <div className="text-[12.5px] text-muted">{sel.lang} · {sel.channel} · {sel.status}</div>
            </div>
            <div className="ml-auto flex gap-2">
              {sel.band === 'CRITICAL' && (
                <button onClick={() => setAck(true)} disabled={ack}
                  className={`rounded-lg px-4 py-2 text-[13px] font-bold text-white ${ack ? 'bg-low' : 'pulse bg-crit'}`}>
                  {ack ? '✓ Acknowledged · Meera (duty counsellor) · 06:13' : 'Acknowledge Critical'}
                </button>
              )}
            </div>
          </div>
        </Card>

        <Card title="Stress Vulnerability Index">
          <div className="flex items-center gap-3">
            <Gauge value={sel.svi} band={sel.band} size={170} />
            <div className="flex-1"><SviBar parts={sel.parts} /></div>
          </div>
          {sel.override && <div className="mt-3 rounded-lg bg-crit px-3 py-2 text-[12.5px] font-semibold text-white">OVERRIDE · {sel.override}</div>}
        </Card>

        <Card title="C-SSRS screener" right={<span className="text-[11px] text-muted">asked, never inferred</span>}>
          <table className="w-full text-[12.5px]">
            <tbody>
              {sel.cssrs.map(([q, a]) => (
                <tr key={q} className="border-b border-line last:border-0">
                  <td className="py-1.5">{q}</td>
                  <td className={`py-1.5 text-right font-bold ${a === 'Yes' ? 'text-crit' : 'text-low'}`}>{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card title="Evidence · exact transcript spans" className="col-span-2">
          {sel.quotes.length === 0 && <div className="text-[13px] text-muted">No warning signs detected.</div>}
          <div className="space-y-2">
            {sel.quotes.map(q => (
              <div key={q.t} className="flex items-center gap-3 rounded-lg border border-[#cfc8ee] bg-[#efecfa] px-3 py-2">
                <span className="rounded bg-violet px-1.5 py-0.5 text-[10.5px] font-bold text-white uppercase">{SIGNS.find(s => s.key === q.tag)?.label}</span>
                <div className="min-w-0 flex-1">
                  <div className="hi text-[14px]">“{q.text}”</div>
                  {q.gloss && <div className="text-[11.5px] text-muted italic">{q.gloss}</div>}
                </div>
                <button className="flex items-center gap-1 rounded-full border border-violet px-2 py-0.5 text-[11px] font-semibold text-violet">▶ {q.t}</button>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recommended actions · legal basis" className="col-span-2">
          <div className="grid grid-cols-2 gap-2">
            {sel.actions.map(a => (
              <div key={a.label} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${KIND_STYLE[a.kind]}`}>
                <input type="checkbox" defaultChecked={a.kind === 'safety'} className="size-4 accent-navy" />
                <span className="text-[13px] font-semibold">{a.label}</span>
                <span className="ml-auto rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap">{a.basis}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ------------ chatbot control ------------ */}
      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <Card title="Chatbot control">
          <Toggle label="AI assistant on this chat" on={bot.ai} set={v => setBot({ ...bot, ai: v })} />
          <Toggle label="Hand off to counsellor on HIGH+" on={bot.handoff} set={v => setBot({ ...bot, handoff: v })} />
          <Toggle label="Voice term in SVI (after calibration)" on={bot.voice} set={v => setBot({ ...bot, voice: v })} />
          <div className="mt-3 text-[12px] text-muted">Language</div>
          <select value={bot.lang} onChange={e => setBot({ ...bot, lang: e.target.value })} className="mt-1 w-full rounded-lg border border-line px-2 py-1.5 text-[13px]">
            {['Auto-detect', 'Hindi', 'Bhojpuri lexicon', 'Awadhi lexicon', 'English', 'Other → IndicTrans2'].map(l => <option key={l}>{l}</option>)}
          </select>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className="rounded-lg bg-navy px-2 py-2 text-[12.5px] font-bold text-white">Take over chat</button>
            <button className="rounded-lg bg-violet px-2 py-2 text-[12.5px] font-bold text-white">Transfer 14416</button>
            <button className="rounded-lg border border-crit px-2 py-2 text-[12.5px] font-bold text-crit">Call 112</button>
            <button className="rounded-lg border border-line px-2 py-2 text-[12.5px] font-bold text-ink">Pause bot</button>
          </div>
        </Card>
        <Card title="Override rules" right={<span className="text-[10.5px] text-muted">rules only · no model</span>}>
          <ul className="space-y-1.5 text-[12.5px]">
            <li className="flex gap-2"><span className="text-crit">●</span> C-SSRS 4, 5 or recent 6 → CRITICAL</li>
            <li className="flex gap-2"><span className="text-crit">●</span> Crisis phrase (per-language list) → CRITICAL</li>
            <li className="flex gap-2"><span className="text-crit">●</span> Imminent threat → CRITICAL</li>
            <li className="flex gap-2"><span className="text-high">●</span> Quoted suicidal thought → ≥ HIGH</li>
            <li className="flex gap-2"><span className="text-mod">●</span> Unscored language → ≥ MODERATE</li>
          </ul>
        </Card>
        <Card title="Audit ledger" right={<span className="text-[10.5px] text-muted">hash-chained</span>}>
          <ul className="space-y-1.5 font-mono text-[11px] text-muted">
            <li>06:11:02 consent · by operator · <span className="text-ink">9f3c…a1</span></li>
            <li>06:12:41 override · C-SSRS 4 · <span className="text-ink">4b7e…0c</span></li>
            <li>06:12:42 alert · duty counsellor · <span className="text-ink">c21d…77</span></li>
            <li>{ack ? '06:13:05 ack · Meera · ' : '— awaiting acknowledgement'}{ack && <span className="text-ink">e8a0…3f</span>}</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button onClick={() => set(!on)} className="flex w-full items-center gap-3 py-1.5 text-left text-[13px]">
      <span className={`relative h-5 w-9 flex-none rounded-full transition ${on ? 'bg-low' : 'bg-[#c4ccd8]'}`}>
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition ${on ? 'left-4.5' : 'left-0.5'}`} />
      </span>
      {label}
    </button>
  )
}
