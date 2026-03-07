export default {
  async fetch(request, env) {

    await env.ORDERS.put("test-order", "order pertama")

    const data = await env.ORDERS.get("test-order")

    return new Response("Data KV: " + data)

  }
}
