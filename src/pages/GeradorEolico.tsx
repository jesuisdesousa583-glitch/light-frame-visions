import { Fragment, Suspense, useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  Activity, ArrowRight, BookOpen, Cpu, Download, Film, Gauge, Globe2, Leaf,
  Lightbulb, Loader2, Menu, Rocket, Sparkles, Wind, Zap,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* ============================== TOKENS ============================== */
const C = {
  bg: "#0a0a0f",
  bg2: "#1a1a2e",
  green: "#006633",
  greenNeon: "#00FF88",
  red: "#CC0000",
  redNeon: "#FF1744",
  yellow: "#FFD700",
  blue: "#00AAFF",
};

/* ============================== 3D HERO ============================== */
function Turbine({ position, color, speed = 1 }: { position: [number, number, number]; color: string; speed?: number }) {
  const rotor = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (rotor.current) rotor.current.rotation.z += dt * speed * 1.8;
  });
  return (
    <group position={position}>
      {/* mast */}
      <mesh position={[0, -1.6, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 3.4, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={color} emissiveIntensity={0.15} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* nacelle */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.45, 0.3, 0.6]} />
        <meshStandardMaterial color="#222" emissive={color} emissiveIntensity={0.4} />
      </mesh>
      {/* rotor */}
      <group ref={rotor} position={[0, 0.2, 0.35]}>
        {[0, 120, 240].map((deg) => (
          <mesh key={deg} rotation={[0, 0, (deg * Math.PI) / 180]}>
            <boxGeometry args={[0.08, 1.8, 0.02]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
        </mesh>
      </group>
    </group>
  );
}

function WindParticles() {
  const ref = useRef<THREE.Points>(null);
  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }
  useFrame((_, dt) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += dt * 2.5;
      if (arr[i * 3] > 10) arr[i * 3] = -10;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={C.blue} size={0.04} transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function Hero3D() {
  return (
    <Canvas camera={{ position: [0, 1, 7], fov: 55 }} dpr={[1, 2]}>
      <color attach="background" args={[C.bg]} />
      <fog attach="fog" args={[C.bg, 8, 18]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1.2} color={C.greenNeon} />
      <pointLight position={[-5, -2, 3]} intensity={1} color={C.blue} />
      <pointLight position={[0, 3, -3]} intensity={0.6} color={C.yellow} />
      <Stars radius={40} depth={30} count={1500} factor={3} fade speed={1} />
      <WindParticles />
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
        <Turbine position={[-3, 0.5, 0]} color={C.greenNeon} speed={1.3} />
      </Float>
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
        <Turbine position={[0, -0.2, -1]} color={C.greenNeon} speed={0.9} />
      </Float>
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.3}>
        <Turbine position={[3, 0.3, 0.5]} color={C.greenNeon} speed={1.5} />
      </Float>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
    </Canvas>
  );
}

/* ============================== UI PRIMITIVES ============================== */
const Panel = ({ children, className = "", accent = C.greenNeon }: any) => (
  <div
    className={`relative rounded-2xl backdrop-blur-xl ${className}`}
    style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${accent}33`,
      boxShadow: `0 0 40px ${accent}15, inset 0 1px 0 rgba(255,255,255,0.05)`,
    }}
  >
    {children}
  </div>
);

const Chip = ({ children, color = C.greenNeon }: any) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] tracking-[0.25em] uppercase"
    style={{ background: `${color}15`, border: `1px solid ${color}55`, color }}
  >
    {children}
  </span>
);

const Metric = ({ label, value, unit, color = C.greenNeon, icon: Icon }: any) => (
  <Panel accent={color} className="p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[10px] tracking-[0.25em] uppercase text-white/60 font-mono">{label}</span>
      {Icon && <Icon className="w-4 h-4" style={{ color }} />}
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold tabular-nums" style={{ color }}>{value}</span>
      <span className="text-xs text-white/50 font-mono">{unit}</span>
    </div>
    <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
      <div className="h-full rounded-full animate-pulse" style={{ width: "78%", background: `linear-gradient(90deg, ${color}, transparent)` }} />
    </div>
  </Panel>
);

/* ============================== SECTION SHELL ============================== */
function Section({ id, idx, total, kicker, title, children, accent = C.greenNeon }: any) {
  return (
    <section
      id={id}
      data-slide
      className="relative min-h-screen w-full snap-start flex items-center justify-center px-6 md:px-12 py-16"
    >
      {/* HUD corners */}
      <div className="pointer-events-none absolute inset-6 z-10">
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: accent }} />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: accent }} />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: accent }} />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: accent }} />
      </div>
      <div className="absolute top-6 right-6 z-10 font-mono text-[10px] tracking-[0.3em]" style={{ color: accent }}>
        {String(idx).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className="relative z-10 w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.7 }}
        >
          {kicker && <div className="mb-3"><Chip color={accent}>{kicker}</Chip></div>}
          {title && (
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-8" style={{ textShadow: `0 0 40px ${accent}55` }}>
              {title}
            </h2>
          )}
          {children}
        </motion.div>
      </div>
    </section>
  );
}

/* ============================== MAIN PAGE ============================== */
export default function GeradorEolico() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const TOTAL = 10;

  const nav = [
    { id: "hero", label: "Hero Imersivo", icon: Rocket },
    { id: "intro", label: "O Projeto", icon: BookOpen },
    { id: "kamkwamba", label: "William Kamkwamba", icon: Film },
    { id: "comparativo", label: "Comparativo", icon: Activity },
    { id: "faraday", label: "Lei de Faraday", icon: Zap },
    { id: "etapas", label: "Conversão de Energia", icon: Cpu },
    { id: "grandezas", label: "Grandezas Elétricas", icon: Gauge },
    { id: "dashboard", label: "Dashboard Científico", icon: Activity },
    { id: "sustentabilidade", label: "Impacto Global", icon: Globe2 },
    { id: "encerramento", label: "Encerramento", icon: Sparkles },
  ];

  /* ---- PDF EXPORT ---- */
  useEffect(() => {
    const handler = async () => {
      setDownloading(true);
      try {
        const slides = Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 800] });
        for (let i = 0; i < slides.length; i++) {
          slides[i].scrollIntoView({ behavior: "instant" as ScrollBehavior });
          await new Promise((r) => setTimeout(r, 400));
          const canvas = await html2canvas(slides[i], { backgroundColor: C.bg, scale: 1.2, useCORS: true, logging: false });
          const img = canvas.toDataURL("image/jpeg", 0.9);
          if (i > 0) pdf.addPage([1280, 800], "landscape");
          pdf.addImage(img, "JPEG", 0, 0, 1280, 800);
        }
        pdf.save("gerador-eolico-ifto.pdf");
      } finally {
        setDownloading(false);
      }
    };
    window.addEventListener("ge-download-pdf", handler);
    return () => window.removeEventListener("ge-download-pdf", handler);
  }, []);

  return (
    <div
      className="relative min-h-screen text-white overflow-x-hidden snap-y snap-mandatory"
      style={{
        background: `radial-gradient(circle at 20% 10%, ${C.green}22 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${C.blue}22 0%, transparent 50%), ${C.bg}`,
        fontFamily: "'JetBrains Mono', system-ui, sans-serif",
      }}
    >
      {/* Grid overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07] z-0"
        style={{
          backgroundImage: `linear-gradient(${C.greenNeon} 1px, transparent 1px), linear-gradient(90deg, ${C.greenNeon} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{ scaleX, background: `linear-gradient(90deg, ${C.greenNeon}, ${C.blue}, ${C.yellow})` }}
      />

      {/* Top HUD */}
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 backdrop-blur-md" style={{ background: `${C.bg}aa`, borderBottom: `1px solid ${C.greenNeon}22` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${C.greenNeon}22`, border: `1px solid ${C.greenNeon}` }}>
            <Wind className="w-4 h-4" style={{ color: C.greenNeon }} />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.greenNeon }}>IFTO · Lab Energia</div>
            <div className="text-xs text-white/60 font-mono">SYS.WIND-GEN.v2.6</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.dispatchEvent(new Event("ge-download-pdf"))}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all hover:scale-105"
            style={{ background: `${C.yellow}15`, border: `1px solid ${C.yellow}`, color: C.yellow }}
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            PDF
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg"
            style={{ background: `${C.greenNeon}15`, border: `1px solid ${C.greenNeon}55` }}
          >
            <Menu className="w-4 h-4" style={{ color: C.greenNeon }} />
          </button>
        </div>
      </header>

      {/* Side menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-xl" style={{ background: `${C.bg}dd` }} onClick={() => setMenuOpen(false)}>
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="absolute right-0 top-0 bottom-0 w-80 p-8 overflow-auto"
            style={{ background: C.bg2, borderLeft: `1px solid ${C.greenNeon}55` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-mono tracking-[0.3em] uppercase mb-6" style={{ color: C.greenNeon }}>Navegação</div>
            {nav.map((n, i) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all hover:bg-white/5"
              >
                <span className="font-mono text-xs" style={{ color: C.greenNeon }}>{String(i + 1).padStart(2, "0")}</span>
                <n.icon className="w-4 h-4 text-white/60" />
                <span className="text-sm text-white/90">{n.label}</span>
              </a>
            ))}
          </motion.div>
        </div>
      )}

      {/* =========================== SECTIONS =========================== */}

      {/* 01 - HERO 3D */}
      <section id="hero" data-slide className="relative h-screen w-full snap-start overflow-hidden">
        <div className="absolute inset-0">
          <Suspense fallback={<div className="w-full h-full" style={{ background: C.bg }} />}>
            <Hero3D />
          </Suspense>
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-6"
          >
            <Chip color={C.yellow}><Zap className="w-3 h-3" /> Instituto Federal do Tocantins</Chip>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="text-6xl md:text-9xl font-black tracking-tighter"
            style={{
              background: `linear-gradient(135deg, ${C.greenNeon} 0%, ${C.blue} 50%, ${C.yellow} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: `0 0 80px ${C.greenNeon}88`,
            }}
          >
            GERADOR EÓLICO
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="mt-6 text-lg md:text-2xl text-white/80 max-w-3xl font-light"
          >
            Do protótipo de laboratório a Malaui — uma jornada de <span style={{ color: C.greenNeon }}>energia limpa</span>, <span style={{ color: C.blue }}>vento</span> e <span style={{ color: C.yellow }}>engenhosidade humana</span>.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-12 flex gap-3 flex-wrap justify-center"
          >
            <Chip color={C.greenNeon}>10 Seções</Chip>
            <Chip color={C.blue}>3D Imersivo</Chip>
            <Chip color={C.yellow}>Dashboard Científico</Chip>
            <Chip color={C.redNeon}>IFTO 2026</Chip>
          </motion.div>
        </div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-xs font-mono tracking-[0.3em] uppercase"
          style={{ color: C.greenNeon }}
        >
          ↓ scroll
        </motion.div>
      </section>

      {/* 02 - INTRODUÇÃO */}
      <Section id="intro" idx={2} total={TOTAL} kicker="// briefing" title="O Projeto" accent={C.greenNeon}>
        <div className="grid md:grid-cols-12 gap-6">
          <Panel className="p-8 md:col-span-7" accent={C.greenNeon}>
            <p className="text-lg text-white/85 leading-relaxed mb-4">
              Um <strong style={{ color: C.greenNeon }}>gerador eólico</strong> transforma a energia cinética do vento em
              energia elétrica utilizável. Nosso protótipo do IFTO replica, em pequena escala, o mesmo princípio físico que
              alimenta parques eólicos gigantes e que, em 2001, mudou uma aldeia inteira em Malaui.
            </p>
            <p className="text-base text-white/70 leading-relaxed">
              Inspirado pela história de <strong style={{ color: C.yellow }}>William Kamkwamba</strong> — "O Menino que Descobriu
              o Vento" — o projeto demonstra que ciência de qualidade depende mais de criatividade do que de recursos.
            </p>
          </Panel>
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
            <Metric label="Pás" value="3" unit="un." color={C.greenNeon} icon={Wind} />
            <Metric label="Tensão" value="3.7" unit="V" color={C.yellow} icon={Zap} />
            <Metric label="Vento mín." value="2.5" unit="m/s" color={C.blue} icon={Activity} />
            <Metric label="CO₂ evitado" value="0" unit="kg" color={C.greenNeon} icon={Leaf} />
          </div>
        </div>
      </Section>

      {/* 03 - KAMKWAMBA */}
      <Section id="kamkwamba" idx={3} total={TOTAL} kicker="// inspiração" title="O Menino que Descobriu o Vento" accent={C.yellow}>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <Panel className="p-8" accent={C.yellow}>
            <Film className="w-10 h-10 mb-4" style={{ color: C.yellow }} />
            <div className="text-3xl font-bold mb-2 text-white">William Kamkwamba</div>
            <div className="text-sm text-white/60 mb-6 font-mono">Malaui · 2001 · 14 anos</div>
            <p className="text-white/85 leading-relaxed mb-4">
              Durante uma seca devastadora, William abandonou a escola por não poder pagar as mensalidades. Na biblioteca da
              aldeia, encontrou um livro sobre energia e decidiu construir uma turbina eólica com <strong style={{ color: C.yellow }}>peças
              de bicicleta, ventiladores quebrados e canos PVC</strong>.
            </p>
            <p className="text-white/85 leading-relaxed">
              Sua invenção iluminou casas, bombeou água e mostrou ao mundo que <em style={{ color: C.greenNeon }}>"é possível"</em>.
            </p>
          </Panel>
          <div className="space-y-4">
            {[
              { y: "2001", t: "Seca em Malaui e abandono escolar", c: C.red },
              { y: "2002", t: "Primeira turbina de 5W (bicicleta + ventilador)", c: C.yellow },
              { y: "2007", t: "TED Global · reconhecimento mundial", c: C.blue },
              { y: "2019", t: "Filme Netflix homônimo lançado", c: C.greenNeon },
            ].map((m) => (
              <Panel key={m.y} className="p-5 flex items-center gap-5" accent={m.c}>
                <div className="text-2xl font-black tabular-nums" style={{ color: m.c }}>{m.y}</div>
                <div className="flex-1 text-white/85">{m.t}</div>
                <ArrowRight className="w-4 h-4" style={{ color: m.c }} />
              </Panel>
            ))}
          </div>
        </div>
      </Section>

      {/* 04 - COMPARATIVO */}
      <Section id="comparativo" idx={4} total={TOTAL} kicker="// análise comparativa" title="Protótipo IFTO × Turbina de Kamkwamba" accent={C.blue}>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { h: "MATERIAIS", a: "PVC, motor DC, fios cobre, base MDF", b: "Bicicleta, ventilador, PVC reciclado", c: C.greenNeon },
            { h: "POTÊNCIA", a: "~ 3.5 W (laboratório)", b: "~ 12 W (carrega bateria)", c: C.yellow },
            { h: "OBJETIVO", a: "Demonstração didática", b: "Iluminar 4 lâmpadas + rádio", c: C.blue },
            { h: "CONTEXTO", a: "Sala de aula · IFTO", b: "Aldeia rural · Malaui", c: C.redNeon },
            { h: "PRINCÍPIO", a: "Lei de Faraday (ε = -dΦ/dt)", b: "Lei de Faraday (ε = -dΦ/dt)", c: C.greenNeon },
            { h: "LEGADO", a: "Próximas gerações cientistas", b: "Aldeia eletrificada + livro + filme", c: C.yellow },
          ].map((row) => (
            <Panel key={row.h} className="p-6" accent={row.c}>
              <div className="text-[10px] tracking-[0.25em] font-mono mb-4" style={{ color: row.c }}>{row.h}</div>
              <div className="space-y-3">
                <div>
                  <div className="text-[10px] uppercase text-white/40 mb-1">IFTO</div>
                  <div className="text-sm text-white/90">{row.a}</div>
                </div>
                <div className="h-px" style={{ background: `${row.c}33` }} />
                <div>
                  <div className="text-[10px] uppercase text-white/40 mb-1">Malaui</div>
                  <div className="text-sm text-white/90">{row.b}</div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      {/* 05 - FARADAY */}
      <Section id="faraday" idx={5} total={TOTAL} kicker="// física fundamental" title="A Lei que move tudo" accent={C.redNeon}>
        <div className="grid md:grid-cols-12 gap-6">
          <Panel className="md:col-span-7 p-10 flex flex-col justify-center items-center text-center" accent={C.redNeon}>
            <div className="text-xs font-mono tracking-[0.3em] uppercase mb-6" style={{ color: C.redNeon }}>Lei da Indução · Michael Faraday · 1831</div>
            <div
              className="text-6xl md:text-8xl font-black mb-6"
              style={{
                background: `linear-gradient(135deg, ${C.redNeon}, ${C.yellow})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              ε = − dΦ⁄dt
            </div>
            <p className="text-white/70 max-w-xl">
              Uma variação de fluxo magnético (Φ) através de uma bobina <strong style={{ color: C.yellow }}>induz</strong>
              uma força eletromotriz (ε) — convertendo movimento em eletricidade.
            </p>
          </Panel>
          <div className="md:col-span-5 space-y-4">
            {[
              { s: "ε", l: "Força eletromotriz induzida (V)", c: C.redNeon },
              { s: "Φ", l: "Fluxo magnético (Wb)", c: C.blue },
              { s: "dt", l: "Intervalo de tempo (s)", c: C.yellow },
              { s: "−", l: "Lei de Lenz: sentido oposto à variação", c: C.greenNeon },
            ].map((v) => (
              <Panel key={v.s} className="p-5 flex items-center gap-5" accent={v.c}>
                <div className="text-4xl font-bold w-12 text-center" style={{ color: v.c }}>{v.s}</div>
                <div className="text-sm text-white/85">{v.l}</div>
              </Panel>
            ))}
          </div>
        </div>
      </Section>

      {/* 06 - ETAPAS */}
      <Section id="etapas" idx={6} total={TOTAL} kicker="// fluxo de conversão" title="Como o vento vira eletricidade" accent={C.greenNeon}>
        <div className="grid md:grid-cols-7 gap-3 items-center">
          {[
            { tag: "01", t: "Cinética", d: "Vento empurra as pás", c: C.blue, i: Wind },
            { tag: "02", t: "Rotacional", d: "Eixo gira a bobina", c: C.greenNeon, i: Cpu },
            { tag: "03", t: "Magnética", d: "Fluxo Φ varia", c: C.redNeon, i: Activity },
            { tag: "04", t: "Elétrica", d: "ε induzida nos fios", c: C.yellow, i: Zap },
          ].map((e, i, arr) => (
            <Fragment key={e.tag}>
              <Panel accent={e.c} className="p-6 text-center md:col-span-1 col-span-7">
                <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3" style={{ background: `${e.c}22`, border: `1px solid ${e.c}` }}>
                  <e.i className="w-7 h-7" style={{ color: e.c }} />
                </div>
                <div className="text-[10px] font-mono tracking-[0.25em] mb-1" style={{ color: e.c }}>{e.tag}</div>
                <div className="text-lg font-bold text-white">{e.t}</div>
                <div className="text-xs text-white/60 mt-1">{e.d}</div>
              </Panel>
              {i < arr.length - 1 && (
                <div className="hidden md:flex justify-center md:col-span-1">
                  <ArrowRight className="w-6 h-6 animate-pulse" style={{ color: C.greenNeon }} />
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <Panel className="p-6 mt-8" accent={C.greenNeon}>
          <div className="font-mono text-xs text-white/60 mb-2">// pipeline.energy</div>
          <code className="text-sm" style={{ color: C.greenNeon }}>
            wind(m/s) → blades.rotate() → shaft.spin(rpm) → coil.flux(Φ) → induce(ε) → output(V, I)
          </code>
        </Panel>
      </Section>

      {/* 07 - GRANDEZAS */}
      <Section id="grandezas" idx={7} total={TOTAL} kicker="// grandezas elétricas" title="Tensão · Corrente · Resistência" accent={C.yellow}>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { s: "V", n: "Tensão", d: "Diferença de potencial entre dois pontos", u: "Volt (V)", c: C.yellow, f: "V = R · I" },
            { s: "I", n: "Corrente", d: "Fluxo ordenado de elétrons no condutor", u: "Ampère (A)", c: C.blue, f: "I = V / R" },
            { s: "R", n: "Resistência", d: "Oposição à passagem da corrente", u: "Ohm (Ω)", c: C.redNeon, f: "R = V / I" },
          ].map((g) => (
            <Panel key={g.s} className="p-8 text-center" accent={g.c}>
              <div className="text-7xl font-black mb-2" style={{ color: g.c, textShadow: `0 0 30px ${g.c}` }}>{g.s}</div>
              <div className="text-2xl font-bold text-white mb-1">{g.n}</div>
              <div className="text-xs font-mono uppercase tracking-widest mb-4" style={{ color: g.c }}>{g.u}</div>
              <p className="text-sm text-white/70 mb-5">{g.d}</p>
              <div className="px-4 py-3 rounded-lg font-mono text-lg" style={{ background: `${g.c}15`, border: `1px solid ${g.c}55`, color: g.c }}>
                {g.f}
              </div>
            </Panel>
          ))}
        </div>
      </Section>

      {/* 08 - DASHBOARD */}
      <Section id="dashboard" idx={8} total={TOTAL} kicker="// telemetria ao vivo" title="Dashboard Científico" accent={C.greenNeon}>
        <div className="grid md:grid-cols-4 gap-4">
          <Metric label="Vento" value="6.2" unit="m/s" color={C.blue} icon={Wind} />
          <Metric label="RPM" value="412" unit="rpm" color={C.greenNeon} icon={Cpu} />
          <Metric label="Tensão" value="3.74" unit="V" color={C.yellow} icon={Zap} />
          <Metric label="Corrente" value="0.18" unit="A" color={C.redNeon} icon={Activity} />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <Panel className="p-6" accent={C.blue}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-mono tracking-[0.25em] uppercase" style={{ color: C.blue }}>Curva Vento × Potência</div>
              <Chip color={C.blue}>LIVE</Chip>
            </div>
            <svg viewBox="0 0 400 160" className="w-full h-44">
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.blue} stopOpacity="0.5" />
                  <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
                </linearGradient>
              </defs>
              {[0, 40, 80, 120].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke={`${C.blue}22`} />)}
              <path d="M0,140 C60,130 100,100 160,80 S260,30 400,15 L400,160 L0,160 Z" fill="url(#g1)" />
              <path d="M0,140 C60,130 100,100 160,80 S260,30 400,15" fill="none" stroke={C.blue} strokeWidth="2" />
              {[[0,140],[80,110],[160,80],[240,55],[320,30],[400,15]].map(([x,y],i)=>(
                <circle key={i} cx={x} cy={y} r="3" fill={C.greenNeon} />
              ))}
            </svg>
          </Panel>
          <Panel className="p-6" accent={C.yellow}>
            <div className="text-xs font-mono tracking-[0.25em] uppercase mb-4" style={{ color: C.yellow }}>Eficiência por componente</div>
            {[
              { l: "Pás (aerodinâmica)", v: 82, c: C.blue },
              { l: "Eixo (mecânica)", v: 91, c: C.greenNeon },
              { l: "Bobina (indução)", v: 76, c: C.redNeon },
              { l: "Saída (carga)", v: 68, c: C.yellow },
            ].map((b) => (
              <div key={b.l} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{b.l}</span>
                  <span className="font-mono" style={{ color: b.c }}>{b.v}%</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${b.v}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${b.c}, ${b.c}55)`, boxShadow: `0 0 12px ${b.c}` }}
                  />
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </Section>

      {/* 09 - SUSTENTABILIDADE */}
      <Section id="sustentabilidade" idx={9} total={TOTAL} kicker="// impacto global" title="Energia que transforma" accent={C.greenNeon}>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { i: Leaf, n: "Renovável", d: "Vento é infinito e gratuito — fonte inesgotável de energia limpa.", c: C.greenNeon },
            { i: Globe2, n: "Sem emissão", d: "Zero CO₂ na operação. Combate direto às mudanças climáticas.", c: C.blue },
            { i: Lightbulb, n: "Inclusiva", d: "Pode iluminar comunidades remotas — como em Malaui.", c: C.yellow },
          ].map((v) => (
            <Panel key={v.n} className="p-8 text-center" accent={v.c}>
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: `${v.c}22`, border: `1px solid ${v.c}` }}>
                <v.i className="w-8 h-8" style={{ color: v.c }} />
              </div>
              <div className="text-2xl font-bold text-white mb-2">{v.n}</div>
              <p className="text-white/70 text-sm">{v.d}</p>
            </Panel>
          ))}
        </div>
        <Panel className="p-8 mt-6" accent={C.greenNeon}>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            {[
              { v: "+1200", l: "TWh eólicos / ano · global", c: C.blue },
              { v: "−1.1B", l: "ton CO₂ evitadas / ano", c: C.greenNeon },
              { v: "1.3M", l: "empregos diretos no setor", c: C.yellow },
              { v: "20%", l: "matriz BR já é eólica", c: C.redNeon },
            ].map((s) => (
              <div key={s.l}>
                <div className="text-4xl font-black tabular-nums" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-white/60 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </Panel>
      </Section>

      {/* 10 - ENCERRAMENTO */}
      <Section id="encerramento" idx={10} total={TOTAL} kicker="// fim de transmissão" title="O vento sopra para todos" accent={C.yellow}>
        <Panel className="p-12 text-center" accent={C.yellow}>
          <Sparkles className="w-12 h-12 mx-auto mb-6" style={{ color: C.yellow }} />
          <p className="text-2xl md:text-3xl font-light text-white/90 max-w-3xl mx-auto mb-8 leading-snug">
            "Eu tentei, e <span style={{ color: C.greenNeon }}>consegui</span>."
          </p>
          <div className="text-sm text-white/50 font-mono mb-10">— William Kamkwamba</div>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Chip color={C.greenNeon}>IFTO 2026</Chip>
            <Chip color={C.blue}>Energia Limpa</Chip>
            <Chip color={C.yellow}>Educação CTS</Chip>
            <Chip color={C.redNeon}>Inovação</Chip>
          </div>
          <button
            onClick={() => window.dispatchEvent(new Event("ge-download-pdf"))}
            disabled={downloading}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-widest transition-all hover:scale-105"
            style={{ background: `${C.yellow}22`, border: `1px solid ${C.yellow}`, color: C.yellow }}
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Baixar Apresentação
          </button>
        </Panel>
        <div className="text-center mt-8 text-xs font-mono text-white/40 tracking-[0.3em] uppercase">
          // end_of_signal · gerador.eolico.ifto.v2
        </div>
      </Section>

      {/* Section indicators */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-2">
        {nav.map((n, i) => (
          <a key={n.id} href={`#${n.id}`} className="group flex items-center gap-2 justify-end">
            <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono uppercase tracking-widest text-white/70 transition">{n.label}</span>
            <span className="w-2 h-2 rounded-full transition-all" style={{ background: C.greenNeon, opacity: 0.4 }} />
          </a>
        ))}
      </div>
    </div>
  );
}
