import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[0];

const BEATS: Beat[] = [
  { caption: `${STORY.who} asks: "${STORY.ask}"`,
    llmNote: 'Both a chatbot and an agent start from the same question. The difference is what each one is allowed to do next.',
    readingMs: 3200 },
  { caption: 'A chatbot answers right away, from memory only.',
    llmNote: 'It writes a fluent reply using what it learned during training. It cannot check anything live.',
    readingMs: 3400 },
  { caption: 'An agent pauses. "Do I need real info first?"',
    llmNote: 'Before answering, the agent decides whether to look something up, ask a clarifying question, or just reply.',
    readingMs: 3400 },
  { caption: 'It calls real tools: flight prices, hotel availability, weather.',
    llmNote: 'Each tool call is a small API request. The results come back as fresh facts the model now gets to read.',
    readingMs: 3600 },
  { caption: 'Now the answer is grounded in real numbers, not guesses.',
    llmNote: 'Same model in both cases. The only difference: an agent has tools, takes its time, and bakes the results into its reply.',
    readingMs: 3400 }
];

export default function ChatbotVsAgent() {
  const [step, setStep] = useState(0);

  return (
    <ChapterShell
      chapter={C}
      intro="A chatbot answers from what it already remembers. An agent first goes and checks. Watch the same question land on each of them."
      demo={
        <div className="grid md:grid-cols-2 gap-4 min-h-[260px]">
          {/* Chatbot lane */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-paper/40 mb-2">🗣️ Chatbot</p>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">User</span>
              <span className="text-paper/80">"{STORY.ask}"</span>
            </div>
            {step >= 1 ? (
              <div className="rounded-lg bg-white/5 border border-white/10 p-3 anim-float-in text-sm leading-relaxed">
                <p className="text-paper/90"><b>Reply:</b> "Lisbon is lovely! Try Kayak for flights and Hostelworld for cheap stays. Have fun!"</p>
                <p className="mt-2 text-xs text-paper/40 italic">No prices checked. No dates confirmed. Just a guess.</p>
              </div>
            ) : (
              <div className="rounded-lg bg-white/5 border border-dashed border-white/15 p-3 text-paper/40 text-sm italic">(thinking… nothing to check, will reply soon)</div>
            )}
          </div>

          {/* Agent lane */}
          <div className="rounded-xl bg-grape/10 border border-grape-soft/30 p-4 flex flex-col">
            <p className="text-[11px] uppercase tracking-widest text-grape-soft mb-2">🤖 Agent</p>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <span className="px-2 py-1 rounded-md bg-sun/20 text-sun font-mono text-xs">User</span>
              <span className="text-paper/80">"{STORY.ask}"</span>
            </div>
            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              {['Flights API', 'Hotels API', 'Weather'].map((t, i) => (
                <span
                  key={t}
                  className={`px-2 py-1 rounded-md font-mono transition-all ${
                    step >= 3
                      ? 'bg-sky/20 text-sky anim-pop-in'
                      : step >= 2
                        ? 'bg-white/10 text-paper/60'
                        : 'bg-white/5 text-paper/30'
                  }`}
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  {step >= 3 ? '✓ ' : ''}{t}
                </span>
              ))}
            </div>
            {step >= 4 ? (
              <div className="rounded-lg bg-mint/10 border border-mint/30 p-3 anim-float-in text-sm leading-relaxed">
                <p className="text-paper"><b className="text-mint">Plan:</b> Iberia JFK→LIS <b>$295</b> · Hostel Alfama 2 nights <b>$76</b> · Tram 28 + Belém <b>$24</b> · Veg lunches <b>$32</b></p>
                <p className="mt-2 text-mint font-semibold">Total: $427 ✓ under your $500 budget</p>
              </div>
            ) : step >= 2 ? (
              <p className="text-paper/60 text-sm italic">Thinking: "let me check real prices first…"</p>
            ) : (
              <p className="text-paper/40 text-sm italic">(waiting)</p>
            )}
          </div>
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
      outro="Next: if an agent can use tools, how does it decide which one to pick — and what to do with the result?"
    />
  );
}
