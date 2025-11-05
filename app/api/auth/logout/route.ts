export async function POST() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Set-Cookie": "token=; Path=/; HttpOnly; Max-Age=0",
      "Content-Type": "application/json",
    },
  });
}
