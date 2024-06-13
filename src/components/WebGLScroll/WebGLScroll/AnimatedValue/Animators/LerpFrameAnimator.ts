import { CleanupProtocol } from "../../utils/CleanupProtocol";
import { AnimationState } from "../AnimatedValue";
import { FrameAnimator } from "./FrameAnimator";

const STOP_THRESHOLD = 0.01;

export class LerpFrameAnimator implements CleanupProtocol, FrameAnimator {
  private lerp = 0.01;
  private target = 0;

  public lerpTo(target: number, lerp: number) {
    this.lerp = lerp;
    this.target = target;
    return this;
  }

  public animate(state: AnimationState, delta: number) {
    state.target = this.target;

    // Scale the lerp factor by delta
    let scaledLerp = this.lerp * delta;

    // Cap the scaled lerp factor to 1
    if (scaledLerp > 1) scaledLerp = 1;

    state.current = state.current + (state.target - state.current) * scaledLerp;

    state.velocity = state.current - state.prevValue;
    state.prevValue = state.current;

    if (Math.abs(state.velocity) < STOP_THRESHOLD) {
      state.current = state.target;
      return false;
    }
    return true;
  }

  cleanup(): void {}
}
