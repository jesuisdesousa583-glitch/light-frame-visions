import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "motion/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Zap, Magnet, Radio, Waves, Boxes, Activity, Sparkles, ChevronDown,
  Menu, X, Volume2, VolumeX, RefreshCw, Download, Share2, ArrowRight, Loader2,
} from "lucide-react";

/* ============================================================
   MAXWELL & STOKES — Apresentação Futurista IFTO
   Página única scroll-snap, glassmorphism, partículas canvas,
   cursor neon, barra de progresso, menu lateral.
   ============================================================ */

const NEON_GREEN = "#00FF88";
const NEON_RED = "#FF1744";
const BG_DARK = "#0a0a0f";

const SECTIONS = [
  { id: "hero", label: "Hero" },
  { id: "mapa", label: "Mapa Mental" },
  { id: "gauss-e", label: "Gauss Elétrica" },
  { id: "gauss-m", label: "Gauss Magnética" },
  { id: "faraday", label: "Faraday" },
  { id: "ampere", label: "Ampère-Maxwell" },
  { id: "stokes", label: "Stokes" },
  { id: "dashboard", label: "Dashboard" },
  { id: "fim", label: "Encerramento" },
];

/* ---------- Partículas 3D em canvas (verde/vermelho IFTO) ---------- */
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
    const N = 90;
    const parts = Array.from({ length: N }).map(() => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      z: Math.random() * 1 + 0.3,
      vx: (Math.random() - 0.5) * 0.4 * dpr,
      vy: (Math.random() - 0.5) * 0.4 * dpr,
      color: Math.random() > 0.5 ? NEON_GREEN : NEON_RED,
    }));
    const tick = () => {
      ctx.fillStyle = "rgba(10,10,15,0.25)";
      ctx.fillRect(0, 0, c.width, c.height);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > c.width) p.vx *= -1;
        if (p.y < 0 || p.y > c.height) p.vy *= -1;
        const r = 2 * p.z * dpr;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
        g.addColorStop(0, p.color);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2); ctx.fill();
      }
      // linhas entre partículas próximas
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 140 * dpr) {
            ctx.strokeStyle = `rgba(0,255,136,${0.15 * (1 - d / (140 * dpr))})`;
            ctx.lineWidth = 0.5 * dpr;
            ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="fixed inset-0 -z-10 pointer-events-none" />;
}

/* ---------- Cursor neon ---------- */
function NeonCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!ref.current) return;
      ref.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
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
        border: `2px solid ${hover ? NEON_RED : NEON_GREEN}`,
        boxShadow: `0 0 20px ${hover ? NEON_RED : NEON_GREEN}`,
        transition: "width .2s, height .2s, border-color .2s, box-shadow .2s",
      }}
    />
  );
}

/* ---------- Glitch title ---------- */
function GlitchTitle({ text }: { text: string }) {
  return (
    <h1 className="relative font-black tracking-tighter text-[clamp(3rem,10vw,9rem)] leading-none">
      <span className="relative z-10 bg-gradient-to-r from-[#00FF88] via-white to-[#FF1744] bg-clip-text text-transparent">
        {text}
      </span>
      <span aria-hidden className="absolute inset-0 text-[#00FF88] opacity-70 animate-[glitch1_3s_infinite]">{text}</span>
      <span aria-hidden className="absolute inset-0 text-[#FF1744] opacity-70 animate-[glitch2_3s_infinite]">{text}</span>
    </h1>
  );
}

