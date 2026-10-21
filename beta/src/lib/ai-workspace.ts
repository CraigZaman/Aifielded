import "server-only";
import { AsyncLocalStorage } from "node:async_hooks";

// Background jobs carry an explicit workspace; web requests resolve their own membership.
export const aiWorkspace = new AsyncLocalStorage<string>();
