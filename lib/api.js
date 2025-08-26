import { logger } from "./utils.js";

export async function apiRequest(endpoint, credentials, options = {}) {
  const { username, apiKey } = credentials || {};

  const headers = {
    "User-Agent": `e621-Tools/1.0 (by Napp on e621)`,
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
      let errorMessage = `HTTP error! Status: ${response.status}`;

      try {
        errorData = await response.json();
        if (errorData.message) {
          errorMessage += `, Message: ${errorData.message}`;
        } else if (errorData.errors) {
            const errorDetails = Object.entries(errorData.errors).map(([field, messages]) => `${field} ${messages.join(', ')}`).join('; ');
            errorMessage += `, Message: ${errorDetails}`;
        }
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
      
      switch (response.status) {
        case 401:
          errorMessage = "Authentication failed. Please check your username and API key in the settings.";
          break;
        case 403:
          errorMessage = "You do not have permission to access this resource. Your account may be blocked or you may be trying to access a resource that you are not allowed to.";
          break;
        case 404:
            errorMessage = "The requested resource could not be found.";
            break;
        case 412:
            // This is often a duplicate post error
            errorMessage = `Precondition Failed: ${errorData.message || 'The server rejected the request. This could be a duplicate image.'}`;
            break;
        case 429:
          errorMessage = "You are being rate-limited. Please wait a few moments before trying again.";
          break;
        case 500:
            errorMessage = "The e621.net server encountered an internal error. Please try again later.";
            break;
        case 503:
            errorMessage = "The e621.net server is currently unavailable. Please try again later.";
            break;
      }

      throw new Error(errorMessage);
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

export async function apiUploadRequest(endpoint, credentials, formData) {
    const { username, apiKey } = credentials || {};
    if (!username || !apiKey) {
        return { success: false, error: 'Username and API key are required for uploads.' };
    }

    const headers = {
        "User-Agent": `e621-Tools/1.0 (by Napp on e621)`,
        "Authorization": "Basic " + btoa(`${username}:${apiKey}`),
    };

    const url = `https://e621.net/${endpoint}`;
    logger.log(`[API Upload] Preparing to post to: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
            const errorReason = responseData.reason || (responseData.errors ? JSON.stringify(responseData.errors) : 'Unknown error');
            logger.error(`[API Upload Error] Status: ${response.status}. Reason: ${errorReason}`);
            throw new Error(errorReason);
        }

        logger.log(`[API Upload Success] Received response:`, responseData);
        return { success: true, ...responseData };

    } catch (error) {
        logger.error(`[API Upload Fetch Error] A critical error occurred during the upload to ${url}:`, error);
        return { success: false, error: error.message };
    }
}