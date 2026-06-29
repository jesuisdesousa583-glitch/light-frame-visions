import { useEffect, useState } from "react";

/**
 * DebugErrorThrower
 *
 * Escuta o evento global "lovable-debug-error" e, ao receber, lança um erro
 * INTENCIONAL durante o render. Esse erro DEVE escapar para o overlay global
 * da Lovable para acionar o botão "Try to Fix". NÃO envolver em ErrorBoundary,
 * NÃO trocar por console.error, NÃO usar try/catch. O blank screen momentâneo
 * é esperado — faz parte da feature.
 */
export function DebugErrorThrower() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (typeof custom.detail === "string" && custom.detail.length > 0) {
        setMessage(custom.detail);
      }
    };

    window.addEventListener("lovable-debug-error", handler as EventListener);
    return () => {
      window.removeEventListener("lovable-debug-error", handler as EventListener);
    };
  }, []);

  if (message) {
    throw new Error(message);
  }

  return null;
}
