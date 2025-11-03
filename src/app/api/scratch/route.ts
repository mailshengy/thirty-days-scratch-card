import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  const { tileIndex, quote } = await req.json();
  if (!tileIndex || tileIndex < 1 || tileIndex > 30) {
    return NextResponse.json({ error: "invalid tile" }, { status: 400 });
  }

  // Enforce global one-per-day rule at app layer
  const today = new Date().toDateString();

  const { data: existing, error: selErr } = await supabase
    .from("tile_reveals")
    .select("revealed_at")
    .order("revealed_at", { ascending: false })
    .limit(30);

  if (selErr) return NextResponse.json({ error: selErr.message }, { status: 500 });

  if ((existing ?? []).some(r => r.revealed_at && new Date(r.revealed_at as any).toDateString() === today)) {
    return NextResponse.json({ ok: false, reason: "already_scratched_today" }, { status: 409 });
  }

  const { error } = await supabase
    .from("tile_reveals")
    .upsert({ tile_index: tileIndex, quote }, { onConflict: "tile_index" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { error } = await supabase.from("tile_reveals").delete().gte("tile_index", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
