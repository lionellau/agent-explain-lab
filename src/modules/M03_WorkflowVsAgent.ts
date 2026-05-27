import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { orb, brain, toolNode, dataCard, gridFloor, track, makeLabel, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod03: ModuleDef = {
  id: 'm03',
  num: 'M03',
  title: 'Workflow vs Agent',
  subtitle: 'Trains follow rails. Drones fly around obstacles.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();

    const trainPath = [ new Vector3(-7, 1.5, 0), new Vector3(-2, 1.5, 0), new Vector3(2, 1.5, 0), new Vector3(7, 1.5, 0) ];
    const altPath  = [ new Vector3(-7, -1.5, 0), new Vector3(-3, -1.5, 1.5), new Vector3(0, -1.5, -1.5), new Vector3(3, -1.5, 2), new Vector3(7, -1.5, 0) ];

    const tWf = track(trainPath, C.tool, 0.06);
    const tAg = track(altPath, C.agent, 0.05);

    const train = orb({ color: C.tool, r: 0.4 });
    const drone = orb({ color: C.agent, r: 0.4 });

    // Steps along workflow path
    const wfSteps = [
      toolNode(C.tool, 'Flights'),
      toolNode(C.tool, 'Hotels'),
      toolNode(C.tool, 'Activities')
    ];
    wfSteps[0].position.set(-2, 1.5, 0);
    wfSteps[1].position.set(2, 1.5, 0);
    wfSteps[2].position.set(7, 1.5, 0);

    const altSteps = [
      toolNode(C.tool, 'Flights'),
      toolNode(C.agent, 'Plan B: Hostel'),
      toolNode(C.rag,   'Reroute'),
      toolNode(C.tool,  'Activities')
    ];
    altSteps[0].position.set(-3, -1.5, 1.5);
    altSteps[1].position.set(0, -1.5, -1.5);
    altSteps[2].position.set(3, -1.5, 2);
    altSteps[3].position.set(7, -1.5, 0);

    let progress = { wf: 0, ag: 0 };
    let p = { condition: 'normal' };
    let result = '';

    function placeTrain(t: number) {
      const seg = Math.floor(t * (trainPath.length - 1));
      const local = t * (trainPath.length - 1) - seg;
      const a = trainPath[Math.min(seg, trainPath.length - 1)];
      const b = trainPath[Math.min(seg + 1, trainPath.length - 1)];
      train.position.lerpVectors(a, b, local);
    }
    function placeDrone(t: number) {
      const seg = Math.floor(t * (altPath.length - 1));
      const local = t * (altPath.length - 1) - seg;
      const a = altPath[Math.min(seg, altPath.length - 1)];
      const b = altPath[Math.min(seg + 1, altPath.length - 1)];
      drone.position.lerpVectors(a, b, local);
    }

    let labelWf!: Group, labelAg!: Group, status!: Group;

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Two ways to plan a trip',
          story: 'Top rail (cyan): a fixed <b>workflow</b> — flights, then hotels, then activities, in that order. Bottom path (purple): an <b>agent</b> — same goal, but free to reroute. Pick a condition on the right and watch both runs.',
          llm: 'A workflow can use LLMs inside steps, but the structure is hard-coded. An agent uses an LLM to choose what to do next at every step.'
        },
        {
          title: 'Step 2 — Normal conditions',
          story: 'Everything works. <b>Train</b> finishes at $440 with low cost. <b>Drone</b> also finishes, but spent more tokens deciding. Workflow wins on price.',
          llm: 'When the path is well-known, you do not need the LLM to re-plan at every step. A fixed pipeline is cheaper and more predictable.'
        },
        {
          title: 'Step 3 — Hotel API is down',
          story: 'Now the Hotels API is down. <b>Train derails</b> — it has no Plan B. <b>Drone reroutes</b> to a hostel API + Airbnb fallback and still finishes.',
          llm: 'The LLM looks at the failure message, decides "try a different tool with similar shape," and emits a new tool call. The workflow has no node for that decision.'
        },
        {
          title: 'Step 4 — Ambiguous request',
          story: 'User says <i>"somewhere warm, not too far"</i>. The workflow has no slot for clarification — it picks one interpretation and runs. The agent detects ambiguity and asks back.',
          llm: 'The LLM is great at noticing uncertain phrasing. The workflow author would have had to anticipate this case in code, which is brittle.'
        },
        {
          title: 'Step 5 — Pick the right tool for the job',
          story: '<b>Use workflows</b> for well-known repeatable paths (file → invoice → email). <b>Use agents</b> when you do not know in advance which steps will be needed.',
          llm: 'Hybrid wins in production: a workflow as the outer skeleton, with agentic sub-steps inside specific decisions. Best of both.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(tWf); root.add(tAg);
        for (const s of wfSteps) { s.scale.setScalar(0.5); root.add(s); }
        for (const s of altSteps) { s.scale.setScalar(0.5); root.add(s); }

        labelWf = makeLabel('Workflow (rails)', C.tool, { scale: 1.2 }) as any;
        labelWf.position.set(-7.5, 2.8, 0); root.add(labelWf);
        labelAg = makeLabel('Agent (drone)', C.agent, { scale: 1.2 }) as any;
        labelAg.position.set(-7.5, -0.4, 0); root.add(labelAg);

        train.position.copy(trainPath[0]); drone.position.copy(altPath[0]);
        root.add(train); root.add(drone);
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 4, 17], [0, 0, 0]);
      },
      goStep(i) {
        progress.wf = 0; progress.ag = 0;
        let wfFinish = 1; let agFinish = 1;
        if (i >= 2 && p.condition === 'tool_fail') wfFinish = 0.55;
        if (i >= 3 && p.condition === 'ambiguous') { wfFinish = 0.4; agFinish = 1; }
        ctx.tweens.to({ duration: 2.4, easing: ease.inOutCubic, update: (t) => { progress.wf = t * wfFinish; placeTrain(progress.wf); } });
        ctx.tweens.to({ duration: 3.0, easing: ease.inOutCubic, update: (t) => { progress.ag = t * agFinish; placeDrone(progress.ag); } });

        if (i >= 2 && p.condition === 'tool_fail') {
          result = 'Workflow: FAILED at Hotels step. Agent: rerouted via hostel API, $470, 4.2s.';
        } else if (i >= 3 && p.condition === 'ambiguous') {
          result = 'Workflow: guessed "Paris" — wrong city. Agent: asked back, confirmed "Lisbon".';
        } else if (i >= 1) {
          result = 'Both succeeded. Workflow $440 / 1.2s. Agent $445 / 3.1s (extra tokens for decisions).';
        } else {
          result = '';
        }
      },
      onControl(k, v) { if (k === 'condition') p.condition = v; this.goStep!(0); },
      update(dt) { train.rotation.y += dt * 1.2; drone.rotation.y += dt * 1.4; },
      getControls() {
        return [{ kind: 'choice', key: 'condition', label: 'Environment condition', value: p.condition,
          options: [ { id: 'normal', label: 'Normal' }, { id: 'tool_fail', label: 'Tool down' }, { id: 'ambiguous', label: 'Ambiguous req' } ] }];
      },
      getOutput() {
        if (p.condition === 'tool_fail') return [
          { k: 'Workflow', v: 'FAILED', class: 'bad' as const },
          { k: 'Agent',    v: 'Recovered', class: 'good' as const },
          { k: 'Agent cost', v: '$0.06 (5×)', class: 'warn' as const },
          { k: 'Latency', v: '4.2s', class: 'warn' as const }
        ];
        if (p.condition === 'ambiguous') return [
          { k: 'Workflow', v: 'Wrong city', class: 'bad' as const },
          { k: 'Agent',    v: 'Asked back', class: 'good' as const },
          { k: 'Agent cost', v: '$0.04', class: 'good' as const },
          { k: 'Latency', v: 'Depends on user', class: 'warn' as const }
        ];
        return [
          { k: 'Workflow', v: '$440 / 1.2s', class: 'good' as const },
          { k: 'Agent',    v: '$445 / 3.1s', class: 'good' as const },
          { k: 'Agent cost', v: '$0.05', class: 'warn' as const },
          { k: 'Predictable?', v: 'Workflow yes', class: 'good' as const }
        ];
      },
      getDelta() { return result || 'Pick a condition and run.'; },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
