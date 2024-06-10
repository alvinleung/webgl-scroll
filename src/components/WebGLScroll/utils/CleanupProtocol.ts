/**
 * This protocol makes sure classes have a cleanup function.
 */
// Intent:
// This allow a proper cleanup when integrating to react applications.
export interface CleanupProtocol {
  cleanup(): void;
}
