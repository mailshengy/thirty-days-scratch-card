"use client";
import { useEffect, useMemo, useState } from "react";
import ScratchTile from "./ScratchTile";
import { supabase } from "@/lib/supabaseClient";

const NUM_TILES = 30;
const QUOTES = [
  "Keep it up!","Nice work!","Well done!","Small wins add up!","You're on a streak!",
  "Keep pushing!","One step at a time!","Great effort!","Stay consistent!","Progress is progress!",
  "You got this!","Proud of you!","Another day, another win!","Keep the momentum!","You're doing great!",
  "Make today count!","Little by little!","Stay curious!","Keep showing up!","Celebrate small wins!",
  "Focus on progress!","Be kind to yourself!","Build the habit!","Consistency wins!","Momentum matters!",
  "Tiny steps, big change!","Hold the line!","You've got momentum!","Keep the spark alive!","Forward and upward!"
];

type Reveal = { tile_index:number; quote:string; revealed_at:string };

export default function ScratchGrid() {
  const [reveals, setReveals] = useState<Record<number, Reveal>>({});
  const [lockedToday, setLockedToday] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase
        .from("tile_reveals")
        .select("tile_index, quote, revealed_at")
        .order("revealed_at", { ascending: true });

      if (error) { console.error(error); return; }
      if (!mounted) return;

      const map: Record<number, Reveal> = {};
      (data || []).forEach((r: any) => { map[r.tile_index] = r as Reveal; });
      setReveals(map);

      const today = new Date().toDateString();
      const hasToday = (data || []).some((r: any) => r.revealed_at && new Date(r.revealed_at).toDateString() === today);
      setLockedToday(hasToday);
    })();

    const channel = supabase
      .channel("realtime:tile_reveals")
      .on("postgres_changes", { event: "*", schema: "public", table: "tile_reveals" }, payload => {
        const r = payload.new as any as Reveal;
        if (!r) return;
        setReveals(prev => ({ ...prev, [r.tile_index]: r }));
        if (new Date(r.revealed_at).toDateString() === new Date().toDateString()) {
          setLockedToday(true);
        }
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const handleRevealed = async (id:number, quote:string) => {
    const today = new Date().toDateString();
    const hasToday = Object.values(reveals).some(r => new Date(r.revealed_at).toDateString() === today);
    if (hasToday) { setLockedToday(true); return; }

    const res = await fetch("/api/scratch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tileIndex: id, quote })
    });
    if (!res.ok) {
      const j = await res.json().catch(()=>({}));
      alert("Failed to save scratch" + (j.detail ? `: ${j.detail}` : ""));
    }
  };

  const order = useMemo(() => Array.from({length: NUM_TILES}, (_, i) => i + 1), []);

  // XS: 5 cols, SM: 5 cols, MD+: 6 cols -> Always <= 6 rows for 30 tiles
  return (
    <div className="grid grid-cols-5 gap-1.5 px-2 pb-3 pt-2 sm:grid-cols-5 sm:gap-2 md:grid-cols-6 md:gap-2.5 lg:gap-3">
      {order.map((id) => {
        const persisted = reveals[id] || null;
        const defaultQuote = QUOTES[(id - 1) % QUOTES.length];
        return (
          <ScratchTile
            key={id}
            id={id}
            quote={persisted?.quote || defaultQuote}
            revealedAt={persisted?.revealed_at || null}
            locked={lockedToday && !persisted}
            onRevealed={() => handleRevealed(id, persisted?.quote || defaultQuote)}
          />
        );
      })}
    </div>
  );
}

/* Password-protected reset button ("New Card") */
export function NewCardButton() {
  return (
    <button
      className="rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-slate-100 hover:bg-white/15 transition"
      onClick={async ()=>{
        const pw = prompt("Enter password to reset:");
        if (pw === "reset") {
          const res = await fetch("/api/scratch", { method: "DELETE" });
          if (!res.ok) { alert("Failed to reset"); return; }
          location.reload();
        } else if (pw !== null) {
          alert("Wrong password");
        }
      }}
    >
      New Card
    </button>
  );
}
