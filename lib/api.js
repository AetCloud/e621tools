import { logger } from "./utils.js";

export async function apiRequest(endpoint, credentials, options = {}) {
  const { username, apiKey } = credentials || {};

  const headers = {
    "User-Agent": `Napps-e621-Tools/1.0 (by Napp on e621)`,
  };

  if (username && apiKey) {
    headers.Authorization = "Basic " + btoa(`${username}:${apiKey}`);
  }

  const url = `https://e621.net/${endpoint}`;
  logger.log(`[API Request] Preparing to fetch: ${url}`, { options, headers });

  try {
    const { body, signal, ...fetchOptions } = options;
    const response = await fetch(url, { ...fetchOptions, headers, signal });

    logger.log(`[API Response] Received status ${response.status} for ${url}`);

    if (response.status === 201 || response.status === 204) {
      logger.log(
        `[API Success] Request successful with status ${response.status}. No content to parse.`
      );
      return { success: true };
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        logger.error(
          `[API Error] Non-OK response from ${url}. Status: ${response.status}. Body:`,
          errorData
        );
      } catch (jsonError) {
        errorData = { message: "Could not parse error response JSON." };
        logger.error(
          `[API Error] Non-OK response from ${url}. Status: ${response.status}. Could not parse JSON body.`,
          jsonError
        );
      }
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${
          errorData.message || "Unknown error."
        }`
      );
    }

    const data = await response.json();
    logger.log(
      `[API Success] Successfully parsed JSON response for ${url}`,
      data
    );
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.warn(`[API Fetch Aborted] The request to ${url} was aborted.`);
      return { aborted: true };
    }
    logger.error(
      `[API Fetch Error] A critical error occurred during the fetch to ${url}:`,
      error
    );
    return { success: false, error: error.message };
  }
}