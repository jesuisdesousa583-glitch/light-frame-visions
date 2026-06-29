import { Fragment, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Wind, Zap, Battery, Leaf, Recycle, Activity, Sparkles, ChevronDown,
  Menu, X, Volume2, VolumeX, RefreshCw, Download, Share2, ArrowRight,
  Loader2, Cog, Lightbulb, BookOpen, Quote, CircuitBoard, Sun,
} from "lucide-react";

/* ============================================================
   GERADOR EÓLICO — Apresentação Futurista (IFG)
   Mesmo template visual de Maxwell & Stokes, conteúdo novo.
   ============================================================ */

const CYAN = "#00E5FF";     // ventos / energia cinética
const LIME = "#B6FF00";     // sustentabilidade
const BG_DARK = "#06121A";  // azul-noite profundo

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "intro", label: "Introdução" },
  { id: "faraday", label: "Faraday" },
  { id: "funcionamento", label: "Funcionamento" },
  { id: "inducao", label: "Indução" },
  { id: "etapas", label: "Eletrodinâmica" },
  { id: "grandezas", label: "Grandezas" },
  { id: "kamkwamba", label: "Kamkwamba" },
  { id: "vantagens", label: "Vantagens" },
  { id: "fim", label: "Encerramento" },
];

/* ---------- Partículas: vento em canvas ---------- */
function ParticlesBG() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = "100vw";
      c.style.height = "100vh";
    };
    resize();
    window.addEventListener("resize", resize);
    const N = 110;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() * 1.5 + 0.4) * dpr,
      vy: (Math.random() - 0.5) * 0.3 * dpr,
      r: Math.random() * 1.8 + 0.4,
      color: Math.random() > 0.7 ? LIME : CYAN,
      a: Math.random() * 0.5 + 0.2,
    }));
    const loop = () => {
      ctx.fillStyle = "rgba(6,18,26,0.18)";
      ctx.fillRect(0, 0, c.width, c.height);
      for (const p of parts) {
        p.x += p.vx;
        p.y += p.vy + Math.sin((p.x + p.y) * 0.002) * 0.3;
        if (p.x > c.width + 20) p.x = -20;
        if (p.y > c.height + 20) p.y = -20;
        if (p.y < -20) p.y = c.height + 20;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.a;
        ctx.arc(p.x, p.y, p.r * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
}

/* ---------- Cursor neon ---------- */
function NeonCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
      const t = e.target as HTMLElement;
      setHover(!!t.closest("button, a, [data-cursor='hover']"));
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
  return (
    <div
      ref={ref}
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-screen hidden md:block"
      style={{
        width: hover ? 56 : 22,
        height: hover ? 56 : 22,
        borderRadius: "50%",
        border: `2px solid ${hover ? LIME : CYAN}`,
        boxShadow: `0 0 20px ${hover ? LIME : CYAN}`,
        transition: "width .2s, height .2s, border-color .2s, box-shadow .2s",
      }}
    />
  );
}

function GlitchTitle({ text }: { text: string }) {
  return (
    <h1 className="relative font-black tracking-tighter text-[clamp(2.5rem,9vw,8rem)] leading-none">
      <span className="relative z-10 bg-gradient-to-r from-[#00E5FF] via-white to-[#B6FF00] bg-clip-text text-transparent">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0 text-[#00E5FF] opacity-60 animate-[glitch1_3s_infinite]">{text}</span>
      <span aria-hidden className="absolute inset-0 text-[#B6FF00] opacity-60 animate-[glitch2_3s_infinite]">{text}</span>
    </h1>
  );
}

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.10)] ${className}`}>
      {children}
    </div>
  );
}

function Section({ id, children, n }: { id: string; children: React.ReactNode; n: number }) {
  return (
    <section id={id} className="relative min-h-screen w-full snap-start flex items-center justify-center px-6 py-24">
      <div className="absolute top-8 left-8 z-20 font-mono text-xs tracking-[0.3em] text-[#00E5FF]/80">
        SEÇÃO {String(n).padStart(2, "0")} / {SECTIONS.length}
      </div>
      <div className="relative w-full max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

function TiltCard({ children, glow }: { children: React.ReactNode; glow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current!.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      }}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = "none"; }}
      className="transition-transform duration-200"
      style={{ filter: `drop-shadow(0 0 25px ${glow}55)` }}
    >
      {children}
    </div>
  );
}

/* ---------- 1. Hero ---------- */
function Hero() {
  return (
    <Section id="hero" n={1}>
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/5 text-[#00E5FF] font-mono text-xs tracking-widest"
        >
          <Sparkles className="w-3 h-3" /> IFG • ENG. ELÉTRICA • 2026/1
        </motion.div>
        <GlitchTitle text="GERADOR EÓLICO" />
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-lg md:text-2xl text-white/70 max-w-3xl mx-auto font-light"
        >
          Funcionamento e relação com o <span className="text-[#00E5FF]">eletromagnetismo</span> —
          do vento à <span className="text-[#B6FF00]">eletricidade</span>.
        </motion.p>
        <div className="font-mono text-xs text-white/50 tracking-widest pt-2">
          ERI JOHNSON DE SOUSA CARVALHO • PROF.ª KENNYA RESENDE MENDONÇA
        </div>
        <motion.a
          href="#intro" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 mt-6 px-10 py-5 rounded-full font-bold text-black bg-gradient-to-r from-[#00E5FF] to-[#B6FF00] shadow-[0_0_40px_rgba(0,229,255,0.5)]"
        >
          INICIAR <ArrowRight className="w-5 h-5" />
        </motion.a>
        <motion.div
          animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 font-mono text-xs"
        >
          ROLE PARA BAIXO <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>
    </Section>
  );
}

/* ---------- 2. Introdução ---------- */
function Intro() {
  const steps = [
    { i: Wind, t: "Vento move as pás", c: CYAN },
    { i: Cog, t: "Pás giram um eixo", c: "#FFFFFF" },
    { i: Zap, t: "Gerador produz eletricidade", c: LIME },
  ];
  return (
    <Section id="intro" n={2}>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="font-mono text-xs text-[#B6FF00] tracking-widest">01 • INTRODUÇÃO</div>
          <h2 className="text-4xl md:text-6xl font-bold leading-tight">
            O que é um <span className="text-[#00E5FF]">gerador eólico</span>?
          </h2>
          <p className="text-lg text-white/70 max-w-xl">
            Equipamento capaz de transformar a energia <strong className="text-white">cinética do vento</strong> em
            <strong className="text-[#B6FF00]"> energia elétrica</strong>, usando o princípio da indução eletromagnética.
          </p>
        </div>
        <div className="space-y-4">
          {steps.map((s, i) => (
            <TiltCard key={i} glow={s.c}>
              <Glass className="p-5 flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-black font-black"
                  style={{ background: s.c }}>
                  <s.i className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-mono text-xs text-white/40">PASSO {i + 1}</div>
                  <div className="text-xl font-bold text-white">{s.t}</div>
                </div>
              </Glass>
            </TiltCard>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- 3. Faraday ---------- */
function FaradaySec() {
  return (
    <Section id="faraday" n={3}>
      <div className="grid md:grid-cols-[1fr_1.3fr] gap-10 items-center">
        <TiltCard glow={CYAN}>
          <Glass className="p-8 text-center space-y-4">
            <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-[#00E5FF]/30 to-[#B6FF00]/20 border-2 border-[#00E5FF] flex items-center justify-center">
              <Lightbulb className="w-20 h-20 text-[#00E5FF]" />
            </div>
            <div className="font-mono text-xs text-white/50 tracking-widest">1791 — 1867</div>
            <div className="text-3xl font-black text-white">Michael Faraday</div>
            <div className="text-sm text-[#B6FF00]">Cientista britânico</div>
          </Glass>
        </TiltCard>
        <div className="space-y-6">
          <div className="font-mono text-xs text-[#B6FF00] tracking-widest">02 • CIENTISTA RELACIONADO</div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Descobridor da <span className="text-[#00E5FF]">indução eletromagnética</span>
          </h2>
          <p className="text-lg text-white/70">
            Em <strong className="text-white">1831</strong>, Faraday demonstrou que o
            <strong className="text-[#B6FF00]"> movimento de um campo magnético</strong> pode
            gerar corrente elétrica em um condutor.
          </p>
          <Glass className="p-6 border-l-4 border-l-[#00E5FF]">
            <Quote className="w-6 h-6 text-[#00E5FF] mb-2" />
            <p className="italic text-white/80">
              "Esse princípio é a base de funcionamento dos geradores eólicos atuais."
            </p>
          </Glass>
        </div>
      </div>
    </Section>
  );
}

/* ---------- 4. Funcionamento ---------- */
function Funcionamento() {
  const passos = [
    "O vento gira as pás da turbina",
    "As pás movimentam um eixo",
    "O eixo gira um ímã dentro do gerador",
    "O campo magnético varia nas bobinas",
    "Surge corrente elétrica",
  ];
  return (
    <Section id="funcionamento" n={4}>
      <div className="text-center mb-12">
        <div className="font-mono text-xs text-[#B6FF00] tracking-widest mb-3">04 • FUNCIONAMENTO</div>
        <h2 className="text-4xl md:text-6xl font-bold">
          Como funciona — <span className="text-[#00E5FF]">passo a passo</span>
        </h2>
      </div>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#00E5FF] via-white/20 to-[#B6FF00] hidden md:block" />
        <div className="space-y-6">
          {passos.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`md:w-1/2 ${i % 2 ? "md:ml-auto md:pl-10" : "md:pr-10"}`}
            >
              <Glass className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#B6FF00] text-black font-black flex items-center justify-center text-lg shrink-0">
                  {i + 1}
                </div>
                <span className="text-lg md:text-xl text-white">{p}</span>
              </Glass>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------- 5. Indução / Lei de Faraday ---------- */
function Inducao() {
  return (
    <Section id="inducao" n={5}>
      <div className="text-center space-y-8">
        <div className="font-mono text-xs text-[#B6FF00] tracking-widest">05 • FENÔMENO FÍSICO</div>
        <h2 className="text-4xl md:text-6xl font-bold">
          Indução <span className="text-[#00E5FF]">Eletromagnética</span>
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          Ocorre quando um <strong className="text-white">campo magnético em movimento</strong> gera
          corrente elétrica em um condutor — o princípio fundamental do gerador eólico.
        </p>
        <TiltCard glow={CYAN}>
          <Glass className="p-12 max-w-2xl mx-auto">
            <div className="font-mono text-xs tracking-[0.3em] text-[#B6FF00] mb-4">LEI DE FARADAY</div>
            <div className="font-mono text-5xl md:text-7xl font-bold text-white">
              ε = −<span className="text-[#00E5FF]">dΦ</span>/<span className="text-[#B6FF00]">dt</span>
            </div>
            <div className="mt-6 text-sm text-white/60 grid grid-cols-3 gap-4">
              <div><span className="text-[#00E5FF] font-mono">ε</span> força eletromotriz</div>
              <div><span className="text-[#00E5FF] font-mono">Φ</span> fluxo magnético</div>
              <div><span className="text-[#B6FF00] font-mono">t</span> tempo</div>
            </div>
          </Glass>
        </TiltCard>
      </div>
    </Section>
  );
}

/* ---------- 6. Três etapas de energia ---------- */
function Etapas() {
  const etapas = [
    { tag: "CINÉTICA", t: "Energia do vento", icon: Wind, color: CYAN },
    { tag: "ROTACIONAL", t: "Energia mecânica", icon: Cog, color: "#FFFFFF" },
    { tag: "INDUZIDA", t: "Energia elétrica", icon: Zap, color: LIME },
  ];
  return (
    <Section id="etapas" n={6}>
      <div className="text-center mb-10">
        <div className="font-mono text-xs text-[#B6FF00] tracking-widest">06 • ELETRODINÂMICA</div>
        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          Três etapas de <span className="text-[#00E5FF]">transformação</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-4">
        {etapas.map((e, i) => (
          <Fragment key={e.tag}>
            <TiltCard glow={e.color}>
              <Glass className="p-8 text-center h-full flex flex-col items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: `${e.color}20`, border: `2px solid ${e.color}` }}>
                  <e.icon className="w-10 h-10" style={{ color: e.color }} />
                </div>
                <div className="font-mono text-xs tracking-widest" style={{ color: e.color }}>{e.tag}</div>
                <div className="text-xl font-bold text-white">{e.t}</div>
              </Glass>
            </TiltCard>
            {i < etapas.length - 1 && (
              <div className="hidden md:flex items-center justify-center text-[#00E5FF]">
                <ArrowRight className="w-8 h-8 animate-pulse" />
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 7. Grandezas Elétricas ---------- */
function Grandezas() {
  const items = [
    { sym: "I", name: "Corrente elétrica", unit: "ampère (A)", color: CYAN, icon: Activity },
    { sym: "V", name: "Tensão elétrica", unit: "volt (V)", color: LIME, icon: Battery },
    { sym: "R", name: "Resistência elétrica", unit: "ohm (Ω)", color: "#FF6FB5", icon: CircuitBoard },
  ];
  return (
    <Section id="grandezas" n={7}>
      <div className="text-center mb-12">
        <div className="font-mono text-xs text-[#B6FF00] tracking-widest">07 • GRANDEZAS ENVOLVIDAS</div>
        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          Grandezas no <span className="text-[#00E5FF]">gerador eólico</span>
        </h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {items.map((g) => (
          <TiltCard key={g.sym} glow={g.color}>
            <Glass className="p-8 text-center space-y-3 h-full">
              <div className="text-7xl font-black font-mono" style={{ color: g.color, textShadow: `0 0 30px ${g.color}` }}>
                {g.sym}
              </div>
              <div className="text-xl font-bold text-white">{g.name}</div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono text-xs text-white/70">
                <g.icon className="w-3 h-3" /> {g.unit}
              </div>
            </Glass>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 8. William Kamkwamba ---------- */
function Kamkwamba() {
  return (
    <Section id="kamkwamba" n={8}>
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="font-mono text-xs text-[#B6FF00] tracking-widest">08 • INSPIRAÇÃO REAL</div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            O Menino que <span className="text-[#00E5FF]">Descobriu o Vento</span>
          </h2>
          <p className="text-white/70 text-lg">
            <strong className="text-white">William Kamkwamba</strong>, jovem do Malawi (África),
            construiu aos <strong className="text-[#B6FF00]">14 anos</strong> um gerador eólico com peças
            de bicicleta, restos de plástico e madeira. Levou eletricidade à sua aldeia em meio à seca —
            provando na prática o princípio da indução de Faraday.
          </p>
          <Glass className="p-6 border-l-4 border-l-[#B6FF00]">
            <Quote className="w-6 h-6 text-[#B6FF00] mb-2" />
            <p className="italic text-xl text-white">"Try, and you will succeed."</p>
            <div className="text-xs font-mono text-white/50 mt-2">— William Kamkwamba, TED Talk 2007</div>
          </Glass>
        </div>
        <TiltCard glow={LIME}>
          <Glass className="p-8 space-y-4">
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 via-[#06121A] to-[#B6FF00]/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
              <Wind className="w-32 h-32 text-white/30 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="absolute bottom-3 left-4 font-mono text-xs text-white/60">MALAUÍ • 2002</div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-[#00E5FF] text-2xl font-black">5m</div>
                <div className="text-white/60 text-xs">Torre construída</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <div className="text-[#B6FF00] text-2xl font-black">12V</div>
                <div className="text-white/60 text-xs">Bateria de carro</div>
              </div>
            </div>
            <div className="text-xs font-mono text-white/40">Filme: The Boy Who Harnessed the Wind (2019)</div>
          </Glass>
        </TiltCard>
      </div>
    </Section>
  );
}

/* ---------- 9. Vantagens ---------- */
function Vantagens() {
  const v = [
    { icon: Recycle, t: "Renovável", d: "Fonte inesgotável a partir do vento", c: CYAN },
    { icon: Leaf, t: "Limpa", d: "Não emite poluentes durante a geração", c: LIME },
    { icon: Sun, t: "Sustentável", d: "Reduz uso de combustíveis fósseis", c: "#FFD166" },
    { icon: BookOpen, t: "Acessível", d: "Geração descentralizada e em larga escala", c: "#FF6FB5" },
  ];
  return (
    <Section id="vantagens" n={9}>
      <div className="text-center mb-12">
        <div className="font-mono text-xs text-[#B6FF00] tracking-widest">09 • VANTAGENS</div>
        <h2 className="text-4xl md:text-5xl font-bold mt-3">
          Por que <span className="text-[#00E5FF]">energia eólica</span>?
        </h2>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        {v.map((x) => (
          <TiltCard key={x.t} glow={x.c}>
            <Glass className="p-6 space-y-3 h-full">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${x.c}20`, border: `1px solid ${x.c}` }}>
                <x.icon className="w-6 h-6" style={{ color: x.c }} />
              </div>
              <div className="text-xl font-bold text-white">{x.t}</div>
              <div className="text-sm text-white/60">{x.d}</div>
            </Glass>
          </TiltCard>
        ))}
      </div>
    </Section>
  );
}

