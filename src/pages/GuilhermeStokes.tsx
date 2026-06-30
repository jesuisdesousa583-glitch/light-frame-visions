import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import cloudsTaupe from "@/assets/clouds-taupe.jpg";
import stokesPortrait from "@/assets/stokes-portrait.webp";
import vectorField from "@/assets/vector-field.webp";

/**
 * Clone do estilo da apresentação "Equações de Maxwell e Teorema de Gauss"
 * do Guilherme Martins (IFG Jataí), porém com CONTEÚDO DIFERENTE:
 * "Teorema de Stokes e Rotacional — Aplicações ao Eletromagnetismo".
 */

const Corner = ({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) => {
  const rot =
    pos === "tl" ? 0 : pos === "tr" ? 90 : pos === "br" ? 180 : 270;
  return (
    <svg
      className="absolute h-16 w-16"
      style={{
        top: pos.startsWith("t") ? 12 : undefined,
        bottom: pos.startsWith("b") ? 12 : undefined,
        left: pos.endsWith("l") ? 12 : undefined,
        right: pos.endsWith("r") ? 12 : undefined,
        transform: `rotate(${rot}deg)`,
      }}
      viewBox="0 0 64 64"
      fill="none"
      stroke="#1a1a1a"
      strokeWidth="1.2"
    >
      <path d="M2 2 H40 M2 2 V40" />
      <path d="M6 6 H30 M6 6 V30" />
      <circle cx="34" cy="6" r="2" />
      <circle cx="6" cy="34" r="2" />
      <path d="M2 14 q6 0 10 -6" />
      <path d="M14 2 q0 6 -6 10" />
    </svg>
  );
};

const Divider = () => (
  <div className="my-3 flex items-center justify-center gap-2 text-stone-700">
    <span className="h-px w-32 bg-stone-700" />
    <span>◆</span>
    <span className="h-px w-32 bg-stone-700" />
  </div>
);

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-block bg-stone-900 px-3 py-1 text-[17px] font-bold uppercase tracking-wider text-stone-50">
    {children}
  </span>
);

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-full w-full overflow-hidden bg-[#f5f1e8] px-20 py-14 font-serif text-stone-900">
    <img
      src={cloudsTaupe}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-20 -left-12 h-[300px] w-[620px] object-cover opacity-20 mix-blend-multiply"
    />
    <Corner pos="tl" />
    <Corner pos="tr" />
    <Corner pos="bl" />
    <Corner pos="br" />
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

// ============== SLIDES ==============

const SlideCover = () => (
  <Frame>
    <img
      src={cloudsTaupe}
      alt="Nuvens em tom sépia usadas como referência visual do Genially"
      className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover opacity-25 mix-blend-multiply"
    />
    <div className="grid h-full grid-cols-2 items-center gap-8">
      <div>
        <h1 className="font-serif text-[58px] font-black uppercase leading-[1.05] tracking-tight">
          Equações de Maxwell
          <br />e Teorema de Stokes
        </h1>
        <Pill>Cálculo 3</Pill>
        <div className="mt-12 space-y-1 text-base">
          <p className="text-stone-700">Apresentação por:</p>
          <p className="font-bold">Giovanna, Erik, Flávio e Reuel</p>
        </div>
        <div className="mt-8 space-y-0.5 text-base">
          <p className="italic text-stone-700">Giovanna Felippe da Silva</p>
          <p className="text-stone-600">Criado em 25 de junho de 2026</p>
        </div>
      </div>
      <div className="flex h-full items-center justify-center">
        <div className="relative h-[760px] w-full max-w-[640px] border border-stone-400 bg-stone-200 p-4 shadow-2xl">
          <img
            src={stokesPortrait}
            alt="Retrato de referência usado no slide"
            className="h-full w-full object-cover"
          />
          <img
            src={cloudsTaupe}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-24 h-[200px] w-[480px] object-cover opacity-70 mix-blend-screen"
          />
          <div className="absolute inset-x-4 bottom-4 bg-stone-100/85 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-stone-800">
            Stokes • Faraday • Maxwell
          </div>
        </div>
      </div>
    </div>
  </Frame>
);

const SlideSumario = () => {
  const items = [
    "Introdução",
    "Contexto Histórico",
    "Integrais de Linha",
    "Rotacional de um Campo",
    "Interpretação Física do Rotacional",
    "Teorema de Stokes",
    "Forma Vetorial e Forma Diferencial",
    "Relação com o Teorema de Green",
    "Lei de Faraday–Lenz",
    "Lei de Ampère–Maxwell",
    "Demonstração da Lei de Faraday via Stokes",
    "Aplicação: Espira em Campo Variável",
    "Aplicações em Engenharia Elétrica",
    "Conclusão",
    "Referências",
  ];
  return (
    <Frame>
      <h2 className="text-center text-[54px] font-black">Sumário</h2>
      <Divider />
      <div className="grid grid-cols-[1fr_2fr] gap-8 pt-2">
        <div className="border border-stone-400 bg-stone-200 p-2">
          <svg viewBox="0 0 200 280" className="h-[420px] w-full grayscale">
            <rect width="200" height="280" fill="#cfc8b8" />
            <ellipse cx="100" cy="110" rx="50" ry="65" fill="#3d3a30" opacity="0.85" />
            <path d="M55 175 Q100 195 145 175 L155 270 L45 270 Z" fill="#2a2820" />
            <ellipse cx="100" cy="55" rx="55" ry="25" fill="#1a1812" />
            <text x="100" y="278" textAnchor="middle" fontSize="7" fill="#1a1812">Stokes</text>
          </svg>
        </div>
        <ol className="space-y-1 text-[22px] leading-relaxed">
          {items.map((it, i) => (
            <li key={i}>
              <span className="font-bold">{i + 1}.</span> {it}
            </li>
          ))}
        </ol>
      </div>
    </Frame>
  );
};

const SlideHistorico = () => (
  <Frame>
    <h2 className="text-center text-[48px] font-black">Contexto Histórico</h2>
    <Divider />
    <div className="grid grid-cols-2 gap-10 pt-4">
      <div>
        <h3 className="text-xl font-bold">Sir George G. Stokes (1819–1903)</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[20px]">
          <li>Físico e matemático irlandês, professor em Cambridge.</li>
          <li>Generalizou o Teorema de Green para superfícies em ℝ³.</li>
          <li>Contribuições fundamentais em <b>hidrodinâmica</b> (equações de Navier–Stokes).</li>
          <li>Estudos sobre <b>viscosidade</b>, óptica e fluorescência.</li>
          <li>Seu teorema unifica integrais de linha e de superfície.</li>
        </ul>
      </div>
      <div>
        <h3 className="text-xl font-bold">Michael Faraday (1791–1867)</h3>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-[20px]">
          <li>Físico inglês, pioneiro do <b>eletromagnetismo experimental</b>.</li>
          <li>Descobriu a <b>indução eletromagnética</b> (1831).</li>
          <li>Introduziu o conceito de <b>linhas de campo</b>.</li>
          <li>Sua lei, expressa via rotacional, é descrita pelo Teorema de Stokes.</li>
          <li>Base do funcionamento de geradores, transformadores e motores.</li>
        </ul>
      </div>
    </div>
  </Frame>
);

const SlideRotacional = () => (
  <Frame>
    <h2 className="text-center text-[50px] font-black">Rotacional de um Campo</h2>
    <Divider />
    <div className="grid grid-cols-3 gap-6 pt-3">
      <div>
        <Pill>Definição</Pill>
        <p className="mt-3 text-[18px]">
          O rotacional mede a tendência de um campo vetorial <i>F⃗</i> em produzir
          rotação local em torno de cada ponto do espaço.
        </p>
        <Pill>Expressão</Pill>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[20px]">
          ∇ × F⃗ = (∂F<sub>z</sub>/∂y − ∂F<sub>y</sub>/∂z) î
          <br />+ (∂F<sub>x</sub>/∂z − ∂F<sub>z</sub>/∂x) ĵ
          <br />+ (∂F<sub>y</sub>/∂x − ∂F<sub>x</sub>/∂y) k̂
        </div>
      </div>
      <div>
        <Pill>Interpretação Geométrica</Pill>
        <div className="mt-3 border border-stone-700 bg-stone-100 p-2">
          <img
            src={vectorField}
            alt="Campo vetorial — visualização de vetores tangentes e rotação local"
            className="h-auto w-full object-contain"
          />
        </div>
        <p className="mt-2 text-center text-[17px] italic">
          Exemplo de campo vetorial: cada seta representa F⃗(x,y,z) em um ponto do espaço.
        </p>
      </div>
      <div>
        <Pill>Casos Notáveis</Pill>
        <ul className="mt-3 space-y-2 text-[18px]">
          <li>• <b>Campo irrotacional:</b> ∇ × F⃗ = 0</li>
          <li>• <b>Campo solenoidal puro:</b> ∇ · F⃗ = 0</li>
          <li>• <b>Campo conservativo</b> ⇒ rotacional nulo</li>
          <li>• <b>Vórtice:</b> rotacional concentrado no eixo</li>
        </ul>
        <div className="mt-4 border border-stone-700 bg-stone-100 p-3 text-[17px]">
          <b>Observação:</b> ∇ × (∇φ) = 0 — o rotacional de um gradiente é
          sempre nulo.
        </div>
      </div>
    </div>
  </Frame>
);

const SlideStokes = () => (
  <Frame>
    <h2 className="text-center text-[54px] font-black">Teorema de Stokes</h2>
    <Divider />
    <div className="grid grid-cols-[1fr_1.1fr_1fr] gap-6 pt-3">
      <div>
        <Pill>Enunciado</Pill>
        <p className="mt-2 text-[18px]">
          Seja <i>S</i> uma superfície orientada, suave por partes, limitada pela
          curva fechada <i>∂S</i>. Então:
        </p>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[23px]">
          ∮<sub>∂S</sub> F⃗ · dr⃗ = ∬<sub>S</sub> (∇ × F⃗) · dS⃗
        </div>
        <p className="mt-3 text-[18px]">
          A circulação ao longo de <i>∂S</i> equivale ao fluxo do rotacional
          através de <i>S</i>.
        </p>
      </div>
      <div>
        <Pill>Ilustração Geométrica</Pill>
        <svg viewBox="0 0 260 220" className="mt-2 w-full">
          <path d="M30 140 Q130 40 230 140 Q170 180 130 150 Q90 180 30 140 Z"
            fill="none" stroke="#1a1a1a" strokeWidth="1.5" />
          <path d="M30 140 Q130 200 230 140" fill="none" stroke="#1a1a1a" strokeDasharray="3 3" />
          <path d="M60 130 a40 40 0 1 0 60 0" fill="none" stroke="#1a1a1a" />
          <polygon points="118,135 125,128 122,140" fill="#1a1a1a" />
          <text x="135" y="100" fontSize="14" fontStyle="italic">S</text>
          <text x="40" y="160" fontSize="12" fontStyle="italic">∂S</text>
          <line x1="155" y1="110" x2="180" y2="80" stroke="#1a1a1a" markerEnd="url(#arr2)" />
          <text x="183" y="78" fontSize="11">n̂</text>
          <defs>
            <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#1a1a1a" />
            </marker>
          </defs>
        </svg>
      </div>
      <div>
        <Pill>Condições</Pill>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[18px]">
          <li><i>S</i> é orientável e suave por partes.</li>
          <li><i>∂S</i> é curva fechada simples, percorrida positivamente.</li>
          <li><i>F⃗</i> tem componentes com derivadas parciais contínuas.</li>
        </ul>
        <Pill>Casos Particulares</Pill>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-[18px]">
          <li>Se <i>S</i> ⊂ plano <i>xy</i> ⇒ <b>Teorema de Green</b>.</li>
          <li>Se ∇ × F⃗ = 0 ⇒ circulação nula em qualquer ∂S.</li>
        </ul>
      </div>
    </div>
  </Frame>
);

const SlideFaraday = () => (
  <Frame>
    <h2 className="text-center text-[48px] font-black">Lei de Faraday–Lenz</h2>
    <Divider />
    <div className="grid grid-cols-2 gap-8 pt-3">
      <div>
        <Pill>Forma Integral</Pill>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[22px]">
          ∮<sub>C</sub> E⃗ · dr⃗ = − d/dt ∬<sub>S</sub> B⃗ · dS⃗
        </div>
        <p className="mt-3 text-[18px]">
          A força eletromotriz induzida em um circuito fechado é igual ao oposto
          da taxa de variação do fluxo magnético através de qualquer superfície
          limitada por esse circuito.
        </p>
        <Pill>Forma Diferencial</Pill>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[22px]">
          ∇ × E⃗ = − ∂B⃗/∂t
        </div>
        <p className="mt-3 text-[18px]">
          Obtida aplicando o <b>Teorema de Stokes</b> à forma integral.
        </p>
      </div>
      <div>
        <Pill>Interpretação Física</Pill>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-[18px]">
          <li>Campos magnéticos variáveis geram campos elétricos rotacionais.</li>
          <li>O sinal negativo expressa a <b>Lei de Lenz</b>: a corrente
            induzida se opõe à variação que a originou.</li>
          <li>Princípio de funcionamento de <b>geradores, transformadores,
            dínamos e indutores</b>.</li>
        </ul>
        <div className="mt-4 border border-stone-700 bg-stone-100 p-3 text-[17px]">
          <b>Importante:</b> Stokes é a ponte matemática que transforma a
          forma global (integral) na forma local (diferencial) das equações
          de Maxwell.
        </div>
      </div>
    </div>
  </Frame>
);

const SlideAmpere = () => (
  <Frame>
    <h2 className="text-center text-[48px] font-black">Lei de Ampère–Maxwell</h2>
    <Divider />
    <div className="grid grid-cols-2 gap-8 pt-3">
      <div>
        <Pill>Forma Integral</Pill>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[21px]">
          ∮<sub>C</sub> B⃗ · dr⃗ = μ₀ I<sub>enc</sub> + μ₀ε₀ d/dt ∬<sub>S</sub> E⃗ · dS⃗
        </div>
        <Pill>Forma Diferencial</Pill>
        <div className="mt-3 border border-stone-700 p-3 text-center text-[21px]">
          ∇ × B⃗ = μ₀ J⃗ + μ₀ε₀ ∂E⃗/∂t
        </div>
        <p className="mt-3 text-[18px]">
          Maxwell adicionou o termo da <b>corrente de deslocamento</b>
          (μ₀ε₀ ∂E⃗/∂t), tornando o sistema consistente e prevendo as
          <b> ondas eletromagnéticas</b>.
        </p>
      </div>
      <div>
        <Pill>Aplicação do Teorema de Stokes</Pill>
        <p className="mt-3 text-[18px]">
          Partindo da forma integral e aplicando Stokes ao lado esquerdo:
        </p>
        <div className="mt-3 space-y-2 border border-stone-700 p-3 text-[18px]">
          <p>∮<sub>C</sub> B⃗ · dr⃗ = ∬<sub>S</sub> (∇ × B⃗) · dS⃗</p>
          <p>⇒ ∬<sub>S</sub> (∇ × B⃗) · dS⃗ = ∬<sub>S</sub> (μ₀J⃗ + μ₀ε₀ ∂E⃗/∂t) · dS⃗</p>
          <p>Como vale para toda superfície <i>S</i>:</p>
          <p className="text-center font-bold">
            ∇ × B⃗ = μ₀ J⃗ + μ₀ε₀ ∂E⃗/∂t
          </p>
        </div>
      </div>
    </div>
  </Frame>
);

const SlideAplicacao = () => (
  <Frame>
    <h2 className="text-center text-[46px] font-black">
      Aplicação: Espira em Campo Magnético Variável
    </h2>
    <Divider />
    <div className="grid grid-cols-[1fr_1.2fr] gap-8 pt-3">
      <div>
        <svg viewBox="0 0 260 240" className="w-full">
          <rect x="50" y="60" width="160" height="120" fill="none" stroke="#1a1a1a" strokeWidth="2" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <circle cx={75 + i * 30} cy={120} r="6" fill="none" stroke="#1a1a1a" />
              <circle cx={75 + i * 30} cy={120} r="1.5" fill="#1a1a1a" />
            </g>
          ))}
          <text x="130" y="40" textAnchor="middle" fontSize="12" fontStyle="italic">B⃗(t) saindo do plano</text>
          <path d="M50 180 a40 40 0 0 0 40 40" fill="none" stroke="#1a1a1a" markerEnd="url(#arr3)" />
          <text x="100" y="230" fontSize="12">ε</text>
          <defs>
            <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 z" fill="#1a1a1a" />
            </marker>
          </defs>
        </svg>
      </div>
      <div>
        <Pill>Enunciado</Pill>
        <p className="mt-2 text-[18px]">
          Uma espira retangular de área <i>A</i> está imersa em um campo
          magnético uniforme <i>B(t) = B₀ cos(ωt)</i> perpendicular ao plano.
        </p>
        <Pill>Cálculo da FEM</Pill>
        <div className="mt-2 space-y-1 border border-stone-700 p-3 text-[18px]">
          <p>Φ<sub>B</sub> = B(t) · A = B₀ A cos(ωt)</p>
          <p>ε = − dΦ<sub>B</sub>/dt = B₀ A ω sen(ωt)</p>
          <p className="font-bold">ε<sub>máx</sub> = B₀ A ω</p>
        </div>
        <p className="mt-3 text-[18px]">
          Este é o princípio do <b>gerador de corrente alternada</b>: uma espira
          girando em um campo constante produz fluxo variável e, portanto, FEM
          senoidal.
        </p>
      </div>
    </div>
  </Frame>
);

