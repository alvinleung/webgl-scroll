import {
  RefObject,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { clamp } from "./utils/clamp";
import { proxy } from "valtio";
import { useResizeObserver, useWindowSize } from "usehooks-ts";

export interface Plane {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ScrollState {
  current: number;
  target: number;
}
export interface ScrollItems {
  [key: string]: Plane;
}

const VirtualScrollContext = createContext({
  items: {} as ScrollItems,
  scroll: { current: 0, target: 0 } as ScrollState,
});

export const useVirtualScroll = () => useContext(VirtualScrollContext);

interface Props {
  contentRef: RefObject<HTMLElement>;
}

export const VirtualScrollProvider = ({
  contentRef,
  children,
}: React.PropsWithChildren<Props>) => {
  const virtualScrollItems = useRef(proxy<ScrollItems>({})).current;
  const virtualScrollState = useRef(
    proxy<ScrollState>({
      current: 0,
      target: 0,
    })
  ).current;

  const { height: pageHeight } = useResizeObserver({ ref: contentRef });
  const { height: windowHeight } = useWindowSize({
    initializeWithValue: false,
  });

  const maxScroll = useMemo(
    () => Math.max(0, (pageHeight || 0) - (windowHeight || 0)),
    [pageHeight, windowHeight]
  );

  // interpolate virtual scroll state
  useEffect(() => {
    let scrollAnimFrame = 0;
    function updateVirtualScrollState() {
      const lerp = 0.2;
      const newOffset =
        virtualScrollState.current +
        (virtualScrollState.target - virtualScrollState.current) * lerp;

      virtualScrollState.current = newOffset;

      scrollAnimFrame = requestAnimationFrame(updateVirtualScrollState);
    }
    scrollAnimFrame = requestAnimationFrame(updateVirtualScrollState);
    return () => {
      cancelAnimationFrame(scrollAnimFrame);
    };
  }, [contentRef, pageHeight, virtualScrollState, windowHeight]);

  // handle wheel input
  useEffect(() => {
    const MAX_DELTA = 30;
    const handleWheel = (e: WheelEvent) => {
      const delta = -clamp(e.deltaY, -MAX_DELTA, MAX_DELTA);
      const newPos = virtualScrollState.target + delta;
      virtualScrollState.target = clamp(newPos, -maxScroll, 0);
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [maxScroll, virtualScrollState]);

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
      const newPos = virtualScrollState.target + touchDelta;
      virtualScrollState.target = clamp(newPos, -maxScroll, 0);

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
  }, [maxScroll, virtualScrollState]);

  return (
    <VirtualScrollContext.Provider
      value={{
        items: virtualScrollItems,
        scroll: virtualScrollState,
      }}
    >
      {children}
    </VirtualScrollContext.Provider>
  );
};