/* ---------- 10. Encerramento ---------- */
function Encerramento() {
  return (
    <Section id="fim" n={10}>
      <div className="text-center space-y-8">
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="mx-auto w-40 h-40 rounded-full border-2 border-[#00E5FF] flex items-center justify-center bg-gradient-to-br from-[#00E5FF]/20 to-[#B6FF00]/20"
        >
          <Wind className="w-20 h-20 text-[#00E5FF]" />
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
          <span className="text-[#00E5FF]">Vento</span> que vira <span className="text-[#B6FF00]">luz</span>.
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          O gerador eólico funciona pela indução eletromagnética descoberta por Faraday —
          uma fonte limpa, renovável e capaz de transformar realidades.
        </p>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <a href="#hero" className="px-6 py-3 rounded-full font-bold text-black bg-[#00E5FF] shadow-[0_0_30px_#00E5FF]">
            <RefreshCw className="inline w-4 h-4 mr-2" /> Reiniciar
          </a>
          <button onClick={() => window.dispatchEvent(new CustomEvent("ge-download-pdf"))} className="px-6 py-3 rounded-full font-bold text-black bg-[#B6FF00] shadow-[0_0_30px_#B6FF00]">
            <Download className="inline w-4 h-4 mr-2" /> Baixar PDF
          </button>
          <button onClick={() => navigator.share?.({ title: "Gerador Eólico", url: window.location.href }).catch(() => {})}
            className="px-6 py-3 rounded-full font-bold border border-white/30 text-white">
            <Share2 className="inline w-4 h-4 mr-2" /> Compartilhar
          </button>
        </div>
        <p className="font-mono text-xs text-white/40 pt-8">IFG • Eng. Elétrica • Aula 5 — Eletrodinâmica</p>
      </div>
    </Section>
  );
}

