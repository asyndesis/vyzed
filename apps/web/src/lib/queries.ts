import { queryOptions } from "@tanstack/react-query";
import { ApiError, api, call } from "./api";

/** The signed-in user, or null when signed out. */
export const meQuery = queryOptions({
  queryKey: ["me"],
  queryFn: async () => {
    try {
      return await call(api.me.$get());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },
});

export const bookingsQuery = queryOptions({
  queryKey: ["bookings"],
  queryFn: () => call(api.bookings.$get()),
});
