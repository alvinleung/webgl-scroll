import { CleanupProtocol } from "../../utils/CleanupProtocol";
import * as twgl from "twgl.js";

export class Texture implements CleanupProtocol {
  private _options: twgl.TextureOptions;
  private _tex: WebGLTexture | undefined;
  private _hasInit = false;
  private _isTextureReady = false;

  private static _emptyTexture: Texture;
  public static get empty() {
    if (!this._emptyTexture) {
      // eslint-disable-next-line local-rules/enforce-call-cleanup
      this._emptyTexture = new Texture({});
    }
    return this._emptyTexture;
  }

  constructor(options: twgl.TextureOptions) {
    this._options = options;
  }

  private handleTextureReady() {
    this._isTextureReady = true;
  }

  private loadTextureOntoGPU(gl: WebGLRenderingContext) {
    this._tex = twgl.createTexture(
      gl,
      this._options,
      this.handleTextureReady.bind(this)
    );
  }

  get isTextureReady() {
    return this._isTextureReady;
  }

  getTexture(gl: WebGLRenderingContext): WebGLTexture | undefined {
    if (this._tex === undefined && !this._hasInit) {
      this._hasInit = true;
      this.loadTextureOntoGPU(gl);
    }
    if (this._isTextureReady) {
      return this._tex;
    }
  }

  cleanup(): void {}
}
