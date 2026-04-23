import { useEffect, useState } from "react";

/**
 * DebugErrorThrower
 *
 * Componente sem UI que escuta o evento "lovable-debug-error" e, ao receber
 * uma mensagem, lança um erro fatal real fora do ciclo de render.
 *
 * IMPORTANTE: este componente DEVE ficar FORA de qualquer ErrorBoundary,
 * Suspense ou boundary local. O erro precisa escapar para o overlay global
 * da Lovable, para que o usuário possa clicar em "Try to Fix".
 *
 * NÃO envolver em try/catch, NÃO trocar o throw por console.error,
 * NÃO mandar a instrução por chat/sidebar/API. O erro é INTENCIONAL.
 *
 * Observação: o throw não pode acontecer em render, senão o React entra em
 * loop de recuperação e a tela pode ficar permanentemente em branco. Por isso
 * a mensagem é consumida e o erro é lançado de forma assíncrona uma única vez.
 */
const DebugErrorThrower = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;

    const error = new Error(message);
    setMessage(null);

    const timer = window.setTimeout(() => {
      throw error;
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [message]);

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

  return null;
};

export default DebugErrorThrower;
