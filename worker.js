export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // Health check
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "ok",
        service: "dunia-digital-api"
      }), { headers: { "Content-Type": "application/json" }})
    }

    // Test KV order
    if (url.pathname === "/test-order") {
      await env.PESANAN.put("order001", "order test")
      const data = await env.PESANAN.get("order001")
      return new Response("Data order: " + data)
    }

    // Endpoint create order
    if (url.pathname === "/create-order") {
      const orderId = "order_" + Date.now()
      await env.PESANAN.put(orderId, JSON.stringify({status: "new", created: Date.now()}))
      return new Response(JSON.stringify({success: true, orderId}), { headers: { "Content-Type": "application/json" }})
    }

    return new Response("Dunia Digital API aktif")
  }
}
