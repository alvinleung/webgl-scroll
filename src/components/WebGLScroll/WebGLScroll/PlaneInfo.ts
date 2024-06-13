import ShaderProgram from "./shaders/ShaderProgram";

export default interface PlaneInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  shaderProgram: ShaderProgram;
}

export function createPlane() {}
