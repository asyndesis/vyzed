import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

export const locales = ["en", "de", "es"];
export const defaultLocale = "en";

export const isLocale = (value) => locales.includes(value);

// Best supported language from the Accept-Language header, for unprefixed URLs
export const detectLocale = createServerFn().handler(() => {
  const accepted = (getRequestHeader("accept-language") ?? "")
    .split(",")
    .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase());
  return accepted.find(isLocale) ?? defaultLocale;
});
