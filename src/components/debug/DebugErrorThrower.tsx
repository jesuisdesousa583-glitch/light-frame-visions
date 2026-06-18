import { useEffect } from "react";

/**
 * DebugErrorThrower
 *
 * Escuta o evento global "lovable-debug-error" e, ao receber, lança um erro
 * assíncrono contendo a instrução. Esse erro é INTENCIONAL e deve escapar
 * para o overlay global da Lovable para acionar o botão "Try to Fix", mas sem
 * acontecer durante o render do React para evitar tela branca.
 *
 * IMPORTANTE: NÃO envolver este componente em ErrorBoundary, Suspense ou
 * qualquer boundary local. Não tratar com try/catch, toast, modal ou log.
 */
export function DebugErrorThrower() {
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (typeof custom.detail === "string" && custom.detail.length > 0) {
        const message = custom.detail;
        window.setTimeout(() => {
          throw new Error(message);
        }, 0);
      }
    };

    window.addEventListener("lovable-debug-error", handler as EventListener);
    return () => {
      window.removeEventListener("lovable-debug-error", handler as EventListener);
    };
  }, []);

  return null;
}
