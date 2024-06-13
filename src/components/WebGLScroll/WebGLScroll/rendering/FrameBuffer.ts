import { CleanupProtocol } from "../utils/CleanupProtocol";
import * as twgl from "twgl.js";

export interface RenderPass {
  render(gl: WebGLRenderingContext, output: FrameBuffer): void;
}

export class FrameBuffer implements CleanupProtocol {
  private _frameBufferInfo: twgl.FramebufferInfo;
  private gl: WebGLRenderingContext;

  constructor(gl: WebGLRenderingContext, width: number, height: number) {
    this.gl = gl;
    const attachments = [
      { format: gl.RGB565, mag: gl.NEAREST },
      { format: gl.STENCIL_INDEX8 },
    ];
    this._frameBufferInfo = twgl.createFramebufferInfo(
      gl,
      attachments,
      width,
      height
    );
  }

  write(renderPass: RenderPass) {
    twgl.resizeFramebufferInfo(this.gl, this._frameBufferInfo);
    twgl.bindFramebufferInfo(this.gl, this._frameBufferInfo);
    renderPass.render(this.gl, this);
  }

  read() {}

  cleanup(): void {
    this.gl.deleteFramebuffer(this._frameBufferInfo.framebuffer);
  }
}
