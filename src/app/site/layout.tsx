import Navigation from "@/components/site/navigation";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ClerkProvider appearance={{ baseTheme: dark }}>
        <Navigation />
        {children}
      </ClerkProvider>
    </main>
  );
}
