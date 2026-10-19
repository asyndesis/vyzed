import type { AppType } from "@vyzed/api";
import { type ClientResponse, hc, type InferResponseType, parseResponse } from "hono/client";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

/** Typed RPC client generated from the Hono app's routes. */
export const api = hc<AppType>(API_URL, { init: { credentials: "include" } }).api;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Await a client call, throwing `ApiError` with the server's message on non-2xx responses. */
export async function call<T extends ClientResponse<unknown>>(req: T | Promise<T>) {
  const res = await req;
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const message =
      body && typeof body === "object" && "error" in body && typeof body.error === "string"
        ? body.error
        : res.statusText;
    throw new ApiError(res.status, message || "Request failed");
  }
  return parseResponse(res);
}

export type TeacherDto = InferResponseType<(typeof api.teachers)[":id"]["$get"], 200>["teacher"];
export type BookingDto = InferResponseType<typeof api.bookings.$get, 200>["bookings"][number];
