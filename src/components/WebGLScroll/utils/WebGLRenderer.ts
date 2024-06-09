export interface CanvasRenderer {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  cleanup: () => void;
}
export interface FrameInfo {
  elapsed: number;
  delta: number;
}

export interface CanvasRendererConfig<T> {
  canvas: HTMLCanvasElement;
  init: (renderer: CanvasRenderer) => Promise<T>;
  update: (renderer: CanvasRenderer, frameInfo: FrameInfo, params: T) => void;
}

export type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T;
export type InitFunction = (renderer: CanvasRenderer) => Promise<any>;
export type GetInitFunctionReturns<T extends InitFunction> = Awaited<
  ReturnType<T>
>;
export type UpdateFunction<T extends InitFunction> = (
  canvasRenderer: CanvasRenderer,
  frameInfo: FrameInfo,
  params: GetInitFunctionReturns<T>
) => void;

export function createCanvasRenderer<T>({
  canvas,
  init,
  update,
}: CanvasRendererConfig<T>): CanvasRenderer {
  const gl = canvas.getContext("webgl") as WebGLRenderingContext;

  const renderer = {
    cleanup,
    canvas,
    gl,
  };

  let animFrame = 0;
  let initialParams: GetInitFunctionReturns<typeof init>;
  let isActive = true;
  // init
  let lastFrameTime = 0;
  function updateFrame(currentFrameTime: number) {
    if (!isActive) return;

    // calc the delta
    const delta = currentFrameTime - lastFrameTime;
    lastFrameTime = currentFrameTime;
    const frameInfo = {
      delta,
      elapsed: currentFrameTime,
    };

    // do webgl rendering stuff here
    update(renderer, frameInfo, initialParams);
    // renderer.context.restore();
    animFrame = requestAnimationFrame(updateFrame);
  }

  async function initCanvas() {
    initialParams = await init(renderer);
    requestAnimationFrame(updateFrame);
  }
  initCanvas();

  function cleanup() {
    cancelAnimationFrame(animFrame);
  }

  // function resumeUpdateFrame() {
  //   if (isActive) return;
  //   isActive = true;
  //   requestAnimationFrame(updateFrame);
  // }
  // function puaseUpdateFrame() {
  //   isActive = false;
  // }

  // // init intersection observer here
  // let options = {
  //   root: document.querySelector("#scrollArea"),
  //   rootMargin: "0px",
  //   threshold: [0, 1.0],
  // };

  // let observer = new IntersectionObserver((e) => {
  //   e.forEach((entry) => {
  //     if (entry.isIntersecting) {
  //       // console.log("in view");
  //       resumeUpdateFrame();
  //       return;
  //     }
  //     // console.log("exit view");
  //     puaseUpdateFrame();
  //   });
  // }, options);
  // observer.observe(canvas);

  return renderer;
}
