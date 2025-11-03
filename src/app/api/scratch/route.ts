import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const { tileIndex, quote } = await req.json();
  if (!tileIndex || tileIndex < 1 || tileIndex > 30) {
    return NextResponse.json({ error: "invalid tile" }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error } = await supabase.from("tile_reveals").insert({
    user_id: user.id,
    tile_index: tileIndex,
    quote
  });

  if (error) {
    return NextResponse.json({ ok: false, reason: "already_scratched_today", detail: error.message }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}
