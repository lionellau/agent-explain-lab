import { SceneManager } from './core/SceneManager';
import { UI } from './core/UI';
import { Tweens } from './core/Tween';
import type { Module, ModuleContext, ModuleDef } from './core/ModuleTypes';

import { mod01 } from './modules/M01_ChatbotVsAgent';
import { mod02 } from './modules/M02_ReActLoop';
import { mod03 } from './modules/M03_WorkflowVsAgent';
import { mod04 } from './modules/M04_Planning';
import { mod05 } from './modules/M05_Memory';
import { mod06 } from './modules/M06_RAG';
import { mod07 } from './modules/M07_DenseSparse';
import { mod08 } from './modules/M08_Reranking';
import { mod09 } from './modules/M09_ToolsMCP';
import { mod10 } from './modules/M10_Reflection';
import { mod11 } from './modules/M11_State';
import { mod12 } from './modules/M12_MultiAgent';
import { mod13 } from './modules/M13_SkillsVsAgents';
import { mod14 } from './modules/M14_AgentVsRPA';
import { mod15 } from './modules/M15_Capstone';

const modules: ModuleDef[] = [mod01, mod02, mod03, mod04, mod05, mod06, mod07, mod08, mod09, mod10, mod11, mod12, mod13, mod14, mod15];

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const sm = new SceneManager(canvas);
const ui = new UI();
const tweens = new Tweens();
const ctx: ModuleContext = { sm, ui, tweens };

let active: Module | null = null;
let activeDef: ModuleDef | null = null;
let stepIdx = 0;
let playing = false;
let playTimer: number | null = null;

function loadModule(id: string) {
  if (active?.dispose) active.dispose();
  tweens.clear();
  sm.clearScene();
  stepIdx = 0;
  stopPlay();

  const def = modules.find((m) => m.id === id)!;
  activeDef = def;
  active = def.create();
  active.init(ctx);

  ui.renderNav(modules, def.id, loadModule);
  ui.setHeader(def.num, def.title, def.subtitle);

  ui.setControls(active.getControls?.() ?? []);
  ui.onControl = (k, v) => {
    active?.onControl?.(k, v);
    refreshPanels();
  };

  goStep(0);
  refreshPanels();
  history.replaceState(null, '', '#' + id);
}

function refreshPanels() {
  ui.setOutput(active?.getOutput?.() ?? []);
  ui.setDelta(active?.getDelta?.() ?? '');
}

function goStep(i: number) {
  if (!active) return;
  stepIdx = Math.max(0, Math.min(active.steps.length - 1, i));
  active.goStep(stepIdx);
  const s = active.steps[stepIdx];
  ui.setStep(stepIdx, active.steps.length, `<div class="step-h">${s.title}</div>${s.story}`, s.llm);
  refreshPanels();
}

function nextStep() {
  if (!active) return;
  if (stepIdx < active.steps.length - 1) goStep(stepIdx + 1);
  else stopPlay();
}
function prevStep() { goStep(stepIdx - 1); }

function play() {
  if (!active) return;
  playing = true;
  ui.btnPlay.textContent = '❚❚';
  const loop = () => {
    if (!playing) return;
    nextStep();
    if (playing && active && stepIdx < active.steps.length - 1) {
      playTimer = window.setTimeout(loop, 2400);
    } else {
      stopPlay();
    }
  };
  playTimer = window.setTimeout(loop, 1600);
}
function stopPlay() {
  playing = false;
  ui.btnPlay.textContent = '▶▶';
  if (playTimer) { clearTimeout(playTimer); playTimer = null; }
}
function togglePlay() { playing ? stopPlay() : play(); }

ui.btnNext.onclick = nextStep;
ui.btnPrev.onclick = prevStep;
ui.btnPlay.onclick = togglePlay;
ui.btnReset.onclick = () => { if (activeDef) loadModule(activeDef.id); };

window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === 'ArrowRight' || e.key === 'j') nextStep();
  else if (e.key === 'ArrowLeft' || e.key === 'k') prevStep();
  else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
  else if (e.key === 'r') { if (activeDef) loadModule(activeDef.id); }
});

sm.onUpdate = (dt, t) => { tweens.step(dt); active?.update?.(dt, t); };
sm.start();

const initialId = location.hash.replace('#', '') || modules[0].id;
loadModule(modules.find((m) => m.id === initialId) ? initialId : modules[0].id);
