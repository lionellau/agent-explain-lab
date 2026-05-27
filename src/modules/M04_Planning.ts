import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, orb } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod04: ModuleDef = {
  id: 'm04',
  num: 'M04',
  title: 'Planning — Break a Big Task into Small Steps',
  subtitle: 'A "messy asteroid" of a request, split into a roadmap.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.0);
    const asteroid = orb({ color: C.user, r: 1.1 });
    const blockGroup = new Group();

    let p = { mode: 'llm' };

    const planLabels: Record<string, string[]> = {
      none:    ['Try flights', 'Try hotels?', 'Maybe weather', 'Hmm activities', 'Write something'],
      llm:     ['1 Confirm budget+date', '2 Search flights', '3 Search hotels', '4 Pick activities', '5 Check weather', '6 Build day-by-day', '7 Validate <$500'],
      rule:    ['1 Confirm budget+date', '2 Search flights', '3 Search hotels', '4 Pick activities', '5 Build day-by-day'],
      hybrid:  ['1 Confirm budget+date', '2 Search flights', '3 Hotels  (agent picks region)', '4 Activities (agent picks theme)', '5 Build day-by-day', '6 Validate <$500']
    };

    let cards: Group[] = [];

    function buildPlan(mode: string) {
      for (const c of cards) blockGroup.remove(c); cards = [];
      const labels = planLabels[mode];
      const startX = -6, dx = 12 / Math.max(1, labels.length - 1);
      labels.forEach((label, k) => {
        const color = mode === 'none' ? C.bad : mode === 'rule' ? C.tool : C.agent;
        const card = dataCard([label], color, { w: 2.0 });
        card.position.set(startX + dx * k, -1.5 - (k % 2) * 0.3, 0);
        card.scale.setScalar(0.001);
        blockGroup.add(card); cards.push(card);
        ctx.tweens.to({ duration: 0.45, easing: ease.outBack, update: (t) => card.scale.setScalar(t) });
      });
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — One big messy request',
          story: 'Sam says: <i>"Plan me a 3-day weekend trip to Lisbon under $500, leaving Friday night."</i> One sentence, many implicit sub-tasks. That\'s the asteroid.',
          llm: 'If you hand the LLM the raw request and ask for a final plan, it tries to do everything in one shot and skips steps. Planning lets it work in passes.'
        },
        {
          title: 'Step 2 — The planner breaks it apart',
          story: 'The agent\'s first LLM call is not "answer the trip" — it\'s "list the sub-tasks needed to answer." That output becomes a roadmap of blocks below.',
          llm: 'A planning prompt: <code>"Break the task into ≤8 atomic steps. Each step must be answerable with one tool call or one reasoning step."</code> Output: a JSON list of steps.'
        },
        {
          title: 'Step 3 — Execute the plan step by step',
          story: 'The agent runs each step in order. Some are tool calls, some are reasoning. The plan is also the audit trail — you can replay it.',
          llm: 'For each step, a fresh LLM call gets <code>{step_goal, prior_results}</code> as context. Smaller prompts = sharper outputs = cheaper.'
        },
        {
          title: 'Step 4 — Compare planning modes (use the control)',
          story: '<b>No planning</b>: jumps tool to tool randomly, misses pieces. <b>LLM planning</b>: flexible, can overthink. <b>Rule-based</b>: stable, can\'t adapt. <b>Hybrid</b>: fixed skeleton + agent decisions inside steps.',
          llm: 'In practice, the most production-safe pattern is hybrid: a deterministic outer plan + LLM-driven decisions inside each step that benefits from flexibility.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        asteroid.position.set(-7, 2.5, 0); root.add(asteroid);
        agent.position.set(0, 2.5, 0); root.add(agent);
        const al = makeLabel('Planner', C.agent); al.position.y = 1.9; agent.add(al);
        root.add(blockGroup);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 16], [0, 0, 0]);
      },
      goStep(i) {
        if (i === 0) { for (const c of cards) blockGroup.remove(c); cards = []; asteroid.visible = true; }
        if (i === 1) { buildPlan(p.mode); }
        if (i >= 2) { /* execution highlight handled by tween below */
          cards.forEach((card, k) => {
            ctx.tweens.to({ duration: 0.35, easing: ease.outCubic, update: (t) => { (card as any).plane.material.opacity = 0.35 + 0.65 * (1 - Math.abs(k / cards.length - t)); } });
          });
        }
        if (i === 3) { buildPlan(p.mode); }
      },
      onControl(k, v) { if (k === 'mode') { p.mode = v; buildPlan(v); } },
      update(dt, t) { agent.rotation.y += dt * 0.4; asteroid.rotation.x += dt * 0.6; asteroid.rotation.y += dt * 0.3; (agent as any).core.material.emissiveIntensity = 0.55 + Math.sin(t * 3) * 0.18; },
      getControls() {
        return [{ kind: 'choice', key: 'mode', label: 'Planning mode', value: p.mode,
          options: [ { id: 'none', label: 'No plan' }, { id: 'llm', label: 'LLM plan' }, { id: 'rule', label: 'Rule plan' }, { id: 'hybrid', label: 'Hybrid' } ] }];
      },
      getOutput() {
        const out: Record<string, any[]> = {
          none:   [ { k: 'Steps', v: '5 random', class: 'bad' }, { k: 'Coverage', v: '60%', class: 'bad' }, { k: 'Cost', v: 'High (retries)', class: 'bad' }, { k: 'Quality', v: 'Low', class: 'bad' } ],
          llm:    [ { k: 'Steps', v: '7 adaptive', class: 'good' }, { k: 'Coverage', v: '95%', class: 'good' }, { k: 'Cost', v: 'Medium', class: 'warn' }, { k: 'Quality', v: 'High', class: 'good' } ],
          rule:   [ { k: 'Steps', v: '5 fixed', class: 'good' }, { k: 'Coverage', v: '80% (no weather)', class: 'warn' }, { k: 'Cost', v: 'Low', class: 'good' }, { k: 'Quality', v: 'OK', class: 'warn' } ],
          hybrid: [ { k: 'Steps', v: '6 (mixed)', class: 'good' }, { k: 'Coverage', v: '93%', class: 'good' }, { k: 'Cost', v: 'Medium-low', class: 'good' }, { k: 'Quality', v: 'High', class: 'good' } ]
        };
        return out[p.mode];
      },
      getDelta() {
        const d: Record<string, string> = {
          none: '<b>No plan</b> — the agent jumps tool to tool. <span class="changed">Forgot to check weather, picks a wrong day.</span>',
          llm: '<b>LLM plan</b> — adapts to weird requests, but each plan-step costs tokens.',
          rule: '<b>Rule plan</b> — stable and cheap, but the hard-coded list misses things the user did not anticipate.',
          hybrid: '<b>Hybrid</b> — fixed outer skeleton, agent picks options inside each step. <span class="changed">Best balance in production.</span>'
        };
        return d[p.mode];
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
