"use client";
import { useRef } from "react";

type Props = { children: React.ReactNode; width?: number; height?: number; };

export default function Card3D({ children, width = 600, height = 900 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current!;
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
    const el = ref.current!;
    el.style.transform = `rotateX(0deg) rotateY(0deg)`;
  }

  return (
    <div className="relative mx-auto" style={{ perspective: 1200 }}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="card-3d card-surface relative overflow-hidden"
        style={{ width, height }}
      >
        <div className="card-3d__shine" />
        {children}
      </div>
    </div>
  );
}
