import { NextRequest } from "next/server";
import { corsHeaders, fetchWithTimeout, jsonResponse, badRequest } from "@/lib/http";

const BASE = "https://pay.devxjin.site";
const FIXED_PHONE = "9350897403";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest, ctx: { params: { slug: string } }) {
  const slug = ctx.params.slug; // expected "<apiKey>&<amount>"
  const [apiKey, amountStr] = slug.split("&");
  if (!apiKey || !amountStr) return badRequest("Path must be /api/create/<api_key>&<amount>");

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

  const linkId: string = payload.payment_id || payload.link_id;
  const qrPath: string = payload.qr_image_url;
  if (!linkId || !qrPath) {
    return jsonResponse({ success: false, error: "Malformed upstream response", detail: payload }, { status: 502 });
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
