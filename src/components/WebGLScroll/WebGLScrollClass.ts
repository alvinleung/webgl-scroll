import * as twgl from "twgl.js";

//@ts-ignore
import EFFECT_FRAG from "./shaders/EffectGL.frag";
//@ts-ignore
import EFFECT_VERT from "./shaders/EffectGL.vert";

import { Plane, ScrollItems, ScrollState } from "./VirtualScroll";
import {
  FrameInfo,
  WebGLRenderer,
  WebGLRendererDelegate,
} from "./utils/WebGLRenderer";
import { CleanupProtocol } from "./utils/CleanupProtocol";
import { PlanesUpdater } from "./PlanesUpdater";

interface WebGLScrollConfig {
  canvas: HTMLCanvasElement;
  content: HTMLDivElement;
  items: ScrollItems;
  scroll: ScrollState;
}

export class WebGLScroll implements WebGLRendererDelegate, CleanupProtocol {
  private contentElm: HTMLDivElement;
  private scroll: ScrollState;
  private webGLRenderer: WebGLRenderer;
  private planesUpdater: PlanesUpdater;
  private programInfo: twgl.ProgramInfo | undefined;

  constructor({ content, canvas, items, scroll }: WebGLScrollConfig) {
    this.contentElm = content;
    this.scroll = scroll;

    this.webGLRenderer = new WebGLRenderer(this, canvas);
    this.planesUpdater = new PlanesUpdater({
      items,
      gl: this.webGLRenderer.getWebGLContext(),
    });
  }

  cleanup(): void {
    this.webGLRenderer.cleanup();
    this.planesUpdater.cleanup();
  }

  async onRendererWillInit({ gl, canvas }: FrameInfo) {
    // init webgl
    const program = twgl.createProgramFromSources(gl, [
      EFFECT_VERT,
      EFFECT_FRAG,
    ]);
    this.programInfo = twgl.createProgramInfoFromProgram(gl, program);
  }

  onRender({ gl, canvas, elapsed, delta }: FrameInfo): void {
    gl.viewport(0, 0, canvas.width, canvas.height);

    const programInfo = this.programInfo;
    if (!programInfo) throw "Program info not found during render loop.";

    const uniforms = {
      u_resolution: [canvas.width, canvas.height],
      u_delta: delta,
      u_time: elapsed,
      u_scroll: this.scroll.current,
    };

    gl.useProgram(programInfo.program);
    // render planes onto the webgl canvas
    const allBuffers = this.planesUpdater.getPlanesBufferInfo();

    for (let i = 0; i < allBuffers.length; i++) {
      twgl.setBuffersAndAttributes(gl, programInfo, allBuffers[i]);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, allBuffers[i]);
    }

    // update dom scroll after webgl
    if (this.contentElm)
      this.contentElm.style.transform = `translateY(${this.scroll.current}px)`;
  }
}
