import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';

const C = CHAPTERS[8];

const TOOLS = ['Flights', 'Hotels', 'Calendar', 'Weather', 'Email', 'Maps'];

const BEATS: Beat[] = [
  { caption: 'For the agent to actually do things, it has to plug into the outside world.', readingMs: 3200,
    llmNote: 'A "tool" is anything with an input and an output: an API, a database, a script.' },
  { caption: 'Without a standard, every tool needs its own custom cable.', readingMs: 3200,
    llmNote: 'Each API speaks a slightly different language. Wiring them up by hand is slow and brittle.' },
  { caption: 'MCP is one neat adapter that fits them all.', readingMs: 3200,
    llmNote: 'MCP (Model Context Protocol) is like USB for AI tools — a shared shape so any agent can talk to any MCP-compatible service.' },
  { caption: 'Real life: things break. Tools time out. Inputs are wrong. The agent has to handle it.', readingMs: 3400,
    llmNote: 'For high-stakes tools (payments, sends) the system asks for human approval before letting the agent press the button.' }
];

export default function ToolsMCP() {
  const [step, setStep] = useState(0);
  const mcp = step >= 2;

  return (
    <ChapterShell
      chapter={C}
      intro="A chatbot can only talk. An agent acts — but only because somebody wired tools into it. Watch what changes when there's a standard plug."
      demo={
        <div className="relative min-h-[300px] flex flex-col items-center justify-center">
          {/* Agent */}
          <div className="rounded-2xl bg-grape/15 border border-grape-soft/40 px-5 py-3 text-grape-soft font-semibold mb-6">
            🤖 Agent
          </div>
          {/* MCP hub */}
          {mcp && (
            <div className="rounded-full bg-sun/20 border border-sun/50 px-4 py-2 text-sun font-semibold mb-6 anim-pop-in">
              🔌 MCP adapter
            </div>
          )}
          {/* Tools */}
          <div className={`grid grid-cols-3 md:grid-cols-6 gap-3 w-full`}>
            {TOOLS.map((t) => (
              <div key={t} className="relative rounded-xl bg-sky/10 border border-sky/30 px-3 py-3 text-center text-sky text-sm">
                {/* connecting line */}
                <div
                  className="absolute left-1/2 -top-6 w-px bg-paper/20"
                  style={{ height: mcp ? '24px' : '60px', transition: 'all 600ms' }}
                />
                {t}
              </div>
            ))}
          </div>
          {step >= 3 && (
            <div className="mt-6 rounded-xl bg-coral/10 border border-coral/30 p-3 text-sm anim-float-in w-full max-w-2xl">
              <p className="text-coral text-[11px] uppercase tracking-widest mb-1">⚠️ Real failures</p>
              <ul className="space-y-1 text-paper/85 text-[13px]">
                <li>• Wrong parameter ⇒ tool returns "did you mean…", agent retries.</li>
                <li>• Timeout ⇒ wait a moment, retry once, then ask the user.</li>
                <li>• Permission denied / payment ⇒ stop and ask a human.</li>
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
      outro="Next: even with all the right info, the agent's first draft might be wrong. How does it check itself?"
    />
  );
}
