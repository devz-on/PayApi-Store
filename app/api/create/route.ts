import { NextRequest } from "next/server";
import { badRequest, corsHeaders, fetchWithTimeout, jsonResponse } from "@/lib/http";
import connect from "@/lib/mongo";
import { ObjectId } from "mongodb";

const BASE = "https://pay.devxjin.site";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiKey = searchParams.get("api_key") || searchParams.get("key");
    const amountStr = searchParams.get("amount");
    const returnJson = searchParams.get("format") === "json";

    if (!apiKey) return badRequest("Missing api_key");
    if (!amountStr) return badRequest("Missing amount");

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0)
      return badRequest("Invalid amount", { amount: amountStr });

    // ✅ Connect to MongoDB
    const { db } = await connect();

    // ✅ Verify API key
    const keyDoc = await db.collection("apikeys").findOne({ key: apiKey });
    if (!keyDoc)
      return jsonResponse({ success: false, error: "Invalid API key" }, { status: 403 });

    // ✅ Check expiry
    if (new Date(keyDoc.expiresAt) < new Date()) {
      return jsonResponse({ success: false, error: "API key expired" }, { status: 403 });
    }

    // ✅ Check usage remaining
    const remaining = keyDoc.meta?.remaining ?? 0;
    if (remaining <= 0) {
      return jsonResponse({ success: false, error: "Usage limit reached" }, { status: 429 });
    }

    // ✅ Decrement 1 from remaining
    await db.collection("apikeys").updateOne(
      { _id: new ObjectId(keyDoc._id) },
      { $inc: { "meta.remaining": -1 } }
    );

    // ✅ Forward to upstream
    const upstream = `${BASE}/create/api_key?key=${encodeURIComponent(
      apiKey
    )}&amount=${encodeURIComponent(String(amount))}`;

    const createRes = await fetchWithTimeout(upstream, { timeoutMs: 60000 });
    if (!createRes.ok) {
      return jsonResponse({
        success: false,
        error: "Upstream error",
        status: createRes.status,
      });
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

    // ✅ Return JSON mode
    if (returnJson) {
      return jsonResponse({
        success: true,
        link_id: linkId,
        qr_png_url: `${req.nextUrl.origin}/api/create/${encodeURIComponent(
          apiKey
        )}&${encodeURIComponent(String(amount))}`, // streamable QR
        upstream_qr_path: qrPath,
        upstream_payment_link: payload.payment_link ?? null,
        remaining_after: remaining - 1,
      });
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
        "Content-Disposition": `inline; filename="${linkId}.png"`,
        "Cache-Control": "no-store",
        ...corsHeaders(),
      },
    });
  } catch (err: any) {
    console.error("❌ Create route error:", err);
    return jsonResponse({ success: false, error: "Server error" }, { status: 500 });
  }
}
