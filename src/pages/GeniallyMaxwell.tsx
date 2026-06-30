import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import maxwellPortrait from "@/assets/maxwell-engraving.jpg";
import cloudsBg from "@/assets/clouds-taupe.jpg";

const TAUPE = "#8C8268";
const CREAM = "#FBF6EA";
const INK = "#1A1916";

const slides = [
  {
    kind: "cover",
    kicker: "CÁLCULO 3",
    title: "Equações de Maxwell\ne Teorema de Stokes",
    authors: "Giovanna, Erik, Flávio e Reuel",
  },
  {
    kind: "index",
    title: "Índice",
    items: [
      "Linha do tempo",
      "James Clerk Maxwell",
      "As quatro equações",
      "Forma diferencial",
      "Teorema de Stokes",
      "Ponte entre os dois",
      "Aplicações modernas",
      "Conclusão",
    ],
  },
  {
    kind: "timeline",
    title: "Linha do tempo",
    events: [
      { y: "1820", t: "Ørsted descobre o campo magnético da corrente." },
      { y: "1831", t: "Faraday formula a lei da indução eletromagnética." },
      { y: "1865", t: "Maxwell publica a teoria dinâmica do campo eletromagnético." },
      { y: "1884", t: "Heaviside reescreve as equações na forma vetorial atual." },
    ],
  },
  {
    kind: "portrait",
    title: "James Clerk Maxwell",
    body: "Físico e matemático escocês (1831–1879). Unificou eletricidade, magnetismo e óptica em uma única teoria de campo, prevendo que a luz é uma onda eletromagnética. Sua síntese é considerada, ao lado da gravitação de Newton, uma das maiores conquistas da física clássica.",
    quote: "“De uma perspectiva de longo prazo, pouca dúvida pode haver de que o evento mais significativo do século XIX será julgado como a descoberta de Maxwell.”",
    quoteAuthor: "— Richard Feynman",
  },
  {
    kind: "equations",
    title: "As quatro equações",
    items: [
      { name: "Lei de Gauss (elétrica)", eq: "∮ E · dA = Q / ε₀", desc: "O fluxo elétrico através de uma superfície fechada é proporcional à carga interna." },
      { name: "Lei de Gauss (magnética)", eq: "∮ B · dA = 0", desc: "Não existem monopolos magnéticos: as linhas de B são fechadas." },
      { name: "Lei de Faraday", eq: "∮ E · dℓ = − dΦ_B/dt", desc: "Campo magnético variável induz campo elétrico circulante." },
      { name: "Lei de Ampère-Maxwell", eq: "∮ B · dℓ = μ₀(I + ε₀ dΦ_E/dt)", desc: "Correntes e campos elétricos variáveis geram campo magnético." },
    ],
  },
  {
    kind: "phrase",
    kicker: "FORMA DIFERENCIAL",
    phrase: "∇·E = ρ/ε₀     ∇·B = 0     ∇×E = −∂B/∂t     ∇×B = μ₀J + μ₀ε₀ ∂E/∂t",
    caption: "As mesmas leis, escritas pontualmente — base de toda a eletrodinâmica.",
  },
  {
    kind: "stokes",
    title: "Teorema de Stokes",
    eq: "∮_∂S F · dr  =  ∬_S (∇ × F) · dA",
    body: "A circulação de um campo vetorial ao longo da fronteira de uma superfície orientada é igual ao fluxo do rotacional através dessa superfície. É a ponte entre integrais de linha e integrais de superfície.",
    bullets: [
      "Generaliza o Teorema de Green ao espaço tridimensional.",
      "Exige superfície suave por partes e campo F de classe C¹.",
      "A orientação da fronteira segue a regra da mão direita.",
    ],
  },
  {
    kind: "bridge",
    title: "A ponte entre Maxwell e Stokes",
    left: {
      h: "Faraday integral",
      t: "∮_∂S E · dr = −d/dt ∬_S B · dA",
    },
    right: {
      h: "Faraday diferencial",
      t: "∇ × E = − ∂B/∂t",
    },
    foot: "Aplicando Stokes ao lado esquerdo, a circulação vira fluxo do rotacional. Igualando os integrandos, surge a forma local. O mesmo argumento converte Ampère-Maxwell.",
  },
  {
    kind: "applications",
    title: "Aplicações modernas",
    cards: [
      { h: "Telecomunicações", t: "Antenas, Wi-Fi, 5G e fibra óptica derivam diretamente das equações de onda." },
      { h: "Imagem médica", t: "Ressonância magnética usa indução e campos variáveis controlados." },
      { h: "Energia", t: "Geradores, transformadores e motores são Faraday em ação." },
      { h: "Astrofísica", t: "Magnetohidrodinâmica descreve plasmas estelares e o vento solar." },
    ],
  },
  {
    kind: "closing",
    title: "Conclusão",
    body: "As equações de Maxwell descrevem o comportamento global do campo eletromagnético; o Teorema de Stokes fornece a linguagem matemática que permite passar da visão integral à visão local. Juntos, formam um dos pilares mais elegantes do Cálculo 3 e da Física moderna.",
    sign: "Giovanna · Erik · Flávio · Reuel",
  },
];