const SlideAplicacoesEng = () => (
  <Frame>
    <h2 className="text-center text-[48px] font-black">Aplicações em Engenharia</h2>
    <Divider />
    <div className="grid grid-cols-2 gap-x-12 gap-y-5 pt-4 text-[20px]">
      {[
        ["Geradores Elétricos", "Conversão de energia mecânica em elétrica via variação de fluxo magnético."],
        ["Transformadores", "Indução mútua entre bobinas, regida por ∇ × E⃗ = −∂B⃗/∂t."],
        ["Motores Elétricos", "Interação entre correntes (J⃗) e campos magnéticos (B⃗)."],
        ["Antenas e Telecom", "Radiação de ondas eletromagnéticas previstas por Maxwell."],
        ["Indução em Cooktops", "Correntes de Foucault induzidas em panelas metálicas."],
        ["Ressonância Magnética", "Campos B⃗ variáveis usados em imagens médicas (MRI)."],
      ].map(([title, desc]) => (
        <div key={title} className="border-l-4 border-stone-900 pl-4">
          <h3 className="font-bold">{title}</h3>
          <p className="text-[18px] text-stone-700">{desc}</p>
        </div>
      ))}
    </div>
  </Frame>
);

const SlideConclusao = () => (
  <Frame>
    <h2 className="text-center text-[54px] font-black">Conclusão</h2>
    <Divider />
    <div className="mx-auto max-w-3xl pt-6 text-[21px] leading-relaxed">
      <p>
        O <b>Teorema de Stokes</b> é a ferramenta central do Cálculo Vetorial
        que conecta a circulação de um campo ao longo de uma curva fechada
        com o fluxo de seu rotacional através de qualquer superfície limitada
        por essa curva.
      </p>
      <p className="mt-4">
        No eletromagnetismo, ele permite passar das formas <b>integrais</b>
        (globais) para as formas <b>diferenciais</b> (locais) das equações de
        Maxwell — em particular das leis de <b>Faraday–Lenz</b> e
        <b> Ampère–Maxwell</b> — revelando que campos elétricos e magnéticos
        variáveis se geram mutuamente, dando origem às ondas eletromagnéticas.
      </p>
      <p className="mt-6 text-center italic">
        "A matemática é a linguagem na qual Deus escreveu o universo."
        <br />— Galileu Galilei
      </p>
    </div>
  </Frame>
);

