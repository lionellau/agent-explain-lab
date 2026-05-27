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
 * Responsive layout:
 *   Desktop (lg+): visual on left (1fr), story on right (400px), story sticky-top.
 *   Mobile (<lg):  visual fills the page; story panel is FIXED to the bottom of
 *                  the viewport so the Next button is always thumb-reachable
 *                  without scrolling, and the diagram stays visible above it.
 */
export default function ChapterShell({ chapter: c, intro, demo, story, extras, outro }: Props) {
  const idx = findChapterIndex(c.path);
  const total = CHAPTERS.length;
  const nextChapter = idx >= 0 && idx < total - 1 ? CHAPTERS[idx + 1] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-[260px] lg:pb-8">
      <header className="mb-5">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
          <p className={`${c.accentText} text-xs uppercase tracking-widest font-bold`}>
            Chapter {idx + 1} of {total}
          </p>
          <p className="text-paper/55 text-xs">~1 minute to read</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3 leading-tight">
          <span className="text-3xl">{c.emoji}</span>
          <span>{c.title}</span>
        </h1>
        <p className="text-paper/85 max-w-3xl leading-relaxed mt-2">{intro}</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_400px] gap-5 items-start">
        <div className="space-y-4">
          <div className="bg-ink-soft border border-white/15 rounded-2xl p-4 md:p-5">
            <p className="text-[10px] uppercase tracking-widest text-paper/55 font-bold mb-3">Watch</p>
            {demo}
          </div>
          {extras}

          {/* Outro + next-chapter card live here on MOBILE (in main flow under the demo). */}
          <div className="lg:hidden space-y-3">
            {outro && (
              <p className="text-paper/70 text-sm italic px-2 leading-relaxed">{outro}</p>
            )}
            {nextChapter && (
              <Link
                to={nextChapter.path}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-soft border border-grape-soft/40 hover:border-grape-soft transition-all"
              >
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-paper/55 uppercase tracking-widest font-bold">After this chapter</p>
                  <p className={`font-bold truncate ${nextChapter.accentText}`}>
                    {nextChapter.emoji} {nextChapter.title}
                  </p>
                </div>
                <span className="ml-auto text-xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </div>

        {/* Story panel — desktop: sticky-top right column.
            Mobile: FIXED to viewport bottom so Next is always reachable. */}
        <aside
          className={[
            // Desktop position
            'lg:static lg:self-start lg:sticky lg:top-20',
            // Mobile position: fixed to viewport bottom
            'fixed bottom-0 left-0 right-0 z-30',
            // Mobile chrome: solid backdrop, top border, big shadow
            'bg-ink-soft border-t-2 border-grape-soft/40',
            'shadow-[0_-12px_40px_rgba(0,0,0,0.55)]',
            'lg:bg-transparent lg:border-none lg:shadow-none',
            // Mobile padding + scroll if explanation is long
            'px-3 pt-3 pb-3 sm:px-4 lg:p-0',
            'max-h-[55vh] overflow-y-auto lg:max-h-none lg:overflow-visible'
          ].join(' ')}
        >
          {story}

          {/* Outro + next-chapter card live INSIDE the aside on desktop. */}
          <div className="hidden lg:block">
            {outro && (
              <p className="mt-4 text-center text-paper/70 text-sm leading-relaxed italic px-2">
                {outro}
              </p>
            )}
            {nextChapter && (
              <Link
                to={nextChapter.path}
                className="mt-4 group flex items-center gap-3 px-4 py-3 rounded-xl bg-ink-soft border border-grape-soft/40 hover:border-grape-soft transition-all"
              >
                <div className="text-left min-w-0">
                  <p className="text-[10px] text-paper/55 uppercase tracking-widest font-bold">After this chapter</p>
                  <p className={`font-bold truncate ${nextChapter.accentText}`}>
                    {nextChapter.emoji} {nextChapter.title}
                  </p>
                </div>
                <span className="ml-auto text-xl group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            )}
          </div>
        </aside>
      </div>

      {/* JourneyNav (big prev/next + all-15 dots) — desktop only. Mobile uses
          the sticky story panel + the after-this-chapter card under the demo. */}
      <div className="hidden lg:block">
        <JourneyNav current={c.path} />
      </div>
    </div>
  );
}
