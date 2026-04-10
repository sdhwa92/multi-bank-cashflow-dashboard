const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}

export async function uploadStatement(
  accountId: string,
  file: File
): Promise<{ statement_id: string; status: string }> {
  const form = new FormData()
  form.append("file", file)
  const res = await fetch(`/api/v1/accounts/${accountId}/statements/upload`, {
    method: "POST",
    body: form,
  })
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`)
  }
  return res.json()
}
