import type { Metadata } from "next";
import Link from "next/link";
import { Check, Zap, Users, Building2, ArrowRight, HelpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, LabelMono } from "@/components/ui";

export const metadata: Metadata = {
  title: "Priser",
  description: "Enkla och transparenta priser för din bokningslösning. Kom igång gratis idag, uppgradera när du växer. Inga dolda avgifter eller bindningstid.",
};

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <LabelMono className="mb-4 text-accent">Transparenta priser</LabelMono>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-text-dark leading-tight mb-6">
          Enkla priser för alla
        </h1>
        <p className="text-xl text-text-dark/70 max-w-2xl mx-auto font-light leading-relaxed">
          Börja gratis och uppgradera när du är redo. Inga dolda avgifter, inga överraskningar.
        </p>
      </section>

      {/* Pricing Tiers */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-accent" />
                <LabelMono size="sm">Gratis</LabelMono>
              </div>
              <CardTitle className="text-3xl font-extrabold">0 kr</CardTitle>
              <p className="text-sm text-text-dark/60 font-mono">/månad</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-dark/70 mb-6">
                Perfekt för att komma igång och testa systemet.
              </p>
              <ul className="space-y-3">
                <PricingFeature>1 mötestyp</PricingFeature>
                <PricingFeature>Grundläggande bokningsformulär</PricingFeature>
                <PricingFeature>E-postbekräftelser</PricingFeature>
                <PricingFeature>Bokningslänk</PricingFeature>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/registrera" className="w-full">
                <Button variant="secondary" className="w-full">
                  Kom igång
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Tier - Recommended */}
          <Card className="relative border-2 border-accent shadow-main">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-accent text-text-light px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                Rekommenderas
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-accent" />
                <LabelMono size="sm">Pro</LabelMono>
              </div>
              <CardTitle className="text-3xl font-extrabold">149 kr</CardTitle>
              <p className="text-sm text-text-dark/60 font-mono">/månad</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-dark/70 mb-6">
                För frilansare och småföretagare som vill växa.
              </p>
              <ul className="space-y-3">
                <PricingFeature>Obegränsade mötestyper</PricingFeature>
                <PricingFeature>Google Kalender-synk</PricingFeature>
                <PricingFeature>Anpassad branding</PricingFeature>
                <PricingFeature>Påminnelser via e-post</PricingFeature>
                <PricingFeature>Prioriterad support</PricingFeature>
                <PricingFeature>Ingen Boklin-branding</PricingFeature>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/registrera" className="w-full">
                <Button variant="primary" className="w-full">
                  Välj Pro
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Enterprise Tier */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-accent" />
                <LabelMono size="sm">Företag</LabelMono>
              </div>
              <CardTitle className="text-3xl font-extrabold">449 kr</CardTitle>
              <p className="text-sm text-text-dark/60 font-mono">/månad</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-dark/70 mb-6">
                För team och större organisationer.
              </p>
              <ul className="space-y-3">
                <PricingFeature>Allt i Pro</PricingFeature>
                <PricingFeature>Team-funktioner</PricingFeature>
                <PricingFeature>API-åtkomst</PricingFeature>
                <PricingFeature>Dedikerad support</PricingFeature>
                <PricingFeature>Anpassade integrationer</PricingFeature>
                <PricingFeature>Avancerad rapportering</PricingFeature>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/registrera" className="w-full">
                <Button variant="secondary" className="w-full">
                  Välj Företag
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center mb-12">
          <LabelMono className="mb-4 text-accent">Vanliga frågor</LabelMono>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-dark mb-4">
            Har du frågor?
          </h2>
          <p className="text-lg text-text-dark/70 font-light">
            Här hittar du svar på de vanligaste frågorna om våra priser.
          </p>
        </div>

        <div className="space-y-6">
          <FAQItem
            question="Kan jag byta plan när som helst?"
            answer="Ja, du kan när som helst uppgradera eller nedgradera din plan. Ändringar träder i kraft omedelbart och vi justerar din faktura proportionellt."
          />
          <FAQItem
            question="Vad händer om jag överskrider gränserna för min plan?"
            answer="På gratisplanen får du en notifikation om att uppgradera när du når gränsen för antal mötestyper. På betalda planer finns inga gränser för bokningar eller användning."
          />
          <FAQItem
            question="Finns det någon bindningstid?"
            answer="Nej, alla våra planer är månatliga och kan sägas upp när som helst. Du betalar bara för den tid du använder tjänsten."
          />
          <FAQItem
            question="Vilka betalningsmetoder accepterar ni?"
            answer="Vi accepterar alla vanliga betalkort (Visa, Mastercard, American Express) samt Swish för svenska kunder. Fakturabetalning finns tillgänglig för Företag-planen."
          />
          <FAQItem
            question="Finns det några dolda avgifter?"
            answer="Nej, priset du ser är priset du betalar. Inga installationsavgifter, inga transaktionsavgifter, inga överraskningar."
          />
          <FAQItem
            question="Kan jag prova Pro-planen gratis?"
            answer="Ja, när du registrerar dig får du tillgång till alla Pro-funktioner gratis i 14 dagar. Inget betalkort krävs för att starta din prövotid."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-panel-dark py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-light mb-6">
            Kom igång gratis idag
          </h2>
          <p className="text-lg text-text-light/70 mb-8 font-light">
            Ingen kreditkortsuppgift krävs. Uppgradera när du är redo.
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
    </>
  );
}

function PricingFeature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
      <span className="text-sm text-text-dark/80">{children}</span>
    </li>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <CardTitle className="text-lg font-bold text-text-dark">
            {question}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-text-dark/70 leading-relaxed pl-8">
          {answer}
        </p>
      </CardContent>
    </Card>
  );
}
