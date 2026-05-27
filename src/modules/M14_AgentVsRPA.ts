import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { orb, dataCard, gridFloor, makeLabel, track, brain } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod14: ModuleDef = {
  id: 'm14',
  num: 'M14',
  title: 'Agent vs RPA — Adapting to Change',
  subtitle: 'RPA is a train on rails. An agent is a drone. The airline redesigns its site — who survives?',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const rpaPath = [ new Vector3(-7, 1.5, 0), new Vector3(-3, 1.5, 0), new Vector3(2, 1.5, 0), new Vector3(7, 1.5, 0) ];
    const agentPath = [ new Vector3(-7, -1.5, 0), new Vector3(-3, -1.5, 1.5), new Vector3(0, -1.5, -1), new Vector3(4, -1.5, 1), new Vector3(7, -1.5, 0) ];
    const rpaTrack = track(rpaPath, C.tool, 0.06);
    const agTrack = track(agentPath, C.agent, 0.05);
    const rpa = orb({ color: C.tool, r: 0.45 });
    const ag = orb({ color: C.agent, r: 0.45 });
    let p = { event: 'normal' };
    let trace = '';

    function placeAt(o: Group, path: Vector3[], t: number) {
      const seg = Math.floor(t * (path.length - 1));
      const local = t * (path.length - 1) - seg;
      const a = path[Math.min(seg, path.length - 1)];
      const b = path[Math.min(seg + 1, path.length - 1)];
      o.position.lerpVectors(a, b, local);
    }

    let stepCards: Group[] = [];
    function addCard(text: string, color: any, x: number, y: number) {
      const c = dataCard([text], color, { w: 2.2 });
      c.position.set(x, y, 0);
      root.add(c); stepCards.push(c);
    }
    function placeSteps() {
      for (const c of stepCards) root.remove(c); stepCards = [];
      addCard('Find flight field', C.tool, -3, 2.3);
      addCard('Click "Book"', C.tool, 2, 2.3);
      addCard('Confirm', C.tool, 7, 2.3);
      addCard('Read new form', C.agent, -3, -2.7);
      addCard('Map fields by label', C.agent, 0, -2.7);
      addCard('Submit booking', C.agent, 4, -2.7);
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — RPA: click here, then there, then there',
          story: 'Traditional RPA records exact clicks: "field #4 = JFK, field #7 = LIS, click button.btn-book". Works perfectly — as long as the page never changes.',
          llm: 'RPA bots are usually rule-based with no LLM at all. They follow recorded macros. The "intelligence" is in the script author, not the bot.'
        },
        {
          title: 'Step 2 — Agent: read the page, decide where to type',
          story: 'An LLM-driven agent looks at the rendered page, identifies the "Origin" input <i>by its label</i>, types JFK. It does not care if the field is in position 4 or 14.',
          llm: 'The LLM reads the DOM (or a screenshot via vision) and outputs structured intent: <code>{action: "type", target: "label=Origin", value: "JFK"}</code>. The orchestrator translates intent into a real click/type.'
        },
        {
          title: 'Step 3 — The airline redesigns the booking form',
          story: 'Pick "UI changed" on the right. RPA derails because field positions moved. The agent re-reads the new form and adapts automatically.',
          llm: 'This is why "computer-use" agents (vision + browser control) feel magical — the LLM tolerates layout changes, missing fields, unexpected modals. RPA cannot.'
        },
        {
          title: 'Step 4 — RPA for stable, agents for changing',
          story: 'High-volume + stable workflow ⇒ RPA wins on cost. Low-volume + changing UI ⇒ agent wins on adaptability. Many teams now combine: RPA executes, agent supervises.',
          llm: 'Hybrid pattern: RPA does the fast keystroke part. The agent watches for "looks wrong" and intervenes when the recorded script no longer matches reality.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(rpaTrack); root.add(agTrack);
        root.add(rpa); root.add(ag);
        const rl = makeLabel('RPA', C.tool); rl.position.y = 1.0; rpa.add(rl);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.0; ag.add(al);
        placeSteps();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [0, 0, 0]);
      },
      goStep(i) {
        const rpaFinish = (p.event === 'ui_change' || p.event === 'missing_field' || p.event === 'unexpected_error') ? 0.45 : 1;
        const agFinish = 1;
        ctx.tweens.to({ duration: 2.2, easing: ease.inOutCubic, update: (t) => placeAt(rpa, rpaPath, t * rpaFinish) });
        ctx.tweens.to({ duration: 2.8, easing: ease.inOutCubic, update: (t) => placeAt(ag, agentPath, t * agFinish) });
        if (p.event === 'normal') trace = 'Both finished. RPA in 1.4s, agent in 3.2s.';
        else if (p.event === 'ui_change') trace = 'RPA derailed: field positions changed. Agent re-read labels and succeeded.';
        else if (p.event === 'missing_field') trace = 'Missing optional field. RPA crashed on null pointer. Agent skipped and continued.';
        else if (p.event === 'unexpected_error') trace = 'A modal popped up. RPA hung. Agent read the modal, dismissed it, retried.';
        else trace = 'Unclear user request — both struggled, but only the agent asked for clarification.';
      },
      onControl(k, v) { if (k === 'event') p.event = v; this.goStep!(0); },
      update(dt) {},
      getControls() {
        return [{ kind: 'choice', key: 'event', label: 'Disruption', value: p.event,
          options: [ { id: 'normal', label: 'Normal' }, { id: 'ui_change', label: 'UI changed' }, { id: 'missing_field', label: 'Missing field' }, { id: 'unexpected_error', label: 'Popup error' }, { id: 'unclear', label: 'Unclear req' } ] }];
      },
      getOutput() {
        if (p.event === 'normal') return [
          { k: 'RPA', v: '$0.001 / 1.4s', class: 'good' as const },
          { k: 'Agent', v: '$0.04 / 3.2s', class: 'warn' as const },
          { k: 'Result', v: 'Both OK', class: 'good' as const },
          { k: 'Winner', v: 'RPA (cost)', class: 'good' as const }
        ];
        return [
          { k: 'RPA', v: 'FAILED', class: 'bad' as const },
          { k: 'Agent', v: 'Adapted', class: 'good' as const },
          { k: 'Manual fix needed', v: 'RPA only', class: 'bad' as const },
          { k: 'Winner', v: 'Agent', class: 'good' as const }
        ];
      },
      getDelta() { return trace; },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
