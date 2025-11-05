import { NextRequest } from "next/server";
import { badRequest, corsHeaders, fetchWithTimeout, jsonResponse, stripPngExt } from "@/lib/http";

const BASE = "https://pay.devxjin.site";

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() });
}

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const raw = ctx.params.id;
  if (!raw) return badRequest("Missing link id");

  const linkId = stripPngExt(decodeURIComponent(raw));

  // Allow also if user mistakenly passes pay_ id; just forward upstream.
  const upstream = `${BASE}/check/${encodeURIComponent(linkId)}`;
  const res = await fetchWithTimeout(upstream, { timeoutMs: 30000 });
  const status = res.status;

  let body: any = null;
  try {
    body = await res.json();
  } catch (e) {
    return jsonResponse({ success: false, error: "Non-JSON upstream response", status }, { status: 502 });
  }

  // 🧹 Remove phone number (if present)
  if (body && typeof body === "object" && "phone" in body) {
    delete body.phone;
  }

  // Also clean nested payments if they accidentally include phone
  if (Array.isArray(body.payments)) {
    body.payments = body.payments.map((p: any) => {
      if (p && typeof p === "object" && "phone" in p) delete p.phone;
      return p;
    });
  }

  // ✅ Return cleaned response
  return jsonResponse(
    {
      via: "devx-pay-wrapper",
      statusCode: status,
      ...body,
    },
    { status }
  );
}
