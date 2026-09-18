"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Instalação como app e navegação continuam funcionando sem o SW;
      // só perde o fallback offline.
    });
  }, []);

  return null;
}
