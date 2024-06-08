import * as twgl from "twgl.js";
import {
  CanvasRenderer,
  UpdateFunction,
  createCanvasRenderer,
} from "./rendering/WebGLRenderer";

//@ts-ignore
import EFFECT_FRAG from "./EffectGL.frag";
//@ts-ignore
import EFFECT_VERT from "./EffectGL.vert";
import { proxy } from "valtio";
import { virtualScrollState } from "./useVirtualScroll";

export function createWebGLScroll(canvas: HTMLCanvasElement) {
  return createCanvasRenderer({
    canvas,
    init,
    update,
  }).cleanup;
}

// ================================================================
// init function
// ================================================================
const init = async ({ gl, canvas }: CanvasRenderer) => {
  // init webgl
  const program = twgl.createProgramFromSources(gl, [EFFECT_VERT, EFFECT_FRAG]);
  const programInfo = twgl.createProgramInfoFromProgram(gl, program);

  const arrays = {
    a_position: [-1, -1, 0, 1, -1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1, 1, 0],
  };

  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  return { programInfo, bufferInfo, arrays };
};

// ================================================================
// update function
// ================================================================
const update: UpdateFunction<typeof init> = (renderer, frame, programState) => {
  const { gl, canvas } = renderer;
  const { elapsed, delta } = frame;
  const { programInfo, bufferInfo } = programState;

  gl.viewport(0, 0, canvas.width, canvas.height);

  const uniforms = {
    u_resolution: [canvas.width, canvas.height],
    u_delta: delta,
    u_time: elapsed,
    u_scroll: virtualScrollState.current,
  };

  gl.useProgram(programInfo.program);
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
  twgl.setUniforms(programInfo, uniforms);
  twgl.drawBufferInfo(gl, bufferInfo);
};
