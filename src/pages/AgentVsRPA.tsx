import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[13];

const BEATS: Beat[] = [
  { caption: 'An RPA bot is a recorded macro: "click here, type there, press this".', readingMs: 3200,
    llmNote: 'Old-school automation. Fast and cheap when the screen never changes.' },
  { caption: 'An agent reads the page the way you do — by labels and meaning.', readingMs: 3200,
    llmNote: 'It looks at "Origin" the label, not "the 4th field from the top".' },
  { caption: 'The airline redesigns the booking form. The button moves.', readingMs: 3200,
    llmNote: 'For an RPA bot, this breaks everything. The recorded clicks land in the wrong places.' },
  { caption: 'RPA: 💥 crash. Agent: 🤷 finds the new button by reading the screen.', readingMs: 3200,
    llmNote: 'Same task, different brittleness. Agents trade some speed for a lot of adaptability.' }
];

export default function AgentVsRPA() {
  const [step, setStep] = useState(0);
  const changed = step >= 2;
  return (
    <ChapterShell
      chapter={C}
      intro="The website you're automating won't sit still. Watch which kind of helper survives the redesign."
      demo={
        <div className="grid md:grid-cols-2 gap-4 min-h-[280px]">
          {/* RPA */}
          <div className="rounded-xl bg-coral/10 border border-coral/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-coral mb-2">🤖 RPA bot (recorded clicks)</p>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-sm rounded px-2 py-1 ${
                    changed && i === 3 ? 'bg-coral/30 line-through text-coral' : 'bg-white/5 text-paper/85'
                  }`}
                >
                  <span className="text-[10px] text-paper/40 font-mono w-12">field #{i}</span>
                  <span>{i === 1 ? 'Origin' : i === 2 ? 'Destination' : i === 3 ? (changed ? '???  (was Date)' : 'Date') : 'Submit'}</span>
                </div>
              ))}
            </div>
            {changed && <p className="text-coral text-[12px] mt-3 font-semibold animate-pulse">💥 Crashed: field #3 not found</p>}
          </div>
          {/* Agent */}
          <div className="rounded-xl bg-grape/10 border border-grape-soft/40 p-4">
            <p className="text-[11px] uppercase tracking-widest text-grape-soft mb-2">🤖 Agent (reads labels)</p>
            <div className="space-y-2">
              {['Origin', 'Destination', changed ? 'Travel date' : 'Date', 'Submit'].map((label, i) => (
                <div key={i} className={`flex items-center gap-2 text-sm rounded px-2 py-1 bg-mint/10 border border-mint/30 text-paper`}>
                  <span className="text-mint text-xs">✓ found:</span>
                  <span className="font-semibold">{label}</span>
                </div>
              ))}
            </div>
            {changed && <p className="text-mint text-[12px] mt-3">✓ Re-mapped "Travel date" automatically</p>}
          </div>
          {step >= 3 && (
            <div className="md:col-span-2 rounded-xl bg-sun/10 border border-sun/30 p-3 text-sm text-paper/90 anim-float-in">
              <b className="text-sun">In short:</b> RPA is faster and cheaper when nothing changes. Agents survive when things do. Many real systems combine the two.
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
      outro="Finally — let's watch everything we've learned run as one continuous trip-planning agent."
    />
  );
}
