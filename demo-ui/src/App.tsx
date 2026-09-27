import { useEffect, useState } from 'react'
import Chat from './Chat'
import Console from './Console'
import FineTune from './FineTune'
import type { Lang } from './data'

const TABS = [
  { id: 'chat', label: 'Caller chatbot', icon: 'M4 5h16v11H10l-6 4z' },
  { id: 'console', label: 'Counsellor console · bot control', icon: 'M3 5h18v12H3z M8 21h8 M12 17v4' },
  { id: 'finetune', label: 'Fine-tune dashboard', icon: 'M7 7h10v10H7z M10 3v4 M14 3v4 M10 17v4 M14 17v4 M3 10h4 M3 14h4 M17 10h4 M17 14h4' },
] as const

function readHash() {
  const [route, q] = location.hash.replace(/^#\/?/, '').split('?')
  return { route: route || 'chat', params: new URLSearchParams(q ?? '') }
}

export default function App() {
  const [{ route, params }, setH] = useState(readHash)
  useEffect(() => { const f = () => setH(readHash()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])

  if (params.has('solo')) return (
    <div className="h-full bg-white p-1.5">
      <Chat key={location.hash} solo play={params.get('play') ?? undefined} instant={params.has('instant')} startLang={(params.get('lang') as Lang) ?? undefined} />
    </div>
  )

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-4 bg-navy px-6 py-3 text-white">
        <div className="hi grid size-10 place-items-center rounded-xl bg-white text-xl font-bold text-navy">स</div>
        <div className="leading-tight">
          <div className="text-lg font-bold tracking-wide">SAMVEDNA <span className="hi font-normal opacity-80">संवेदना</span></div>
          <div className="text-[12px] opacity-80">AI stress &amp; trauma assessment · National Helpline Against Atrocities 14566</div>
        </div>
        <nav className="ml-8 flex gap-1">
          {TABS.map(t => (
            <a key={t.id} href={`#${t.id}`}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-semibold ${route === t.id ? 'bg-white text-navy' : 'text-white/85 hover:bg-white/10'}`}>
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2}><path d={t.icon} /></svg>
              {t.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-[11.5px]">
          <span className="rounded-md bg-[#e8a33d] px-2 py-1 font-bold text-[#1b2f45]">DEMO · scripted responses · synthetic callers</span>
          <span className="rounded-md border border-white/40 px-2 py-1">SIH26093 · Neura Forge</span>
        </div>
      </header>
      <main className="min-h-0 flex-1 p-5">
        {route === 'chat' && <Chat key={location.hash} play={params.get('play') ?? undefined} instant={params.has('instant')} startLang={(params.get('lang') as Lang) ?? undefined} />}
        {route === 'console' && <Console key={location.hash} start={params.get('case') ?? undefined} acked={params.has('ack')} />}
        {route === 'finetune' && <FineTune />}
      </main>
    </div>
  )
}
