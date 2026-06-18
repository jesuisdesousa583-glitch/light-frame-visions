import { useEffect } from "react";

/**
 * DebugErrorThrower
 *
 * Escuta o evento global "lovable-debug-error" e, ao receber, lança um erro
 * assíncrono contendo a instrução. Esse erro é INTENCIONAL e deve escapar para
 * o overlay global da Lovable para acionar o botão "Try to Fix", mas não deve
 * acontecer durante o render do React para não desmontar a tela inteira.
 */
export function DebugErrorThrower() {
  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<string>;
      if (typeof custom.detail === "string" && custom.detail.length > 0) {
        window.setTimeout(() => {
          throw new Error(custom.detail);
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
