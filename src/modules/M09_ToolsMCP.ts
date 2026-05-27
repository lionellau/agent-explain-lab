import { Group, Vector3 } from 'three';
import { C } from '../core/Theme';
import { ease } from '../core/Tween';
import { brain, dataCard, gridFloor, makeLabel, toolNode, beam } from '../components/Prims';
import type { Module, ModuleDef, ModuleContext } from '../core/ModuleTypes';

export const mod09: ModuleDef = {
  id: 'm09',
  num: 'M09',
  title: 'Tool Calling & MCP — Letting the Agent Use the World',
  subtitle: 'Wrong parameter? Tool down? Permission denied? The agent has to handle all of it.',
  create() {
    let ctx!: ModuleContext;
    const root = new Group();
    const agent = brain(C.agent, 1.0);
    const mcpHub = toolNode(C.accentWarm, 'MCP adapter');
    mcpHub.position.set(0, 1.0, 0); mcpHub.scale.setScalar(0.7);

    const tools = [
      { node: toolNode(C.tool, 'Flights API'), pos: new Vector3(-5, -1.5, 0) },
      { node: toolNode(C.tool, 'Hotels API'),  pos: new Vector3(-2, -3.0, 0) },
      { node: toolNode(C.tool, 'Calendar'),    pos: new Vector3(2, -3.0, 0) },
      { node: toolNode(C.tool, 'Email'),       pos: new Vector3(5, -1.5, 0) }
    ];

    let beams: Group[] = [];
    let trace: string[] = [];
    let p = { mcp: true, fail: 'none' };

    function rebuildBeams() {
      beams.forEach((b) => root.remove(b)); beams = [];
      for (const t of tools) {
        const via = p.mcp ? mcpHub.position : null;
        const col = p.mcp ? C.accentWarm : C.tool;
        if (via) {
          const b1 = beam(agent.position.clone(), via.clone(), C.agent); root.add(b1); beams.push(b1 as any);
          (b1.material as any).opacity = 0.4;
          const b2 = beam(via.clone(), t.pos.clone(), col); root.add(b2); beams.push(b2 as any);
          (b2.material as any).opacity = 0.4;
        } else {
          // No MCP — direct, messy lines
          const b = beam(agent.position.clone(), t.pos.clone(), C.tool); root.add(b); beams.push(b as any);
          (b.material as any).opacity = 0.35;
        }
      }
    }

    function runScenario() {
      trace = [];
      trace.push('1) Agent decides: I need flight + hotel.');
      if (p.fail === 'param') {
        trace.push('2) Calls flight_search(metric="speed") — BAD param name.');
        trace.push('3) Tool returns: "Unknown param. Did you mean origin/dest?"');
        trace.push('4) Agent reads the schema, retries with origin/dest. ✓');
      } else if (p.fail === 'timeout') {
        trace.push('2) Calls flight_search — TIMEOUT 30s.');
        trace.push('3) Retry with backoff. 2nd attempt succeeds. ✓');
      } else if (p.fail === 'permission') {
        trace.push('2) Calls email.send — PERMISSION DENIED.');
        trace.push('3) Agent asks user for approval before retrying. (Safety wins.)');
      } else if (p.fail === 'unsafe') {
        trace.push('2) Agent tries to call payment.charge — flagged as high-risk.');
        trace.push('3) Guardrail blocks. Human-in-loop required. ✗ (good).');
      } else {
        trace.push('2) flight_search(...) → 3 results.');
        trace.push('3) hotel_search(...) → 2 results.');
        trace.push('4) calendar.add(...) → event created. ✓');
      }
    }

    const m: Module = {
      steps: [
        {
          title: 'Step 1 — Without MCP: spaghetti wiring',
          story: 'Each tool has its own auth, schema, response shape. The agent needs custom code per tool. Adding a 9th tool means a 9th integration to maintain.',
          llm: 'The LLM does not call tools directly — your orchestrator does. Without a standard, every new tool means more glue code, more bugs, more drift.'
        },
        {
          title: 'Step 2 — With MCP: one adapter, many tools',
          story: 'MCP (Model Context Protocol) is a universal connector. The agent talks to one hub; the hub speaks each tool\'s native language. Toggle the control to see the cabling change.',
          llm: 'MCP standardizes the tool-discovery + tool-call shape. Any MCP-compatible tool becomes available to any MCP-compatible agent. Like USB for AI tools.'
        },
        {
          title: 'Step 3 — Things break: bad params, timeouts, permissions',
          story: 'Production agents must handle failures: wrong parameter, tool down, permission denied, unsafe action requested. Use the failure-mode control on the right.',
          llm: 'Tool errors come back as messages in the LLM context. A good system prompt teaches the LLM to read the error, fix the call, and retry — but only a bounded number of times.'
        },
        {
          title: 'Step 4 — Safety: schema, retries, guardrails, approval',
          story: 'High-stakes tools (payments, email send, deletes) should require: schema validation, rate limits, retries with backoff, and human approval for risky actions.',
          llm: 'Never trust the LLM to call a destructive tool unchecked. Wrap it with policy: <code>if tool.risk > threshold ⇒ ask human</code>. Guardrails belong in the orchestrator, not the prompt.'
        }
      ],
      init(c) {
        ctx = c;
        root.add(gridFloor(C.dim));
        agent.position.set(0, 3.5, 0); root.add(agent);
        const al = makeLabel('Agent', C.agent); al.position.y = 1.9; agent.add(al);
        root.add(mcpHub);
        for (const t of tools) { t.node.position.copy(t.pos); t.node.scale.setScalar(0.55); root.add(t.node); }
        rebuildBeams();
        ctx.sm.scene.add(root);
        ctx.sm.setCamera([0, 3, 16], [0, 0, 0]);
      },
      goStep(i) {
        if (i === 0) { p.mcp = false; }
        if (i >= 1) { p.mcp = true; }
        rebuildBeams();
        runScenario();
      },
      onControl(k, v) {
        if (k === 'mcp') p.mcp = v;
        if (k === 'fail') p.fail = v;
        rebuildBeams(); runScenario();
      },
      update(dt) { agent.rotation.y += dt * 0.3; mcpHub.rotation.y += dt * 0.5; },
      getControls() {
        return [
          { kind: 'toggle', key: 'mcp', label: 'Use MCP adapter', value: p.mcp },
          { kind: 'choice', key: 'fail', label: 'Failure scenario', value: p.fail,
            options: [ { id: 'none', label: 'None' }, { id: 'param', label: 'Bad param' }, { id: 'timeout', label: 'Timeout' }, { id: 'permission', label: 'Perm denied' }, { id: 'unsafe', label: 'Risky call' } ] }
        ];
      },
      getOutput() {
        const ok = p.fail === 'none' || p.fail === 'param' || p.fail === 'timeout';
        return [
          { k: 'Tools reachable', v: p.mcp ? '8 (via MCP)' : '4 (custom code)', class: p.mcp ? 'good' as const : 'warn' as const },
          { k: 'Onboarding new tool', v: p.mcp ? 'minutes' : 'days', class: p.mcp ? 'good' as const : 'bad' as const },
          { k: 'This run', v: ok ? 'Success' : (p.fail === 'unsafe' ? 'Blocked (good)' : 'Needs human'), class: ok ? 'good' as const : 'warn' as const },
          { k: 'Retries used', v: p.fail === 'param' ? '1' : p.fail === 'timeout' ? '1' : '0', class: 'good' as const }
        ];
      },
      getDelta() { return trace.length ? trace.map((t) => '• ' + t).join('<br>') : 'Pick a failure scenario.'; },
      dispose() { ctx.sm.scene.remove(root); }
    };
    return m;
  }
};
