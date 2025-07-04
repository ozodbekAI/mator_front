export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Debug uchun
    console.log("API_BASE_URL:", process.env.API_BASE_URL)
    console.log("Request body:", body)

    const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000"

    console.log("Making request to:", `${API_BASE_URL}/register`)

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Backend response status:", response.status)

    const data = await response.json()
    console.log("Backend response data:", data)

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("API Route Error:", error)
    return Response.json({ detail: "Server xatosi", error: error.message }, { status: 500 })
  }
}
