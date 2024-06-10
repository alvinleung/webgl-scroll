"use client";

import Plane from "@/components/WebGLScroll/Plane";
import WebGLScrollContainer from "@/components/WebGLScroll/WebGLScrollContainer";

export default function Home() {
  return (
    <main className="">
      <WebGLScrollContainer>
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
      </WebGLScrollContainer>
    </main>
  );
}
