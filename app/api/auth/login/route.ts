export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Debug uchun
    console.log("API_BASE_URL:", process.env.API_BASE_URL)
    console.log("Login attempt for:", formData.get("username"))

    const API_BASE_URL = process.env.API_BASE_URL || "http://127.0.0.1:8000"

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: "POST",
      body: formData,
    })

    console.log("Login response status:", response.status)

    const data = await response.json()

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Login API Route Error:", error)
    return Response.json({ detail: "Server xatosi", error: error.message }, { status: 500 })
  }
}
