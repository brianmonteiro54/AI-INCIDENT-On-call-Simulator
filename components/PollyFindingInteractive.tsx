"use client";

import { SpeakButton } from "./SpeakButton";

/**
 * Interactive Polly finding — lets the player hear how the Brazilian voice
 * mispronounces tech terms. No solution spoilers: just shows the symptom.
 *
 * Uses the browser's built-in Web Speech API (free, works in modern browsers).
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
        <b>🔴 Como o Polly está lendo cada termo</b>{" "}
        <span className="text-duo-ink-soft text-sm">(clica pra ouvir a pronúncia atual):</span>
      </p>

      <div className="space-y-2 my-3">
        <PronCard
          term="Kubernetes"
          lang="pt-BR"
          desc="lendo letra-por-letra em português"
        />
        <PronCard
          term="Docker"
          lang="pt-BR"
          desc='vira "doquer"'
        />
        <PronCard
          term="PyTorch"
          lang="pt-BR"
          desc='vira "pee-torch"'
        />
        <PronCard
          term="GraphQL"
          lang="pt-BR"
          desc='vira "graff-quê-éle"'
        />
      </div>

      <p>
        <b>Configuração atual da chamada do Polly:</b>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          📖 <b>Pronunciation Lexicon</b>:{" "}
          <span className="text-duo-red-dark font-bold">nenhum</span> ⚠️
        </li>
        <li>
          🏷️ <b>SSML</b> no texto (<code className="bg-duo-yellow-light text-duo-ink px-1.5 py-0.5 rounded text-mono font-bold text-xs">&lt;phoneme&gt;</code>,{" "}
          <code className="bg-duo-yellow-light text-duo-ink px-1.5 py-0.5 rounded text-mono font-bold text-xs">&lt;say-as&gt;</code>): nenhum
        </li>
      </ul>

      <p className="pt-2">
        👉 O Polly recebeu o texto cru, em português, sem nenhuma instrução de pronúncia.
      </p>

      <div className="mt-3 p-3 bg-duo-blue-light rounded-xl border-2 border-duo-blue/30 text-xs text-duo-blue-dark font-medium">
        💡 <b>Dica:</b> O áudio acima usa a síntese de voz nativa do seu navegador (Chrome,
        Safari, Edge) — o resultado é parecido com o que o Polly faz quando recebe texto sem
        instrução de pronúncia. A pronúncia exata pode variar por sistema.
      </div>
    </div>
  );
}

function PronCard({
  term,
  lang,
  desc,
}: {
  term: string;
  lang: "pt-BR" | "en-US";
  desc: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 items-center bg-white border-2 border-duo-line rounded-xl p-3" style={{ borderBottomWidth: 3 }}>
      <div className="min-w-0">
        <div className="font-black text-duo-ink text-base leading-tight">{term}</div>
        <div className="text-xs text-duo-ink-soft font-medium leading-tight mt-0.5">
          {desc}
        </div>
      </div>
      <SpeakButton text={term} lang={lang} label="ouvir" variant="wrong" />
    </div>
  );
}
