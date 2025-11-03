import Card3D from "@/components/Card3D";
import ScratchGrid, { ResetButton } from "@/components/ScratchGrid";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">30 Minutes — 30 Days</h1>
          <p className="text-sm md:text-base text-slate-300/90">
            Scratch to reveal your daily motivation. One scratch per day.
          </p>
        </div>
        <ResetButton />
      </div>

      <Card3D>
        <div className="absolute inset-0 flex flex-col">
          <div className="px-6 pt-5">
            <div className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5 text-sm text-white/90">
              30 Minutes — 30 Days
            </div>
          </div>
          <div className="flex-1 py-3">
            <ScratchGrid />
          </div>
        </div>
      </Card3D>

      <p className="mt-6 text-xs text-slate-400">
        Edit this page at <code>app/page.tsx</code>. The project is a Next.js App Router starter and deploys easily on Vercel.
      </p>
    </main>
  );
}
