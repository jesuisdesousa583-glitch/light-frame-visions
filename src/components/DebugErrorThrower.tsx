import { useEffect, useState } from "react";

/**
 * DebugErrorThrower
 *
 * Componente sem UI que escuta o evento "lovable-debug-error" e, ao receber
 * uma mensagem, lança um erro fatal real durante o render.
 *
 * IMPORTANTE: este componente DEVE ficar FORA de qualquer ErrorBoundary,
 * Suspense ou boundary local. O erro precisa escapar para o overlay global
 * da Lovable, para que o usuário possa clicar em "Try to Fix".
 *
 * NÃO envolver em try/catch, NÃO trocar o throw por console.error,
 * NÃO mandar a instrução por chat/sidebar/API. O erro é INTENCIONAL.
 */
const DebugErrorThrower = () => {
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
    // Erro intencional: precisa propagar até o overlay global da Lovable.
    throw new Error(message);
  }

  return null;
};

export default DebugErrorThrower;
