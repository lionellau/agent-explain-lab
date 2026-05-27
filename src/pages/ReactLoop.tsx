import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[1];

const BEATS: Beat[] = [
  { caption: 'The agent doesn\'t answer in one shot. It thinks → tries → looks.', readingMs: 3200,
    llmNote: 'Each loop has three parts: a Thought (what to do next), an Action (use a tool), an Observation (what came back).' },
  { caption: 'Thought: "I should check real flight prices first."', readingMs: 3000,
    llmNote: 'The model writes a short note explaining its plan, before acting. This makes its choices reviewable.' },
  { caption: 'Action: it calls the Flights tool with the right city and date.', readingMs: 3000,
    llmNote: 'The model picks a tool and fills in the inputs. That goes off to a real API.' },
  { caption: 'Observation: $295 on Iberia, 7h flight. Now we know.', readingMs: 3000,
    llmNote: 'The tool\'s reply is handed back to the model so it can read the facts.' },
  { caption: 'New thought: "Got the flight. Hotels next." And the loop starts again.', readingMs: 3400,
    llmNote: 'The model keeps looping until it has enough to give a final answer.' }
];

const STEPS = [
  { thought: '...', action: '...', obs: '...' },
  { thought: 'I should check real flight prices first.', action: '', obs: '' },
  { thought: 'I should check real flight prices first.', action: 'flight_search(JFK → LIS, Fri)', obs: '' },
  { thought: 'I should check real flight prices first.', action: 'flight_search(JFK → LIS, Fri)', obs: '3 flights. Cheapest: Iberia $295.' },
  { thought: 'Got the flight. Now check hotels in budget.', action: 'hotel_search(Lisbon, ≤$70)', obs: 'Hostel Alfama $38/night.' }
];

export default function ReactLoop() {
  const [step, setStep] = useState(0);
  const cur = STEPS[Math.min(step, STEPS.length - 1)];

  return (
    <ChapterShell
      chapter={C}
      intro="The agent works the way you do when you investigate something. A small thought, a small action, then look at what you learned. Repeat."
      demo={
        <div className="grid md:grid-cols-3 gap-3 min-h-[180px]">
          <div className="rounded-xl bg-sun/10 border border-sun/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-sun mb-2">💭 Thought</p>
            <p key={'th-' + step} className="anim-float-in text-paper/90 text-sm leading-snug">{cur.thought}</p>
          </div>
          <div className="rounded-xl bg-sky/10 border border-sky/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-sky mb-2">🛠️ Action</p>
            <p key={'ac-' + step} className="anim-float-in text-paper/90 text-sm font-mono leading-snug">{cur.action || '…'}</p>
          </div>
          <div className="rounded-xl bg-mint/10 border border-mint/30 p-4">
            <p className="text-[11px] uppercase tracking-widest text-mint mb-2">👀 Observation</p>
            <p key={'ob-' + step} className="anim-float-in text-paper/90 text-sm leading-snug">{cur.obs || '…'}</p>
          </div>
          {step >= 4 && (
            <div className="md:col-span-3 rounded-xl bg-grape/10 border border-grape-soft/30 p-3 text-center text-sm text-grape-soft anim-float-in">
              ↻ A second loop has started — same pattern, different question.
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
      outro="Next: if the agent can loop, why would anyone use a fixed pipeline that can't?"
    />
  );
}
