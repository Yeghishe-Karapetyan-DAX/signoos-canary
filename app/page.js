export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-slate-500">
          Next.js starter
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
          Build your next idea here.
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
          This App Router template is ready for product work, with a clean
          layout, starter metadata, and global styles to grow from.
        </p>
      </div>
    </main>
  );
}
