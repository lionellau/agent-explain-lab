import type { ReactNode } from 'react';

/**
 * Hand-built 2D workflow primitives. Use these whenever the lesson is
 * "look at this comparison/sequence/graph" — i.e. almost every chapter
 * except RAG (which is genuinely about a 3D meaning-space).
 *
 * Step-driven reveal: components take a `step` prop and a `revealAt`
 * threshold so the diagram completes itself as the user advances beats.
 */

type Tone = 'user' | 'chatbot' | 'agent' | 'tool' | 'rag' | 'memory' | 'good' | 'bad' | 'warn' | 'neutral';

const TONE: Record<Tone, { bg: string; border: string; text: string; ring: string }> = {
  user:     { bg: 'bg-sun/15',    border: 'border-sun/40',         text: 'text-sun',         ring: 'ring-sun/50' },
  chatbot:  { bg: 'bg-white/8',   border: 'border-white/25',       text: 'text-paper/80',    ring: 'ring-white/30' },
  agent:    { bg: 'bg-grape/15',  border: 'border-grape-soft/50',  text: 'text-grape-soft',  ring: 'ring-grape-soft/60' },
  tool:     { bg: 'bg-sky/15',    border: 'border-sky/45',         text: 'text-sky',         ring: 'ring-sky/55' },
  rag:      { bg: 'bg-mint/15',   border: 'border-mint/45',        text: 'text-mint',        ring: 'ring-mint/55' },
  memory:   { bg: 'bg-rose/15',   border: 'border-rose/45',        text: 'text-rose',        ring: 'ring-rose/55' },
  good:     { bg: 'bg-mint/15',   border: 'border-mint/50',        text: 'text-mint',        ring: 'ring-mint/55' },
  bad:      { bg: 'bg-coral/15',  border: 'border-coral/50',       text: 'text-coral',       ring: 'ring-coral/55' },
  warn:     { bg: 'bg-sun/15',    border: 'border-sun/45',         text: 'text-sun',         ring: 'ring-sun/55' },
  neutral:  { bg: 'bg-white/5',   border: 'border-white/15',       text: 'text-paper/70',    ring: 'ring-white/20' }
};

interface FlowNodeProps {
  tone?: Tone;
  emoji?: string;
  title: string;
  sub?: ReactNode;
  active?: boolean;
  dim?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

/** A clean labelled box. The primary building block for 2D diagrams. */
export function FlowNode({ tone = 'neutral', emoji, title, sub, active = true, dim = false, size = 'md', className = '', style }: FlowNodeProps) {
  const t = TONE[tone];
  const pad = size === 'sm' ? 'px-3 py-2' : size === 'lg' ? 'px-5 py-4' : 'px-4 py-3';
  return (
    <div
      className={`relative rounded-xl border ${t.bg} ${t.border} ${pad} transition-all duration-500 ${
        dim ? 'opacity-30' : 'opacity-100'
      } ${active && !dim ? `ring-2 ${t.ring} ring-offset-2 ring-offset-ink-soft anim-float-in` : ''} ${className}`}
      style={style}
    >
      <div className="flex items-center gap-2">
        {emoji && <span className="text-xl shrink-0">{emoji}</span>}
        <div className="min-w-0">
          <div className={`font-semibold ${t.text} ${size === 'sm' ? 'text-xs' : 'text-sm'} leading-tight`}>{title}</div>
          {sub && <div className={`text-paper/65 ${size === 'sm' ? 'text-[11px]' : 'text-xs'} leading-snug mt-0.5`}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

interface ArrowProps {
  /** Pixel coordinates inside the SVG viewBox */
  from: { x: number; y: number };
  to: { x: number; y: number };
  color?: string;
  active?: boolean;
  label?: string;
  curve?: number; // how much arc to give the line (0 = straight)
  thickness?: number;
  dashed?: boolean;
}

/**
 * SVG arrow with a midpoint bezier so it doesn't go through node boxes.
 * Built to be placed inside a parent SVG that you size to your diagram.
 */
export function FlowArrow({ from, to, color = '#a78bfa', active = true, label, curve = 0.18, thickness = 2, dashed = false }: ArrowProps) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy);
  // perpendicular offset for the control point
  const cx = (from.x + to.x) / 2 - dy * curve;
  const cy = (from.y + to.y) / 2 + dx * curve;
  const path = `M ${from.x},${from.y} Q ${cx},${cy} ${to.x},${to.y}`;
  const opacity = active ? 0.95 : 0.25;
  const arrowId = `arrowhead-${color.replace('#', '')}`;

  return (
    <g style={{ transition: 'opacity 400ms', opacity }}>
      <defs>
        <marker id={arrowId} markerWidth="10" markerHeight="10" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill={color} />
        </marker>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={thickness}
        strokeDasharray={dashed ? '6 5' : undefined}
        markerEnd={`url(#${arrowId})`}
      />
      {label && (
        <text x={cx} y={cy - 4} fontSize="10" fill={color} textAnchor="middle" fontFamily="ui-monospace, Menlo, monospace">
          {label}
        </text>
      )}
    </g>
  );
}

/** Wrap children in a positioned SVG sized to match the parent. Use absolute positioning of nodes via style={{ left, top }}. */
export function FlowSurface({ height, children }: { height: number; children: ReactNode }) {
  return (
    <div className="relative w-full" style={{ height }}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 1000 ${height}`} preserveAspectRatio="none">
        {/* the SVG is the arrow layer; nodes live on top as absolute-positioned divs */}
        {children}
      </svg>
    </div>
  );
}

/**
 * Pair: <FlowDiagram> places a viewBox-sized SVG arrow layer plus an
 * absolutely-positioned HTML node layer in the same grid cell. You pass
 * children as arrays.
 */
interface DiagramProps {
  height?: number;
  /** SVG-coordinate width (matches viewBox). Defaults 1000. */
  width?: number;
  arrows: ReactNode;
  nodes: ReactNode;
  className?: string;
}

export function FlowDiagram({ height = 320, width = 720, arrows, nodes, className = '' }: DiagramProps) {
  // The diagram has a fixed design width so node text never overlaps.
  // On screens narrower than that, the parent scrolls horizontally so
  // mobile users pan instead of seeing crammed/overlapping labels.
  return (
    <div className="-mx-3 md:-mx-4 lg:mx-0 overflow-x-auto overflow-y-hidden pb-2">
      <div
        className={`relative ${className}`}
        style={{ height, width, minWidth: width, marginLeft: 12, marginRight: 12 }}
      >
        <svg
          className="absolute inset-0"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          {arrows}
        </svg>
        <div className="absolute inset-0">{nodes}</div>
      </div>
    </div>
  );
}

/** A horizontal swim-lane: label on the left, flow on the right. */
export function FlowLane({ label, tone = 'neutral', children }: { label: ReactNode; tone?: Tone; children: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={`rounded-2xl border ${t.bg} ${t.border} p-3 md:p-4`}>
      <div className={`text-[10px] uppercase tracking-widest font-bold ${t.text} mb-3 px-1`}>{label}</div>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  );
}

export const FLOW_COLORS = {
  user:    '#fbbf24',
  agent:   '#a78bfa',
  chatbot: '#94a3b8',
  tool:    '#38bdf8',
  rag:     '#34d399',
  memory:  '#f472b6',
  good:    '#4ade80',
  bad:     '#fb7185',
  warn:    '#fbbf24'
};
