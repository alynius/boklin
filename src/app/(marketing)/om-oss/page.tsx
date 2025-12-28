import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Target, Shield, Mail, ArrowRight } from "lucide-react";
import { Card, CardContent, LabelMono } from "@/components/ui";

export const metadata: Metadata = {
  title: "Om oss",
  description: "Boklin är ett svenskt bokningssystem byggt för frilansare och småföretag. Enkelt, pålitligt och tillgängligt - så att du kan fokusera på ditt företag.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <LabelMono className="mb-4 text-accent">Om Boklin</LabelMono>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-dark leading-tight mb-6">
          Bokningar ska vara enkelt
        </h1>
        <p className="text-xl text-text-dark/70 max-w-2xl mx-auto font-light leading-relaxed">
          Vi skapade Boklin för att ge svenska frilansare och småföretagare ett enkelt sätt att hantera sina bokningar utan krångel.
        </p>
      </section>

      {/* Story */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        <Card className="shadow-main">
          <CardContent className="p-8 md:p-12">
            <LabelMono className="mb-4 text-accent">Vår historia</LabelMono>
            <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-6">
              Varför vi byggde Boklin
            </h2>
            <div className="space-y-4 text-text-dark/70 leading-relaxed">
              <p>
                Som frilansare och småföretagare själva vet vi hur tidskrävande det kan vara att hantera bokningar. E-postkedjor, dubbelbokningar och missade möten var vardagsmat.
              </p>
              <p>
                Vi tittade på befintliga lösningar men de var antingen för komplicerade, för dyra, eller byggda för stora företag med egna IT-avdelningar. Vi behövde något enkelt, svenskt och prisvärt.
              </p>
              <p>
                Så vi byggde Boklin - ett bokningssystem som faktiskt är enkelt att använda, med svenskt gränssnitt och support, till ett pris som passar både frilansare och småföretag.
              </p>
              <p className="font-medium text-text-dark">
                Idag hjälper vi hundratals svenska frilansare och småföretag att spara tid och fokusera på det de gör bäst - att leverera till sina kunder.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center mb-12">
          <LabelMono className="mb-4 text-accent">Våra värderingar</LabelMono>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-dark mb-4">
            Vad vi står för
          </h2>
          <p className="text-lg text-text-dark/70 font-light max-w-2xl mx-auto">
            Dessa principer vägleder allt vi gör när vi bygger och förbättrar Boklin.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ValueCard
            icon={<Heart className="w-8 h-8" />}
            title="Enkelhet"
            description="Vi tror att mjukvara ska vara enkel att använda, inte kräva en manual. Varje funktion vi bygger testas av riktiga användare för att säkerställa att den är intuitiv."
          />
          <ValueCard
            icon={<Shield className="w-8 h-8" />}
            title="Pålitlighet"
            description="Dina bokningar är viktiga. Vi har byggt Boklin på stabil infrastruktur med automatiska backuper och 99.9% drifttid, så du kan lita på att systemet fungerar när du behöver det."
          />
          <ValueCard
            icon={<Target className="w-8 h-8" />}
            title="Tillgänglighet"
            description="Professionella verktyg ska inte bara vara till för stora företag. Vi håller priserna låga och erbjuder en generös gratisplan så att alla kan komma igång."
          />
        </div>
      </section>

      {/* Team/Mission */}
      <section className="bg-panel-slots py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <LabelMono className="mb-4 text-accent">Vårt uppdrag</LabelMono>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-dark mb-6">
              Byggt för svenska företagare
            </h2>
            <p className="text-lg text-text-dark/70 font-light leading-relaxed max-w-2xl mx-auto">
              Vi är ett svenskt team som förstår utmaningarna som frilansare och småföretagare möter varje dag. Vårt mål är att göra det enklare att driva företag i Sverige genom att ta bort det administrativa kaoset kring bokningar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-dark mb-3">Vårt mål</h3>
                <p className="text-text-dark/70 leading-relaxed">
                  Att bli Sveriges mest använda bokningssystem för frilansare och småföretag genom att alltid sätta enkelhet och användarvänlighet först.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-text-dark mb-3">Vårt löfte</h3>
                <p className="text-text-dark/70 leading-relaxed">
                  Vi lyssnar på våra användare och förbättrar ständigt Boklin baserat på verkliga behov. Din feedback driver vår produktutveckling.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <Card className="shadow-main">
          <CardContent className="p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center text-accent mx-auto mb-6">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-text-dark mb-4">
              Hör av dig
            </h2>
            <p className="text-lg text-text-dark/70 mb-6 font-light">
              Har du frågor, feedback eller bara vill säga hej? Vi älskar att höra från våra användare.
            </p>
            <div className="space-y-3">
              <p className="text-text-dark/80">
                Skicka ett e-postmeddelande till:{" "}
                <a
                  href="mailto:info@boklin.se"
                  className="text-accent hover:text-accent-hover font-semibold transition-smooth underline decoration-2 underline-offset-4"
                >
                  info@boklin.se
                </a>
              </p>
              <p className="text-sm text-text-dark/60 font-mono">
                Vi svarar normalt inom 24 timmar på vardagar
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="bg-panel-dark py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-light mb-6">
            Redo att förenkla dina bokningar?
          </h2>
          <p className="text-lg text-text-light/70 mb-8 font-light">
            Gå med tusentals svenska frilansare och småföretag som redan använder Boklin.
          </p>
          <Link
            href="/registrera"
            className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-text-light px-8 py-4 rounded-md text-base font-bold tracking-widest uppercase transition-smooth"
          >
            Kom igång gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardContent className="p-8">
        <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center text-accent mb-6">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-text-dark mb-3">{title}</h3>
        <p className="text-text-dark/70 font-light leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
