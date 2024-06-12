import { proxy, subscribe } from "valtio";
import { CleanupProtocol } from "../utils/CleanupProtocol";
import { AnimationLoop, AnimationLoopDelegate } from "./AnimationLoop";
import { LerpFrameAnimator } from "./Animators/LerpFrameAnimator";
import { FrameAnimator } from "./Animators/FrameAnimator";
import { LaunchFrameAnimator } from "./Animators/LaunchFrameAnimator";

export interface AnimationState {
  current: number;
  target: number;
  velocity: number;
  prevValue: number;
}

export class AnimatedValue implements CleanupProtocol {
  // an empty value place holder, most useful for creating react context
  public static empty = new AnimatedValue(0);
  private loop: AnimationLoop;

  private state = proxy<AnimationState>({
    current: 0,
    target: 0,
    velocity: 0,
    prevValue: 0,
  });

  private lerpAnimator = new LerpFrameAnimator();
  private launchAnimator = new LaunchFrameAnimator();

  constructor(initial: number = 0) {
    this.state.current = initial;
    this.loop = new AnimationLoop();
  }

  /**
   * Jump to a target value
   * @param target
   */
  public set(target: number, stopAnimation = true) {
    stopAnimation && this.loop.stop();
    this.state.target = target;
    this.state.current = target;
    this.state.velocity = 0;
    this.state.prevValue = target;
  }

  /**
   * Linear interpolate to a target value
   * @param target
   * @param lerp
   */
  public lerpTo(target: number, lerp: number = 0.01) {
    this.loop.start(this.lerpAnimator.lerpTo(target, lerp), this.state);
  }

  /**
   * Create an impulse with a certain velocity
   * @param velocity
   * @param damp
   */
  public launch(
    velocity: number,
    damp: number,
    bound?: { min: number; max: number }
  ) {
    this.loop.start(
      this.launchAnimator.launchWith(velocity, damp, bound),
      this.state
    );
  }

  public cleanup(): void {
    this.lerpAnimator.cleanup();
    this.launchAnimator.cleanup();
    this.loop.cleanup();
  }
  public getCurrent() {
    return this.state.current;
  }
  public getVelocity() {
    return this.state.velocity;
  }
  public getTarget() {
    return this.state.target;
  }
  public onChange(handler: (state: AnimationState) => void) {
    const self = this;
    return subscribe(this.state, () => handler(self.state));
  }
}
