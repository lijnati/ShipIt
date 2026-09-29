import "server-only";
import { cache } from "react";

/**
 * The server's clock for this request, fixed once so every component in the
 * render agrees on "now". Passed to client clocks (useNow) so the first client
 * render matches the server HTML.
 */
export const getRequestTime = cache((): number => Date.now());
