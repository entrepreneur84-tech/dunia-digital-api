export default {
  async fetch(request) {

    if (request.method === "POST") {

      const data = await request.json()

      return new Response(JSON.stringify({
        status: "order_diterima",
        data: data
      }), {
        headers: { "Content-Type": "application/json" }
      })

    }

    return new Response("API Dunia Digital Aktif")

  }
        }
