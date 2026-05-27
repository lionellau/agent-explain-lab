import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, toolNode, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';
import { MEMORY_NOTES } from '../core/Scenario';

export const mod05: ModuleDef = {
  id: 'm05',
  num: 'M05',
  title: 'Memory — Short-Term vs Long-Term',
  subtitle: '"Same as my Tokyo trip but cheaper" — what should the agent remember?',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.0);
    const desk = toolNode(C.agent, 'Working desk (short)');
    const archive = toolNode(C.memory, 'Memory library (long)');
    let stickies: Group[] = [];
    let books: Group[] = [];
    let retrieved: Group | null = null;
    let beams: Group[] = [];
    let p = { mode: 'long_filter' };

    function clearStickies() { stickies.forEach((s) => root.remove(s)); stickies = []; }
    function clearBooks() { books.forEach((b) => root.remove(b)); books = []; }
    function clearBeams() { beams.forEach((b) => root.remove(b)); beams = []; }

    function showStickies() {
      clearStickies();
      MEMORY_NOTES.short.forEach((line, i) => {
        const c = dataCard([line], C.agent, { w: 2.6 });
        c.position.set(-4, 0.4 - i * 0.7, 0); c.scale.setScalar(0.0001);
        root.add(c); stickies.push(c);
        ctx.tweens.to({ duration: 0.4, easing: ease.outBack, update: (t) => c.scale.setScalar(t) });
      });
    }
    function showBooks(mode: string) {
      clearBooks();
      const sources = mode === 'none' ? [] :
                     mode === 'short' ? [] :
                     mode === 'long' ? [...MEMORY_NOTES.longHits, ...MEMORY_NOTES.longMisses] :
                     MEMORY_NOTES.longHits;
      sources.forEach((line, i) => {
        const isHit = MEMORY_NOTES.longHits.includes(line);
        const col = isHit ? C.rag : C.bad;
        const c = dataCard([line], col, { w: 3.0 });
        c.position.set(4.4, 1.6 - i * 0.7, 0); c.scale.setScalar(0.0001);
        root.add(c); books.push(c);
        ctx.tweens.to({ duration: 0.4, easing: ease.outBack, update: (t) => c.scale.setScalar(t) });
      });
    }
    function showRetrieval(mode: string) {
      if (retrieved) { root.remove(retrieved); retrieved = null; }
      let card: Group;
      if (mode === 'none') {
        card = dataCard(['# Agent says','"Tokyo trip? Never heard.','Treating this as new request."'], C.bad, { w: 3.3 });
      } else if (mode === 'short') {
        card = dataCard(['# Agent says','"This session: just started.','I have no past trips."'], C.warn, { w: 3.3 });
      } else if (mode === 'long') {
        card = dataCard(['# Agent retrieved (no filter)','✓ Tokyo: window seat','✓ Veg, no seafood','✗ Berlin business (wrong!)','→ Suggests sushi tour 🚨'], C.warn, { w: 3.5 });
      } else {
        card = dataCard(['# Agent retrieved (filtered)','✓ Tokyo: window seat','✓ Veg, no seafood','→ Plans veg-friendly Lisbon,','  window seat, walking tour'], C.good, { w: 3.5 });
      }
      card.position.set(0, -3.5, 0);
      root.add(card); retrieved = card;
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Two different memory rooms',
          story: '<b>Short-term</b> (desk): the current conversation — request, recent tool outputs, the plan in progress. <b>Long-term</b> (library): past trips, preferences, prior decisions.',
          llm: 'Short-term memory = the message history in the current API call. Long-term memory = a database or vector store the agent <i>retrieves into</i> short-term.'
        },
        {
          title: 'Step 2 — Sam says "same as my Tokyo trip, cheaper"',
          story: 'This sentence assumes the agent <i>remembers</i> the Tokyo trip. With no long-term memory, that\'s impossible. With long-term memory, the agent goes to the library.',
          llm: 'The LLM does not "know" your past. The orchestrator has to fetch the relevant history and inject it into the LLM\'s context as messages.'
        },
        {
          title: 'Step 3 — Retrieve from the library',
          story: 'Use the memory-mode control on the right. Watch the green ✓ vs red ✗ books — relevant vs irrelevant retrieval. Bad retrieval poisons the answer.',
          llm: 'Retrieval-augmented memory uses the user query as a key, finds similar past records, and adds them to the prompt. Without a relevance filter, junk leaks in.'
        },
        {
          title: 'Step 4 — Memory works only when it\'s curated',
          story: 'No memory ⇒ blind. Unfiltered memory ⇒ noisy and confidently wrong. Filtered memory ⇒ helpful. Same data, three different agents.',
          llm: 'Production agents keep separate stores: episodic (per-session), semantic (facts/preferences), procedural (how-tos). And they always filter on relevance + recency.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        agent.position.set(0, 1.4, 0); root.add(agent);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);

        desk.position.set(-4, -1.0, -0.5); desk.scale.setScalar(0.55); root.add(desk);
        archive.position.set(4.4, -1.0, -0.5); archive.scale.setScalar(0.55); root.add(archive);

        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [0, -0.5, 0]);
      },
      goStep(i) {
        clearBeams();
        if (i === 0) { clearStickies(); clearBooks(); if (retrieved) { root.remove(retrieved); retrieved = null; } }
        if (i >= 1) { showStickies(); }
        if (i >= 2) {
          showBooks(p.mode);
          if (p.mode === 'long' || p.mode === 'long_filter') {
            const b = beam(agent.position.clone(), archive.position.clone(), C.memory);
            root.add(b); beams.push(b as any);
            ctx.tweens.to({ duration: 0.6, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.6 * t; } });
          }
        }
        if (i >= 3) { showRetrieval(p.mode); }
      },
      onControl(k, v) { if (k === 'mode') { p.mode = v; showBooks(v); showRetrieval(v); } },
      update(dt, t) { agent.rotation.y += dt * 0.4; (agent as any).core.material.emissiveIntensity = 0.55 + Math.sin(t * 3) * 0.18; },
      getControls() {
        return [{ kind: 'choice', key: 'mode', label: 'Memory configuration', value: p.mode,
          options: [
            { id: 'none', label: 'None' },
            { id: 'short', label: 'Short only' },
            { id: 'long', label: 'Long (no filter)' },
            { id: 'long_filter', label: 'Long + filter' }
          ] }];
      },
      getOutput() {
        const out: Record<string, any[]> = {
          none:        [ { k: 'Tokyo recall', v: 'No', class: 'bad' }, { k: 'Veg flag', v: 'No', class: 'bad' }, { k: 'Risk', v: 'Books seafood', class: 'bad' }, { k: 'Confidence', v: '40%', class: 'bad' } ],
          short:       [ { k: 'Tokyo recall', v: 'No', class: 'bad' }, { k: 'Veg flag', v: 'No', class: 'bad' }, { k: 'Risk', v: 'Generic plan', class: 'warn' }, { k: 'Confidence', v: '55%', class: 'warn' } ],
          long:        [ { k: 'Tokyo recall', v: 'Yes', class: 'good' }, { k: 'Veg flag', v: 'Yes', class: 'good' }, { k: 'Noise',  v: 'Berlin leaked!', class: 'bad' }, { k: 'Confidence', v: '70% (false)', class: 'warn' } ],
          long_filter: [ { k: 'Tokyo recall', v: 'Yes', class: 'good' }, { k: 'Veg flag', v: 'Yes', class: 'good' }, { k: 'Noise',  v: 'Filtered', class: 'good' }, { k: 'Confidence', v: '91%', class: 'good' } ]
        };
        return out[p.mode];
      },
      getDelta() {
        const d: Record<string, string> = {
          none: '<b>No memory</b> — agent treats every request as new. Repeats questions, ignores allergies.',
          short: '<b>Short only</b> — fine within a session, forgets the user between sessions.',
          long: '<b>Long, unfiltered</b> — pulls in everything, including unrelated trips. <span class="changed">Confidently wrong is worse than knowing nothing.</span>',
          long_filter: '<b>Long + relevance filter</b> — remembers what matters, ignores what doesn\'t. This is the production setup.'
        };
        return d[p.mode];
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