const SlideReferencias = () => (
  <Frame>
    <h2 className="text-center text-[48px] font-black">Referências</h2>
    <Divider />
    <ul className="space-y-3 pt-4 text-[18px] leading-relaxed">
      <li>STEWART, James. <b>Cálculo</b>. 8. ed. São Paulo: Cengage Learning, 2016. v. 2.</li>
      <li>THOMAS, George B.; WEIR, M. D.; HASS, J. <b>Cálculo</b>. 12. ed. São Paulo: Pearson, 2013. v. 2.</li>
      <li>HALLIDAY, D.; RESNICK, R.; WALKER, J. <b>Fundamentos de Física: eletromagnetismo</b>. 10. ed. Rio de Janeiro: LTC, 2016. v. 3.</li>
      <li>GRIFFITHS, David J. <b>Introduction to Electrodynamics</b>. 4. ed. Cambridge University Press, 2017.</li>
      <li>SADIKU, Matthew N. O. <b>Elementos de Eletromagnetismo</b>. 7. ed. Porto Alegre: Bookman, 2018.</li>
      <li>HAYT, W. H.; BUCK, J. A. <b>Engineering Electromagnetics</b>. 9. ed. New York: McGraw-Hill, 2019.</li>
    </ul>
  </Frame>
);

const slides = [
  SlideCover,
  SlideSumario,
  SlideHistorico,
  SlideRotacional,
  SlideStokes,
  SlideFaraday,
  SlideAmpere,
  SlideAplicacao,
  SlideAplicacoesEng,
  SlideConclusao,
  SlideReferencias,
];

