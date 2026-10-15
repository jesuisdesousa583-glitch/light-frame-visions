import { useState } from "react";
import hero from "@/assets/pamonha-hero.jpg";

// Troque pelo número real (somente dígitos, com DDI 55 + DDD)
const WHATSAPP = "5500000000000";

const produtos = [
  { id: "doce", nome: "Pamonha Doce", desc: "Milho verde, açúcar e leite.", preco: 8 },
  { id: "sal", nome: "Pamonha de Sal", desc: "Clássica goiana, bem temperada.", preco: 8 },
  { id: "queijo", nome: "Pamonha com Queijo", desc: "Recheada com queijo meia-cura.", preco: 10 },
  { id: "linguica", nome: "Pamonha com Linguiça", desc: "Queijo e linguiça caseira.", preco: 12 },
  { id: "pimenta", nome: "Pamonha Apimentada", desc: "Queijo e pimenta-de-cheiro.", preco: 11 },
  { id: "curau", nome: "Curau (pote)", desc: "Creme de milho com canela.", preco: 9 },
];

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Pamonhas() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");

  const add = (id: string, d: number) =>
    setCart((c) => {
      const q = Math.max(0, (c[id] || 0) + d);
      const n = { ...c, [id]: q };
      if (!q) delete n[id];
      return n;
    });

  const itens = produtos.filter((p) => cart[p.id]);
  const total = itens.reduce((s, p) => s + p.preco * cart[p.id], 0);

  const enviar = () => {
    const linhas = itens.map((p) => `• ${cart[p.id]}x ${p.nome} — ${brl(p.preco * cart[p.id])}`);
    const msg = `Olá! Quero fazer um pedido:\n${linhas.join("\n")}\n\nTotal: ${brl(total)}\nNome: ${nome}\nEndereço: ${endereco}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-secondary/40 text-foreground">
      <header className="relative h-[60vh] overflow-hidden">
        <img src={hero} alt="Pamonhas na palha" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="relative container h-full flex flex-col justify-end pb-12 text-background">
          <p className="uppercase tracking-[0.3em] text-sm">Feita na hora, na palha</p>
          <h1 className="text-5xl md:text-7xl font-bold font-heading">Pamonharia da Roça</h1>
          <p className="mt-3 text-lg max-w-xl">Pamonhas fresquinhas de milho verde. Peça pelo WhatsApp e receba quentinha.</p>
        </div>
      </header>

      <main className="container py-12 grid lg:grid-cols-[1fr_380px] gap-10">
        <section>
          <h2 className="text-3xl font-bold mb-6">Cardápio</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {produtos.map((p) => (
              <div key={p.id} className="rounded-2xl bg-card p-5 shadow-card flex flex-col">
                <h3 className="text-xl font-semibold">{p.nome}</h3>
                <p className="text-muted-foreground text-sm flex-1 mt-1">{p.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{brl(p.preco)}</span>
                  <div className="flex items-center gap-2">
                    {cart[p.id] ? (
                      <>
                        <button onClick={() => add(p.id, -1)} className="h-9 w-9 rounded-full bg-muted font-bold">−</button>
                        <span className="w-6 text-center font-semibold">{cart[p.id]}</span>
                      </>
                    ) : null}
                    <button onClick={() => add(p.id, 1)} className="h-9 px-4 rounded-full bg-primary text-primary-foreground font-semibold">
                      {cart[p.id] ? "+" : "Adicionar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl bg-card p-6 shadow-card h-fit lg:sticky lg:top-6">
          <h2 className="text-2xl font-bold mb-4">Seu pedido</h2>
          {itens.length === 0 ? (
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {itens.map((p) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span>{cart[p.id]}x {p.nome}</span>
                  <span>{brl(p.preco * cart[p.id])}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between font-bold text-lg border-t pt-3 mb-4">
            <span>Total</span><span>{brl(total)}</span>
          </div>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full mb-2 rounded-lg border bg-background px-3 py-2" />
          <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço de entrega" className="w-full mb-4 rounded-lg border bg-background px-3 py-2" />
          <button
            disabled={!itens.length || !nome || !endereco}
            onClick={enviar}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 font-semibold disabled:opacity-50"
          >
            Pedir pelo WhatsApp
          </button>
        </aside>
      </main>
    </div>
  );
}
