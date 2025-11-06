// app/api/auth/check/route.ts
import { NextRequest } from "next/server";
import connect from "@/lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams;
    const field = q.get("field");
    const value = (q.get("value") || "").trim();

    if (!field || !value) return new Response(JSON.stringify({ error: "Missing params" }), { status: 400 });

    if (!["email", "username", "phone"].includes(field)) return new Response(JSON.stringify({ error: "Invalid field" }), { status: 400 });

    const { db } = await connect();
    const query: any = {};
    if (field === "email") query.email = value.toLowerCase();
    else if (field === "username") query.username = value.toLowerCase();
    else query.phone = value.replace(/\s+/g, "");

    const existing = await db.collection("users").findOne(query);
    return new Response(JSON.stringify({ available: !existing }), { status: 200 });
  } catch (err) {
    console.error("Availability check error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}
