export async function POST(request: Request) {
  try {
    const body = await request.json()

    const API_BASE_URL = process.env.API_BASE_URL

    console.log("Register API - Environment check:")
    console.log("API_BASE_URL:", API_BASE_URL)

    if (!API_BASE_URL) {
      return Response.json(
        {
          detail: "API_BASE_URL environment variable not set",
        },
        { status: 500 },
      )
    }

    console.log("Making request to:", `${API_BASE_URL}/register`)

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    console.log("Register response status:", response.status)

    const data = await response.json()

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Register API Route Error:", error)
    return Response.json(
      {
        detail: "Server xatosi",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
