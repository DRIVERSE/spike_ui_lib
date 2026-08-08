/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/hooks/web/use-clientId.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/hooks/web/use-clientId.tsx
 * @status decoupled
 * @notes Byte-identical in both apps and identical to use-tenant-id bar the claim key. Same keycloak
 *        decoupling: the token is a parameter. Both apps' copies log "Error extracting tenant ID" on
 *        failure here — a copy-paste bug, fixed by the shared decoder in use-jwt-claims.ts.
 */

import { useMemo } from "react";
import { readHasuraClaim } from "./use-jwt-claims";

/** Hasura client id from a session JWT. undefined without a token, null when decoding fails. */
export const useClientId = (token: string | null | undefined) =>
	useMemo(() => readHasuraClaim(token, "x-hasura-client-id"), [token]);
