import { Metadata } from "next";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Logga in",
  description: "Logga in på ditt Boklin-konto för att hantera dina bokningar.",
};

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Logga in på Boklin</CardTitle>
        <CardDescription>
          Välj hur du vill logga in på ditt konto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignInForm />
        <p className="mt-6 text-center text-sm text-text-dark/60">
          Har du inget konto?{" "}
          <Link
            href="/registrera"
            className="font-medium text-accent hover:underline"
          >
            Registrera dig
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
