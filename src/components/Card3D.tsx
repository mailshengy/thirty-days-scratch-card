"use client";
import { useEffect, useRef } from "react";

type Props = { children: React.ReactNode };

export default function Card3D({ children }: Props) {
  const inner = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const card = inner.current!;
    function size() {
      const isMobile = window.innerWidth < 480;
      const maxW = isMobile ? 520 : 560;
      const minW = isMobile ? 260 : 360;
      const vw = Math.min(window.innerWidth * 0.92, maxW);
      const width = Math.max(minW, vw);
      const ratio = isMobile ? 1.9 : 1.6; // taller on mobile so 30 tiles fit
      const height = Math.round(width * ratio);
      card.style.width = width + "px";
      card.style.height = height + "px";
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(document.body);
    window.addEventListener("resize", size);
    return () => { ro.disconnect(); window.removeEventListener("resize", size); };
  }, []);

  function onMove(e: React.MouseEvent) {
    const el = inner.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -10;
    const ry = ((x / r.width) - 0.5) * 14;
    el.style.setProperty("transform", `rotateX(${rx}deg) rotateY(${ry}deg)`);
    el.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    el.style.setProperty("--my", `${(y / r.height) * 100}%`);
  }
  function onLeave() {
    const el = inner.current!;
    el.style.transform = `rotateX(0deg) rotateY(0deg)`;
  }

  return (
    <div className="relative mx-auto" style={{ perspective: 1200 }}>
      <div
        ref={inner}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="card-3d card-surface relative overflow-hidden"
      >
        <div className="card-3d__shine" />
        {children}
      </div>
    </div>
  );
}
