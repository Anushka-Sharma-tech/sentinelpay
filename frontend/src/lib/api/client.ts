export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getApiUrl() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

  if (!apiUrl) {
    throw new ApiError(
      "The FastAPI service is not connected in this environment.",
      0,
    );
  }

  return apiUrl;
}

export function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function postAuthenticated(
  path: string,
  body: object,
  accessToken: string,
) {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "The backend is unavailable. Check the API URL and that FastAPI is running.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : `The backend returned HTTP ${response.status}.`;

    throw new ApiError(detail, response.status);
  }

  return payload;
}

export async function postJson(
  path: string,
  body: object,
) {
  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      "The backend is unavailable. Check the API URL and that FastAPI is running.",
      0,
    );
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const detail =
      isRecord(payload) && typeof payload.detail === "string"
        ? payload.detail
        : `The backend returned HTTP ${response.status}.`;

    throw new ApiError(detail, response.status);
  }

  return payload;
}