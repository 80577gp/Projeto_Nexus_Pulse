export default function DashboardLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-text_dark">
      <div className="koru-shell flex items-center gap-3 rounded-[1.6rem] px-6 py-4">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
        <span className="text-sm font-semibold">Carregando superficie RAIZ...</span>
      </div>
    </main>
  );
}
