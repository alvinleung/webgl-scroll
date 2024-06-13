"use client";

import React, { RefObject, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { ref, snapshot } from "valtio";
import { useVirtualScroll } from "./WebGLScroll/VirtualScroll";

//@ts-ignore
import DEFAULT_FRAG from "./WebGLScroll/shaders/Default.frag";
//@ts-ignore
import DEFAULT_VERT from "./WebGLScroll/shaders/Default.vert";
import PlaneInfo, {
  PlaneAttributes,
  PlaneUniforms,
} from "./WebGLScroll/PlaneInfo";
import { useShaderProgram } from "./WebGLScroll/rendering/shader/useShaderProgram";

type Props = {
  children: React.ReactNode;
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: PlaneUniforms;
  attributes?: PlaneAttributes;
};

const Plane = ({
  children,
  vertexShader,
  fragmentShader,
  uniforms,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Props) => {
  const itemRef = useRef() as RefObject<HTMLDivElement>;
  const { width, height } = useWindowSize();
  const { scroll, items } = useVirtualScroll();

  // PlaneInfo is a valtio state, idk this doesn't feel clean
  const planeInfoRef = useRef<PlaneInfo | undefined>();
  // set the uniform info with the suggested one
  if (planeInfoRef.current && uniforms) {
    planeInfoRef.current.uniforms = uniforms;
  }

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
      uniforms: ref(uniforms || {}),
    };
    const hash = `${plane.x}${plane.y}${plane.width}${plane.height}${Math.random}`;
    items[hash] = plane;

    planeInfoRef.current = plane;

    return () => {
      delete items[hash];
    };

    // Disabled exhaustive deps because we don't want to
    // create planes everytime 'uniforms' is updated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, scroll, items, shaderProgram]);

  return (
    <div ref={itemRef} {...props}>
      {children}
    </div>
  );
};

export default Plane;
