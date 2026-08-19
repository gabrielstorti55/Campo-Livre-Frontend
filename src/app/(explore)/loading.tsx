export default function ExploreLoading() {
  return (
    <div
      className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4"
      role="status"
      aria-label="Carregando página"
    >
      <div className="fixed top-16 right-0 left-0 z-50 h-0.5 overflow-hidden bg-green-pale">
        <div className="h-full w-1/2 animate-pulse bg-green-mid motion-reduce:animate-none" />
      </div>
      <p className="text-sm text-muted-foreground">Carregando página...</p>
    </div>
  );
}
