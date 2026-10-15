import { useMemo, useState } from "react";
import { Search, Star, Clock, Bike, ArrowLeft, ShoppingBag, Plus, Minus, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrackingMap } from "@/components/delivery/TrackingMap";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Item = { id: string; nome: string; desc: string; preco: number; emoji: string };
type Loja = { id: string; nome: string; cat: string; emoji: string; nota: number; tempo: string; taxa: number; itens: Item[] };

const CATS = [
  { id: "todos", nome: "Todos", emoji: "🍽️" },
  { id: "lanches", nome: "Lanches", emoji: "🍔" },
  { id: "pizza", nome: "Pizza", emoji: "🍕" },
  { id: "japonesa", nome: "Japonesa", emoji: "🍣" },
  { id: "brasileira", nome: "Brasileira", emoji: "🍛" },
  { id: "doces", nome: "Doces", emoji: "🍰" },
  { id: "bebidas", nome: "Bebidas", emoji: "🥤" },
];

const LOJAS: Loja[] = [
  { id: "1", nome: "Burger da Praça", cat: "lanches", emoji: "🍔", nota: 4.8, tempo: "25-35", taxa: 0, itens: [
    { id: "1a", nome: "X-Bacon", desc: "Pão, carne 180g, bacon, queijo", preco: 28.9, emoji: "🍔" },
    { id: "1b", nome: "X-Salada", desc: "Carne, alface, tomate, queijo", preco: 24.9, emoji: "🥪" },
    { id: "1c", nome: "Batata frita", desc: "Porção 300g", preco: 14.9, emoji: "🍟" } ] },
  { id: "2", nome: "Pizzaria Bella", cat: "pizza", emoji: "🍕", nota: 4.6, tempo: "40-50", taxa: 6.99, itens: [
    { id: "2a", nome: "Calabresa grande", desc: "Calabresa, cebola, azeitona", preco: 54.9, emoji: "🍕" },
    { id: "2b", nome: "Margherita grande", desc: "Mussarela, tomate, manjericão", preco: 52.9, emoji: "🍕" } ] },
  { id: "3", nome: "Sushi Kenzo", cat: "japonesa", emoji: "🍣", nota: 4.9, tempo: "35-45", taxa: 4.99, itens: [
    { id: "3a", nome: "Combo 20 peças", desc: "Sashimi, uramaki e hossomaki", preco: 69.9, emoji: "🍣" },
    { id: "3b", nome: "Temaki salmão", desc: "Salmão e cream cheese", preco: 26.9, emoji: "🍙" } ] },
  { id: "4", nome: "Cozinha da Vó", cat: "brasileira", emoji: "🍛", nota: 4.7, tempo: "30-40", taxa: 0, itens: [
    { id: "4a", nome: "Prato feito", desc: "Arroz, feijão, bife, salada", preco: 22.9, emoji: "🍛" },
    { id: "4b", nome: "Feijoada", desc: "Completa, serve 1", preco: 32.9, emoji: "🥘" },
    { id: "4c", nome: "Pamonha doce", desc: "Feita na hora", preco: 8, emoji: "🌽" } ] },
  { id: "5", nome: "Doce Mel Confeitaria", cat: "doces", emoji: "🍰", nota: 4.8, tempo: "20-30", taxa: 3.99, itens: [
    { id: "5a", nome: "Bolo de pote", desc: "Ninho com morango", preco: 13.9, emoji: "🍰" },
    { id: "5b", nome: "Brigadeiros (6un)", desc: "Gourmet", preco: 15, emoji: "🍫" } ] },
  { id: "6", nome: "Sucos & Cia", cat: "bebidas", emoji: "🥤", nota: 4.5, tempo: "15-25", taxa: 2.99, itens: [
    { id: "6a", nome: "Suco de laranja 500ml", desc: "Natural", preco: 9.9, emoji: "🍊" },
    { id: "6b", nome: "Açaí 500ml", desc: "Com granola e banana", preco: 19.9, emoji: "🍇" } ] },
];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Delivery() {
  const [cat, setCat] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loja, setLoja] = useState<Loja | null>(null);
  const [cart, setCart] = useState<{ loja: Loja; qtd: Record<string, number> } | null>(null);
  const [aberto, setAberto] = useState(false);
  const [endereco, setEndereco] = useState("");
  const [pago, setPago] = useState("pix");
  const [feito, setFeito] = useState<string | null>(null);

  const lista = useMemo(() => LOJAS.filter((l) =>
    (cat === "todos" || l.cat === cat) &&
    (l.nome.toLowerCase().includes(busca.toLowerCase()) || l.itens.some((i) => i.nome.toLowerCase().includes(busca.toLowerCase())))
  ), [cat, busca]);

  const mudar = (l: Loja, id: string, d: number) => {
    setCart((c) => {
      const base = c && c.loja.id === l.id ? { ...c.qtd } : {};
      base[id] = Math.max(0, (base[id] || 0) + d);
      if (!base[id]) delete base[id];
      return Object.keys(base).length ? { loja: l, qtd: base } : null;
    });
  };

  const linhas = cart ? cart.loja.itens.filter((i) => cart.qtd[i.id]).map((i) => ({ ...i, q: cart.qtd[i.id] })) : [];
  const sub = linhas.reduce((s, i) => s + i.preco * i.q, 0);
  const total = sub + (cart?.loja.taxa || 0);
  const qtdTotal = linhas.reduce((s, i) => s + i.q, 0);

  return (
    <div className="theme-delivery min-h-screen pb-28">
      <header className="sticky top-0 z-20 bg-card border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          {loja ? (
            <button onClick={() => setLoja(null)} className="p-2 rounded-full hover:bg-muted"><ArrowLeft className="h-5 w-5" /></button>
          ) : (
            <span className="text-2xl font-black text-primary tracking-tight">pede<span className="text-foreground">aí</span></span>
          )}
          <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4 text-primary" />Entregar em casa</div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        {!loja ? (
          <>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar lojas e pratos"
                className="w-full rounded-xl bg-muted pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div className="mt-4 rounded-2xl bg-primary text-primary-foreground p-6">
              <p className="text-sm opacity-90">Hoje tem</p>
              <h2 className="text-2xl font-black">Entrega grátis em lojas selecionadas</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto py-5">
              {CATS.map((c) => (
                <button key={c.id} onClick={() => setCat(c.id)} className="flex flex-col items-center gap-1 min-w-[72px]">
                  <span className={`h-16 w-16 rounded-2xl flex items-center justify-center text-3xl ${cat === c.id ? "bg-primary/15 ring-2 ring-primary" : "bg-secondary"}`}>{c.emoji}</span>
                  <span className={`text-xs ${cat === c.id ? "font-bold text-primary" : ""}`}>{c.nome}</span>
                </button>
              ))}
            </div>
            <h3 className="font-bold text-lg mb-3">Lojas</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {lista.map((l) => (
                <button key={l.id} onClick={() => setLoja(l)} className="flex gap-4 items-center text-left bg-card rounded-xl p-3 border hover:shadow-md transition">
                  <span className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-3xl">{l.emoji}</span>
                  <div className="flex-1">
                    <p className="font-semibold">{l.nome}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Star className="h-3 w-3 fill-current text-primary" />{l.nota} · <Clock className="h-3 w-3" />{l.tempo} min
                    </p>
                    <p className={`text-sm ${l.taxa === 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                      <Bike className="h-3 w-3 inline mr-1" />{l.taxa === 0 ? "Grátis" : brl(l.taxa)}
                    </p>
                  </div>
                </button>
              ))}
              {lista.length === 0 && <p className="text-muted-foreground">Nada encontrado.</p>}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-4 py-6">
              <span className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center text-4xl">{loja.emoji}</span>
              <div>
                <h1 className="text-2xl font-black">{loja.nome}</h1>
                <p className="text-sm text-muted-foreground">⭐ {loja.nota} · {loja.tempo} min · Entrega {loja.taxa === 0 ? "grátis" : brl(loja.taxa)}</p>
              </div>
            </div>
            <div className="space-y-3">
              {loja.itens.map((i) => {
                const q = cart?.loja.id === loja.id ? cart.qtd[i.id] || 0 : 0;
                return (
                  <div key={i.id} className="flex gap-4 items-center bg-card border rounded-xl p-4">
                    <div className="flex-1">
                      <p className="font-semibold">{i.nome}</p>
                      <p className="text-sm text-muted-foreground">{i.desc}</p>
                      <p className="font-semibold mt-1">{brl(i.preco)}</p>
                    </div>
                    <span className="text-5xl">{i.emoji}</span>
                    {q === 0 ? (
                      <Button size="icon" className="rounded-full" onClick={() => mudar(loja, i.id, 1)}><Plus className="h-4 w-4" /></Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="rounded-full h-8 w-8" onClick={() => mudar(loja, i.id, -1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-4 text-center font-bold">{q}</span>
                        <Button size="icon" className="rounded-full h-8 w-8" onClick={() => mudar(loja, i.id, 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {cart && cart.loja.id !== loja.id && <p className="text-xs text-muted-foreground mt-3">Adicionar daqui troca a sacola de {cart.loja.nome}.</p>}
          </>
        )}
      </main>

      {(cart || feito) && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-30">
          <button onClick={() => setAberto(true)} className="max-w-5xl mx-auto w-full flex items-center justify-between bg-primary text-primary-foreground rounded-xl px-5 py-4 font-semibold shadow-lg">
            {feito && !cart ? <span className="w-full text-center">🛵 Acompanhar entrega ao vivo</span> : <><span className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" />{qtdTotal} item(ns)</span>
            <span>Ver sacola · {brl(total)}</span></>}
          </button>
        </div>
      )}

      <Sheet open={aberto} onOpenChange={(o) => { setAberto(o);  }}>
        <SheetContent className="theme-delivery w-full sm:max-w-md flex flex-col">
          <SheetHeader><SheetTitle>{feito ? "Acompanhe seu pedido" : `Sacola · ${cart?.loja.nome ?? ""}`}</SheetTitle></SheetHeader>
          {feito ? (
            <div className="flex-1 overflow-y-auto pt-4"><TrackingMap loja={feito} /></div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-3 py-4">
                {linhas.map((i) => (
                  <div key={i.id} className="flex justify-between"><span>{i.q}x {i.nome}</span><span>{brl(i.preco * i.q)}</span></div>
                ))}
                <div className="border-t pt-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{brl(sub)}</span></div>
                  <div className="flex justify-between"><span>Entrega</span><span>{cart?.loja.taxa ? brl(cart.loja.taxa) : "Grátis"}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>{brl(total)}</span></div>
                </div>
                <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço de entrega"
                  className="w-full rounded-lg border bg-card px-3 py-2" />
                <div className="grid grid-cols-3 gap-2">
                  {[["pix", "Pix"], ["cartao", "Cartão"], ["dinheiro", "Dinheiro"]].map(([v, n]) => (
                    <button key={v} onClick={() => setPago(v)} className={`rounded-lg border py-2 text-sm ${pago === v ? "border-primary text-primary font-bold bg-secondary" : ""}`}>{n}</button>
                  ))}
                </div>
              </div>
              <Button size="lg" disabled={!endereco || !cart} onClick={() => { setFeito(cart!.loja.nome); setCart(null); }}>Fazer pedido · {brl(total)}</Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
