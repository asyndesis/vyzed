import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "@/paraglide/server";

// Sets the request's locale (from the URL) before Start renders anything
export default {
  fetch(request: Request): Promise<Response> {
    return paraglideMiddleware(request, () => handler.fetch(request));
  },
};