/* ---------- Loading ---------- */
function Loading({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setP((x) => {
      if (x >= 100) { clearInterval(id); setTimeout(onDone, 300); return 100; }
      return x + 5;
    }), 35);
    return () => clearInterval(id);
  }, [onDone]);
  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: BG_DARK }}>
      <div className="text-4xl font-black bg-gradient-to-r from-[#00E5FF] to-[#B6FF00] bg-clip-text text-transparent animate-pulse">EÓLICO</div>
      <div className="mt-6 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#00E5FF] shadow-[0_0_20px_#00E5FF] transition-all" style={{ width: `${p}%` }} />
      </div>
      <div className="mt-3 font-mono text-xs text-white/60">Capturando energia do vento... {p}%</div>
    </motion.div>
  );
}

/* ---------- Página principal ---------- */
export default function GeradorEolico() {
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(false);
  const [audio, setAudio] = useState(false);
  const [current, setCurrent] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const { scrollYProgress } = useScroll();
  const sp = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  const barH = useTransform(sp, [0, 1], ["0%", "100%"]);

  const handleDownloadPDF = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 800] });
      for (let i = 0; i < SECTIONS.length; i++) {
        const el = document.getElementById(SECTIONS[i].id);
        if (!el) continue;
        el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        await new Promise((r) => setTimeout(r, 350));
        const canvas = await html2canvas(el, {
          backgroundColor: BG_DARK, scale: 1.5, useCORS: true, logging: false,
          windowWidth: el.scrollWidth, windowHeight: el.scrollHeight,
        });
        const img = canvas.toDataURL("image/jpeg", 0.9);
        const pw = 1280, ph = 800;
        const r = Math.min(pw / canvas.width, ph / canvas.height);
        const w = canvas.width * r, h = canvas.height * r;
        if (i > 0) pdf.addPage([1280, 800], "landscape");
        pdf.setFillColor(6, 18, 26);
        pdf.rect(0, 0, pw, ph, "F");
        pdf.addImage(img, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
      }
      pdf.save("gerador-eolico-ifg.pdf");
    } catch (e) {
      console.error(e);
      alert("Falha ao gerar PDF.");
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const idx = SECTIONS.findIndex((s) => {
        const el = document.getElementById(s.id);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        return r.top <= window.innerHeight / 2 && r.bottom >= window.innerHeight / 2;
      });
      if (idx >= 0) setCurrent(idx);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const h = () => handleDownloadPDF();
    window.addEventListener("ge-download-pdf", h);
    return () => window.removeEventListener("ge-download-pdf", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [downloading]);

  return (
    <>
      <style>{`
        @keyframes glitch1 { 0%,100%{transform:translate(0,0)} 20%{transform:translate(-2px,1px)} 40%{transform:translate(2px,-1px)} 60%{transform:translate(-1px,2px)} }
        @keyframes glitch2 { 0%,100%{transform:translate(0,0)} 25%{transform:translate(2px,-2px)} 50%{transform:translate(-2px,2px)} 75%{transform:translate(1px,1px)} }
        html, body { background: ${BG_DARK}; color: white; }
        @media (min-width: 768px) { html { cursor: none; } html *, html *:hover { cursor: none !important; } }
      `}</style>

      <AnimatePresence>{loading && <Loading onDone={() => setLoading(false)} />}</AnimatePresence>

      <div className="relative min-h-screen overflow-x-hidden font-sans" style={{ background: BG_DARK }}>
        <ParticlesBG />
        <NeonCursor />

        <div className="fixed top-6 left-6 z-40 font-mono text-xs tracking-widest text-white/70">
          <span className="text-[#00E5FF]">{String(current + 1).padStart(2, "0")}</span> / {String(SECTIONS.length).padStart(2,"0")} — {SECTIONS[current]?.label}
        </div>

        <button onClick={() => setMenu(true)}
          className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full border border-[#00E5FF]/50 bg-black/40 backdrop-blur-md flex items-center justify-center text-[#00E5FF] hover:bg-[#00E5FF]/10"
          aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>

        <button onClick={handleDownloadPDF} disabled={downloading}
          className="fixed top-6 right-20 z-40 h-12 px-4 rounded-full border border-[#B6FF00]/60 bg-black/40 backdrop-blur-md flex items-center gap-2 text-[#B6FF00] hover:bg-[#B6FF00]/10 disabled:opacity-60 font-mono text-xs"
          aria-label="Baixar PDF">
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {downloading ? "Gerando..." : "PDF"}
        </button>

        <button onClick={() => setAudio(!audio)}
          className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border border-[#B6FF00]/50 bg-black/40 backdrop-blur-md flex items-center justify-center text-[#B6FF00] hover:bg-[#B6FF00]/10 ${audio ? "animate-spin" : ""}`}
          aria-label="Áudio">
          {audio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 h-64 w-1 rounded-full bg-white/10 overflow-hidden hidden md:block">
          <motion.div className="w-full bg-gradient-to-b from-[#00E5FF] to-[#B6FF00]" style={{ height: barH }} />
        </div>

        <AnimatePresence>
          {menu && (
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 backdrop-blur-2xl bg-black/70 border-l border-white/10 p-8">
              <button onClick={() => setMenu(false)} className="text-white/60 hover:text-white mb-8"><X /></button>
              <ul className="space-y-3">
                {SECTIONS.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} onClick={() => setMenu(false)}
                      className="flex items-center gap-3 py-2 text-white/80 hover:text-[#00E5FF] font-mono text-sm">
                      <span className="text-[#B6FF00]">{String(i + 1).padStart(2, "0")}</span> {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <Hero />
          <Intro />
          <FaradaySec />
          <Funcionamento />
          <Inducao />
          <Etapas />
          <Grandezas />
          <Kamkwamba />
          <Vantagens />
          <Encerramento />
        </main>
      </div>
    </>
  );
}
