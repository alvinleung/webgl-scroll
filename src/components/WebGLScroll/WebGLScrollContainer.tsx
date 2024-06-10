"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { VirtualScrollProvider, useVirtualScroll } from "./VirtualScroll";
import { WebGLScroll } from "./WebGLScroll";

const WebGLScrollContainer = ({ children }: React.PropsWithChildren) => {
  const scrollContentRef = useRef() as RefObject<HTMLDivElement>;
  return (
    <VirtualScrollProvider contentRef={scrollContentRef}>
      <WebGLScrollCanvas contentRef={scrollContentRef} />
      <div className="fixed w-screen h-svh inset-0 touch-none">
        <div ref={scrollContentRef}>{children}</div>
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

    const webGLScroll = new WebGLScroll({ canvas, content, items, scroll });

    return () => {
      webGLScroll.cleanup();
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

export default WebGLScrollContainer;
