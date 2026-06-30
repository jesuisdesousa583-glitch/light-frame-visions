import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Home, Loader2, Play } from "lucide-react";
import cloudsTaupe from "@/assets/clouds-taupe.jpg";
import stokesPortrait from "@/assets/stokes-portrait.webp";
import vectorField from "@/assets/vector-field.webp";
import vintageTv from "@/assets/vintage-tv.jpg";
import vintageRadio from "@/assets/vintage-radio.jpg";
import smartphoneImg from "@/assets/smartphone.jpg";
import faradayCoil from "@/assets/faraday-coil.jpg";
import ampereCoil from "@/assets/ampere-coil.jpg";
import antennaWaves from "@/assets/antenna-waves.jpg";
import circulationLoop from "@/assets/circulation-loop.jpg";
import curlVortex from "@/assets/curl-vortex.jpg";
import stokesSurface from "@/assets/stokes-surface.jpg";

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
    <div className="relative z-10 h-full" style={{ zoom: 1.15 }}>{children}</div>
  </div>
);

// ============== SLIDES ==============

const MAXWELL_VIDEO_WEBM_URL = "/videos/maxwell.webm";
const MAXWELL_VIDEO_MP4_URL = "/videos/maxwell.mp4";
const MAXWELL_VIDEO_POSTER_URL = "/videos/maxwell-poster.jpg";

