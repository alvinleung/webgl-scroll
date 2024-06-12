import { CleanupProtocol } from "./utils/CleanupProtocol";

class Plane implements CleanupProtocol {
  public position = [0, 0];
  public size = [0, 0];

  cleanup(): void {}
}
