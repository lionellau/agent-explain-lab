import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import JourneyNav from './JourneyNav';
import type { Chapter } from '../chapters';
import { CHAPTERS, findChapterIndex } from '../chapters';

interface Props {
  chapter: Chapter;
  intro: string;
  demo: ReactNode;
  story: ReactNode;
  extras?: ReactNode;
  outro?: string;
}

/**
 * Split layout: the visual sits on the left (or top on mobile),
 * the explanation card + Next button sits on the right (or below on mobile).
 *
 * Crucial property: on a normal desktop screen the Next step button is
 * visible WITHOUT scrolling. That was the main UX problem with v1.
 */
export default function ChapterShell({ chapter: c, intro, demo, story, extras, outro }: Props) {
  const idx = findChapterIndex(c.path);
  const total = CHAPTERS.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <header className="mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <p className={`${c.accentText} text-xs uppercase tracking-widest font-semibold`}>
            Chapter {idx + 1} of {total}
          </p>
          <p className="text-paper/40 text-xs">~1 minute to read</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 leading-tight">
          <span className="text-3xl">{c.emoji}</span>
          <span>{c.title}</span>
        </h1>
        <p className="text-paper/70 max-w-3xl leading-relaxed mt-2">{intro}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-5 items-start">
        <div>
          <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-4 md:p-5">
            <p className="text-[10px] uppercase tracking-widest text-paper/40 mb-3">Watch</p>
            {demo}
          </div>
          {extras && <div className="mt-4">{extras}</div>}
        </div>

        <aside className="lg:sticky lg:top-20 self-start">
          {story}
          {outro && (
            <p className="mt-4 text-center text-paper/55 text-sm leading-relaxed italic px-2">
              {outro}
            </p>
          )}
          {idx >= 0 && idx < total - 1 && (
            <Link
              to={CHAPTERS[idx + 1].path}
              className="mt-4 group flex items-center gap-3 px-4 py-3 rounded-xl bg-grape/10 hover:bg-grape/20 border border-grape-soft/30 hover:border-grape-soft transition-all"
            >
              <div className="text-left min-w-0">
                <p className="text-[10px] text-paper/40 uppercase tracking-widest">After this chapter</p>
                <p className={`font-semibold truncate ${CHAPTERS[idx + 1].accentText}`}>
                  {CHAPTERS[idx + 1].emoji} {CHAPTERS[idx + 1].title}
                </p>
              </div>
              <span className="ml-auto text-xl group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          )}
        </aside>
      </div>

      <JourneyNav current={c.path} />
    </div>
  );
}
