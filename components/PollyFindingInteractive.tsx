"use client";

import { SpeakButton } from "./SpeakButton";

/**
 * Interactive version of the Polly finding — lets the player hear the difference
 * between how the Brazilian voice mispronounces tech terms (reading them as PT)
 * versus the correct pronunciation (US English voice).
 *
 * Uses the browser's built-in Web Speech API (free, works offline once voices load).
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
            label="🎙️ ouvir a frase inteira (como o Polly tá lendo)"
            variant="wrong"
          />
        </div>
      </div>

      <p>
        <b>🔴 Como o Polly está lendo cada termo</b> <span className="text-duo-ink-soft text-sm">(clica pra ouvir):</span>
      </p>

      <div className="space-y-2 my-3">
        <PronCard
          term="Kubernetes"
          wrongLang="pt-BR"
          correctLang="en-US"
          wrongDesc="lendo letra-por-letra em português"
        />
        <PronCard
          term="Docker"
          wrongLang="pt-BR"
          correctLang="en-US"
          wrongDesc='vira "doquer"'
        />
        <PronCard
          term="PyTorch"
          wrongLang="pt-BR"
          correctLang="en-US"
          wrongDesc='vira "pee-torch"'
        />
        <PronCard
          term="GraphQL"
          wrongLang="pt-BR"
          correctLang="en-US"
          wrongDesc='vira "graff-quê-éle"'
        />
      </div>

      <p>
        <b>Recursos disponíveis pra corrigir pronúncia:</b>
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          📖 <b>Lexicon</b> (pronunciation lexicon):{" "}
          <span className="text-duo-red-dark font-bold">nenhum aplicado</span> ⚠️
        </li>
        <li>
          🏷️ <b>SSML</b> tags (<code className="bg-duo-yellow-light text-duo-ink px-1.5 py-0.5 rounded text-mono font-bold text-xs">&lt;phoneme&gt;</code>,{" "}
          <code className="bg-duo-yellow-light text-duo-ink px-1.5 py-0.5 rounded text-mono font-bold text-xs">&lt;say-as&gt;</code>): nenhuma no texto
        </li>
      </ul>

      <p>
        <b>Lexicon disponível na conta mas nunca usado:</b>
      </p>
      <ul className="list-disc pl-5">
        <li>
          📄{" "}
          <code className="bg-duo-yellow-light text-duo-ink px-1.5 py-0.5 rounded text-mono font-bold text-xs">
            tech-terms-en-words
          </code>{" "}
          — 47 termos (Kubernetes, Docker, PyTorch, GraphQL…)
        </li>
      </ul>

      <p className="pt-2">
        👉 O Polly não recebeu instrução de como pronunciar os termos técnicos. Anexar o
        lexicon na chamada resolveria de uma vez.
      </p>

      <div className="mt-3 p-3 bg-duo-blue-light rounded-xl border-2 border-duo-blue/30 text-xs text-duo-blue-dark font-medium">
        💡 <b>Dica:</b> O áudio acima usa a síntese de voz nativa do seu navegador (Chrome,
        Safari, Edge) — o resultado é parecido com o que o Polly faria sem lexicon. A
        pronúncia exata pode variar por sistema/voz.
      </div>
    </div>
  );
}

function PronCard({
  term,
  wrongLang,
  correctLang,
  wrongDesc,
}: {
  term: string;
  wrongLang: "pt-BR" | "en-US";
  correctLang: "pt-BR" | "en-US";
  wrongDesc: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2 items-center bg-white border-2 border-duo-line rounded-xl p-3" style={{ borderBottomWidth: 3 }}>
      <div className="min-w-0">
        <div className="font-black text-duo-ink text-base leading-tight">{term}</div>
        <div className="text-xs text-duo-ink-soft font-medium leading-tight mt-0.5">
          {wrongDesc}
        </div>
      </div>
      <SpeakButton text={term} lang={wrongLang} label="❌ errado" variant="wrong" />
      <SpeakButton text={term} lang={correctLang} label="✅ certo" variant="correct" />
    </div>
  );
}
