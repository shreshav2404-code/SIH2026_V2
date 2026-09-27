import { useEffect, useRef, useState } from 'react'
import {
  AFTER_CONSENT, CONSENT, CONSENT_NO, CONSENT_YES, SCRIPTS, SIGNS,
  type BotReply, type Lang, type Script, type T,
} from './data'
import { BandChip, Card, Gauge, KIND_STYLE, SviBar } from './ui'

type Msg = { id: number; user?: string; bot?: BotReply }

const DECLINED: BotReply = {
  intro: {
    en: 'Understood — the AI is now switched off for this conversation. A helpline operator is joining you; nothing you say will be analysed.',
    hi: 'ठीक है — इस बातचीत के लिए AI अब बंद है। हेल्पलाइन के एक कर्मचारी आपसे जुड़ रहे हैं; आपकी किसी भी बात का विश्लेषण नहीं होगा।',
  },
}

export default function Chat({ play, instant, startLang, solo }: { play?: string; instant?: boolean; startLang?: Lang; solo?: boolean }) {
  const [lang, setLang] = useState<Lang>(startLang ?? 'en')
  const [msgs, setMsgs] = useState<Msg[]>(solo ? [] : [{ id: 0, bot: CONSENT }])
  const [consent, setConsent] = useState<'ask' | 'yes' | 'no'>(solo ? 'yes' : 'ask')
  const [typing, setTyping] = useState(false)
  const [active, setActive] = useState<Script | null>(null)
  const [busy, setBusy] = useState(false)
  const consentRef = useRef<'ask' | 'yes' | 'no'>(solo ? 'yes' : 'ask'), busyRef = useRef(false)
  const idRef = useRef(1)
  const listRef = useRef<HTMLDivElement>(null)
  const t = (x: T) => x[lang]

  const push = (m: Omit<Msg, 'id'>) => setMsgs(ms => [...ms, { ...m, id: idRef.current++ }])
  const wait = (ms: number) => new Promise(r => setTimeout(r, instant ? 0 : ms))

  async function giveConsent(yes: boolean) {
    if (consentRef.current !== 'ask') return
    push({ user: t(yes ? CONSENT_YES : CONSENT_NO) })
    consentRef.current = yes ? 'yes' : 'no'
    setConsent(yes ? 'yes' : 'no')
    setTyping(true); await wait(700); setTyping(false)
    push({ bot: yes ? AFTER_CONSENT : DECLINED })
  }

  async function run(s: Script) {
    if (busyRef.current || consentRef.current !== 'yes') return
    busyRef.current = true; setBusy(true)
    for (const turn of s.turns) {
      if (turn.user) { push({ user: t(turn.user) }); await wait(350) }
      if (turn.bot) {
        setTyping(true); await wait(turn.bot.from === 'counsellor' ? 1500 : 1100); setTyping(false)
        push({ bot: turn.bot })
        setActive(s)
        await wait(450)
      }
    }
    busyRef.current = false; setBusy(false)
  }

  /* scripted playback for screenshots and the demo video: ?play=<id> */
  useEffect(() => {
    if (!play) return
    const s = SCRIPTS.find(x => x.id === play)
    ;(async () => {
      await wait(400)
      if (!solo) { await giveConsent(true); await wait(500) }
      if (s) await run(s)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { listRef.current?.scrollTo({ top: 1e6, behavior: instant ? 'auto' : 'smooth' }) }, [msgs, typing, instant])

  return (
    <div className={solo ? 'h-full' : 'grid h-full grid-cols-[440px_1fr] gap-5'}>
      {/* ------------ the caller's phone ------------ */}
      <div className={`flex min-h-0 flex-col overflow-hidden bg-[#f4f6f9] ${solo ? 'h-full rounded-[18px] border-[4px] border-[#1b2f45]' : 'rounded-[28px] border-[6px] border-[#1b2f45] shadow-xl'}`}>
        <div className="flex items-center gap-3 bg-navy px-4 py-3 text-white">
          <div className="grid size-9 place-items-center rounded-full bg-white/15 text-lg font-bold hi">स</div>
          <div className="leading-tight">
            <div className="font-bold">SAMVEDNA <span className="hi font-normal opacity-80">संवेदना</span></div>
            <div className="text-[11px] opacity-80">NHAA 14566 · web chat</div>
          </div>
          <div className="ml-auto flex overflow-hidden rounded-md border border-white/40 text-[11px] font-semibold">
            {(['en', 'hi'] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} className={`px-2 py-1 ${lang === l ? 'bg-white text-navy' : ''}`}>
                {l === 'en' ? 'EN' : 'हिं'}
              </button>
            ))}
          </div>
        </div>
        {consent === 'yes' && (
          <div className="flex items-center gap-2 border-b border-line bg-[#e6f3e8] px-4 py-1.5 text-[11px] text-[#1f4f27]">
            <span className="size-2 rounded-full bg-low" /> AI assistance on · consent given · stays on the helpline server
          </div>
        )}
        {consent === 'no' && (
          <div className="border-b border-line bg-[#fdf2dc] px-4 py-1.5 text-[11px] text-[#7a4a00]">AI off for this chat · a person is responding</div>
        )}

        <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-4">
          {msgs.map(m => m.user
            ? <div key={m.id} className="rise flex justify-end"><div className={`max-w-[80%] rounded-2xl rounded-br-sm bg-[#1f63b5] px-3.5 py-2 text-[13.5px] text-white ${lang === 'hi' ? 'hi' : ''}`}>{m.user}</div></div>
            : <Bubble key={m.id} r={m.bot!} lang={lang}
                onQuick={() => {}} consentAsk={m.id === 0 && consent === 'ask'} onConsent={giveConsent} />)}
          {typing && <div className="flex gap-1 pl-2">{[0, 1, 2].map(i => <span key={i} className="size-2 animate-bounce rounded-full bg-muted/60" style={{ animationDelay: `${i * .15}s` }} />)}</div>}
        </div>

        {!solo && <div className="border-t border-line bg-white px-3 pt-2 pb-3">
          <div className="mb-2 text-[11px] font-semibold tracking-wide text-muted uppercase">{lang === 'en' ? 'Try a question' : 'कोई सवाल चुनिए'}</div>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {SCRIPTS.map(s => (
              <button key={s.id} onClick={() => run(s)} disabled={consent !== 'yes' || busy}
                className={`rounded-full border px-2.5 py-1 text-left text-[11.5px] disabled:opacity-40 ${s.id === 'crisis' ? 'border-[#efc4bf] bg-[#fbe8e6] text-[#8e1f18]' : 'border-line bg-[#f4f6f9] text-ink hover:bg-[#e9f1fb]'} ${lang === 'hi' ? 'hi' : ''}`}>
                {t(s.chip)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-full border border-line bg-[#f4f6f9] px-3 py-2">
            <span className="flex-1 text-[13px] text-muted">{lang === 'en' ? 'Type or speak…' : 'लिखें या बोलें…'}</span>
            <span className="grid size-8 place-items-center rounded-full bg-[#0e7c86] text-white">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2.2}><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z M5 11a7 7 0 0 0 14 0 M12 18v3" /></svg>
            </span>
          </div>
        </div>}
      </div>

      {/* ------------ what the system sees ------------ */}
      {!solo && <Analysis s={active} lang={lang} consent={consent} />}
    </div>
  )
}

function Bubble({ r, lang, onQuick, consentAsk, onConsent }: {
  r: BotReply; lang: Lang; onQuick: (q: T) => void; consentAsk: boolean; onConsent: (y: boolean) => void
}) {
  const t = (x: T) => x[lang], hi = lang === 'hi' ? 'hi' : ''
  const counsellor = r.from === 'counsellor'
  return (
    <div className="rise space-y-2">
      {r.system && (
        <div className="pulse flex items-center gap-2 rounded-lg bg-crit px-3 py-2 text-[12px] font-bold text-white">
          <svg viewBox="0 0 24 24" className="size-4 flex-none" fill="none" stroke="currentColor" strokeWidth={2.4}><path d="M12 3l10 18H2z M12 10v5 M12 18h.01" /></svg>
          <span className={hi}>{t(r.system)}</span>
        </div>
      )}
      <div className="flex items-end gap-2">
        <div className={`grid size-7 flex-none place-items-center rounded-full text-[12px] font-bold text-white ${counsellor ? 'bg-violet' : 'bg-navy'} ${counsellor ? '' : 'hi'}`}>{counsellor ? 'M' : 'स'}</div>
        <div className={`max-w-[84%] rounded-2xl rounded-bl-sm border px-3.5 py-2.5 text-[13.5px] leading-snug shadow-sm ${counsellor ? 'border-[#cfc8ee] bg-[#efecfa]' : 'border-line bg-white'} ${hi}`}>
          {counsellor && <div className="mb-1 text-[11px] font-bold text-violet">Meera · duty counsellor (human)</div>}
          <p>{t(r.intro)}</p>
          {r.bullets && (
            <ul className="mt-2 space-y-1.5">
              {r.bullets.map((b, i) => (
                <li key={i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 flex-none rounded-full bg-low" />
                  <span>{t(b.text)} {b.cite && <span className="ml-0.5 inline-block rounded bg-[#e6f3e8] px-1.5 text-[10.5px] font-semibold whitespace-nowrap text-[#1f4f27]">{b.cite}</span>}</span>
                </li>
              ))}
            </ul>
          )}
          {r.outro && <p className="mt-2">{t(r.outro)}</p>}
          {r.quick && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {r.quick.map((q, i) => <button key={i} onClick={() => onQuick(q)} className="rounded-full border border-[#1f63b5] px-2.5 py-0.5 text-[12px] text-[#1f63b5]">{t(q)}</button>)}
            </div>
          )}
          {consentAsk && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => onConsent(true)} className="rounded-full bg-low px-3 py-1 text-[12.5px] font-semibold text-white">{t(CONSENT_YES)}</button>
              <button onClick={() => onConsent(false)} className="rounded-full border border-line px-3 py-1 text-[12.5px] font-semibold text-ink">{t(CONSENT_NO)}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Analysis({ s, lang, consent }: { s: Script | null; lang: Lang; consent: string }) {
  if (consent === 'no') return (
    <Card title="What the system sees" className="grid place-items-center">
      <div className="max-w-md text-center text-muted"><div className="mb-2 text-4xl">⏸</div>AI analysis is off — the caller declined. The operator still asks the C-SSRS screening questions and escalates the same way.</div>
    </Card>
  )
  if (!s) return (
    <Card title="What the system sees" right={<span className="text-[11px] text-muted">waiting for the caller</span>}>
      <div className="grid grid-cols-5 gap-3 pt-6">
        {['Consent', 'Listen', 'Understand', 'Score', 'Advise'].map((x, i) => (
          <div key={x} className="rounded-xl border border-dashed border-line p-4 text-center">
            <div className="mx-auto mb-2 grid size-9 place-items-center rounded-full bg-[#e9f1fb] font-bold text-navy">{i + 1}</div>
            <div className="text-[13px] font-semibold">{x}</div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-[13px] text-muted">Ask a question on the left — the risk band, warning signs and recommended help appear here as the caller talks.</p>
    </Card>
  )
  return (
    <div className="grid min-h-0 grid-cols-2 content-start gap-4 overflow-y-auto">
      <Card title="Stress Vulnerability Index" right={<BandChip band={s.band} big />}>
        <div className="flex items-center gap-4">
          <Gauge value={s.svi} band={s.band} />
          <div className="flex-1 text-[12.5px] text-muted">
            SVI = .40 S + .35 L + .10 V + .15 C
            <div className="mt-3"><SviBar parts={s.parts} /></div>
          </div>
        </div>
        {s.override && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-crit px-3 py-2 text-[12.5px] font-bold text-white">
            <span>OVERRIDE</span><span className="font-normal">{s.override}</span>
          </div>
        )}
      </Card>

      <Card title="Warning signs · with the caller’s words" right={<span className="rounded bg-violet px-1.5 py-0.5 text-[10px] font-bold text-white">GEMMA 4 · LoRA</span>}>
        <div className="grid grid-cols-2 gap-1.5">
          {SIGNS.map(g => {
            const hit = s.signals.find(x => x.key === g.key)
            return (
              <div key={g.key} className={`rounded-lg border px-2.5 py-1.5 ${hit ? 'border-[#cfc8ee] bg-[#efecfa]' : 'border-line bg-[#f7f9fb] opacity-60'}`}>
                <div className={`text-[12px] font-semibold ${hit ? 'text-violet' : 'text-muted'}`}>{hit ? '●' : '○'} {g.label}</div>
                {hit && <div className={`mt-0.5 text-[11.5px] text-ink ${lang === 'hi' ? 'hi' : ''}`}>{hit.quote[lang]}</div>}
              </div>
            )
          })}
        </div>
      </Card>

      <Card title="Recommended help · with its legal basis" className="col-span-2">
        <div className="grid grid-cols-2 gap-2">
          {s.actions.map(a => (
            <div key={a.label} className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${KIND_STYLE[a.kind]}`}>
              <span className="text-[13px] font-semibold">{a.label}</span>
              <span className="ml-auto rounded bg-white/70 px-1.5 py-0.5 text-[11px] font-semibold whitespace-nowrap">{a.basis}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Voice cues" right={<span className="text-[11px] text-muted">weight ≤ 10% · uncalibrated</span>}>
        <div className="flex flex-wrap gap-1.5">
          {s.voice.map(v => <span key={v} className="rounded-full bg-[#e2f3f4] px-2.5 py-1 text-[12px] font-medium text-[#0b5f67]">{v}</span>)}
        </div>
        <p className="mt-2 text-[11.5px] text-muted">Voice can raise concern; it never sets a suicide flag or clears a caller.</p>
      </Card>
      <Card title="Privacy">
        <ul className="space-y-1 text-[12.5px]">
          <li>✓ Consent recorded · on-premise only</li>
          <li>✓ Police and district see actions, never quotes or scores</li>
          <li>✓ Event logged to the hash-chained audit ledger</li>
        </ul>
      </Card>
      <Card title="How this answer was built" className="col-span-2">
        <div className="flex items-center gap-2">
          {[
            ['Consent', 'given, by a person', '#8a4b0f'], ['Speech → text', 'Whisper, on-premise', '#0e7c86'],
            ['Warning signs', 'Gemma 4 + our LoRA', '#5846b5'], ['SVI + overrides', 'arithmetic + rules', '#b76e00'],
            ['Legal help', 'PoA rules-as-code', '#2e7d3a'], ['Counsellor', 'decides and acts', '#14375e'],
          ].map(([a, b, c], i, arr) => (
            <div key={a} className="flex flex-1 items-center gap-2">
              <div className="flex-1 rounded-lg border-2 px-2.5 py-1.5" style={{ borderColor: c }}>
                <div className="text-[12.5px] font-bold" style={{ color: c }}>✓ {a}</div>
                <div className="text-[11px] text-muted">{b}</div>
              </div>
              {i < arr.length - 1 && <span className="text-[#e8a33d]">▶</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
