import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

const ROLES = [
  { id: 'planner', label: 'Planner',     color: C.agent,    pos: new Vector3(0, 2.5, 0) },
  { id: 'analyst', label: 'Researcher',  color: C.tool,     pos: new Vector3(-4, 0.5, 0) },
  { id: 'local',   label: 'Local Expert', color: C.rag,     pos: new Vector3(4, 0.5, 0) },
  { id: 'writer',  label: 'Writer',      color: C.accent,   pos: new Vector3(-2, -2.0, 0) },
  { id: 'reviewer', label: 'Reviewer',   color: C.bad,      pos: new Vector3(2, -2.0, 0) },
  { id: 'booker',  label: 'Booker',      color: C.accentWarm, pos: new Vector3(-6, -1.0, 0) }
];

export const mod12: ModuleDef = {
  id: 'm12',
  num: 'M12',
  title: 'Multi-Agent — Specialists Working in a Room',
  subtitle: 'One planner, several specialists. When does adding more agents stop helping?',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agents: Record<string, Group> = {};
    let beams: Group[] = [];
    let p = { count: 4, reviewer: true, maxMsgs: 12 };

    function placeAgents(n: number) {
      for (const id in agents) root.remove(agents[id]);
      const subset = ROLES.slice(0, n);
      for (const r of subset) {
        const g = brain(r.color, 0.55); g.position.copy(r.pos);
        const lab = makeLabel(r.label, r.color, { scale: 0.9 }); lab.position.y = 1.4; g.add(lab);
        agents[r.id] = g; root.add(g);
      }
    }
    function placeBeams(n: number) {
      for (const b of beams) root.remove(b); beams = [];
      const subset = ROLES.slice(0, n);
      for (let i = 0; i < subset.length; i++) {
        for (let j = i + 1; j < subset.length; j++) {
          const a = subset[i], b = subset[j];
          const ln = beam(a.pos.clone(), b.pos.clone(), C.accent);
          (ln.material as any).opacity = Math.min(0.4, 0.05 + (p.maxMsgs / 30));
          root.add(ln); beams.push(ln as any);
        }
      }
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — One job, split into roles',
          story: 'For Sam\'s Lisbon trip: a <b>Planner</b> decomposes the task. A <b>Researcher</b> queries APIs. A <b>Local Expert</b> retrieves SOPs and neighborhood lore. A <b>Writer</b> drafts. A <b>Reviewer</b> validates.',
          llm: 'Each "agent" is just another LLM call with a different system prompt and a narrower toolset. The orchestrator routes messages between them.'
        },
        {
          title: 'Step 2 — Messages between agents are LLM calls too',
          story: 'Watch the lines between brains — those are inter-agent messages. Every line costs an LLM call. More agents ⇒ exponentially more lines.',
          llm: 'In a fully-connected mesh, message count grows ~n². That\'s why production designs use star topologies (Planner-routed) or fixed pipelines instead of free chat.'
        },
        {
          title: 'Step 3 — Try different team sizes',
          story: 'Use the controls: 1 agent (fastest, weakest), 3 (balanced), 6 (overkill — too much coordination overhead). Watch quality, cost and latency move together.',
          llm: 'Multi-agent shines when roles need very different prompts/tools (e.g., a legal reviewer vs a creative writer). It hurts when one agent could do the same job.'
        },
        {
          title: 'Step 4 — Specialization helps. Bureaucracy hurts.',
          story: 'Add a reviewer for safety-critical answers. Stop adding agents when the marginal one just shuffles messages around. <b>Specialists, not committees.</b>',
          llm: 'Set explicit limits: max iterations, max messages per agent, message size cap. Without limits, agents will loop forever discussing trivia.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        placeAgents(p.count); placeBeams(p.count);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 16], [0, 0, 0]);
      },
      goStep(i) {
        placeAgents(p.count); placeBeams(p.count);
      },
      onControl(k, v) {
        if (k === 'count') p.count = v;
        if (k === 'reviewer') p.reviewer = v;
        if (k === 'maxMsgs') p.maxMsgs = v;
        placeAgents(p.count); placeBeams(p.count);
      },
      update(dt) {
        for (const id in agents) { agents[id].rotation.y += dt * 0.4; }
      },
      getControls() {
        return [
          { kind: 'range', key: 'count', label: 'Number of agents', value: p.count, min: 1, max: 6, step: 1 },
          { kind: 'toggle', key: 'reviewer', label: 'Include reviewer', value: p.reviewer },
          { kind: 'range', key: 'maxMsgs', label: 'Max messages allowed', value: p.maxMsgs, min: 4, max: 40, step: 2 }
        ];
      },
      getOutput() {
        const n = p.count;
        const msgs = Math.min(p.maxMsgs, n * (n - 1));
        const quality = Math.min(0.95, 0.45 + n * 0.10 + (p.reviewer ? 0.06 : 0)).toFixed(2);
        const latency = (1.0 + n * 0.8 + msgs * 0.05).toFixed(1);
        const cost = (0.01 + n * 0.012 + msgs * 0.003).toFixed(3);
        return [
          { k: 'Quality', v: quality, class: Number(quality) > 0.8 ? 'good' as const : 'warn' as const },
          { k: 'Latency', v: latency + 's', class: Number(latency) > 6 ? 'bad' as const : 'warn' as const },
          { k: 'Cost', v: '$' + cost, class: Number(cost) > 0.08 ? 'bad' as const : 'warn' as const },
          { k: 'Messages', v: String(msgs), class: 'warn' as const }
        ];
      },
      getDelta() {
        if (p.count <= 1) return '<b>Single agent</b> — fast, cheap. Misses review. Good for low-stakes tasks.';
        if (p.count <= 3) return '<b>Small team (2-3)</b> — best ROI. Planner + worker + reviewer covers most cases.';
        if (p.count >= 5) return '<b>Big team (5+)</b> — diminishing returns. <span class="changed">Most extra cost goes into agents talking to each other.</span>';
        return '<b>Medium team (4)</b> — solid for complex multi-step planning.';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
