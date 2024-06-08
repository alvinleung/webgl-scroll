"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { virtualScrollItems, virtualScrollState } from "./useVirtualScroll";
import { snapshot } from "valtio";

type Props = {};

const Plane = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const { width, height } = useWindowSize();
  useEffect(() => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const plane = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y - virtualScrollState.current,
    };
    const hash = `${plane.x}${plane.y}${plane.width}${plane.height}${Math.random}`;
    virtualScrollItems[hash] = plane;

    return () => {
      delete virtualScrollItems[hash];
    };
  }, [width, height]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
