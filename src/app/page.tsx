import Card3D from "@/components/Card3D";
import ScratchGrid, { ResetButton } from "@/components/ScratchGrid";

export default function Page() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">30 Minutes — 30 Days</h1>
          <p className="text-sm md:text-base text-slate-300/90">
           
          </p>
        </div>
        <ResetButton />
      </div>

      <Card3D>
        <div className="absolute inset-0 flex flex-col">
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">30 Minutes / 30 Days, You did it!</h1>
          <p className="text-sm md:text-base text-slate-300/90">
            Scratch to reveal your daily motivation, and log your effort for the day! One scratch per day.</p>
            </div>
          </div>
          <div className="flex-1 py-3">
            <ScratchGrid />
          </div>
        </div>
      </Card3D>

      <p className="mt-6 text-xs text-slate-400">
      </p>
    </main>
  );
}
