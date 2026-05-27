import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { CHAPTERS } from './chapters';
import Home from './pages/Home';
import ChatbotVsAgent from './pages/ChatbotVsAgent';
import ReactLoop from './pages/ReactLoop';
import WorkflowVsAgent from './pages/WorkflowVsAgent';
import Planning from './pages/Planning';
import Memory from './pages/Memory';
import RAG from './pages/RAG';
import DenseVsSparse from './pages/DenseVsSparse';
import Reranking from './pages/Reranking';
import ToolsMCP from './pages/ToolsMCP';
import Reflection from './pages/Reflection';
import StateChapter from './pages/State';
import MultiAgent from './pages/MultiAgent';
import SkillsVsAgents from './pages/SkillsVsAgents';
import AgentVsRPA from './pages/AgentVsRPA';
import Capstone from './pages/Capstone';

export default function App() {
  const loc = useLocation();
  return (
    <div className="min-h-full flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur bg-ink/70 border-b border-white/5">
        <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <Link to="/" className="font-bold text-lg tracking-tight flex items-center gap-2 shrink-0">
            <span className="text-2xl">🤖</span>
            <span className="bg-gradient-to-r from-grape-soft to-sun bg-clip-text text-transparent">Agent Lab</span>
          </Link>
          <div className="flex gap-1 flex-wrap">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isActive ? 'bg-grape text-white shadow-sm' : 'text-paper/70 hover:text-paper hover:bg-white/5'
                }`
              }
            >🏠 Home</NavLink>
            {CHAPTERS.map((c) => (
              <NavLink
                key={c.path}
                to={c.path}
                className={({ isActive }) =>
                  `px-2.5 py-1.5 rounded-full text-xs transition-colors ${
                    isActive ? 'bg-grape text-white shadow-sm' : 'text-paper/60 hover:text-paper hover:bg-white/5'
                  }`
                }
                title={c.title}
              >
                <span className="mr-1">{c.emoji}</span>
                <span className="font-mono text-[10px] opacity-60 mr-1">{c.n}</span>
                <span className="hidden md:inline">{c.title}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </header>

      <main key={loc.pathname} className="flex-1 anim-float-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chatbot-vs-agent"  element={<ChatbotVsAgent />} />
          <Route path="/react-loop"        element={<ReactLoop />} />
          <Route path="/workflow-vs-agent" element={<WorkflowVsAgent />} />
          <Route path="/planning"          element={<Planning />} />
          <Route path="/memory"            element={<Memory />} />
          <Route path="/rag"               element={<RAG />} />
          <Route path="/dense-vs-sparse"   element={<DenseVsSparse />} />
          <Route path="/reranking"         element={<Reranking />} />
          <Route path="/tools-mcp"         element={<ToolsMCP />} />
          <Route path="/reflection"        element={<Reflection />} />
          <Route path="/state"             element={<StateChapter />} />
          <Route path="/multi-agent"       element={<MultiAgent />} />
          <Route path="/skills-vs-agents"  element={<SkillsVsAgents />} />
          <Route path="/agent-vs-rpa"      element={<AgentVsRPA />} />
          <Route path="/capstone"          element={<Capstone />} />
        </Routes>
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-paper/40">
        Built for curious humans. No data leaves your browser.
      </footer>
    </div>
  );
}
