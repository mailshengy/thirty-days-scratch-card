"use client";
import { useEffect, useMemo, useState } from "react";
import ScratchTile from "./ScratchTile";

const NUM_TILES = 30;
const STORAGE_KEY = "scratchcard_state_v7";
type State = { scratched: Record<number,{ ts:string; quote:string }>; last: string|null; };

const QUOTES = [
  "Keep it up!","Nice work!","Well done!","Small wins add up!","You're on a streak!",
  "Keep pushing!","One step at a time!","Great effort!","Stay consistent!","Progress is progress!",
  "You got this!","Proud of you!","Another day, another win!","Keep the momentum!","You're doing great!",
  "Make today count!","Little by little!","Stay curious!","Keep showing up!","Celebrate small wins!",
  "Focus on progress!","Be kind to yourself!","Build the habit!","Consistency wins!","Momentum matters!",
  "Tiny steps, big change!","Hold the line!","You've got momentum!","Keep the spark alive!","Forward and upward!"
];

function todayStr() {
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function loadState(): State { try{ const raw=localStorage.getItem(STORAGE_KEY); return raw?JSON.parse(raw):{scratched:{},last:null}; }catch{ return {scratched:{},last:null}; } }
function saveState(s: State){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

export default function ScratchGrid() {
  const [state,setState]=useState<State>({scratched:{},last:null});
  useEffect(()=>{ setState(loadState()); },[]);
  const lockedToday = state.last === todayStr();
  const order = useMemo(()=> Array.from({length:NUM_TILES},(_,i)=>i+1),[]);

  const handleRevealed = (id:number, quote:string, tsISO:string)=>{
    setState(prev=>{
      const next = { scratched:{...prev.scratched,[id]:{ts:tsISO, quote}}, last: todayStr() };
      saveState(next);
      return next;
    });
  };

  return (
    <div className="grid grid-cols-3 gap-3.5 px-5 pb-6 pt-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 md:gap-4">
      {order.map(id=>{
        const persisted = state.scratched[id] || null;
        const defaultQuote = QUOTES[(id-1) % QUOTES.length];
        return (
          <ScratchTile
            key={id}
            id={id}
            quote={persisted?.quote || defaultQuote}
            revealedAt={persisted?.ts || null}
            locked={lockedToday && !persisted}
            onRevealed={(ts)=>handleRevealed(id, persisted?.quote || defaultQuote, ts)}
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
      onClick={()=>{
        const pw = prompt("Enter password to reset:");
        if (pw === "reset") {
          localStorage.removeItem(STORAGE_KEY);
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