const MaxwellVideo = ({ active, isPrint }: { active: boolean; isPrint: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "playing" | "error">(
    active ? "loading" : "idle",
  );

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || isPrint) return;
    try {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      await video.play();
      setStatus("playing");
    } catch {
      setStatus("ready");
    }
  }, [isPrint]);

  useEffect(() => {
    const video = videoRef.current;
    if (!active || !video || isPrint) return;

    let cancelled = false;
    setStatus("loading");

    const markReady = () => {
      if (cancelled) return;
      setStatus("ready");
      playVideo();
    };

    const markError = () => {
      if (!cancelled) setStatus("error");
    };

    video.addEventListener("loadeddata", markReady, { once: true });
    video.addEventListener("canplay", markReady, { once: true });
    video.addEventListener("error", markError);
    video.load();

    if (video.readyState >= 2) markReady();

    return () => {
      cancelled = true;
      video.pause();
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("error", markError);
    };
  }, [active, isPrint, playVideo]);

  if (isPrint) {
    return (
      <img
        src={MAXWELL_VIDEO_POSTER_URL}
        alt="Prévia do vídeo sobre Maxwell"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-stone-200">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        poster={MAXWELL_VIDEO_POSTER_URL}
        muted
        loop
        playsInline
        controls
        preload="auto"
        onPlay={() => setStatus("playing")}
        onPause={() => setStatus((current) => (current === "playing" ? "ready" : current))}
      >
        <source src={MAXWELL_VIDEO_WEBM_URL} type="video/webm" />
        <source src={MAXWELL_VIDEO_MP4_URL} type="video/mp4" />
      </video>

      {status === "loading" && active && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f5f1e8]/80 text-stone-800">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )}

      {(status === "ready" || status === "error") && active && (
        <button
          type="button"
          onClick={playVideo}
          className="absolute inset-0 flex items-center justify-center bg-[#f5f1e8]/35 text-stone-900 transition hover:bg-[#f5f1e8]/20"
          aria-label="Reproduzir vídeo"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-stone-900 bg-[#f5f1e8]/90 shadow-lg">
            <Play className="ml-1 h-9 w-9 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
};

const SlideCover = () => {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPrint =
    typeof window !== "undefined" && new URLSearchParams(window.location.search).has("print");

  useEffect(() => {
    if (isPrint) {
      setShowVideo(true);
      return;
    }
    const t = setTimeout(() => setShowVideo(true), 2000);
    return () => clearTimeout(t);
  }, [isPrint]);

  useEffect(() => {
    if (showVideo && videoRef.current && !isPrint) {
      videoRef.current.play().catch(() => {});
    }
  }, [showVideo, isPrint]);

  return (
    <Frame>
      <img
        src={cloudsTaupe}
        alt="Nuvens em tom sépia usadas como referência visual do Genially"
        className="pointer-events-none absolute left-0 top-0 h-full w-full object-cover opacity-25 mix-blend-multiply"
      />
      <div className="grid h-full grid-cols-2 items-center gap-8">
        <div>
          <h1 className="font-serif text-[42px] font-bold uppercase leading-[1.1] tracking-[0.02em]">
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
        <div className="flex h-full items-center justify-center gap-4">
          <div className="relative h-full w-1/2 border border-stone-400 bg-[#f5f1e8] p-3 shadow-2xl">
            <img
              src={stokesPortrait}
              alt="Retrato de referência usado no slide"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-3 bottom-3 bg-[#f5f1e8]/90 py-2 text-center text-sm font-bold uppercase tracking-wider text-stone-800">
              Stokes • Faraday • Maxwell
            </div>
          </div>
          <div
            className="relative h-full w-1/2 border border-stone-400 bg-[#f5f1e8] p-3 shadow-2xl transition-opacity duration-700"
            style={{ opacity: showVideo ? 1 : 0 }}
          >
            {showVideo && (
              <MaxwellVideo active={showVideo} isPrint={isPrint} />
            )}
            <div className="absolute inset-x-3 bottom-3 bg-[#f5f1e8]/90 py-2 text-center text-sm font-bold uppercase tracking-wider text-stone-800">
              Maxwell em movimento
            </div>
          </div>
        </div>
      </div>
    </Frame>
  );
};

const SlideSumario = () => {
  const items = [
    "Relaciona integrais de linha e de superfície",
    "Aplicação em eletromagnetismo",
    "Base matemática das Equações de Maxwell",
    "Presente em tecnologias modernas",
  ];
  return (
    <Frame>
      <div className="mb-2 text-[18px] uppercase tracking-[0.4em] text-stone-600">motivação</div>
      <h2 className="text-[54px] font-black leading-tight">Por que estudar Stokes?</h2>
      <Divider />
      <ul className="space-y-2 pt-3 text-[22px] leading-snug">
        {items.map((it, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="mt-3 inline-block h-3 w-3 shrink-0 rounded-full bg-stone-800" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { img: vintageTv, label: "Televisão" },
          { img: smartphoneImg, label: "Celular" },
          { img: vintageRadio, label: "Rádio" },
        ].map(({ img, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1 rounded-md border-2 border-stone-700 bg-stone-100/60 p-2"
          >
            <img
              src={img}
              alt={label}
              className="h-20 w-full object-contain"
              loading="lazy"
            />
            <span className="text-[16px] font-bold uppercase tracking-wider text-stone-800">
              {label}
            </span>
          </div>
        ))}
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

const SlideCampoVetorial = () => (
  <Frame>
    <h2 className="text-[48px] font-black">O que é um campo vetorial?</h2>
    <Divider />
    <div className="grid grid-cols-[1.1fr_1fr] gap-10 pt-4">
      <div className="space-y-5 text-[22px] leading-relaxed">
        <p>
          <b>Campo vetorial:</b> função que associa a cada ponto do espaço um vetor.
        </p>
        <div className="rounded border border-stone-400 bg-stone-100 p-5 text-center font-serif text-[34px]">
          F⃗(x, y, z) = ⟨P, Q, R⟩
        </div>
        <ul className="list-disc space-y-2 pl-6">
          <li><b>Direção:</b> para onde o vetor aponta em cada ponto.</li>
          <li><b>Sentido:</b> orientação ao longo dessa direção.</li>
          <li><b>Módulo:</b> intensidade da grandeza no ponto.</li>
        </ul>
        <p className="text-[20px] text-stone-700">
          Exemplos: velocidade de um fluido, campo elétrico E⃗, campo magnético B⃗.
        </p>
      </div>
      <div className="border border-stone-400 bg-stone-100 p-3">
        <img src={vectorField} alt="Campo vetorial" className="h-full w-full object-contain" />
      </div>
    </div>
  </Frame>
);

const SlideCirculacao = () => (
  <Frame>
    <h2 className="text-[48px] font-black">Circulação</h2>
    <Divider />
    <div className="grid grid-cols-[1.1fr_1fr] gap-10 pt-4">
      <div className="space-y-5 text-[22px] leading-relaxed">
        <p>
          A <b>circulação</b> de um campo vetorial mede o quanto ele "gira" ao longo
          de uma curva fechada.
        </p>
        <div className="rounded border border-stone-400 bg-stone-100 p-6 text-center font-serif text-[36px]">
          Γ = ∮<sub>C</sub> F⃗ · d r⃗
        </div>
        <ul className="list-disc space-y-2 pl-6">
          <li><b>C:</b> curva fechada (orientada).</li>
          <li><b>F⃗:</b> campo vetorial avaliado sobre a curva.</li>
          <li><b>d r⃗:</b> deslocamento infinitesimal tangente a C.</li>
        </ul>
        <p className="text-[20px] text-stone-700">
          Se Γ ≠ 0, o campo possui componente rotacional ao longo de C.
        </p>
      </div>
      <div className="flex items-center justify-center border border-stone-400 bg-stone-100 p-3">
        <img src={circulationLoop} alt="Curva fechada com circulação" className="h-full w-full object-contain" loading="lazy" />
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
            src={curlVortex}
            alt="Vórtice — rotacional concentrado"
            className="h-auto w-full object-contain"
            loading="lazy"
          />
        </div>
        <p className="mt-2 text-center text-[17px] italic">
          Vórtice: setas circulando em torno de um eixo ilustram ∇ × F⃗ ≠ 0.
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

const SlideRotacionalSimbolos = () => (
  <Frame>
    <div className="mb-2 text-[18px] uppercase tracking-[0.4em] text-stone-600">Rotacional</div>
    <h2 className="text-[48px] font-black">Significado dos símbolos</h2>
    <Divider />
    <div className="grid grid-cols-[1fr_1fr] gap-10 pt-4">
      <div className="flex items-center justify-center rounded border border-stone-400 bg-stone-100 p-8">
        <div className="text-center font-serif text-[56px] leading-tight">
          ∇ × F⃗
        </div>
      </div>
      <ul className="space-y-4 text-[22px] leading-relaxed">
        <li><b>∇</b> — operador nabla (derivadas parciais).</li>
        <li><b>×</b> — produto vetorial.</li>
        <li><b>F⃗</b> — campo vetorial analisado.</li>
        <li><b>Resultado:</b> vetor que indica a tendência de rotação local do campo em cada ponto.</li>
      </ul>
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
        <div className="mt-2 border border-stone-700 bg-stone-100 p-2">
          <img src={stokesSurface} alt="Superfície S limitada por ∂S" className="h-auto w-full object-contain" loading="lazy" />
        </div>
        <p className="mt-1 text-center text-[15px] italic">Superfície S limitada pela curva ∂S</p>
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
        <div className="mt-3 border border-stone-700 bg-stone-100 p-2">
          <img src={faradayCoil} alt="Bobina de indução de Faraday" className="h-44 w-full object-contain" loading="lazy" />
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[17px]">
          <li>Campos magnéticos variáveis geram campos elétricos rotacionais.</li>
          <li>Sinal negativo = <b>Lei de Lenz</b>.</li>
          <li>Base de <b>geradores, transformadores e dínamos</b>.</li>
        </ul>
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
        <div className="mt-2 border border-stone-700 bg-stone-100 p-2">
          <img src={ampereCoil} alt="Solenoide — Lei de Ampère" className="h-40 w-full object-contain" loading="lazy" />
        </div>
        <div className="mt-3 space-y-1 border border-stone-700 p-3 text-[17px]">
          <p>∮<sub>C</sub> B⃗ · dr⃗ = ∬<sub>S</sub> (∇ × B⃗) · dS⃗</p>
          <p>Vale para toda <i>S</i> ⇒</p>
          <p className="text-center font-bold">∇ × B⃗ = μ₀ J⃗ + μ₀ε₀ ∂E⃗/∂t</p>
        </div>
      </div>
    </div>
  </Frame>
);

const SlideStokesFaraday = () => (
  <Frame>
    <div className="flex items-center gap-3">
      <Pill>Teorema</Pill>
      <Pill>Lei de Faraday</Pill>
    </div>
    <h2 className="mt-3 text-[44px] font-black leading-tight">
      Aplicando Stokes na Lei de Faraday
    </h2>
    <Divider />
    <div className="grid grid-cols-[1.1fr_1fr] gap-10 pt-2">
      <div className="space-y-4">
        <div className="rounded border border-stone-400 bg-stone-100 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-600">
            Forma integral
          </div>
          <div className="text-center font-serif text-[26px]">
            ∮<sub>C</sub> E⃗ · d r⃗ = − d/dt ∬<sub>S</sub> B⃗ · d S⃗
          </div>
        </div>
        <div className="rounded border border-stone-400 bg-stone-100 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-600">
            Aplicando Stokes ao lado esquerdo
          </div>
          <div className="text-center font-serif text-[24px]">
            ∮<sub>C</sub> E⃗ · d r⃗ = ∬<sub>S</sub> (∇ × E⃗) · d S⃗
          </div>
        </div>
        <div className="rounded border-2 border-stone-900 bg-stone-50 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-700">
            Forma diferencial
          </div>
          <div className="text-center font-serif text-[28px] font-bold">
            ∇ × E⃗ = − ∂B⃗/∂t
          </div>
        </div>
      </div>
      <div className="border-l-2 border-stone-400 pl-6">
        <h3 className="text-[24px] font-black uppercase tracking-wider">Símbolos</h3>
        <ul className="mt-3 space-y-2 text-[20px] leading-relaxed">
          <li><b>E⃗</b> — campo elétrico</li>
          <li><b>B⃗</b> — campo magnético</li>
          <li><b>∬<sub>S</sub> B⃗ · dS⃗</b> — fluxo magnético (Φ<sub>B</sub>)</li>
          <li><b>d/dt</b> — variação temporal</li>
          <li><b>∇ ×</b> — rotacional</li>
          <li><b>C = ∂S</b> — curva fechada que delimita <i>S</i></li>
        </ul>
        <p className="mt-4 border-l-4 border-stone-700 bg-stone-100 p-3 text-[18px] italic">
          Um campo magnético variável no tempo gera um campo elétrico
          rotacional — princípio da indução eletromagnética.
        </p>
      </div>
    </div>
  </Frame>
);

const SlideAplicacaoTeorema = () => (
  <Frame>
    <h2 className="text-[48px] font-black">Aplicação do Teorema</h2>
    <Divider />
    <div className="grid grid-cols-[1fr_1.1fr] gap-10 pt-4">
      <div className="space-y-4 text-[22px] leading-relaxed">
        <p className="font-bold">Das 4 Equações de Maxwell:</p>
        <ul className="space-y-2 pl-2">
          <li>✓ Lei de Faraday</li>
          <li>✓ Lei de Ampère–Maxwell</li>
        </ul>
        <p>Utilizam <b>diretamente</b> o Teorema de Stokes.</p>
        <p className="border-l-4 border-stone-700 bg-stone-100 p-4 text-[20px] italic">
          É ele que permite passar da <b>forma integral</b> para a <b>forma diferencial</b>.
        </p>
      </div>
      <div className="space-y-4">
        <div className="rounded border border-stone-400 bg-stone-100 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-600">Teorema de Stokes</div>
          <div className="text-center font-serif text-[28px]">
            ∮<sub>∂S</sub> F⃗ · d r⃗ = ∬<sub>S</sub> (∇ × F⃗) · d S⃗
          </div>
        </div>
        <div className="rounded border border-stone-400 bg-stone-100 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-600">Faraday — integral → diferencial</div>
          <div className="text-center font-serif text-[24px]">
            ∮<sub>C</sub> E⃗ · d r⃗ = −d/dt ∬<sub>S</sub> B⃗ · d S⃗ &nbsp;⇒&nbsp; ∇ × E⃗ = −∂B⃗/∂t
          </div>
        </div>
        <div className="rounded border border-stone-400 bg-stone-100 p-5">
          <div className="mb-1 text-[16px] uppercase tracking-widest text-stone-600">Ampère–Maxwell — integral → diferencial</div>
          <div className="text-center font-serif text-[24px]">
            ∮<sub>C</sub> B⃗ · d r⃗ = μ₀(I + ε₀ dΦ<sub>E</sub>/dt) &nbsp;⇒&nbsp; ∇ × B⃗ = μ₀J⃗ + μ₀ε₀ ∂E⃗/∂t
          </div>
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
    <div className="grid grid-cols-[1.2fr_1fr] gap-8 pt-4">
      <div className="text-[19px] leading-relaxed">
        <p>
          O <b>Teorema de Stokes</b> conecta a circulação de um campo ao longo
          de uma curva fechada com o fluxo de seu rotacional através de qualquer
          superfície limitada por ela.
        </p>
        <p className="mt-3">
          No eletromagnetismo, permite passar das formas <b>integrais</b>
          para as formas <b>diferenciais</b> das equações de Maxwell —
          em particular <b>Faraday–Lenz</b> e <b>Ampère–Maxwell</b> —
          dando origem às ondas eletromagnéticas que sustentam rádio, TV
          e telecomunicações.
        </p>
        <p className="mt-4 italic">
          "A matemática é a linguagem na qual Deus escreveu o universo."
          <br />— Galileu Galilei
        </p>
      </div>
      <div className="border border-stone-700 bg-stone-100 p-3">
        <img src={antennaWaves} alt="Torre de antena emitindo ondas eletromagnéticas" className="h-full w-full object-contain" loading="lazy" />
      </div>
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
  SlideCampoVetorial,
  SlideCirculacao,
  SlideRotacional,
  SlideRotacionalSimbolos,
  SlideStokes,
  SlideFaraday,
  SlideStokesFaraday,
  SlideAmpere,
  SlideAplicacaoTeorema,
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
              data-slide="1"
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
