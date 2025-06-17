export async function apiRequest(endpoint, credentials, options = {}) {
  const { username, apiKey } = credentials;

  if (!username || !apiKey) {
    return null;
  }

  const headers = {
    "User-Agent": `Napps-e621-Tools/1.0 (by ${username} on e621)`,
    Authorization: "Basic " + btoa(`${username}:${apiKey}`),
  };

  const url = `https://e621.net/${endpoint}`;

  try {
    const { body, ...fetchOptions } = options;
    const response = await fetch(url, { ...fetchOptions, headers });

    if (response.status === 201 || response.status === 204) {
      return { success: true };
    }

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Could not parse error response." }));
      throw new Error(
        `HTTP error! Status: ${response.status}, Message: ${
          errorData.message || "Unknown error."
        }`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("API Request Error:", error);
    return { success: false, error: error.message };
  }
}
