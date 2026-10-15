import { toast } from "sonner";

export const SHOPIFY_API_VERSION = "2026-10";
export const SHOPIFY_STORE_PERMANENT_DOMAIN = "light-frame-visions-bmsc7-mq10qw2p.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const SHOPIFY_STOREFRONT_TOKEN = "4323ab2e51082839285af918460582fc";

export interface ShopifyProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: {
      edges: Array<{
        node: {
          id: string;
          title: string;
          price: { amount: string; currencyCode: string };
          availableForSale: boolean;
          selectedOptions: Array<{ name: string; value: string }>;
        };
      }>;
    };
    options: Array<{ name: string; values: string[] }>;
  };
}

const PRODUCT_FIELDS = `
  id title description handle
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 5) { edges { node { url altText } } }
  variants(first: 10) { edges { node { id title price { amount currencyCode } availableForSale selectedOptions { name value } } } }
  options { name values }
`;

export const PRODUCTS_QUERY = `query GetProducts($first: Int!, $query: String) {
  products(first: $first, query: $query) { edges { node { ${PRODUCT_FIELDS} } } } }`;

export const PRODUCT_BY_HANDLE_QUERY = `query GetProduct($handle: String!) {
  productByHandle(handle: $handle) { ${PRODUCT_FIELDS} } }`;

export async function storefrontApiRequest(query: string, variables: Record<string, unknown> = {}) {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (response.status === 402) {
    toast.error("Shopify: pagamento necessário", {
      description: "A loja precisa de um plano ativo do Shopify para funcionar.",
    });
    return;
  }
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (data.errors) throw new Error(`Erro Shopify: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  return data;
}

export async function fetchProducts(first = 20): Promise<ShopifyProduct[]> {
  const data = await storefrontApiRequest(PRODUCTS_QUERY, { first });
  return data?.data?.products?.edges ?? [];
}

export async function fetchProduct(handle: string): Promise<ShopifyProduct | null> {
  const data = await storefrontApiRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
  const node = data?.data?.productByHandle;
  return node ? { node } : null;
}

export const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const LINES = `lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } }`;
const CART_CREATE = `mutation cartCreate($input: CartInput!) { cartCreate(input: $input) { cart { id checkoutUrl ${LINES} } userErrors { field message } } }`;
const CART_ADD = `mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { cart { id ${LINES} } userErrors { field message } } }`;
const CART_UPDATE = `mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } } }`;
const CART_REMOVE = `mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } } }`;

type UserError = { field: string[] | null; message: string };

function formatCheckoutUrl(u: string) {
  try {
    const url = new URL(u);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return u;
  }
}
const notFound = (errs: UserError[]) =>
  errs.some((e) => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));

export async function createShopifyCart(variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_CREATE, { input: { lines: [{ quantity, merchandiseId: variantId }] } });
  if (data?.data?.cartCreate?.userErrors?.length) return null;
  const cart = data?.data?.cartCreate?.cart;
  const lineId = cart?.lines?.edges?.[0]?.node?.id;
  if (!cart?.checkoutUrl || !lineId) return null;
  return { cartId: cart.id as string, checkoutUrl: formatCheckoutUrl(cart.checkoutUrl), lineId: lineId as string };
}

export async function addLineToShopifyCart(cartId: string, variantId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_ADD, { cartId, lines: [{ quantity, merchandiseId: variantId }] });
  const errs: UserError[] = data?.data?.cartLinesAdd?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  if (errs.length) return { success: false };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const l = lines.find((x: { node: { id: string; merchandise: { id: string } } }) => x.node.merchandise.id === variantId);
  return { success: true, lineId: l?.node?.id as string | undefined };
}

export async function updateShopifyCartLine(cartId: string, lineId: string, quantity: number) {
  const data = await storefrontApiRequest(CART_UPDATE, { cartId, lines: [{ id: lineId, quantity }] });
  const errs: UserError[] = data?.data?.cartLinesUpdate?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}

export async function removeLineFromShopifyCart(cartId: string, lineId: string) {
  const data = await storefrontApiRequest(CART_REMOVE, { cartId, lineIds: [lineId] });
  const errs: UserError[] = data?.data?.cartLinesRemove?.userErrors || [];
  if (notFound(errs)) return { success: false, cartNotFound: true };
  return { success: errs.length === 0 };
}
