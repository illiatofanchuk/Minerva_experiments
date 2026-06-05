"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

export interface CardStackItem {
  /** Unique, stable identifier for the card */
  id: string | number;
  /** Venue title */
  title: string;
  /** Category tags (rendered as pills) */
  tags: string[];
  /** Preview image URL. If omitted, a grey placeholder is shown */
  imageSrc?: string;
}

export interface CardStackProps {
  /** Array of cards to display in the stack */
  items: CardStackItem[];
  /** Auto-advance interval in ms. Defaults to 3500 */
  intervalMs?: number;
  /** How many cards are visible in the stack at once. Defaults to 3 */
  visibleCount?: number;
  /** Vertical offset of each card behind the front one, in px. Defaults to 11 */
  offset?: number;
  /** Scale-down step for cards behind the front one. Defaults to 0.05 */
  scaleStep?: number;
  /** Brightness dimming step for cards behind the front one. Defaults to 0.06 */
  dimStep?: number;
  /** Pause auto-advance while the cursor hovers the stack. Defaults to true */
  pauseOnHover?: boolean;
  /** Extra class names for the outer container */
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  Design constants (Frame 289 from the Figma design)                        */
/* -------------------------------------------------------------------------- */

const CARD_WIDTH = 311;
const CARD_HEIGHT = 82.61;

/**
 * Spring transition parameters.
 * Ported 1:1 from the original React component (stiffness 170 / damping 26).
 */
const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 170,
  damping: 26,
};

/**
 * Exit animation for the disappearing card.
 * Ported 1:1 from the original component:
 * opacity -> 0, scale -> 0.8, duration 0.2s.
 */
const EXIT_TRANSITION = {
  opacity: 0,
  scale: 0.8,
  transition: { duration: 0.2 },
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * CardStack — an auto-rotating stack of cards.
 *
 * Every `intervalMs` the front card disappears (fade out + scale down to 0.8),
 * the rest of the stack springs forward, and the disappeared card moves to the
 * back of the queue. There is no manual navigation — rotation is fully automatic.
 */
export default function CardStack({
  items,
  intervalMs = 3500,
  visibleCount = 3,
  offset = 11,
  scaleStep = 0.05,
  dimStep = 0.06,
  pauseOnHover = true,
  className = "",
}: CardStackProps) {
  // order[0] is the front card. We keep the order rather than the array itself
  // so React preserves element identity via key={id}.
  const [order, setOrder] = React.useState<number[]>(() =>
    items.map((_, i) => i),
  );
  const [paused, setPaused] = React.useState(false);

  // Reset the order if the set of cards changes.
  React.useEffect(() => {
    setOrder(items.map((_, i) => i));
  }, [items]);

  // Move the front card to the back of the queue.
  const advance = React.useCallback(() => {
    setOrder((prev) => [...prev.slice(1), prev[0]]);
  }, []);

  // Auto-advance timer.
  React.useEffect(() => {
    if (paused || items.length <= 1) return;
    const timer = window.setInterval(advance, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, advance, intervalMs, items.length]);

  if (items.length === 0) return null;

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: CARD_WIDTH,
        // headroom above for the "raised" stack
        height: CARD_HEIGHT + visibleCount * offset + 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        style={{
          position: "relative",
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
        }}
      >
        <AnimatePresence>
          {order.map((itemIndex, depth) => {
            // Cards deeper than visibleCount are tucked under the last visible one.
            const clampedDepth = Math.min(depth, visibleCount - 1);
            const isHiddenBehind = depth >= visibleCount;
            const isFront = depth === 0;
            const item = items[itemIndex];

            return (
              <motion.div
                key={item.id}
                initial={false}
                animate={{
                  y: -clampedDepth * offset,
                  scale: 1 - clampedDepth * scaleStep,
                  filter: `brightness(${1 - clampedDepth * dimStep})`,
                  opacity: isHiddenBehind ? 0 : 1,
                  zIndex: items.length - depth,
                }}
                exit={EXIT_TRANSITION}
                transition={SPRING_TRANSITION}
                style={cardBaseStyle}
              >
                <CardContent item={item} dimmed={!isFront} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inner card content                                                        */
/* -------------------------------------------------------------------------- */

function CardContent({
  item,
  dimmed,
}: {
  item: CardStackItem;
  dimmed: boolean;
}) {
  return (
    <div style={cardInnerStyle}>
      {/* Image or grey placeholder */}
      {item.imageSrc ? (
        <img
          src={item.imageSrc}
          alt={item.title}
          style={thumbStyle}
          draggable={false}
        />
      ) : (
        <div style={thumbStyle} aria-hidden />
      )}

      <div style={infoStyle}>
        <div style={titleStyle}>{item.title}</div>
        <div style={tagsRowStyle}>
          {item.tags.map((tag) => (
            <span key={tag} style={tagStyle}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Inline styles (Frame 289)                                                 */
/* -------------------------------------------------------------------------- */
/*  Styles are kept inline so the component is self-contained and does not     */
/*  depend on global CSS or a specific Tailwind setup. If preferred, a         */
/*  developer can move these into Tailwind classes.                           */

const cardBaseStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  padding: "10.3379px 0",
  gap: "8.61px",
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  background: "#FAFAFA",
  border: "0.861496px solid #FEFEFE",
  borderRadius: "10.3379px",
  boxShadow:
    "0px -8px 12.3px -10px rgba(0,0,0,0.06), " +
    "0px -1.72299px 3.44598px rgba(255,255,255,0.15), " +
    "0px 1.72299px 3.44598px rgba(0,34,46,0.03)",
  backdropFilter: "blur(7.71px)",
  WebkitBackdropFilter: "blur(7.71px)",
  willChange: "transform, opacity, filter",
};

const cardInnerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0 14px",
  width: "100%",
  pointerEvents: "none",
};

const thumbStyle: React.CSSProperties = {
  flex: "none",
  width: "52px",
  height: "52px",
  borderRadius: "9px",
  background: "#D4D4D4",
  objectFit: "cover",
};

const infoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  minWidth: 0,
};

const titleStyle: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 600,
  color: "#1a2a33",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const tagsRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
};

const tagStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "999px",
  padding: "4px 10px",
  fontSize: "11px",
  fontWeight: 500,
  color: "#3a4b58",
  whiteSpace: "nowrap",
};
