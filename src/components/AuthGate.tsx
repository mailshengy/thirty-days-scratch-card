"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  if (!ready) return null;

  if (!session) {
    async function sendLink(e: any) {
      e.preventDefault();
      const email = new FormData(e.currentTarget).get("email") as string;
      await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
      alert("Magic link sent. Check your email.");
    }
    return (
      <form onSubmit={sendLink} className="flex flex-col items-center gap-2">
        <input name="email" type="email" required placeholder="you@example.com"
               className="rounded-md bg-white/10 px-3 py-2 outline-none" />
        <button className="rounded-md bg-white/20 px-3 py-2 text-sm">Sign in</button>
      </form>
    );
  }

  return <>{children}</>;
}