/* ---------- Glass card wrapper ---------- */
function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-3xl shadow-[0_0_60px_rgba(0,255,136,0.08)] ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Section shell ---------- */
function Section({ id, children, n }: { id: string; children: React.ReactNode; n: number }) {
  return (
    <section
      id={id}
      className="relative min-h-screen w-full snap-start flex items-center justify-center px-6 py-24"
    >
      <div className="absolute top-8 left-8 z-20 font-mono text-xs tracking-[0.3em] text-[#00FF88]/80">
        SEÇÃO {String(n).padStart(2, "0")} / 09
      </div>
      <div className="relative w-full max-w-7xl mx-auto">{children}</div>
    </section>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  return (
    <Section id="hero" n={1}>
      <div className="text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00FF88]/40 bg-[#00FF88]/5 text-[#00FF88] font-mono text-xs tracking-widest"
        >
          <Sparkles className="w-3 h-3" /> INSTITUTO FEDERAL DO TOCANTINS
        </motion.div>
        <GlitchTitle text="MAXWELL & STOKES" />
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto font-light"
        >
          Desvendando os segredos do <span className="text-[#00FF88]">eletromagnetismo</span> através
          de visualização <span className="text-[#FF1744]">interativa</span>.
        </motion.p>
        <motion.a
          href="#mapa"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-3 mt-8 px-10 py-5 rounded-full font-bold text-black bg-gradient-to-r from-[#00FF88] to-[#FF1744] shadow-[0_0_40px_rgba(0,255,136,0.5)]"
        >
          EXPLORAR <ArrowRight className="w-5 h-5" />
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

/* ---------- Mapa mental orbital ---------- */
const EQS = [
  { name: "Gauss E", formula: "∮E·dA = Q/ε₀", color: NEON_RED, desc: "Cargas elétricas geram campo elétrico divergente." },
  { name: "Gauss M", formula: "∮B·dA = 0", color: NEON_GREEN, desc: "Não existem monopolos magnéticos." },
  { name: "Faraday", formula: "∮E·dl = -dΦ_B/dt", color: NEON_RED, desc: "Campo magnético variável induz campo elétrico." },
  { name: "Ampère-M", formula: "∮B·dl = μ₀I + μ₀ε₀dΦ_E/dt", color: NEON_GREEN, desc: "Correntes e campos E variáveis geram campo magnético." },
];

function MapaMental() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Section id="mapa" n={2}>
      <h2 className="text-center text-4xl md:text-5xl font-bold mb-12">
        As <span className="text-[#00FF88]">4 Equações</span> de Maxwell
      </h2>
      <div className="relative mx-auto w-[min(90vw,560px)] aspect-square">
        {/* núcleo */}
        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-[#00FF88] to-[#FF1744] flex items-center justify-center font-black text-black text-xl shadow-[0_0_60px_rgba(255,23,68,0.5)]">
          MAXWELL
        </div>
        {/* órbita */}
        <div className="absolute inset-0 rounded-full border border-[#00FF88]/20 animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-[#FF1744]/15 animate-[spin_24s_linear_infinite_reverse]" />
        {EQS.map((eq, i) => {
          const angle = (i / EQS.length) * Math.PI * 2;
          const r = 42; // %
          const x = 50 + r * Math.cos(angle);
          const y = 50 + r * Math.sin(angle);
          return (
            <motion.button
              key={i}
              onClick={() => setOpen(i)}
              whileHover={{ scale: 1.15 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full backdrop-blur-xl bg-white/5 border-2 flex items-center justify-center text-center text-xs font-mono p-2"
              style={{ left: `${x}%`, top: `${y}%`, borderColor: eq.color, color: eq.color, boxShadow: `0 0 30px ${eq.color}55` }}
            >
              {eq.name}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Glass className="p-8 max-w-lg space-y-4">
                <h3 className="text-3xl font-bold" style={{ color: EQS[open].color }}>{EQS[open].name}</h3>
                <p className="font-mono text-2xl text-white">{EQS[open].formula}</p>
                <p className="text-white/70">{EQS[open].desc}</p>
                <button onClick={() => setOpen(null)} className="px-5 py-2 rounded-full bg-white/10 text-white text-sm">Fechar</button>
              </Glass>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}

/* ---------- Card 3D tilt genérico ---------- */
function TiltCard({ children, glow }: { children: React.ReactNode; glow: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        ref.current!.style.transform = `perspective(1200px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg)`;
      }}
      onMouseLeave={() => { if (ref.current) ref.current.style.transform = "perspective(1200px)"; }}
      className="transition-transform duration-200"
      style={{ filter: `drop-shadow(0 0 40px ${glow}55)` }}
    >
      {children}
    </div>
  );
}

/* ---------- Gauss Elétrica ---------- */
function GaussEletrica() {
  const [q, setQ] = useState(50);
  return (
    <Section id="gauss-e" n={3}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <TiltCard glow={NEON_RED}>
          <Glass className="p-8 md:p-10 space-y-5">
            <div className="text-xs font-mono tracking-widest text-[#FF1744]">EQUAÇÃO 01</div>
            <h2 className="text-3xl md:text-4xl font-bold">Lei de Gauss para Campo Elétrico</h2>
            <p className="font-mono text-2xl text-white py-4 border-y border-white/10">∮E·dA = Q/ε₀</p>
            <p className="text-white/70">
              O fluxo do campo elétrico através de uma superfície fechada é proporcional à carga total contida.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-mono text-white/60">CARGA Q = {q} nC</label>
              <input type="range" min={0} max={100} value={q} onChange={(e) => setQ(+e.target.value)}
                className="w-full accent-[#FF1744]" />
            </div>
            <p className="text-sm text-white/50 italic">Exemplo: raio em tempestade.</p>
          </Glass>
        </TiltCard>
        <div className="relative aspect-square max-w-md mx-auto">
          <div
            className="absolute inset-0 rounded-full bg-gradient-radial from-[#FF1744] to-transparent"
            style={{ opacity: q / 100, transition: "opacity .3s" }}
          />
          {[...Array(12)].map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <div key={i} className="absolute top-1/2 left-1/2 origin-left h-px bg-gradient-to-r from-[#FF1744] to-transparent"
                style={{ width: `${50 + q / 3}%`, transform: `rotate(${a}rad)` }} />
            );
          })}
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-[#FF1744] shadow-[0_0_60px_#FF1744] flex items-center justify-center font-black text-2xl">
            +Q
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- Gauss Magnética ---------- */
function GaussMagnetica() {
  return (
    <Section id="gauss-m" n={4}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="relative aspect-square max-w-md mx-auto">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="absolute inset-0 rounded-full border border-[#00FF88]/40 animate-[pulse_3s_ease-in-out_infinite]"
              style={{ transform: `scale(${0.3 + i * 0.1})`, animationDelay: `${i * 0.15}s` }} />
          ))}
          <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-12 rounded-md bg-gradient-to-r from-[#FF1744] to-[#00FF88] flex">
            <div className="flex-1 flex items-center justify-center font-black">N</div>
            <div className="flex-1 flex items-center justify-center font-black">S</div>
          </div>
        </div>
        <TiltCard glow={NEON_GREEN}>
          <Glass className="p-8 md:p-10 space-y-5">
            <div className="text-xs font-mono tracking-widest text-[#00FF88]">EQUAÇÃO 02</div>
            <h2 className="text-3xl md:text-4xl font-bold">Lei de Gauss para o Magnetismo</h2>
            <p className="font-mono text-2xl text-white py-4 border-y border-white/10">∮B·dA = 0</p>
            <p className="text-white/70">
              Linhas de campo magnético são sempre fechadas — <strong className="text-[#00FF88]">não existem monopolos magnéticos</strong>.
            </p>
            <p className="text-sm text-white/50 italic">
              Corte o ímã ao meio e você terá dois ímãs, cada um com norte e sul.
            </p>
          </Glass>
        </TiltCard>
      </div>
    </Section>
  );
}

/* ---------- Faraday timeline ---------- */
const TIMELINE = [
  { y: "1831", t: "Faraday descobre a indução eletromagnética" },
  { y: "1865", t: "Maxwell formaliza as 4 equações" },
  { y: "1882", t: "Primeiro gerador elétrico industrial" },
  { y: "2024", t: "Hidrelétricas e eólicas do Tocantins" },
];
function Faraday() {
  return (
    <Section id="faraday" n={5}>
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold">Lei de <span className="text-[#FF1744]">Faraday</span></h2>
        <p className="font-mono text-xl mt-4 text-white">∮E·dl = -dΦ_B/dt</p>
      </div>
      <div className="relative max-w-3xl mx-auto pl-10">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-[#00FF88] via-[#FF1744] to-transparent" />
        {TIMELINE.map((it, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}
            className="relative mb-10"
          >
            <div className="absolute -left-[34px] top-2 w-4 h-4 rounded-full bg-[#00FF88] shadow-[0_0_20px_#00FF88]" />
            <Glass className="p-6">
              <div className="font-mono text-[#FF1744] text-sm">{it.y}</div>
              <div className="text-lg mt-1">{it.t}</div>
            </Glass>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Ampère-Maxwell espectro ---------- */
const ESPECTRO = [
  { name: "Rádio", hz: "10⁶", ex: "AM/FM" },
  { name: "Micro-ondas", hz: "10⁹", ex: "Wi-Fi" },
  { name: "Infravermelho", hz: "10¹²", ex: "Controle TV" },
  { name: "Visível", hz: "10¹⁴", ex: "Luz" },
  { name: "UV", hz: "10¹⁶", ex: "Sol" },
  { name: "Raios X", hz: "10¹⁸", ex: "Medicina" },
  { name: "Gama", hz: "10²⁰", ex: "Núcleo" },
];
function Ampere() {
  const [sel, setSel] = useState(1);
  return (
    <Section id="ampere" n={6}>
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold">Ampère-Maxwell</h2>
        <p className="font-mono text-lg mt-4 text-white/80">∮B·dl = μ₀I + μ₀ε₀ dΦ_E/dt</p>
      </div>
      <Glass className="p-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {ESPECTRO.map((s, i) => (
            <button
              key={i}
              onClick={() => setSel(i)}
              className={`px-4 py-3 rounded-xl font-mono text-xs whitespace-nowrap transition-all ${
                sel === i ? "bg-gradient-to-r from-[#00FF88] to-[#FF1744] text-black" : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-center">
          <div><div className="text-xs font-mono text-white/50">FREQUÊNCIA</div><div className="text-2xl font-bold text-[#00FF88] mt-1">{ESPECTRO[sel].hz} Hz</div></div>
          <div><div className="text-xs font-mono text-white/50">FAIXA</div><div className="text-2xl font-bold mt-1">{ESPECTRO[sel].name}</div></div>
          <div><div className="text-xs font-mono text-white/50">APLICAÇÃO</div><div className="text-2xl font-bold text-[#FF1744] mt-1">{ESPECTRO[sel].ex}</div></div>
        </div>
        {/* onda animada */}
        <svg viewBox="0 0 600 100" className="w-full mt-6">
          <motion.path
            key={sel}
            d={`M0 50 ${Array.from({ length: 60 }).map((_, i) => `Q ${i * 10 + 5} ${50 - 30 * (sel + 1) / 7} ${i * 10 + 10} 50`).join(" ")}`}
            stroke="url(#g)" strokeWidth="2" fill="none"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
          />
          <defs>
            <linearGradient id="g"><stop offset="0%" stopColor={NEON_GREEN} /><stop offset="100%" stopColor={NEON_RED} /></linearGradient>
          </defs>
        </svg>
      </Glass>
    </Section>
  );
}

/* ---------- Stokes cubo ---------- */
function Stokes() {
  const [r, setR] = useState({ x: -20, y: 30 });
  return (
    <Section id="stokes" n={7}>
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        <div className="flex items-center justify-center perspective-[1000px]" style={{ perspective: 1000 }}>
          <div
            className="relative w-56 h-56"
            style={{ transformStyle: "preserve-3d", transform: `rotateX(${r.x}deg) rotateY(${r.y}deg)`, transition: "transform .3s" }}
            onMouseMove={(e) => {
              const t = e.currentTarget.getBoundingClientRect();
              setR({ x: -((e.clientY - t.top) / t.height - 0.5) * 60, y: ((e.clientX - t.left) / t.width - 0.5) * 60 });
            }}
          >
            {[
              { tf: "translateZ(112px)", c: NEON_GREEN, t: "∮F·dr" },
              { tf: "rotateY(180deg) translateZ(112px)", c: NEON_RED, t: "∬(∇×F)·dS" },
              { tf: "rotateY(90deg) translateZ(112px)", c: NEON_GREEN, t: "C" },
              { tf: "rotateY(-90deg) translateZ(112px)", c: NEON_RED, t: "S" },
              { tf: "rotateX(90deg) translateZ(112px)", c: "#fff", t: "∇×F" },
              { tf: "rotateX(-90deg) translateZ(112px)", c: "#fff", t: "F" },
            ].map((f, i) => (
              <div key={i}
                className="absolute inset-0 backdrop-blur-md bg-white/[0.04] border flex items-center justify-center font-mono text-lg"
                style={{ transform: f.tf, borderColor: f.c, color: f.c, boxShadow: `0 0 30px ${f.c}55` }}>
                {f.t}
              </div>
            ))}
          </div>
        </div>
        <Glass className="p-8 md:p-10 space-y-5">
          <div className="text-xs font-mono tracking-widest text-[#00FF88]">TEOREMA DE STOKES</div>
          <h2 className="text-3xl md:text-4xl font-bold">A natureza respeita a matemática</h2>
          <p className="font-mono text-xl text-white py-4 border-y border-white/10">∮_C F·dr = ∬_S (∇×F)·dS</p>
          <p className="text-white/70">
            A circulação de um campo ao longo de uma curva fechada é igual ao fluxo do rotacional através de qualquer superfície que ela limita.
          </p>
          <p className="text-sm text-white/50 italic">Exemplo natural: furacão visto de cima.</p>
        </Glass>
      </div>
    </Section>
  );
}

/* ---------- Dashboard ---------- */
const KPI = [
  { label: "Energia elétrica BR", v: "709 TWh", c: NEON_GREEN },
  { label: "Usuários Wi-Fi mundial", v: "5.4 bi", c: NEON_RED },
  { label: "Satélites em órbita", v: "9 832", c: NEON_GREEN },
  { label: "Furacões 2025", v: "18", c: NEON_RED },
  { label: "Temp. média global", v: "+1.45 °C", c: NEON_GREEN },
  { label: "Hidrelétricas TO", v: "12", c: NEON_RED },
];
function Counter({ end }: { end: string }) {
  // simples — apenas exibe; sem animação numérica para preservar formatação
  return <span>{end}</span>;
}
function Dashboard() {
  return (
    <Section id="dashboard" n={8}>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#00FF88]/40 font-mono text-xs text-[#00FF88]">
          <Activity className="w-3 h-3" /> CONTROLE DE MISSÃO
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mt-4">Maxwell no mundo real</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {KPI.map((k, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Glass className="p-6 h-full">
              <div className="text-xs font-mono text-white/50 tracking-widest">{k.label.toUpperCase()}</div>
              <div className="text-4xl font-black mt-3" style={{ color: k.c, textShadow: `0 0 20px ${k.c}80` }}>
                <Counter end={k.v} />
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div className="h-full" style={{ background: k.c }}
                  initial={{ width: 0 }} whileInView={{ width: `${30 + i * 10}%` }} viewport={{ once: true }} transition={{ duration: 1 }} />
              </div>
            </Glass>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* ---------- Encerramento ---------- */
function Encerramento() {
  return (
    <Section id="fim" n={9}>
      <div className="text-center space-y-8">
        <motion.div
          animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="mx-auto w-40 h-40 rounded-full border-2 border-[#00FF88] flex items-center justify-center text-2xl font-black bg-gradient-to-br from-[#006633] to-[#CC0000]"
        >
          IFTO
        </motion.div>
        <h2 className="text-4xl md:text-6xl font-bold max-w-3xl mx-auto">
          A <span className="text-[#00FF88]">matemática</span> move o <span className="text-[#FF1744]">universo</span>.
        </h2>
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <a href="#hero" className="px-6 py-3 rounded-full font-bold text-black bg-[#00FF88] shadow-[0_0_30px_#00FF88]">
            <RefreshCw className="inline w-4 h-4 mr-2" /> Reiniciar
          </a>
          <button onClick={() => window.dispatchEvent(new CustomEvent("ms-download-pdf"))} className="px-6 py-3 rounded-full font-bold text-black bg-[#FF1744] shadow-[0_0_30px_#FF1744]">
            <Download className="inline w-4 h-4 mr-2" /> Baixar PDF
          </button>
          <button
            onClick={() => navigator.share?.({ title: "Maxwell & Stokes", url: window.location.href }).catch(() => {})}
            className="px-6 py-3 rounded-full font-bold border border-white/30 text-white"
          >
            <Share2 className="inline w-4 h-4 mr-2" /> Compartilhar
          </button>
        </div>
        <p className="font-mono text-xs text-white/40 pt-8">IFTO • Eletromagnetismo • 2026</p>
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
      return x + 4;
    }), 40);
    return () => clearInterval(id);
  }, [onDone]);
  return (
    <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: BG_DARK }}>
      <div className="text-4xl font-black bg-gradient-to-r from-[#00FF88] to-[#FF1744] bg-clip-text text-transparent animate-pulse">IFTO</div>
      <div className="mt-6 w-64 h-1 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full bg-[#00FF88] shadow-[0_0_20px_#00FF88] transition-all" style={{ width: `${p}%` }} />
      </div>
      <div className="mt-3 font-mono text-xs text-white/60">Inicializando eletromagnetismo... {p}%</div>
    </motion.div>
  );
}

/* ---------- Página principal ---------- */
export default function MaxwellStokes() {
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
          backgroundColor: BG_DARK,
          scale: 1.5,
          useCORS: true,
          logging: false,
          windowWidth: el.scrollWidth,
          windowHeight: el.scrollHeight,
        });
        const img = canvas.toDataURL("image/jpeg", 0.9);
        const pw = 1280, ph = 800;
        const r = Math.min(pw / canvas.width, ph / canvas.height);
        const w = canvas.width * r, h = canvas.height * r;
        if (i > 0) pdf.addPage([1280, 800], "landscape");
        pdf.setFillColor(10, 10, 15);
        pdf.rect(0, 0, pw, ph, "F");
        pdf.addImage(img, "JPEG", (pw - w) / 2, (ph - h) / 2, w, h);
      }
      pdf.save("maxwell-stokes-ifto.pdf");
    } catch (e) {
      console.error(e);
      alert("Falha ao gerar PDF. Tente novamente.");
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
    window.addEventListener("ms-download-pdf", h);
    return () => window.removeEventListener("ms-download-pdf", h);
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

        {/* Indicador seção */}
        <div className="fixed top-6 left-6 z-40 font-mono text-xs tracking-widest text-white/70">
          <span className="text-[#00FF88]">{String(current + 1).padStart(2, "0")}</span> / 09 — {SECTIONS[current]?.label}
        </div>

        {/* Botão menu */}
        <button onClick={() => setMenu(true)}
          className="fixed top-6 right-6 z-40 w-12 h-12 rounded-full border border-[#00FF88]/50 bg-black/40 backdrop-blur-md flex items-center justify-center text-[#00FF88] hover:bg-[#00FF88]/10"
          aria-label="Abrir menu">
          <Menu className="w-5 h-5" />
        </button>

        {/* Botão áudio */}
        <button onClick={() => setAudio(!audio)}
          className={`fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full border border-[#FF1744]/50 bg-black/40 backdrop-blur-md flex items-center justify-center text-[#FF1744] hover:bg-[#FF1744]/10 ${audio ? "animate-spin" : ""}`}
          aria-label="Áudio">
          {audio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
        </button>

        {/* Barra progresso */}
        <div className="fixed right-3 top-1/2 -translate-y-1/2 z-40 h-64 w-1 rounded-full bg-white/10 overflow-hidden hidden md:block">
          <motion.div className="w-full bg-gradient-to-b from-[#00FF88] to-[#FF1744]" style={{ height: barH }} />
        </div>

        {/* Drawer menu */}
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
                      className="flex items-center gap-3 py-2 text-white/80 hover:text-[#00FF88] font-mono text-sm">
                      <span className="text-[#FF1744]">{String(i + 1).padStart(2, "0")}</span> {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <main>
          <Hero />
          <MapaMental />
          <GaussEletrica />
          <GaussMagnetica />
          <Faraday />
          <Ampere />
          <Stokes />
          <Dashboard />
          <Encerramento />
        </main>
      </div>
    </>
  );
}
