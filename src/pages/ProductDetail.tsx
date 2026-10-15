import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { PamonhaCart } from "@/components/pamonha/PamonhaCart";

export default function ProductDetail() {
  const { handle = "" } = useParams();
  const { data: product, isLoading } = useQuery({ queryKey: ["product", handle], queryFn: () => fetchProduct(handle) });
  const addItem = useCartStore((s) => s.addItem);
  const busy = useCartStore((s) => s.isLoading);

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!product) return <div className="container py-20">Produto não encontrado. <Link to="/" className="text-primary">Voltar</Link></div>;

  const v = product.node.variants.edges[0]?.node;
  const img = product.node.images.edges[0]?.node;
  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="container py-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-primary"><ArrowLeft className="h-4 w-4" />Cardápio</Link>
        <PamonhaCart />
      </div>
      <div className="container pb-16 grid md:grid-cols-2 gap-10">
        {img && <img src={img.url} alt={product.node.title} className="rounded-2xl w-full object-cover shadow-card" />}
        <div>
          <h1 className="text-4xl font-bold">{product.node.title}</h1>
          <p className="text-2xl font-bold text-primary mt-3">
            {v && parseFloat(v.price.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </p>
          <p className="mt-4 text-muted-foreground">{product.node.description}</p>
          <Button size="lg" className="mt-6 rounded-full" disabled={!v || busy}
            onClick={() => v && addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions })}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar ao carrinho"}
          </Button>
        </div>
      </div>
    </div>
  );
}
