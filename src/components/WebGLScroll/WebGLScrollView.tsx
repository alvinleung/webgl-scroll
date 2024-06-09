"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { VirtualScrollProvider, useVirtualScroll } from "./VirtualScroll";
import { createWebGLScroll } from "./WebGLScrollFunctional";

const WebGLScrollView = ({ children }: React.PropsWithChildren) => {
  const contentRef = useRef() as RefObject<HTMLDivElement>;
  return (
    <VirtualScrollProvider contentRef={contentRef}>
      <WebGLScrollCanvas contentRef={contentRef} />
      <div className="fixed w-screen h-svh inset-0 touch-none">
        <div ref={contentRef}>{children}</div>
      </div>
    </VirtualScrollProvider>
  );
};

const WebGLScrollCanvas = ({
  contentRef,
}: {
  contentRef: RefObject<HTMLDivElement>;
}) => {
  const canvasRef = useRef() as RefObject<HTMLCanvasElement>;
  const { width, height } = useWindowSize({ initializeWithValue: false });
  const { items, scroll } = useVirtualScroll();

  useEffect(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;

    const cleanup = createWebGLScroll({
      canvas,
      content,
      scroll,
      items,
    });
    return () => {
      cleanup();
    };
  }, [canvasRef, contentRef, scroll, items]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="fixed w-screen h-svh inset-0"
    />
  );
};

export default WebGLScrollView;
