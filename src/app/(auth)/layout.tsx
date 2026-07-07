import Link from "next/link";
import { Rocket } from "lucide-react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-xl font-bold text-primary"
      >
        <Rocket className="size-6" aria-hidden />
        Propel
      </Link>
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 max-w-md text-center text-xs text-muted-foreground">
        By continuing you agree to our{" "}
        <Link href="/terms-of-service" className="underline hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
