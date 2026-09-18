import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Roda em todas as rotas exceto arquivos estáticos e de imagem, e exceto
     * o service worker e a página offline — o navegador proíbe registrar um
     * SW cuja resposta veio de um redirect, e é justamente isso que acontece
     * se o middleware tentar mandar /sw.js pro /login por falta de sessão.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
