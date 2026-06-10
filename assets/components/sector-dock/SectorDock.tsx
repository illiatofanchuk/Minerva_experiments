import { useCallback, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';

/* ──────────────────────────────────────────────────────────────
   SectorDock
   macOS-dock-style magnification list. Controlled component:
   the parent owns `selectedIndex` and reacts to `onSelect` to
   swap content in an adjacent block.
   ────────────────────────────────────────────────────────────── */

export interface Sector {
  /** Stable id used by the parent to switch the linked content block. */
  id: string;
  /** Visible label. */
  label: string;
}

export interface SectorDockProps {
  /** Items to render. */
  sectors: Sector[];
  /** Index of the currently selected item (controlled). `null` = none. */
  selectedIndex?: number | null;
  /** Fired on click. Parent uses this to update the linked block. */
  onSelect?: (sector: Sector, index: number) => void;
  /** Max scale of the item directly under the cursor. Default 1.22. */
  maxScale?: number;
  /** Influence radius in item-heights. Default 1.7. */
  spread?: number;
  /** Interpolation factor per frame (lower = silkier). Default 0.14. */
  ease?: number;
}

const List = styled('ul')({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const Item = styled('li', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected?: boolean }>(({ theme, selected }) => ({
  // CSS var driven by the rAF loop; pure visual transform, no layout shift.
  ['--scale' as string]: 1,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.4),
  padding: theme.spacing(0.9, 0.5),
  transformOrigin: 'left center',
  transform: 'scale(var(--scale))',
  willChange: 'transform',
  cursor: 'pointer',
  position: 'relative',
  color: selected ? theme.palette.text.primary : theme.palette.text.secondary,
  transition: 'color 0.4s ease',
  WebkitTapHighlightColor: 'transparent',

  '& .SectorDock-idx': {
    fontFamily: theme.typography.h1.fontFamily ?? 'serif',
    fontSize: '0.85rem',
    width: '2.2ch',
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
    opacity: selected ? 1 : 0.55,
    color: selected ? theme.palette.primary.main : 'inherit',
    transition: 'opacity 0.4s ease, color 0.4s ease',
  },

  '& .SectorDock-label': {
    fontSize: 'clamp(1.05rem, 2.1vw, 1.35rem)',
    fontWeight: 400,
    whiteSpace: 'nowrap',
  },

  '& .SectorDock-dot': {
    marginLeft: 'auto',
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    flexShrink: 0,
    opacity: selected ? 1 : 0,
    transform: selected ? 'scale(1) translateX(0)' : 'scale(0.4) translateX(-6px)',
    transition: 'opacity 0.4s ease, transform 0.45s cubic-bezier(0.22,1,0.36,1)',
  },

  '@media (hover: hover)': {
    '&:hover': {
      color: theme.palette.text.primary,
      '& .SectorDock-idx': { opacity: 1, color: theme.palette.primary.main },
      '& .SectorDock-dot': { opacity: 1, transform: 'scale(1) translateX(0)' },
    },
  },

  // Disable magnification where hover is unavailable (touch).
  '@media (hover: none)': {
    transform: 'scale(1) !important',
  },
}));

export default function SectorDock({
  sectors,
  selectedIndex = null,
  onSelect,
  maxScale = 1.22,
  spread = 1.7,
  ease = 0.14,
}: SectorDockProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemsRef = useRef<HTMLLIElement[]>([]);
  const stateRef = useRef<{ cur: number; target: number }[]>([]);
  const activeYRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const prefersReduced = useRef(false);

  // Keep the per-item animation state array in sync with item count.
  useEffect(() => {
    stateRef.current = sectors.map(
      (_, i) => stateRef.current[i] ?? { cur: 1, target: 1 },
    );
  }, [sectors]);

  useEffect(() => {
    prefersReduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const computeTargets = useCallback(() => {
    const activeY = activeYRef.current;
    itemsRef.current.forEach((el, i) => {
      const s = stateRef.current[i];
      if (!s || !el) return;
      if (activeY === null) {
        s.target = 1;
        return;
      }
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const dist = Math.abs(activeY - center) / rect.height;
      let scale = 1;
      if (dist < spread) {
        const t = dist / spread;
        scale = 1 + (maxScale - 1) * Math.pow(Math.cos((t * Math.PI) / 2), 2);
      }
      s.target = scale;
    });
  }, [maxScale, spread]);

  const loop = useCallback(() => {
    let moving = false;
    itemsRef.current.forEach((el, i) => {
      const s = stateRef.current[i];
      if (!s || !el) return;
      s.cur += (s.target - s.cur) * ease;
      if (Math.abs(s.target - s.cur) > 0.0005) moving = true;
      else s.cur = s.target;
      el.style.setProperty('--scale', s.cur.toFixed(4));
    });
    rafRef.current = moving ? requestAnimationFrame(loop) : null;
  }, [ease]);

  const kick = useCallback(() => {
    if (prefersReduced.current) return;
    computeTargets();
    if (rafRef.current === null) rafRef.current = requestAnimationFrame(loop);
  }, [computeTargets, loop]);

  const handleMove = useCallback(
    (e: React.MouseEvent) => {
      activeYRef.current = e.clientY;
      kick();
    },
    [kick],
  );

  const handleLeave = useCallback(() => {
    activeYRef.current = null;
    kick();
  }, [kick]);

  return (
    <List ref={listRef} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {sectors.map((sector, i) => (
        <Item
          key={sector.id}
          ref={(el) => {
            if (el) itemsRef.current[i] = el;
          }}
          selected={selectedIndex === i}
          role="button"
          tabIndex={0}
          aria-pressed={selectedIndex === i}
          onClick={() => onSelect?.(sector, i)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(sector, i);
            }
          }}
        >
          <Box component="span" className="SectorDock-idx">
            {String(i + 1).padStart(2, '0')}
          </Box>
          <Box component="span" className="SectorDock-label">
            {sector.label}
          </Box>
          <Box component="span" className="SectorDock-dot" aria-hidden />
        </Item>
      ))}
    </List>
  );
}
