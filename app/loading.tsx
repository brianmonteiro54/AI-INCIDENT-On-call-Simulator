import { Mascot } from "@/components/Mascot";

export default function Loading() {
  return (
    <div className="min-h-screen bg-duo-cream flex items-center justify-center">
      <div className="text-center">
        <Mascot expression="thinking" size={120} />
        <div className="mt-3 text-duo-ink-soft font-bold text-sm">carregando…</div>
      </div>
    </div>
  );
}
