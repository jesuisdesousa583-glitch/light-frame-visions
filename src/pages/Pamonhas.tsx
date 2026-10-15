import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import hero from "@/assets/pamonha-hero.jpg";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { useCartSync } from "@/hooks/useCartSync";
import { PamonhaCart } from "@/components/pamonha/PamonhaCart";

const brl = (v: string) => parseFloat(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ProductCard({ product }: { product: ShopifyProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);
  const v = product.node.variants.edges[0]?.node;
  const img = product.node.images.edges[0]?.node;
  return (
    <div className="rounded-2xl bg-card shadow-card overflow-hidden flex flex-col">
      <Link to={`/product/${product.node.handle}`}>
        {img && <img src={img.url} alt={img.altText ?? product.node.title} loading="lazy" className="h-48 w-full object-cover" />}
      </Link>
      <div className="p-5 flex flex-col flex-1">
        <Link to={`/product/${product.node.handle}`} className="text-xl font-semibold hover:text-primary">{product.node.title}</Link>
        <p className="text-muted-foreground text-sm flex-1 mt-1">{product.node.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">{brl(product.node.priceRange.minVariantPrice.amount)}</span>
          <Button
            className="rounded-full"
            disabled={!v || isLoading}
            onClick={() => v && addItem({ product, variantId: v.id, variantTitle: v.title, price: v.price, quantity: 1, selectedOptions: v.selectedOptions })}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adicionar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Pamonhas() {
  useCartSync();
  const { data: products, isLoading } = useQuery({ queryKey: ["shopify-products"], queryFn: () => fetchProducts(20) });

  return (
    <div className="min-h-screen bg-secondary/40 text-foreground">
      <header className="relative h-[60vh] overflow-hidden">
        <img src={hero} alt="Pamonhas na palha" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/50" />
        <div className="absolute top-6 right-6 z-10"><PamonhaCart /></div>
        <div className="relative container h-full flex flex-col justify-end pb-12 text-background">
          <p className="uppercase tracking-[0.3em] text-sm">Feita na hora, na palha</p>
          <h1 className="text-5xl md:text-7xl font-bold font-heading">Pamonharia da Roça</h1>
          <p className="mt-3 text-lg max-w-xl">Pamonhas fresquinhas de milho verde. Pague online ou peça pelo WhatsApp.</p>
        </div>
      </header>

      <main className="container py-12">
        <h2 className="text-3xl font-bold mb-6">Cardápio</h2>
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : !products?.length ? (
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.node.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
