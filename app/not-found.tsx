import Link from "next/link";
import { Home } from "lucide-react";
import { Mascot } from "@/components/Mascot";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-duo-cream flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Mascot expression="thinking" size={120} />
        <div className="mt-4 font-mono text-sm text-duo-ink-faded">404</div>
        <h1 className="mt-1 font-display font-black text-2xl sm:text-3xl text-duo-ink">
          Essa página sumiu do radar
        </h1>
        <p className="mt-2 text-duo-ink-soft font-medium leading-snug">
          O incidente que você procurou não existe ou foi movido. Bora voltar pro plantão?
        </p>
        <Link href="/" className="mt-6 duo-btn duo-green inline-flex items-center gap-2">
          <Home size={18} strokeWidth={3} />
          Voltar pra home
        </Link>
      </div>
    </div>
  );
}
