import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { FlowNode } from '../components/Flow';
import { CHAPTERS, STORY } from '../chapters';

const C = CHAPTERS[0];

const BEATS: Beat[] = [
  { caption: `Same question, two completely different helpers.`,
    llmNote: 'Watch what each one does with Sam\'s identical request.',
    readingMs: 3000 },
  { caption: 'The chatbot replies immediately — from what it already remembers.',
    llmNote: 'Plausible, fluent, but nothing was checked against the real world.',
    readingMs: 3200 },
  { caption: 'The agent first pauses. "Do I need real info?"',
    llmNote: 'Before replying, it decides whether to call tools, search, or just answer.',
    readingMs: 3000 },
  { caption: 'It calls real APIs and reads the results back.',
    llmNote: 'Flight prices, hotel availability, weather — actual data, not guesses.',
    readingMs: 3200 },
  { caption: 'Final replies look very different. That\'s the whole lesson.',
    llmNote: 'Same underlying model. The difference is: one was given tools and time to use them.',
    readingMs: 3400 }
];

interface ColProps {
  step: number;
  side: 'chatbot' | 'agent';
}

function Column({ step, side }: ColProps) {
  const isChatbot = side === 'chatbot';
  const showReply = isChatbot ? step >= 1 : step >= 3;
  const showProcess = isChatbot ? step >= 1 : step >= 2;
  const showTools = !isChatbot && step >= 3;

  return (
    <div className={`flex-1 min-w-0 rounded-2xl border p-4 flex flex-col gap-3 ${
      isChatbot ? 'bg-white/5 border-white/15' : 'bg-grape/10 border-grape-soft/40'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${
          isChatbot ? 'bg-white/10 text-paper/80' : 'bg-grape-soft/20 text-grape-soft'
        }`}>
          <span className="text-base">{isChatbot ? '🗣️' : '🤖'}</span>
          <span>Path {isChatbot ? 'A' : 'B'} · {isChatbot ? 'Chatbot' : 'Agent'}</span>
        </span>
      </div>

      {/* Same question shown on both sides */}
      <FlowNode
        tone="user"
        emoji="❓"
        title="Sam asks"
        size="sm"
        sub={<span className="italic">"{STORY.ask}"</span>}
      />

      <div className="flex justify-center text-xl text-paper/30">↓</div>

      {/* Process */}
      <FlowNode
        tone={isChatbot ? 'chatbot' : 'agent'}
        emoji={isChatbot ? '💭' : '🧠'}
        title={isChatbot ? 'Recall from memory' : 'Think + plan'}
        size="sm"
        sub={isChatbot ? 'no checks, no calls' : 'check tools first'}
        dim={!showProcess}
        active={showProcess && !showReply}
      />

      {/* Agent extra: tool layer */}
      {!isChatbot && (
        <>
          <div className="flex justify-center text-xl text-paper/30">↓</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { label: '✈ Flights', sub: '$295' },
              { label: '🏨 Hotels',  sub: '$38/nt' },
              { label: '☁ Weather', sub: '15°C' }
            ].map((t, i) => (
              <div key={t.label}
                className={`text-center rounded-lg border text-[11px] px-1.5 py-1 transition-all ${
                  showTools ? 'bg-sky/15 border-sky/40 text-sky' : 'bg-white/5 border-white/10 text-paper/30'
                }`}>
                <div className="font-semibold leading-tight">{t.label}</div>
                {showTools && <div className="text-paper/70 text-[10px]">{t.sub}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex justify-center text-xl text-paper/30">↓</div>

      {/* Reply */}
      {isChatbot ? (
        <FlowNode
          tone="chatbot"
          emoji="💬"
          title="Generic reply"
          size="sm"
          sub={'"Try Kayak for flights, Hostelworld for stays. Have fun!"'}
          dim={!showReply}
          active={showReply}
        />
      ) : (
        <FlowNode
          tone="good"
          emoji="✅"
          title="Grounded plan"
          size="sm"
          sub={
            <div className="space-y-0.5">
              <div>Iberia JFK→LIS · $295</div>
              <div>Hostel Alfama 2nt · $76</div>
              <div>Activities · $56</div>
              <div className="text-mint font-semibold mt-1">$427 ✓ under $500</div>
            </div>
          }
          dim={!showReply}
          active={showReply}
        />
      )}

      {/* Outcome row */}
      {showReply && (
        <div className={`mt-1 rounded-lg px-3 py-2 text-[11px] anim-float-in ${
          isChatbot
            ? 'bg-coral/10 border border-coral/30 text-coral'
            : 'bg-mint/10 border border-mint/30 text-mint'
        }`}>
          {isChatbot
            ? '✗ Fast but ungrounded — same as guessing.'
            : '✓ Slower, but every number is real.'}
        </div>
      )}
    </div>
  );
}

export default function ChatbotVsAgent() {
  const [step, setStep] = useState(0);
  return (
    <ChapterShell
      chapter={C}
      intro="Same question, two different helpers. Watch them side by side — one talks, one acts."
      demo={
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch">
          <Column step={step} side="chatbot" />
          <div className="flex items-center justify-center sm:self-stretch py-1 sm:py-0">
            <div className="text-paper/40 font-extrabold text-base sm:text-2xl tracking-widest px-2 select-none border border-paper/15 rounded-full sm:rounded sm:border-none px-3 sm:px-1 bg-ink-soft sm:bg-transparent">VS</div>
          </div>
          <Column step={step} side="agent" />
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
      outro="Next: if the agent can use tools, how does it pick which one to call?"
    />
  );
}
