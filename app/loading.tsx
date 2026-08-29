export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="flex min-h-dvh items-center justify-center px-6 py-16"
    >
      <p className="text-sm font-medium text-stone-600">Loading your workspace…</p>
    </main>
  );
}
