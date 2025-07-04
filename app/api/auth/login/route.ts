export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const response = await fetch(`${process.env.API_BASE_URL}/token`, {
      method: "POST",
      body: formData,
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
