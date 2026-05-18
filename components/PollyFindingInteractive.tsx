"use client";

import { SpeakButton } from "./SpeakButton";

/**
 * Interactive Polly finding — symptoms only, zero solution spoilers.
 * Player hears how the Brazilian voice mispronounces tech terms.
 */
export function PollyFindingInteractive() {
  return (
    <div className="text-duo-ink space-y-3">
      <p>
        <b>Você está vendo:</b> como o Polly (síntese de voz da AWS) está pronunciando
        termos técnicos nos audiobooks.
      </p>

      <p>
        <b>Voz ativa:</b> Camila (pt-BR neural)
      </p>

      <div className="bg-duo-yellow-light border-2 border-duo-yellow rounded-xl p-3 my-3" style={{ borderBottomWidth: 4 }}>
        <p className="text-xs font-black uppercase tracking-widest text-duo-yellow-dark mb-2">
          📜 Texto de exemplo do audiobook
        </p>
        <p className="text-duo-ink font-medium italic mb-3">
          "Kubernetes orquestra containers Docker, e PyTorch domina deep learning."
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <SpeakButton
            text="Kubernetes orquestra containers Docker, e PyTorch domina deep learning."
            lang="pt-BR"
            label="🎙️ ouvir a frase como o Polly tá lendo"
            variant="wrong"
          />
        </div>
      </div>

      <p>
        <b>🔴 Termos sendo lidos:</b>{" "}
        <span className="text-duo-ink-soft text-sm">(clica pra ouvir):</span>
      </p>

      <div className="space-y-2 my-3">
        <PronCard term="Kubernetes" lang="pt-BR" />
        <PronCard term="Docker" lang="pt-BR" />
        <PronCard term="PyTorch" lang="pt-BR" />
        <PronCard term="GraphQL" lang="pt-BR" />
      </div>

      <p>
        <b>Volume e reclamações:</b>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>🎧 Audiobooks gerados: ~247/dia</li>
        <li>📉 Reclamações na review: +840% nas últimas 2 semanas</li>
        <li>💬 Reclamação típica: <i>"impossível ouvir, parece que o narrador nunca viu essas palavras na vida"</i></li>
      </ul>

      <p className="pt-2">
        👉 O Polly tá pronunciando palavras inglesas como se fossem português.
      </p>

      <div className="mt-3 p-3 bg-duo-blue-light rounded-xl border-2 border-duo-blue/30 text-xs text-duo-blue-dark font-medium">
        💡 <b>Dica:</b> O áudio acima usa a síntese de voz nativa do seu navegador (Chrome,
        Safari, Edge). A pronúncia exata pode variar por sistema.
      </div>
    </div>
  );
}

function PronCard({
  term,
  lang,
}: {
  term: string;
  lang: "pt-BR" | "en-US";
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white border-2 border-duo-line rounded-xl p-3" style={{ borderBottomWidth: 3 }}>
      <div className="font-black text-duo-ink text-base">{term}</div>
      <SpeakButton text={term} lang={lang} label="ouvir" variant="wrong" />
    </div>
  );
}