const Chrome = ({ i, n }: { i: number; n: number }) => (
  <>
    <div className="absolute top-8 left-12 font-serif tracking-[0.3em] text-[18px]" style={{ color: INK }}>
      CÁLCULO 3
    </div>
    <div className="absolute top-8 right-12 font-serif text-[18px]" style={{ color: INK }}>
      {String(i + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
    </div>
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif italic text-[14px] opacity-60" style={{ color: INK }}>
      Equações de Maxwell e Teorema de Stokes
    </div>
  </>
);

const Slide = ({ s }: { s: any }) => {
  switch (s.kind) {
    case "cover":
      return (
        <div className="relative w-full h-full flex items-center">
          <img src={maxwellPortrait} alt="Maxwell" className="absolute left-[8%] top-1/2 -translate-y-1/2 w-[38%] aspect-square object-cover shadow-2xl" style={{ filter: "sepia(0.4) contrast(1.05)" }} />
          <div className="absolute right-[8%] top-1/2 -translate-y-1/2 text-right max-w-[48%]">
            <div className="font-serif tracking-[0.5em] text-[22px] mb-6" style={{ color: INK }}>{s.kicker}</div>
            <h1 className="font-serif text-[64px] leading-[1.05] mb-8 whitespace-pre-line" style={{ color: INK }}>{s.title}</h1>
            <div className="h-[2px] w-32 ml-auto mb-8" style={{ background: INK }} />
            <p className="font-serif italic text-[24px]" style={{ color: INK }}>{s.authors}</p>
            <div className="mt-12 inline-block px-10 py-3 font-serif tracking-[0.4em] text-[16px]" style={{ background: `${INK}99`, color: CREAM }}>
              COMEÇAR
            </div>
          </div>
        </div>
      );
    case "index":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-32">
          <h2 className="font-serif text-[56px] mb-12 tracking-wide" style={{ color: INK }}>{s.title}</h2>
          <div className="grid grid-cols-2 gap-x-24 gap-y-5 w-full max-w-4xl">
            {s.items.map((it: string, idx: number) => (
              <div key={idx} className="flex items-baseline gap-5 font-serif text-[24px] border-b pb-3" style={{ color: INK, borderColor: `${INK}33` }}>
                <span className="text-[18px] tracking-widest opacity-70">{String(idx + 1).padStart(2, "0")}</span>
                <span>{it}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "timeline":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-24">
          <h2 className="font-serif text-[52px] mb-16" style={{ color: INK }}>{s.title}</h2>
          <div className="relative w-full max-w-5xl">
            <div className="absolute top-8 left-0 right-0 h-[2px]" style={{ background: INK }} />
            <div className="grid grid-cols-4 gap-6">
              {s.events.map((e: any, i: number) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-4 h-4 rounded-full mb-4" style={{ background: INK }} />
                  <div className="font-serif text-[36px] mb-3" style={{ color: INK }}>{e.y}</div>
                  <p className="font-serif text-[18px] leading-snug" style={{ color: INK }}>{e.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    case "portrait":
      return (
        <div className="w-full h-full grid grid-cols-2 gap-16 px-24 items-center">
          <img src={maxwellPortrait} alt="" className="w-full aspect-square object-cover shadow-2xl" style={{ filter: "sepia(0.4) contrast(1.05)" }} />
          <div>
            <h2 className="font-serif text-[48px] mb-6" style={{ color: INK }}>{s.title}</h2>
            <div className="h-[2px] w-20 mb-6" style={{ background: INK }} />
            <p className="font-serif text-[22px] leading-relaxed mb-8" style={{ color: INK }}>{s.body}</p>
            <blockquote className="font-serif italic text-[20px] leading-relaxed border-l-2 pl-5" style={{ color: INK, borderColor: INK }}>
              {s.quote}
              <footer className="not-italic mt-3 text-[16px] opacity-70">{s.quoteAuthor}</footer>
            </blockquote>
          </div>
        </div>
      );
    case "equations":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-24">
          <h2 className="font-serif text-[48px] mb-10" style={{ color: INK }}>{s.title}</h2>
          <div className="grid grid-cols-2 gap-6 w-full max-w-6xl">
            {s.items.map((it: any, i: number) => (
              <div key={i} className="p-6 border" style={{ borderColor: `${INK}40`, background: `${CREAM}80` }}>
                <div className="font-serif text-[18px] tracking-wider opacity-70 mb-2" style={{ color: INK }}>{it.name}</div>
                <div className="font-serif text-[26px] mb-3" style={{ color: INK }}>{it.eq}</div>
                <p className="font-serif text-[16px] leading-snug" style={{ color: INK }}>{it.desc}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "phrase":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-24 text-center">
          <div className="font-serif tracking-[0.5em] text-[20px] mb-10 opacity-70" style={{ color: INK }}>{s.kicker}</div>
          <div className="font-serif text-[34px] leading-[1.6] mb-10 max-w-5xl" style={{ color: INK }}>{s.phrase}</div>
          <div className="h-[2px] w-24 mb-6" style={{ background: INK }} />
          <p className="font-serif italic text-[22px] max-w-3xl" style={{ color: INK }}>{s.caption}</p>
        </div>
      );
    case "stokes":
      return (
        <div className="w-full h-full grid grid-cols-2 gap-12 px-24 items-center">
          <div>
            <h2 className="font-serif text-[52px] mb-8" style={{ color: INK }}>{s.title}</h2>
            <div className="p-8 border-l-4 mb-8" style={{ borderColor: INK, background: `${CREAM}90` }}>
              <div className="font-serif text-[32px]" style={{ color: INK }}>{s.eq}</div>
            </div>
            <p className="font-serif text-[20px] leading-relaxed" style={{ color: INK }}>{s.body}</p>
          </div>
          <ul className="space-y-5">
            {s.bullets.map((b: string, i: number) => (
              <li key={i} className="flex gap-4 font-serif text-[20px] leading-relaxed" style={{ color: INK }}>
                <span className="font-serif text-[28px] opacity-60">{i + 1}.</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "bridge":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-24">
          <h2 className="font-serif text-[48px] mb-12" style={{ color: INK }}>{s.title}</h2>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-10 w-full max-w-6xl mb-10">
            <div className="p-8 border text-center" style={{ borderColor: INK, background: `${CREAM}90` }}>
              <div className="font-serif tracking-wider text-[16px] opacity-70 mb-3" style={{ color: INK }}>{s.left.h}</div>
              <div className="font-serif text-[24px]" style={{ color: INK }}>{s.left.t}</div>
            </div>
            <div className="font-serif text-[48px]" style={{ color: INK }}>⇄</div>
            <div className="p-8 border text-center" style={{ borderColor: INK, background: `${CREAM}90` }}>
              <div className="font-serif tracking-wider text-[16px] opacity-70 mb-3" style={{ color: INK }}>{s.right.h}</div>
              <div className="font-serif text-[24px]" style={{ color: INK }}>{s.right.t}</div>
            </div>
          </div>
          <p className="font-serif italic text-[20px] text-center max-w-4xl leading-relaxed" style={{ color: INK }}>{s.foot}</p>
        </div>
      );
    case "applications":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-24">
          <h2 className="font-serif text-[48px] mb-10" style={{ color: INK }}>{s.title}</h2>
          <div className="grid grid-cols-2 gap-6 w-full max-w-5xl">
            {s.cards.map((c: any, i: number) => (
              <div key={i} className="p-7 border" style={{ borderColor: `${INK}40`, background: `${CREAM}80` }}>
                <h3 className="font-serif text-[26px] mb-3" style={{ color: INK }}>{c.h}</h3>
                <p className="font-serif text-[18px] leading-relaxed" style={{ color: INK }}>{c.t}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "closing":
      return (
        <div className="w-full h-full flex flex-col items-center justify-center px-32 text-center">
          <h2 className="font-serif text-[56px] mb-10" style={{ color: INK }}>{s.title}</h2>
          <div className="h-[2px] w-24 mb-8" style={{ background: INK }} />
          <p className="font-serif text-[24px] leading-relaxed max-w-4xl mb-12" style={{ color: INK }}>{s.body}</p>
          <p className="font-serif italic tracking-widest text-[20px]" style={{ color: INK }}>{s.sign}</p>
        </div>
      );
    default:
      return null;
  }
};

export default function GeniallyMaxwell() {
  const [i, setI] = useState(0);
  const n = slides.length;

  const next = useCallback(() => setI((p) => Math.min(n - 1, p + 1)), [n]);
  const prev = useCallback(() => setI((p) => Math.max(0, p - 1)), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ background: TAUPE }}>
      <div
        className="relative w-full max-w-[1600px] aspect-[16/9] overflow-hidden shadow-2xl"
        style={{
          background: `linear-gradient(${CREAM}E6, ${CREAM}E6), url(${cloudsBg}) center/cover, ${TAUPE}`,
        }}
      >
        <Chrome i={i} n={n} />
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 pt-20 pb-16"
          >
            <Slide s={slides[i]} />
          </motion.div>
        </AnimatePresence>

        <button onClick={prev} disabled={i === 0} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full disabled:opacity-30 transition" style={{ background: `${INK}20`, color: INK }}>
          <ChevronLeft size={24} />
        </button>
        <button onClick={next} disabled={i === n - 1} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full disabled:opacity-30 transition" style={{ background: `${INK}20`, color: INK }}>
          <ChevronRight size={24} />
        </button>
        <a href="/" className="absolute bottom-4 right-4 p-2 rounded-full" style={{ background: `${INK}20`, color: INK }}>
          <Home size={18} />
        </a>
      </div>
    </div>
  );
}
