import * as twgl from "twgl.js";

export function deleteTwglBufferInfo(
  gl: WebGLRenderingContext,
  bufferInfo: twgl.BufferInfo
) {
  if (bufferInfo.attribs) {
    Object.keys(bufferInfo.attribs).forEach(function (name) {
      if (!bufferInfo.attribs) return;
      gl.deleteBuffer(bufferInfo.attribs[name].buffer);
    });
  }
  if (bufferInfo.indices) {
    gl.deleteBuffer(bufferInfo.indices);
  }
}
