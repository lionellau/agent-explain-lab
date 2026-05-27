# 🤖 Agent Explain Lab

### A 15-minute guided tour of how AI agents actually work.

**No math. No code. No prior AI background needed.**

One running story threads through every chapter:

> *Sam asks: "Plan me a 3-day weekend trip to Lisbon under $500, leaving Friday night."*

Each chapter shows one concept by replaying that same question, with one bold-sentence explanation, one focused animation, and a Next button that glows after you've had a moment to read. That's it. No quizzes, no dashboards, no friction.

Sister project to [llm-explain-lab](https://github.com/lionellau/llm-explain-lab). Same design language, same calm pace.

---

## The 15 chapters

| # | Chapter | What you walk away with |
|---|---|---|
| 01 | 🗣️ **Chatbot vs Agent** | A chatbot answers off the top of its head. An agent goes and checks first. |
| 02 | 🔁 **The Think-Act Loop** | The agent works in small loops: think → act → look. Not all at once. |
| 03 | 🛤️ **Rails vs Drone** | Fixed pipelines are fast and cheap. Agents are flexible when surprises hit. |
| 04 | 🗺️ **Making a Plan** | One fuzzy request becomes a tiny checklist before any work starts. |
| 05 | 🧠 **Memory** | Sticky notes for today, a notebook for forever, and the trick is the filter. |
| 06 | 📚 **Looking it Up (RAG)** | Chop a PDF into chunks, store their meanings, retrieve the right one on demand. |
| 07 | 🔎 **Words vs Meaning** | Two search styles. Hybrid catches what each one misses. |
| 08 | ⚖️ **Sorting the Shortlist** | Fast search finds 10. A slower judge picks the best 3. |
| 09 | 🔌 **Giving the Agent Tools** | MCP is a universal plug, plus the failure modes you can't avoid. |
| 10 | 🪞 **Checking Its Own Work** | A critic catches the over-budget plan before you see it. |
| 11 | 💾 **Saving Progress** | If the browser crashes, can the agent pick up where it stopped? |
| 12 | 👥 **A Team of Agents** | Planner + researcher + reviewer. Past 4 specialists, you're paying for chatter. |
| 13 | 🛠️ **Not Everything Needs an Agent** | Skill vs workflow vs agent vs multi-agent — pick the smallest one. |
| 14 | 🤖 **When the Website Changes** | RPA breaks on a redesign. Agents read the new layout and keep going. |
| 15 | 🎬 **Putting it All Together** | Every piece, in one continuous run. |

---

## Run it

```bash
npm install --legacy-peer-deps
npm run dev
```

Open the printed URL (usually `http://localhost:5174`). Pick a chapter from the top nav or press **▶ Begin tour** on the home page.

To build the static bundle:

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build
```

---

## How a chapter is structured

Every chapter shares the same simple rhythm — that's the whole point.

1. **A short subtitle** telling you why this chapter exists.
2. **A "Watch" panel** with a focused, hand-crafted animation.
3. **A "📖 Explanation" card** with one bold sentence and an optional small "↳ In an LLM" note. The Next button stays quiet for the first three seconds so you can actually read, then it gently glows.
4. **A progress bar of dots** + Back / autoplay / Next.
5. **A pointer to the next chapter** at the bottom.

If you've used the sister [LLM Lab](https://github.com/lionellau/llm-explain-lab), this will feel identical. That's intentional.

---

## Stack

- **Vite + React 19 + TypeScript** — the app shell
- **Tailwind CSS v4** — styling
- **HashRouter** — so deep-links work on any static host
- **react-three-fiber + drei** — kept in deps for future 3D chapters; the current pass uses CSS-driven animations for clarity and load speed

---

## Project layout

```
src/
├── main.tsx                       # entry
├── App.tsx                        # router + sticky nav
├── index.css                      # design tokens (ink / paper / grape / sun)
├── chapters.ts                    # 15-chapter manifest + shared story
├── components/
│   ├── StorySteps.tsx             # the read-then-Next walkthrough
│   ├── JourneyNav.tsx             # prev / next + 15-dot progress
│   └── ChapterShell.tsx           # shared header + watch + story layout
└── pages/
    ├── Home.tsx
    ├── ChatbotVsAgent.tsx
    ├── ReactLoop.tsx
    ├── WorkflowVsAgent.tsx
    ├── Planning.tsx
    ├── Memory.tsx
    ├── RAG.tsx
    ├── DenseVsSparse.tsx
    ├── Reranking.tsx
    ├── ToolsMCP.tsx
    ├── Reflection.tsx
    ├── State.tsx
    ├── MultiAgent.tsx
    ├── SkillsVsAgents.tsx
    ├── AgentVsRPA.tsx
    └── Capstone.tsx
```

Each chapter is a ~100-line page. Same shape every time, so contributors only have to think about the visual and the words.

---

## License

MIT — use it, fork it, ship it, teach with it.
