"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useEventListener, useWindowSize } from "usehooks-ts";
import { createWebGLScroll } from "./WebGLScroll";
import { proxy } from "valtio";
import { clamp } from "./utils/clamp";
import { useVirtualScroll } from "./useVirtualScroll";

type Props = {
  children?: React.ReactNode;
};

const WebGLScrollContext = ({ children }: Props) => {
  const canvasRef = useRef() as RefObject<HTMLCanvasElement>;
  const contentRef = useRef() as RefObject<HTMLDivElement>;
  const { width, height } = useWindowSize({ initializeWithValue: false });

  useVirtualScroll(contentRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cleanup = createWebGLScroll(canvas);
    return () => {
      cleanup();
    };
  }, [canvasRef]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="fixed w-screen h-svh inset-0"
      />
      <div className="fixed w-screen h-svh inset-0 touch-none">
        <div ref={contentRef}>{children}</div>
      </div>
    </>
  );
};

export default WebGLScrollContext;
