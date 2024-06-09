"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { snapshot } from "valtio";
import { useVirtualScroll } from "./VirtualScroll";

type Props = {};

const Plane = ({
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const { width, height } = useWindowSize();
  const { scroll, items } = useVirtualScroll();

  useEffect(() => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const plane = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y - scroll.current,
    };
    const hash = `${plane.x}${plane.y}${plane.width}${plane.height}${Math.random}`;
    items[hash] = plane;

    return () => {
      delete items[hash];
    };
  }, [width, height, scroll, items]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
