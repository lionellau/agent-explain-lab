import { Routes, Route, useLocation } from 'react-router-dom';
import TopNav from './components/TopNav';
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
      <TopNav />

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
