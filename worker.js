export default {
  async fetch(request, env) {

    const url = new URL(request.url);

    // ==============================
    // CREATE ORDER
    // ==============================

    if (url.pathname === "/create-order" && request.method === "POST") {

      const data = await request.json();

      const orderId = "order_" + Date.now();

      const order = {

        orderId,
        email: data.email,
        productId: data.productId,
        fileId: data.fileId,
        status: "pending",
        createdAt: Date.now()

      };

      await env.ORDERS.put(orderId, JSON.stringify(order));

      return Response.json({
        sukses: true,
        orderId
      });

    }

    // ==============================
    // ACTIVATE LICENSE (setelah bayar)
    // ==============================

    if (url.pathname === "/activate-license" && request.method === "POST") {

      const data = await request.json();

      const order = await env.ORDERS.get(data.orderId, "json");

      if (!order) {
        return new Response("Order tidak ditemukan", { status: 404 });
      }

      const licenseId = "license_" + crypto.randomUUID();

      const token = "token_" + crypto.randomUUID();

      const license = {

        licenseId,
        email: order.email,
        productId: order.productId,
        fileId: order.fileId,

        downloadLimit: 3,
        downloadCount: 0,

        expireAt: Date.now() + (3 * 24 * 60 * 60 * 1000),

        createdAt: Date.now()

      };

      await env.LICENSES.put(licenseId, JSON.stringify(license));

      await env.LICENSES.put(token, licenseId);

      order.status = "paid";

      await env.ORDERS.put(order.orderId, JSON.stringify(order));

      return Response.json({

        sukses: true,

        downloadUrl:
          url.origin + "/download?token=" + token

      });

    }

    // ==============================
    // DOWNLOAD EBOOK
    // ==============================

    if (url.pathname === "/download") {

      const token = url.searchParams.get("token");

      if (!token) {
        return new Response("Token tidak ada", { status: 400 });
      }

      const licenseId = await env.LICENSES.get(token);

      if (!licenseId) {
        return new Response("Token tidak valid", { status: 403 });
      }

      const license = await env.LICENSES.get(licenseId, "json");

      if (!license) {
        return new Response("License tidak ditemukan", { status: 404 });
      }

      if (Date.now() > license.expireAt) {
        return new Response("Link download expired", { status: 403 });
      }

      if (license.downloadCount >= license.downloadLimit) {
        return new Response("Batas download habis", { status: 403 });
      }

      const pdf = await env.DOWNLOADS.get(license.fileId, "arrayBuffer");

      if (!pdf) {
        return new Response("File ebook tidak ditemukan", { status: 404 });
      }

      license.downloadCount++;

      await env.LICENSES.put(
        licenseId,
        JSON.stringify(license)
      );

      return new Response(pdf, {

        headers: {

          "Content-Type": "application/pdf",
          "Content-Disposition":
            `attachment; filename="${license.fileId}.pdf"`

        }

      });

    }

    // ==============================
    // CEK ORDER
    // ==============================

    if (url.pathname === "/check-order") {

      const orderId = url.searchParams.get("orderId");

      const order = await env.ORDERS.get(orderId, "json");

      if (!order) {
        return new Response("Order tidak ditemukan", { status: 404 });
      }

      return Response.json(order);

    }

    return new Response("Dunia Digital API aktif 🚀");

  }
};
