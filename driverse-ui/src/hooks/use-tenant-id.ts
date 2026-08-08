/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/useGetTenantId.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-tenantId.tsx
 * @status decoupled
 * @notes The two differ only by an `as string` cast and formatting. Decoupled from `useKeycloak()`:
 *        the token is a parameter, so apps pass `keycloak.token` and the library takes no auth peer.
 *        Decoding lives in use-jwt-claims.ts, shared with [use-client-id].
 */

import { useMemo } from "react";
import { readHasuraClaim } from "./use-jwt-claims";

/** Hasura tenant id from a session JWT. undefined without a token, null when decoding fails. */
export const useTenantId = (token: string | null | undefined) =>
	useMemo(() => readHasuraClaim(token, "x-hasura-tenant-id"), [token]);
