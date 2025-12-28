import Link from "next/link";
import { Calendar, Clock, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
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

      {/* Hero */}
      <main className="pt-24">
        <section className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="label-mono mb-4 text-accent">Bokningssystem för svenska företag</p>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-dark leading-tight mb-6">
            Enkel bokningshantering
            <br />
            <span className="text-accent">för dig</span>
          </h1>
          <p className="text-xl text-text-dark/70 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Boklin gör det enkelt för frilansare och småföretag att hantera
            bokningar. Dela din länk och låt kunderna boka tider som passar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/registrera"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-light px-8 py-4 rounded-md text-base font-bold tracking-widest uppercase transition-smooth"
            >
              Skapa konto gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/om-oss"
              className="inline-flex items-center justify-center gap-2 bg-panel-light hover:bg-hover-day text-text-dark px-8 py-4 rounded-md text-base font-medium border border-border-subtle transition-smooth"
            >
              Läs mer
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Calendar className="w-8 h-8" />}
              title="Kalendersynkronisering"
              description="Koppla ihop med Google Kalender eller Outlook för att automatiskt visa din tillgänglighet."
            />
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Flexibla mötestyper"
              description="Skapa olika typer av möten med varierande längd, plats och pris."
            />
            <FeatureCard
              icon={<Users className="w-8 h-8" />}
              title="Enkel för kunder"
              description="Dina kunder bokar enkelt via din personliga bokningslänk utan att behöva skapa konto."
            />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-panel-dark py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-light mb-6">
              Redo att förenkla din bokning?
            </h2>
            <p className="text-lg text-text-light/70 mb-8 font-light">
              Kom igång gratis idag. Ingen kreditkortsuppgift krävs.
            </p>
            <Link
              href="/registrera"
              className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-light px-8 py-4 rounded-md text-base font-bold tracking-widest uppercase transition-smooth"
            >
              Skapa ditt konto
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-panel-light p-8 rounded-lg shadow-card border border-border-subtle">
      <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-text-dark mb-3">{title}</h3>
      <p className="text-text-dark/70 font-light leading-relaxed">{description}</p>
    </div>
  );
}
