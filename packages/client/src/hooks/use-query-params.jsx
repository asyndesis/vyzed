import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function useQueryParams() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return {
    params: Object.fromEntries(searchParams.entries()),
    updateParams: (paramsToUpdate, { shallow = true } = {}) => {
      // Create a new URLSearchParams object from the current search params
      const currentParams = new URLSearchParams(searchParams.toString());

      // Iterate over the paramsToUpdate object
      Object.entries(paramsToUpdate).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          // Remove the parameter if the value is null or undefined
          currentParams.delete(key);
        } else {
          // Set or update the parameter
          currentParams.set(key, String(value));
        }
      });

      // Construct the new URL with updated query parameters
      const newSearchParams = currentParams.toString();
      const newUrl = newSearchParams
        ? `${pathname}?${newSearchParams}`
        : pathname;

      // Navigate to the new URL
      return shallow
        ? window.history.pushState(null, "", newUrl)
        : router.push(newUrl);
    },
  };
}
