import { Group, Vector3, Color } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, orb, toolNode, particles, beam } from '../components/Prims';
import { Mesh, MeshStandardMaterial, BoxGeometry } from 'three';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod06: ModuleDef = {
  id: 'm06',
  num: 'M06',
  title: 'RAG Pipeline — Turning Documents into Searchable Memory',
  subtitle: 'Sam: "What do I do if my Lisbon flight is cancelled?"',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();

    const doc = new Mesh(new BoxGeometry(1.4, 1.8, 0.08), new MeshStandardMaterial({ color: '#e7ecf3', emissive: '#5cc8ff', emissiveIntensity: 0.15 }));
    doc.position.set(-7.5, 1.0, 0);
    const docLabel = makeLabel('Insurance terms.pdf', C.accent); docLabel.position.set(0, 1.3, 0); doc.add(docLabel);

    const chunkGroup = new Group();
    const crystalGroup = new Group();
    const agent = brain(C.agent, 0.9);
    agent.position.set(7.5, 1.5, 0);

    const queryOrb = orb({ color: C.user, r: 0.35 });
    queryOrb.position.set(7.5, -3, 0);
    const promptCard = dataCard(['# Final prompt to LLM','Question: cancellation refund?','Context: chunk_4 + chunk_7 (insurance)','Answer using context only.'], C.agent, { w: 3.6 });
    promptCard.position.set(0, -3.5, 0); promptCard.visible = false;

    let chunkMeshes: Group[] = [];
    let crystalMeshes: Mesh[] = [];
    let beams: Group[] = [];
    let p = { chunk: 200, topK: 3, rerank: false, hybrid: false };

    function rebuildChunks() {
      for (const c of chunkMeshes) chunkGroup.remove(c);
      for (const c of crystalMeshes) crystalGroup.remove(c);
      chunkMeshes = []; crystalMeshes = [];
      const n = Math.max(3, Math.round(2400 / p.chunk));
      for (let i = 0; i < n; i++) {
        const chunk = new Mesh(new BoxGeometry(0.8, 0.25, 0.06), new MeshStandardMaterial({ color: '#e7ecf3', emissive: '#34d399', emissiveIntensity: 0.25 }));
        chunk.position.set(-4 + (i % 5) * 0.95, 1.2 - Math.floor(i / 5) * 0.35, 0);
        chunkGroup.add(chunk); (chunkMeshes as any).push(chunk);

        const crystal = new Mesh(new BoxGeometry(0.25, 0.25, 0.25), new MeshStandardMaterial({ color: C.rag, emissive: C.rag, emissiveIntensity: 0.6 }));
        const theta = (i / n) * Math.PI * 2;
        crystal.position.set(2.4 + Math.cos(theta) * 1.5, 0.5 + Math.sin(theta * 1.3) * 1.4, Math.sin(theta) * 1.5);
        crystalGroup.add(crystal); crystalMeshes.push(crystal);
      }
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — One big PDF, useless as-is',
          story: 'The insurance terms PDF is 40 pages. The LLM can\'t read all of it for every question — too long, too expensive, and only a paragraph is actually relevant.',
          llm: 'LLM context windows are finite. Even when they fit, dumping a whole doc per query is slow and noisy. RAG is the workaround: fetch only what matters.'
        },
        {
          title: 'Step 2 — Offline: parse → chunk → embed → store',
          story: 'The doc is split into <b>chunks</b> (the green tiles). Each chunk is converted by an <b>embedding model</b> into a vector — a point in space. Crystals on the right are those points.',
          llm: 'The embedding model is a small LLM whose job is "turn this text into ~1500 numbers." Texts about the same idea land near each other in that space.'
        },
        {
          title: 'Step 3 — Online: Sam asks a question',
          story: 'Sam: <i>"What do I do if my Lisbon flight is cancelled?"</i> Same embedding model turns the question into a search vector (the gold orb). It flies into the crystal space.',
          llm: 'The query and the document chunks live in the same vector space, so "nearest neighbor" = "most semantically similar," even if no exact keywords match.'
        },
        {
          title: 'Step 4 — Retrieve top-K nearest chunks',
          story: 'The orb pulls the closest crystals back. Use the chunk-size and top-K controls to see the trade-off live. Smaller chunks = precise, less context. Top-K too small = miss the answer.',
          llm: 'Vector search is a one-shot ranked retrieval. Quality lives or dies on (1) chunking, (2) embedding model, (3) K. The LLM itself sees only the final shortlist.'
        },
        {
          title: 'Step 5 — Final prompt = question + retrieved context',
          story: 'The retrieved chunks are inserted into the LLM prompt: <i>"Answer using only this context. If not enough info, say so."</i> That\'s the whole magic of RAG.',
          llm: 'RAG = Retrieval-Augmented Generation. The LLM does not learn the doc — it sees it freshly on every query. Change the doc, change the answer immediately.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        root.add(doc); root.add(chunkGroup); root.add(crystalGroup);
        root.add(agent); root.add(queryOrb); root.add(promptCard);
        const al = makeLabel('LLM', C.agent); al.position.y = 1.7; agent.add(al);
        const ql = makeLabel('Query', C.user); ql.position.y = 0.7; queryOrb.add(ql);
        root.add(particles(120, C.rag, 5));
        rebuildChunks();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 17], [0, 0, 0]);
      },
      goStep(i) {
        for (const b of beams) root.remove(b); beams = [];
        promptCard.visible = false;
        if (i === 0) { chunkGroup.visible = false; crystalGroup.visible = false; queryOrb.visible = false; doc.visible = true; }
        if (i === 1) { chunkGroup.visible = true; crystalGroup.visible = true; queryOrb.visible = false;
          rebuildChunks();
          for (const c of crystalMeshes) { c.scale.setScalar(0.001); ctx.tweens.to({ duration: 0.6 + Math.random() * 0.4, easing: ease.outBack, update: (t) => c.scale.setScalar(t) }); }
        }
        if (i === 2) { queryOrb.visible = true; const b = beam(queryOrb.position.clone(), new Vector3(2.4, 0.5, 0), C.user); root.add(b); beams.push(b as any); ctx.tweens.to({ duration: 0.7, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.7 * t; } }); }
        if (i === 3) {
          const k = p.topK; const picks = crystalMeshes.slice(0, Math.min(k, crystalMeshes.length));
          picks.forEach((c, idx) => {
            (c.material as MeshStandardMaterial).emissive = new Color('#fbbf24');
            (c.material as MeshStandardMaterial).emissiveIntensity = 1.0;
            const b = beam(c.position.clone(), agent.position.clone(), C.accentWarm);
            root.add(b); beams.push(b as any);
            ctx.tweens.to({ duration: 0.5 + idx * 0.1, easing: ease.outCubic, update: (t) => { (b.material as any).opacity = 0.7 * t; } });
          });
          crystalMeshes.slice(k).forEach((c) => { (c.material as MeshStandardMaterial).emissiveIntensity = 0.15; });
        }
        if (i === 4) { promptCard.visible = true; }
      },
      onControl(k, v) {
        if (k === 'chunk') p.chunk = v;
        if (k === 'topk') p.topK = v;
        if (k === 'rerank') p.rerank = v;
        if (k === 'hybrid') p.hybrid = v;
        rebuildChunks();
      },
      update(dt, t) {
        crystalGroup.rotation.y += dt * 0.15;
        agent.rotation.y += dt * 0.3;
      },
      getControls() {
        return [
          { kind: 'range', key: 'chunk', label: 'Chunk size (chars)', value: p.chunk, min: 80, max: 600, step: 40 },
          { kind: 'range', key: 'topk', label: 'Top-K retrieved', value: p.topK, min: 1, max: 10, step: 1 },
          { kind: 'toggle', key: 'hybrid', label: 'Hybrid search (dense + sparse)', value: p.hybrid },
          { kind: 'toggle', key: 'rerank', label: 'Rerank top results', value: p.rerank }
        ];
      },
      getOutput() {
        const precision = Math.min(0.95, 0.5 + (p.chunk < 150 ? 0.25 : p.chunk < 300 ? 0.30 : 0.15) + (p.rerank ? 0.12 : 0) + (p.hybrid ? 0.08 : 0));
        const recall    = Math.min(0.97, 0.4 + (p.topK >= 3 ? 0.25 : 0.08) + (p.topK >= 5 ? 0.12 : 0) + (p.hybrid ? 0.10 : 0));
        const noise     = (p.topK > 6 ? 'high' : p.topK > 3 ? 'medium' : 'low');
        const f1 = ((2 * precision * recall) / (precision + recall));
        return [
          { k: 'Precision', v: (precision * 100).toFixed(0) + '%', class: precision > 0.75 ? 'good' as const : 'warn' as const },
          { k: 'Recall',    v: (recall * 100).toFixed(0) + '%',    class: recall > 0.75 ? 'good' as const : 'warn' as const },
          { k: 'Noise',     v: noise, class: noise === 'high' ? 'bad' as const : noise === 'medium' ? 'warn' as const : 'good' as const },
          { k: 'F1',        v: (f1 * 100).toFixed(0) + '%', class: f1 > 0.78 ? 'good' as const : 'warn' as const }
        ];
      },
      getDelta() {
        const tips: string[] = [];
        if (p.chunk < 130) tips.push('Tiny chunks: precise but easily miss context that spans paragraphs.');
        if (p.chunk > 400) tips.push('Big chunks: lots of context but lots of noise too.');
        if (p.topK <= 2) tips.push('Top-K too low: might miss the chunk that has the actual answer.');
        if (p.topK >= 8) tips.push('Top-K too high: irrelevant chunks dilute the prompt.');
        if (p.hybrid) tips.push('<span class="changed">Hybrid</span> catches both exact-keyword and semantic matches.');
        if (p.rerank) tips.push('<span class="changed">Rerank</span> uses a slower model to reorder retrieved chunks by careful relevance.');
        return tips.length ? tips.map((t) => '• ' + t).join('<br>') : 'Default settings — solid baseline.';
      },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
