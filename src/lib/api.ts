export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function parse<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !data) {
    throw new ApiError(response.status, data?.error ?? 'Something went wrong. Please try again.');
  }
  return data;
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'You appear to be offline. Check your connection and try again.');
  }
  return parse<T>(response);
}

export async function getJson<T>(url: string): Promise<T> {
  return parse<T>(await fetch(url, { headers: { Accept: 'application/json' } }));
}

export async function postForm<T>(url: string, body: FormData): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { method: 'POST', body });
  } catch {
    throw new ApiError(0, 'You appear to be offline. Check your connection and try again. Your answers are still here.');
  }
  if (response.status === 413) {
    throw new ApiError(413, 'Your documents are too large to send together. Try smaller photos, or fewer pages.');
  }
  return parse<T>(response);
}
