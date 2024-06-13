import { CleanupProtocol } from "../utils/CleanupProtocol";
import * as twgl from "twgl.js";

interface ShaderRepository {
  [key: string]: twgl.ProgramInfo;
}

export default class ShaderProgram implements CleanupProtocol {
  private _frag: string;
  private _vert: string;
  private _shaderHash: string;
  private _programInfo: twgl.ProgramInfo | undefined;

  public static __COMPILED_SHADER__: ShaderRepository = {};

  constructor(vert: string, frag: string) {
    this._vert = vert;
    this._frag = frag;
    this._shaderHash = this._vert + this._frag;
  }

  // it uses lazy initialization
  // you may spawn unlimited shader instance but their
  // underlying shader is the same
  public getProgramInfo(gl: WebGLRenderingContext) {
    // gate 1: when shader exist, just give the ccurrent shader
    if (this._programInfo !== undefined) {
      return this._programInfo;
    }

    // gate 2: look at the previously compiled shader repository
    //         in case the same programme has be compiled
    const previouslyCompiledShader =
      ShaderProgram.__COMPILED_SHADER__[this._shaderHash];
    if (previouslyCompiledShader) {
      this._programInfo = previouslyCompiledShader;
      return previouslyCompiledShader;
    }

    // finally compile the shader
    const program = twgl.createProgramFromSources(gl, [this._vert, this._frag]);
    this._programInfo = twgl.createProgramInfoFromProgram(gl, program);
    return this._programInfo;
  }

  cleanup(): void {}
}
