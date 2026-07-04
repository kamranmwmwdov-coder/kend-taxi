import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl font-bold text-primary mb-2">404</p>
      <h1 className="text-lg font-bold mb-2">Səhifə tapılmadı</h1>
      <p className="text-ink-muted text-sm mb-6">Axtardığınız səhifə mövcud deyil və ya silinib.</p>
      <Link href="/" className="btn-primary max-w-xs">Ana səhifəyə qayıt</Link>
    </main>
  );
}
