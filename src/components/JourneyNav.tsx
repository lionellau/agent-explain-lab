import { Link } from 'react-router-dom';
import { CHAPTERS, findChapterIndex } from '../chapters';

const DOT_BG: Record<string, string> = {
  'text-coral':      'bg-coral',
  'text-sun':        'bg-sun',
  'text-mint':       'bg-mint',
  'text-sky':        'bg-sky',
  'text-grape-soft': 'bg-grape-soft',
  'text-rose':       'bg-rose'
};

export default function JourneyNav({ current }: { current: string }) {
  const i = findChapterIndex(current);
  if (i < 0) return null;
  const prev = i > 0 ? CHAPTERS[i - 1] : null;
  const next = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 mt-12 mb-6">
      <div className="flex flex-wrap gap-3 justify-between items-stretch">
        {prev ? (
          <Link
            to={prev.path}
            className="group flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 transition-all"
          >
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <div className="text-left">
              <p className="text-xs text-paper/40">Previous</p>
              <p className={`font-semibold ${prev.accentText}`}>{prev.emoji} {prev.title}</p>
            </div>
          </Link>
        ) : <div className="flex-1" />}

        {next ? (
          <Link
            to={next.path}
            className="group flex-1 min-w-[180px] flex items-center gap-3 px-4 py-3 rounded-xl bg-grape/10 hover:bg-grape/20 border border-grape-soft/30 hover:border-grape-soft transition-all justify-end"
          >
            <div className="text-right">
              <p className="text-xs text-paper/40">Next up</p>
              <p className={`font-semibold ${next.accentText}`}>{next.emoji} {next.title}</p>
            </div>
            <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        ) : <div className="flex-1" />}
      </div>

      <div className="mt-6 flex gap-1 justify-center flex-wrap max-w-3xl mx-auto">
        {CHAPTERS.map((c, idx) => (
          <Link
            key={c.path}
            to={c.path}
            title={`${c.n} ${c.title}`}
            className={`h-1.5 rounded-full transition-all ${
              idx === i ? `w-8 ${DOT_BG[c.accentText] ?? 'bg-grape-soft'}` :
              idx <  i ? 'w-3 bg-white/30 hover:bg-white/50' :
                         'w-3 bg-white/10 hover:bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
