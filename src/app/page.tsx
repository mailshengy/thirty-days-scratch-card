import Card3D from "@/components/Card3D";
import ScratchGrid, { NewCardButton } from "@/components/ScratchGrid";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-3 py-4 text-center">
      <div className="w-full max-w-[720px] flex justify-center">
        <Card3D>
          <div className="absolute inset-0 flex flex-col">
            {/* Title block (larger, but compact margins) */}
            <div className="px-3 pt-4 text-center">
              <div className="mt-0.5 md:mt-1 text-base md:text-xl font-semibold text-slate-900/95">
                30 Minutes / 30 Days Scratch Card Challenge
              </div>
              <div className="mt-0.5 md:mt-1 text-base md:text-xl font-semibold text-slate-900/95">
                You did it!
              </div>
              <div className="mt-0.5 text-xs md:text-sm font-semibold text-slate-900/95">
                Scratch to reveal your daily motivation and log your effort!
              </div>
              <div className="text-xs md:text-sm font-extrabold text-slate-900 mt-0.5">
                One Scratch Per Day.
              </div>
            </div>

            {/* Tiles */}
            <div className="flex-1 py-2 md:py-3">
              <ScratchGrid />
            </div>
          </div>
        </Card3D>
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <p className="text-[11px] text-slate-300/90">Built by CMI KIDS CLUB.</p>
        <NewCardButton />
      </div>
    </main>
  );
}
