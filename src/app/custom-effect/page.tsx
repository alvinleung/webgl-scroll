"use client";

import Plane from "@/components/WebGLScroll/Plane";
import WebGLScrollContainer from "@/components/WebGLScroll/WebGLScrollContainer";

//@ts-ignore
import FRAG from "@/components/WebGLScroll/WebGLScroll/shaders/EffectGL.frag";
//@ts-ignore
import VERT from "@/components/WebGLScroll/WebGLScroll/shaders/EffectGL.vert";
import { useTexture } from "@/components/WebGLScroll/WebGLScroll/rendering/texture/useTexture";

export default function Home() {
  const texture1 = useTexture("./opengraph-sp.png");
  const texture2 = useTexture("./screen-4.png");

  return (
    <WebGLScrollContainer>
      <main className="py-24 w-full flex flex-col">
        <Plane
          vertexShader={VERT}
          fragmentShader={FRAG}
          uniforms={{
            u_texture: texture1,
          }}
          className="m-24 h-[60svh] flex flex-row items-center justify-end p-24"
        >
          Full screen
        </Plane>
        <div className="flex gap-2 w-full px-24">
          <Plane
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={{
              u_texture: texture2,
            }}
            className="mr-auto  w-1/4  h-[30svh] p-4"
          >
            Full screen
          </Plane>
          <Plane
            vertexShader={VERT}
            fragmentShader={FRAG}
            uniforms={{
              u_texture: texture2,
            }}
            className="flex flex-row w-1/2 h-[80svh] p-4"
          >
            Full screen
          </Plane>
        </div>
        <Plane className="m-24 flex flex-row items-center h-[60svh] justify-end p-24">
          Full screen
        </Plane>
      </main>
    </WebGLScrollContainer>
  );
}
