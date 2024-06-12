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
import { AnimatedValue } from "./AnimatedValue/AnimatedValue";
import { useAnimatedValue } from "./AnimatedValue/useAnimatedValue";

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
  scroll: AnimatedValue.empty,
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
  const virtualScrollValue = useAnimatedValue();

  const { height: pageHeight } = useResizeObserver({ ref: contentRef });
  const { height: windowHeight } = useWindowSize({
    initializeWithValue: false,
  });

  const maxScroll = useMemo(
    () => Math.max(0, (pageHeight || 0) - (windowHeight || 0)),
    [pageHeight, windowHeight]
  );

  // handle wheel input
  useEffect(() => {
    const MAX_DELTA = 100;
    const handleWheel = (e: WheelEvent) => {
      const delta = -clamp(e.deltaY, -MAX_DELTA, MAX_DELTA);
      const newPos = virtualScrollValue.getTarget() + delta * 2;
      const clampedPos = clamp(newPos, -maxScroll, 0);
      virtualScrollValue.lerpTo(clampedPos, 0.24);
    };
    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [maxScroll, virtualScrollValue]);

  // handle touch input
  useEffect(() => {
    if (!pageHeight || !windowHeight) return;

    let initialTouchPos = 0;
    let initialScrollOffset = 0;
    const EXIT_VELOCITY_DAMPING = 0.14;

    const handleTouchStart = (e: TouchEvent) => {
      initialTouchPos = e.touches[0].clientY;
      initialScrollOffset = virtualScrollValue.getCurrent();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const flickVelocity = virtualScrollValue.getVelocity();
      virtualScrollValue.launch(flickVelocity, EXIT_VELOCITY_DAMPING, {
        min: -(pageHeight - windowHeight),
        max: 0,
      });
    };
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const currTouchPos = e.touches[0].clientY;
      const touchOffset = initialTouchPos - currTouchPos;
      const newPos = initialScrollOffset - touchOffset;
      const clampedNewPos = clamp(newPos, -maxScroll, 0);

      virtualScrollValue.lerpTo(clampedNewPos, 1);
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [maxScroll, virtualScrollValue, pageHeight, windowHeight]);

  return (
    <VirtualScrollContext.Provider
      value={{
        items: virtualScrollItems,
        scroll: virtualScrollValue,
      }}
    >
      {children}
    </VirtualScrollContext.Provider>
  );
};
