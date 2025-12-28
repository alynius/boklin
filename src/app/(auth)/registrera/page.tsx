import { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { SignInForm } from "../logga-in/sign-in-form";

export const metadata: Metadata = {
  title: "Registrera dig",
  description: "Skapa ett gratis Boklin-konto och börja ta emot bokningar idag.",
};

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skapa ett konto</CardTitle>
        <CardDescription>
          Kom igång gratis på några sekunder
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
        <p className="mt-6 text-center text-sm text-text-dark/60">
          Har du redan ett konto?{" "}
          <Link
            href="/logga-in"
            className="font-medium text-accent hover:underline"
          >
            Logga in
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-text-dark/40">
          Genom att registrera dig godkänner du våra{" "}
          <Link href="/villkor" className="underline hover:text-text-dark">
            användarvillkor
          </Link>{" "}
          och{" "}
          <Link href="/integritetspolicy" className="underline hover:text-text-dark">
            integritetspolicy
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
