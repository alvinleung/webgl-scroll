"use client";

import React, { RefObject, useEffect, useMemo, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { ref, snapshot } from "valtio";
import { useVirtualScroll } from "./WebGLScroll/VirtualScroll";

//@ts-ignore
import DEFAULT_FRAG from "./WebGLScroll/shaders/Default.frag";
//@ts-ignore
import DEFAULT_VERT from "./WebGLScroll/shaders/Default.vert";
import { useShaderProgram } from "./WebGLScroll/shaders/useShaderProgram";

type Props = {
  children: React.ReactNode;
  vertexShader?: string;
  fragmentShader?: string;
};

const Plane = ({
  children,
  vertexShader,
  fragmentShader,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Props) => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const { width, height } = useWindowSize();
  const { scroll, items } = useVirtualScroll();

  const shaderProgram = useShaderProgram(
    vertexShader || DEFAULT_VERT,
    fragmentShader || DEFAULT_FRAG
  );

  useEffect(() => {
    const bounds = itemRef.current?.getBoundingClientRect();
    if (!bounds || !shaderProgram) return;

    const plane = {
      width: bounds.width,
      height: bounds.height,
      x: bounds.x,
      y: bounds.y - scroll.getCurrent(),
      // need to use "ref" so valtio not tracking the state mutation here
      shaderProgram: ref(shaderProgram),
    };
    const hash = `${plane.x}${plane.y}${plane.width}${plane.height}${Math.random}`;
    items[hash] = plane;

    return () => {
      delete items[hash];
    };
  }, [width, height, scroll, items, shaderProgram]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
