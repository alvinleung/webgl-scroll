import { CleanupProtocol } from "./CleanupProtocol";

export interface FrameInfo {
  delta: number;
  elapsed: number;
  gl: WebGLRenderingContext;
  canvas: HTMLCanvasElement;
}

export interface WebGLRendererDelegate {
  onRender(frameInfo: FrameInfo): void;
  onRendererWillInit(frameInfo: FrameInfo): Promise<any>;
}
/**
 * A object that handle the render loop and provide webgl context
 */
export class WebGLRenderer implements CleanupProtocol {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;

  private shouldCanvasUpdate: boolean = false;
  private lastFrameTime: number = Date.now();

  private renderingDelegate: WebGLRendererDelegate;
  private animFrame = 0;

  constructor(delegate: WebGLRendererDelegate, canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext("webgl") as WebGLRenderingContext;
    if (!gl) throw "Cannot get webgl context";
    this.gl = gl;
    this.renderingDelegate = delegate;

    // begin running the frame loop right after init
    (async () => {
      await this.renderingDelegate.onRendererWillInit({
        delta: 0,
        elapsed: 0,
        gl: this.gl,
        canvas: this.canvas,
      });
      this.shouldCanvasUpdate = true;
      this.nextFrame();
    }).bind(this)();
  }

  private updateFrame(currentFrameTime: number) {
    if (!this.shouldCanvasUpdate) return;

    // calc the delta
    const delta = currentFrameTime - this.lastFrameTime;
    this.lastFrameTime = currentFrameTime;

    this.renderingDelegate.onRender({
      delta,
      elapsed: currentFrameTime,
      gl: this.gl,
      canvas: this.canvas,
    });
    this.nextFrame();
  }

  public getWebGLContext() {
    return this.gl;
  }

  private nextFrame() {
    this.animFrame = requestAnimationFrame(this.updateFrame.bind(this));
  }

  public pause() {
    this.shouldCanvasUpdate = false;
  }
  public resume() {
    this.shouldCanvasUpdate = true;
    this.nextFrame();
  }

  public cleanup(): void {
    cancelAnimationFrame(this.animFrame);
  }
}
