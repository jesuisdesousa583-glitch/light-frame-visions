import { useEffect, useRef, useState } from "react";
import { Bike, ChefHat, CheckCircle2, Home, MapPin } from "lucide-react";

declare global {
  interface Window { google?: any; __initDeliveryMap?: () => void }
}

const KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"];
const CHANNEL = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"];

let loader: Promise<void> | null = null;
function loadMaps() {
  if (window.google?.maps?.Map) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    window.__initDeliveryMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&loading=async&callback=__initDeliveryMap&channel=${CHANNEL}`;
    s.async = true;
    s.onerror = () => reject(new Error("Falha ao carregar mapa"));
    document.head.appendChild(s);
  });
  return loader;
}

const ETAPAS = [
  { nome: "Pedido confirmado", icon: CheckCircle2 },
  { nome: "Preparando", icon: ChefHat },
  { nome: "Saiu para entrega", icon: Bike },
  { nome: "Entregue", icon: Home },
];

export function TrackingMap({ loja }: { loja: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [etapa, setEtapa] = useState(0);
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    let timer: number | undefined;
    let vivo = true;
    const iniciar = (casa: { lat: number; lng: number }) => {
      loadMaps().then(() => {
        if (!vivo || !ref.current) return;
        const g = window.google.maps;
        const origem = { lat: casa.lat + 0.012, lng: casa.lng - 0.014 };
        const map = new g.Map(ref.current, { center: casa, zoom: 14, clickableIcons: false, disableDefaultUI: true,
          styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }] });
        const b = new g.LatLngBounds(); b.extend(casa); b.extend(origem); map.fitBounds(b, 48);
        new g.Marker({ position: origem, map, label: "🏪", title: loja });
        new g.Marker({ position: casa, map, label: "🏠", title: "Você" });
        new g.Polyline({ path: [origem, casa], map, strokeColor: "#e11d2e", strokeOpacity: 0.6, strokeWeight: 4 });
        const moto = new g.Marker({ position: origem, map, label: { text: "🛵", fontSize: "22px" }, title: "Entregador" });
        let t = 0;
        timer = window.setInterval(() => {
          t += 1;
          if (t < 4) { setEtapa(0); return; }
          if (t < 10) { setEtapa(1); return; }
          const p = Math.min(1, (t - 10) / 40);
          setEtapa(p >= 1 ? 3 : 2); setProgresso(p);
          moto.setPosition({ lat: origem.lat + (casa.lat - origem.lat) * p, lng: origem.lng + (casa.lng - origem.lng) * p });
          if (p >= 1) window.clearInterval(timer);
        }, 1000);
      }).catch((e) => setErro(e.message));
    };
    const padrao = { lat: -23.5505, lng: -46.6333 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => iniciar({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => iniciar(padrao), { timeout: 5000 });
    } else iniciar(padrao);
    return () => { vivo = false; if (timer) window.clearInterval(timer); };
  }, [loja]);

  const minutos = Math.max(0, Math.round((1 - progresso) * 15));

  return (
    <div className="flex flex-col gap-4 flex-1 min-h-0">
      <div className="rounded-xl bg-secondary p-4">
        <p className="text-sm text-muted-foreground">{etapa === 3 ? "Chegou!" : "Previsão de chegada"}</p>
        <p className="text-2xl font-black text-primary">{etapa === 3 ? "Pedido entregue 🎉" : `${minutos + (etapa < 2 ? 10 : 0)} min`}</p>
      </div>
      <div ref={ref} className="w-full h-64 rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
        {erro ? erro : <><MapPin className="h-4 w-4 mr-1" />Carregando mapa…</>}
      </div>
      <ol className="space-y-3">
        {ETAPAS.map((e, i) => (
          <li key={e.nome} className={`flex items-center gap-3 ${i <= etapa ? "text-foreground" : "text-muted-foreground"}`}>
            <span className={`h-8 w-8 rounded-full flex items-center justify-center ${i <= etapa ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              <e.icon className="h-4 w-4" />
            </span>
            <span className={i === etapa ? "font-bold" : ""}>{e.nome}</span>
          </li>
        ))}
      </ol>
      {etapa >= 2 && etapa < 3 && <p className="text-sm text-muted-foreground">🛵 Carlos está a caminho com seu pedido de {loja}.</p>}
    </div>
  );
}
