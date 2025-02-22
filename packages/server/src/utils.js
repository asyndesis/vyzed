/**
 * Helper function to query an API.
 * @param {Object} options - Options for the API request.
 * @param {string} options.endpoint - The base URL or endpoint of the API.
 * @param {Object} [options.params] - Query parameters as key-value pairs.
 * @param {string} [options.method='GET'] - HTTP method ('GET', 'POST', etc.).
 * @param {Object} [options.headers] - Headers for the request.
 * @param {Object|Array} [options.body] - Body for non-GET requests.
 * @returns {Promise<Object|string>} - The parsed JSON response or plain text.
 */
export const queryApi = async ({
  endpoint,
  params = {},
  method = "GET",
  headers = {},
  body = null,
}) => {
  try {
    // Clean params by removing null or undefined values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value != null)
    );

    // Build query string
    const queryString = Object.entries(cleanParams)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");

    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    // Merge default headers with provided headers
    const mergedHeaders = { "Content-Type": "application/json", ...headers };

    const response = await fetch(url, {
      method: method.toUpperCase(),
      headers: mergedHeaders,
      body: method.toUpperCase() === "GET" ? null : JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP Error: ${response.status} - ${errorText}`);
    }

    // Automatically parse response based on Content-Type
    const contentType = response.headers.get("content-type");
    return contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();
  } catch (error) {
    console.error("Error querying the API:", error);
    throw new Error("Failed to fetch data from API");
  }
};
