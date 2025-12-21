export async function apiRequest(endpoint, credentials, options = {}) {
  const { username, apiKey } = credentials || {};
  const headers = { "User-Agent": "e621-Tools/1.0 (by Napp on e621)" };

  if (username && apiKey) {
    headers.Authorization = "Basic " + btoa(`${username}:${apiKey}`);
  }

  const url = `https://e621.net/${endpoint}`;

  try {
    const response = await fetch(url, { ...options, headers });

    // Treat 201 / 204 as success
    if (response.status === 201 || response.status === 204) {
      return { success: true };
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error || `HTTP error! Status: ${response.status}`
      );
    }

    return { success: true, data };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}
