"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { virtualScrollItems } from "./useVirtualScroll";
import { snapshot } from "valtio";

type Props = {};

const Plane = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
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
    const hash = `${plane.x}${plane.y}${plane.width}${plane.height}${Math.random}`;
    virtualScrollItems[hash] = plane;

    return () => {
      delete virtualScrollItems[hash];
    };
  }, [width]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
