export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const path = url.pathname
    const method = request.method

    // ROUTER
    if (path === "/health") {
      return json({status: "ok", service: "dunia-digital-api"})
    }

    if (path === "/create-order" && method === "POST") {
      return createOrder(request, env)
    }

    if (path === "/check-license") {
      return checkLicense(url, env)
    }

    if (path === "/download") {
      return getDownload(url, env)
    }

    return json({error: "Endpoint not found"}, 404)
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json"
    }
  })
}

// =============================
// CREATE ORDER
// =============================

async function createOrder(request, env) {

  const body = await request.json()

  const orderId = crypto.randomUUID()
  const licenseKey = generateLicense()

  const orderData = {
    id: orderId,
    email: body.email,
    product: body.product,
    license: licenseKey,
    created_at: Date.now()
  }

  await env.ORDERS.put(orderId, JSON.stringify(orderData))
  await env.LICENSES.put(licenseKey, JSON.stringify(orderData))

  return json({
    success: true,
    order_id: orderId,
    license: licenseKey
  })
}

// =============================
// CHECK LICENSE
// =============================

async function checkLicense(url, env) {

  const license = url.searchParams.get("license")

  if (!license) {
    return json({error: "license required"}, 400)
  }

  const data = await env.LICENSES.get(license)

  if (!data) {
    return json({valid: false})
  }

  return json({
    valid: true,
    data: JSON.parse(data)
  })
}

// =============================
// DOWNLOAD PRODUCT
// =============================

async function getDownload(url, env) {

  const license = url.searchParams.get("license")

  if (!license) {
    return json({error: "license required"}, 400)
  }

  const data = await env.LICENSES.get(license)

  if (!data) {
    return json({error: "invalid license"}, 403)
  }

  const order = JSON.parse(data)

  const downloadLink = await env.DOWNLOADS.get(order.product)

  if (!downloadLink) {
    return json({error: "product not found"}, 404)
  }

  return json({
    product: order.product,
    download: downloadLink
  })
}

// =============================
// GENERATE LICENSE
// =============================

function generateLicense() {

  const part = () =>
    Math.random().toString(36).substring(2, 6).toUpperCase()

  return `DD-${part()}-${part()}-${part()}`
}
