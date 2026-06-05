import { useEffect, useRef, useState, useCallback } from "react";
import styles from "./ScrollStepper.module.css";

/**
 * MINERVA — sticky scroll stepper.
 *
 * A pinned section that converts vertical scroll into discrete "steps".
 * The active step is shown as a capsule whose fill tracks scroll progress;
 * passed steps become dark dots, upcoming steps are light dots.
 *
 * Behaviour:
 *  - While the section is pinned, wheel/touch scroll fills the active step
 *    instead of moving the page.
 *  - When the LAST step fills, scroll is released and the page continues down.
 *  - Scrolling back up unwinds the steps; at the first step (0% fill) scroll
 *    is released upward. No looping.
 *
 * Mechanic: rather than hijacking the wheel with preventDefault + scrollTo
 * (fragile with trackpad inertia), this maps the *native* scroll position of
 * a tall wrapper onto step progress. The wrapper is `height: (N+1) * 100vh`;
 * its inner is `position: sticky`. As the user scrolls through the wrapper's
 * extra height, we read how far we are and derive (step, fill). This is the
 * robust, accessible approach — no scroll-jacking, keyboard and momentum work
 * normally. See README for the trade-offs vs. the hard-hijack version.
 */

export interface ScrollStepperProps {
  /** number of steps (default 3) */
  steps?: number;
  /** content rendered inside the pinned panel, per step index (0-based) */
  renderPanel?: (activeStep: number, fill: number) => React.ReactNode;
  className?: string;
}

export default function ScrollStepper({
  steps = 3,
  renderPanel,
  className,
}: ScrollStepperProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [fill, setFill] = useState(0); // 0..1 within the active step

  const recompute = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    // total scrollable distance while the inner is pinned
    const scrollable = wrap.offsetHeight - vh; // == steps * vh
    // how far we've scrolled into the wrapper (0 .. scrollable)
    const scrolled = Math.min(Math.max(-rect.top, 0), scrollable);

    const progress = scrollable > 0 ? scrolled / scrollable : 0; // 0..1 overall
    const exact = progress * steps;            // 0..steps
    let i = Math.floor(exact);
    if (i >= steps) i = steps - 1;             // clamp last step
    const f = Math.min(exact - i, 1);

    setIndex(i);
    setFill(i === steps - 1 ? Math.max(f, progress >= 1 ? 1 : f) : f);
  }, [steps]);

  useEffect(() => {
    recompute();
    const onScroll = () => recompute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [recompute]);

  return (
    // Wrapper is (steps + 1) * 100vh tall: one viewport for the panel itself,
    // plus one viewport of scroll distance per step.
    <div
      ref={wrapRef}
      className={[styles.wrap, className].filter(Boolean).join(" ")}
      style={{ height: `${(steps + 1) * 100}vh` }}
    >
      <div className={styles.sticky}>
        <div className={styles.panel}>
          {renderPanel?.(index, fill)}

          {/* the indicator */}
          <div className={styles.indicator} role="tablist" aria-label="Section progress">
            {Array.from({ length: steps }).map((_, i) => {
              const isActive = i === index;
              const isDone = i < index;
              return (
                <span
                  key={i}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Step ${i + 1} of ${steps}`}
                  className={[
                    styles.seg,
                    isActive ? styles.active : "",
                    isDone ? styles.done : "",
                  ].filter(Boolean).join(" ")}
                >
                  {isActive && (
                    <span className={styles.fill} style={{ width: `${fill * 100}%` }} />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
