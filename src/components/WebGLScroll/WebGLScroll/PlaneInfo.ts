import ShaderProgram from "./rendering/shader/ShaderProgram";
import * as twgl from "twgl.js";
import { Texture } from "./rendering/texture/Texture";

type ExcludeKeys<T, K extends keyof any> = {
  [P in keyof T as Exclude<P, K>]: T[P];
};

type ReservedUniformKeys = "u_mouse" | "u_scroll" | "u_time" | "u_resolution";
export type PlaneUniforms = ExcludeKeys<
  {
    [key: string]: number | Array<number> | Texture | undefined;
  },
  ReservedUniformKeys
>;

type ReseravedAttributeKeys = "";
export type PlaneAttributes = ExcludeKeys<
  {
    [key: string]: number | Array<number>;
  },
  ReseravedAttributeKeys
>;

export default interface PlaneInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  shaderProgram: ShaderProgram;

  //TODO: pass in attributes and uniform via the plane info
  // attributes: twgl.AttribInfo;
  uniforms: PlaneUniforms;
}
