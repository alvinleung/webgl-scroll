"use client";

import WebGLScrollContext from "@/components/WebGLScroll/WebGLScrollContext";
import { virtualScrollItems } from "@/components/WebGLScroll/useVirtualScroll";
import { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";

export default function Home() {
  return (
    <main className="">
      <WebGLScrollContext>
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
        <ScrollItem />
      </WebGLScrollContext>
    </main>
  );
}

const ScrollItem = () => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const { width } = useWindowSize();
  useEffect(() => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const plane = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y,
    };
    virtualScrollItems.items = [...virtualScrollItems.items, plane];

    return () => {
      // remove the associated plane from the array
      // note: this remove method has O(n) complexity when removing element
      const index = virtualScrollItems.items.findIndex(
        (planeInArr) => planeInArr === plane
      );
      virtualScrollItems.items.splice(index, 1);
    };
  }, [width]);

  return (
    <div className="h-24" ref={itemRef}>
      test
    </div>
  );
};
