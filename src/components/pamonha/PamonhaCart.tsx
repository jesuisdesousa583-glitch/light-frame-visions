import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Minus, Plus, Trash2, ExternalLink, Loader2, MessageCircle } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";

// Troque pelo número real (DDI 55 + DDD + número, só dígitos)
export const WHATSAPP = "5500000000000";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function PamonhaCart() {
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [endereco, setEndereco] = useState("");
  const { items, isLoading, isSyncing, updateQuantity, removeItem, getCheckoutUrl, syncCart } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const total = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);

  useEffect(() => { if (open) syncCart(); }, [open, syncCart]);

  const checkout = () => {
    const url = getCheckoutUrl();
    if (url) { window.open(url, "_blank"); setOpen(false); }
  };

  const whatsapp = () => {
    const linhas = items.map((i) => `• ${i.quantity}x ${i.product.node.title} — ${brl(parseFloat(i.price.amount) * i.quantity)}`);
    const msg = `Olá! Quero fazer um pedido:\n${linhas.join("\n")}\n\nTotal: ${brl(total)}\nNome: ${nome}\nEndereço: ${endereco}`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" size="lg" className="relative rounded-full gap-2">
          <ShoppingCart className="h-5 w-5" /> Carrinho
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">{totalItems}</span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Seu pedido</SheetTitle>
          <SheetDescription>{totalItems === 0 ? "Seu carrinho está vazio" : `${totalItems} item(ns)`}</SheetDescription>
        </SheetHeader>
        {items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pt-4 min-h-0">
              {items.map((i) => (
                <div key={i.variantId} className="flex gap-3">
                  {i.product.node.images.edges[0] && (
                    <img src={i.product.node.images.edges[0].node.url} alt={i.product.node.title} className="w-16 h-16 rounded-md object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{i.product.node.title}</p>
                    <p className="font-semibold text-primary">{brl(parseFloat(i.price.amount))}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeItem(i.variantId)}><Trash2 className="h-3 w-3" /></Button>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i.variantId, i.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-6 text-center text-sm">{i.quantity}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQuantity(i.variantId, i.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{brl(total)}</span></div>
              <Button onClick={checkout} className="w-full" size="lg" disabled={isLoading || isSyncing}>
                {isLoading || isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ExternalLink className="h-4 w-4 mr-2" />Pagar online</>}
              </Button>
              <p className="text-center text-sm text-muted-foreground">ou peça pelo WhatsApp</p>
              <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" className="w-full rounded-lg border bg-background px-3 py-2" />
              <input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Endereço de entrega" className="w-full rounded-lg border bg-background px-3 py-2" />
              <Button onClick={whatsapp} variant="outline" className="w-full" size="lg" disabled={!nome || !endereco}>
                <MessageCircle className="h-4 w-4 mr-2" />Pedir pelo WhatsApp
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
