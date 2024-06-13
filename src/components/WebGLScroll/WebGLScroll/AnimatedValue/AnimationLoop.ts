import { CleanupProtocol } from "../utils/CleanupProtocol";
import { AnimationState } from "./AnimatedValue";
import { FrameAnimator } from "./Animators/FrameAnimator";

export interface AnimationLoopDelegate {
  /**
   * Return true to contine frame, or return stop to stop
   */
  onEnterFrame(delta: number): boolean;
}

export class AnimationLoop implements CleanupProtocol {
  private isAnimating = false;
  private fps = 60;
  private frameInterval = 1000 / this.fps;
  private animFrame = 0;
  private prevTime = 0;

  private animator: FrameAnimator | undefined;
  private animState: AnimationState | undefined;

  public start(animator: FrameAnimator, animState: AnimationState) {
    // swap out the animator
    this.animator = animator;
    this.animState = animState;

    // don't start another render loop
    if (this.isAnimating) {
      return;
    }

    this.isAnimating = true;
    this.loop();
  }
  public stop() {
    this.isAnimating = false;
    cancelAnimationFrame(this.animFrame);
  }

  private loop(delta = 0) {
    if (!this.isAnimating) return;
    if (!this.animState) {
      throw "Animation state is undefined for the animation loop";
    }
    if (!this.animator) {
      throw "Animator is undefined";
    }

    // first time calling this function, skip
    if (delta !== 0) {
      // update the animation loop
      const shouldContinueLoop = this.animator.animate(this.animState, delta);
      if (!shouldContinueLoop) {
        this.stop();
        return;
      }
    }

    this.animFrame = requestAnimationFrame(
      (() => {
        const currTime = performance.now();
        const deltaTime = currTime - this.prevTime;
        const delta = deltaTime / this.frameInterval;
        this.prevTime = currTime;
        this.loop(delta);
      }).bind(this)
    );
  }
  cleanup(): void {
    cancelAnimationFrame(this.animFrame);
  }
}
