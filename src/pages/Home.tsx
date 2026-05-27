import { Link } from 'react-router-dom';
import { CHAPTERS, STORY } from '../chapters';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-grape-soft text-sm uppercase tracking-widest mb-3">
          A 15-minute guided tour
        </p>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-5">
          How does an{' '}
          <span className="bg-gradient-to-r from-sun via-coral to-grape-soft bg-clip-text text-transparent">
            AI agent
          </span>{' '}
          actually work?
        </h1>
        <p className="text-lg text-paper/70 leading-relaxed mb-6">
          Fifteen short, friendly animations. No math. No code. Each one shows you a different part of
          what makes an AI agent different from a regular chatbot. Just read the white card, watch the
          animation update, then press Next when you're ready.
        </p>
        <p className="text-paper/60 leading-relaxed max-w-xl mx-auto mb-8">
          We use one running story: <b className="text-paper">{STORY.who}</b> asks the agent —{' '}
          <i className="text-sun">"{STORY.ask}"</i>
        </p>
        <Link
          to={CHAPTERS[0].path}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-grape hover:bg-grape/80 font-semibold text-lg transition-all anim-pulse-glow"
        >
          ▶ Begin tour
        </Link>
        <p className="mt-3 text-paper/40 text-sm">or jump to any chapter below</p>
      </section>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {CHAPTERS.map((c) => (
          <Link
            key={c.path}
            to={c.path}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${c.gradient} bg-ink-soft p-6 transition-all hover:border-white/30 hover:-translate-y-0.5`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-5xl group-hover:scale-110 transition-transform">{c.emoji}</span>
              <span className="text-xs font-mono text-paper/40">{c.n}</span>
            </div>
            <h2 className={`text-2xl font-bold mb-1 ${c.accentText}`}>{c.title}</h2>
            <p className="text-paper/90 text-sm font-medium mb-2">{c.tagline}</p>
            <p className="text-paper/60 text-sm leading-relaxed">{c.blurb}</p>
            <div className="mt-5 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Play →
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 max-w-2xl mx-auto text-center text-paper/50 text-sm leading-relaxed">
        <p>
          These chapters use small hand-crafted examples — not a real running agent — so you can see the
          moving parts clearly. The concepts are exactly the same as the real systems; real ones just
          do this thousands of times in the background.
        </p>
      </section>
    </div>
  );
}
