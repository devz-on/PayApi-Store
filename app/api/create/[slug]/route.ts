import { NextRequest } from "next/server";
import { badRequest, corsHeaders, fetchWithTimeout, jsonResponse } from "@/lib/http";
import connect from "@/lib/mongo";
import { ObjectId } from "mongodb";

const BASE = "https://pay.devxjin.site";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest, ctx: { params: { slug: string } }) {
  try {
    const slug = ctx.params.slug; // expected "<apiKey>&<amount>"
    const [apiKey, amountStr] = slug.split("&");
    if (!apiKey || !amountStr)
      return badRequest("Path must be /api/create/<api_key>&<amount>");

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0)
      return badRequest("Invalid amount", { amount: amountStr });

    // ✅ Connect to MongoDB
    const { db } = await connect();

    // ✅ Find API key
    const keyDoc = await db.collection("apikeys").findOne({ key: apiKey });
    if (!keyDoc)
      return jsonResponse({ success: false, error: "Invalid API key" }, { status: 403 });

    // ✅ Check expiry
    if (new Date(keyDoc.expiresAt) < new Date()) {
      return jsonResponse({ success: false, error: "API key expired" }, { status: 403 });
    }

    // ✅ Detect remaining (root or meta)
    const remaining =
      keyDoc.remaining ??
      keyDoc.meta?.remaining ??
      0;

    if (remaining <= 0) {
      return jsonResponse({ success: false, error: "Usage limit reached" }, { status: 429 });
    }

    // ✅ Decrement correct field
    const updateField = keyDoc.remaining !== undefined ? "remaining" : "meta.remaining";

    await db.collection("apikeys").updateOne(
      { _id: new ObjectId(keyDoc._id) },
      { $inc: { [updateField]: -1 } }
    );

    // ✅ Call upstream API
    const upstream = `${BASE}/create/api_key?key=${encodeURIComponent(apiKey)}&amount=${encodeURIComponent(
      String(amount)
    )}`;

    const createRes = await fetchWithTimeout(upstream, { timeoutMs: 60000 });
    if (!createRes.ok) {
      return jsonResponse({ success: false, error: "Upstream error", status: createRes.status });
    }

    const payload = await createRes.json();
    if (!payload?.success) {
      return jsonResponse(
        { success: false, error: "Create failed", detail: payload },
        { status: 502 }
      );
    }

    const linkId: string = payload.payment_id || payload.link_id;
    const qrPath: string = payload.qr_image_url;
    if (!linkId || !qrPath) {
      return jsonResponse(
        { success: false, error: "Malformed upstream response", detail: payload },
        { status: 502 }
      );
    }

    // ✅ Fetch QR image
    const qrUrl = `${BASE}${qrPath}`;
    const imgRes = await fetchWithTimeout(qrUrl, { timeoutMs: 60000 });
    if (!imgRes.ok) {
      return jsonResponse(
        { success: false, error: "QR fetch failed", status: imgRes.status },
        { status: 502 }
      );
    }

    const buffer = await imgRes.arrayBuffer();

    // ✅ Send PNG response
    return new Response(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename=\"${linkId}.png\"`,
        "Cache-Control": "no-store",
        ...corsHeaders(),
      },
    });
  } catch (err: any) {
    console.error("❌ Create route error:", err);
    return jsonResponse({ success: false, error: "Server error" }, { status: 500 });
  }
}
