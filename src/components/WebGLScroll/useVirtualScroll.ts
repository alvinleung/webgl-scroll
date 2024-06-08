import { RefObject, useEffect } from "react";
import { clamp } from "./utils/clamp";
import { proxy } from "valtio";

export const virtualScrollState = proxy({
  current: 0,
  target: 0,
});

export function useVirtualScroll(contentRef: RefObject<HTMLElement>) {
  // interpolate virtual scroll state
  useEffect(() => {
    let scrollAnimFrame = 0;
    function updateVirtualScrollState() {
      const lerp = 0.2;
      virtualScrollState.current +=
        (virtualScrollState.target - virtualScrollState.current) * lerp;

      if (contentRef.current)
        contentRef.current.style.transform = `translateY(${virtualScrollState.current}px)`;

      scrollAnimFrame = requestAnimationFrame(updateVirtualScrollState);
    }
    scrollAnimFrame = requestAnimationFrame(updateVirtualScrollState);
    return () => {
      cancelAnimationFrame(scrollAnimFrame);
    };
  }, [contentRef]);

  // handle wheel input
  useEffect(() => {
    const MAX_DELTA = 30;
    const handleWheel = (e: WheelEvent) => {
      const delta = -clamp(e.deltaY, -MAX_DELTA, MAX_DELTA);
      virtualScrollState.target += delta;
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    let prevTouchPos = 0;
    let touchDelta = 0;
    function handleTouchStart(e: TouchEvent) {
      prevTouchPos = e.touches[0].clientY;
      touchDelta = 0;
    }
    function handleTouchEnd(e: TouchEvent) {}
    function handleTouchMove(e: TouchEvent) {
      // stop user from pulling refresh
      e.preventDefault();
      const currTouchPos = e.touches[0].clientY;
      touchDelta = currTouchPos - prevTouchPos;
      virtualScrollState.target += touchDelta;
      prevTouchPos = currTouchPos;
    }

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  // handle touch input
  useEffect(() => {});
}
