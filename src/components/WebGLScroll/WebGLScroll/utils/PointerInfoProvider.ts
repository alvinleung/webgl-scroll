import { Vec3 } from "gl-matrix";
import { CleanupProtocol } from "./CleanupProtocol";

const v = new Vec3();

export class PointerInfoProvider implements CleanupProtocol {
  private _isMouseDown = false;
  private _mousePosition = { x: 0, y: 0 };
  private _mousePositionNormalized = { x: 0, y: 0 };
  private _canvas: HTMLCanvasElement;
  private _canvasWidth: number = 0;
  private _canvasHeight: number = 0;
  private _canvasLeft: number = 0;
  private _canvasTop: number = 0;
  private _resizeObserver: ResizeObserver;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this.updateCanvasDimensions();

    window.addEventListener("pointerdown", this.handlePointerDown.bind(this));
    window.addEventListener("pointerup", this.handlePointerUp.bind(this));
    window.addEventListener("pointermove", this.handlePointerMove.bind(this));

    // eslint-disable-next-line local-rules/enforce-call-cleanup
    this._resizeObserver = new ResizeObserver(this.handleResize.bind(this));
    this._resizeObserver.observe(this._canvas);
  }

  private updateCanvasDimensions() {
    const rect = this._canvas.getBoundingClientRect();
    this._canvasWidth = rect.width;
    this._canvasHeight = rect.height;
    this._canvasLeft = rect.left;
    this._canvasTop = rect.top;
  }

  private handlePointerDown() {
    this._isMouseDown = true;
  }

  private handlePointerUp() {
    this._isMouseDown = false;
  }

  private handlePointerMove(e: MouseEvent) {
    this._mousePosition = {
      x: e.clientX - this._canvasLeft,
      y: e.clientY - this._canvasTop,
    };
    this._mousePositionNormalized = {
      x: this._mousePosition.x / this._canvasWidth,
      y: this._mousePosition.y / this._canvasHeight,
    };
  }

  private handleResize() {
    this.updateCanvasDimensions();
    // Recalculate normalized position based on the new size if needed
    this._mousePositionNormalized = {
      x: this._mousePosition.x / this._canvasWidth,
      y: this._mousePosition.y / this._canvasHeight,
    };
  }

  get isMouseDown() {
    return this._isMouseDown;
  }

  get position() {
    return this._mousePosition;
  }

  get positionNormalized() {
    return this._mousePositionNormalized;
  }

  cleanup(): void {
    window.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointermove", this.handlePointerMove);
    this._resizeObserver.disconnect();
  }
}
