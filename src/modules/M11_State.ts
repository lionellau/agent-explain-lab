import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, orb } from '../components/Prims';
import { Mesh, MeshStandardMaterial, IcosahedronGeometry } from 'three';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod11: ModuleDef = {
  id: 'm11',
  num: 'M11',
  title: 'State & Checkpointing',
  subtitle: 'Mid-plan, the browser crashes. Can the agent pick up where it stopped?',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.0);
    const mission = dataCard(['# Mission state','Plan: 7 steps','Done: 4', 'Tools: flights, hotels', 'Draft: $440'], C.agent, { w: 3.0 });
    let crystals: Mesh[] = [];
    let crashFx: Mesh | null = null;
    let resumeCard: Group | null = null;
    let p = { mode: 'every', event: 'none' };

    function makeCrystal(i: number, total: number, color = C.rag) {
      const cr = new Mesh(new IcosahedronGeometry(0.22, 0), new MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.7 }));
      const t = (i / Math.max(1, total - 1)) - 0.5;
      cr.position.set(t * 6.5, -2.0, 0);
      return cr;
    }
    function rebuildCrystals() {
      crystals.forEach((c) => root.remove(c)); crystals = [];
      const totalSteps = 7;
      const completed = 4;
      const checkpoints = p.mode === 'off' ? 0 : p.mode === 'every' ? completed : Math.min(1, completed);
      for (let i = 0; i < checkpoints; i++) {
        const c = makeCrystal(i, totalSteps); c.scale.setScalar(0.001);
        root.add(c); crystals.push(c);
        ctx.tweens.to({ duration: 0.4, easing: ease.outBack, update: (t) => c.scale.setScalar(t) });
      }
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — State is everything the agent is holding',
          story: 'In the middle of planning, the agent carries: the plan, completed tool results, message history, draft answer, iteration count. That bundle is the <b>state</b>.',
          llm: 'The LLM itself is stateless. "State" is whatever your orchestrator stores between calls and replays into the prompt. Lose it and the agent forgets everything.'
        },
        {
          title: 'Step 2 — Checkpoints save the state at each step',
          story: 'After every completed step, the orchestrator writes a checkpoint crystal (the green stones). Lightweight: a JSON blob of the current state.',
          llm: 'Frameworks like LangGraph and Temporal model this explicitly — each node\'s output is persisted, so any step can be retried or resumed without rerunning earlier ones.'
        },
        {
          title: 'Step 3 — Crash (use the event control)',
          story: 'Choose a failure: tool crash, browser refresh, agent timeout. The current run dies mid-flight. Now the question: can we recover?',
          llm: 'Real production agents face crashes, OOMs, network drops, container restarts. Without persisted state, every crash means restart from scratch, including expensive tool calls.'
        },
        {
          title: 'Step 4 — Resume from the last good checkpoint',
          story: 'With checkpoints: rehydrate state, resume at step 5 of 7. With none: replay every tool call from scratch — more tokens, more money, more time. Same final answer.',
          llm: 'Checkpointing turns a "fragile demo" into a "production system." It also enables time-travel debugging — you can inspect the agent\'s state at any past step.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        agent.position.set(0, 2.0, 0); root.add(agent);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);
        mission.position.set(0, 0.4, 0); root.add(mission);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 16], [0, 0, 0]);
      },
      goStep(i) {
        if (crashFx) { root.remove(crashFx); crashFx = null; }
        if (resumeCard) { root.remove(resumeCard); resumeCard = null; }
        rebuildCrystals();
        if (i >= 2 && p.event !== 'none') {
          crashFx = new Mesh(new IcosahedronGeometry(1.4, 0), new MeshStandardMaterial({ color: C.bad, emissive: C.bad, emissiveIntensity: 1, wireframe: true }));
          crashFx.position.copy(mission.position);
          root.add(crashFx);
          ctx.tweens.to({ duration: 0.8, easing: ease.outCubic, update: (t) => { (crashFx as Mesh).scale.setScalar(1 + t * 2); ((crashFx as Mesh).material as MeshStandardMaterial).opacity = 1 - t; } });
        }
        if (i === 3) {
          const can = p.mode !== 'off';
          resumeCard = dataCard(can
            ? ['# Resume','Load state from crystal #4', 'Skip steps 1-4 (already done)', 'Continue at step 5/7. ✓']
            : ['# No checkpoint','Replay all steps from scratch.', '+5 tool calls, +1800 tokens.', 'Slow but works.'], can ? C.good : C.bad, { w: 3.4 });
          resumeCard.position.set(0, -3.5, 0); root.add(resumeCard);
        }
      },
      onControl(k, v) { if (k === 'mode') p.mode = v; if (k === 'event') p.event = v; this.goStep!(2); },
      update(dt, t) { agent.rotation.y += dt * 0.3; (agent as any).core.material.emissiveIntensity = 0.55 + Math.sin(t * 3) * 0.18; },
      getControls() {
        return [
          { kind: 'choice', key: 'mode', label: 'Checkpoint strategy', value: p.mode,
            options: [ { id: 'off', label: 'Off' }, { id: 'final', label: 'Final only' }, { id: 'every', label: 'Every step' } ] },
          { kind: 'choice', key: 'event', label: 'Simulate failure', value: p.event,
            options: [ { id: 'none', label: 'None' }, { id: 'tool', label: 'Tool crash' }, { id: 'refresh', label: 'Browser refresh' }, { id: 'timeout', label: 'Timeout' } ] }
        ];
      },
      getOutput() {
        const can = p.mode !== 'off';
        return [
          { k: 'Recovery', v: can ? 'Resume' : 'Restart', class: can ? 'good' as const : 'bad' as const },
          { k: 'Steps replayed', v: can ? '0' : '4', class: can ? 'good' as const : 'bad' as const },
          { k: 'Extra cost', v: can ? '~0' : '+$0.03', class: can ? 'good' as const : 'warn' as const },
          { k: 'Storage', v: p.mode === 'every' ? '~20KB' : p.mode === 'final' ? '~4KB' : '0', class: 'good' as const }
        ];
      },
      getDelta() {
        if (p.event === 'none') return 'Pick a failure to see recovery.';
        return p.mode === 'off'
          ? '<b>No checkpoint</b> — agent must replay everything. <span class="changed">Wasteful and slow.</span>'
          : '<b>Checkpoint</b> — agent resumes from step 5 with full context. <span class="changed">Production-grade.</span>';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
