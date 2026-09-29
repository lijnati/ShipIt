export {};

declare global {
  interface UserPublicMetadata {
    /**
     * LEGACY (Phase 2): ShipIt username from before Postgres. Read once, when a
     * user's database row is created (see db/queries/users.ts). Never written
     * anymore; the database is the source of truth.
     */
    username?: string | null;
  }
}
