import Card3D from "@/components/Card3D";
import ScratchGrid, { NewCardButton } from "@/components/ScratchGrid";
import AuthGate from "@/components/AuthGate";

export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-8 text-center">
      <AuthGate>
        <div className="w-full max-w-[680px] flex justify-center">
          <Card3D width={600} height={900}>
            <div className="absolute inset-0 flex flex-col">
              {/* Larger, darker text inside the card */}
              <div className="px-6 pt-6 text-center">
                <div className="font-display text-2xl md:text-3xl font-bold tracking-wide text-slate-900">
                  30 Minutes - 30 Days
                </div>
                <div className="mt-1 text-sm md:text-lg font-semibold text-slate-900/95">
                  Scratch to reveal your daily motivation and log your effort!{" "}
                  <span className="font-extrabold">One Scratch Per Day.</span>
                </div>
              </div>
              <div className="flex-1 py-4">
                <ScratchGrid />
              </div>
            </div>
          </Card3D>
        </div>
        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-300/90">Built by CMI KIDS CLUB.</p>
          <NewCardButton />
        </div>
      </AuthGate>
    </main>
  );
}
