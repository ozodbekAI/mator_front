export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")

    const response = await fetch(`${process.env.API_BASE_URL}/users/me`, {
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
