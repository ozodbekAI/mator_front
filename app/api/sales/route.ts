export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const skip = searchParams.get("skip") || "0"
    const limit = searchParams.get("limit") || "100"
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${process.env.API_BASE_URL}/sales?skip=${skip}&limit=${limit}`, {
      headers: {
        Authorization: authHeader || "",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    return Response.json({ detail: "Server xatosi" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${process.env.API_BASE_URL}/sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader || "",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return Response.json(data)
    } else {
      return Response.json(data, { status: response.status })
    }
  } catch (error) {
    return Response.json({ detail: "Server xatosi" }, { status: 500 })
  }
}
