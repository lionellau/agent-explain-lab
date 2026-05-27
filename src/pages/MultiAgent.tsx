import { useState } from 'react';
import ChapterShell from '../components/ChapterShell';
import StorySteps, { type Beat } from '../components/StorySteps';
import { CHAPTERS } from '../chapters';
import Scene3D from '../three/Scene3D';
import { Brain, Beam, COLORS } from '../three/Prims';

const C = CHAPTERS[11];

const ROLES = [
  { name: 'Planner',      color: COLORS.agent  },
  { name: 'Researcher',   color: COLORS.tool   },
  { name: 'Local Expert', color: COLORS.rag    },
  { name: 'Writer',       color: COLORS.warn   },
  { name: 'Reviewer',     color: COLORS.bad    },
  { name: 'Booker',       color: COLORS.memory }
];

const BEATS: Beat[] = [
  { caption: 'Instead of one agent doing everything, split the job across roles.', readingMs: 3200,
    llmNote: 'Each "agent" is the same LLM with a different system prompt and a narrower toolset.' },
  { caption: 'Planner cuts the work. Researcher fetches facts. Writer drafts. Reviewer checks.', readingMs: 3200,
    llmNote: 'Specialists can use better prompts for their narrow job — they usually beat one generalist.' },
  { caption: 'But: every line between them is another LLM call. Costs add up fast.', readingMs: 3200,
    llmNote: 'Six agents fully connected = 15 message channels. That\'s where the budget evaporates.' },
  { caption: '2–4 specialists ≈ sweet spot. More than that is usually bureaucracy.', readingMs: 3200,
    llmNote: 'Production systems put limits: max iterations, max messages, capped reply length.' }
];

function TeamRing({ teamSize }: { teamSize: number }) {
  const team = ROLES.slice(0, teamSize);
  const radius = teamSize <= 1 ? 0 : 2.8;
  const positions: [number, number, number][] = team.map((_, i) => {
    const a = (i / team.length) * Math.PI * 2;
    return [Math.cos(a) * radius, Math.sin(a * 0.5) * 0.3, Math.sin(a) * radius];
  });

  return (
    <>
      {team.map((r, i) => (
        <Brain key={r.name} position={positions[i]} color={r.color} size={0.62} label={r.name} pulse spin={0.5 + i * 0.05} />
      ))}
      {/* Pairwise message channels — visualizes the n² growth */}
      {positions.map((from, i) =>
        positions.slice(i + 1).map((to, j) => (
          <Beam key={`msg-${i}-${j}`} from={from} to={to} color={COLORS.agent} thick={1.0} dashed />
        ))
      )}
    </>
  );
}

export default function MultiAgent() {
  const [step, setStep] = useState(0);
  const teamSize = step <= 0 ? 1 : Math.min(step + 1, ROLES.length);
  const messages = teamSize <= 1 ? 0 : (teamSize * (teamSize - 1)) / 2;
  return (
    <ChapterShell
      chapter={C}
      intro="When a job is big, you can split it across a small team of specialists. But teams cost messages — and messages cost money."
      demo={
        <Scene3D
          height="460px"
          camera={{ position: [0, 4, 9], fov: 55 }}
          hint={`Rotate the room · message channels: ${messages}`}
        >
          <TeamRing teamSize={teamSize} />
        </Scene3D>
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
      extras={
        <div className="rounded-xl bg-ink-soft/60 border border-white/10 p-3 text-sm text-center">
          <p className="text-paper/70">Specialists active: <span className="text-grape-soft font-bold">{teamSize}</span>{' · '}Message channels: <span className="text-grape-soft font-bold">{messages}</span></p>
          {teamSize <= 4 && step >= 3 && <p className="mt-1 text-mint text-[12px]">✓ Sweet spot — solid quality, manageable cost.</p>}
          {teamSize > 4 && step >= 3 && <p className="mt-1 text-coral text-[12px]">⚠ Too many specialists. Most of the cost is now agents talking to each other.</p>}
        </div>
      }
      outro="Next: not every job actually needs an agent. Some need just a function."
    />
  );
}
