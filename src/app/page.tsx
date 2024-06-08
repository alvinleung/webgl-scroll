"use client";

import Plane from "@/components/WebGLScroll/Plane";
import WebGLScrollContext from "@/components/WebGLScroll/WebGLScrollContext";
import { virtualScrollItems } from "@/components/WebGLScroll/useVirtualScroll";
import { RefObject, useEffect, useRef } from "react";
import { useWindowSize } from "usehooks-ts";
import { snapshot } from "valtio";

export default function Home() {
  return (
    <main className="">
      <WebGLScrollContext>
        <div className="h-24 text-xl">hello</div>
        <Plane>test</Plane>

        <div className="flex flex-row">
          <div>fdsa</div>
          <Plane>
            <div>fds fdsafdasa</div>
          </Plane>
        </div>

        <Plane className="h-fit w-fit">
          <div className="p-24">fdsajfdksla</div>
        </Plane>
        <Plane className="h-fit w-fit">
          <div className="p-24">fdsajfdk fdsasla</div>
        </Plane>
        <div className="flex flex-row items-end justify-end">
          <Plane className="h-fit w-fit p-8">Flex box right</Plane>
        </div>
        <Plane className="h-fit w-fit">
          <div className="p-24">Item left</div>
        </Plane>
        <div className="flex flex-row items-end justify-end p-24">
          <Plane className="h-fit w-fit p-8">Flex box right</Plane>
        </div>
      </WebGLScrollContext>
    </main>
  );
}
