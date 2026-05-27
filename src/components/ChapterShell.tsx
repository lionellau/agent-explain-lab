import type { ReactNode } from 'react';
import JourneyNav from './JourneyNav';
import type { Chapter } from '../chapters';

interface Props {
  chapter: Chapter;
  // Subtitle line under the title — usually one short sentence
  intro: string;
  // The animated visual area
  demo: ReactNode;
  // The StorySteps walkthrough
  story: ReactNode;
  // Optional extras after the story (e.g. one inline interactive try-it-yourself)
  extras?: ReactNode;
  // Optional kicker line at the bottom hinting at the next chapter
  outro?: string;
}

export default function ChapterShell({ chapter: c, intro, demo, story, extras, outro }: Props) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <header className="mb-6">
        <p className={`${c.accentText} text-sm uppercase tracking-widest mb-2`}>
          Chapter {Number(c.n)} of 15 · ~1 minute
        </p>
        <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">
          <span className="text-3xl">{c.emoji}</span>
          {c.title}
        </h1>
        <p className="text-paper/70 max-w-2xl leading-relaxed">{intro}</p>
      </header>

      <div className="bg-ink-soft/60 border border-white/10 rounded-2xl p-6 mb-4">
        <p className="text-xs uppercase tracking-widest text-paper/50 mb-3">Watch</p>
        {demo}
      </div>

      {story}

      {extras && <div className="mt-4">{extras}</div>}

      {outro && (
        <p className="mt-8 text-center text-paper/50 text-sm">
          {outro}
        </p>
      )}

      <JourneyNav current={c.path} />
    </div>
  );
}
