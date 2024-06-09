import * as twgl from "twgl.js";
import {
  CanvasRenderer,
  GetInitFunctionReturns,
  InitFunction,
  UpdateFunction,
  createCanvasRenderer,
} from "./utils/WebGLRenderer";

//@ts-ignore
import EFFECT_FRAG from "./shaders/EffectGL.frag";
//@ts-ignore
import EFFECT_VERT from "./shaders/EffectGL.vert";
import { Plane, ScrollItems, ScrollState } from "./VirtualScroll";

let planesBufferInfo: twgl.BufferInfo[] = [];

export class WebGLScroll {
  private contentElm: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private rendererCleanup = () => {};

  private items: ScrollItems;
  private scroll: ScrollState;

  constructor({
    content,
    canvas,
    items,
    scroll,
  }: {
    canvas: HTMLCanvasElement;
    content: HTMLDivElement;
    items: ScrollItems;
    scroll: ScrollState;
  }) {
    this.contentElm = content;
    this.canvas = canvas;
    this.items = items;
    this.scroll = scroll;

    const { cleanup } = createCanvasRenderer({
      canvas,
      init: this.init.bind(this),
      update: this.update.bind(this),
    });
    this.rendererCleanup = cleanup;
  }

  public cleanup() {
    this.rendererCleanup();
  }

  private init = async ({ gl, canvas }: CanvasRenderer) => {
    // init webgl
    const program = twgl.createProgramFromSources(gl, [
      EFFECT_VERT,
      EFFECT_FRAG,
    ]);
    const programInfo = twgl.createProgramInfoFromProgram(gl, program);

    return { programInfo };
  };

  private update: UpdateFunction<typeof this.init> = (
    renderer,
    frame,
    programState
  ) => {
    const { gl, canvas } = renderer;
    const { elapsed, delta } = frame;
    const { programInfo } = programState;

    gl.viewport(0, 0, canvas.width, canvas.height);

    const uniforms = {
      u_resolution: [canvas.width, canvas.height],
      u_delta: delta,
      u_time: elapsed,
      u_scroll: this.scroll.current,
    };

    gl.useProgram(programInfo.program);
    // render planes onto the webgl canvas
    const allBuffers = planesBufferInfo;
    for (let i = 0; i < allBuffers.length; i++) {
      twgl.setBuffersAndAttributes(gl, programInfo, allBuffers[i]);
      twgl.setUniforms(programInfo, uniforms);
      twgl.drawBufferInfo(gl, allBuffers[i]);
    }

    // update dom scroll after webgl
    if (this.contentElm)
      this.contentElm.style.transform = `translateY(${this.scroll.current}px)`;
  };
}
