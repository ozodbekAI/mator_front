export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Environment variable'ni tekshirish
    const API_BASE_URL = process.env.API_BASE_URL

    console.log("Environment check:")
    console.log("API_BASE_URL from env:", API_BASE_URL)
    console.log(
      "All env vars:",
      Object.keys(process.env).filter((key) => key.includes("API")),
    )

    if (!API_BASE_URL) {
      return Response.json(
        {
          detail: "API_BASE_URL environment variable not set",
          available_vars: Object.keys(process.env).filter((key) => key.includes("API")),
        },
        { status: 500 },
      )
    }

    console.log("Making request to:", `${API_BASE_URL}/token`)

    const response = await fetch(`${API_BASE_URL}/token`, {
      method: "POST",
      body: formData,
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    const data = await response.json()

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    console.error("Login API Route Error:", error)
    return Response.json(
      {
        detail: "Server xatosi",
        error: error.message,
        stack: error.stack,
      },
      { status: 500 },
    )
  }
}
