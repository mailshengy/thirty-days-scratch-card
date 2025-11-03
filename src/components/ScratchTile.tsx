"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  id: number;
  quote: string;
  revealedAt: string | null;
  locked: boolean;
  onRevealed: () => void;
};

const SCRATCH_THRESHOLD = 50; // %

function formatRevealed(iso: string) {
  const dt = new Date(iso);
  const date = dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  const time = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
  return `- Revealed on ${date} ${time}`;
}

export default function ScratchTile({ id, quote, revealedAt, locked, onRevealed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const wrapRef   = useRef<HTMLDivElement|null>(null);
  const [revealed,setRevealed] = useState(Boolean(revealedAt));

  useEffect(()=> setRevealed(Boolean(revealedAt)), [revealedAt]);

  useEffect(()=>{
    if(revealed) return;
    const canvas = canvasRef.current!, wrap = wrapRef.current!;
    const ctx = canvas.getContext("2d")!;

    function resize(){
      const r = wrap.getBoundingClientRect();
      const dpr = Math.max(1, devicePixelRatio || 1);
      canvas.width = Math.round(r.width*dpr);
      canvas.height= Math.round(r.height*dpr);
      canvas.style.width  = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.resetTransform?.(); ctx.scale(dpr,dpr);
      drawFoil(r.width, r.height);
      ctx.globalCompositeOperation="destination-out";
      ctx.lineCap="round"; ctx.lineJoin="round";
      ctx.lineWidth=Math.max(12, Math.min(r.width,r.height)*0.18);
    }
    function drawFoil(w:number,h:number){
      ctx.globalCompositeOperation="source-over";
      ctx.clearRect(0,0,w,h);
      const g = ctx.createLinearGradient(0,0,w,h);
      g.addColorStop(0,"#cfd2d6"); g.addColorStop(1,"#aeb2b6");
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.fillStyle="rgba(255,255,255,.14)"; ctx.fillRect(0,0,w,h);
      ctx.fillStyle="rgba(0,0,0,.04)"; for(let i=1;i<=4;i++) ctx.fillRect(0,(i*h)/5,w,1);
    }

    let drawing=false, last:{x:number;y:number}|null=null;
    const pos=(e:any)=>{ const r=canvas.getBoundingClientRect(); const t=e.touches?.[0]; const x=(t?.clientX??e.clientX)-r.left; const y=(t?.clientY??e.clientY)-r.top; return {x,y}; };
    const down=(e:any)=>{ if(locked){ return; } drawing=true; last=pos(e); dot(last.x,last.y); e.preventDefault?.(); };
    const move=(e:any)=>{ if(!drawing) return; const p=pos(e); line(last!.x,last!.y,p.x,p.y); last=p; e.preventDefault?.(); };
    const up  =()=>{ if(!drawing) return; drawing=false; checkReveal(); };

    function dot(x:number,y:number){ ctx.beginPath(); ctx.arc(x,y,ctx.lineWidth*.5,0,Math.PI*2); ctx.fill(); }
    function line(x1:number,y1:number,x2:number,y2:number){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }

    function checkReveal(){
      const img=ctx.getImageData(0,0,canvas.width,canvas.height);
      const total=img.data.length/4; let tr=0;
      for(let i=3;i<img.data.length;i+=4) if(img.data[i]===0) tr++;
      if((tr/total)*100>=SCRATCH_THRESHOLD){
        setRevealed(true); onRevealed();
        canvas.style.transition="opacity .45s"; canvas.style.opacity="0";
        setTimeout(()=> canvas.style.display="none", 460);
      }
    }

    resize();
    const ro=new ResizeObserver(resize); ro.observe(wrap);
    canvas.addEventListener("pointerdown",down,{passive:false});
    window .addEventListener("pointermove",move,{passive:false});
    window .addEventListener("pointerup",up,{passive:false});
    canvas.addEventListener("touchstart",down,{passive:false});
    canvas.addEventListener("touchmove", move,{passive:false});
    canvas.addEventListener("touchend",  up,{passive:false});

    return ()=>{ ro.disconnect();
      canvas.removeEventListener("pointerdown",down);
      window .removeEventListener("pointermove",move);
      window .removeEventListener("pointerup",up);
      canvas.removeEventListener("touchstart",down);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend",  up);
    };
  },[revealed,locked]);

  return (
    <div
      ref={wrapRef}
      className="relative h-[156px] w-[112px] select-none rounded-xl text-slate-100 [background:linear-gradient(180deg,#0b1b3a_0%,#102b56_100%)] shadow"
      aria-live="polite"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center px-2 text-center">
        <div className="font-quote text-[12px] leading-4 md:text-[13px]">{`"${quote}"`}</div>
        <div className="mt-1 text-[10px] md:text-[11px] font-semibold opacity-75">
          {revealedAt ? formatRevealed(revealedAt) : ""}
        </div>
      </div>
      {!revealed && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full touch-none" />}
    </div>
  );
}
