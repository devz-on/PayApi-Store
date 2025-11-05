import { NextRequest } from "next/server";
import { badRequest, corsHeaders, fetchWithTimeout, jsonResponse } from "@/lib/http";

const BASE = "https://pay.devxjin.site";
const FIXED_PHONE = "9350897403";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get("api_key") || searchParams.get("key");
  const amountStr = searchParams.get("amount");
  const returnJson = searchParams.get("format") === "json";

  if (!apiKey) return badRequest("Missing api_key");
  if (!amountStr) return badRequest("Missing amount");

  const amount = Number(amountStr);
  if (!Number.isFinite(amount) || amount <= 0) return badRequest("Invalid amount", { amount: amountStr });

  const upstream = `${BASE}/create/api_key?key=${encodeURIComponent(apiKey)}&amount=${encodeURIComponent(
    String(amount)
  )}&phone=${encodeURIComponent(FIXED_PHONE)}`;

  const createRes = await fetchWithTimeout(upstream, { timeoutMs: 60000 });
  if (!createRes.ok) {
    return jsonResponse({ success: false, error: "Upstream error", status: createRes.status });
  }

  const payload = await createRes.json();
  if (!payload?.success) {
    return jsonResponse({ success: false, error: "Create failed", detail: payload }, { status: 502 });
  }

  const linkId: string = payload.payment_id || payload.link_id; // example shows payment_id is actually plink_...
  const qrPath: string = payload.qr_image_url;
  if (!linkId || !qrPath) {
    return jsonResponse({ success: false, error: "Malformed upstream response", detail: payload }, { status: 502 });
  }

  if (returnJson) {
    return jsonResponse({
      success: true,
      link_id: linkId,
      qr_png_url: `${req.nextUrl.origin}/api/create/${encodeURIComponent(apiKey)}&${encodeURIComponent(
        String(amount)
      )}`, // endpoint that streams PNG
      upstream_qr_path: qrPath,
      upstream_payment_link: payload.payment_link ?? null,
    });
  }

  const qrUrl = `${BASE}${qrPath}`;
  const imgRes = await fetchWithTimeout(qrUrl, { timeoutMs: 60000 });
  if (!imgRes.ok) {
    return jsonResponse({ success: false, error: "QR fetch failed", status: imgRes.status }, { status: 502 });
  }
  const buffer = await imgRes.arrayBuffer();

  return new Response(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `inline; filename="${linkId}.png"`,
      "Cache-Control": "no-store",
      ...corsHeaders(),
    },
  });
}
