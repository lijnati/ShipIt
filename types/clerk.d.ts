export {};

declare global {
  interface UserPublicMetadata {
    /** ShipIt username. Written only by server code (see app/onboarding/actions.ts). */
    username?: string | null;
    /** Epoch ms of the claim — used to resolve simultaneous claims. */
    usernameClaimedAt?: number | null;
  }
}
