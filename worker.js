export default {
  async fetch(request, env) {

    const url = new URL(request.url)

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "ok",
        service: "dunia-digital-api"
      }), {
        headers: { "Content-Type": "application/json" }
      })
    }

    if (url.pathname === "/test-order") {

      await env.PESANAN.put("order001", "order test")

      const data = await env.PESANAN.get("order001")

      return new Response("Data order: " + data)

    }

    return new Response("Dunia Digital API aktif")
  }
}
