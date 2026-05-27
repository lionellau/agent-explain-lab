// One place that lists every chapter and its identity. Used by App nav,
// Home grid, and JourneyNav (prev/next + progress dots).

export interface Chapter {
  path: string;
  n: string;
  title: string;
  tagline: string;
  blurb: string;
  emoji: string;
  accent: 'coral' | 'sun' | 'mint' | 'sky' | 'grape-soft' | 'rose';
  // Tailwind helpers — saves having to compute these in every page.
  accentText: string;
  accentBorder: string;
  accentBg: string;
  gradient: string;
}

const A = (
  accent: Chapter['accent']
): Pick<Chapter, 'accentText' | 'accentBorder' | 'accentBg' | 'gradient'> => {
  const map: Record<Chapter['accent'], any> = {
    coral:        { accentText: 'text-coral',     accentBorder: 'border-coral/40',     accentBg: 'bg-coral/10',     gradient: 'from-coral/20 to-sun/10' },
    sun:          { accentText: 'text-sun',       accentBorder: 'border-sun/40',       accentBg: 'bg-sun/10',       gradient: 'from-sun/20 to-coral/10' },
    mint:         { accentText: 'text-mint',      accentBorder: 'border-mint/40',      accentBg: 'bg-mint/10',      gradient: 'from-mint/20 to-sky/10' },
    sky:          { accentText: 'text-sky',       accentBorder: 'border-sky/40',       accentBg: 'bg-sky/10',       gradient: 'from-sky/20 to-grape/10' },
    'grape-soft': { accentText: 'text-grape-soft',accentBorder: 'border-grape-soft/40',accentBg: 'bg-grape/10',     gradient: 'from-grape/20 to-sky/10' },
    rose:         { accentText: 'text-rose',      accentBorder: 'border-rose/40',      accentBg: 'bg-rose/10',      gradient: 'from-rose/20 to-coral/10' }
  };
  return map[accent];
};

export const CHAPTERS: Chapter[] = [
  { path: '/chatbot-vs-agent', n: '01', title: 'Chatbot vs Agent',  tagline: 'One talks. The other acts.',                  blurb: 'A plain chatbot answers off the top of its head. An agent stops to check things first.', emoji: '🗣️', accent: 'coral',       ...A('coral') },
  { path: '/react-loop',       n: '02', title: 'The Think-Act Loop', tagline: 'Think a bit. Try a thing. See what comes back.', blurb: 'Watch the agent take one small step at a time instead of guessing the whole answer in one go.', emoji: '🔁', accent: 'sun',         ...A('sun') },
  { path: '/workflow-vs-agent',n: '03', title: 'Rails vs Drone',     tagline: 'Some helpers follow rails. Others can fly around obstacles.', blurb: 'When the path is always the same, rails are great. When it isn\'t, the drone wins.',  emoji: '🛤️', accent: 'sky',         ...A('sky') },
  { path: '/planning',         n: '04', title: 'Making a Plan',      tagline: 'One big request becomes a tiny to-do list.', blurb: 'Watch a messy request get cut into 5–7 small jobs the agent can actually do.', emoji: '🗺️', accent: 'mint',        ...A('mint') },
  { path: '/memory',           n: '05', title: 'Memory',             tagline: 'A sticky note for today, a notebook for forever.', blurb: 'Short-term memory keeps the current chat. Long-term memory remembers what you like across visits.', emoji: '🧠', accent: 'rose',        ...A('rose') },
  { path: '/rag',              n: '06', title: 'Looking it Up (RAG)', tagline: 'The agent reads the manual before it answers.', blurb: 'A pile of docs becomes a searchable library. The agent grabs the right page and only then replies.', emoji: '📚', accent: 'mint',        ...A('mint') },
  { path: '/dense-vs-sparse',  n: '07', title: 'Words vs Meaning',   tagline: 'Two ways to search: exact words or what it means.', blurb: '"rainy day plans" can be looked up two ways. Both miss something on their own.', emoji: '🔎', accent: 'sky',         ...A('sky') },
  { path: '/reranking',        n: '08', title: 'Sorting the Shortlist', tagline: 'Quick search finds 10. A careful judge picks the best 3.', blurb: 'A fast search grabs candidates. A slower, smarter judge re-sorts them.', emoji: '⚖️', accent: 'grape-soft',  ...A('grape-soft') },
  { path: '/tools-mcp',        n: '09', title: 'Giving the Agent Tools', tagline: 'A neat plug for every gadget.',           blurb: 'Without a standard, every new tool needs hand-written wiring. With MCP, it just plugs in.', emoji: '🔌', accent: 'sun',         ...A('sun') },
  { path: '/reflection',       n: '10', title: 'Checking Its Own Work', tagline: 'Draft → critic → fix.',                    blurb: 'The agent writes a first answer, then a second voice double-checks it before you see it.', emoji: '🪞', accent: 'coral',       ...A('coral') },
  { path: '/state',            n: '11', title: 'Saving Progress',    tagline: 'If the browser crashes, do we start over?',   blurb: 'Without checkpoints, every crash means redo everything. With them, the agent picks up where it stopped.', emoji: '💾', accent: 'sky',         ...A('sky') },
  { path: '/multi-agent',      n: '12', title: 'A Team of Agents',   tagline: 'A planner, a researcher, a reviewer.',        blurb: 'Two specialists usually beat one generalist. Six start tripping over each other.', emoji: '👥', accent: 'grape-soft',  ...A('grape-soft') },
  { path: '/skills-vs-agents', n: '13', title: 'Not Everything Needs an Agent', tagline: 'Use the smallest helper that does the job.', blurb: 'A scanner that turns receipts into rows doesn\'t need a thinker. A weekend planner does.', emoji: '🛠️', accent: 'mint',        ...A('mint') },
  { path: '/agent-vs-rpa',     n: '14', title: 'When the Website Changes', tagline: 'Old bots break. Agents read the new layout.', blurb: 'A button moves on the airline site. The old bot crashes. The agent shrugs and finds it.', emoji: '🤖', accent: 'rose',        ...A('rose') },
  { path: '/capstone',         n: '15', title: 'Putting it All Together', tagline: 'One trip planned end-to-end.',          blurb: 'Watch every piece we just learned show up in one continuous run.', emoji: '🎬', accent: 'sun',         ...A('sun') }
];

export function findChapterIndex(path: string): number {
  return CHAPTERS.findIndex((c) => c.path === path);
}

// Shared story across every chapter — keep it concrete and relatable.
export const STORY = {
  who: 'Sam',
  ask: 'Plan me a 3-day weekend trip to Lisbon under $500, leaving Friday night.'
};
