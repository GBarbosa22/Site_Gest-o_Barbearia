export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
        Barbearia Gentlemen
      </p>
      <h1 className="text-xl font-semibold">Sem conexão</h1>
      <p className="max-w-xs text-sm text-muted-foreground">
        Você está offline no momento. Verifique sua internet e tente novamente.
      </p>
    </main>
  );
}
