import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-canvas/80 backdrop-blur-sm border-b border-border-subtle">
        <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-text-dark">
            Boklin
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/priser"
              className="text-sm font-medium text-text-dark/70 hover:text-text-dark transition-smooth"
            >
              Priser
            </Link>
            <Link
              href="/om-oss"
              className="text-sm font-medium text-text-dark/70 hover:text-text-dark transition-smooth"
            >
              Om oss
            </Link>
            <Link
              href="/logga-in"
              className="text-sm font-medium text-text-dark/70 hover:text-text-dark transition-smooth"
            >
              Logga in
            </Link>
            <Link
              href="/registrera"
              className="bg-accent hover:bg-accent-hover text-text-light px-5 py-2.5 rounded-md text-sm font-semibold tracking-wide uppercase transition-smooth"
            >
              Kom igång
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-panel-slots py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-2xl font-extrabold tracking-tight text-text-dark">
              Boklin
            </p>
            <div className="flex items-center gap-8">
              <Link
                href="/priser"
                className="text-sm text-text-dark/70 hover:text-text-dark transition-smooth"
              >
                Priser
              </Link>
              <Link
                href="/om-oss"
                className="text-sm text-text-dark/70 hover:text-text-dark transition-smooth"
              >
                Om oss
              </Link>
              <Link
                href="/integritetspolicy"
                className="text-sm text-text-dark/70 hover:text-text-dark transition-smooth"
              >
                Integritetspolicy
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border-subtle text-center">
            <p className="text-sm text-text-dark/50 font-mono">
              &copy; {new Date().getFullYear()} Boklin. Alla rättigheter förbehållna.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
