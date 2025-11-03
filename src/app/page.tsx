import Card3D from "@/components/Card3D";
import ScratchGrid, { NewCardButton } from "@/components/ScratchGrid";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-8 text-center">
      {/* Centered 3D Card only */}
      <div className="w-full max-w-[640px] flex justify-center">
        <Card3D width={560} height={880}>
          <div className="absolute inset-0 flex flex-col">
            {/* Centered title/strapline inside the card */}
            <div className="px-6 pt-6 text-center">
              <div className="font-display text-base md:text-lg font-bold tracking-wide drop-shadow">
                30 Minutes - 30 Days
              </div>
              <div className="mt-1 text-xs md:text-sm text-white/90">
                Scratch to reveal your daily motivation and log your effort! <span className="font-semibold">One Scratch Per Day.</span>
              </div>
            </div>

            {/* Tiles */}
            <div className="flex-1 py-4">
              <ScratchGrid />
            </div>
          </div>
        </Card3D>
      </div>

      {/* Footer note and New Card button */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <p className="text-xs text-slate-300/90">Built by CMI KIDS CLUB.</p>
        <NewCardButton />
      </div>
    </main>
  );
}
