import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CHAPTERS, findChapterIndex } from '../chapters';

/**
 * Calm top nav. Shows where you are in the book, lets you jump anywhere
 * without dumping all 15 chapters as wrapped pills.
 *
 * On a chapter page:
 *   🤖 Agent Lab   ←  •••••○••••••••  →   Chapter 1 · 🗣️ Chatbot vs Agent   ☰
 * On the home page:
 *   🤖 Agent Lab                                                            ☰
 */
export default function TopNav() {
  const loc = useLocation();
  const path = loc.pathname;
  const idx = findChapterIndex(path);
  const onChapter = idx >= 0;
  const current = onChapter ? CHAPTERS[idx] : null;
  const prev = idx > 0 ? CHAPTERS[idx - 1] : null;
  const next = idx >= 0 && idx < CHAPTERS.length - 1 ? CHAPTERS[idx + 1] : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMenuOpen(false); }, [loc.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-ink/85 border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3">
        <Link to="/" className="font-bold tracking-tight flex items-center gap-2 shrink-0">
          <span className="text-2xl">🤖</span>
          <span className="bg-gradient-to-r from-grape-soft to-sun bg-clip-text text-transparent hidden sm:inline text-lg">Agent Lab</span>
        </Link>

        {/* Current chapter — always visible, but compact on mobile */}
        {onChapter && (
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-white/5 text-paper/60 shrink-0">
              {current!.n}
            </span>
            <span className={`font-semibold text-sm truncate ${current!.accentText}`}>
              <span className="mr-1">{current!.emoji}</span>
              {current!.title}
            </span>
          </div>
        )}

        {/* Progress dots — only on tablet+ */}
        {onChapter && (
          <div className="hidden md:flex items-center gap-1 mx-1">
            {prev && (
              <Link to={prev.path} title={`Prev · ${prev.title}`} className="px-2 py-1 rounded text-paper/50 hover:text-paper text-sm shrink-0">←</Link>
            )}
            <div className="flex gap-1 items-center px-1">
              {CHAPTERS.map((c, i) => (
                <Link
                  key={c.path}
                  to={c.path}
                  title={`${c.n} · ${c.title}`}
                  className={`block h-2 rounded-full transition-all ${
                    i === idx ? `w-6 bg-grape-soft` :
                    i <  idx ? 'w-2 bg-white/35 hover:bg-white/55' :
                               'w-2 bg-white/12 hover:bg-white/25'
                  }`}
                />
              ))}
            </div>
            {next && (
              <Link to={next.path} title={`Next · ${next.title}`} className="px-2 py-1 rounded text-paper/50 hover:text-paper text-sm shrink-0">→</Link>
            )}
          </div>
        )}

        <div className={`flex items-center gap-2 ${onChapter ? '' : 'ml-auto'}`}>
          {onChapter && (
            <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-paper/70 hover:text-paper text-sm transition-colors">
              <span>🏠</span>
              <span className="hidden lg:inline">Home</span>
            </Link>
          )}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Open chapter menu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-grape/20 hover:bg-grape/30 text-paper text-sm font-semibold transition-colors"
            >
              <span>☰</span>
              <span className="hidden sm:inline">Chapters</span>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-[340px] max-h-[70vh] overflow-y-auto bg-ink-soft border border-white/15 rounded-xl shadow-2xl p-2 anim-float-in">
                <Link
                  to="/"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                    !onChapter ? 'bg-grape/20 text-paper' : 'hover:bg-white/5 text-paper/80'
                  }`}
                >
                  <span className="text-xl">🏠</span>
                  <span className="font-semibold">Home</span>
                </Link>
                <div className="my-1 border-t border-white/5" />
                {CHAPTERS.map((c, i) => (
                  <Link
                    key={c.path}
                    to={c.path}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                      i === idx ? 'bg-grape/20 text-paper' : 'hover:bg-white/5 text-paper/80'
                    }`}
                  >
                    <span className="font-mono text-[11px] text-paper/40 w-6">{c.n}</span>
                    <span className="text-xl shrink-0">{c.emoji}</span>
                    <div className="min-w-0">
                      <div className={`font-semibold truncate ${i === idx ? c.accentText : ''}`}>{c.title}</div>
                      <div className="text-[11px] text-paper/50 truncate">{c.tagline}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
