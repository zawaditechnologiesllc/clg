const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

export class ApiError extends Error {
  status: number
  data: any
  requiresConfirmation?: boolean

  constructor(message: string, status: number, data?: any) {
    super(message)
    this.status = status
    this.data = data
    this.requiresConfirmation = data?.requiresConfirmation
  }
}

export async function apiRequest(method: string, path: string, body?: any): Promise<any> {
  const url = `${API_URL}${path}`
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  })

  let data: any = null
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    data = await res.json()
  }

  if (!res.ok) {
    const msg = data?.error || data?.message || `Request failed (${res.status})`
    throw new ApiError(msg, res.status, data)
  }

  return data
}
