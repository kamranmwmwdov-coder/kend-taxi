"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="az">
      <body>
        <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
          <p className="text-5xl font-bold text-danger mb-2">500</p>
          <h1 className="text-lg font-bold mb-2">Server xətası baş verdi</h1>
          <p className="text-ink-muted text-sm mb-6">
            Nəsə səhv getdi. Bir az sonra yenidən cəhd edin.
          </p>
          <button onClick={reset} className="btn-primary max-w-xs mx-auto">
            Yenidən cəhd et
          </button>
        </main>
      </body>
    </html>
  );
}
