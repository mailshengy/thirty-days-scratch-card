"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** portrait ratio; mobile will be a bit taller automatically */
  ratio?: number;
  /** set false to force-disable all tilt */
  enableTilt?: boolean;
};

export default function Card3D({ children, ratio = 1.6, enableTilt = true }: Props) {
  const inner = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ active: boolean; x: number; y: number } | null>(null);
  const [motionReady, setMotionReady] = useState<"unknown" | "enabled" | "denied">("unknown");

  // Responsive sizing (taller on mobile so 30 tiles fit)
  useEffect(() => {
    const card = inner.current!;
    function size() {
      const isMobile = window.innerWidth < 480;
      const maxW = isMobile ? 520 : 560;
      const minW = isMobile ? 260 : 360;
      const vw = Math.min(window.innerWidth * 0.92, maxW);
      const width = Math.max(minW, vw);
      const r = isMobile ? Math.max(1.8, ratio) : ratio;
      const height = Math.round(width * r);
      card.style.width = width + "px";
      card.style.height = height + "px";
    }
    size();
    const ro = new ResizeObserver(size);
    ro.observe(document.body);
    window.addEventListener("resize", size);
    return () => { ro.disconnect(); window.removeEventListener("resize", size); };
  }, [ratio]);

  // Helpers
  function setTilt(rx: number, ry: number) {
    const el = inner.current!;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  function resetTilt() {
    const el = inner.current!;
    el.style.transform = `rotateX(0deg) rotateY(0deg)`;
  }
  function updateShine(clientX: number, clientY: number) {
    const el = inner.current!;
    const r = el.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    el.style.setProperty("--mx", `${(x / r.width) * 100}%`);
    el.style.setProperty("--my", `${(y / r.height) * 100}%`);
  }

  // Desktop mouse hover (kept)
  function onMouseMove(e: React.MouseEvent) {
    if (!enableTilt) return;
    if (window.matchMedia("(pointer: coarse)").matches) return; // skip on touch devices
    const el = inner.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -10;
    const ry = ((x / r.width) - 0.5) * 14;
    setTilt(rx, ry);
    updateShine(e.clientX, e.clientY);
  }
  function onMouseLeave() {
    if (!enableTilt) return;
    resetTilt();
  }

  // Touch-drag tilt (works everywhere)
  useEffect(() => {
    if (!enableTilt) return;
    const el = inner.current!;
    const onPointerDown = (e: PointerEvent | TouchEvent) => {
      const t = (e as TouchEvent).touches?.[0] || (e as PointerEvent);
      dragState.current = { active: true, x: t.clientX, y: t.clientY };
    };
    const onPointerMove = (e: PointerEvent | TouchEvent) => {
      if (!dragState.current?.active) return;
      const t = (e as TouchEvent).touches?.[0] || (e as PointerEvent);
      const r = el.getBoundingClientRect();
      // Map relative position to angles
      const x = (t.clientX - r.left) / r.width;
      const y = (t.clientY - r.top) / r.height;
      const rx = (0.5 - y) * 14; // up/down
      const ry = (x - 0.5) * 18; // left/right
      setTilt(rx, ry);
      updateShine(t.clientX, t.clientY);
      e.preventDefault?.();
    };
    const end = () => { dragState.current = null; resetTilt(); };

    el.addEventListener("touchstart", onPointerDown, { passive: true });
    el.addEventListener("touchmove", onPointerMove as any, { passive: false });
    el.addEventListener("touchend", end, { passive: true });
    el.addEventListener("pointerdown", onPointerDown as any, { passive: true });
    window.addEventListener("pointermove", onPointerMove as any, { passive: false });
    window.addEventListener("pointerup", end, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onPointerDown as any);
      el.removeEventListener("touchmove", onPointerMove as any);
      el.removeEventListener("touchend", end as any);
      el.removeEventListener("pointerdown", onPointerDown as any);
      window.removeEventListener("pointermove", onPointerMove as any);
      window.removeEventListener("pointerup", end as any);
    };
  }, [enableTilt]);

  // Optional motion-sensor tilt (user-opt in on iOS)
  async function enableMotion() {
    try {
      const anyWindow = window as any;
      if (typeof anyWindow.DeviceMotionEvent?.requestPermission === "function") {
        const res = await anyWindow.DeviceMotionEvent.requestPermission();
        if (res !== "granted") return setMotionReady("denied");
      }
      setMotionReady("enabled");
    } catch {
      setMotionReady("denied");
    }
  }

  useEffect(() => {
    if (!enableTilt || motionReady !== "enabled") return;
    const handle = (e: DeviceOrientationEvent) => {
      // gamma: left/right (-90..90), beta: front/back (-180..180)
      const gamma = e.gamma ?? 0; // x-tilt
      const beta = e.beta ?? 0;   // y-tilt
      const ry = (gamma / 45) * 14; // scale into our 3D range
      const rx = (-beta / 60) * 10; // negative so device tilt “feels” right
      setTilt(rx, ry);
    };
    window.addEventListener("deviceorientation", handle, true);
    return () => window.removeEventListener("deviceorientation", handle as any, true);
  }, [motionReady, enableTilt]);

  // Reduced-motion users: disable tilt entirely
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="relative mx-auto" style={{ perspective: 1200 }}>
      <div
        ref={inner}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className={`card-3d card-surface relative overflow-hidden ${
          (!enableTilt || reduceMotion) ? "animate-shine" : ""
        }`}
      >
        <div className="card-3d__shine" />
        {/* Motion toggle only shown on touch devices if permission is needed */}
        {enableTilt && motionReady !== "enabled" && typeof window !== "undefined" &&
          window.matchMedia?.("(pointer: coarse)").matches && (
          <button
            onClick={enableMotion}
            className="absolute right-2 top-2 rounded-md bg-white/50 px-2 py-1 text-[10px] font-semibold text-slate-900 backdrop-blur hover:bg-white/70"
          >
            Enable Motion Tilt
          </button>
        )}
        {children}
      </div>
    </div>
  );
}