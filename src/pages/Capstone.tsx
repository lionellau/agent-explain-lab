import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[14];

const PIPELINE = [
  { e: '🗺️', name: 'Plan',     note: 'breaks the trip into 7 small tasks',     chapter: 'planning' },
  { e: '🧠', name: 'Memory',   note: 'recalls window seat + vegetarian',       chapter: 'memory' },
  { e: '📚', name: 'RAG',      note: 'reads the Lisbon refund policy',         chapter: 'rag' },
  { e: '🔌', name: 'Tools',    note: 'calls flights, hotels, weather',         chapter: 'tools-mcp' },
  { e: '🔁', name: 'Think-Act loop', note: 'two passes to refine choices',     chapter: 'react-loop' },
  { e: '🪞', name: 'Reflect',  note: 'critic catches the $35 budget overshoot',chapter: 'reflection' },
  { e: '✍️', name: 'Write',    note: 'final day-by-day plan',                  chapter: 'capstone' }
];

const BEATS: Beat[] = [
  { caption: `Sam: "${STORY.ask}"`, readingMs: 3000,
    llmNote: 'Same request from the very first chapter. Now you\'re going to see every piece work together.' },
  { caption: 'The planner makes a list of 7 small tasks.', readingMs: 2800 },
  { caption: 'Memory recalls Sam\'s preferences from past trips.', readingMs: 2800 },
  { caption: 'RAG pulls the right paragraph from the insurance policy.', readingMs: 2800 },
  { caption: 'Tools fetch real prices: flights, hotels, weather.', readingMs: 2800 },
  { caption: 'The think-act loop refines the choices over two passes.', readingMs: 2800 },
  { caption: 'A critic catches a $35 overshoot and fixes it.', readingMs: 2800 },
  { caption: 'A grounded plan comes out the other side. That\'s the whole machine.', readingMs: 3400,
    llmNote: 'You now have a complete mental model of an agent: an LLM with memory + retrieval + tools + a critic, controlled by a loop.' }
];

export default function Capstone() {
  const [step, setStep] = useState(0);
  // step 0 = highlight nothing; steps 1..7 highlight pipeline stage i-1
  return (
    <ChapterShell
      chapter={C}
      intro="Every piece of the lab in one continuous run. Watch the stages light up as the story moves through them."
      demo={
        <div className="min-h-[320px]">
          <div className="text-sm flex items-center gap-2 mb-4">
            <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">Sam</span>
            <span className="text-paper/80 italic">"{STORY.ask}"</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4">
            {PIPELINE.map((p, i) => {
              const active = step >= i + 1;
              return (
                <div
                  key={p.name}
                  className={`rounded-xl p-3 text-center border transition-all ${
                    active ? 'bg-grape/15 border-grape-soft/50 text-paper anim-pop-in' : 'bg-white/5 border-white/10 text-paper/40'
                  }`}
                >
                  <div className="text-2xl">{p.e}</div>
                  <div className="text-[12px] font-semibold mt-1">{p.name}</div>
                  <div className="text-[10px] text-paper/60 mt-1 min-h-[2em]">{active ? p.note : ''}</div>
                </div>
              );
            })}
          </div>
          {step >= PIPELINE.length + 1 && (
            <div className="rounded-xl bg-mint/10 border border-mint/30 p-4 anim-float-in">
              <p className="text-mint text-[11px] uppercase tracking-widest mb-2">Final plan</p>
              <ul className="text-sm space-y-1 text-paper">
                <li>✈️ Fri 9:20pm Iberia JFK→LIS — $295 (window seat ✓)</li>
                <li>🏨 Hostel Alfama, 3 nights — $114 (vegetarian breakfast ✓)</li>
                <li>🚋 Tram 28 + Belém day pass — $24</li>
                <li>🥗 Veg lunches and a Bairro Alto café crawl — $34</li>
                <li className="mt-2 font-semibold text-mint">Total: $467 ✓ under $500</li>
                <li className="text-[12px] text-paper/60 italic">If flight cancels: full refund (insurance §4.1 — fetched by RAG).</li>
              </ul>
            </div>
          )}
        </div>
      }
      story={
        <StorySteps
          beats={BEATS}
          accent={C.accentText}
          accentBorder={C.accentBorder}
          accentBg={C.accentBg}
          onStep={setStep}
        />
      }
      outro="🎉 That's the tour. Bookmark this page, share it with someone curious — and if you want to go deeper, every chapter links to a real-world equivalent."
    />
  );
}