export default function GuilhermeStokes() {
  const [i, setI] = useState(0);
  const isPrintMode =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("print");
  const next = useCallback(() => setI((p) => Math.min(p + 1, slides.length - 1)), []);
  const prev = useCallback(() => setI((p) => Math.max(p - 1, 0)), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  if (isPrintMode) {
    return (
      <div className="bg-stone-900 print:bg-white">
        <style>{`
          @page { size: 1280px 720px; margin: 0; }
          html, body, #root { margin: 0; padding: 0; background: #ffffff; }
          .guilherme-print-deck { width: 1280px; margin: 0 auto; }
          .guilherme-print-page {
            width: 1280px;
            height: 720px;
            overflow: hidden;
            page-break-after: always;
            break-after: page;
            background: #f5f1e8;
          }
          .guilherme-print-page:last-child { page-break-after: auto; break-after: auto; }
          @media screen {
            .guilherme-print-deck { padding: 24px 0; }
            .guilherme-print-page { margin: 0 auto 24px; box-shadow: 0 24px 80px rgba(0,0,0,.45); }
          }
        `}</style>
        <main id="guilherme-stokes-print" className="guilherme-print-deck">
          {slides.map((Slide, index) => (
            <section
              key={index}
              className="guilherme-print-page"
              data-slide-index={index + 1}
              aria-label={`Slide ${index + 1}`}
            >
              <Slide />
            </section>
          ))}
        </main>
      </div>
    );
  }

  const Slide = slides[i];
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-stone-800 p-4">
      <div
        id="guilherme-stokes-slide"
        data-pdf-root="guilherme-stokes"
        className="relative shadow-2xl"
        style={{ width: "min(95vw, 1280px)", aspectRatio: "16/9" }}
      >
        <Slide />
      </div>
      <div className="mt-4 flex items-center gap-3 text-stone-200">
        <Link to="/" className="flex items-center gap-1 rounded bg-stone-700 px-3 py-1.5 text-sm hover:bg-stone-600">
          <Home size={14} /> Home
        </Link>
        <Link to="/guilherme-stokes?print" target="_blank" className="rounded bg-stone-100 px-3 py-1.5 text-sm font-bold text-stone-900 hover:bg-stone-200">
          Baixar / imprimir PDF
        </Link>
        <button onClick={prev} disabled={i === 0} className="rounded bg-stone-700 p-2 hover:bg-stone-600 disabled:opacity-30">
          <ChevronLeft size={18} />
        </button>
        <span className="font-mono text-sm">
          {i + 1} / {slides.length}
        </span>
        <button onClick={next} disabled={i === slides.length - 1} className="rounded bg-stone-700 p-2 hover:bg-stone-600 disabled:opacity-30">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
