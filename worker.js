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

      await env.ORDERS.put("order_001", "test order")

      const data = await env.ORDERS.get("order_001")

      return new Response("Order data: " + data)

    }

    return new Response("Dunia Digital API aktif")
  }
}
