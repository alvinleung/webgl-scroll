import { AnimationState } from "../AnimatedValue";
/**
 * FrameAnimator implements the animation logic for animation loop
 */
export interface FrameAnimator {
  /**
   * Executes animation logic based on the animation state
   * returns boolean flag to decide whether we should continue with next frame
   * @param state
   * @param delta
   */
  animate(state: AnimationState, delta: number): boolean;
}
