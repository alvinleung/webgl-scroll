import * as twgl from "twgl.js";

//@ts-ignore
import EFFECT_FRAG from "./shaders/EffectGL.frag";
//@ts-ignore
import EFFECT_VERT from "./shaders/EffectGL.vert";

import { ScrollItems, ScrollState } from "./VirtualScroll";
import {
  FrameInfo,
  WebGLRenderer,
  WebGLRendererDelegate,
} from "./utils/WebGLRenderer";
import { CleanupProtocol } from "./utils/CleanupProtocol";
import { PlanesUpdater } from "./PlanesUpdater";
import { AnimatedValue } from "./AnimatedValue/AnimatedValue";
import { PointerInfoProvider } from "./utils/PointerInfoProvider";
import ShaderProgram from "./shaders/ShaderProgram";

interface WebGLScrollConfig {
  canvas: HTMLCanvasElement;
  content: HTMLDivElement;
  items: ScrollItems;
  scroll: AnimatedValue;
}
/**
 * The main entry point of the program
 */
export class WebGLScroll implements WebGLRendererDelegate, CleanupProtocol {
  private contentElm: HTMLDivElement;
  private scroll: AnimatedValue;

  private webGLRenderer: WebGLRenderer;
  private planesUpdater: PlanesUpdater;
  private pointer: PointerInfoProvider;

  private planeShaderProgram: ShaderProgram = new ShaderProgram(
    EFFECT_VERT,
    EFFECT_FRAG
  );

  constructor({ content, canvas, items, scroll }: WebGLScrollConfig) {
    this.contentElm = content;
    this.scroll = scroll;

    this.webGLRenderer = new WebGLRenderer(this, canvas);
    this.planesUpdater = new PlanesUpdater({
      items,
      gl: this.webGLRenderer.getWebGLContext(),
    });
    this.pointer = new PointerInfoProvider(canvas);
  }

  cleanup(): void {
    this.webGLRenderer.cleanup();
    this.planesUpdater.cleanup();
    this.pointer.cleanup();
    this.planeShaderProgram.cleanup();
  }

  async onRendererWillInit({ gl, canvas }: FrameInfo) {
    // init webgl
  }

  onRender({ gl, canvas, elapsed, delta }: FrameInfo): void {
    const uniforms = {
      u_resolution: [canvas.width, canvas.height],
      u_delta: delta,
      u_time: elapsed,
      u_scroll: this.scroll.getCurrent(),
      u_mouse: [
        this.pointer.positionNormalized.x,
        this.pointer.positionNormalized.y,
      ],
    };

    // render planes onto the webgl canvas
    const allBuffers = this.planesUpdater.getPlanesBufferInfo();

    let prevProgramInfo;
    for (let i = 0; i < allBuffers.length; i++) {
      if (!this.planesUpdater.planes) continue;
      const currentPlaneProgram = this.planesUpdater.planes[i].shaderProgram;
      const programInfo = currentPlaneProgram.getProgramInfo(gl);

      // only switch program when the program info is different for performance
      if (prevProgramInfo !== programInfo) {
        gl.useProgram(programInfo.program);
      }

      twgl.setBuffersAndAttributes(gl, programInfo, allBuffers[i]);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, allBuffers[i]);
    }

    // step 2 - TODO: post processing

    // Step 3 - Update DOM scroll offset
    // It is necessary to follow dom update with webgl update in the same
    // requestAnimationFrame call. Or else the position will be out of sync.
    if (this.contentElm)
      this.contentElm.style.transform = `translateY(${this.scroll.getCurrent()}px)`;
  }
}
