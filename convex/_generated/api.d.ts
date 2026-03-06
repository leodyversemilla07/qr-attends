/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as attendance from "../attendance.js";
import type * as authHelpers from "../authHelpers.js";
import type * as events from "../events.js";
import type * as members from "../members.js";
import type * as officers from "../officers.js";
import type * as officers_admin from "../officers/admin.js";
import type * as officers_auth from "../officers/auth.js";
import type * as officers_maintenance from "../officers/maintenance.js";
import type * as officers_password from "../officers/password.js";
import type * as officers_seed from "../officers/seed.js";
import type * as search from "../search.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  attendance: typeof attendance;
  authHelpers: typeof authHelpers;
  events: typeof events;
  members: typeof members;
  officers: typeof officers;
  "officers/admin": typeof officers_admin;
  "officers/auth": typeof officers_auth;
  "officers/maintenance": typeof officers_maintenance;
  "officers/password": typeof officers_password;
  "officers/seed": typeof officers_seed;
  search: typeof search;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
