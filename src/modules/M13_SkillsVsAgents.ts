import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, toolNode, orb, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

const TASKS = [
  { id: 't1', label: 'Convert receipt to expense', best: 'skill' },
  { id: 't2', label: 'Plan a weekend trip <$500', best: 'agent' },
  { id: 't3', label: 'Send weekly recap email', best: 'workflow' },
  { id: 't4', label: 'Triage 30 new support tickets', best: 'multi' },
  { id: 't5', label: 'Translate menu to English', best: 'skill' },
  { id: 't6', label: 'Decide on travel insurance', best: 'agent' }
];

export const mod13: ModuleDef = {
  id: 'm13',
  num: 'M13',
  title: 'Skills vs Workflows vs Agents — When Do You Need Reasoning?',
  subtitle: 'Some tasks need a function. Others need a thinker. Stop using a sledgehammer for a thumbtack.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const skill = toolNode(C.tool, 'Skill (deterministic)'); skill.position.set(-6, 1.5, 0); skill.scale.setScalar(0.55);
    const workflow = toolNode(C.accent, 'Workflow (fixed)'); workflow.position.set(-2, 1.5, 0); workflow.scale.setScalar(0.55);
    const agent = brain(C.agent, 0.7); agent.position.set(2, 1.5, 0);
    const multi = new Group();
    for (let i = 0; i < 3; i++) { const a = brain(C.agentDeep, 0.4); a.position.set(5.4 + (i % 2) * 0.7, 1.7 - (i % 2) * 0.5, 0); multi.add(a); }

    const taskCards: Group[] = [];
    let beams: Group[] = [];
    let p = { pick: 't2' };

    function placeTasks() {
      TASKS.forEach((t, i) => {
        const card = dataCard([t.label], C.dim, { w: 3.2 });
        card.position.set(-5 + (i % 3) * 3.5, -2.0 - Math.floor(i / 3) * 1.0, 0);
        root.add(card); taskCards.push(card);
      });
    }

    function highlight() {
      for (const b of beams) root.remove(b); beams = [];
      taskCards.forEach((card, i) => {
        const data = TASKS[i];
        const isSel = data.id === p.pick;
        ((card as any).plane.material).color = isSel ? C.accentWarm : C.dim;
        ((card as any).plane.material).opacity = isSel ? 1.0 : 0.6;
        if (isSel) {
          const target = data.best === 'skill' ? skill.position : data.best === 'workflow' ? workflow.position : data.best === 'agent' ? agent.position : new Vector3(5.7, 1.4, 0);
          const col = data.best === 'skill' ? C.tool : data.best === 'workflow' ? C.accent : data.best === 'agent' ? C.agent : C.agentDeep;
          const b = beam(card.position.clone(), target.clone(), col);
          root.add(b); beams.push(b as any);
          ctx.tweens.to({ duration: 0.6, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.6 * t; } });
        }
      });
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Four shapes of "intelligence"',
          story: '<b>Skill</b>: one tool, fixed input/output (CSV→chart). <b>Workflow</b>: known sequence (fetch→send email). <b>Agent</b>: decides what to do next. <b>Multi-agent</b>: a team of agents.',
          llm: 'Tools, workflows, and agents all use LLMs somewhere — the question is whether the LLM is *deciding* or just *transforming*. Skill = no decision. Agent = decision per step.'
        },
        {
          title: 'Step 2 — Classify these tasks',
          story: 'Pick a task on the right and see which shape fits. Hint: if you can write the steps in advance with no branching, it\'s not an agent\'s job.',
          llm: 'A test: ask "could a junior write a 10-line script for this?" If yes, it\'s a skill. If the answer changes per case ⇒ workflow. If you can\'t list the steps in advance ⇒ agent.'
        },
        {
          title: 'Step 3 — Use the smallest tool that works',
          story: 'Agents are powerful but slow and expensive. A LLM-powered "convert receipt to expense" call costs 10× a regex script and is less reliable. Use skills first.',
          llm: 'Cost rule of thumb: skill ≈ free, workflow ≈ cents, agent ≈ dimes, multi-agent ≈ dollars per task. Match cost to value of the decision.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(skill); root.add(workflow); root.add(agent); root.add(multi);
        const ml = makeLabel('Multi-agent', C.agentDeep); ml.position.set(5.6, 2.7, 0); root.add(ml);
        const al = makeLabel('Agent', C.agent); al.position.set(2, 2.7, 0); root.add(al);
        placeTasks();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [0, -0.5, 0]);
      },
      goStep(i) { highlight(); },
      onControl(k, v) { if (k === 'pick') { p.pick = v; highlight(); } },
      update(dt) { agent.rotation.y += dt * 0.4; multi.children.forEach((c) => { c.rotation.y += dt * 0.6; }); skill.rotation.y += dt * 0.3; workflow.rotation.y += dt * 0.3; },
      getControls() {
        return [{ kind: 'choice', key: 'pick', label: 'Task to classify', value: p.pick,
          options: TASKS.map((t) => ({ id: t.id, label: t.id.toUpperCase() })) }];
      },
      getOutput() {
        const task = TASKS.find((t) => t.id === p.pick)!;
        const labels: Record<string, string> = { skill: 'Skill', workflow: 'Workflow', agent: 'Agent', multi: 'Multi-agent' };
        const costs: Record<string, string> = { skill: '$0.000', workflow: '$0.01', agent: '$0.05', multi: '$0.30' };
        return [
          { k: 'Task', v: task.id, class: 'good' as const },
          { k: 'Best fit', v: labels[task.best], class: 'good' as const },
          { k: 'Estimated cost', v: costs[task.best], class: 'good' as const },
          { k: 'Why', v: task.best === 'skill' ? 'deterministic I/O' : task.best === 'workflow' ? 'known sequence' : task.best === 'agent' ? 'needs reasoning' : 'parallel sub-decisions' }
        ];
      },
      getDelta() {
        const task = TASKS.find((t) => t.id === p.pick)!;
        return task.best === 'skill'
          ? '<b>Skill</b> — write a function and move on. No LLM in the loop here.'
          : task.best === 'workflow'
            ? '<b>Workflow</b> — the steps don\'t change. Hard-code the pipeline, save tokens.'
            : task.best === 'agent'
              ? '<b>Agent</b> — needs reasoning, the path depends on what it finds. <span class="changed">Worth the cost.</span>'
              : '<b>Multi-agent</b> — parallel work where different decisions benefit from different specialists.';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
