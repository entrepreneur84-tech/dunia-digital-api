export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    // =======================
    // Health check
    // =======================
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({
        status: "ok",
        service: "dunia-digital-api"
      }), { headers: { "Content-Type": "application/json" }})
    }

    // =======================
    // Test KV order
    // =======================
    if (url.pathname === "/test-order") {
      try {
        await env.ORDERS.put("order001", "order test")
        const data = await env.ORDERS.get("order001")
        return new Response("Data order: " + data)
      } catch (err) {
        return new Response(JSON.stringify({success: false, error: err.message}), {
          headers: { "Content-Type": "application/json" },
          status: 500
        })
      }
    }

    // =======================
    // Create Order
    // =======================
    if (url.pathname === "/create-order") {
      try {
        const orderId = "order_" + Date.now()
        await env.ORDERS.put(orderId, JSON.stringify({status: "new", created: Date.now()}))
        return new Response(JSON.stringify({success: true, orderId}), {
          headers: { "Content-Type": "application/json" }
        })
      } catch (err) {
        return new Response(JSON.stringify({success: false, error: err.message}), {
          headers: { "Content-Type": "application/json" },
          status: 500
        })
      }
    }

    // =======================
    // Generate License
    // =======================
    if (url.pathname === "/generate-license") {
      try {
        const params = url.searchParams
        const orderId = params.get("orderId")
        if (!orderId) throw new Error("orderId required")
        
        const licenseKey = "LIC-" + Math.random().toString(36).substring(2, 12).toUpperCase()
        await env.LICENSES.put(licenseKey, JSON.stringify({orderId, created: Date.now(), status: "active"}))
        return new Response(JSON.stringify({success: true, licenseKey}), {
          headers: { "Content-Type": "application/json" }
        })
      } catch (err) {
        return new Response(JSON.stringify({success: false, error: err.message}), {
          headers: { "Content-Type": "application/json" },
          status: 500
        })
      }
    }

    // =======================
    // Verify License
    // =======================
    if (url.pathname === "/verify-license") {
      try {
        const params = url.searchParams
        const licenseKey = params.get("license")
        if (!licenseKey) throw new Error("license required")
        
        const data = await env.LICENSES.get(licenseKey, { type: "json" })
        if (!data) return new Response(JSON.stringify({valid: false}), { headers: { "Content-Type": "application/json" }})
        
        return new Response(JSON.stringify({valid: true, license: data}), { headers: { "Content-Type": "application/json" }})
      } catch (err) {
        return new Response(JSON.stringify({success: false, error: err.message}), {
          headers: { "Content-Type": "application/json" },
          status: 500
        })
      }
    }

    // =======================
    // Download
    // =======================
    if (url.pathname === "/download") {
      try {
        const params = url.searchParams
        const licenseKey = params.get("license")
        if (!licenseKey) throw new Error("license required")
        
        const license = await env.LICENSES.get(licenseKey, { type: "json" })
        if (!license || license.status !== "active") throw new Error("Invalid license")
        
        const fileId = params.get("file")
        if (!fileId) throw new Error("file id required")
        
        const fileData = await env.DOWNLOADS.get(fileId)
        if (!fileData) throw new Error("File not found")
        
        return new Response(fileData, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileId}.pdf"`
          }
        })
      } catch (err) {
        return new Response(JSON.stringify({success: false, error: err.message}), {
          headers: { "Content-Type": "application/json" },
          status: 400
        })
      }
    }

    // =======================
    // Default response
    // =======================
    return new Response("Dunia Digital API aktif")
  }
}
