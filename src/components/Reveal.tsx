import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useInView } from "@/hooks/useInView";

type Direction = "left" | "right" | "top" | "bottom";

const OFFSETS: Record<Direction, string> = {
  left: "translateX(-46vw) rotate(-7deg)",
  right: "translateX(46vw) rotate(7deg)",
  top: "translateY(-32vh) rotate(-5deg)",
  bottom: "translateY(32vh) rotate(5deg)",
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Flies children in from off-screen and settles them into place, replaying every
 * time the element scrolls into view. Pair a "left" reveal with a "right" reveal
 * in the same row (e.g. an image and its caption) so they visibly cross paths
 * as they both animate toward center.
 *
 * Uses a static outer wrapper for IntersectionObserver targeting and an animated
 * inner wrapper for the transform — observing the animated element directly would
 * deadlock, since a large translateX/Y moves its measured bounding box off-screen,
 * so the observer would never report it as "in view" to trigger the reveal.
 */
export function Reveal({
  children, from = "bottom", delay = 0, className, as: As = "div",
}: {
  children: ReactNode;
  from?: Direction;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const [reduced, setReduced] = useState(false);
  useEffect(() => setReduced(prefersReducedMotion()), []);

  const innerStyle: CSSProperties = reduced
    ? {}
    : {
        opacity: inView ? 1 : 0,
        transform: inView ? "translate(0,0) rotate(0deg)" : OFFSETS[from],
        transition: `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 850ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: "transform, opacity",
      };

  const Tag = As as any;
  return (
    <Tag ref={ref} className={className}>
      <div style={innerStyle}>{children}</div>
    </Tag>
  );
}
