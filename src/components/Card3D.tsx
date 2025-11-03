"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  ratio?: number;         // portrait aspect; mobile auto-taller
  enableTilt?: boolean;   // set false to fully disable tilt
};

type MotionState = "unknown" | "enabled" | "denied";

export default function Card3D({ children, ratio = 1.6, enableTilt = true }: Props) {
  const inner = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ active: boolean } | null>(null);

  const [isTouch, setIsTouch] = useState(false);
  const [motionReady, setMotionReady] = useState<MotionState>("unknown");

  // ---- Responsive size (taller on mobile so 30 tiles fit)
  useEffect(() => {
    const card = inner.current!;
    function size() {
      const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 480;
      const maxW = isMobile ? 520 : 560;
      const minW = isMobile ? 260 : 360;
      const vw = Math.min(window.innerWidth * 0.92, maxW);
      const width = Math.max(minW, vw);
      const r = isMobile ? Math.max(1.85, ratio) : ratio;
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

  // ---- Environment detection (client-only)
  useEffect(() => {
    setIsTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  // ---- Helpers
  function setTilt(rx: number, ry: number) {
    const el = inner.current!;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  }
  function resetTilt() {
    const el = inner.current!;
    el.style.transform = `rotateX(0deg) rotateY(0deg)`;
  }
  function updateShineFrom(x: number, y: number) {
    const el = inner.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
    el.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
  }

  // ---- Desktop mouse hover tilt
  function onMouseMove(e: React.MouseEvent) {
    if (!enableTilt || isTouch) return;
    const el = inner.current!;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -10;
    const ry = ((x / r.width) - 0.5) * 14;
    setTilt(rx, ry);
    updateShineFrom(e.clientX, e.clientY);
  }
  function onMouseLeave() {
    if (!enableTilt || isTouch) return;
    resetTilt();
  }

  // ---- Touch-drag tilt (works everywhere)
  useEffect(() => {
    if (!enableTilt) return;
    const el = inner.current!;
    const down = (e: PointerEvent | TouchEvent) => {
      drag.current = { active: true };
    };
    const move = (e: PointerEvent | TouchEvent) => {
      if (!drag.current?.active) return;
      const t: any = (e as TouchEvent).touches?.[0] || (e as PointerEvent);
      const rect = el.getBoundingClientRect();
      const x = (t.clientX - rect.left) / rect.width;
      const y = (t.clientY - rect.top) / rect.height;
      const rx = (0.5 - y) * 14;
      const ry = (x - 0.5) * 18;
      setTilt(rx, ry);
      updateShineFrom(t.clientX, t.clientY);
      (e as any).preventDefault?.();
    };
    const up = () => { if (drag.current) drag.current.active = false; resetTilt(); };

    el.addEventListener("pointerdown", down, { passive: true });
    window.addEventListener("pointermove", move as any, { passive: false });
    window.addEventListener("pointerup", up, { passive: true });

    // Touch events (for older browsers)
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchmove", move as any, { passive: false });
    el.addEventListener("touchend", up, { passive: true });

    return () => {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move as any);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchmove", move as any);
      el.removeEventListener("touchend", up);
    };
  }, [enableTilt]);

  // ---- iOS permission flow (fix)
  async function requestMotionPermission() {
    try {
      const w: any = window;

      // iOS 13+ (Safari): try DeviceOrientation first
      if (typeof w.DeviceOrientationEvent?.requestPermission === "function") {
        const res = await w.DeviceOrientationEvent.requestPermission();
        if (res !== "granted") {
          // fallback: some devices grant on DeviceMotion path
          if (typeof w.DeviceMotionEvent?.requestPermission === "function") {
            const res2 = await w.DeviceMotionEvent.requestPermission();
            if (res2 !== "granted") return setMotionReady("denied");
          } else {
            return setMotionReady("denied");
          }
        }
        setMotionReady("enabled");
        return;
      }

      // Some WebViews only expose DeviceMotion request
      if (typeof w.DeviceMotionEvent?.requestPermission === "function") {
        const res = await w.DeviceMotionEvent.requestPermission();
        setMotionReady(res === "granted" ? "enabled" : "denied");
        return;
      }

      // Android & desktop: no prompt; just enable and see if events arrive
      setMotionReady("enabled");
    } catch {
      setMotionReady("denied");
    }
  }

  // ---- Motion listeners once enabled
  useEffect(() => {
    if (!enableTilt || motionReady !== "enabled") return;

    // DeviceOrientation (preferred)
    const onOrient = (e: DeviceOrientationEvent) => {
      // gamma: left/right, beta: front/back
      const gamma = e.gamma ?? 0; // -90..90
      const beta = e.beta ?? 0;   // -180..180
      const ry = (gamma / 45) * 14;
      const rx = (-beta / 60) * 10;
      setTilt(rx, ry);
    };

    // Fallback from devicemotion (use gravity vector)
    const onMotion = (e: DeviceMotionEvent) => {
      const g = e.accelerationIncludingGravity;
      if (!g) return;
      // Normalize and map roughly to angles
      const x = (g.x ?? 0) / 9.81;   // left/right tilt
      const y = (g.y ?? 0) / 9.81;   // front/back
      const ry = x * 14;
      const rx = -y * 10;
      setTilt(rx, ry);
    };

    window.addEventListener("deviceorientation", onOrient, true);
    window.addEventListener("devicemotion", onMotion, true);

    return () => {
      window.removeEventListener("deviceorientation", onOrient as any, true);
      window.removeEventListener("devicemotion", onMotion as any, true);
    };
  }, [motionReady, enableTilt]);

  // Reduced-motion users: disable tilt animation entirely
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

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

        {/* Show the button only on touch devices, before permission is granted */}
        {enableTilt && isTouch && motionReady !== "enabled" && (
          <button
            onClick={requestMotionPermission}
            type="button"
            className="absolute right-2 top-2 rounded-md bg-white/60 px-2 py-1 text-[10px] font-semibold text-slate-900 backdrop-blur hover:bg-white/80 active:scale-[.98]"
          >
            Enable Motion Tilt
          </button>
        )}

        {children}
      </div>
    </div>
  );
}
