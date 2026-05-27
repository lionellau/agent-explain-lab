import { Color } from 'three';

export const C = {
  bg: new Color('#07090f'),
  panel: new Color('#0f1623'),
  accent: new Color('#5cc8ff'),
  accentWarm: new Color('#ffd166'),
  good: new Color('#4ade80'),
  bad: new Color('#ef4444'),
  warn: new Color('#fbbf24'),
  agent: new Color('#c084fc'),
  agentDeep: new Color('#7c3aed'),
  tool: new Color('#38bdf8'),
  memory: new Color('#f472b6'),
  rag: new Color('#34d399'),
  user: new Color('#fbbf24'),
  chatbot: new Color('#94a3b8'),
  dim: new Color('#475569'),
  white: new Color('#ffffff')
};

export const hex = (c: Color) => '#' + c.getHexString();
